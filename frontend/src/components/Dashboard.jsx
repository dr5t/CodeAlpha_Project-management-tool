import React from 'react';

export default function Dashboard({ projects, onSelectProject, notifications }) {
  // Compute overall statistics
  const totalProjects = projects.length;
  
  let totalTasks = 0;
  let completedTasks = 0;
  const uniqueMembers = new Set();

  projects.forEach(p => {
    totalTasks += p.total_tasks || 0;
    completedTasks += p.completed_tasks || 0;
    if (p.members) {
      p.members.forEach(m => uniqueMembers.add(m.user_id));
    }
  });

  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const activeMembersCount = uniqueMembers.size;

  return (
    <div>
      {/* Visual Statistics Grid */}
      <div className="dashboard-grid">
        <div className="stat-card glass">
          <div className="stat-icon" style={{ backgroundColor: 'rgba(99, 102, 241, 0.15)', color: 'var(--primary)' }}>
            📁
          </div>
          <div className="stat-details">
            <h4>Projects</h4>
            <p>{totalProjects}</p>
          </div>
        </div>

        <div className="stat-card glass">
          <div className="stat-icon" style={{ backgroundColor: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6' }}>
            📋
          </div>
          <div className="stat-details">
            <h4>Total Tasks</h4>
            <p>{totalTasks}</p>
          </div>
        </div>

        <div className="stat-card glass">
          <div className="stat-icon" style={{ backgroundColor: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}>
            ⚡
          </div>
          <div className="stat-details">
            <h4>Task Completion</h4>
            <p>{completionRate}%</p>
          </div>
        </div>

        <div className="stat-card glass">
          <div className="stat-icon" style={{ backgroundColor: 'rgba(168, 85, 247, 0.15)', color: 'var(--accent)' }}>
            👥
          </div>
          <div className="stat-details">
            <h4>Active Members</h4>
            <p>{activeMembersCount}</p>
          </div>
        </div>
      </div>

      {/* Main Sections (Projects Grid + Recent Activities Panel) */}
      <div className="dashboard-sections">
        {/* Project List */}
        <div className="section-card glass" style={{ minHeight: '350px' }}>
          <div className="section-title-wrapper">
            <h3>My Projects</h3>
          </div>
          {projects.length > 0 ? (
            <div className="project-card-list">
              {projects.map((p) => {
                const projPercent = p.total_tasks > 0 ? Math.round((p.completed_tasks / p.total_tasks) * 100) : 0;
                return (
                  <div 
                    key={p.id} 
                    className="project-card glass-interactive"
                    onClick={() => onSelectProject(p)}
                  >
                    <div className="project-card-header">
                      <h4 className="project-card-name">{p.name}</h4>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-disabled)' }}>
                        owner: {p.owner_name}
                      </span>
                    </div>
                    <p className="project-card-desc">{p.description || 'No description provided.'}</p>
                    
                    {/* Progress Bar */}
                    <div style={{ marginBottom: '15px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '6px', color: 'var(--text-muted)' }}>
                        <span>Progress</span>
                        <span>{projPercent}%</span>
                      </div>
                      <div style={{ height: '5px', backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${projPercent}%`, background: 'linear-gradient(90deg, var(--primary) 0%, var(--accent) 100%)', borderRadius: '3px' }} />
                      </div>
                    </div>

                    <div className="project-card-footer">
                      <span className="project-card-stats">
                        {p.completed_tasks} / {p.total_tasks} Tasks
                      </span>
                      <div className="project-members-avatars">
                        {(p.members || []).map((m, idx) => (
                          <div 
                            key={m.user_id || idx}
                            className="avatar member-avatar-stacked"
                            style={{ 
                              backgroundColor: m.avatar_color || '#6366f1',
                              width: '24px',
                              height: '24px',
                              fontSize: '0.7rem'
                            }}
                            title={m.username}
                          >
                            {m.username.charAt(0).toUpperCase()}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '240px', color: 'var(--text-muted)' }}>
              <span style={{ fontSize: '2.5rem', marginBottom: '15px' }}>📂</span>
              <p>No projects found. Click "New Project" to start building your workflow!</p>
            </div>
          )}
        </div>

        {/* Activity Feed */}
        <div className="section-card glass">
          <div className="section-title-wrapper">
            <h3>Recent Updates</h3>
          </div>
          <div className="activity-list">
            {notifications.slice(0, 5).map((n) => (
              <div key={n.id} className="activity-item">
                <div style={{ fontSize: '1rem', marginTop: '2px' }}>
                  {n.type === 'project_invite' ? '🎉' : n.type === 'task_assigned' ? '📌' : '💬'}
                </div>
                <div className="activity-desc">
                  <span className="activity-text">{n.message}</span>
                  <span className="activity-time">
                    {new Date(n.created_at).toLocaleDateString(undefined, { 
                      month: 'short', 
                      day: 'numeric',
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </span>
                </div>
              </div>
            ))}
            {notifications.length === 0 && (
              <div style={{ textAlign: 'center', color: 'var(--text-disabled)', padding: '40px 10px', fontStyle: 'italic', fontSize: '0.85rem' }}>
                No recent notifications or updates.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
