export type StudioTab = 'studio' | 'library';
export type ActiveScreen = 'dashboard' | 'progress' | 'preview';

export type VideoFormatId = 'shorts_9_16' | 'youtube_16_9';

export interface VideoFormatOption {
  id: VideoFormatId;
  title: string;
  ratioLabel: string;
  resolution: string;
  subtitle: string;
}

export type VideoTypeId =
  | '3d_realistic'
  | '2_5d_parallax'
  | 'cartoon_2d'
  | 'cinematic_infographic';

export interface VideoTypeOption {
  id: VideoTypeId;
  name: string;
  hindiSubtitle: string;
}

export type VideoStyleName =
  | 'Educational / Explainer'
  | 'News'
  | 'Documentary'
  | 'Animated Infographic';

export interface VideoStyleOption {
  id: VideoStyleName;
  title: VideoStyleName;
  hindiSubtitle: string;
}

export interface HindiVoiceOption {
  id: string;
  name: string;
  gender: 'Female' | 'Male';
  tone: string;
  engineLabel: string;
  sampleHindiLine: string;
}

export interface ScriptAiOption {
  id: string;
  name: string;
  costLabel: string;
  notes: string;
}

export type NodeConnectionStatus = 'checking' | 'online' | 'offline';

export interface RenderNodeState {
  endpointUrl: string;
  status: NodeConnectionStatus;
  latencyMs: number | null;
  statusDetail: string;
}

export type JobStatus =
  | 'local_draft'
  | 'queued'
  | 'rendering'
  | 'completed'
  | 'failed';

export interface SceneDraftInput {
  visualPrompt: string;
  voiceScript: string;
  screenText: string;
}

export interface ScenePlan {
  sceneNumber: number;
  durationSec: number;
  visualPrompt: string;
  voiceScript: string;
  screenText: string;
  visualCue: string;
  narrationPrompt: string;
}

export interface VideoProject {
  id: string;
  topicPrompt: string;
  format: VideoFormatOption;
  videoTypeId: VideoTypeId;
  videoTypeLabel: string;
  style: VideoStyleName;
  voiceId: string;
  voiceLabel: string;
  scriptAiId: string;
  scriptAiLabel: string;
  sceneCount: number;
  createdAtIso: string;
  status: JobStatus;
  mp4Url: string | null;
  remoteJobId: string | null;
  scenes: ScenePlan[];
}

export interface GenerationProgressState {
  project: VideoProject | null;
  stageLabel: string;
  progressPercent: number;
  isSubmitting: boolean;
  errorMessage: string | null;
}

export const VIDEO_FORMATS: VideoFormatOption[] = [
  {
    id: 'shorts_9_16',
    title: 'Shorts / Reels',
    ratioLabel: '9:16',
    resolution: '1080×1920',
    subtitle: 'Locked Header & Footer (Disha Manch)',
  },
  {
    id: 'youtube_16_9',
    title: 'YouTube Explainer',
    ratioLabel: '16:9',
    resolution: '1920×1080',
    subtitle: 'Widescreen landscape',
  },
];

export const VIDEO_TYPES: VideoTypeOption[] = [
  {
    id: '3d_realistic',
    name: '3D Realistic Graphics Motion',
    hindiSubtitle: 'गहरे 3D रेंडर, वॉल्यूमेट्रिक लाइट और कैमरा डेप्थ',
  },
  {
    id: '2_5d_parallax',
    name: '2.5D Parallax Depth Motion',
    hindiSubtitle: 'मल्टी-लेयर डेप्थ, ग्लास कार्ड और पैरेलैक्स मोशन',
  },
  {
    id: 'cartoon_2d',
    name: 'Cartoon / 2D Illustrated Style',
    hindiSubtitle: 'चमकदार रंग, बोल्ड आउटलाइन और कार्टून एनीमेशन',
  },
  {
    id: 'cinematic_infographic',
    name: 'Kinetic Infographic / Broadcast',
    hindiSubtitle: 'डेटा चार्ट, मोशन ग्राफ़िक्स और स्टूडियो HUD',
  },
];

export const VIDEO_STYLES: VideoStyleOption[] = [
  {
    id: 'Educational / Explainer',
    title: 'Educational / Explainer',
    hindiSubtitle: 'शैक्षिक और सरल व्याख्या',
  },
  {
    id: 'News',
    title: 'News',
    hindiSubtitle: 'ताज़ा समाचार और बुलेटिन',
  },
  {
    id: 'Documentary',
    title: 'Documentary',
    hindiSubtitle: 'गहन कहानी और तथ्य',
  },
  {
    id: 'Animated Infographic',
    title: 'Animated Infographic',
    hindiSubtitle: 'डेटा और विज़ुअल चार्ट',
  },
];

export const HINDI_VOICES: HindiVoiceOption[] = [
  {
    id: 'hi_swara_f',
    name: 'Swara',
    gender: 'Female',
    tone: 'Warm & Clear',
    engineLabel: 'Edge Neural TTS (hi-IN)',
    sampleHindiLine: 'नमस्ते, आज हम इस विषय को आसान हिंदी में समझेंगे।',
  },
  {
    id: 'hi_madhur_m',
    name: 'Madhur',
    gender: 'Male',
    tone: 'Broadcast Studio',
    engineLabel: 'Edge Neural TTS (hi-IN)',
    sampleHindiLine: 'नमस्कार, आइए जानते हैं आज की मुख्य बातें विस्तार से।',
  },
  {
    id: 'hi_ananya_f',
    name: 'Ananya',
    gender: 'Female',
    tone: 'Energetic Shorts',
    engineLabel: 'Edge Neural TTS (hi-IN)',
    sampleHindiLine: 'क्या आप जानते हैं? अगले साठ सेकंड में पूरा सच समझिए।',
  },
  {
    id: 'hi_aarav_m',
    name: 'Aarav',
    gender: 'Male',
    tone: 'Calm Documentary',
    engineLabel: 'Edge Neural TTS (hi-IN)',
    sampleHindiLine: 'कहानी की शुरुआत होती है एक अनसुने वैज्ञानिक तथ्य से।',
  },
];

export const SCRIPT_AI_PROVIDERS: ScriptAiOption[] = [
  {
    id: 'ollama_local',
    name: 'Ollama (Local Llama 3 / Qwen)',
    costLabel: 'Free · Self-Hosted',
    notes: 'Runs locally on your Render Node',
  },
  {
    id: 'hf_free',
    name: 'HuggingFace Free Inference',
    costLabel: 'Free Tier',
    notes: 'Open-weight Hindi & multilingual models',
  },
  {
    id: 'openrouter_free',
    name: 'OpenRouter (Free Models)',
    costLabel: 'Free Quota',
    notes: 'Zero-cost community endpoints',
  },
  {
    id: 'manual_script',
    name: 'Manual / Direct Prompt',
    costLabel: '100% Offline',
    notes: 'No external AI required',
  },
];

export const DEFAULT_SCENE_SLOT_COUNT = 5;
