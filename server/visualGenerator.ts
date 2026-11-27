import { execFile } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { promisify } from 'node:util';
import type { VideoTypeId } from './scene3dRenderer.ts';

const execFileAsync = promisify(execFile);

export interface SceneVisualAsset {
  kind: 'raster' | 'svg';
  filePath: string;
  source: 'ai_horde' | 'wikimedia' | 'procedural_3d';
  englishPrompt: string;
}

const SLEEP = (ms: number) => new Promise((r) => setTimeout(r, ms));

const BLOCKED_HORDE_KEYWORDS = [
  'nsfw',
  'hentai',
  'porn',
  'ponyxl',
  'furry',
  'nude',
  'xxx',
  'erotic',
];

const SAFE_3D_MODELS = [
  'ICBINP - I Can\'t Believe It\'s Not Photography',
  'AbsoluteReality',
  'Deliberate',
  'majicMIX realistic',
  'Juggernaut XL',
  'AlbedoBase XL (SDXL)',
  'Realistic Vision',
  'EpicRealism',
  'CyberRealistic',
  'Photon',
  'Analog Madness',
  'DreamShaper',
  'Dreamshaper',
  'stable_diffusion',
];

const SAFE_CARTOON_MODELS = [
  'Counterfeit',
  'Abyss OrangeMix',
  'Nova Anime XL',
  'Anime Pencil Diffusion',
  'Anything v3',
  'AAM XL',
  'Deliberate',
  'DreamShaper',
  'stable_diffusion',
];

const OFFLINE_VISUAL_LEXICON: Array<[RegExp, string]> = [
  [/सरकारी नौकरी|नौकरी|भर्ती|रिक्ति|रोजगार|आवेदन|चयन|अप्रेंटिस|अप्रेंटिसशिप|वैकेंसी|पद|प्रवेश पत्र|एडमिट कार्ड|परीक्षा|नियुक्ति|कर्मचारी/i, 'Indian government job recruitment, job applicant reviewing an official application form, recruitment office, professional candidate, realistic career opportunity scene'],
  [/recruitment|vacancy|vacancies|government job|employment|apprentice|apprenticeship|job application|admit card|selection process|career/i, 'Indian government job recruitment, job applicant reviewing an official application form, recruitment office, professional candidate, realistic career opportunity scene'],
  [/किसान|kisan|farmer|kheti|खेती|खेत/i, 'indian farmer green farm field'],
  [/ट्रैक्टर|tractor/i, 'red tractor in agricultural field'],
  [/ताजमहल|taj\s*mahal/i, 'Taj Mahal Agra sunrise'],
  [/अंतरिक्ष|space|ब्रह्मांड|universe|galaxy/i, 'deep space stars nebula'],
  [/स्पेस\s*स्टेशन|space\s*station/i, 'international space station orbiting earth'],
  [/चांद|चंद्रयान|moon|chandrayaan/i, 'moon lunar surface spacecraft'],
  [/रॉकेट|rocket|isro/i, 'space rocket launching fire'],
  [/ब्लैक\s*होल|black\s*hole/i, 'glowing black hole accretion disk in space'],
  [/छात्र|student|लड़का|boy|लड़की|girl|बच्चा|kid/i, 'indian student person'],
  [/स्कूल|school|पढ़ाई|study|किताब|book/i, 'school books study classroom'],
  [/लैपटॉप|laptop|कंप्यूटर|computer|एआई|ai|रोबोट|robot/i, 'futuristic computer laptop AI technology'],
  [/डॉक्टर|doctor|अस्पताल|hospital|मरीज|patient/i, 'modern hospital medical doctor'],
  [/बारिश|rain|बाढ़|बादल|cloud/i, 'dramatic rain clouds monsoon'],
  [/सूरज|सूर्योदय|sunrise|सुबह|morning/i, 'golden morning sunrise'],
  [/रात|night/i, 'dramatic night lighting'],
  [/जंगल|forest|शेर|lion|बाघ|tiger|पेड़|tree/i, 'lush green forest wildlife'],
  [/पहाड़|पर्वत|mountain|हिमालय|himalaya/i, 'snowy Himalayan mountains'],
  [/नदी|river|समुद्र|ocean|पानी|water/i, 'flowing river water reflection'],
  [/शहर|city|सड़क|road|इमारत|building/i, 'modern city skyline traffic'],
  [/मंदिर|temple|भारत|india/i, 'heritage Indian temple architecture'],
  [/पैसा|money|बैंक|bank|व्यापार|business|बाजार|market/i, 'financial growth market chart'],
];

