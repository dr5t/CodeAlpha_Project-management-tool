import React, { useState } from 'react';
import TaskCard from './TaskCard';

export default function ProjectBoard({ 
  tasks, 
  onMoveTask, 
  onAddTask, 
  onSelectTask 
}) {
  const [quickAddCol, setQuickAddCol] = useState(null); // 'todo', 'in_progress', 'review', 'done'
  const [quickTitle, setQuickTitle] = useState('');

  const COLUMNS = [
    { id: 'todo', title: 'To Do', badgeColor: '#4b5563' },
    { id: 'in_progress', title: 'In Progress', badgeColor: '#3b82f6' },
    { id: 'review', title: 'In Review', badgeColor: '#a855f7' },
    { id: 'done', title: 'Completed', badgeColor: '#10b981' }
  ];

  // Drag handlers
  const handleDragStart = (e, taskId) => {
    e.dataTransfer.setData('text/plain', taskId);
    setTimeout(() => {
      const card = document.getElementById(`task-card-${taskId}`);
      if (card) card.classList.add('dragging');
    }, 0);
  };

  const handleDragEnd = (e, taskId) => {
    const card = document.getElementById(`task-card-${taskId}`);
    if (card) card.classList.remove('dragging');
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.currentTarget.classList.add('drag-over');
  };

  const handleDragLeave = (e) => {
    e.currentTarget.classList.remove('drag-over');
  };

  const handleDrop = (e, targetStatus) => {
    e.preventDefault();
    e.currentTarget.classList.remove('drag-over');
    
    const taskIdStr = e.dataTransfer.getData('text/plain');
    if (!taskIdStr) return;
    
    const taskId = Number(taskIdStr);
    onMoveTask(taskId, targetStatus);
  };

  // Quick add handlers
  const handleQuickAddSubmit = (e, colId) => {
    e.preventDefault();
    if (!quickTitle.trim()) return;
    
    onAddTask(colId, quickTitle.trim());
    setQuickTitle('');
    setQuickAddCol(null);
  };

  return (
    <div className="kanban-board-container">
      <div className="kanban-board">
        {COLUMNS.map((col) => {
          const colTasks = tasks.filter(t => t.status === col.id);
          
          return (
            <div key={col.id} className="kanban-column">
              {/* Column Header */}
              <div className="column-header">
                <div className="column-title-left">
                  <span className="column-badge" style={{ borderLeft: `3px solid ${col.badgeColor}` }}>
                    {colTasks.length}
                  </span>
                  <h3 className="column-title">{col.title}</h3>
                </div>
                <button 
                  className="add-task-btn" 
                  onClick={() => {
                    setQuickAddCol(col.id);
                    setQuickTitle('');
                  }}
                  title="Add Task"
                >
                  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                </button>
              </div>

              {/* Column Cards Area */}
              <div 
                className="column-task-list"
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, col.id)}
              >
                {/* Inline Quick Add Form */}
                {quickAddCol === col.id && (
                  <form 
                    onSubmit={(e) => handleQuickAddSubmit(e, col.id)}
                    style={{ 
                      backgroundColor: 'var(--bg-card)',
                      border: '1px solid var(--primary)',
                      borderRadius: '10px',
                      padding: '12px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px'
                    }}
                  >
                    <input
                      type="text"
                      className="form-input"
                      style={{ padding: '8px 10px', fontSize: '0.85rem' }}
                      placeholder="Enter task name..."
                      value={quickTitle}
                      onChange={(e) => setQuickTitle(e.target.value)}
                      autoFocus
                      required
                    />
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                      <button 
                        type="button" 
                        className="action-btn btn-secondary"
                        style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                        onClick={() => setQuickAddCol(null)}
                      >
                        Cancel
                      </button>
                      <button 
                        type="submit" 
                        className="action-btn btn-primary"
                        style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                      >
                        Add
                      </button>
                    </div>
                  </form>
                )}

                {colTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onClick={() => onSelectTask(task.id)}
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                  />
                ))}

                {colTasks.length === 0 && quickAddCol !== col.id && (
                  <div style={{ 
                    textAlign: 'center', 
                    padding: '40px 10px', 
                    color: 'var(--text-disabled)', 
                    fontSize: '0.8rem',
                    border: '1px dashed var(--border-color)',
                    borderRadius: '10px'
                  }}>
                    Drag tasks here
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
