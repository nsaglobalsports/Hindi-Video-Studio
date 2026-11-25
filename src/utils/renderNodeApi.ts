import {
  HindiVoiceOption,
  JobStatus,
  SceneDraftInput,
  ScenePlan,
  ScriptAiOption,
  VideoFormatOption,
  VideoProject,
  VideoStyleName,
  VideoTypeOption,
} from '../types/studio';

export const BRAND_9_16_HEADER_IMG = '/assets/aistudio/Header_ebc248d3.jpg';
export const BRAND_9_16_FOOTER_IMG = '/assets/aistudio/Footer_66d0a2aa.jpg';

const STORAGE_PROJECTS_KEY = 'hvs_saved_projects_v1';
const STORAGE_ENDPOINT_KEY = 'hvs_render_node_url_v1';

export function getBuiltInRenderNodeUrl(): string {
  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin;
  }
  return 'http://localhost:3000';
}

export function loadSavedProjects(): VideoProject[] {
  try {
    const raw = localStorage.getItem(STORAGE_PROJECTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveProjectsToStorage(projects: VideoProject[]): void {
  try {
    localStorage.setItem(STORAGE_PROJECTS_KEY, JSON.stringify(projects));
  } catch {
    // Ignore storage quota issues safely
  }
}

export function loadRenderNodeUrl(): string {
  const builtIn = getBuiltInRenderNodeUrl();
  try {
    const saved = localStorage.getItem(STORAGE_ENDPOINT_KEY);
    if (!saved || saved === 'http://localhost:8000' || saved === 'http://192.168.1.100:8000') {
      return builtIn;
    }
    return saved;
  } catch {
    return builtIn;
  }
}

export function saveRenderNodeUrl(url: string): void {
  try {
    localStorage.setItem(STORAGE_ENDPOINT_KEY, url.trim());
  } catch {
    // Ignore storage errors
  }
}

export function buildSceneStoryboard(
  sceneDrafts: SceneDraftInput[],
  format: VideoFormatOption,
  videoType: VideoTypeOption
): ScenePlan[] {
  const perSceneDuration = format.id === 'shorts_9_16' ? 4 : 5;

  const active = sceneDrafts
    .map((item) => ({
      visualPrompt: item.visualPrompt.trim(),
      voiceScript: item.voiceScript.trim(),
      screenText: (item.screenText ?? '').trim(),
    }))
    .filter(
      (item) =>
        item.visualPrompt.length > 0 ||
        item.voiceScript.length > 0 ||
        item.screenText.length > 0
    );

  return active.map((item, idx) => {
    const sceneNumber = idx + 1;
    const effectiveVisual = item.visualPrompt || item.voiceScript || item.screenText;
    return {
      sceneNumber,
      durationSec: perSceneDuration,
      visualPrompt: item.visualPrompt,
      voiceScript: item.voiceScript,
      screenText: item.screenText,
      visualCue: `${videoType.name} · ${effectiveVisual.slice(0, 72)}${
        effectiveVisual.length > 72 ? '…' : ''
      }`,
      narrationPrompt: item.voiceScript || item.screenText || '(Silent visual scene)',
    };
  });
}

export function createProjectRecord(params: {
  sceneDrafts: SceneDraftInput[];
  format: VideoFormatOption;
  videoType: VideoTypeOption;
  style: VideoStyleName;
  voice: HindiVoiceOption;
  scriptAi: ScriptAiOption;
  status: JobStatus;
}): VideoProject {
  const now = new Date();
  const formattedDate = now.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const scenes = buildSceneStoryboard(params.sceneDrafts, params.format, params.videoType);
  const firstTitle =
    scenes[0]?.voiceScript ||
    scenes[0]?.visualPrompt ||
    `Hindi Video (${scenes.length} scenes)`;

  return {
    id: crypto.randomUUID ? crypto.randomUUID() : `hvs_${Date.now()}`,
    topicPrompt: firstTitle,
    format: params.format,
    videoTypeId: params.videoType.id,
    videoTypeLabel: params.videoType.name,
    style: params.style,
    voiceId: params.voice.id,
    voiceLabel: `${params.voice.name} (${params.voice.gender})`,
    scriptAiId: params.scriptAi.id,
    scriptAiLabel: params.scriptAi.name,
    sceneCount: scenes.length,
    createdAtIso: formattedDate,
    status: params.status,
    mp4Url: null,
    remoteJobId: null,
    scenes,
  };
}

export interface HealthCheckResponse {
  online: boolean;
  latencyMs: number | null;
  detail: string;
}

function normalizeUrl(raw: string): string {
  return raw.trim().replace(/\/+$/, '');
}

export async function checkRenderNodeHealth(baseUrl: string): Promise<HealthCheckResponse> {
  const normalized = normalizeUrl(baseUrl);
  if (!normalized) {
    return {
      online: false,
      latencyMs: null,
      detail: 'No Render Node URL configured',
    };
  }

  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 3500);
  const start = performance.now();

  try {
    let res = await fetch(`${normalized}/api/health`, {
      method: 'GET',
      signal: controller.signal,
    });

    if (res.status === 404) {
      res = await fetch(`${normalized}/health`, {
        method: 'GET',
        signal: controller.signal,
      });
    }

    const elapsed = Math.round(performance.now() - start);
    window.clearTimeout(timeout);

    if (res.ok) {
      const contentType = res.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        const data = (await res.json().catch(() => null)) as {
          online?: boolean;
          engine?: string;
        } | null;
        if (data && data.online === false) {
          return {
            online: false,
            latencyMs: elapsed,
            detail: 'Render Node reported unavailable',
          };
        }
        return {
          online: true,
          latencyMs: elapsed,
          detail: data?.engine
            ? `Connected (${elapsed} ms) · ${data.engine.split('Copyright')[0].trim()}`
            : `Connected (${elapsed} ms)`,
        };
      }

      return {
        online: true,
        latencyMs: elapsed,
        detail: `Connected (${elapsed} ms)`,
      };
    }

    return {
      online: false,
      latencyMs: elapsed,
      detail: `Node returned HTTP ${res.status}`,
    };
  } catch (err) {
    window.clearTimeout(timeout);
    const message =
      err instanceof DOMException && err.name === 'AbortError'
        ? 'Connection timed out (3.5s)'
        : 'Unreachable — start your self-hosted Render Node or check CORS/LAN URL';
    return {
      online: false,
      latencyMs: null,
      detail: message,
    };
  }
}

export interface RemoteRenderJob {
  jobId: string;
  status: string;
  progress: number;
  stage: string;
  mp4Url?: string | null;
  error?: string | null;
}

function resolveMp4Url(baseUrl: string, mp4Url?: string | null): string | null {
  if (!mp4Url) return null;
  if (mp4Url.startsWith('http://') || mp4Url.startsWith('https://')) {
    return mp4Url;
  }
  return `${normalizeUrl(baseUrl)}${mp4Url.startsWith('/') ? '' : '/'}${mp4Url}`;
}

export async function synthesizeVoicePreviewUrl(
  baseUrl: string,
  text: string,
  voiceId: string
): Promise<string | null> {
  const normalized = normalizeUrl(baseUrl);
  try {
    const res = await fetch(`${normalized}/api/tts-preview`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, voiceId }),
    });
    if (!res.ok) return null;
    const blob = await res.blob();
    if (blob.size < 300) return null;
    return URL.createObjectURL(blob);
  } catch {
    return null;
  }
}