function buildOfflineEnglishVisual(rawText: string): string {
  const hits: string[] = [];
  for (const [regex, eng] of OFFLINE_VISUAL_LEXICON) {
    if (regex.test(rawText)) {
      hits.push(eng);
    }
  }
  const asciiLeftover = rawText
    .replace(/[^\x20-\x7E]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  const combined = [...hits, asciiLeftover].filter(Boolean).join(', ');
  return combined || 'cinematic educational documentary visual scene';
}

function looksMostlyEnglish(text: string): boolean {
  const hasNonAscii = /[^\x00-\x7F]/.test(text);
  if (hasNonAscii) return false;
  // Detect common Roman Hinglish words so Hinglish prompts also get translated to clean English
  const hinglishMarkers =
    /\b(ek|kisan|ladka|ladki|baccha|raat|subah|khet|barish|padhai|naukri|bharti|rojgar|aavedan|me|mein|hai|hain|raha|rahi|kar|ke|ki|ka|aur|upar|neeche|chala|ghar|gaav|gaon|duniya|samay|suraj|chand|pani)\b/i;
  return !hinglishMarkers.test(text);
}

export async function translateVisualPromptToEnglish(rawText: string): Promise<string> {
  const clean = rawText.replace(/\s+/g, ' ').trim().slice(0, 420);
  if (!clean) return 'modern cinematic educational visual background';

  if (looksMostlyEnglish(clean)) {
    return clean;
  }

  // Translator Tier 1: MyMemory free translation API (supports Devanagari Hindi + Roman Hinglish)
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 5500);
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(
      clean
    )}&langpair=hi|en`;
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { 'User-Agent': 'HindiVideoStudio/1.0' },
    });
    clearTimeout(timer);
    if (res.ok) {
      const json = (await res.json()) as {
        responseStatus?: number;
        responseData?: { translatedText?: string };
      };
      const translated = json?.responseData?.translatedText?.trim() ?? '';
      if (
        translated &&
        !/[^\x00-\x7F]/.test(translated) &&
        !translated.toUpperCase().includes('MYMEMORY WARNING')
      ) {
        return translated;
      }
    }
  } catch {
    // fallback to secondary translator
  }

  // Translator Tier 2: Google Translate gtx endpoint (if not rate-limited)
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 4500);
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=en&dt=t&q=${encodeURIComponent(
      clean
    )}`;
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/124.0 Safari/537.36',
      },
    });
    clearTimeout(timer);
    if (res.ok) {
      const data = (await res.json()) as Array<Array<[string]>>;
      const segments = Array.isArray(data?.[0]) ? data[0] : [];
      const translated = segments
        .map((seg) => (Array.isArray(seg) && typeof seg[0] === 'string' ? seg[0] : ''))
        .join(' ')
        .replace(/\s+/g, ' ')
        .trim();
      if (translated && !/[^\x00-\x7F]/.test(translated)) {
        return translated;
      }
    }
  } catch {
    // fallback to offline dictionary
  }

  // Translator Tier 3: Deterministic offline Hindi/Hinglish visual glossary
  return buildOfflineEnglishVisual(clean);
}

