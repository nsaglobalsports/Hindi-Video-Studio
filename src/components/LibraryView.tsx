import { ChevronRight, Film, Plus, Search } from 'lucide-react';
import { VideoProject } from '../types/studio';

export type LibraryFilter = 'all' | 'rendered' | 'drafts';

interface LibraryViewProps {
  projects: VideoProject[];
  searchQuery: string;
  filter: LibraryFilter;
  onSearchChange: (q: string) => void;
  onFilterChange: (filter: LibraryFilter) => void;
  onSelectProject: (project: VideoProject) => void;
  onCreateNew: () => void;
}

export function LibraryView({
  projects,
  searchQuery,
  filter,
  onSearchChange,
  onFilterChange,
  onSelectProject,
  onCreateNew,
}: LibraryViewProps) {
  const filtered = projects.filter((project) => {
    const matchesFilter =
      filter === 'all'
        ? true
        : filter === 'rendered'
        ? project.status === 'completed' && Boolean(project.mp4Url)
        : project.status === 'local_draft';

    const q = searchQuery.trim().toLowerCase();
    const matchesSearch =
      q.length === 0 ||
      project.topicPrompt.toLowerCase().includes(q) ||
      project.style.toLowerCase().includes(q) ||
      project.voiceLabel.toLowerCase().includes(q);

    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h2 className="text-lg font-bold text-[#F8FAFC]">Production Library</h2>
          <p className="text-xs text-[#94A3B8]">
            Saved local script drafts and rendered Render Node MP4 history
          </p>
        </div>
        <span className="font-mono-tabular text-xs font-medium text-[#94A3B8]">
          {projects.length} total
        </span>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#64748B]" />
        <input
          type="search"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search Hindi prompts, styles, or voices..."
          className="min-h-[46px] w-full rounded-xl border border-[#1E293B] bg-[#111A2E] pl-10 pr-3.5 text-sm text-[#F8FAFC] placeholder-[#475569] focus:border-[#3B82F6] focus:outline-none"
        />
      </div>

      {/* Filter buttons */}
      <div className="flex items-center gap-2">
        {(
          [
            { key: 'all', label: 'All' },
            { key: 'rendered', label: 'Rendered MP4' },
            { key: 'drafts', label: 'Local Drafts' },
          ] as { key: LibraryFilter; label: string }[]
        ).map((item) => {
          const active = filter === item.key;
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => onFilterChange(item.key)}
              className={`min-h-[40px] rounded-xl border px-3.5 text-xs font-semibold whitespace-nowrap transition-colors ${
                active
                  ? 'border-[#3B82F6] bg-[#2563EB] text-white'
                  : 'border-[#1E293B] bg-[#111A2E] text-[#94A3B8] hover:text-white'
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </div>

      {/* Empty state or list */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-[#1E293B] bg-[#111A2E] px-6 py-10 text-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#16223B] text-[#3B82F6]">
            <Film className="h-6 w-6" />
          </div>
          <h3 className="text-base font-semibold text-[#F8FAFC]">
            {projects.length === 0 ? 'No saved projects yet' : 'No matching projects'}
          </h3>
          <p className="mt-1 max-w-xs text-xs leading-relaxed text-[#94A3B8]">
            {projects.length === 0
              ? 'Draft a Hindi video in Studio or connect a Render Node to save generated MP4 history here.'
              : 'Try clearing your search filter or create a fresh video draft.'}
          </p>
          <button
            type="button"
            onClick={onCreateNew}
            className="mt-4 flex min-h-[44px] items-center gap-2 rounded-xl bg-[#F97316] px-4 text-xs font-bold text-white hover:bg-[#EA580C]"
          >
            <Plus className="h-4 w-4" />
            <span>Create First Video</span>
          </button>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filtered.map((project) => {
            const isRendered = project.status === 'completed' && Boolean(project.mp4Url);
            const statusText = isRendered
              ? 'Rendered MP4 Ready'
              : project.status === 'failed'
              ? 'Render Failed'
              : 'Local Draft · Needs Render Node';
            const statusColor = isRendered
              ? 'text-[#10B981]'
              : project.status === 'failed'
              ? 'text-[#EF4444]'
              : 'text-[#F59E0B]';

            return (
              <button
                key={project.id}
                type="button"
                onClick={() => onSelectProject(project)}
                className="flex w-full items-center justify-between gap-3 rounded-2xl border border-[#1E293B] bg-[#111A2E] p-4 text-left transition-colors hover:border-[#334155]"
              >
                <div className="min-w-0 flex-1 space-y-1.5">
                  <div className="line-clamp-2 text-sm font-semibold text-[#F8FAFC]">
                    {project.topicPrompt}
                  </div>
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-[#94A3B8]">
                    <span className="font-mono-tabular">{project.format.ratioLabel}</span>
                    <span aria-hidden="true">·</span>
                    <span>{project.style}</span>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono-tabular">{project.sceneCount} scenes</span>
                    <span aria-hidden="true">·</span>
                    <span>{project.createdAtIso}</span>
                  </div>
                  <div className={`text-xs font-medium ${statusColor}`}>{statusText}</div>
                </div>
                <ChevronRight className="h-5 w-5 shrink-0 text-[#64748B]" />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
