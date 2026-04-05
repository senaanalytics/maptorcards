'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'

const navItems = [
  { section: 'Menu' },
  { label: 'Dashboard', icon: 'dashboard', href: '/dashboard' },
  { label: 'Biblioteca', icon: 'library', href: '/biblioteca', chip: { text: '12', type: 'count' } },
  { label: 'Meus Cards', icon: 'cards', href: '/cards' },
  { label: 'Progresso', icon: 'progress', href: '/progresso' },
  { section: 'Estudar' },
  { label: 'Revisão', icon: 'review', href: '/revisao' },
  { label: 'Criar Card', icon: 'create', href: '/criar' },
  { section: 'Premium' },
  { label: 'Upload de Código', icon: 'upload', href: '/upload', chip: { text: 'PRO', type: 'pro' } },
  { divider: true },
  { label: 'Perfil', icon: 'profile', href: '/perfil' },
]

const icons: Record<string, string> = {
  dashboard: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>`,
  library: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>`,
  cards: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="3"/><line x1="9" y1="4" x2="9" y2="20"/></svg>`,
  progress: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>`,
  review: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>`,
  create: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>`,
  upload: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>`,
  profile: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`,
}

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="sidebar">
      <div className="logo">
        <div className="logo-mark">
          <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="4" width="20" height="16" rx="3"/>
            <line x1="9" y1="4" x2="9" y2="20"/>
            <line x1="15" y1="11" x2="9" y2="11"/>
          </svg>
        </div>
        <span className="logo-name">Maptor<em>Cards</em></span>
      </div>

      {navItems.map((item, i) => {
        if (item.section) {
          return <span key={i} className="nav-section">{item.section}</span>
        }
        if ('divider' in item && item.divider) {
          return <div key={i} className="divider" />
        }
        const isActive = pathname === item.href
        return (
          <Link key={i} href={item.href as string} className={`nav-item ${isActive ? 'active' : ''}`}>
            <span dangerouslySetInnerHTML={{ __html: icons[item.icon!] }} />
            {item.label}
            {item.chip && (
              <span className={`nav-chip ${item.chip.type === 'count' ? 'chip-count' : 'chip-pro'}`}>
                {item.chip.text}
              </span>
            )}
          </Link>
        )
      })}

      <div className="sidebar-footer">
        <Link href="/perfil" className="user-row">
          <div className="ava">IS</div>
          <div>
            <div className="user-name">Isaque Sena</div>
            <div className="user-plan">Plano Free</div>
          </div>
        </Link>
      </div>
    </aside>
  )
}
