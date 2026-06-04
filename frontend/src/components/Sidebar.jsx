import React from 'react';

export default function Sidebar({
  isCollapsed,
  setIsCollapsed,
  currentView,
  setCurrentView,
  projects,
  currentProject,
  setCurrentProject,
  user,
  onLogout
}) {
  return (
    <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      {/* Sidebar Header */}
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <div className="logo-icon">C</div>
          {!isCollapsed && <span className="logo-text">CodeAlpha</span>}
        </div>
        <button 
          className="sidebar-toggle-btn"
          onClick={() => setIsCollapsed(!isCollapsed)}
          title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {isCollapsed ? (
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
            </svg>
          ) : (
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 19l-7-7 7-7M19 19l-7-7 7-7" />
            </svg>
          )}
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="sidebar-nav">
        <div 
          className={`sidebar-item ${currentView === 'dashboard' ? 'active' : ''}`}
          onClick={() => {
            setCurrentView('dashboard');
            setCurrentProject(null);
          }}
        >
          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2v-4zM14 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2v-4z" />
          </svg>
          <span>Dashboard</span>
        </div>

        {/* Projects Section */}
        {!isCollapsed && <div className="sidebar-section-title">Projects</div>}
        
        {projects.map((project) => (
          <div 
            key={project.id}
            className={`sidebar-item ${currentProject && currentProject.id === project.id ? 'active' : ''}`}
            onClick={() => {
              setCurrentProject(project);
              setCurrentView('board');
            }}
            title={project.name}
          >
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
            <span>{project.name}</span>
          </div>
        ))}
        
        {projects.length === 0 && !isCollapsed && (
          <div style={{ padding: '10px 14px', fontSize: '0.8rem', color: 'var(--text-disabled)', fontStyle: 'italic' }}>
            No projects created.
          </div>
        )}
      </nav>

      {/* User Section at bottom */}
      {user && (
        <div className="sidebar-user">
          <div className="user-badge">
            <div className="avatar" style={{ backgroundColor: user.avatar_color || '#6366f1' }}>
              {(user.username || 'U').charAt(0).toUpperCase()}
            </div>
            {!isCollapsed && (
              <div className="user-info">
                <span className="user-name">{user.username}</span>
                <span className="user-email">{user.email}</span>
              </div>
            )}
          </div>
          <button 
            className="logout-btn"
            onClick={onLogout}
            title="Log Out"
          >
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      )}
    </aside>
  );
}
