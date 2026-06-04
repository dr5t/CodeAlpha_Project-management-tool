import React, { useState, useEffect, useRef } from 'react';
import Auth from './components/Auth';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import ProjectBoard from './components/ProjectBoard';
import TaskModal from './components/TaskModal';

const API_URL = window.location.port === '5173' ? 'http://localhost:5001/api' : '/api';

export default function App() {
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [user, setUser] = useState(null);
  const [projects, setProjects] = useState([]);
  const [currentProject, setCurrentProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [currentView, setCurrentView] = useState('dashboard'); // 'dashboard' or 'board'
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [activeTaskId, setActiveTaskId] = useState(null);

  // System User List for Invite Dropdown
  const [systemUsers, setSystemUsers] = useState([]);
  const [inviteUserId, setInviteUserId] = useState('');

  // Dialog Refs
  const newProjectDialogRef = useRef(null);
  const inviteMemberDialogRef = useRef(null);

  // New Project Form State
  const [newProjName, setNewProjName] = useState('');
  const [newProjDesc, setNewProjDesc] = useState('');

  // Live Toast Notification State
  const [toast, setToast] = useState(null);

  // WebSocket Ref
  const wsRef = useRef(null);

  // 1. Restore User Session on mount
  useEffect(() => {
    if (!token) return;

    const restoreSession = async () => {
      try {
        const res = await fetch(`${API_URL}/auth/me`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Session invalid');
        const data = await res.json();
        setUser(data.user);
      } catch (err) {
        console.error(err.message);
        handleLogout();
      }
    };
    restoreSession();
  }, [token]);

  // 2. Fetch Projects and Notifications when logged in
  useEffect(() => {
    if (!user) return;
    fetchProjects();
    fetchNotifications();
  }, [user]);

  // 3. Fetch Tasks when active project changes
  useEffect(() => {
    if (!currentProject) {
      setTasks([]);
      return;
    }
    fetchTasks(currentProject.id);

    // Alert WebSockets about active project workspace change
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'JOIN_PROJECT',
        projectId: currentProject.id,
        userId: user.id
      }));
    }

    return () => {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ type: 'LEAVE_PROJECT' }));
      }
    };
  }, [currentProject]);

  // 4. WebSocket setup
  useEffect(() => {
    if (!user) return;

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.port === '5173' 
      ? `${window.location.hostname}:5001` 
      : window.location.host;
    const wsUrl = `${protocol}//${host}`;

    let socket;
    const connectWS = () => {
      console.log('Connecting to WebSocket channel:', wsUrl);
      socket = new WebSocket(wsUrl);
      wsRef.current = socket;

      socket.onopen = () => {
        console.log('WebSocket connection established.');
        // If already selected project, join room immediately
        if (currentProject) {
          socket.send(JSON.stringify({
            type: 'JOIN_PROJECT',
            projectId: currentProject.id,
            userId: user.id
          }));
        }
      };

      socket.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          
          // Dispatch custom browser event for modal thread capture
          const customEvent = new MessageEvent('websocket-message', { data: event.data });
          window.dispatchEvent(customEvent);

          switch (message.type) {
            case 'BOARD_UPDATED':
              if (currentProject && Number(message.projectId) === Number(currentProject.id)) {
                // Refresh board items
                fetchTasks(currentProject.id);
              }
              // Always refresh projects to update completion stats
              fetchProjects();
              break;

            case 'NOTIFICATION_RECEIVED':
              // Prepend new notification
              setNotifications(prev => [message.notification, ...prev]);
              // Trigger active Toast notification
              showToastAlert(message.notification.message);
              break;
              
            default:
              break;
          }
        } catch (err) {
          console.error('Socket message handler error:', err);
        }
      };

      socket.onclose = () => {
        console.log('WebSocket closed. Retrying connection in 5s...');
        setTimeout(() => connectWS(), 5000);
      };

      socket.onerror = (err) => {
        console.error('WebSocket encountered an error:', err);
      };
    };

    connectWS();

    return () => {
      if (socket) socket.close();
    };
  }, [user, currentProject]);

  const showToastAlert = (message) => {
    setToast(message);
    setTimeout(() => {
      setToast(null);
    }, 4500);
  };

  const fetchProjects = async () => {
    try {
      const res = await fetch(`${API_URL}/projects`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setProjects(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchTasks = async (projId) => {
    try {
      const res = await fetch(`${API_URL}/tasks/project/${projId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setTasks(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchNotifications = async () => {
    try {
      const res = await fetch(`${API_URL}/notifications`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Auth Callbacks
  const handleAuthSuccess = (userData, userToken) => {
    localStorage.setItem('token', userToken);
    setToken(userToken);
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken('');
    setUser(null);
    setProjects([]);
    setCurrentProject(null);
    setTasks([]);
    setNotifications([]);
    setCurrentView('dashboard');
  };

  // Notifications Callbacks
  const handleMarkNotificationRead = async (id) => {
    try {
      await fetch(`${API_URL}/notifications/${id}/read`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, is_read: 1 } : n)
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllNotificationsRead = async () => {
    try {
      await fetch(`${API_URL}/notifications/read-all`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setNotifications(prev => prev.map(n => ({ ...n, is_read: 1 })));
    } catch (err) {
      console.error(err);
    }
  };

  const handleSelectProjectAndTask = async (projId, taskId) => {
    // 1. Locate and select the target project workspace
    const proj = projects.find(p => p.id === projId);
    if (proj) {
      setCurrentProject(proj);
      setCurrentView('board');
      // 2. Open card details modal
      if (taskId) {
        setActiveTaskId(taskId);
      }
    } else {
      // Re-fetch projects in case they were added
      await fetchProjects();
      const updatedProj = projects.find(p => p.id === projId);
      if (updatedProj) {
        setCurrentProject(updatedProj);
        setCurrentView('board');
        if (taskId) setActiveTaskId(taskId);
      }
    }
  };

  // Task Actions
  const handleMoveTask = async (taskId, targetStatus) => {
    // Optimistic layout update
    const previousTasks = [...tasks];
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: targetStatus } : t));

    try {
      const taskToMove = tasks.find(t => t.id === taskId);
      if (!taskToMove) return;

      const res = await fetch(`${API_URL}/tasks/${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: taskToMove.title,
          description: taskToMove.description,
          status: targetStatus,
          priority: taskToMove.priority,
          due_date: taskToMove.due_date,
          assignee_id: taskToMove.assignee_id
        })
      });

      if (!res.ok) throw new Error('Card movement failed');
      const data = await res.json();
      
      // Update local task properties with response data
      setTasks(prev => prev.map(t => t.id === taskId ? data : t));
      fetchProjects(); // Recalculate stats
    } catch (err) {
      console.error(err);
      // Revert states on error
      setTasks(previousTasks);
    }
  };

  const handleAddTask = async (columnId, title) => {
    try {
      const res = await fetch(`${API_URL}/tasks/project/${currentProject.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title,
          status: columnId,
          priority: 'medium'
        })
      });

      if (!res.ok) throw new Error('Task creation failed');
      const newTask = await res.json();
      
      setTasks(prev => [...prev, newTask]);
      fetchProjects();
    } catch (err) {
      console.error(err);
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

  // Project Creation Callback
  const handleCreateProject = async (e) => {
    e.preventDefault();
    if (!newProjName.trim()) return;

    try {
      const res = await fetch(`${API_URL}/projects`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name: newProjName.trim(), description: newProjDesc.trim() })
      });

      if (!res.ok) throw new Error('Create project failed');
      const newProj = await res.json();

      setProjects(prev => [newProj, ...prev]);
      setCurrentProject(newProj);
      setCurrentView('board');
      
      setNewProjName('');
      setNewProjDesc('');
      if (newProjectDialogRef.current) newProjectDialogRef.current.close();
    } catch (err) {
      console.error(err);
    }
  };

  // Project Inviting Member Callback
  const handleOpenInviteDialog = async () => {
    try {
      const res = await fetch(`${API_URL}/auth/users`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const usersList = await res.json();
        // Filter out current members
        const currentMemberIds = (currentProject.members || []).map(m => m.user_id || m.id);
        const nonMembers = usersList.filter(u => !currentMemberIds.includes(u.id));
        
        setSystemUsers(nonMembers);
        if (nonMembers.length > 0) {
          setInviteUserId(nonMembers[0].id);
        } else {
          setInviteUserId('');
        }

        if (inviteMemberDialogRef.current) {
          inviteMemberDialogRef.current.showModal();
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleInviteSubmit = async (e) => {
    e.preventDefault();
    if (!inviteUserId) return;

    try {
      const res = await fetch(`${API_URL}/projects/${currentProject.id}/members`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ userId: Number(inviteUserId) })
      });

      if (!res.ok) throw new Error('Invitation dispatch failed');
      const newMember = await res.json();

      // Update current project member stack locally
      const updatedProj = {
        ...currentProject,
        members: [...(currentProject.members || []), { 
          user_id: newMember.id, 
          username: newMember.username, 
          avatar_color: newMember.avatar_color 
        }]
      };
      
      setCurrentProject(updatedProj);
      setProjects(prev => prev.map(p => p.id === currentProject.id ? updatedProj : p));
      
      if (inviteMemberDialogRef.current) inviteMemberDialogRef.current.close();
      showToastAlert(`Successfully added ${newMember.username} to project!`);
    } catch (err) {
      console.error(err);
    }
  };

  if (!token || !user) {
    return <Auth onAuthSuccess={handleAuthSuccess} API_URL={API_URL} />;
  }

  return (
    <div className="app-layout">
      {/* Dynamic Collapsible Sidebar */}
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

      <div className="main-wrapper">
        {/* Top Header Controls */}
        <Header
          currentProject={currentProject}
          currentView={currentView}
          notifications={notifications}
          onMarkNotificationRead={handleMarkNotificationRead}
          onMarkAllNotificationsRead={handleMarkAllNotificationsRead}
          onSelectProjectAndTask={handleSelectProjectAndTask}
          onAddMemberClick={handleOpenInviteDialog}
          onNewProjectClick={() => newProjectDialogRef.current?.showModal()}
        />

        {/* View Router */}
        <main className="content-area">
          {currentView === 'dashboard' ? (
            <Dashboard 
              projects={projects} 
              onSelectProject={(proj) => {
                setCurrentProject(proj);
                setCurrentView('board');
              }}
              notifications={notifications}
            />
          ) : (
            <ProjectBoard
              tasks={tasks}
              onMoveTask={handleMoveTask}
              onAddTask={handleAddTask}
              onSelectTask={(id) => setActiveTaskId(id)}
            />
          )}
        </main>
      </div>

      {/* Floating Push Toast (Slide-in alert) */}
      {toast && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--primary)',
          borderRadius: '10px',
          padding: '16px 20px',
          boxShadow: 'var(--box-shadow)',
          zIndex: 999,
          maxWidth: '320px',
          animation: 'slideInRight 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          display: 'flex',
          gap: '12px',
          alignItems: 'center'
        }}>
          <style>{`
            @keyframes slideInRight {
              from { transform: translateX(110%); opacity: 0; }
              to { transform: translateX(0); opacity: 1; }
            }
          `}</style>
          <div style={{ fontSize: '1.25rem' }}>🔔</div>
          <div style={{ fontSize: '0.85rem', lineHeight: '1.4', color: 'var(--text-main)' }}>
            {toast}
          </div>
        </div>
      )}

      {/* Card Details Overlay */}
      {activeTaskId && (
        <TaskModal
          taskId={activeTaskId}
          onClose={() => setActiveTaskId(null)}
          API_URL={API_URL}
          token={token}
          projectMembers={currentProject ? (currentProject.members || []) : []}
          onTaskUpdated={handleTaskUpdated}
        />
      )}

      {/* New Project Dialog Modal */}
      <dialog ref={newProjectDialogRef} className="modal-wrapper" onClose={() => newProjectDialogRef.current?.close()}>
        <button className="modal-close-btn" onClick={() => newProjectDialogRef.current?.close()}>
          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <div className="modal-header">
          <h2>Create New Project</h2>
        </div>
        <form onSubmit={handleCreateProject} className="modal-body">
          <div className="form-group">
            <label htmlFor="proj-name">Project Name</label>
            <input
              id="proj-name"
              type="text"
              className="form-input"
              placeholder="e.g. Website Overhaul"
              value={newProjName}
              onChange={(e) => setNewProjName(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="proj-desc">Description</label>
            <textarea
              id="proj-desc"
              className="form-input"
              style={{ minHeight: '80px', resize: 'vertical' }}
              placeholder="Provide a brief summary of the workspace goals..."
              value={newProjDesc}
              onChange={(e) => setNewProjDesc(e.target.value)}
            />
          </div>
          <button type="submit" className="auth-btn" style={{ marginTop: '10px' }}>Create Project</button>
        </form>
      </dialog>

      {/* Invite Member Dialog Modal */}
      <dialog ref={inviteMemberDialogRef} className="modal-wrapper" onClose={() => inviteMemberDialogRef.current?.close()}>
        <button className="modal-close-btn" onClick={() => inviteMemberDialogRef.current?.close()}>
          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <div className="modal-header">
          <h2>Invite Team Member</h2>
        </div>
        <form onSubmit={handleInviteSubmit} className="modal-body">
          <div className="form-group">
            <label htmlFor="member-select">Select User</label>
            <div className="select-wrapper">
              {systemUsers.length > 0 ? (
                <select
                  id="member-select"
                  className="select-dropdown"
                  value={inviteUserId}
                  onChange={(e) => setInviteUserId(e.target.value)}
                  required
                >
                  {systemUsers.map(u => (
                    <option key={u.id} value={u.id}>{u.username} ({u.email})</option>
                  ))}
                </select>
              ) : (
                <div style={{ fontSize: '0.85rem', color: 'var(--text-disabled)', fontStyle: 'italic', padding: '10px 0' }}>
                  No other users available to invite to this project.
                </div>
              )}
            </div>
          </div>
          <button 
            type="submit" 
            className="auth-btn" 
            style={{ marginTop: '10px' }} 
            disabled={systemUsers.length === 0}
          >
            Invite Member
          </button>
        </form>
      </dialog>
    </div>
  );
}
