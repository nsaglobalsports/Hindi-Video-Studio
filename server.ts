import express from 'express';
import type { Request, Response } from 'express';
import { execFile } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';
import { MsEdgeTTS, OUTPUT_FORMAT } from 'msedge-tts';
import {
  build3DSceneBackgroundSvg,
  buildAnimatedScreenTextAss,
  buildCaptionOverlaySvg,
} from './server/scene3dRenderer.ts';
import type { VoiceWordTiming } from './server/scene3dRenderer.ts';
import { generateTopicFacts } from './server/topicFacts.ts';
import { generateSceneVisualAsset } from './server/visualGenerator.ts';

const execFileAsync = promisify(execFile);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT || 3000);
const RENDERS_DIR = path.join(process.cwd(), '.renders');
const BRAND_HEADER_9_16 = path.join(process.cwd(), 'public', 'assets', 'aistudio', 'Header_ebc248d3.jpg');
const BRAND_FOOTER_9_16 = path.join(process.cwd(), 'public', 'assets', 'aistudio', 'Footer_66d0a2aa.jpg');
fs.mkdirSync(RENDERS_DIR, { recursive: true });

interface RenderJob {
  jobId: string;
  status: 'queued' | 'rendering' | 'completed' | 'failed';
  progress: number;
  stage: string;
  mp4Url: string | null;
  audioActive: boolean;
  error: string | null;
  createdAt: number;
}

interface IncomingSceneInput {
  visualPrompt?: string;
  voiceScript?: string;
  screenText?: string;
}

interface RenderRequestBody {
  topicPrompt?: string;
  formatId?: string;
  aspectRatio?: string;
  videoType?: string;
  style?: string;
  voiceId?: string;
  scriptAiProvider?: string;
  sceneCount?: number;
  sceneScripts?: string[];
  scenes?: IncomingSceneInput[];
}

const jobs = new Map<string, RenderJob>();
let ffmpegVersionCache: string | null = null;

async function detectFfmpeg(): Promise<string | null> {
  if (ffmpegVersionCache) return ffmpegVersionCache;
  try {
    const { stdout } = await execFileAsync('ffmpeg', ['-version']);
    const firstLine = stdout.split('\n')[0]?.trim() || 'ffmpeg available';
    ffmpegVersionCache = firstLine;
    return firstLine;
  } catch {
    return null;
  }
}

function escapeXmlForSsml(input: string): string {
  return input
    .replace(/&/g, ' और ')
    .replace(/[<>]/g, ' ')
    .replace(/["']/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function getEdgeVoiceConfig(voiceId: string): {
  voiceName: string;
  label: string;
  pitch?: string;
  rate?: string;
} {
  switch (voiceId) {
    case 'hi_madhur_m':
      return { voiceName: 'hi-IN-MadhurNeural', label: 'Madhur (Male)' };
    case 'hi_ananya_f':
      return {
        voiceName: 'hi-IN-SwaraNeural',
        label: 'Ananya (Female)',
        pitch: '+4Hz',
        rate: '+6%',
      };
    case 'hi_aarav_m':
      return {
        voiceName: 'hi-IN-MadhurNeural',
        label: 'Aarav (Male)',
        pitch: '-4Hz',
        rate: '-4%',
      };
    case 'hi_swara_f':
    default:
      return { voiceName: 'hi-IN-SwaraNeural', label: 'Swara (Female)' };
  }
}

function parseEdgeWordBoundaries(rawChunks: string[]): VoiceWordTiming[] {
  const timings: VoiceWordTiming[] = [];
  for (const chunk of rawChunks) {
    try {
      const parsed = JSON.parse(chunk) as {
        Metadata?: Array<{
          Type?: string;
          Data?: {
            Offset?: number;
            Duration?: number;
            text?: { Text?: string };
          };
        }>;
      };
      for (const item of parsed?.Metadata ?? []) {
        if (item?.Type === 'WordBoundary' && typeof item?.Data?.Offset === 'number') {
          timings.push({
            offsetMs: Math.round(item.Data.Offset / 10000),
            durationMs: Math.max(80, Math.round((item.Data.Duration ?? 2000000) / 10000)),
            text: item.Data.text?.Text ?? '',
          });
        }
      }
    } catch {
      // Ignore partial metadata frames safely
    }
  }
  return timings.sort((a, b) => a.offsetMs - b.offsetMs);
}

async function runEdgeTtsAttempt(
  safeText: string,
  voiceName: string,
  prosody: { pitch?: string; rate?: string },
  outputMp3Path: string
): Promise<{ ok: boolean; wordTimings: VoiceWordTiming[] }> {
  const tts = new MsEdgeTTS();
  try {
    await tts.setMetadata(
      voiceName,
      OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3,
      { wordBoundaryEnabled: true }
    );
    const { audioStream, metadataStream } = tts.toStream(safeText, prosody);
    const chunks: Buffer[] = [];
    const metaChunks: string[] = [];
    if (metadataStream) {
      metadataStream.on('data', (chunk: Buffer) => {
        metaChunks.push(chunk.toString('utf8'));
      });
    }
    await new Promise<void>((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error('EdgeTTS timeout')), 14000);
      audioStream.on('data', (chunk: Buffer) => chunks.push(chunk));
      audioStream.on('end', () => {
        clearTimeout(timer);
        resolve();
      });
      audioStream.on('error', (err: Error) => {
        clearTimeout(timer);
        reject(err);
      });
    });

    const audioBuffer = Buffer.concat(chunks);
    if (audioBuffer.length > 400) {
      fs.writeFileSync(outputMp3Path, audioBuffer);
      return { ok: true, wordTimings: parseEdgeWordBoundaries(metaChunks) };
    }
    return { ok: false, wordTimings: [] };
  } catch (err) {
    console.warn(`EdgeTTS (${voiceName}) failed:`, err instanceof Error ? err.message : err);
    return { ok: false, wordTimings: [] };
  } finally {
    try {
      tts.close();
    } catch {
      // ignore close errors
    }
  }
}

