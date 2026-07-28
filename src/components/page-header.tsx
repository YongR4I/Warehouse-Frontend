import type { IconType } from "react-icons"

interface BreadcrumbItem {
  label: string
  href?: string
}

interface PageHeaderProps {
  items: BreadcrumbItem[]
  title: string
  icon?: IconType
  description?: string
}

export function PageHeader({ items, title, icon: Icon, description }: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-2">
      <nav className="flex items-center gap-1.5 text-sm text-[#857F78]">
        {items.map((item, index) => (
          <span key={index} className="flex items-center gap-1.5 uppercase font-semibold">
            {index > 0 && <span className="text-[#857F78]"> &gt; </span>}
            {item.href ? (
              <a href={item.href} className="hover:text-foreground transition-colors">
                {item.label}
              </a>
            ) : (
              <span className="text-foreground">{item.label}</span>
            )}
          </span>
        ))}
      </nav>
      <div className="flex items-center gap-3">
        {Icon && <Icon className="max-sm:size-6 size-9 shrink-0 text-foreground" />}
        <h1 className="text-[clamp(20px,4vw,30px)] font-bold tracking-tight text-foreground">
          {title}
        </h1>
      </div>
      {description && (
        <p className="text-sm text-[#857F78]">
          {description}
        </p>
      )}
    </div>
  )
}