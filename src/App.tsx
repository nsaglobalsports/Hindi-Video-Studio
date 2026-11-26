import { useEffect, useRef, useState } from 'react';
import { Code2, Layers, Monitor, Plus, Server, Smartphone } from 'lucide-react';
import { AndroidProjectDrawer } from './components/AndroidProjectDrawer';
import { GenerationProgressView } from './components/GenerationProgressView';
import { LibraryFilter, LibraryView } from './components/LibraryView';
import { PreviewExportView } from './components/PreviewExportView';
import { RenderNodeModal } from './components/RenderNodeModal';
import { StudioDashboardView } from './components/StudioDashboardView';
import {
  ActiveScreen,
  DEFAULT_SCENE_SLOT_COUNT,
  GenerationProgressState,
  HINDI_VOICES,
  HindiVoiceOption,
  RenderNodeState,
  SceneDraftInput,
  SCRIPT_AI_PROVIDERS,
  ScriptAiOption,
  StudioTab,
  VIDEO_FORMATS,
  VIDEO_TYPES,
  VideoFormatOption,
  VideoProject,
  VideoStyleName,
  VideoTypeOption,
} from './types/studio';
import {
  buildSceneStoryboard,
  checkRenderNodeHealth,
  createProjectRecord,
  loadRenderNodeUrl,
  loadSavedProjects,
  mapRemoteStatus,
  pollRenderJob,
  saveProjectsToStorage,
  saveRenderNodeUrl,
  submitRenderJob,
} from './utils/renderNodeApi';

const APP_ICON_SRC = '/src/assets/images/hindi_video_studio_icon_1795527559448.jpg';

function createEmptySceneDrafts(count: number = DEFAULT_SCENE_SLOT_COUNT): SceneDraftInput[] {
  return Array.from({ length: count }, () => ({
    visualPrompt: '',
    voiceScript: '',
    screenText: '',
  }));
}