async function synthesizeHindiSpeechMp3(
  rawText: string,
  voiceId: string,
  outputMp3Path: string
): Promise<{ ok: boolean; wordTimings: VoiceWordTiming[] }> {
  const safeText = escapeXmlForSsml(rawText).slice(0, 750);
  if (!safeText) return { ok: false, wordTimings: [] };

  const voiceCfg = getEdgeVoiceConfig(voiceId);
  const prosody: { pitch?: string; rate?: string } = {};
  if (voiceCfg.pitch) prosody.pitch = voiceCfg.pitch;
  if (voiceCfg.rate) prosody.rate = voiceCfg.rate;

  // Attempt 1: Requested Edge Neural Hindi voice with real WordBoundary metadata
  const primary = await runEdgeTtsAttempt(safeText, voiceCfg.voiceName, prosody, outputMp3Path);
  if (primary.ok) {
    return primary;
  }

  // Attempt 2: Retry plain SwaraNeural without prosody modifiers
  const secondary = await runEdgeTtsAttempt(safeText, 'hi-IN-SwaraNeural', {}, outputMp3Path);
  if (secondary.ok) {
    return secondary;
  }

  // Attempt 3: Chunked free Google Translate TTS endpoint (hi) with browser headers
  try {
    const words = safeText.split(/\s+/);
    const textChunks: string[] = [];
    let current = '';
    for (const w of words) {
      const next = current ? `${current} ${w}` : w;
      if (next.length > 165) {
        if (current) textChunks.push(current);
        current = w;
      } else {
        current = next;
      }
    }
    if (current) textChunks.push(current);

    const mp3Buffers: Buffer[] = [];
    for (const chunkText of textChunks.slice(0, 5)) {
      const url = `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=hi&q=${encodeURIComponent(
        chunkText
      )}`;
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 Chrome/124.0 Mobile Safari/537.36',
          Referer: 'https://translate.google.com/',
        },
      });
      if (res.ok) {
        const buf = Buffer.from(await res.arrayBuffer());
        if (buf.length > 400) mp3Buffers.push(buf);
      }
    }

    if (mp3Buffers.length > 0) {
      fs.writeFileSync(outputMp3Path, Buffer.concat(mp3Buffers));
      return { ok: true, wordTimings: [] };
    }
  } catch (err) {
    console.warn('Google TTS fallback failed:', err instanceof Error ? err.message : err);
  }

  return { ok: false, wordTimings: [] };
}

async function probeAudioDurationSec(audioPath: string): Promise<number> {
  try {
    const { stdout } = await execFileAsync('ffprobe', [
      '-v',
      'error',
      '-show_entries',
      'format=duration',
      '-of',
      'default=noprint_wrappers=1:nokey=1',
      audioPath,
    ]);
    const parsed = Number.parseFloat(stdout.trim());
    if (Number.isFinite(parsed) && parsed > 0.4) {
      return parsed;
    }
  } catch {
    // ignore ffprobe fallback
  }
  return 3.5;
}

