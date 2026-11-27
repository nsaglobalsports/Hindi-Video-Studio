import { useRef, useState } from 'react';
import { ArrowLeft, Check, Copy, Download, Edit3, Trash2, Volume2 } from 'lucide-react';
import { VideoProject } from '../types/studio';

interface PreviewExportViewProps {
  project: VideoProject;
  onBack: () => void;
  onEditInStudio: (project: VideoProject) => void;
  onDelete: (id: string) => void;
}

export function PreviewExportView({
  project,
  onBack,
  onEditInStudio,
  onDelete,
}: PreviewExportViewProps) {
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [downloadingMp4, setDownloadingMp4] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const hasRealMp4 = Boolean(project.mp4Url);
  const isVertical = project.format.id === 'shorts_9_16';
  const isSquare = project.format.id === 'square_1_1';

  const handlePlayWithSound = () => {
    const el = videoRef.current;
    if (!el) return;
    el.muted = false;
    el.volume = 1.0;
    void el.play().catch(() => {
      // Browser autoplay interaction already triggered on click
    });
  };

  const handleDownloadMp4 = async () => {
    if (!project.mp4Url) return;
    setDownloadingMp4(true);
    setDownloadError(null);
    try {
      const sep = project.mp4Url.includes('?') ? '&' : '?';
      const res = await fetch(`${project.mp4Url}${sep}download=1`);
      const contentType = res.headers.get('content-type') || '';
      if (!res.ok || !contentType.includes('video')) {
        setDownloadError(
          'This MP4 file is no longer cached on the server. Click Edit and re-render to generate a fresh downloadable MP4.'
        );
        return;
      }
      const blob = await res.blob();
      if (blob.size < 2000) {
        setDownloadError('Downloaded video stream was empty. Please re-render this project.');
        return;
      }
      const blobUrl = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = blobUrl;
      anchor.download = `hindi-video-${project.id.slice(0, 8)}.mp4`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.setTimeout(() => URL.revokeObjectURL(blobUrl), 3000);
    } catch {
      setDownloadError('Unable to download MP4 right now. Please verify the Render Node is online.');
    } finally {
      setDownloadingMp4(false);
    }
  };


  const handleDownloadThumbnail = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 1280;
    canvas.height = 720;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const gradient = ctx.createLinearGradient(0, 0, 1280, 720);
    gradient.addColorStop(0, '#061A3A');
    gradient.addColorStop(0.55, '#064992');
    gradient.addColorStop(1, '#071126');
    ctx.fillStyle = gradient; ctx.fillRect(0, 0, 1280, 720);
    ctx.fillStyle = '#FFC928'; ctx.fillRect(0, 0, 1280, 18);
    ctx.fillStyle = '#FFFFFF'; ctx.font = 'bold 34px sans-serif'; ctx.fillText('DISHA MANCH', 64, 90);
    const title = (project.topicPrompt || 'हिंदी वीडियो').replace(/\s+/g, ' ').trim();
    const words = title.split(' '); let lines: string[] = []; let line = '';
    for (const word of words) { const candidate = line ? `${line} ${word}` : word; if (ctx.measureText(candidate).width > 1120 && line) { lines.push(line); line = word; } else line = candidate; }
    if (line) lines.push(line);
    ctx.font = 'bold 76px sans-serif'; ctx.fillStyle = '#FFC928';
    lines.slice(0, 3).forEach((item, index) => ctx.fillText(item, 64, 270 + index * 100));
    ctx.fillStyle = '#FFFFFF'; ctx.font = 'bold 28px sans-serif'; ctx.fillText(`${project.format.ratioLabel}  •  ${project.sceneCount} SCENES`, 66, 650);
    ctx.fillStyle = '#F97316'; ctx.fillRect(0, 700, 1280, 20);
    canvas.toBlob((blob) => { if (!blob) return; const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = `hvs-thumbnail-${project.id.slice(0, 8)}.png`; a.click(); URL.revokeObjectURL(url); }, 'image/png');
  };

  const handleDownloadJson = () => {
    const jsonString = JSON.stringify(project, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hindi-video-spec-${project.id.slice(0, 8)}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const handleCopyPrompt = async () => {
    try {
      const summary = project.scenes
        .map(
          (s) =>
            `Scene ${s.sceneNumber}:\nVisual: ${s.visualPrompt}\nVoice: ${s.voiceScript}${
              s.screenText ? `\nScreen Text: ${s.screenText}` : ''
            }`
        )
        .join('\n\n');
      await navigator.clipboard.writeText(summary || project.topicPrompt);
      setCopiedPrompt(true);
      window.setTimeout(() => setCopiedPrompt(false), 1800);
    } catch {
      // Clipboard fallback ignored cleanly
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-bold text-[#F8FAFC]">MP4 Preview &amp; Export</h2>
        <button
          type="button"
          onClick={onBack}
          className="flex min-h-[40px] items-center gap-1.5 rounded-xl border border-[#1E293B] bg-[#111A2E] px-3 text-xs font-medium text-[#CBD5E1] hover:text-white"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Library</span>
        </button>
      </div>

      {/* Video Player or Honest Pending Render Frame */}
      {hasRealMp4 && project.mp4Url ? (
        <div className="space-y-3 rounded-2xl border border-[#1E293B] bg-[#111A2E] p-4">
          <div className="flex justify-center">
            <video
              ref={videoRef}
              controls
              playsInline
              preload="auto"
              src={project.mp4Url}
              onLoadedMetadata={(e) => {
                e.currentTarget.muted = false;
                e.currentTarget.volume = 1.0;
              }}
              className={`rounded-xl bg-black ${
                isVertical ? 'aspect-[9/16] max-h-[440px]' : isSquare ? 'aspect-square max-h-[440px]' : 'aspect-video w-full'
              }`}
            />
          </div>

          <button
            type="button"
            onClick={handlePlayWithSound}
            className="flex min-h-[42px] w-full items-center justify-center gap-2 rounded-xl border border-[#3B82F6]/40 bg-[#2563EB]/15 px-4 text-xs font-semibold text-[#60A5FA] hover:bg-[#2563EB]/25"
          >
            <Volume2 className="h-4 w-4" />
            <span>Play Video With Sound (आवाज़ के साथ चलाएँ)</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadMp4}
            disabled={downloadingMp4}
            className="flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl bg-[#F97316] px-4 text-sm font-bold text-white hover:bg-[#EA580C] disabled:opacity-60"
          >
            <Download className="h-4 w-4" />
            <span>
              {downloadingMp4
                ? 'Preparing MP4 Download...'
                : `Download MP4 (${project.format.resolution})`}
            </span>
          </button>
          {downloadError && (
            <p className="text-xs leading-relaxed text-[#F59E0B]">{downloadError}</p>
          )}
        </div>
      ) : (
        <div className="space-y-3 rounded-2xl border border-[#1E293B] bg-[#111A2E] p-4">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-[#F59E0B]">MP4 Preview Pending Render Node</span>
            <span className="font-mono-tabular text-[#94A3B8]">
              {project.format.ratioLabel} · {project.format.resolution}
            </span>
          </div>
          <p className="text-xs leading-relaxed text-[#94A3B8]">
            This item is stored as a local script draft. Connect a self-hosted Render Node to
            synthesize Hindi narration audio and export a real playable MP4 file.
          </p>
        </div>
      )}

      {/* Scene-by-Scene Storyboard */}
      <div className="space-y-2.5 rounded-2xl border border-[#1E293B] bg-[#111A2E] p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-sm font-semibold text-[#F8FAFC]">
            Scene Storyboard ({project.sceneCount} Scenes)
          </h3>
          <span className="text-xs text-[#94A3B8]">
            {project.videoTypeLabel || '3D Realistic Graphics Motion'}
          </span>
        </div>

        <div className="space-y-2">
          {project.scenes.map((scene) => (
            <div
              key={scene.sceneNumber}
              className="space-y-1 rounded-xl border border-[#1E293B] bg-[#070C1A] p-3"
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono-tabular font-semibold text-[#3B82F6]">
                  Scene {scene.sceneNumber}
                </span>
                <span className="font-mono-tabular text-[#64748B]">{scene.durationSec}s</span>
              </div>
              {scene.visualPrompt && (
                <div className="text-xs font-medium text-[#F8FAFC]">
                  Visual: {scene.visualPrompt}
                </div>
              )}
              <div className="text-xs text-[#94A3B8]">
                Voice: {scene.voiceScript || scene.narrationPrompt}
              </div>
              {scene.screenText && (
                <div className="text-xs text-[#10B981]">Screen Text: {scene.screenText}</div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Export & Management Actions */}
      <div className="space-y-2.5">
        <button
          type="button"
          onClick={handleDownloadThumbnail}
          className="flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl border border-[#F97316]/50 bg-[#F97316]/10 px-4 text-sm font-semibold text-[#FDBA74] hover:bg-[#F97316]/20"
        >
          <span>Generate &amp; Download Thumbnail (PNG)</span>
        </button>

        <button
          type="button"
          onClick={handleDownloadJson}
          className="flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl bg-[#2563EB] px-4 text-sm font-semibold text-white hover:bg-[#1D4ED8]"
        >
          <Download className="h-4 w-4" />
          <span>Export Production Spec (.json)</span>
        </button>

        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={handleCopyPrompt}
            className="flex min-h-[44px] items-center justify-center gap-1.5 rounded-xl border border-[#1E293B] bg-[#111A2E] px-2 text-xs font-medium text-[#F8FAFC] hover:border-[#334155]"
          >
            {copiedPrompt ? (
              <Check className="h-3.5 w-3.5 text-[#10B981]" />
            ) : (
              <Copy className="h-3.5 w-3.5 text-[#94A3B8]" />
            )}
            <span>{copiedPrompt ? 'Copied' : 'Copy'}</span>
          </button>

          <button
            type="button"
            onClick={() => onEditInStudio(project)}
            className="flex min-h-[44px] items-center justify-center gap-1.5 rounded-xl border border-[#1E293B] bg-[#111A2E] px-2 text-xs font-medium text-[#F8FAFC] hover:border-[#334155]"
          >
            <Edit3 className="h-3.5 w-3.5 text-[#3B82F6]" />
            <span>Edit</span>
          </button>

          <button
            type="button"
            onClick={() => onDelete(project.id)}
            className="flex min-h-[44px] items-center justify-center gap-1.5 rounded-xl border border-[#1E293B] bg-[#111A2E] px-2 text-xs font-medium text-[#EF4444] hover:border-[#EF4444]/50"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>Delete</span>
          </button>
        </div>
      </div>
    </div>
  );
}
