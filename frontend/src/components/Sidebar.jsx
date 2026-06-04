import AgileSpaceLogo from './AgileSpaceLogo';
import { Avatar, Icons } from './Avatar';

const NAV = [
  { id: 'dashboard', label: 'Dashboard', icon: <Icons.Dashboard /> },
  { id: 'profile',   label: 'My Profile', icon: <Icons.Profile /> },
  { id: 'settings',  label: 'Settings',   icon: <Icons.Settings /> },
];

export default function Sidebar({
  isCollapsed, setIsCollapsed,
  currentView, setCurrentView,
  projects, currentProject, setCurrentProject,
  user, onLogout
}) {
  const navView = (id) => {
    setCurrentView(id);
    if (id !== 'board') setCurrentProject(null);
  };

  const effectiveView = currentProject
    ? (currentView === 'board' ? 'board' : currentView)
    : currentView;

  return (
    <aside className={`sidebar${isCollapsed ? ' collapsed' : ''}`} id="app-sidebar">
      {/* Brand */}
      <div className="sidebar-brand">
        <AgileSpaceLogo size={32} />
        <span className="brand-name">AgileSpace</span>
      </div>

      {/* Nav scroll */}
      <nav className="sidebar-scroll">
        {NAV.map(item => (
          <button
            key={item.id}
            id={`nav-${item.id}`}
            className={`nav-item${effectiveView === item.id ? ' active' : ''}`}
            onClick={() => navView(item.id)}
            title={isCollapsed ? item.label : undefined}
          >
            {item.icon}
            <span className="nav-label">{item.label}</span>
          </button>
        ))}

        {/* Projects section */}
        <div className="nav-section-label">Projects</div>

        {projects.length === 0 && !isCollapsed && (
          <div style={{ padding: '6px 12px', fontSize: '0.78rem', color: 'var(--text-3)' }}>
            No projects yet
          </div>
        )}

        {projects.map(proj => (
          <button
            key={proj.id}
            id={`sidebar-proj-${proj.id}`}
            className={`nav-item${currentProject?.id === proj.id && effectiveView === 'board' ? ' active' : ''}`}
            onClick={() => { setCurrentProject(proj); setCurrentView('board'); }}
            title={isCollapsed ? proj.name : undefined}
          >
            <div style={{
              width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
              background: proj.owner_id === user?.id ? 'var(--primary)' : 'var(--accent)'
            }} />
            <span className="nav-label">{proj.name}</span>
            {!isCollapsed && proj.total_tasks > 0 && (
              <span className="nav-item-count">{proj.total_tasks}</span>
            )}
          </button>
        ))}
      </nav>

      {/* User footer */}
      <div className="sidebar-footer">
        <div
          className="user-card"
          onClick={() => navView('profile')}
          id="sidebar-user-card"
          title="My Profile"
        >
          <Avatar user={user} size="sm" style={{ pointerEvents: 'none' }} />
          <div className="user-info-text">
            <div className="user-name-text">{user?.username}</div>
            <div className="user-email-text">{user?.email}</div>
          </div>
          {!isCollapsed && (
            <button
              id="sidebar-collapse-btn"
              className="btn btn-ghost btn-icon-sm sidebar-collapse-btn"
              onClick={(e) => { e.stopPropagation(); setIsCollapsed(!isCollapsed); }}
              title="Collapse sidebar"
            >
              <Icons.ChevronLeft s={16} />
            </button>
          )}
        </div>

        {isCollapsed && (
          <button
            id="sidebar-expand-btn"
            className="btn btn-ghost btn-icon"
            style={{ width: '100%', marginTop: 4 }}
            onClick={() => setIsCollapsed(false)}
            title="Expand sidebar"
          >
            <Icons.ChevronRight s={18} />
          </button>
        )}

        <button
          id="sidebar-logout-btn"
          className="btn btn-ghost"
          style={{
            width: '100%', marginTop: 6,
            fontSize: '0.8rem', color: 'var(--text-2)',
            justifyContent: isCollapsed ? 'center' : 'flex-start',
            padding: '8px 10px'
          }}
          onClick={onLogout}
          title="Sign out"
        >
          <Icons.Logout s={16} />
          <span className="nav-label">Sign out</span>
        </button>
      </div>
    </aside>
  );
}
