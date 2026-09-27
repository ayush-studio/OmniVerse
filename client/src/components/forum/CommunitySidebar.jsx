import { Plus, Users, Flame, ShieldAlert, Sparkles, HelpCircle } from 'lucide-react'
import { Button } from '@/components/ui'
import { COMMUNITY_CHANNELS } from '@/utils/cn'

export default function CommunitySidebar({
  activeChannel,
  onSelectChannel,
  onOpenCreateModal,
  trending = [],
  stats,
}) {
  return (
    <aside className="space-y-4">
      {/* About Community Card */}
      <div className="glass-card rounded-2xl p-5 border border-[var(--border)]">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-500 to-cyan-400 text-slate-950 flex items-center justify-center font-bold text-lg shadow-lg shadow-teal-500/20">
            Ω
          </div>
          <div>
            <h3 className="font-display font-bold text-base text-[var(--text)]">OmniCommunity</h3>
            <p className="text-xs text-[var(--text-muted)]">The entertainment town square</p>
          </div>
        </div>

        <p className="text-xs text-[var(--text-muted)] leading-relaxed mb-4">
          Ask questions, challenge hot takes, debate game lore, sports rivalries, album rankings, and movie theories with fellow fans.
        </p>

        <div className="grid grid-cols-2 gap-2 py-3 border-y border-[var(--border)] mb-4">
          <div>
            <div className="text-sm font-extrabold text-[var(--text)]">148.2k</div>
            <div className="text-[10px] text-[var(--text-muted)] flex items-center gap-1">
              <Users className="w-3 h-3 text-teal-400" /> Members
            </div>
          </div>
          <div>
            <div className="text-sm font-extrabold text-teal-400">3.4k</div>
            <div className="text-[10px] text-[var(--text-muted)] flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> Online Now
            </div>
          </div>
        </div>

        <Button
          onClick={onOpenCreateModal}
          className="w-full gap-2 shadow-lg shadow-teal-500/20 font-semibold"
        >
          <Plus className="w-4 h-4" /> Start Discussion / Ask
        </Button>
      </div>

      {/* Sub-Communities Channel Switcher */}
      <div className="glass-card rounded-2xl p-4 border border-[var(--border)]">
        <div className="flex items-center justify-between mb-3 px-1">
          <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Sub-Communities</h4>
          <span className="text-[10px] text-teal-400 font-semibold">Channels</span>
        </div>

        <div className="space-y-1">
          {COMMUNITY_CHANNELS.map((ch) => {
            const isActive = activeChannel === ch.key
            return (
              <button
                key={ch.key}
                type="button"
                onClick={() => onSelectChannel(ch.key)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition text-left ${
                  isActive
                    ? 'bg-teal-500/15 text-teal-300 border border-teal-500/30'
                    : 'text-[var(--text)] hover:bg-white/5 text-[var(--text-muted)] hover:text-[var(--text)]'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-teal-400' : 'bg-white/20'}`} />
                  <div>
                    <div className="font-semibold">{ch.sub}</div>
                    <div className="text-[10px] text-[var(--text-muted)] truncate max-w-[140px]">{ch.label}</div>
                  </div>
                </div>
                {isActive && <span className="text-[10px] bg-teal-400/20 text-teal-300 px-1.5 py-0.5 rounded">Active</span>}
              </button>
            )
          })}
        </div>
      </div>

      {/* Trending Debates Widget */}
      {trending.length > 0 && (
        <div className="glass-card rounded-2xl p-4 border border-[var(--border)]">
          <div className="flex items-center gap-1.5 mb-3 px-1 text-xs font-bold uppercase tracking-wider text-rose-400">
            <Flame className="w-4 h-4" />
            <span>Trending Debates</span>
          </div>

          <div className="space-y-2.5">
            {trending.slice(0, 4).map((item) => (
              <a
                key={item.id}
                href={`/forum/${item.id}`}
                className="block p-2 rounded-xl hover:bg-white/5 transition group"
              >
                <div className="text-xs font-medium text-[var(--text)] group-hover:text-teal-300 transition line-clamp-2">
                  {item.title}
                </div>
                <div className="flex items-center gap-2 text-[10px] text-[var(--text-muted)] mt-1">
                  <span>{item.upvotesCount - item.downvotesCount} votes</span>
                  <span>•</span>
                  <span>{item.commentCount || 0} comments</span>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Community Rules Card */}
      <div className="glass-card rounded-2xl p-4 border border-[var(--border)] text-xs text-[var(--text-muted)]">
        <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-[var(--text)] mb-2">
          <ShieldAlert className="w-4 h-4 text-amber-400" />
          <span>Community Rules</span>
        </div>
        <ol className="list-decimal list-inside space-y-1.5 text-[11px] text-[var(--text-muted)]">
          <li>Be civil and respectful during debates.</li>
          <li>Mark story spoilers using `&gt;!spoiler!&lt;` syntax.</li>
          <li>Choose accurate community channels and flairs.</li>
          <li>No spam, self-promotion, or abusive conduct.</li>
        </ol>
      </div>
    </aside>
  )
}