async function pickFastSfwModels(videoType: string): Promise<string[] | null> {
  const preferred =
    videoType === 'cartoon_2d' ? SAFE_CARTOON_MODELS : SAFE_3D_MODELS;

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 4500);
    const res = await fetch('https://stablehorde.net/api/v2/status/models?type=image', {
      signal: controller.signal,
    });
    clearTimeout(timer);
    if (!res.ok) return null;

    const list = (await res.json()) as Array<{
      name: string;
      count: number;
      eta: number;
      queued: number;
    }>;

    // Pick safe SFW models that currently have active workers and low queue ETA (<= 45s)
    const fastPreferred = list
      .filter(
        (m) =>
          m.count > 0 &&
          m.eta <= 45 &&
          !BLOCKED_HORDE_KEYWORDS.some((bad) => m.name.toLowerCase().includes(bad)) &&
          preferred.some((p) => m.name.toLowerCase().includes(p.toLowerCase()))
      )
      .sort((a, b) => a.eta - b.eta || b.count - a.count)
      .map((m) => m.name);

    if (fastPreferred.length > 0) {
      return fastPreferred.slice(0, 3);
    }
    return null;
  } catch {
    return null;
  }
}

function buildStyledPromptForVideoType(
  englishVisual: string,
  videoType: string,
  style: string
): { positive: string; negative: string } {
  const cleanVisual = englishVisual.replace(/[^\w\s,.'"-]/g, ' ').replace(/\s+/g, ' ').trim();
  const baseNeg =
    'text, watermark, signature, logo, blurry, distorted, ugly, deformed, bad anatomy, nsfw, nude, low quality';

  switch (videoType as VideoTypeId) {
    case 'cartoon_2d':
      return {
        positive: `${cleanVisual}, vibrant 2D cartoon illustration, pixar disney style animated art, clean bold outlines, expressive characters, colorful lighting`,
        negative: `${baseNeg}, photorealistic photograph, grainy`,
      };
    case '2_5d_parallax':
      return {
        positive: `${cleanVisual}, 2.5D layered depth cinematic art, dramatic volumetric rim lighting, atmospheric depth, crisp foreground subject`,
        negative: baseNeg,
      };
    case 'cinematic_infographic':
      return {
        positive: `${cleanVisual}, futuristic broadcast motion graphic visual, glowing 3D holographic telemetry scene, dark navy blue and orange accent light`,
        negative: baseNeg,
      };
    case '3d_realistic':
    default:
      return {
        positive: `${cleanVisual}, cinematic 3D realistic CGI render, ${style.toLowerCase()} visual, unreal engine 5 lighting, volumetric god rays, photorealistic, high detail`,
        negative: `${baseNeg}, cartoon, flat 2d sketch`,
      };
  }
}

async function submitStableHordeJob(
  prompt: string,
  negative: string,
  models: string[],
  width: number,
  height: number
): Promise<string | null> {
  const fullPrompt = `${prompt} ### ${negative}`;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 7000);
      const res = await fetch('https://stablehorde.net/api/v2/generate/async', {
        method: 'POST',
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          apikey: '0000000000',
        },
        body: JSON.stringify({
          prompt: fullPrompt,
          params: {
            width,
            height,
            steps: 18,
            sampler_name: 'k_euler_a',
            cfg_scale: 7,
          },
          models,
          nsfw: false,
          censor_nsfw: false,
          r2: true,
        }),
      });
      clearTimeout(timer);

      if (res.status === 429) {
        await SLEEP(1500 + attempt * 700);
        continue;
      }

      if (!res.ok) return null;
      const json = (await res.json()) as { id?: string };
      return json?.id ?? null;
    } catch {
      await SLEEP(500);
    }
  }
  return null;
}

