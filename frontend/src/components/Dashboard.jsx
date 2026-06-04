import React, { useMemo } from 'react';

function timeAgo(dateStr) {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default function Dashboard({ projects, onSelectProject, notifications, onNewProject }) {
  const totalTasks = useMemo(() => projects.reduce((s, p) => s + (p.total_tasks || 0), 0), [projects]);
  const doneTasks = useMemo(() => projects.reduce((s, p) => s + (p.completed_tasks || 0), 0), [projects]);
  const inProgress = totalTasks - doneTasks;
  const completionRate = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

  const recentNotifs = (notifications || []).slice(0, 8);

  const typeEmoji = { project_invite: '📬', task_assigned: '🎯', comment_added: '💬', task_completed: '✅' };
  const typeColor = { project_invite: 'var(--purple-bg)', task_assigned: 'var(--blue-bg)', comment_added: 'var(--green-bg)', task_completed: 'var(--green-bg)' };

  return (
    <div className="animate-fade">
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Welcome back — here's what's happening across your workspace.</p>
        </div>
        <button id="dash-new-project" className="btn btn-primary" onClick={onNewProject}>
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" d="M12 5v14m-7-7h14"/>
          </svg>
          New Project
        </button>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        {[
          { icon: '📋', bg: 'var(--primary-subtle)', label: 'Total Projects', value: projects.length, color: 'var(--primary-light)' },
          { icon: '✅', bg: 'var(--green-bg)', label: 'Tasks Done', value: doneTasks, color: 'var(--green)' },
          { icon: '🔄', bg: 'var(--blue-bg)', label: 'In Progress', value: inProgress, color: 'var(--blue)' },
          { icon: '📈', bg: 'var(--amber-bg)', label: 'Completion Rate', value: `${completionRate}%`, color: 'var(--amber)' },
        ].map((s, i) => (
          <div key={i} className="stat-card" style={{ animationDelay: `${i * 50}ms` }}>
            <div className="stat-icon" style={{ background: s.bg, color: s.color }}>
              {s.icon}
            </div>
            <div className="stat-body">
              <h4>{s.label}</h4>
              <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Main grid */}
      <div className="dashboard-grid">
        {/* Projects */}
        <div className="section-card">
          <div className="section-card-header">
            <h3>Projects</h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-2)' }}>{projects.length} total</span>
          </div>
          {projects.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🚀</div>
              <div className="empty-title">No projects yet</div>
              <div className="empty-desc">Create your first project to start organizing tasks and collaborating with your team.</div>
              <button id="dash-create-first" className="btn btn-primary" onClick={onNewProject} style={{ marginTop: 8 }}>
                Create First Project
              </button>
            </div>
          ) : (
            <div className="project-cards-grid">
              {projects.map((proj, i) => {
                const pct = proj.total_tasks > 0 ? Math.round((proj.completed_tasks / proj.total_tasks) * 100) : 0;
                return (
                  <div
                    key={proj.id}
                    id={`dash-proj-${proj.id}`}
                    className="project-tile"
                    onClick={() => onSelectProject(proj)}
                    style={{ animationDelay: `${i * 40}ms` }}
                  >
                    <div className="project-tile-name">{proj.name}</div>
                    <div className="project-tile-desc">{proj.description || 'No description provided.'}</div>
                    <div className="project-tile-progress">
                      <div className="progress-label">
                        <span>{proj.completed_tasks || 0} / {proj.total_tasks || 0} tasks</span>
                        <span style={{ color: pct === 100 ? 'var(--green)' : undefined }}>{pct}%</span>
                      </div>
                      <div className="progress-track">
                        <div className="progress-fill" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                    <div className="project-tile-footer">
                      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                        {/* Owner dot */}
                        <div style={{
                          width: 6, height: 6, borderRadius: '50%',
                          background: 'var(--primary)',
                          opacity: 0.7
                        }} />
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-2)' }}>
                          {proj.owner_name}
                        </span>
                      </div>
                      <span style={{
                        fontSize: '0.72rem',
                        padding: '3px 8px',
                        background: 'var(--primary-subtle)',
                        color: 'var(--primary-light)',
                        borderRadius: '99px'
                      }}>
                        Open Board →
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Activity */}
        <div className="section-card">
          <div className="section-card-header">
            <h3>Activity</h3>
          </div>
          <div className="section-card-body">
            {recentNotifs.length === 0 ? (
              <div className="empty-state" style={{ padding: '30px 0' }}>
                <div className="empty-icon">🔔</div>
                <div className="empty-desc">No recent activity.</div>
              </div>
            ) : (
              <div className="activity-list">
                {recentNotifs.map((n, i) => (
                  <div key={n.id} className="activity-item" style={{ animationDelay: `${i * 30}ms` }}>
                    <div className="activity-dot" style={{ background: typeColor[n.type] || 'var(--bg-elevated)' }}>
                      {typeEmoji[n.type] || '🔔'}
                    </div>
                    <div>
                      <div className="activity-text">{n.message}</div>
                      <div className="activity-time">{timeAgo(n.created_at)}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