async function processRenderJob(
  jobId: string,
  payload: {
    formatId: string;
    videoType: string;
    style: string;
    voiceId: string;
    scenes: Array<{ visualPrompt: string; voiceScript: string; screenText: string }>;
  }
): Promise<void> {
  const job = jobs.get(jobId);
  if (!job) return;

  const jobDir = path.join(RENDERS_DIR, `work_${jobId}`);
  fs.mkdirSync(jobDir, { recursive: true });

  const isVertical = payload.formatId === 'shorts_9_16';
  const isSquare = payload.formatId === 'square_1_1';
  const outW = isVertical ? 1080 : isSquare ? 1080 : 1920;
  const outH = isVertical ? 1920 : isSquare ? 1080 : 1080;
  const useLocked916Brand =
    isVertical && fs.existsSync(BRAND_HEADER_9_16) && fs.existsSync(BRAND_FOOTER_9_16);
  const headerH = useLocked916Brand ? 200 : 0;
  const footerH = useLocked916Brand ? 196 : 0;
  const midW = outW;
  const midH = outH - headerH - footerH;
  const bgW = Math.round(midW * 1.1);
  const bgH = Math.round(midH * 1.1);

  const activeScenes = payload.scenes;
  const totalScenes = activeScenes.length;
  let anySpeechAudio = false;

  try {
    job.status = 'rendering';
    job.progress = 8;
    job.stage = `Generating AI visuals from your Visual Prompts (${payload.videoType}) & Hindi voiceover...`;

    let completedPrep = 0;
    const preparedScenes = await Promise.all(
      activeScenes.map(async (sceneItem, idx) => {
        const sceneNum = idx + 1;
        const voiceScript = sceneItem.voiceScript.trim();
        const screenText = sceneItem.screenText.trim();
        const visualPrompt = sceneItem.visualPrompt.trim() || voiceScript || screenText;
        const audioMp3Path = path.join(jobDir, `scene_${sceneNum}.mp3`);

        const [visualAsset, ttsResult] = await Promise.all([
          generateSceneVisualAsset({
            sceneNumber: sceneNum,
            visualPrompt,
            voiceScript: voiceScript || screenText,
            videoType: payload.videoType,
            style: payload.style,
            isVertical,
            bgW,
            bgH,
            jobDir,
            staggerMs: idx * 900,
          }),
          voiceScript.length > 0
            ? synthesizeHindiSpeechMp3(voiceScript, payload.voiceId, audioMp3Path)
            : Promise.resolve({ ok: false, wordTimings: [] as VoiceWordTiming[] }),
        ]);

        if (voiceScript.length > 0 && !ttsResult.ok) {
          throw new Error(`Hindi TTS failed on scene ${sceneNum}. Please retry.`);
        }

        completedPrep += 1;
        job.progress = Math.min(55, 10 + Math.round((completedPrep / totalScenes) * 45));
        job.stage = `Generated scene ${completedPrep}/${totalScenes} visual (${
          visualAsset?.source === 'ai_horde'
            ? 'AI Prompt Visual'
            : visualAsset?.source === 'wikimedia'
            ? 'Topic Photo Visual'
            : '3D Graphics Visual'
        }) & Hindi voiceover...`;

        return {
          sceneNum,
          voiceScript,
          screenText,
          visualPrompt,
          audioMp3Path,
          hasSpeechAudio: ttsResult.ok,
          wordTimings: ttsResult.wordTimings,
          visualAsset,
        };
      })
    );

    const clipPaths: string[] = [];

    for (const prep of preparedScenes) {
      const i = prep.sceneNum;
      if (prep.hasSpeechAudio) {
        anySpeechAudio = true;
      }

      let sceneDurationSec = isVertical ? 4.0 : 4.5;
      if (prep.hasSpeechAudio) {
        const audioDur = await probeAudioDurationSec(prep.audioMp3Path);
        sceneDurationSec = Math.max(3.0, Math.ceil((audioDur + 0.45) * 10) / 10);
      }
      const fps = 20;
      const totalFrames = Math.max(40, Math.round(sceneDurationSec * fps));

      const overlaySvg = buildCaptionOverlaySvg({
        width: outW,
        height: outH,
        isVertical,
        screenText: prep.screenText,
        voiceScript: prep.voiceScript,
      });

      const assContent = buildAnimatedScreenTextAss({
        width: outW,
        height: outH,
        isVertical,
        screenText: prep.screenText,
        voiceScript: prep.voiceScript,
        sceneDurationSec,
        wordTimings: prep.wordTimings,
      });

      const overlaySvgPath = path.join(jobDir, `ov_${i}.svg`);
      const assPath = path.join(jobDir, `sub_${i}.ass`);
      const clipPath = path.join(jobDir, `scene_${i}.mp4`);
      fs.writeFileSync(overlaySvgPath, overlaySvg, 'utf8');
      if (assContent) {
        fs.writeFileSync(assPath, assContent, 'utf8');
      }

      let bgInputArgs: string[];
      if (prep.visualAsset && fs.existsSync(prep.visualAsset.filePath)) {
        bgInputArgs = ['-i', prep.visualAsset.filePath];
      } else {
        const bgSvg = build3DSceneBackgroundSvg({
          width: bgW,
          height: bgH,
          visualPrompt: prep.visualPrompt,
          voiceScript: prep.voiceScript || prep.screenText,
          style: payload.style,
          videoType: payload.videoType,
          sceneNumber: i,
        });
        const bgSvgPath = path.join(jobDir, `bg_${i}.svg`);
        fs.writeFileSync(bgSvgPath, bgSvg, 'utf8');
        bgInputArgs = ['-f', 'svg_pipe', '-i', bgSvgPath];
      }

      const zoomExpr =
        payload.videoType === '2_5d_parallax'
          ? i % 2 === 1
            ? `min(zoom+0.0018,1.10)`
            : `if(eq(on,1),1.09,max(zoom-0.0016,1.01))`
          : i % 2 === 1
          ? `min(zoom+0.0013,1.09)`
          : `if(eq(on,1),1.08,max(zoom-0.0011,1.01))`;
      const panXExpr =
        payload.videoType === '2_5d_parallax' || i % 3 === 0
          ? `iw/2-(iw/zoom/2)+on*0.35`
          : `iw/2-(iw/zoom/2)`;

      job.stage = `Encoding scene ${i} of ${totalScenes} (${payload.videoType}) with animated text & audio...`;

      const audioFilter = prep.hasSpeechAudio
        ? `[2:a]aresample=44100,aformat=channel_layouts=stereo,highpass=f=75,silenceremove=start_periods=1:start_threshold=-55dB:detection=peak,volume=2.8,alimiter=limit=0.95,apad,atrim=0:${sceneDurationSec}[a]`
        : `[2:a]aresample=44100,aformat=channel_layouts=stereo,atrim=0:${sceneDurationSec}[a]`;

      const assStep = assContent ? `,ass='${assPath.replace(/'/g, "\\'")}'` : '';
      const fullVideoFilter = useLocked916Brand
        ? `[0:v]zoompan=z='${zoomExpr}':d=${totalFrames}:x='${panXExpr}':y='ih/2-(ih/zoom/2)':s=${midW}x${midH}:fps=${fps}[vis];[vis]pad=${outW}:${outH}:0:${headerH}:0x060913[canvas];[canvas][1:v]overlay=0:0:shortest=1${assStep}[mid];[3:v]crop=iw:ih-4:0:2,scale=${outW}:${headerH}[hdr];[4:v]crop=iw:ih-4:0:2,scale=${outW}:${footerH}[ftr];[mid][hdr]overlay=0:0[withHdr];[withHdr][ftr]overlay=0:${outH - footerH},format=yuv420p[v]`
        : `[0:v]zoompan=z='${zoomExpr}':d=${totalFrames}:x='${panXExpr}':y='ih/2-(ih/zoom/2)':s=${midW}x${midH}:fps=${fps}[bg];[bg][1:v]overlay=0:0:shortest=1${assStep},format=yuv420p[v]`;

      const ffmpegArgs = [
        '-y',
        '-loglevel',
        'error',
        ...bgInputArgs,
        '-f',
        'svg_pipe',
        '-loop',
        '1',
        '-t',
        String(sceneDurationSec),
        '-i',
        overlaySvgPath,
        ...(prep.hasSpeechAudio
          ? ['-i', prep.audioMp3Path]
          : [
              '-f',
              'lavfi',
              '-t',
              String(sceneDurationSec),
              '-i',
              'anullsrc=channel_layout=stereo:sample_rate=44100',
            ]),
        ...(useLocked916Brand ? ['-i', BRAND_HEADER_9_16, '-i', BRAND_FOOTER_9_16] : []),
        '-filter_complex',
        `${fullVideoFilter};${audioFilter}`,
        '-map',
        '[v]',
        '-map',
        '[a]',
        '-t',
        String(sceneDurationSec),
        '-threads',
        '0',
        '-r',
        String(fps),
        '-c:v',
        'libx264',
        '-profile:v',
        'baseline',
        '-level',
        '3.1',
        '-pix_fmt',
        'yuv420p',
        '-preset',
        'ultrafast',
        '-c:a',
        'aac',
        '-b:a',
        '128k',
        '-ar',
        '44100',
        '-ac',
        '2',
        clipPath,
      ];

      await execFileAsync('ffmpeg', ffmpegArgs, {
        maxBuffer: 20 * 1024 * 1024,
      });

      clipPaths.push(clipPath);
      job.progress = Math.min(90, 56 + Math.round((i / totalScenes) * 34));
    }

    job.stage = 'Encoding universal MP4 (H.264 + AAC Stereo)...';
    job.progress = 93;

    const finalOutputPath = path.join(RENDERS_DIR, `${jobId}.mp4`);

    const concatInputs: string[] = [];
    const filterSegments: string[] = [];
    clipPaths.forEach((clipPath, idx) => {
      concatInputs.push('-i', clipPath);
      filterSegments.push(`[${idx}:v][${idx}:a]`);
    });
    const concatFilter = `${filterSegments.join('')}concat=n=${clipPaths.length}:v=1:a=1[v][a]`;

    await execFileAsync(
      'ffmpeg',
      [
        '-y',
        '-loglevel',
        'error',
        ...concatInputs,
        '-filter_complex',
        concatFilter,
        '-map',
        '[v]',
        '-map',
        '[a]',
        '-threads',
        '0',
        '-c:v',
        'libx264',
        '-profile:v',
        'baseline',
        '-level',
        '3.1',
        '-pix_fmt',
        'yuv420p',
        '-preset',
        'ultrafast',
        '-c:a',
        'aac',
        '-b:a',
        '128k',
        '-ar',
        '44100',
        '-ac',
        '2',
        '-movflags',
        '+faststart',
        finalOutputPath,
      ],
      { maxBuffer: 20 * 1024 * 1024 }
    );

    fs.rmSync(jobDir, { recursive: true, force: true });

    job.status = 'completed';
    job.progress = 100;
    job.audioActive = anySpeechAudio;
    job.stage = anySpeechAudio
      ? 'MP4 with Hindi voiceover ready for preview & download'
      : 'MP4 rendered (visual-only scenes had no voiceover text)';
    job.mp4Url = `/api/renders/${jobId}.mp4`;
  } catch (err) {
    fs.rmSync(jobDir, { recursive: true, force: true });
    job.status = 'failed';
    job.stage = 'FFmpeg render failed';
    job.error = err instanceof Error ? err.message : 'Unknown FFmpeg error';
  }
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '2mb' }));

  app.use((_req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (_req.method === 'OPTIONS') {
      res.status(204).end();
      return;
    }
    next();
  });

  const handleHealth = async (_req: Request, res: Response) => {
    const ffmpegInfo = await detectFfmpeg();
    if (!ffmpegInfo) {
      res.status(503).json({
        online: false,
        status: 'unavailable',
        detail: 'FFmpeg binary not found on host',
      });
      return;
    }
    res.json({
      online: true,
      status: 'ok',
      engine: ffmpegInfo,
      tts: 'Edge Neural Hindi TTS (Swara / Madhur)',
      fonts: ['Noto Sans Devanagari', 'DejaVu Sans'],
      capabilities: ['mp4_render_3d', 'hindi_voiceover', 'topic_auto_facts', 'gemini_ai_scene_generation'],
    });
  };

  // ================= AUTO UPDATE API =================

  const GITHUB_RELEASE_API =
    'https://api.github.com/repos/nsaglobalsports/Hindi-Video-Studio/releases/latest';

  function getGitHubHeaders(accept = 'application/vnd.github+json') {
    const token = process.env.GITHUB_TOKEN;

    return {
      Accept: accept,
      'User-Agent': 'Hindi-Video-Studio',
      'X-GitHub-Api-Version': '2022-11-28',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }

  async function getLatestGitHubRelease() {
    if (!process.env.GITHUB_TOKEN) {
      throw new Error('GITHUB_TOKEN is not configured in Render Environment.');
    }

    const response = await fetch(GITHUB_RELEASE_API, {
      headers: getGitHubHeaders(),
    });

    if (!response.ok) {
      const details = await response.text().catch(() => '');
      console.error(
        `GitHub latest release request failed: HTTP ${response.status}`,
        details.slice(0, 500)
      );
      throw new Error(`GitHub release request failed with HTTP ${response.status}`);
    }

    return await response.json() as any;
  }

  function compareVersions(currentVersion: string, latestVersion: string): number {
    const toNumbers = (version: string) =>
      version.replace(/^v/i, '').split('.').map(part => Number(part) || 0);

    const current = toNumbers(currentVersion);
    const latest = toNumbers(latestVersion);

    for (let i = 0; i < Math.max(current.length, latest.length); i++) {
      const currentPart = current[i] || 0;
      const latestPart = latest[i] || 0;

      if (latestPart > currentPart) return 1;
      if (latestPart < currentPart) return -1;
    }

    return 0;
  }

  app.get('/api/app-update', async (req: Request, res: Response) => {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    try {
      const currentVersion = String(req.query.version || '1.0.0').trim();
      const release = await getLatestGitHubRelease();

      const apk = release.assets?.find((asset: any) =>
        typeof asset.name === 'string' &&
        asset.name.toLowerCase().endsWith('.apk')
      );

      if (!apk) {
        res.status(404).json({
          success: false,
          message: 'No APK available in the latest published release.',
        });
        return;
      }

      const latestVersion = String(release.tag_name || '').replace(/^v/i, '');

      if (!latestVersion) {
        res.status(502).json({
          success: false,
          message: 'Latest release does not have a valid version tag.',
        });
        return;
      }

      res.json({
        success: true,
        updateAvailable: compareVersions(currentVersion, latestVersion) > 0,
        currentVersion,
        latestVersion,
        versionName: latestVersion,
        // Private GitHub APKs must be downloaded through this backend proxy.
        downloadUrl: 'https://hindi-video-studio.onrender.com/api/app-update/download',
        releaseNotes: release.body || '',
        releaseDate: release.published_at || null,
      });
    } catch (error) {
      console.error('App update check failed:', error);
      res.status(503).json({
        success: false,
        message: 'Update information is currently unavailable.',
      });
    }
  });

  app.get('/api/app-update/download', async (_req: Request, res: Response) => {
    try {
      const release = await getLatestGitHubRelease();

      const apk = release.assets?.find((asset: any) =>
        typeof asset.name === 'string' &&
        asset.name.toLowerCase().endsWith('.apk')
      );

      if (!apk || !apk.url) {
        res.status(404).send('APK not found in the latest published release.');
        return;
      }

      // GitHub's asset API may redirect to a temporary download URL.
      const apkResponse = await fetch(String(apk.url), {
        headers: getGitHubHeaders('application/octet-stream'),
        redirect: 'follow',
      });

      if (!apkResponse.ok || !apkResponse.body) {
        const details = await apkResponse.text().catch(() => '');
        console.error(
          `GitHub APK download failed: HTTP ${apkResponse.status}`,
          details.slice(0, 500)
        );
        res.status(502).send('Unable to download the APK from GitHub.');
        return;
      }

      res.status(200);
      res.setHeader('Content-Type', 'application/vnd.android.package-archive');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="${String(apk.name).replace(/["\\\r\n]/g, '_')}"`
      );

      const contentLength = apkResponse.headers.get('content-length');
      if (contentLength) {
        res.setHeader('Content-Length', contentLength);
      }

      // Stream the APK to avoid buffering the entire file in server memory.
      const { Readable } = await import('node:stream');
      Readable.fromWeb(apkResponse.body as any).pipe(res);
    } catch (error) {
      console.error('APK download route failed:', error);
      if (!res.headersSent) {
        res.status(503).send('APK download is currently unavailable.');
      } else {
        res.end();
      }
    }
  });