export default function App() {
  const [activeTab, setActiveTab] = useState<StudioTab>('studio');
  const [activeScreen, setActiveScreen] = useState<ActiveScreen>('dashboard');
  const [desktopViewMode, setDesktopViewMode] = useState<'split' | 'mobile'>('split');

  // Studio Form State (20 optional scene slots with visualPrompt + voiceScript)
  const [validationError, setValidationError] = useState<string | null>(null);
  const [selectedFormat, setSelectedFormat] = useState<VideoFormatOption>(VIDEO_FORMATS[0]);
  const [selectedVideoType, setSelectedVideoType] = useState<VideoTypeOption>(VIDEO_TYPES[0]);
  const [selectedStyle, setSelectedStyle] = useState<VideoStyleName>('Educational / Explainer');
  const [selectedVoice, setSelectedVoice] = useState<HindiVoiceOption>(HINDI_VOICES[0]);
  const [selectedScriptAi, setSelectedScriptAi] = useState<ScriptAiOption>(SCRIPT_AI_PROVIDERS[0]);
  const [sceneDrafts, setSceneDrafts] = useState<SceneDraftInput[]>(() =>
    createEmptySceneDrafts()
  );

  // Render Node State
  const [renderNode, setRenderNode] = useState<RenderNodeState>(() => ({
    endpointUrl: loadRenderNodeUrl(),
    status: 'offline',
    latencyMs: null,
    statusDetail: 'Not checked yet',
  }));
  const [isNodeModalOpen, setIsNodeModalOpen] = useState(false);
  const [isAndroidDrawerOpen, setIsAndroidDrawerOpen] = useState(false);

  // Library & Generation State
  const [libraryProjects, setLibraryProjects] = useState<VideoProject[]>(() => loadSavedProjects());
  const [librarySearch, setLibrarySearch] = useState('');
  const [libraryFilter, setLibraryFilter] = useState<LibraryFilter>('all');
  const [selectedPreviewProject, setSelectedPreviewProject] = useState<VideoProject | null>(null);
  const [generationState, setGenerationState] = useState<GenerationProgressState>({
    project: null,
    stageLabel: 'Waiting for Render Node',
    progressPercent: 0,
    isSubmitting: false,
    errorMessage: null,
  });

  const pollTimerRef = useRef<number | null>(null);

  const stopPolling = () => {
    if (pollTimerRef.current !== null) {
      window.clearInterval(pollTimerRef.current);
      pollTimerRef.current = null;
    }
  };

  const runHealthCheck = async (targetUrl: string) => {
    setRenderNode((prev) => ({
      ...prev,
      endpointUrl: targetUrl,
      status: 'checking',
      statusDetail: `Checking ${targetUrl}/api/health...`,
    }));
    const result = await checkRenderNodeHealth(targetUrl);
    setRenderNode({
      endpointUrl: targetUrl,
      status: result.online ? 'online' : 'offline',
      latencyMs: result.latencyMs,
      statusDetail: result.detail,
    });
  };

  useEffect(() => {
    void runHealthCheck(loadRenderNodeUrl());
    return () => stopPolling();
  }, []);

  const upsertProject = (project: VideoProject) => {
    setLibraryProjects((prev) => {
      const next = [project, ...prev.filter((item) => item.id !== project.id)];
      saveProjectsToStorage(next);
      return next;
    });
  };

  const handleSaveNodeUrlAndCheck = (url: string) => {
    saveRenderNodeUrl(url);
    void runHealthCheck(url);
  };

  const handleSceneVisualChange = (index: number, value: string) => {
    setSceneDrafts((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], visualPrompt: value };
      return next;
    });
    if (validationError) setValidationError(null);
  };

  const handleSceneVoiceChange = (index: number, value: string) => {
    setSceneDrafts((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], voiceScript: value };
      return next;
    });
    if (validationError) setValidationError(null);
  };

  const handleSceneScreenTextChange = (index: number, value: string) => {
    setSceneDrafts((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], screenText: value };
      return next;
    });
    if (validationError) setValidationError(null);
  };

  const handleAddSceneSlot = () => {
    setSceneDrafts((prev) => [...prev, { visualPrompt: '', voiceScript: '', screenText: '' }]);
  };

  const handleClearAllScenes = () => {
    setSceneDrafts(createEmptySceneDrafts(Math.max(DEFAULT_SCENE_SLOT_COUNT, sceneDrafts.length)));
    setValidationError(null);
  };

  const handleNewVideo = () => {
    stopPolling();
    setActiveTab('studio');
    setActiveScreen('dashboard');
    setValidationError(null);
    setSelectedFormat(VIDEO_FORMATS[0]);
    setSelectedVideoType(VIDEO_TYPES[0]);
    setSelectedStyle('Educational / Explainer');
    setSelectedVoice(HINDI_VOICES[0]);
    setSelectedScriptAi(SCRIPT_AI_PROVIDERS[0]);
    setSceneDrafts(createEmptySceneDrafts());
  };

  const handleGenerateClick = async () => {
    const activeDrafts = sceneDrafts.filter(
      (s) =>
        s.visualPrompt.trim().length > 0 ||
        s.voiceScript.trim().length > 0 ||
        s.screenText.trim().length > 0
    );

    if (activeDrafts.length === 0) {
      setValidationError(
        'कृपया कम से कम एक सीन में Visual Prompt, Voice-Over Script या On-Screen Text लिखें।'
      );
      return;
    }

    const hasAnyVoiceScript = activeDrafts.some((s) => s.voiceScript.trim().length > 0);
    if (!hasAnyVoiceScript) {
      setValidationError(
        'वीडियो में आवाज़ जोड़ने के लिए कम से कम एक सीन के नीचे Voice-Over Script जरूर लिखें।'
      );
      return;
    }

    setValidationError(null);

    const draftProject = createProjectRecord({
      sceneDrafts: activeDrafts,
      format: selectedFormat,
      videoType: selectedVideoType,
      style: selectedStyle,
      voice: selectedVoice,
      scriptAi: selectedScriptAi,
      status: 'local_draft',
    });

    // Persist immediately so the draft remains in Library even if Render is offline.
    upsertProject(draftProject);

    if (renderNode.status !== 'online') {
      setActiveScreen('progress');
      setGenerationState({
        project: draftProject,
        stageLabel: 'Render Node Offline — Backend Required for MP4 Synthesis',
        progressPercent: 0,
        isSubmitting: false,
        errorMessage: `Your configured Render Node (${renderNode.endpointUrl}) is offline: ${renderNode.statusDetail}.`,
      });
      return;
    }

    setActiveScreen('progress');
    setGenerationState({
      project: { ...draftProject, status: 'queued' },
      stageLabel: 'Submitting active scenes & Hindi voice job to Render Node...',
      progressPercent: 10,
      isSubmitting: true,
      errorMessage: null,
    });

    try {
      const remoteJob = await submitRenderJob(renderNode.endpointUrl, draftProject);
      const queuedProject: VideoProject = {
        ...draftProject,
        status: mapRemoteStatus(remoteJob.status),
        remoteJobId: remoteJob.jobId,
        mp4Url: remoteJob.mp4Url ?? null,
      };
      upsertProject(queuedProject);
      setGenerationState({
        project: queuedProject,
        stageLabel: remoteJob.stage,
        progressPercent: remoteJob.progress,
        isSubmitting: false,
        errorMessage: remoteJob.error ?? null,
      });

      stopPolling();
      pollTimerRef.current = window.setInterval(async () => {
        try {
          const updated = await pollRenderJob(renderNode.endpointUrl, remoteJob.jobId);
          const nextStatus = mapRemoteStatus(updated.status);
          const updatedProject: VideoProject = {
            ...queuedProject,
            status: nextStatus,
            mp4Url: updated.mp4Url ?? queuedProject.mp4Url,
          };
          upsertProject(updatedProject);
          setGenerationState({
            project: updatedProject,
            stageLabel: updated.stage,
            progressPercent: Math.min(100, Math.max(0, updated.progress)),
            isSubmitting: false,
            errorMessage: updated.error ?? null,
          });
          if (nextStatus === 'completed' || nextStatus === 'failed') {
            stopPolling();
          }
        } catch (err) {
          // A brief mobile-network interruption must not abandon an active render.
          setGenerationState((prev) => ({
            ...prev,
            stageLabel: 'Reconnecting to Render Server…',
            errorMessage:
              err instanceof Error ? `Connection retrying: ${err.message}` : 'Connection retrying…',
          }));
        }
      }, 1500);
    } catch (err) {
      setGenerationState({
        project: draftProject,
        stageLabel: 'Render Node Submission Failed',
        progressPercent: 0,
        isSubmitting: false,
        errorMessage:
          err instanceof Error ? err.message : 'Unable to reach Render Node /api/render',
      });
    }
  };

  const handleSaveCurrentDraft = () => {
    if (!generationState.project) return;
    upsertProject({ ...generationState.project, status: 'local_draft' });
    setActiveTab('library');
    setActiveScreen('dashboard');
  };

  const handleDeleteProject = (id: string) => {
    setLibraryProjects((prev) => {
      const next = prev.filter((p) => p.id !== id);
      saveProjectsToStorage(next);
      return next;
    });
    setSelectedPreviewProject(null);
    setActiveScreen('dashboard');
  };

  const handleEditInStudio = (project: VideoProject) => {
    setSelectedFormat(project.format);
    setSelectedVideoType(
      VIDEO_TYPES.find((vt) => vt.id === project.videoTypeId) ?? VIDEO_TYPES[0]
    );
    setSelectedStyle(project.style);
    setSelectedVoice(HINDI_VOICES.find((v) => v.id === project.voiceId) ?? HINDI_VOICES[0]);
    setSelectedScriptAi(
      SCRIPT_AI_PROVIDERS.find((a) => a.id === project.scriptAiId) ?? SCRIPT_AI_PROVIDERS[0]
    );
    const totalSlots = Math.max(DEFAULT_SCENE_SLOT_COUNT, project.scenes.length);
    setSceneDrafts(
      Array.from({ length: totalSlots }, (_, idx) => {
        const s = project.scenes[idx];
        return {
          visualPrompt: s?.visualPrompt ?? '',
          voiceScript: s?.voiceScript ?? s?.narrationPrompt ?? '',
          screenText: s?.screenText ?? '',
        };
      })
    );
    setSelectedPreviewProject(null);
    setActiveTab('studio');
    setActiveScreen('dashboard');
  };

  const liveStoryboard = buildSceneStoryboard(
    sceneDrafts,
    selectedFormat,
    selectedVideoType
  );

  const nodeDotColor =
    renderNode.status === 'online'
      ? 'bg-[#10B981]'
      : renderNode.status === 'checking'
      ? 'bg-[#3B82F6]'
      : 'bg-[#F59E0B]';

  const nodeTextLabel =
    renderNode.status === 'online'
      ? 'Online'
      : renderNode.status === 'checking'
      ? 'Checking'
      : 'Offline';

  const mainMobileContent = (
    <div className="flex flex-col">
      {/* App Header inside the Android surface */}
      <header className="border-b border-[#1E293B] bg-[#0A101F] px-4 pb-3 pt-3.5">
        <div className="flex items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2.5">
            <div className="h-9 w-9 shrink-0 overflow-hidden rounded-xl border border-[#1E293B] bg-[#081329]">
              <img
                src={APP_ICON_SRC}
                alt="Hindi Video Studio icon"
                referrerPolicy="no-referrer"
                className="h-full w-full scale-[1.18] object-cover"
              />
            </div>
            <span className="truncate text-base font-bold tracking-tight text-[#F8FAFC]">
              Hindi Video Studio
            </span>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={() => setIsNodeModalOpen(true)}
              className="flex min-h-[38px] items-center gap-1.5 rounded-xl border border-[#1E293B] bg-[#111A2E] px-2.5 text-xs font-medium text-[#F8FAFC] transition-colors hover:border-[#334155]"
              title="Configure self-hosted Render Node"
            >
              <span className={`h-2 w-2 rounded-full ${nodeDotColor}`} />
              <span className="whitespace-nowrap">Node: {nodeTextLabel}</span>
            </button>

            <button
              type="button"
              onClick={handleNewVideo}
              className="flex min-h-[38px] items-center gap-1 rounded-xl bg-[#2563EB] px-3 text-xs font-semibold text-white transition-colors hover:bg-[#1D4ED8]"
            >
              <Plus className="h-3.5 w-3.5" />
              <span className="whitespace-nowrap">New Video</span>
            </button>
          </div>
        </div>

        {/* Top Studio | Library Tab Switch */}
        <div className="mt-3 grid grid-cols-2 gap-1 rounded-xl border border-[#1E293B] bg-[#060913] p-1">
          <button
            type="button"
            onClick={() => {
              setActiveTab('studio');
              setActiveScreen('dashboard');
            }}
            className={`min-h-[40px] rounded-lg text-sm font-semibold transition-colors ${
              activeTab === 'studio'
                ? 'border border-[#3B82F6]/40 bg-[#16223B] text-[#F8FAFC]'
                : 'text-[#94A3B8] hover:text-white'
            }`}
          >
            Studio
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('library');
              setActiveScreen('dashboard');
            }}
            className={`min-h-[40px] rounded-lg text-sm font-semibold transition-colors ${
              activeTab === 'library'
                ? 'border border-[#3B82F6]/40 bg-[#16223B] text-[#F8FAFC]'
                : 'text-[#94A3B8] hover:text-white'
            }`}
          >
            Library
          </button>
        </div>
      </header>

      {/* Main Scrollable Screen Body */}
      <div className="p-4 sm:p-5">
        {activeScreen === 'dashboard' && activeTab === 'studio' && (
          <StudioDashboardView
            renderEndpointUrl={renderNode.endpointUrl}
            validationError={validationError}
            selectedFormat={selectedFormat}
            selectedVideoType={selectedVideoType}
            selectedStyle={selectedStyle}
            selectedVoice={selectedVoice}
            selectedScriptAi={selectedScriptAi}
            sceneDrafts={sceneDrafts}
            onSelectFormat={setSelectedFormat}
            onSelectVideoType={setSelectedVideoType}
            onSelectStyle={setSelectedStyle}
            onSelectVoice={setSelectedVoice}
            onSelectScriptAi={setSelectedScriptAi}
            onSceneVisualChange={handleSceneVisualChange}
            onSceneVoiceChange={handleSceneVoiceChange}
            onSceneScreenTextChange={handleSceneScreenTextChange}
            onAddSceneSlot={handleAddSceneSlot}
            onClearAllScenes={handleClearAllScenes}
            onGenerateClick={handleGenerateClick}
          />
        )}

        {activeScreen === 'dashboard' && activeTab === 'library' && (
          <LibraryView
            projects={libraryProjects}
            searchQuery={librarySearch}
            filter={libraryFilter}
            onSearchChange={setLibrarySearch}
            onFilterChange={setLibraryFilter}
            onSelectProject={(project) => {
              setSelectedPreviewProject(project);
              setActiveScreen('preview');
            }}
            onCreateNew={handleNewVideo}
          />
        )}

        {activeScreen === 'progress' && (
          <GenerationProgressView
            progressState={generationState}
            renderNode={renderNode}
            onConfigureNode={() => setIsNodeModalOpen(true)}
            onRetryPing={() => void runHealthCheck(renderNode.endpointUrl)}
            onSaveLocalDraft={handleSaveCurrentDraft}
            onOpenPreview={(project) => {
              setSelectedPreviewProject(project);
              setActiveScreen('preview');
            }}
            onBackToStudio={() => {
              stopPolling();
              setActiveScreen('dashboard');
            }}
          />
        )}

        {activeScreen === 'preview' && selectedPreviewProject && (
          <PreviewExportView
            project={selectedPreviewProject}
            onBack={() => setActiveScreen('dashboard')}
            onEditInStudio={handleEditInStudio}
            onDelete={handleDeleteProject}
          />
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#060913] text-[#F8FAFC]">
      {/* Desktop Workspace Bar */}
      <div className="hidden border-b border-[#1E293B] bg-[#080D1A] lg:block">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-8 px-6 py-3">
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-[#F8FAFC] whitespace-nowrap">
              Android Preview Workspace
            </span>
            <span className="text-xs text-[#64748B] whitespace-nowrap">
              Kotlin + Jetpack Compose APK Source + Live UI
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 rounded-xl border border-[#1E293B] bg-[#060913] p-1">
              <button
                type="button"
                onClick={() => setDesktopViewMode('split')}
                className={`flex min-h-[34px] items-center gap-1.5 rounded-lg px-3 text-xs font-medium whitespace-nowrap transition-colors ${
                  desktopViewMode === 'split'
                    ? 'bg-[#16223B] text-white'
                    : 'text-[#94A3B8] hover:text-white'
                }`}
              >
                <Monitor className="h-3.5 w-3.5" />
                <span>Studio Split</span>
              </button>
              <button
                type="button"
                onClick={() => setDesktopViewMode('mobile')}
                className={`flex min-h-[34px] items-center gap-1.5 rounded-lg px-3 text-xs font-medium whitespace-nowrap transition-colors ${
                  desktopViewMode === 'mobile'
                    ? 'bg-[#16223B] text-white'
                    : 'text-[#94A3B8] hover:text-white'
                }`}
              >
                <Smartphone className="h-3.5 w-3.5" />
                <span>Android Frame</span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => setIsAndroidDrawerOpen(true)}
              className="flex min-h-[38px] items-center gap-2 rounded-xl border border-[#2563EB]/50 bg-[#2563EB]/15 px-3.5 text-xs font-semibold text-[#60A5FA] whitespace-nowrap transition-colors hover:bg-[#2563EB]/25"
            >
              <Code2 className="h-4 w-4" />
              <span>Android Kotlin &amp; APK Source</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="mx-auto max-w-6xl lg:px-6 lg:py-6">
        <div className="lg:hidden">
          {mainMobileContent}
          <div className="px-4 pb-6">
            <button
              type="button"
              onClick={() => setIsAndroidDrawerOpen(true)}
              className="flex min-h-[46px] w-full items-center justify-center gap-2 rounded-xl border border-[#1E293B] bg-[#0A101F] px-4 text-xs font-semibold text-[#60A5FA]"
            >
              <Code2 className="h-4 w-4" />
              <span>Inspect &amp; Download Native Android Kotlin Project</span>
            </button>
          </div>
        </div>

        <div className="hidden lg:block">
          {desktopViewMode === 'mobile' ? (
            <div className="flex justify-center">
              <div className="w-[412px] overflow-hidden rounded-[34px] border-[6px] border-[#1E293B] bg-[#060913] shadow-2xl shadow-black/70">
                <div className="max-h-[820px] overflow-y-auto">{mainMobileContent}</div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-12 items-start gap-6">
              <div className="col-span-6 overflow-hidden rounded-3xl border border-[#1E293B] bg-[#060913] shadow-xl">
                {mainMobileContent}
              </div>

              <aside className="col-span-6 space-y-5">
                <div className="space-y-3 rounded-2xl border border-[#1E293B] bg-[#0A101F] p-5">
                  <div className="flex items-center justify-between gap-2 border-b border-[#1E293B] pb-3">
                    <div className="flex items-center gap-2.5">
                      <Layers className="h-4 w-4 text-[#3B82F6]" />
                      <h2 className="text-sm font-bold text-[#F8FAFC]">
                        Active Scene Storyboard Blueprint
                      </h2>
                    </div>
                    <span className="font-mono-tabular text-xs text-[#94A3B8]">
                      {selectedFormat.ratioLabel} · {liveStoryboard.length} active
                    </span>
                  </div>

                  {liveStoryboard.length === 0 ? (
                    <p className="py-4 text-center text-xs text-[#64748B]">
                      Fill any Scene Visual Prompt or Voice-Over Script on the left to preview your
                      active storyboard here.
                    </p>
                  ) : (
                    <div className="space-y-2.5">
                      {liveStoryboard.map((scene) => (
                        <div
                          key={scene.sceneNumber}
                          className="rounded-xl border border-[#1E293B] bg-[#111A2E] p-3"
                        >
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-mono-tabular font-semibold text-[#3B82F6]">
                              Scene {scene.sceneNumber}
                            </span>
                            <span className="font-mono-tabular text-[#64748B]">
                              {scene.durationSec}s
                            </span>
                          </div>
                          <div className="mt-1 text-xs font-medium text-[#F8FAFC]">
                            {scene.visualCue}
                          </div>
                          <div className="mt-0.5 text-xs text-[#94A3B8]">
                            {scene.narrationPrompt}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-3 rounded-2xl border border-[#1E293B] bg-[#0A101F] p-5">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <Server className="h-4 w-4 text-[#3B82F6]" />
                      <h2 className="text-sm font-bold text-[#F8FAFC]">
                        Render Node &amp; Native APK Readiness
                      </h2>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsNodeModalOpen(true)}
                      className="text-xs font-semibold text-[#3B82F6] hover:underline"
                    >
                      Configure Endpoint
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="rounded-xl border border-[#1E293B] bg-[#111A2E] p-3">
                      <div className="text-[#94A3B8]">Render Node Status</div>
                      <div
                        className={`mt-1 font-semibold ${
                          renderNode.status === 'online' ? 'text-[#10B981]' : 'text-[#F59E0B]'
                        }`}
                      >
                        {nodeTextLabel}
                      </div>
                      <div className="mt-0.5 truncate font-mono text-[11px] text-[#64748B]">
                        {renderNode.endpointUrl}
                      </div>
                    </div>

                    <div className="rounded-xl border border-[#1E293B] bg-[#111A2E] p-3">
                      <div className="text-[#94A3B8]">Android APK Target</div>
                      <div className="mt-1 font-semibold text-[#F8FAFC]">
                        Kotlin + Compose M3
                      </div>
                      <div className="font-mono-tabular mt-0.5 text-[11px] text-[#64748B]">
                        SDK 35 · Min 24 · Free Stack
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsAndroidDrawerOpen(true)}
                    className="flex min-h-[46px] w-full items-center justify-center gap-2 rounded-xl border border-[#1E293B] bg-[#111A2E] text-xs font-semibold text-[#F8FAFC] transition-colors hover:border-[#3B82F6]"
                  >
                    <Code2 className="h-4 w-4 text-[#3B82F6]" />
                    <span>Open Kotlin Source Explorer &amp; Download APK Project ZIP</span>
                  </button>
                </div>
              </aside>
            </div>
          )}
        </div>
      </main>

      <RenderNodeModal
        open={isNodeModalOpen}
        renderNode={renderNode}
        onSaveUrlAndCheck={handleSaveNodeUrlAndCheck}
        onClose={() => setIsNodeModalOpen(false)}
      />

      <AndroidProjectDrawer
        open={isAndroidDrawerOpen}
        onClose={() => setIsAndroidDrawerOpen(false)}
      />
    </div>
  );
}
