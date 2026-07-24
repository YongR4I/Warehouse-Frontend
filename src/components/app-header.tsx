import { BiCog } from "react-icons/bi"

export function AppHeader() {
  return (
    <header className="flex h-16 w-full shrink-0 items-center justify-end border-b border-border/40 bg-white pl-6">
      <div className="flex items-center gap-3 rounded-l-xl border border-r-0 border-border/50 bg-white px-4 py-1.5 shadow-sm">
        <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-tl from-[#ffffff] from-[#93cce8] via-[#0063b5] to-[#cbf9ff] text-[12px] font-semibold tracking-tight text-white shadow-xs">
          AU
        </div>
        <div className="flex min-w-0 flex-col leading-tight">
          <span className="truncate text-[13px] font-semibold text-foreground">
            Admin User
          </span>
          <span className="truncate text-[11px] text-muted-foreground">
            Warehouse Manager
          </span>
        </div>
        <button
          className="flex size-7 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground active:scale-[0.96]"
          aria-label="Settings"
        >
          <BiCog className="!size-[16px]" />
        </button>
      </div>
    </header>
  )
}