async function pollStableHordeResult(jobId: string, maxWaitMs = 34000): Promise<string | null> {
  const start = Date.now();
  const deadline = start + maxWaitMs;
  while (Date.now() < deadline) {
    try {
      const res = await fetch(`https://stablehorde.net/api/v2/generate/status/${jobId}`);
      if (res.ok) {
        const data = (await res.json()) as {
          done?: boolean;
          faulted?: boolean;
          wait_time?: number;
          queue_position?: number;
          generations?: Array<{ img?: string; censored?: boolean }>;
        };
        if (data.faulted) return null;
        if (data.done) {
          const gen = data.generations?.[0];
          if (gen?.img && !gen.censored) {
            return gen.img;
          }
          return null;
        }
        // Bail early if Stable Horde queue surged (>60s ETA after first 6s)
        if (Date.now() - start > 6000 && typeof data.wait_time === 'number' && data.wait_time > 60) {
          return null;
        }
      }
    } catch {
      // retry poll
    }
    await SLEEP(2000);
  }
  return null;
}

function buildSearchQueries(englishPrompt: string): string[] {
  const noiseWords = new Set([
    'a', 'an', 'the', 'in', 'on', 'at', 'of', 'for', 'to', 'and', 'or', 'with', 'by', 'is', 'are',
    'was', 'were', 'from', 'into', 'over', 'under', 'during', 'showing', 'scene', 'video', 'style',
    '3d', '2d', 'realistic', 'cartoon', 'cinematic', 'animated', 'graphic', 'very', 'large', 'small',
    'beautiful', 'dramatic', 'bright', 'dark', 'morning', 'evening', 'red', 'blue', 'green', 'yellow',
    'white', 'black', 'around', 'near', 'through', 'visual', 'image', 'walking', 'carrying', 'studying',
  ]);

  const rawWords = englishPrompt
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2);

  const coreWords = rawWords.filter((w) => !noiseWords.has(w));
  const pool = coreWords.length >= 2 ? coreWords : rawWords;
  const unique = Array.from(new Set(pool));

  const queries: string[] = [];
  if (unique.length >= 4) queries.push(unique.slice(0, 4).join(' '));
  if (unique.length >= 3) queries.push(unique.slice(0, 3).join(' '));
  if (unique.length >= 2) queries.push(unique.slice(0, 2).join(' '));
  if (unique.length >= 1) queries.push(unique[0]);

  return Array.from(new Set(queries.filter(Boolean)));
}

const NON_SCENE_URL_REGEX =
  /(?:patch|logo|icon|emblem|flag|seal|diagram|chart|signature|comparison|insignia|crest|coat_of_arms|locator)/i;

async function queryWikimediaBitmap(query: string): Promise<string | null> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 6500);
    const url = `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrnamespace=6&gsrsearch=${encodeURIComponent(
      `${query} filetype:bitmap`
    )}&gsrlimit=8&prop=imageinfo&iiprop=url|mime|dimensions&iiurlwidth=1024&format=json`;
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { 'User-Agent': 'HindiVideoStudio/1.0' },
    });
    clearTimeout(timer);
    if (!res.ok) return null;

    const json = (await res.json()) as {
      query?: {
        pages?: Record<
          string,
          {
            index?: number;
            imageinfo?: Array<{
              thumburl?: string;
              url?: string;
              mime?: string;
              width?: number;
              height?: number;
            }>;
          }
        >;
      };
    };

    const pages = Object.values(json?.query?.pages || {}).sort(
      (a, b) => (a.index ?? 999) - (b.index ?? 999)
    );
    for (const page of pages) {
      const info = page.imageinfo?.[0];
      if (!info) continue;
      const mime = info.mime || '';
      if (!mime.startsWith('image/jpeg') && !mime.startsWith('image/png')) continue;
      if ((info.width ?? 0) < 400 || (info.height ?? 0) < 280) continue;
      const chosen = info.thumburl || info.url;
      if (chosen && !NON_SCENE_URL_REGEX.test(chosen)) return chosen;
    }
    return null;
  } catch {
    return null;
  }
}

