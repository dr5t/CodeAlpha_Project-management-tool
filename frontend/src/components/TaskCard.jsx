import React from 'react';

export default function TaskCard({ task, onClick, onDragStart, onDragEnd }) {
  const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== 'done';

  const formatDueDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  return (
    <div
      id={`task-card-${task.id}`}
      className="task-card"
      draggable
      onDragStart={(e) => onDragStart(e, task.id)}
      onDragEnd={(e) => onDragEnd(e, task.id)}
      onClick={onClick}
    >
      <div className="task-card-header">
        <span className={`priority-tag ${task.priority || 'medium'}`}>
          {task.priority || 'medium'}
        </span>
      </div>

      <h4 className="task-card-title">{task.title}</h4>
      {task.description && <p className="task-card-desc">{task.description}</p>}

      <div className="task-card-footer">
        <div className="task-meta-left">
          {task.due_date && (
            <div className={`task-due-date ${isOverdue ? 'overdue' : ''}`} title={isOverdue ? "Overdue" : "Due Date"}>
              <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>{formatDueDate(task.due_date)}</span>
            </div>
          )}
          
          <div className="task-comment-count" title="Comments">
            <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <span>{task.comment_count || 0}</span>
          </div>
        </div>

        {task.assignee_id && (
          <div 
            className="avatar" 
            style={{ 
              backgroundColor: task.assignee_color || '#6366f1',
              width: '24px',
              height: '24px',
              fontSize: '0.7rem'
            }}
            title={`Assigned to ${task.assignee_name}`}
          >
            {(task.assignee_name || 'U').charAt(0).toUpperCase()}
          </div>
        )}
      </div>
    </div>
  );
}
