import { useState } from 'react';
import JSZip from 'jszip';
import { Check, Copy, Download, FileCode2, FolderArchive, Terminal, X } from 'lucide-react';
import { ANDROID_PROJECT_FILES } from '../data/androidProjectFiles';

interface AndroidProjectDrawerProps {
  open: boolean;
  onClose: () => void;
}

export function AndroidProjectDrawer({ open, onClose }: AndroidProjectDrawerProps) {
  const [selectedPath, setSelectedPath] = useState(
    'app/src/main/java/com/hindivideostudio/app/MainActivity.kt'
  );
  const [downloading, setDownloading] = useState(false);
  const [copiedFile, setCopiedFile] = useState(false);

  if (!open) return null;

  const activeFile =
    ANDROID_PROJECT_FILES.find((file) => file.path === selectedPath) ?? ANDROID_PROJECT_FILES[0];

  const handleDownloadZip = async () => {
    setDownloading(true);
    try {
      const zip = new JSZip();
      const root = zip.folder('HindiVideoStudio-Android');
      if (root) {
        ANDROID_PROJECT_FILES.forEach((file) => {
          root.file(file.path, file.content);
        });
      }
      const blob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = 'HindiVideoStudio-Android-Kotlin.zip';
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
    } finally {
      setDownloading(false);
    }
  };

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(activeFile.content);
      setCopiedFile(true);
      window.setTimeout(() => setCopiedFile(false), 1800);
    } catch {
      // Clipboard fallback ignored cleanly
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-2 backdrop-blur-sm sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="android-project-title"
    >
      <div className="flex h-[90vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl border border-[#1E293B] bg-[#0A101F] shadow-2xl">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#1E293B] bg-[#0E1629] px-4 py-3.5 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#2563EB]/20 text-[#3B82F6]">
              <FolderArchive className="h-5 w-5" />
            </div>
            <div>
              <h2 id="android-project-title" className="text-base font-bold text-[#F8FAFC]">
                Native Android Kotlin & Jetpack Compose Project
              </h2>
              <p className="text-xs text-[#94A3B8]">
                {ANDROID_PROJECT_FILES.length} Gradle & Kotlin source files · Compile SDK 35 · APK-ready structure
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={handleDownloadZip}
              disabled={downloading}
              className="flex min-h-[42px] items-center gap-2 rounded-xl bg-[#F97316] px-4 text-xs font-bold text-white transition-colors hover:bg-[#EA580C] disabled:opacity-60"
            >
              <Download className="h-4 w-4" />
              <span className="whitespace-nowrap">
                {downloading ? 'Packaging ZIP...' : 'Download Android ZIP'}
              </span>
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close Android source explorer"
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#1E293B] text-[#94A3B8] hover:bg-[#16223B] hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="grid min-h-0 flex-1 grid-cols-1 md:grid-cols-[290px_1fr]">
          {/* File list */}
          <div className="overflow-y-auto border-b border-[#1E293B] bg-[#070B16] p-3 md:border-b-0 md:border-r">
            <div className="mb-2 flex items-center gap-2 px-2 text-xs font-semibold text-[#94A3B8]">
              <Terminal className="h-3.5 w-3.5 text-[#3B82F6]" />
              <span>APK Build: ./gradlew assembleDebug</span>
            </div>
            <div className="space-y-1">
              {ANDROID_PROJECT_FILES.map((file) => {
                const isSelected = file.path === activeFile.path;
                const shortName = file.path.split('/').pop() ?? file.path;
                const folderHint = file.path.includes('/')
                  ? file.path.slice(0, file.path.lastIndexOf('/'))
                  : 'root';
                return (
                  <button
                    key={file.path}
                    type="button"
                    onClick={() => setSelectedPath(file.path)}
                    className={`flex w-full items-start gap-2.5 rounded-lg px-2.5 py-2 text-left transition-colors ${
                      isSelected
                        ? 'bg-[#2563EB]/20 text-white'
                        : 'text-[#94A3B8] hover:bg-[#111A2E] hover:text-[#E2E8F0]'
                    }`}
                  >
                    <FileCode2
                      className={`mt-0.5 h-4 w-4 shrink-0 ${
                        isSelected ? 'text-[#3B82F6]' : 'text-[#64748B]'
                      }`}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-xs font-medium">{shortName}</div>
                      <div className="truncate font-mono text-[10px] text-[#64748B]">
                        {folderHint}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Code preview */}
          <div className="flex min-h-0 flex-col bg-[#060913]">
            <div className="flex items-center justify-between gap-3 border-b border-[#1E293B] px-4 py-2.5">
              <span className="truncate font-mono text-xs text-[#CBD5E1]">{activeFile.path}</span>
              <button
                type="button"
                onClick={handleCopyCode}
                className="flex min-h-[34px] shrink-0 items-center gap-1.5 rounded-lg border border-[#1E293B] bg-[#111A2E] px-3 text-xs font-medium text-[#E2E8F0] hover:border-[#3B82F6]"
              >
                {copiedFile ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-[#10B981]" />
                    <span>Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>

            <pre className="min-h-0 flex-1 overflow-auto p-4 font-mono text-xs leading-relaxed text-[#E2E8F0]">
              <code>{activeFile.content}</code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
