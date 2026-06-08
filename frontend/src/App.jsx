import { useState, useEffect, useRef, useCallback } from 'react';
import Auth from './components/Auth';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import ProjectBoard from './components/ProjectBoard';
import TaskModal from './components/TaskModal';
import ProfileView from './components/ProfileView';
import { Icons } from './components/Icons';

const API_URL = window.location.port === '5173' ? 'http://localhost:5001/api' : '/api';

let _toastId = 0;

function ToastContainer({ toasts, onDismiss }) {
  const getToastIcon = (type) => {
    switch (type) {
      case 'success':
        return <Icons.Check s={16} style={{ color: 'var(--green)' }} />;
      case 'error':
        return <Icons.Warning s={16} style={{ color: 'var(--red)' }} />;
      default:
        return <Icons.Alert s={16} style={{ color: 'var(--blue)' }} />;
    }
  };

  return (
    <div className="toast-container">
      {toasts.map(t => (
        <div key={t.id} className={`toast ${t.type}`}>
          <span className="toast-icon" style={{ display: 'flex', alignItems: 'center' }}>
            {getToastIcon(t.type)}
          </span>
          <span className="toast-msg">{t.message}</span>
          <button className="toast-close" onClick={() => onDismiss(t.id)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icons.Close s={12} />
          </button>
        </div>
      ))}
    </div>
  );
}

function ModalDialog({ id, title, children, footer, onClose, size = '' }) {
  const ref = useRef(null);
  useEffect(() => { if (ref.current) ref.current.showModal(); }, []);
  return (
    <dialog ref={ref} id={id} onClose={onClose} style={{ maxWidth: size === 'sm' ? 460 : 560, width: '90vw' }}>
      <div className="modal-box">
        <div className="modal-header-simple">
          <h2>{title}</h2>
          <button className="btn btn-ghost btn-icon" onClick={() => { ref.current?.close(); onClose(); }}>
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="modal-body-simple">{children}</div>
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </dialog>
  );
}

export default function App() {
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [user, setUser]   = useState(null);
  const [projects, setProjects] = useState([]);
  const [currentProject, setCurrentProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [currentView, setCurrentView] = useState('dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [activeTaskId, setActiveTaskId] = useState(null);
  const [toasts, setToasts] = useState([]);

  const [showNewProject, setShowNewProject]   = useState(false);
  const [showInvite, setShowInvite]           = useState(false);
  const [showEditProject, setShowEditProject] = useState(false);
  const [showDeleteProject, setShowDeleteProject] = useState(false);

  const [newProjName, setNewProjName] = useState('');
  const [newProjDesc, setNewProjDesc] = useState('');
  const [newProjError, setNewProjError] = useState('');

  const [editProjName, setEditProjName] = useState('');
  const [editProjDesc, setEditProjDesc] = useState('');

  const [systemUsers, setSystemUsers] = useState([]);
  const [inviteUserId, setInviteUserId] = useState('');

  const wsRef = useRef(null);

  const showToast = useCallback((message, type = 'info') => {
    const id = ++_toastId;
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 5000);
  }, []);

  const dismissToast = (id) => setToasts(prev => prev.filter(t => t.id !== id));

  const handleLogout = useCallback(() => {
    localStorage.removeItem('token');
    setToken(''); setUser(null);
    setProjects([]); setCurrentProject(null);
    setTasks([]); setNotifications([]);
    setCurrentView('dashboard');
  }, []);

  const fetchProjects = useCallback(async () => {
    try {
      const r = await fetch(`${API_URL}/projects`, { headers: { Authorization: `Bearer ${token}` } });
      if (r.ok) { const d = await r.json(); setProjects(d); }
    } catch {
      void 0;
    }
  }, [token]);

  const fetchTasks = useCallback(async (pid) => {
    try {
      const r = await fetch(`${API_URL}/tasks/project/${pid}`, { headers: { Authorization: `Bearer ${token}` } });
      if (r.ok) { const d = await r.json(); setTasks(d); }
    } catch {
      void 0;
    }
  }, [token]);

  const fetchNotifications = useCallback(async () => {
    try {
      const r = await fetch(`${API_URL}/notifications`, { headers: { Authorization: `Bearer ${token}` } });
      if (r.ok) { const d = await r.json(); setNotifications(d); }
    } catch {
      void 0;
    }
  }, [token]);

  useEffect(() => {
    if (!token) return;
    fetch(`${API_URL}/auth/me`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.ok ? r.json() : Promise.reject('session_expired'))
      .then(d => setUser(d.user))
      .catch(() => handleLogout());
  }, [token, handleLogout]);

  useEffect(() => {
    if (!user) return;
    Promise.resolve().then(() => {
      fetchProjects();
      fetchNotifications();
    });
  }, [user, fetchNotifications, fetchProjects]);

  useEffect(() => {
    if (!currentProject) {
      Promise.resolve().then(() => setTasks([]));
      return;
    }
    Promise.resolve().then(() => {
      fetchTasks(currentProject.id);
    });
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'JOIN_PROJECT', projectId: currentProject.id, userId: user?.id }));
    }
    return () => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ type: 'LEAVE_PROJECT' }));
      }
    };
  }, [currentProject, fetchTasks, user?.id]);

  useEffect(() => {
    if (!user) return;
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.port === '5173'
      ? `${window.location.hostname}:5001`
      : window.location.host;

    let socket;
    const connect = () => {
      socket = new WebSocket(`${protocol}//${host}`);
      wsRef.current = socket;
      socket.onopen = () => {
        if (currentProject) {
          socket.send(JSON.stringify({ type: 'JOIN_PROJECT', projectId: currentProject.id, userId: user.id }));
        }
      };
      socket.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          window.dispatchEvent(new MessageEvent('websocket-message', { data: event.data }));
          if (msg.type === 'BOARD_UPDATED') {
            if (currentProject && Number(msg.projectId) === Number(currentProject.id)) fetchTasks(currentProject.id);
            fetchProjects();
          }
          if (msg.type === 'NOTIFICATION_RECEIVED') {
            setNotifications(prev => [msg.notification, ...prev]);
            showToast(msg.notification.message, 'info');
          }
        } catch {
          void 0;
        }
      };
      socket.onclose = () => setTimeout(connect, 5000);
    };
    connect();
    return () => socket?.close();
  }, [user, currentProject, fetchProjects, fetchTasks, showToast]);

  const handleAuthSuccess = (userData, userToken) => {
    localStorage.setItem('token', userToken);
    setToken(userToken);
    setUser(userData);
  };
  const handleProfileUpdated = (updatedUser, newToken) => {
    if (newToken) {
      localStorage.setItem('token', newToken);
      setToken(newToken);
    }
    setUser(updatedUser);
    showToast('Profile updated!', 'success');
  };

  const handleMarkNotificationRead = async (id) => {
    try {
      await fetch(`${API_URL}/notifications/${id}/read`, { method: 'PUT', headers: { Authorization: `Bearer ${token}` } });
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: 1 } : n));
    } catch {
      void 0;
    }
  };
  const handleMarkAllNotificationsRead = async () => {
    try {
      await fetch(`${API_URL}/notifications/read-all`, { method: 'PUT', headers: { Authorization: `Bearer ${token}` } });
      setNotifications(prev => prev.map(n => ({ ...n, is_read: 1 })));
    } catch {
      void 0;
    }
  };

  const handleSelectProjectAndTask = async (projId, taskId) => {
    let proj = projects.find(p => p.id === projId);
    if (!proj) {
      await fetchProjects();
      proj = projects.find(p => p.id === projId);
    }
    if (proj) {
      setCurrentProject(proj);
      setCurrentView('board');
      if (taskId) setActiveTaskId(taskId);
    }
  };

  const handleMoveTask = async (taskId, targetStatus) => {
    const prev = [...tasks];
    setTasks(p => p.map(t => t.id === taskId ? { ...t, status: targetStatus } : t));
    try {
      const taskToMove = tasks.find(t => t.id === taskId);
      if (!taskToMove) return;
      const res = await fetch(`${API_URL}/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ...taskToMove, status: targetStatus })
      });
      if (!res.ok) throw new Error();
      const d = await res.json();
      setTasks(p => p.map(t => t.id === taskId ? d : t));
      fetchProjects();
    } catch {
      setTasks(prev);
      showToast('Failed to move task', 'error');
    }
  };

  const handleAddTask = async (columnId, title) => {
    try {
      const res = await fetch(`${API_URL}/tasks/project/${currentProject.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ title, status: columnId, priority: 'medium' })
      });
      if (!res.ok) throw new Error();
      const newTask = await res.json();
      setTasks(prev => [...prev, newTask]);
      fetchProjects();
    } catch {
      showToast('Failed to add task', 'error');
    }
  };

  const handleTaskUpdated = (taskUpdate) => {
    if (taskUpdate.deleted) {
      setTasks(prev => prev.filter(t => t.id !== taskUpdate.id));
    } else {
      setTasks(prev => prev.map(t => t.id === taskUpdate.id ? taskUpdate : t));
    }
    fetchProjects();
  };

  const handleDeleteTask = async (taskId) => {
    try {
      await fetch(`${API_URL}/tasks/${taskId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      setTasks(prev => prev.filter(t => t.id !== taskId));
      fetchProjects();
      showToast('Task deleted', 'info');
    } catch {
      showToast('Failed to delete task', 'error');
    }
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    if (!newProjName.trim()) { setNewProjError('Project name is required.'); return; }
    setNewProjError('');
    try {
      const res = await fetch(`${API_URL}/projects`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: newProjName.trim(), description: newProjDesc.trim() })
      });
      if (!res.ok) throw new Error('Create failed');
      const newProj = await res.json();
      setProjects(prev => [newProj, ...prev]);
      setCurrentProject(newProj);
      setCurrentView('board');
      setNewProjName(''); setNewProjDesc('');
      setShowNewProject(false);
      showToast(`Project "${newProj.name}" created!`, 'success');
    } catch {
      setNewProjError('Failed to create project.');
    }
  };

  const handleEditProject = async (e) => {
    e.preventDefault();
    if (!editProjName.trim()) return;
    try {
      const res = await fetch(`${API_URL}/projects/${currentProject.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: editProjName.trim(), description: editProjDesc.trim() })
      });
      if (!res.ok) throw new Error();
      const updated = { ...currentProject, name: editProjName.trim(), description: editProjDesc.trim() };
      setCurrentProject(updated);
      setProjects(prev => prev.map(p => p.id === currentProject.id ? { ...p, ...updated } : p));
      setShowEditProject(false);
      showToast('Project updated', 'success');
    } catch {
      showToast('Failed to update project', 'error');
    }
  };

  const handleDeleteProject = async () => {
    try {
      await fetch(`${API_URL}/projects/${currentProject.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      setProjects(prev => prev.filter(p => p.id !== currentProject.id));
      setCurrentProject(null);
      setCurrentView('dashboard');
      setShowDeleteProject(false);
      showToast('Project deleted', 'info');
    } catch {
      showToast('Failed to delete project', 'error');
    }
  };

  const handleOpenInvite = async () => {
    try {
      const r = await fetch(`${API_URL}/auth/users`, { headers: { Authorization: `Bearer ${token}` } });
      if (!r.ok) return;
      const all = await r.json();
      const memberIds = (currentProject?.members || []).map(m => m.user_id || m.id);
      const eligible = all.filter(u => !memberIds.includes(u.id));
      setSystemUsers(eligible);
      setInviteUserId(eligible[0]?.id || '');
      setShowInvite(true);
    } catch {
      void 0;
    }
  };

  const handleInviteSubmit = async (e) => {
    e.preventDefault();
    if (!inviteUserId) return;
    try {
      const res = await fetch(`${API_URL}/projects/${currentProject.id}/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ userId: Number(inviteUserId) })
      });
      if (!res.ok) throw new Error();
      const member = await res.json();
      const updatedProj = {
        ...currentProject,
        members: [...(currentProject.members || []), { user_id: member.id, username: member.username, avatar_color: member.avatar_color }]
      };
      setCurrentProject(updatedProj);
      setProjects(prev => prev.map(p => p.id === currentProject.id ? updatedProj : p));
      setShowInvite(false);
      showToast(`${member.username} added to project!`, 'success');
    } catch {
      showToast('Failed to add member', 'error');
    }
  };

  if (!token || !user) {
    return <Auth onAuthSuccess={handleAuthSuccess} API_URL={API_URL} />;
  }

  return (
    <div className="app-root">
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
        currentView={currentView}
        setCurrentView={setCurrentView}
        projects={projects}
        currentProject={currentProject}
        setCurrentProject={setCurrentProject}
        user={user}
        onLogout={handleLogout}
      />

      <div className="main-area">
        <Header
          currentProject={currentProject}
          currentView={currentView}
          notifications={notifications}
          onMarkNotificationRead={handleMarkNotificationRead}
          onMarkAllNotificationsRead={handleMarkAllNotificationsRead}
          onSelectProjectAndTask={handleSelectProjectAndTask}
          onAddMemberClick={handleOpenInvite}
          onNewProjectClick={() => { setNewProjName(''); setNewProjDesc(''); setNewProjError(''); setShowNewProject(true); }}
        />

        <div className="content-view">
          {currentView === 'dashboard' && (
            <Dashboard
              projects={projects}
              notifications={notifications}
              onSelectProject={(proj) => { setCurrentProject(proj); setCurrentView('board'); }}
              onNewProject={() => { setNewProjName(''); setNewProjDesc(''); setNewProjError(''); setShowNewProject(true); }}
            />
          )}

          {currentView === 'board' && currentProject && (
            <ProjectBoard
              tasks={tasks}
              currentProject={currentProject}
              user={user}
              onMoveTask={handleMoveTask}
              onAddTask={handleAddTask}
              onSelectTask={(id) => setActiveTaskId(id)}
              onDeleteTask={handleDeleteTask}
              onEditProject={() => { setEditProjName(currentProject.name); setEditProjDesc(currentProject.description || ''); setShowEditProject(true); }}
              onDeleteProject={() => setShowDeleteProject(true)}
            />
          )}

          {currentView === 'board' && !currentProject && (
            <div className="empty-state" style={{ height: '60vh' }}>
              <div className="empty-icon" style={{ color: 'var(--text-3)', display: 'flex', justifyContent: 'center' }}>
                <Icons.Projects s={36} />
              </div>
              <div className="empty-title">No project selected</div>
              <div className="empty-desc">Choose a project from the sidebar or create a new one to get started.</div>
              <button className="btn btn-primary" onClick={() => setShowNewProject(true)} style={{ marginTop: 12 }}>
                Create Project
              </button>
            </div>
          )}

          {currentView === 'profile' && (
            <ProfileView
              user={user}
              API_URL={API_URL}
              token={token}
              onProfileUpdated={handleProfileUpdated}
              onLogout={handleLogout}
            />
          )}

          {currentView === 'settings' && (
            <div className="animate-fade">
              <div className="page-header">
                <div>
                  <h1 className="page-title">Settings</h1>
                  <p className="page-subtitle">App preferences and workspace configuration.</p>
                </div>
              </div>
              <div className="profile-section" style={{ maxWidth: 560 }}>
                <div className="profile-section-header">
                  <h4>Appearance</h4>
                </div>
                <div>
                  <div className="settings-row">
                    <div>
                      <div className="settings-row-label">Dark Mode</div>
                      <div className="settings-row-sub">Always on — optimized for focus</div>
                    </div>
                    <label className="toggle-wrap">
                      <div className="toggle on" />
                    </label>
                  </div>
                  <div className="settings-row">
                    <div>
                      <div className="settings-row-label">Compact View</div>
                      <div className="settings-row-sub">Reduce card spacing on boards</div>
                    </div>
                    <label className="toggle-wrap">
                      <div className="toggle" />
                    </label>
                  </div>
                </div>
              </div>
              <div className="profile-section" style={{ maxWidth: 560, marginTop: 16 }}>
                <div className="profile-section-header">
                  <h4>Notifications</h4>
                </div>
                <div>
                  <div className="settings-row">
                    <div>
                      <div className="settings-row-label">Task Assignments</div>
                      <div className="settings-row-sub">Get notified when tasks are assigned to you</div>
                    </div>
                    <label className="toggle-wrap">
                      <div className="toggle on" />
                    </label>
                  </div>
                  <div className="settings-row">
                    <div>
                      <div className="settings-row-label">New Comments</div>
                      <div className="settings-row-sub">Get notified on task comments</div>
                    </div>
                    <label className="toggle-wrap">
                      <div className="toggle on" />
                    </label>
                  </div>
                  <div className="settings-row" style={{ borderBottom: 'none' }}>
                    <div>
                      <div className="settings-row-label">Project Invites</div>
                      <div className="settings-row-sub">Get notified when added to a project</div>
                    </div>
                    <label className="toggle-wrap">
                      <div className="toggle on" />
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {activeTaskId && (
        <TaskModal
          key={activeTaskId}
          taskId={activeTaskId}
          onClose={() => setActiveTaskId(null)}
          API_URL={API_URL}
          token={token}
          projectMembers={currentProject?.members || []}
          onTaskUpdated={handleTaskUpdated}
        />
      )}

      {showNewProject && (
        <ModalDialog
          id="new-project-dialog"
          title="Create New Project"
          onClose={() => setShowNewProject(false)}
          footer={
            <>
              <button className="btn btn-ghost" onClick={() => setShowNewProject(false)} id="cancel-new-project">Cancel</button>
              <button className="btn btn-primary" form="new-project-form" type="submit" id="submit-new-project">Create Project</button>
            </>
          }
        >
          {newProjError && <div className="error-banner"><svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path strokeLinecap="round" d="M12 8v4m0 4h.01"/></svg>{newProjError}</div>}
          <form id="new-project-form" onSubmit={handleCreateProject} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div className="form-field">
              <label className="form-label" htmlFor="new-proj-name">Project Name <span style={{ color: 'var(--red)' }}>*</span></label>
              <input
                 id="new-proj-name" className="form-input"
                placeholder="e.g. Website Redesign"
                value={newProjName}
                onChange={e => { setNewProjError(''); setNewProjName(e.target.value); }}
                autoFocus required
              />
            </div>
            <div className="form-field">
              <label className="form-label" htmlFor="new-proj-desc">Description</label>
              <textarea
                id="new-proj-desc" className="form-input"
                placeholder="Brief summary of the project goals…"
                value={newProjDesc}
                onChange={e => setNewProjDesc(e.target.value)}
                style={{ minHeight: 80, resize: 'vertical' }}
              />
            </div>
          </form>
        </ModalDialog>
      )}

      {showEditProject && (
        <ModalDialog
          id="edit-project-dialog"
          title="Edit Project"
          onClose={() => setShowEditProject(false)}
          footer={
            <>
              <button className="btn btn-ghost" onClick={() => setShowEditProject(false)} id="cancel-edit-project">Cancel</button>
              <button className="btn btn-primary" form="edit-project-form" type="submit" id="submit-edit-project">Save Changes</button>
            </>
          }
        >
          <form id="edit-project-form" onSubmit={handleEditProject} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div className="form-field">
              <label className="form-label" htmlFor="edit-proj-name">Project Name</label>
              <input
                id="edit-proj-name" className="form-input"
                value={editProjName}
                onChange={e => setEditProjName(e.target.value)}
                required autoFocus
              />
            </div>
            <div className="form-field">
              <label className="form-label" htmlFor="edit-proj-desc">Description</label>
              <textarea
                id="edit-proj-desc" className="form-input"
                value={editProjDesc}
                onChange={e => setEditProjDesc(e.target.value)}
                style={{ minHeight: 80, resize: 'vertical' }}
              />
            </div>
          </form>
        </ModalDialog>
      )}

      {showDeleteProject && (
        <ModalDialog
          id="delete-project-dialog"
          title="Delete Project"
          onClose={() => setShowDeleteProject(false)}
          size="sm"
          footer={
            <>
              <button className="btn btn-ghost" onClick={() => setShowDeleteProject(false)} id="cancel-delete-project">Cancel</button>
              <button className="btn btn-danger" onClick={handleDeleteProject} id="confirm-delete-project">Yes, Delete</button>
            </>
          }
        >
          <div style={{ textAlign: 'center', padding: '8px 0' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12, color: 'var(--red)' }}>
              <Icons.Warning s={36} />
            </div>
            <p style={{ fontSize: '0.9rem', lineHeight: 1.6 }}>
              Are you sure you want to delete <strong>"{currentProject?.name}"</strong>?
              <br />This will permanently remove all tasks and cannot be undone.
            </p>
          </div>
        </ModalDialog>
      )}

      {showInvite && (
        <ModalDialog
          id="invite-member-dialog"
          title="Invite Team Member"
          onClose={() => setShowInvite(false)}
          footer={
            <>
              <button className="btn btn-ghost" onClick={() => setShowInvite(false)} id="cancel-invite">Cancel</button>
              <button className="btn btn-primary" form="invite-form" type="submit" disabled={systemUsers.length === 0} id="submit-invite">
                Send Invite
              </button>
            </>
          }
        >
          <form id="invite-form" onSubmit={handleInviteSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {systemUsers.length === 0 ? (
              <div className="empty-state" style={{ padding: '20px 0' }}>
                <div className="empty-icon" style={{ color: 'var(--text-3)', display: 'flex', justifyContent: 'center' }}>
                  <Icons.Profile s={36} />
                </div>
                <div className="empty-desc">All registered users are already members of this project.</div>
              </div>
            ) : (
              <div className="form-field">
                <label className="form-label" htmlFor="invite-user-select">Select User</label>
                <select
                  id="invite-user-select"
                  className="form-input"
                  value={inviteUserId}
                  onChange={e => setInviteUserId(e.target.value)}
                >
                  {systemUsers.map(u => (
                    <option key={u.id} value={u.id}>{u.username} — {u.email}</option>
                  ))}
                </select>
              </div>
            )}
          </form>
        </ModalDialog>
      )}

      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