// ===================================================
  app.get('/health', handleHealth);
  app.get('/api/health', handleHealth);

  app.post('/api/ai-scenes', async (req: Request, res: Response) => {
    const body = (req.body || {}) as { mode?: string; input?: string; sceneCount?: number; style?: string; videoType?: string };
    const input = typeof body.input === 'string' ? body.input.trim() : '';
    const mode = body.mode === 'script' ? 'script' : 'topic';
    const sceneCount = Math.min(12, Math.max(3, Number(body.sceneCount || 5)));
    if (!input) { res.status(400).json({ error: 'कृपया विषय या स्क्रिप्ट लिखें।' }); return; }
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) { res.status(503).json({ error: 'AI Scene Generator चालू करने के लिए Render में GEMINI_API_KEY सेट करें।' }); return; }
    const prompt = `आप एक अनुभवी हिंदी वीडियो स्क्रिप्ट राइटर और स्टोरीबोर्ड डायरेक्टर हैं। ${mode === 'topic' ? 'दिए गए विषय पर तथ्यात्मक, रोचक हिंदी वीडियो स्क्रिप्ट बनाएं।' : 'दी गई स्क्रिप्ट का अर्थ और तथ्य बदले बिना उसे दृश्यों में बाँटें।'} कुल ${sceneCount} दृश्य बनाएं। शैली: ${body.style || 'Educational / Explainer'}; दृश्य शैली: ${body.videoType || '3D Realistic Graphics Motion'}। प्रत्येक दृश्य के लिए स्वाभाविक बोलचाल की हिंदी voiceScript (लगभग 12-25 शब्द), स्क्रीन पर दिखने वाला छोटा और प्रभावी screenText (2-7 शब्द), तथा विषय से बिल्कुल मेल खाता विस्तृत English visualPrompt लिखें। Visual prompt में दृश्य, विषय, कैमरा, रोशनी, composition बताएं; image में कोई लिखावट/टेक्स्ट न बनवाएं। तथ्यों को न गढ़ें; अनिश्चित जानकारी को दावा न बनाएं। केवल वैध JSON लौटाएं: {"scenes":[{"visualPrompt":"...","voiceScript":"...","screenText":"..."}]}\n\n${mode === 'topic' ? 'विषय: ' : 'मूल स्क्रिप्ट: '}${input}`;
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${encodeURIComponent(apiKey)}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { responseMimeType: 'application/json', temperature: 0.65 } }),
      });
      const payload = await response.json() as any;
      if (!response.ok) throw new Error(payload?.error?.message || `Gemini API HTTP ${response.status}`);
      const raw = payload?.candidates?.[0]?.content?.parts?.map((p: any) => p.text || '').join('') || '';
      const parsed = JSON.parse(raw.replace(/^```json\s*/i, '').replace(/```\s*$/, ''));
      const scenes = Array.isArray(parsed.scenes) ? parsed.scenes.slice(0, sceneCount).map((scene: any) => ({
        visualPrompt: String(scene.visualPrompt || '').trim(),
        voiceScript: String(scene.voiceScript || '').trim(),
        screenText: String(scene.screenText || '').trim(),
      })).filter((scene: any) => scene.visualPrompt || scene.voiceScript) : [];
      if (scenes.length < 2) throw new Error('AI ने पर्याप्त दृश्य नहीं बनाए। फिर से प्रयास करें।');
      res.json({ scenes, model: 'gemini-2.5-flash' });
    } catch (error) {
      res.status(502).json({ error: error instanceof Error ? error.message : 'AI scene generation failed' });
    }
  });

  app.post('/api/topic-facts', async (req: Request, res: Response) => {
    const body = (req.body || {}) as {
      topic?: string;
      sceneCount?: number;
      style?: string;
    };
    const topic = typeof body.topic === 'string' ? body.topic.trim() : '';
    if (!topic) {
      res.status(400).json({ error: 'topic is required' });
      return;
    }

    const sceneCount = Math.min(8, Math.max(3, Number(body.sceneCount || 5)));
    const style = typeof body.style === 'string' ? body.style : 'Educational / Explainer';
    const result = await generateTopicFacts(topic, sceneCount, style);
    res.json(result);
  });

  app.post('/api/tts-preview', async (req: Request, res: Response) => {
    const body = (req.body || {}) as { text?: string; voiceId?: string };
    const text = typeof body.text === 'string' ? body.text.trim() : '';
    const voiceId = typeof body.voiceId === 'string' ? body.voiceId : 'hi_swara_f';
    if (!text) {
      res.status(400).json({ error: 'text is required' });
      return;
    }

    const tmpPath = path.join(
      RENDERS_DIR,
      `tts_prev_${Date.now()}_${Math.random().toString(36).slice(2, 6)}.mp3`
    );
    try {
      const ttsPrev = await synthesizeHindiSpeechMp3(text, voiceId, tmpPath);
      if (!ttsPrev.ok || !fs.existsSync(tmpPath)) {
        res.status(502).json({ error: 'Unable to synthesize Hindi voice preview' });
        return;
      }
      const mp3Buf = fs.readFileSync(tmpPath);
      res.setHeader('Content-Type', 'audio/mpeg');
      res.setHeader('Content-Length', String(mp3Buf.length));
      res.send(mp3Buf);
    } finally {
      if (fs.existsSync(tmpPath)) {
        fs.unlinkSync(tmpPath);
      }
    }
  });

  app.post('/api/render', async (req: Request, res: Response) => {
    const ffmpegInfo = await detectFfmpeg();
    if (!ffmpegInfo) {
      res.status(503).json({ error: 'FFmpeg is unavailable on this Render Node' });
      return;
    }

    const body = (req.body || {}) as RenderRequestBody;
    let normalizedScenes: Array<{ visualPrompt: string; voiceScript: string; screenText: string }> =
      [];

    if (Array.isArray(body.scenes) && body.scenes.length > 0) {
      normalizedScenes = body.scenes
        .map((s) => ({
          visualPrompt: typeof s?.visualPrompt === 'string' ? s.visualPrompt.trim() : '',
          voiceScript: typeof s?.voiceScript === 'string' ? s.voiceScript.trim() : '',
          screenText: typeof s?.screenText === 'string' ? s.screenText.trim() : '',
        }))
        .filter(
          (s) => s.visualPrompt.length > 0 || s.voiceScript.length > 0 || s.screenText.length > 0
        )
        .slice(0, 30);
    } else if (Array.isArray(body.sceneScripts) && body.sceneScripts.length > 0) {
      normalizedScenes = body.sceneScripts
        .map((s) => (typeof s === 'string' ? s.trim() : ''))
        .filter((s) => s.length > 0)
        .slice(0, 30)
        .map((text) => ({ visualPrompt: text, voiceScript: text, screenText: text }));
    } else if (typeof body.topicPrompt === 'string' && body.topicPrompt.trim().length > 0) {
      const t = body.topicPrompt.trim();
      normalizedScenes = [{ visualPrompt: t, voiceScript: t, screenText: t }];
    }

    if (normalizedScenes.length === 0) {
      res.status(400).json({
        error: 'Fill at least one scene with a Visual Prompt, Voice-Over Script, or On-Screen Text',
      });
      return;
    }

    const formatId = body.formatId === 'youtube_16_9' ? 'youtube_16_9' : body.formatId === 'square_1_1' ? 'square_1_1' : 'shorts_9_16';
    const videoType = typeof body.videoType === 'string' ? body.videoType : '3d_realistic';

    const jobId = `hvs_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const job: RenderJob = {
      jobId,
      status: 'queued',
      progress: 5,
      stage: `Queued ${normalizedScenes.length} scene(s) on Render Node`,
      mp4Url: null,
      audioActive: false,
      error: null,
      createdAt: Date.now(),
    };
    jobs.set(jobId, job);

    void processRenderJob(jobId, {
      formatId,
      videoType,
      style: typeof body.style === 'string' ? body.style : 'Educational / Explainer',
      voiceId: typeof body.voiceId === 'string' ? body.voiceId : 'hi_swara_f',
      scenes: normalizedScenes,
    });

    res.status(202).json(job);
  });

  app.get('/api/jobs/:jobId', (req: Request, res: Response) => {
    const jobId = String(req.params.jobId || '');
    const job = jobs.get(jobId);
    if (!job) {
      res.status(404).json({ error: 'Render job not found' });
      return;
    }
    res.json(job);
  });

  app.get('/api/renders/:filename', (req: Request, res: Response) => {
    const rawName = String(req.params.filename || '');
    const safeName = path.basename(rawName);
    if (!safeName.endsWith('.mp4')) {
      res.status(400).json({ error: 'Invalid render file' });
      return;
    }
    const targetPath = path.join(RENDERS_DIR, safeName);
    if (!fs.existsSync(targetPath)) {
      res.status(404).json({ error: 'Rendered MP4 not found' });
      return;
    }
    res.setHeader('Content-Type', 'video/mp4');
    res.setHeader('Accept-Ranges', 'bytes');
    if (req.query.download === '1') {
      res.setHeader('Content-Disposition', `attachment; filename="${safeName}"`);
    }
    res.sendFile(targetPath);
  });

  if (process.env.NODE_ENV === 'production') {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Hindi Video Studio Render Node & App listening on http://0.0.0.0:${PORT}`);
  });
}

void startServer();
