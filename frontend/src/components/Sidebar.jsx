import React, { useState, useRef } from 'react';
import AgileSpaceLogo from './AgileSpaceLogo';

const AVATAR_COLORS = [
  '#6366f1','#8b5cf6','#ec4899','#ef4444','#f59e0b',
  '#10b981','#06b6d4','#3b82f6','#84cc16','#14b8a6'
];

function Avatar({ user, size = 'md', onClick, style = {} }) {
  const sizeClass = size === 'sm' ? 'avatar-sm' : size === 'lg' ? 'avatar-lg' : size === 'xl' ? 'avatar-xl' : 'avatar-md';
  const letter = user?.username ? user.username[0].toUpperCase() : '?';
  return (
    <div
      className={`avatar ${sizeClass}`}
      style={{ background: user?.avatar_color || '#6366f1', ...style }}
      onClick={onClick}
      title={user?.username}
    >
      {letter}
    </div>
  );
}

const NAV = [
  { id: 'dashboard', label: 'Dashboard', icon: (
    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
      <rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/>
    </svg>
  )},
  { id: 'profile', label: 'My Profile', icon: (
    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <circle cx="12" cy="8" r="4"/><path strokeLinecap="round" d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
    </svg>
  )},
  { id: 'settings', label: 'Settings', icon: (
    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="3"/>
      <path strokeLinecap="round" d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
    </svg>
  )},
];

export default function Sidebar({ isCollapsed, setIsCollapsed, currentView, setCurrentView, projects, currentProject, setCurrentProject, user, onLogout, onProfileUpdate }) {
  const [hovered, setHovered] = useState(null);

  const navView = (id) => {
    setCurrentView(id);
    if (id !== 'board') setCurrentProject(null);
  };

  const effectiveView = currentProject ? (currentView === 'board' ? 'board' : currentView) : currentView;

  return (
    <aside className={`sidebar${isCollapsed ? ' collapsed' : ''}`} id="app-sidebar">
      {/* Brand */}
      <div className="sidebar-brand">
        <AgileSpaceLogo size={32} />
        <span className="brand-name">AgileSpace</span>
      </div>

      {/* Scroll nav area */}
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
          <div style={{ padding: '8px 12px', fontSize: '0.78rem', color: 'var(--text-3)' }}>
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
            onMouseEnter={() => setHovered(proj.id)}
            onMouseLeave={() => setHovered(null)}
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

      {/* User Footer */}
      <div className="sidebar-footer">
        <div className="user-card" onClick={() => navView('profile')} id="sidebar-user-card" title="My Profile">
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
              title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
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
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}
        <button
          id="sidebar-logout-btn"
          className="btn btn-ghost"
          style={{ width: '100%', marginTop: 6, fontSize: '0.8rem', color: 'var(--text-2)', justifyContent: isCollapsed ? 'center' : 'flex-start', padding: '8px 10px' }}
          onClick={onLogout}
          title="Sign out"
        >
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
          </svg>
          <span className="nav-label">Sign out</span>
        </button>
      </div>
    </aside>
  );
}

export { Avatar, AVATAR_COLORS };
