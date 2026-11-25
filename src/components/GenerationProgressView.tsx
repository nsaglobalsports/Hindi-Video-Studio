import { ArrowLeft, RefreshCw, Save, Server, Video } from 'lucide-react';
import {
  GenerationProgressState,
  RenderNodeState,
  VideoProject,
} from '../types/studio';

interface GenerationProgressViewProps {
  progressState: GenerationProgressState;
  renderNode: RenderNodeState;
  onConfigureNode: () => void;
  onRetryPing: () => void;
  onSaveLocalDraft: () => void;
  onOpenPreview: (project: VideoProject) => void;
  onBackToStudio: () => void;
}

export function GenerationProgressView({
  progressState,
  renderNode,
  onConfigureNode,
  onRetryPing,
  onSaveLocalDraft,
  onOpenPreview,
  onBackToStudio,
}: GenerationProgressViewProps) {
  const project = progressState.project;
  const isOffline = renderNode.status !== 'online';
  const isCompleted = project?.status === 'completed' && Boolean(project.mp4Url);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-bold text-[#F8FAFC]">
          {isOffline ? 'Backend Integration Required' : 'Video Generation Progress'}
        </h2>
        <button
          type="button"
          onClick={onBackToStudio}
          className="flex min-h-[40px] items-center gap-1.5 rounded-xl border border-[#1E293B] bg-[#111A2E] px-3 text-xs font-medium text-[#CBD5E1] hover:border-[#334155] hover:text-white"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span className="whitespace-nowrap">Back to Studio</span>
        </button>
      </div>

      {/* Status Card */}
      <div className="space-y-3 rounded-2xl border border-[#1E293B] bg-[#111A2E] p-4">
        <div className="flex items-center justify-between gap-2">
          <span
            className={`text-sm font-semibold ${
              isOffline
                ? 'text-[#F59E0B]'
                : isCompleted
                ? 'text-[#10B981]'
                : 'text-[#3B82F6]'
            }`}
          >
            {progressState.stageLabel}
          </span>
          {!isOffline && (
            <span className="font-mono-tabular text-xs font-semibold text-[#F8FAFC]">
              {progressState.progressPercent}%
            </span>
          )}
        </div>

        {!isOffline && (
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-[#060913]">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#2563EB] to-[#F97316] transition-all duration-300"
              style={{ width: `${progressState.progressPercent}%` }}
            />
          </div>
        )}

        {progressState.errorMessage && (
          <p className="text-xs leading-relaxed text-[#94A3B8]">
            {progressState.errorMessage}
          </p>
        )}

        {isOffline && (
          <div className="rounded-xl border border-[#1E293B] bg-[#070C1A] p-3 text-xs leading-relaxed text-[#CBD5E1]">
            Hindi Video Studio does not simulate fake progress bars or generate placeholder MP4
            files. Connect a self-hosted Render Node (<code className="text-[#3B82F6]">POST /api/render</code>)
            for real video synthesis, or save this structured script draft locally to your Library.
          </div>
        )}
      </div>

      {/* Spec Summary */}
      {project && (
        <div className="space-y-2 rounded-2xl border border-[#1E293B] bg-[#111A2E] p-4">
          <div className="text-xs font-semibold text-[#94A3B8]">Production Spec</div>
          <p className="text-sm font-medium leading-relaxed text-[#F8FAFC]">
            {project.topicPrompt}
          </p>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-[#94A3B8]">
            <span>{project.format.title} ({project.format.ratioLabel})</span>
            <span aria-hidden="true">·</span>
            <span>{project.style}</span>
            <span aria-hidden="true">·</span>
            <span>{project.voiceLabel}</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono-tabular">{project.sceneCount} scenes</span>
          </div>
        </div>
      )}

      {/* Actions */}
      {isOffline ? (
        <div className="space-y-2.5">
          <button
            type="button"
            onClick={onSaveLocalDraft}
            className="flex min-h-[50px] w-full items-center justify-center gap-2 rounded-xl bg-[#F97316] px-4 text-sm font-bold text-white transition-colors hover:bg-[#EA580C]"
          >
            <Save className="h-4 w-4" />
            <span>Save Script Draft to Library</span>
          </button>

          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={onConfigureNode}
              className="flex min-h-[46px] items-center justify-center gap-2 rounded-xl border border-[#1E293B] bg-[#111A2E] px-3 text-xs font-semibold text-[#F8FAFC] hover:border-[#3B82F6]"
            >
              <Server className="h-4 w-4 text-[#3B82F6]" />
              <span>Configure Node</span>
            </button>
            <button
              type="button"
              onClick={onRetryPing}
              className="flex min-h-[46px] items-center justify-center gap-2 rounded-xl border border-[#1E293B] bg-[#111A2E] px-3 text-xs font-semibold text-[#F8FAFC] hover:border-[#3B82F6]"
            >
              <RefreshCw
                className={`h-4 w-4 text-[#3B82F6] ${
                  renderNode.status === 'checking' ? 'animate-spin' : ''
                }`}
              />
              <span>Retry Ping</span>
            </button>
          </div>
        </div>
      ) : (
        isCompleted &&
        project && (
          <button
            type="button"
            onClick={() => onOpenPreview(project)}
            className="flex min-h-[50px] w-full items-center justify-center gap-2 rounded-xl bg-[#F97316] px-4 text-sm font-bold text-white transition-colors hover:bg-[#EA580C]"
          >
            <Video className="h-4 w-4" />
            <span>Open MP4 Preview & Export</span>
          </button>
        )
      )}
    </div>
  );
}
