const UserIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
  </svg>
)
const OrgIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
  </svg>
)
const LockIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
)
const IntIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="9" height="9" rx="1" /><rect x="13" y="2" width="9" height="9" rx="1" />
    <rect x="2" y="13" width="9" height="9" rx="1" /><rect x="13" y="13" width="9" height="9" rx="1" />
  </svg>
)
const PrefIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14" />
  </svg>
)
const DangerIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
)

interface Section {
  id: string
  label: string
  icon: React.ReactNode
  danger?: boolean
}

interface SettingsSidebarProps {
  active: string
  onSelect: (id: string) => void
}

const SECTIONS: Section[] = [
  { id: 'profile', label: 'Profile', icon: <UserIcon /> },
  { id: 'organization', label: 'Organization', icon: <OrgIcon /> },
  { id: 'security', label: 'Security', icon: <LockIcon /> },
  { id: 'integrations', label: 'Integrations', icon: <IntIcon /> },
  { id: 'preferences', label: 'Preferences', icon: <PrefIcon /> },
  { id: 'danger', label: 'Danger Zone', icon: <DangerIcon />, danger: true },
]

export default function SettingsSidebar({ active, onSelect }: SettingsSidebarProps) {
  return (
    <nav className="settings-nav">
      <p className="settings-nav__label">Settings</p>
      <ul className="settings-nav__list">
        {SECTIONS.map((s, i) => (
          <>
            {i === SECTIONS.length - 1 && <div key="div" className="settings-nav__divider" />}
            <li key={s.id}>
              <button
                className={[
                  'settings-nav__item',
                  active === s.id ? 'settings-nav__item--active' : '',
                  s.danger ? 'settings-nav__item--danger' : '',
                ].join(' ')}
                onClick={() => onSelect(s.id)}
              >
                {s.icon}
                {s.label}
              </button>
            </li>
          </>
        ))}
      </ul>
    </nav>
  )
}

