import { useRef, useState } from 'react';
import { Clapperboard, Info, Plus, Trash2, Volume2 } from 'lucide-react';
import {
  HINDI_VOICES,
  HindiVoiceOption,
  SceneDraftInput,
  SCRIPT_AI_PROVIDERS,
  ScriptAiOption,
  VIDEO_FORMATS,
  VIDEO_STYLES,
  VIDEO_TYPES,
  VideoFormatOption,
  VideoStyleName,
  VideoTypeOption,
} from '../types/studio';
import {
  BRAND_9_16_FOOTER_IMG,
  BRAND_9_16_HEADER_IMG,
  synthesizeVoicePreviewUrl,
} from '../utils/renderNodeApi';
import { StudioDropdown } from './StudioDropdown';

interface StudioDashboardViewProps {
  renderEndpointUrl: string;
  validationError: string | null;
  selectedFormat: VideoFormatOption;
  selectedVideoType: VideoTypeOption;
  selectedStyle: VideoStyleName;
  selectedVoice: HindiVoiceOption;
  selectedScriptAi: ScriptAiOption;
  sceneDrafts: SceneDraftInput[];
  onSelectFormat: (format: VideoFormatOption) => void;
  onSelectVideoType: (videoType: VideoTypeOption) => void;
  onSelectStyle: (style: VideoStyleName) => void;
  onSelectVoice: (voice: HindiVoiceOption) => void;
  onSelectScriptAi: (provider: ScriptAiOption) => void;
  onSceneVisualChange: (index: number, value: string) => void;
  onSceneVoiceChange: (index: number, value: string) => void;
  onSceneScreenTextChange: (index: number, value: string) => void;
  onAddSceneSlot: () => void;
  onClearAllScenes: () => void;
  onGenerateClick: () => void;
}