async function queryWikipediaLeadImage(query: string): Promise<string | null> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 5500);
    const url = `https://en.wikipedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(
      query
    )}&gsrlimit=6&prop=pageimages&piprop=thumbnail&pithumbsize=1024&format=json`;
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { 'User-Agent': 'HindiVideoStudio/1.0' },
    });
    clearTimeout(timer);
    if (!res.ok) return null;

    const json = (await res.json()) as {
      query?: {
        pages?: Record<
          string,
          { index?: number; thumbnail?: { source?: string; width?: number; height?: number } }
        >;
      };
    };
    const pages = Object.values(json?.query?.pages || {}).sort(
      (a, b) => (a.index ?? 999) - (b.index ?? 999)
    );
    for (const p of pages) {
      const src = p.thumbnail?.source;
      if (
        src &&
        (p.thumbnail?.width ?? 0) >= 400 &&
        !src.endsWith('.svg.png') &&
        !NON_SCENE_URL_REGEX.test(src)
      ) {
        return src;
      }
    }
    return null;
  } catch {
    return null;
  }
}

async function fetchTopicPhotoFallbackUrl(englishPrompt: string): Promise<string | null> {
  const queries = buildSearchQueries(englishPrompt);
  for (const q of queries) {
    const wikiHit = await queryWikipediaLeadImage(q);
    if (wikiHit) return wikiHit;
  }
  for (const q of queries) {
    const commonsHit = await queryWikimediaBitmap(q);
    if (commonsHit) return commonsHit;
  }
  return null;
}

async function probeImageDimensions(filePath: string): Promise<{ width: number; height: number } | null> {
  try {
    const { stdout } = await execFileAsync('ffprobe', [
      '-v',
      'error',
      '-select_streams',
      'v:0',
      '-show_entries',
      'stream=width,height',
      '-of',
      'csv=s=x:p=0',
      filePath,
    ]);
    const [wStr, hStr] = stdout.trim().split('x');
    const width = Number.parseInt(wStr || '0', 10);
    const height = Number.parseInt(hStr || '0', 10);
    if (width > 0 && height > 0) return { width, height };
  } catch {
    // ignore ffprobe fallback
  }
  return null;
}

async function downloadAndPreparePng(
  imageUrl: string,
  targetPngPath: string,
  bgW: number,
  bgH: number,
  videoType: string
): Promise<boolean> {
  const rawExt = imageUrl.includes('.png') ? 'png' : imageUrl.includes('.jpg') ? 'jpg' : 'webp';
  const rawTmpPath = `${targetPngPath}.raw.${rawExt}`;
  const midTmpPath = `${targetPngPath}.mid.png`;

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 14000);
    const res = await fetch(imageUrl, {
      signal: controller.signal,
      headers: { 'User-Agent': 'HindiVideoStudio/1.0' },
    });
    clearTimeout(timer);
    if (!res.ok) return false;

    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.length < 1500) return false;
    fs.writeFileSync(rawTmpPath, buf);

    const dims = await probeImageDimensions(rawTmpPath);
    const isTargetVertical = bgH > bgW;
    const isSourceWide = dims ? dims.width / dims.height > 1.25 : false;

    const colorGrade =
      videoType === '2_5d_parallax'
        ? 'eq=contrast=1.08:saturation=1.14,vignette=PI/4.5'
        : videoType === 'cinematic_infographic'
        ? 'eq=contrast=1.12:saturation=0.92:brightness=-0.04,colorbalance=bs=0.14:bm=0.06,vignette=PI/4'
        : 'eq=contrast=1.06:saturation=1.10,unsharp=5:5:0.65:5:5:0.0';

    if (isTargetVertical && isSourceWide) {
      const fgW = bgW;
      const fgOffsetY = Math.round(bgH * 0.38);
      const filterComplex = `[0:v]split=2[bgsrc][fgsrc];[bgsrc]scale=${bgW}:${bgH}:force_original_aspect_ratio=increase:flags=lanczos,crop=${bgW}:${bgH},gblur=sigma=26,eq=brightness=-0.24:saturation=0.85[blurbg];[fgsrc]scale=${fgW}:-2:flags=lanczos[fg];[blurbg][fg]overlay=0:${fgOffsetY}-overlay_h/2,${colorGrade}`;
      await execFileAsync('ffmpeg', [
        '-y',
        '-loglevel',
        'error',
        '-i',
        rawTmpPath,
        '-filter_complex',
        filterComplex,
        '-frames:v',
        '1',
        videoType === 'cartoon_2d' ? midTmpPath : targetPngPath,
      ]);
    } else {
      const vfStyled = `scale=${bgW}:${bgH}:force_original_aspect_ratio=increase:flags=lanczos,crop=${bgW}:${bgH},${colorGrade}`;
      await execFileAsync('ffmpeg', [
        '-y',
        '-loglevel',
        'error',
        '-i',
        rawTmpPath,
        '-vf',
        vfStyled,
        '-frames:v',
        '1',
        videoType === 'cartoon_2d' ? midTmpPath : targetPngPath,
      ]);
    }

    if (videoType === 'cartoon_2d' && fs.existsSync(midTmpPath)) {
      try {
        await execFileAsync('convert', [
          midTmpPath,
          '-paint',
          '3',
          '-modulate',
          '104,132,100',
          '-level',
          '4%,96%',
          targetPngPath,
        ]);
      } catch {
        fs.copyFileSync(midTmpPath, targetPngPath);
      }
    }

    return fs.existsSync(targetPngPath) && fs.statSync(targetPngPath).size > 2000;
  } catch {
    return false;
  } finally {
    if (fs.existsSync(rawTmpPath)) fs.unlinkSync(rawTmpPath);
    if (fs.existsSync(midTmpPath)) fs.unlinkSync(midTmpPath);
  }
}

