import React, { useState, useRef, useEffect } from 'react';

const COLUMNS = [
  { id: 'todo', label: 'To Do', color: '#6b7280' },
  { id: 'in_progress', label: 'In Progress', color: '#60a5fa' },
  { id: 'review', label: 'Review', color: '#c084fc' },
  { id: 'done', label: 'Done', color: '#34d399' },
];

const PRIORITY_META = {
  low: { label: 'Low', color: 'var(--blue)' },
  medium: { label: 'Medium', color: 'var(--amber)' },
  high: { label: 'High', color: 'var(--red)' },
};

function formatDate(dateStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function isOverdue(dateStr) {
  if (!dateStr) return false;
  return new Date(dateStr) < new Date() && dateStr;
}

function ContextMenu({ x, y, task, onMove, onOpen, onDelete, onClose }) {
  const ref = useRef(null);

  useEffect(() => {
    function handleDown(e) {
      if (ref.current && !ref.current.contains(e.target)) onClose();
    }
    document.addEventListener('mousedown', handleDown);
    document.addEventListener('contextmenu', onClose);
    return () => {
      document.removeEventListener('mousedown', handleDown);
      document.removeEventListener('contextmenu', onClose);
    };
  }, [onClose]);

  const otherCols = COLUMNS.filter(c => c.id !== task.status);

  return (
    <div
      ref={ref}
      className="ctx-menu"
      style={{ top: y, left: x }}
      id="task-context-menu"
    >
      <div className="ctx-item" onClick={() => { onOpen(task.id); onClose(); }} id="ctx-open">
        <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
        Open Details
      </div>
      <div className="ctx-sep" />
      {otherCols.map(col => (
        <div key={col.id} className="ctx-item" onClick={() => { onMove(task.id, col.id); onClose(); }} id={`ctx-move-${col.id}`}>
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" d="M13 5l7 7-7 7M5 5l7 7-7 7" /></svg>
          Move to {col.label}
        </div>
      ))}
      <div className="ctx-sep" />
      <div className="ctx-item danger" onClick={() => { onDelete(task.id); onClose(); }} id="ctx-delete">
        <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
        Delete Task
      </div>
    </div>
  );
}

function TaskCard({ task, onDragStart, onSelect, onMove, onDelete }) {
  const [ctxMenu, setCtxMenu] = useState(null);
  const p = PRIORITY_META[task.priority] || PRIORITY_META.medium;
  const overdue = isOverdue(task.due_date) && task.status !== 'done';

  function handleContextMenu(e) {
    e.preventDefault();
    setCtxMenu({ x: e.clientX, y: e.clientY });
  }

  return (
    <>
      <div
        id={`task-card-${task.id}`}
        className="task-card"
        draggable
        onDragStart={(e) => { e.dataTransfer.effectAllowed = 'move'; onDragStart(task.id); }}
        onClick={() => onSelect(task.id)}
        onContextMenu={handleContextMenu}
      >
        <div className="task-card-top">
          <div className="task-card-title">{task.title}</div>
          <button
            className="task-card-menu-btn"
            id={`task-menu-${task.id}`}
            onClick={(e) => { e.stopPropagation(); setCtxMenu({ x: e.clientX, y: e.clientY }); }}
            title="More options"
          >
            <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24">
              <circle cx="12" cy="5" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="12" cy="19" r="1.5"/>
            </svg>
          </button>
        </div>

        {task.description && (
          <div className="task-card-desc">{task.description}</div>
        )}

        <div className="task-card-footer">
          <div className="task-meta">
            <span className="priority-badge" style={{ background: p.color + '20', color: p.color }}>
              {p.label}
            </span>
            {task.due_date && (
              <span className={`task-chip${overdue ? ' overdue' : ''}`}>
                <svg width="10" height="10" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>
                </svg>
                {formatDate(task.due_date)}
              </span>
            )}
          </div>
          {task.assignee_username && (
            <div
              title={task.assignee_username}
              style={{
                width: 24, height: 24, borderRadius: '50%',
                background: task.assignee_color || '#6366f1',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.65rem', fontWeight: 700, flexShrink: 0
              }}
            >
              {task.assignee_username[0].toUpperCase()}
            </div>
          )}
        </div>
      </div>

      {ctxMenu && (
        <ContextMenu
          x={ctxMenu.x} y={ctxMenu.y}
          task={task}
          onMove={onMove}
          onOpen={onSelect}
          onDelete={onDelete}
          onClose={() => setCtxMenu(null)}
        />
      )}
    </>
  );
}

function QuickAdd({ colId, onAdd, onCancel }) {
  const [title, setTitle] = useState('');
  const inputRef = useRef(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  function handleKeyDown(e) {
    if (e.key === 'Enter' && title.trim()) { onAdd(title.trim()); }
    if (e.key === 'Escape') { onCancel(); }
  }

  return (
    <div className="quick-add-form">
      <input
        ref={inputRef}
        className="form-input"
        style={{ padding: '8px 10px', fontSize: '0.85rem' }}
        placeholder="Task title…"
        value={title}
        onChange={e => setTitle(e.target.value)}
        onKeyDown={handleKeyDown}
        id={`quick-add-input-${colId}`}
      />
      <div className="quick-add-actions">
        <button className="btn btn-ghost btn-sm" onClick={onCancel} id={`quick-add-cancel-${colId}`}>Cancel</button>
        <button
          className="btn btn-primary btn-sm"
          onClick={() => title.trim() && onAdd(title.trim())}
          disabled={!title.trim()}
          id={`quick-add-confirm-${colId}`}
        >
          Add
        </button>
      </div>
    </div>
  );
}

export default function ProjectBoard({ tasks, onMoveTask, onAddTask, onSelectTask, onDeleteTask, currentProject, onEditProject, onDeleteProject, user }) {
  const [draggingId, setDraggingId] = useState(null);
  const [dragOverCol, setDragOverCol] = useState(null);
  const [addingCol, setAddingCol] = useState(null);

  function handleDrop(e, colId) {
    e.preventDefault();
    if (draggingId && tasks.find(t => t.id === draggingId)?.status !== colId) {
      onMoveTask(draggingId, colId);
    }
    setDraggingId(null);
    setDragOverCol(null);
  }

  return (
    <div className="board-view">
      {/* Board header */}
      <div className="board-header">
        <div style={{ flex: 1 }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, letterSpacing: '-0.01em' }}>
            {currentProject?.name}
          </h2>
          {currentProject?.description && (
            <p style={{ fontSize: '0.8rem', color: 'var(--text-2)', marginTop: 2 }}>
              {currentProject.description}
            </p>
          )}
        </div>
        {/* Project management buttons for owner */}
        {user && currentProject && currentProject.owner_id === user.id && (
          <div style={{ display: 'flex', gap: 8 }}>
            <button id="btn-edit-project" className="btn btn-secondary btn-sm" onClick={onEditProject}>
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                <path strokeLinecap="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/>
              </svg>
              Edit
            </button>
            <button id="btn-delete-project" className="btn btn-danger btn-sm" onClick={onDeleteProject}>
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                <path strokeLinecap="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M4 7h16M10 3h4"/>
              </svg>
              Delete
            </button>
          </div>
        )}
      </div>

      {/* Columns */}
      <div className="board-columns">
        {COLUMNS.map((col, ci) => {
          const colTasks = tasks.filter(t => t.status === col.id);
          const isOver = dragOverCol === col.id;
          return (
            <div
              key={col.id}
              id={`col-${col.id}`}
              className="kanban-col"
              style={{ animationDelay: `${ci * 60}ms` }}
              onDragOver={(e) => { e.preventDefault(); setDragOverCol(col.id); }}
              onDragLeave={() => setDragOverCol(null)}
              onDrop={(e) => handleDrop(e, col.id)}
            >
              <div className="col-header">
                <div className="col-status-dot" style={{ background: col.color }} />
                <span className="col-title">{col.label}</span>
                <span className="col-count">{colTasks.length}</span>
              </div>

              <div className={`col-cards${isOver ? ' drag-over' : ''}`}>
                {colTasks.length === 0 && !isOver && addingCol !== col.id && (
                  <div className="col-drop-hint">Drop cards here</div>
                )}
                {colTasks.map(task => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onDragStart={setDraggingId}
                    onSelect={onSelectTask}
                    onMove={onMoveTask}
                    onDelete={onDeleteTask}
                  />
                ))}
                {addingCol === col.id && (
                  <QuickAdd
                    colId={col.id}
                    onAdd={(title) => { onAddTask(col.id, title); setAddingCol(null); }}
                    onCancel={() => setAddingCol(null)}
                  />
                )}
              </div>

              {addingCol !== col.id && (
                <button
                  id={`col-add-${col.id}`}
                  className="col-add-btn"
                  onClick={() => setAddingCol(col.id)}
                >
                  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" d="M12 5v14m-7-7h14"/>
                  </svg>
                  Add task
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
