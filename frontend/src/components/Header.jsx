import React, { useState, useRef, useEffect } from 'react';

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

const typeEmoji = { project_invite: '📬', task_assigned: '🎯', comment_added: '💬', task_completed: '✅' };

export default function Header({
  currentProject, currentView,
  notifications, onMarkNotificationRead, onMarkAllNotificationsRead,
  onSelectProjectAndTask,
  onAddMemberClick, onNewProjectClick
}) {
  const [showNotif, setShowNotif] = useState(false);
  const notifRef = useRef(null);
  const unread = notifications.filter(n => !n.is_read).length;

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotif(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getBreadcrumb = () => {
    if (currentView === 'profile') return [{ label: 'Profile' }];
    if (currentView === 'settings') return [{ label: 'Settings' }];
    if (currentView === 'dashboard') return [{ label: 'Dashboard' }];
    if (currentView === 'board' && currentProject) return [
      { label: 'Projects' },
      { label: currentProject.name, current: true }
    ];
    return [{ label: 'AgileSpace' }];
  };

  const crumbs = getBreadcrumb();

  return (
    <header className="app-header">
      {/* Breadcrumb */}
      <div className="header-breadcrumb">
        {crumbs.map((c, i) => (
          <React.Fragment key={i}>
            {i > 0 && <span className="breadcrumb-sep">/</span>}
            <span className={`breadcrumb-item${c.current ? ' current' : ''}`}>{c.label}</span>
          </React.Fragment>
        ))}
      </div>

      {/* Actions */}
      <div className="header-actions">
        {currentView === 'board' && currentProject && (
          <>
            <button
              id="btn-add-member"
              className="btn btn-secondary btn-sm"
              onClick={onAddMemberClick}
              title="Invite a team member"
            >
              <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                <path strokeLinecap="round" d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path strokeLinecap="round" d="M22 11h-6m3-3v6"/>
              </svg>
              Add Member
            </button>
          </>
        )}

        <button
          id="btn-new-project"
          className="btn btn-primary btn-sm"
          onClick={onNewProjectClick}
          title="Create new project"
        >
          <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" d="M12 5v14m-7-7h14"/>
          </svg>
          New Project
        </button>

        {/* Notification bell */}
        <div style={{ position: 'relative' }} ref={notifRef}>
          <button
            id="btn-notifications"
            className="btn btn-ghost btn-icon notif-btn"
            onClick={() => setShowNotif(v => !v)}
            title={`${unread} unread notification${unread !== 1 ? 's' : ''}`}
          >
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
              <path strokeLinecap="round" d="M13.73 21a2 2 0 0 1-3.46 0"/>
            </svg>
            {unread > 0 && (
              <span className="notif-badge">{unread > 9 ? '9+' : unread}</span>
            )}
          </button>

          {showNotif && (
            <div className="dropdown-panel" id="notifications-panel">
              <div className="dropdown-header">
                <h3>Notifications</h3>
                {unread > 0 && (
                  <button
                    id="btn-mark-all-read"
                    className="btn btn-ghost"
                    style={{ fontSize: '0.75rem', padding: '4px 8px' }}
                    onClick={() => { onMarkAllNotificationsRead(); }}
                  >
                    Mark all read
                  </button>
                )}
              </div>
              <div className="dropdown-scroll">
                {notifications.length === 0 ? (
                  <div className="notif-empty">
                    <div style={{ fontSize: '1.5rem', marginBottom: 6 }}>🔔</div>
                    <div>No notifications yet</div>
                  </div>
                ) : (
                  notifications.slice(0, 30).map(n => (
                    <div
                      key={n.id}
                      id={`notif-${n.id}`}
                      className={`notif-item${n.is_read ? '' : ' unread'}`}
                      onClick={() => {
                        if (!n.is_read) onMarkNotificationRead(n.id);
                        if (n.project_id && n.task_id) onSelectProjectAndTask(n.project_id, n.task_id);
                        else if (n.project_id) onSelectProjectAndTask(n.project_id, null);
                        setShowNotif(false);
                      }}
                    >
                      <div>
                        <span style={{ fontSize: '1rem' }}>{typeEmoji[n.type] || '🔔'}</span>
                      </div>
                      <div style={{ flex: 1 }}>
                        <div className="notif-msg">{n.message}</div>
                        <div className="notif-time">{n.created_at ? timeAgo(n.created_at) : ''}</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
