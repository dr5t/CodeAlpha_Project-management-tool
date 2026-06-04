import React, { useState, useEffect, useRef } from 'react';
import { Avatar } from './Avatar';

const STATUSES = [
  { id: 'todo', label: 'To Do' },
  { id: 'in_progress', label: 'In Progress' },
  { id: 'review', label: 'Review' },
  { id: 'done', label: 'Done' },
];
const PRIORITIES = ['low', 'medium', 'high'];

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

// Local Avatar component removed in favor of imported component

export default function TaskModal({ taskId, onClose, API_URL, token, projectMembers, onTaskUpdated }) {
  const dialogRef = useRef(null);
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [error, setError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Editable fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('todo');
  const [priority, setPriority] = useState('medium');
  const [dueDate, setDueDate] = useState('');
  const [assigneeId, setAssigneeId] = useState('');

  // Track dirty state
  const dirty = task && (
    title !== (task.title || '') ||
    description !== (task.description || '') ||
    status !== task.status ||
    priority !== task.priority ||
    dueDate !== (task.due_date ? task.due_date.split('T')[0] : '') ||
    String(assigneeId) !== String(task.assignee_id || '')
  );

  // Open dialog on mount
  useEffect(() => {
    if (dialogRef.current) dialogRef.current.showModal();
  }, []);

  // Fetch task details
  useEffect(() => {
    if (!taskId) return;
    const fetchTask = async () => {
      setLoading(true);
      try {
        const [tRes, cRes] = await Promise.all([
          fetch(`${API_URL}/tasks/${taskId}`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API_URL}/comments/task/${taskId}`, { headers: { Authorization: `Bearer ${token}` } }),
        ]);
        if (!tRes.ok) throw new Error('Failed to load task');
        const tData = await tRes.json();
        const cData = cRes.ok ? await cRes.json() : [];
        setTask(tData);
        setTitle(tData.title || '');
        setDescription(tData.description || '');
        setStatus(tData.status || 'todo');
        setPriority(tData.priority || 'medium');
        setDueDate(tData.due_date ? tData.due_date.split('T')[0] : '');
        setAssigneeId(tData.assignee_id ? String(tData.assignee_id) : '');
        setComments(cData);
      } catch (err) {
        setError('Could not load task details.');
      } finally {
        setLoading(false);
      }
    };
    fetchTask();
  }, [taskId]);

  // Listen for live WebSocket updates to refresh comments
  useEffect(() => {
    const handler = (e) => {
      try {
        const msg = JSON.parse(e.data);
        if (msg.type === 'BOARD_UPDATED') {
          // Re-fetch comments silently
          fetch(`${API_URL}/comments/task/${taskId}`, { headers: { Authorization: `Bearer ${token}` } })
            .then(r => r.ok ? r.json() : null)
            .then(d => { if (d) setComments(d); });
        }
      } catch {}
    };
    window.addEventListener('websocket-message', handler);
    return () => window.removeEventListener('websocket-message', handler);
  }, [taskId]);

  const handleSave = async () => {
    if (!title.trim()) { setError('Title is required.'); return; }
    setSaving(true); setError('');
    try {
      const res = await fetch(`${API_URL}/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          status, priority,
          due_date: dueDate || null,
          assignee_id: assigneeId ? Number(assigneeId) : null
        })
      });
      if (!res.ok) throw new Error('Save failed');
      const updated = await res.json();
      setTask(updated);
      onTaskUpdated(updated);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      const res = await fetch(`${API_URL}/tasks/${taskId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Delete failed');
      onTaskUpdated({ id: taskId, deleted: true });
      handleClose();
    } catch (err) {
      setError(err.message);
      setDeleteConfirmOpen(false);
    }
  };

  const handleAddComment = async () => {
    if (!commentText.trim()) return;
    setSubmittingComment(true);
    try {
      const res = await fetch(`${API_URL}/comments/task/${taskId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ content: commentText.trim() })
      });
      if (!res.ok) throw new Error('Comment failed');
      const newComment = await res.json();
      setComments(prev => [...prev, newComment]);
      setCommentText('');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await fetch(`${API_URL}/comments/${commentId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      setComments(prev => prev.filter(c => c.id !== commentId));
    } catch {}
  };

  const handleClose = () => {
    if (dialogRef.current) dialogRef.current.close();
    onClose();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') handleClose();
  };

  const priorityColors = { low: 'var(--blue)', medium: 'var(--amber)', high: 'var(--red)' };
  const memberOptions = projectMembers || [];
  const selectedAssignee = memberOptions.find(m => String(m.user_id || m.id) === String(assigneeId));

  return (
    <dialog
      ref={dialogRef}
      id="task-detail-dialog"
      onClose={onClose}
      onKeyDown={handleKeyDown}
      style={{ maxWidth: '900px', width: '90vw' }}
    >
      <div className="modal-box two-col" style={{ maxHeight: '90vh' }}>
        {/* ── LEFT COLUMN ── */}
        <div className="modal-col-main">
          {loading ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1 }}>
              <div className="loading-spinner" style={{ width: 32, height: 32 }} />
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="modal-header">
                <input
                  id="task-title-input"
                  className="modal-title-input"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="Task title…"
                />
                <button id="task-modal-close" className="btn btn-ghost btn-icon" onClick={handleClose} title="Close">
                  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {error && (
                <div className="error-banner" style={{ marginBottom: 12 }}>
                  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" /><path strokeLinecap="round" d="M12 8v4m0 4h.01" />
                  </svg>
                  {error}
                </div>
              )}

              {/* Scrollable body */}
              <div className="modal-body-scroll">
                {/* Description */}
                <div className="detail-group">
                  <label className="detail-label" htmlFor="task-desc">Description</label>
                  <textarea
                    id="task-desc"
                    className="detail-textarea"
                    placeholder="Add a detailed description…"
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    rows={4}
                  />
                </div>

                {/* Save action bar */}
                {dirty && (
                  <div style={{
                    display: 'flex', gap: 8, alignItems: 'center',
                    padding: '10px 14px',
                    background: 'var(--primary-subtle)',
                    border: '1px solid var(--border-active)',
                    borderRadius: 'var(--radius-sm)',
                    animation: 'fadeIn 0.2s var(--ease) both'
                  }}>
                    <span style={{ fontSize: '0.82rem', color: 'var(--text-2)', flex: 1 }}>You have unsaved changes</span>
                    <button id="task-discard" className="btn btn-ghost btn-sm" onClick={() => {
                      setTitle(task.title || '');
                      setDescription(task.description || '');
                      setStatus(task.status || 'todo');
                      setPriority(task.priority || 'medium');
                      setDueDate(task.due_date ? task.due_date.split('T')[0] : '');
                      setAssigneeId(task.assignee_id ? String(task.assignee_id) : '');
                      setError('');
                    }}>Discard</button>
                    <button id="task-save" className="btn btn-primary btn-sm" onClick={handleSave} disabled={saving}>
                      {saving ? 'Saving…' : 'Save Changes'}
                    </button>
                  </div>
                )}

                {saveSuccess && (
                  <div className="success-banner">
                    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <polyline strokeLinecap="round" strokeLinejoin="round" points="20 6 9 17 4 12"/>
                    </svg>
                    Task saved successfully
                  </div>
                )}

                {/* Comments */}
                <div className="comments-area">
                  <div className="comments-heading">
                    <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
                    </svg>
                    Comments ({comments.length})
                  </div>

                  <div className="comment-compose">
                    <textarea
                      id="comment-input"
                      className="comment-input"
                      placeholder="Write a comment… (Enter to submit)"
                      value={commentText}
                      onChange={e => setCommentText(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleAddComment();
                        }
                      }}
                      rows={2}
                    />
                    <button
                      id="btn-add-comment"
                      className="btn btn-primary btn-icon"
                      style={{ alignSelf: 'flex-end', width: 38, height: 38 }}
                      onClick={handleAddComment}
                      disabled={!commentText.trim() || submittingComment}
                      title="Post comment"
                    >
                      <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
                      </svg>
                    </button>
                  </div>

                  {comments.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '20px 0', fontSize: '0.82rem', color: 'var(--text-3)' }}>
                      No comments yet. Be the first!
                    </div>
                  ) : (
                    comments.map(c => (
                      <div key={c.id} className="comment-item" id={`comment-${c.id}`}>
                        <Avatar
                          user={{
                            username: c.username || c.author,
                            avatar_color: c.avatar_color,
                            avatar_url: c.avatar_url
                          }}
                          size="sm"
                          style={{ width: 30, height: 30 }}
                        />
                        <div className="comment-bubble" style={{ flex: 1 }}>
                          <div className="comment-meta">
                            <span className="comment-author">{c.username || c.author}</span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <span className="comment-time">{timeAgo(c.created_at)}</span>
                              <button
                                id={`delete-comment-${c.id}`}
                                className="btn btn-ghost btn-icon-sm"
                                style={{ opacity: 0.5 }}
                                title="Delete comment"
                                onClick={() => handleDeleteComment(c.id)}
                              >
                                <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            </div>
                          </div>
                          <div className="comment-body">{c.content || c.body}</div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* ── RIGHT SIDEBAR ── */}
        <div className="modal-col-side">
          {!loading && (
            <>
              <div className="detail-group">
                <label className="detail-label" htmlFor="task-status-select">Status</label>
                <select
                  id="task-status-select"
                  className="detail-select"
                  value={status}
                  onChange={e => setStatus(e.target.value)}
                >
                  {STATUSES.map(s => (
                    <option key={s.id} value={s.id}>{s.label}</option>
                  ))}
                </select>
              </div>

              <div className="detail-group">
                <label className="detail-label" htmlFor="task-priority-select">Priority</label>
                <select
                  id="task-priority-select"
                  className="detail-select"
                  value={priority}
                  onChange={e => setPriority(e.target.value)}
                >
                  {PRIORITIES.map(p => (
                    <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
                  ))}
                </select>
                <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{
                    width: 8, height: 8, borderRadius: '50%',
                    background: priorityColors[priority]
                  }} />
                  <span style={{ fontSize: '0.78rem', color: priorityColors[priority] }}>
                    {priority.charAt(0).toUpperCase() + priority.slice(1)} priority
                  </span>
                </div>
              </div>

              <div className="detail-group">
                <label className="detail-label" htmlFor="task-due-date">Due Date</label>
                <input
                  id="task-due-date"
                  type="date"
                  className="detail-select"
                  value={dueDate}
                  onChange={e => setDueDate(e.target.value)}
                  style={{ colorScheme: 'dark' }}
                />
                {dueDate && (
                  <button
                    id="clear-due-date"
                    className="btn btn-ghost btn-sm"
                    style={{ marginTop: 6, fontSize: '0.75rem', padding: '4px 8px' }}
                    onClick={() => setDueDate('')}
                  >
                    Clear date
                  </button>
                )}
              </div>

              <div className="detail-group">
                <label className="detail-label" htmlFor="task-assignee-select">Assignee</label>
                <select
                  id="task-assignee-select"
                  className="detail-select"
                  value={assigneeId}
                  onChange={e => setAssigneeId(e.target.value)}
                >
                  <option value="">Unassigned</option>
                  {memberOptions.map(m => (
                    <option key={m.user_id || m.id} value={m.user_id || m.id}>
                      {m.username}
                    </option>
                  ))}
                </select>
                {selectedAssignee && (
                  <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Avatar
                      user={{
                        username: selectedAssignee.username,
                        avatar_color: selectedAssignee.avatar_color,
                        avatar_url: selectedAssignee.avatar_url
                      }}
                      size="sm"
                      style={{ width: 24, height: 24 }}
                    />
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-2)' }}>{selectedAssignee.username}</span>
                  </div>
                )}
              </div>

              {/* Task metadata */}
              {task && (
                <div style={{ borderTop: '1px solid var(--border)', paddingTop: 16 }}>
                  <div className="detail-label" style={{ marginBottom: 10 }}>Created</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-2)' }}>
                    {task.created_at ? new Date(task.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : '—'}
                  </div>
                </div>
              )}

              {/* Delete task */}
              <div style={{ marginTop: 'auto', paddingTop: 12, borderTop: '1px solid var(--border)' }}>
                {!deleteConfirmOpen ? (
                  <button
                    id="btn-delete-task"
                    className="btn btn-danger btn-full btn-sm"
                    onClick={() => setDeleteConfirmOpen(true)}
                  >
                    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M4 7h16M10 3h4"/>
                    </svg>
                    Delete Task
                  </button>
                ) : (
                  <div style={{
                    background: 'var(--red-bg)', border: '1px solid rgba(248,113,113,0.3)',
                    borderRadius: 'var(--radius-sm)', padding: 12,
                    animation: 'fadeInScale 0.2s var(--ease-spring) both'
                  }}>
                    <p style={{ fontSize: '0.8rem', color: 'var(--red)', marginBottom: 10, fontWeight: 500 }}>
                      Are you sure? This cannot be undone.
                    </p>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button id="confirm-delete-task" className="btn btn-danger btn-sm btn-full" onClick={handleDelete}>
                        Yes, Delete
                      </button>
                      <button id="cancel-delete-task" className="btn btn-ghost btn-sm btn-full" onClick={() => setDeleteConfirmOpen(false)}>
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </dialog>
  );
}