export async function generateSceneVisualAsset(params: {
  sceneNumber: number;
  visualPrompt: string;
  voiceScript: string;
  videoType: string;
  style: string;
  isVertical: boolean;
  bgW: number;
  bgH: number;
  jobDir: string;
  staggerMs: number;
}): Promise<SceneVisualAsset | null> {
  const {
    sceneNumber,
    visualPrompt,
    voiceScript,
    videoType,
    style,
    isVertical,
    bgW,
    bgH,
    jobDir,
    staggerMs,
  } = params;

  const rawPrompt = visualPrompt.trim() || voiceScript.trim();
  const englishPrompt = await translateVisualPromptToEnglish(rawPrompt);
  const { positive, negative } = buildStyledPromptForVideoType(
    englishPrompt,
    videoType,
    style
  );

  if (staggerMs > 0) {
    await SLEEP(staggerMs);
  }

  const genW = isVertical ? 448 : 576;
  const genH = isVertical ? 576 : 384;
  const outPngPath = path.join(jobDir, `ai_bg_${sceneNumber}.png`);

  // Tier 1: Fast SFW AI image generation via Stable Horde strictly from translated Visual Prompt
  const fastModels = await pickFastSfwModels(videoType);
  if (fastModels && fastModels.length > 0) {
    const hordeId = await submitStableHordeJob(positive, negative, fastModels, genW, genH);
    if (hordeId) {
      const imgUrl = await pollStableHordeResult(hordeId, 34000);
      if (imgUrl && (await downloadAndPreparePng(imgUrl, outPngPath, bgW, bgH, videoType))) {
        return {
          kind: 'raster',
          filePath: outPngPath,
          source: 'ai_horde',
          englishPrompt,
        };
      }
    }
  }

  // Tier 2: Progressive Wikipedia + Wikimedia Commons photo matched to translated Visual Prompt
  const photoUrl = await fetchTopicPhotoFallbackUrl(englishPrompt);
  if (photoUrl && (await downloadAndPreparePng(photoUrl, outPngPath, bgW, bgH, videoType))) {
    return {
      kind: 'raster',
      filePath: outPngPath,
      source: 'wikimedia',
      englishPrompt,
    };
  }

  // Tier 3: Offline procedural 3D SVG fallback
  return null;
}
