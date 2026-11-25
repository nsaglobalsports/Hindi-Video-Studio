import { useEffect, useState } from 'react';
import { RefreshCw, Server, X } from 'lucide-react';
import { RenderNodeState } from '../types/studio';
import { getBuiltInRenderNodeUrl } from '../utils/renderNodeApi';

interface RenderNodeModalProps {
  open: boolean;
  renderNode: RenderNodeState;
  onSaveUrlAndCheck: (url: string) => void;
  onClose: () => void;
}

export function RenderNodeModal({
  open,
  renderNode,
  onSaveUrlAndCheck,
  onClose,
}: RenderNodeModalProps) {
  const [draftUrl, setDraftUrl] = useState(renderNode.endpointUrl);

  useEffect(() => {
    if (open) {
      setDraftUrl(renderNode.endpointUrl);
    }
  }, [open, renderNode.endpointUrl]);

  if (!open) return null;

  const builtInUrl = getBuiltInRenderNodeUrl();

  const statusTone =
    renderNode.status === 'online'
      ? 'text-[#10B981]'
      : renderNode.status === 'checking'
      ? 'text-[#3B82F6]'
      : 'text-[#F59E0B]';

  const statusLabel =
    renderNode.status === 'online'
      ? 'Online'
      : renderNode.status === 'checking'
      ? 'Checking'
      : 'Offline';

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-0 backdrop-blur-sm sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="render-node-title"
    >
      <div className="w-full max-w-lg rounded-t-3xl border border-[#1E293B] bg-[#0E1629] p-5 shadow-2xl sm:rounded-2xl sm:p-6">
        <div className="flex items-start justify-between gap-4 border-b border-[#1E293B] pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#16223B] text-[#3B82F6]">
              <Server className="h-5 w-5" />
            </div>
            <div>
              <h2 id="render-node-title" className="text-base font-bold text-[#F8FAFC]">
                Self-Hosted Render Node
              </h2>
              <p className="text-xs text-[#94A3B8]">
                Connected to built-in FFmpeg Render Node or any custom URL
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close Render Node settings"
            className="flex h-10 w-10 items-center justify-center rounded-xl text-[#94A3B8] transition-colors hover:bg-[#16223B] hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-4 space-y-4">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between gap-2">
              <label htmlFor="node-url-input" className="text-xs font-medium text-[#94A3B8]">
                Render Node Endpoint URL
              </label>
              {draftUrl !== builtInUrl && (
                <button
                  type="button"
                  onClick={() => {
                    setDraftUrl(builtInUrl);
                    onSaveUrlAndCheck(builtInUrl);
                  }}
                  className="text-xs font-semibold text-[#3B82F6] hover:underline"
                >
                  Use Built-In Node
                </button>
              )}
            </div>
            <input
              id="node-url-input"
              type="url"
              value={draftUrl}
              onChange={(e) => setDraftUrl(e.target.value)}
              placeholder={builtInUrl}
              className="font-mono-tabular min-h-[46px] w-full rounded-xl border border-[#1E293B] bg-[#060913] px-3.5 text-sm text-[#F8FAFC] placeholder-[#475569] focus:border-[#3B82F6] focus:outline-none"
            />
          </div>

          <div className="space-y-1.5 rounded-xl border border-[#1E293B] bg-[#060913] p-3.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#94A3B8]">Connection State</span>
              <span className={`font-semibold ${statusTone}`}>{statusLabel}</span>
            </div>
            <p className="text-xs leading-relaxed text-[#CBD5E1]">{renderNode.statusDetail}</p>
            <p className="font-mono-tabular pt-1 text-[11px] text-[#64748B]">
              Endpoints: GET /api/health · POST /api/render · GET /api/jobs/:id
            </p>
          </div>

          <div className="rounded-xl border border-[#1E293B] bg-[#0A101F] p-3.5 text-xs leading-relaxed text-[#94A3B8]">
            The built-in FFmpeg Render Node renders real H.264 MP4 scenes with{' '}
            <code className="text-[#CBD5E1]">Noto Sans Devanagari</code> typography, or you can
            point this URL to your own LAN/self-hosted node.
          </div>

          <div className="flex items-center gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="min-h-[46px] flex-1 rounded-xl border border-[#1E293B] bg-transparent px-4 text-sm font-medium text-[#CBD5E1] transition-colors hover:bg-[#16223B]"
            >
              Close
            </button>
            <button
              type="button"
              onClick={() => onSaveUrlAndCheck(draftUrl)}
              className="flex min-h-[46px] flex-1 items-center justify-center gap-2 rounded-xl bg-[#2563EB] px-4 text-sm font-semibold text-white transition-colors hover:bg-[#1D4ED8]"
            >
              <RefreshCw
                className={`h-4 w-4 ${renderNode.status === 'checking' ? 'animate-spin' : ''}`}
              />
              <span className="whitespace-nowrap">Test Connection</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