export async function submitRenderJob(
  baseUrl: string,
  project: VideoProject
): Promise<RemoteRenderJob> {
  const normalized = normalizeUrl(baseUrl);
  const res = await fetch(`${normalized}/api/render`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      topicPrompt: project.topicPrompt,
      formatId: project.format.id,
      aspectRatio: project.format.ratioLabel,
      videoType: project.videoTypeId,
      style: project.style,
      voiceId: project.voiceId,
      scriptAiProvider: project.scriptAiId,
      sceneCount: project.sceneCount,
      scenes: project.scenes.map((scene) => ({
        visualPrompt: scene.visualPrompt,
        voiceScript: scene.voiceScript,
        screenText: scene.screenText ?? '',
      })),
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Render Node HTTP ${res.status}${text ? `: ${text}` : ''}`);
  }

  const job = (await res.json()) as RemoteRenderJob;
  return { ...job, mp4Url: resolveMp4Url(normalized, job.mp4Url) };
}

export async function pollRenderJob(
  baseUrl: string,
  jobId: string
): Promise<RemoteRenderJob> {
  const normalized = normalizeUrl(baseUrl);
  const res = await fetch(`${normalized}/api/jobs/${encodeURIComponent(jobId)}`);
  if (!res.ok) {
    throw new Error(`Job status HTTP ${res.status}`);
  }
  const job = (await res.json()) as RemoteRenderJob;
  return { ...job, mp4Url: resolveMp4Url(normalized, job.mp4Url) };
}

export function mapRemoteStatus(remoteStatus: string): JobStatus {
  switch (remoteStatus.toLowerCase()) {
    case 'completed':
    case 'done':
      return 'completed';
    case 'failed':
    case 'error':
      return 'failed';
    case 'rendering':
    case 'processing':
      return 'rendering';
    default:
      return 'queued';
  }
}
