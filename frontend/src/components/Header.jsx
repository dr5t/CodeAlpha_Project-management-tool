import React, { useState, useEffect, useRef } from 'react';

export default function Header({
  currentProject,
  currentView,
  notifications,
  onMarkNotificationRead,
  onMarkAllNotificationsRead,
  onSelectProjectAndTask,
  onAddMemberClick,
  onNewProjectClick
}) {
  const [isNotifyOpen, setIsNotifyOpen] = useState(false);
  const notifyRef = useRef(null);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  // Handle clicking outside the notification dropdown to close it
  useEffect(() => {
    function handleClickOutside(event) {
      if (notifyRef.current && !notifyRef.current.contains(event.target)) {
        setIsNotifyOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNotificationClick = (n) => {
    onMarkNotificationRead(n.id);
    setIsNotifyOpen(false);
    if (n.project_id) {
      onSelectProjectAndTask(n.project_id, n.task_id);
    }
  };

  const formatTime = (timeStr) => {
    const d = new Date(timeStr);
    return d.toLocaleDateString(undefined, { 
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <header className="header">
      {/* Title / Project Context */}
      <div className="header-title-area">
        <h1 className="header-title">
          {currentView === 'dashboard' ? 'Overview Dashboard' : (currentProject ? currentProject.name : 'Project Board')}
        </h1>
        {currentProject && currentView === 'board' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: '10px' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>|</span>
            <div className="project-members-avatars" style={{ paddingLeft: '8px' }}>
              {(currentProject.members || []).map((m, idx) => (
                <div 
                  key={m.id || idx}
                  className="avatar member-avatar-stacked"
                  style={{ 
                    backgroundColor: m.avatar_color || '#6366f1',
                    width: '26px',
                    height: '26px',
                    fontSize: '0.75rem'
                  }}
                  title={m.username}
                >
                  {m.username.charAt(0).toUpperCase()}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Header Actions */}
      <div className="header-actions">
        {currentView === 'dashboard' ? (
          <button className="action-btn btn-primary" onClick={onNewProjectClick}>
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            New Project
          </button>
        ) : (
          currentProject && (
            <button className="action-btn btn-secondary" onClick={onAddMemberClick}>
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
              Invite Member
            </button>
          )
        )}

        {/* Notifications Bell */}
        <div className="notify-popover-wrapper" ref={notifyRef}>
          <button 
            className="notify-trigger-btn"
            onClick={() => setIsNotifyOpen(!isNotifyOpen)}
            title="Notifications"
          >
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            {unreadCount > 0 && (
              <span className="notify-badge">{unreadCount}</span>
            )}
          </button>

          {isNotifyOpen && (
            <div className="notify-dropdown">
              <div className="notify-dropdown-header">
                <h3>Notifications</h3>
                {unreadCount > 0 && (
                  <button className="clear-notify-btn" onClick={onMarkAllNotificationsRead}>
                    Mark all read
                  </button>
                )}
              </div>
              <div className="notify-list">
                {notifications.length > 0 ? (
                  notifications.map((n) => (
                    <div 
                      key={n.id}
                      className={`notify-item ${!n.is_read ? 'unread' : ''}`}
                      onClick={() => handleNotificationClick(n)}
                    >
                      <span className="notify-item-message">{n.message}</span>
                      <span className="notify-item-time">{formatTime(n.created_at)}</span>
                    </div>
                  ))
                ) : (
                  <div className="notify-empty">
                    No notifications yet.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