export function StudioDashboardView({
  renderEndpointUrl,
  validationError,
  selectedFormat,
  selectedVideoType,
  selectedStyle,
  selectedVoice,
  selectedScriptAi,
  sceneDrafts,
  onSelectFormat,
  onSelectVideoType,
  onSelectStyle,
  onSelectVoice,
  onSelectScriptAi,
  onSceneVisualChange,
  onSceneVoiceChange,
  onSceneScreenTextChange,
  onAddSceneSlot,
  onClearAllScenes,
  onGenerateClick,
}: StudioDashboardViewProps) {
  const [previewingKey, setPreviewingKey] = useState<string | null>(null);
  const [speechNotice, setSpeechNotice] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const playRealNeuralVoice = async (text: string, key: string, label: string) => {
    const clean = text.trim();
    if (!clean) return;

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    setPreviewingKey(key);
    setSpeechNotice(`Generating neural Hindi voice for ${label}...`);

    const mp3Url = await synthesizeVoicePreviewUrl(renderEndpointUrl, clean, selectedVoice.id);
    if (mp3Url) {
      try {
        const audio = new Audio(mp3Url);
        audio.volume = 1.0;
        audioRef.current = audio;
        audio.onended = () => {
          URL.revokeObjectURL(mp3Url);
          setPreviewingKey(null);
          setSpeechNotice(null);
        };
        audio.onerror = () => {
          URL.revokeObjectURL(mp3Url);
          setPreviewingKey(null);
          setSpeechNotice('Audio playback blocked by browser.');
        };
        await audio.play();
        setSpeechNotice(`Playing ${selectedVoice.name} (${selectedVoice.gender}) neural voice.`);
        return;
      } catch {
        URL.revokeObjectURL(mp3Url);
      }
    }

    setPreviewingKey(null);
    setSpeechNotice('Voice preview unavailable right now — check Render Node connection.');
  };

  const activeSceneCount = sceneDrafts.filter(
    (s) =>
      s.visualPrompt.trim().length > 0 ||
      s.voiceScript.trim().length > 0 ||
      s.screenText.trim().length > 0
  ).length;

  return (
    <div className="space-y-5">
      {/* Hero Heading */}
      <div className="space-y-1.5">
        <h1 className="text-[24px] font-bold leading-[1.28] tracking-tight text-[#F8FAFC] sm:text-[26px]">
          कोई भी विषय, instant Hindi video.
        </h1>
        <p className="text-[13px] leading-relaxed text-[#94A3B8]">
          Har scene ka <strong className="text-[#CBD5E1]">Visual Prompt</strong> aapke likhe hue
          visual ke hisab se real AI visual banata hai, aur neeche uski{' '}
          <strong className="text-[#CBD5E1]">Voice-Over Script</strong> boli jaati hai.
        </p>
      </div>

      {/* Video Format Selection */}
      <section className="space-y-2.5">
        <div className="text-xs font-semibold text-[#F8FAFC]">Video Format</div>
        <div className="grid grid-cols-2 gap-3">
          {VIDEO_FORMATS.map((format) => {
            const isSelected = selectedFormat.id === format.id;
            return (
              <button
                key={format.id}
                type="button"
                onClick={() => onSelectFormat(format)}
                className={`flex min-h-[108px] flex-col justify-between rounded-2xl border p-3.5 text-left transition-all duration-150 ${
                  isSelected
                    ? 'border-[#3B82F6] bg-gradient-to-br from-[#2563EB]/25 via-[#111A2E] to-[#111A2E]'
                    : 'border-[#1E293B] bg-[#111A2E] hover:border-[#334155]'
                }`}
              >
                <div className="flex w-full items-center justify-between gap-2">
                  <div
                    className={`rounded border-2 ${
                      format.id === 'shorts_9_16' ? 'h-7 w-[18px]' : 'h-[18px] w-7'
                    } ${isSelected ? 'border-[#3B82F6]' : 'border-[#64748B]'}`}
                  />
                  <span
                    className={`font-mono-tabular text-xs font-semibold ${
                      isSelected ? 'text-[#3B82F6]' : 'text-[#94A3B8]'
                    }`}
                  >
                    {format.ratioLabel}
                  </span>
                </div>
                <div className="pt-2">
                  <div className="text-sm font-semibold text-[#F8FAFC]">{format.title}</div>
                  <div className="font-mono-tabular text-[11px] text-[#64748B]">
                    {format.resolution}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Permanent 9:16 Header & Footer Branding Preview */}
        {selectedFormat.id === 'shorts_9_16' && (
          <div className="space-y-2 rounded-2xl border border-[#3B82F6]/35 bg-[#0A1328] p-3">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-semibold text-[#F8FAFC]">
                9:16 Permanent Header &amp; Footer (Locked)
              </span>
              <span className="font-mono-tabular text-[11px] text-[#60A5FA]">Only 9:16</span>
            </div>
            <div className="overflow-hidden rounded-xl border border-[#1E293B] bg-[#060913]">
              <img
                src={BRAND_9_16_HEADER_IMG}
                alt="Permanent 9:16 Disha Manch Header"
                className="w-full object-cover"
              />
              <div className="py-2 text-center text-[11px] text-[#94A3B8]">
                Middle canvas renders your scene visuals + voice subtitles cleanly
              </div>
              <img
                src={BRAND_9_16_FOOTER_IMG}
                alt="Permanent 9:16 Disha Manch Footer"
                className="w-full object-cover"
              />
            </div>
          </div>
        )}
      </section>

      {/* Video Type, Style, Hindi Voice, Script AI Dropdowns */}
      <section className="space-y-4 rounded-2xl border border-[#1E293B] bg-[#111A2E] p-4">
        <StudioDropdown
          id="video-type-dropdown"
          label="Video Type (वीडियो स्टाइल)"
          value={selectedVideoType.id}
          options={VIDEO_TYPES.map((vt) => ({
            value: vt.id,
            label: vt.name,
            secondary: vt.hindiSubtitle,
          }))}
          onChange={(id) => {
            const found = VIDEO_TYPES.find((v) => v.id === id);
            if (found) onSelectVideoType(found);
          }}
        />

        <StudioDropdown
          id="style-dropdown"
          label="Content Style"
          value={selectedStyle}
          options={VIDEO_STYLES.map((item) => ({
            value: item.id,
            label: item.title,
            secondary: item.hindiSubtitle,
          }))}
          onChange={onSelectStyle}
        />

        <div className="space-y-1.5">
          <StudioDropdown
            id="voice-dropdown"
            label="Hindi Voice"
            value={selectedVoice.id}
            options={HINDI_VOICES.map((voice) => ({
              value: voice.id,
              label: `${voice.name} (${voice.gender})`,
              secondary: `${voice.tone} · ${voice.engineLabel}`,
            }))}
            onChange={(id) => {
              const found = HINDI_VOICES.find((v) => v.id === id);
              if (found) onSelectVoice(found);
            }}
            rightAccessory={
              <button
                type="button"
                onClick={() =>
                  void playRealNeuralVoice(
                    selectedVoice.sampleHindiLine,
                    'voice-sample',
                    `${selectedVoice.name} (${selectedVoice.gender})`
                  )
                }
                disabled={previewingKey === 'voice-sample'}
                className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-medium text-[#3B82F6] transition-colors hover:bg-[#16223B] disabled:opacity-60"
              >
                <Volume2 className="h-3.5 w-3.5" />
                <span>{previewingKey === 'voice-sample' ? 'Loading...' : 'Test Hindi Voice'}</span>
              </button>
            }
          />
          {speechNotice && <p className="text-[11px] text-[#94A3B8]">{speechNotice}</p>}
        </div>

        <StudioDropdown
          id="script-ai-dropdown"
          label="Script AI"
          value={selectedScriptAi.id}
          options={SCRIPT_AI_PROVIDERS.map((ai) => ({
            value: ai.id,
            label: ai.name,
            secondary: `${ai.costLabel} · ${ai.notes}`,
          }))}
          onChange={(id) => {
            const found = SCRIPT_AI_PROVIDERS.find((ai) => ai.id === id);
            if (found) onSelectScriptAi(found);
          }}
        />
      </section>

      {/* Scene-Wise Visual Prompt + Voice-Over Script (5 Default Scenes + Add Scene Button) */}
      <section className="space-y-3 rounded-2xl border border-[#1E293B] bg-[#111A2E] p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-xs font-semibold text-[#F8FAFC]">
              Scene Builder — Visual Prompt &amp; Voice-Over Script
            </h2>
            <p className="text-[11px] text-[#94A3B8]">
              {sceneDrafts.length} scenes ready (Optional) · और जोड़ने के लिए नीचे Add Scene दबाएँ
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-mono-tabular rounded-lg border border-[#3B82F6]/35 bg-[#2563EB]/15 px-2.5 py-1 text-[11px] font-semibold text-[#60A5FA]">
              {activeSceneCount} / {sceneDrafts.length} Active
            </span>
            {activeSceneCount > 0 && (
              <button
                type="button"
                onClick={onClearAllScenes}
                className="inline-flex items-center gap-1 rounded-lg border border-[#1E293B] bg-[#070C1A] px-2.5 py-1 text-[11px] font-medium text-[#94A3B8] hover:text-white"
              >
                <Trash2 className="h-3 w-3" />
                <span>Clear</span>
              </button>
            )}
          </div>
        </div>

        <div className="space-y-3">
          {sceneDrafts.map((scene, idx) => {
            const sceneNumber = idx + 1;
            const isFilled =
              scene.visualPrompt.trim().length > 0 ||
              scene.voiceScript.trim().length > 0 ||
              scene.screenText.trim().length > 0;
            const listenKey = `scene-${sceneNumber}`;

            return (
              <div
                key={sceneNumber}
                className={`space-y-2.5 rounded-xl border p-3 transition-colors ${
                  isFilled
                    ? 'border-[#3B82F6]/45 bg-[#070C1A]'
                    : 'border-[#1E293B] bg-[#070C1A]/75'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono-tabular text-xs font-bold text-[#3B82F6]">
                    Scene {String(sceneNumber).padStart(2, '0')}
                    {isFilled ? ' · Active' : ' · Optional'}
                  </span>
                  {scene.voiceScript.trim().length > 0 && (
                    <button
                      type="button"
                      onClick={() =>
                        void playRealNeuralVoice(
                          scene.voiceScript,
                          listenKey,
                          `Scene ${sceneNumber}`
                        )
                      }
                      disabled={previewingKey === listenKey}
                      className="inline-flex items-center gap-1 rounded-lg border border-[#1E293B] bg-[#111A2E] px-2 py-1 text-[11px] font-medium text-[#CBD5E1] hover:text-white disabled:opacity-60"
                    >
                      <Volume2 className="h-3 w-3 text-[#3B82F6]" />
                      <span>{previewingKey === listenKey ? 'Playing...' : 'Listen Voice'}</span>
                    </button>
                  )}
                </div>

                {/* Visual Prompt Field */}
                <div className="space-y-1">
                  <label
                    htmlFor={`scene-visual-${sceneNumber}`}
                    className="block text-[11px] font-medium text-[#CBD5E1]"
                  >
                    Visual Prompt (सीन का विज़ुअल प्रॉम्प्ट)
                  </label>
                  <textarea
                    id={`scene-visual-${sceneNumber}`}
                    rows={2}
                    value={scene.visualPrompt}
                    onChange={(e) => onSceneVisualChange(idx, e.target.value)}
                    placeholder={`Scene ${sceneNumber} में क्या दिखाना है लिखें (जैसे: 3D अंतरिक्ष यान चांद पर उतरते हुए)...`}
                    className="w-full resize-y rounded-lg border border-[#1E293B] bg-[#0B1222] px-3 py-2 text-xs leading-relaxed text-[#F8FAFC] placeholder-[#475569] focus:border-[#3B82F6] focus:outline-none"
                  />
                </div>

                {/* Voice-Over Script Field */}
                <div className="space-y-1">
                  <label
                    htmlFor={`scene-voice-${sceneNumber}`}
                    className="block text-[11px] font-medium text-[#CBD5E1]"
                  >
                    Voice-Over Script (बोलने वाली स्क्रिप्ट)
                  </label>
                  <textarea
                    id={`scene-voice-${sceneNumber}`}
                    rows={2}
                    value={scene.voiceScript}
                    onChange={(e) => onSceneVoiceChange(idx, e.target.value)}
                    placeholder={`Scene ${sceneNumber} के लिए हिंदी/हिंग्लिश वॉइस-ओवर स्क्रिप्ट लिखें...`}
                    className="w-full resize-y rounded-lg border border-[#1E293B] bg-[#0B1222] px-3 py-2 text-xs leading-relaxed text-[#F8FAFC] placeholder-[#475569] focus:border-[#F97316] focus:outline-none"
                  />
                </div>

                {/* On-Screen Animated Text Field */}
                <div className="space-y-1">
                  <label
                    htmlFor={`scene-screen-text-${sceneNumber}`}
                    className="block text-[11px] font-medium text-[#CBD5E1]"
                  >
                    On-Screen Text (स्क्रीन पर क्या लिखा आए — वॉइस के अनुसार एनीमेट होगा)
                  </label>
                  <textarea
                    id={`scene-screen-text-${sceneNumber}`}
                    rows={2}
                    value={scene.screenText}
                    onChange={(e) => onSceneScreenTextChange(idx, e.target.value)}
                    placeholder={`Scene ${sceneNumber} में स्क्रीन पर दिखने वाला टेक्स्ट लिखें (खाली छोड़ने पर Voice-Over स्क्रिप्ट एनीमेट होगी)...`}
                    className="w-full resize-y rounded-lg border border-[#1E293B] bg-[#0B1222] px-3 py-2 text-xs leading-relaxed text-[#F8FAFC] placeholder-[#475569] focus:border-[#10B981] focus:outline-none"
                  />
                </div>
              </div>
            );
          })}
        </div>

        <button
          type="button"
          onClick={onAddSceneSlot}
          className="flex min-h-[42px] w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-[#334155] bg-[#070C1A] text-xs font-semibold text-[#60A5FA] transition-colors hover:border-[#3B82F6] hover:bg-[#0B1222]"
        >
          <Plus className="h-4 w-4" />
          <span>Add Scene {sceneDrafts.length + 1}</span>
        </button>
      </section>

      {validationError && (
        <div className="rounded-xl border border-[#EF4444]/60 bg-[#EF4444]/10 p-3 text-xs font-medium text-[#FCA5A5]">
          {validationError}
        </div>
      )}

      {/* Large Orange Primary CTA */}
      <button
        type="button"
        onClick={onGenerateClick}
        className="flex min-h-[54px] w-full items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r from-[#F97316] to-[#EA580C] px-5 text-base font-bold text-white shadow-lg shadow-[#F97316]/20 transition-transform duration-150 hover:brightness-110 active:scale-[0.99]"
      >
        <Clapperboard className="h-5 w-5" />
        <span>
          Generate Hindi Video ({activeSceneCount > 0 ? `${activeSceneCount} scenes` : '0 active'})
        </span>
      </button>

      {/* Transparent Pipeline Note */}
      <div className="flex items-start gap-2.5 rounded-xl border border-[#1E293B] bg-[#0A101F] p-3">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-[#3B82F6]" />
        <p className="text-[11px] leading-relaxed text-[#94A3B8]">
          <strong className="text-[#CBD5E1]">Built-In Render Node:</strong> Renders active scenes
          in your chosen Video Type with Edge Neural Hindi Voice and permanent 9:16 branding.
        </p>
      </div>
    </div>
  );
}
