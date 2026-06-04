import React, { useState, useEffect, useRef } from 'react';

export default function TaskModal({ 
  taskId, 
  onClose, 
  API_URL, 
  token, 
  projectMembers,
  onTaskUpdated 
}) {
  const dialogRef = useRef(null);
  const [task, setTask] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);

  // Form edit states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');
  const [status, setStatus] = useState('todo');
  const [dueDate, setDueDate] = useState('');
  const [assigneeId, setAssigneeId] = useState('');

  // Fetch task details and comments
  useEffect(() => {
    if (!taskId) return;

    const fetchDetails = async () => {
      setLoading(true);
      try {
        const headers = { 'Authorization': `Bearer ${token}` };
        
        // 1. Fetch Task Details
        const taskRes = await fetch(`${API_URL}/tasks/${taskId}`, { headers });
        if (!taskRes.ok) throw new Error('Failed to load task details');
        const taskData = await taskRes.json();
        
        setTask(taskData);
        setTitle(taskData.title);
        setDescription(taskData.description || '');
        setPriority(taskData.priority || 'medium');
        setStatus(taskData.status || 'todo');
        setDueDate(taskData.due_date || '');
        setAssigneeId(taskData.assignee_id || '');

        // 2. Fetch Comments
        const commentRes = await fetch(`${API_URL}/comments/${taskId}`, { headers });
        if (commentRes.ok) {
          const commentsData = await commentRes.json();
          setComments(commentsData);
        }

        // Show native dialog modal
        if (dialogRef.current && !dialogRef.current.open) {
          dialogRef.current.showModal();
        }
      } catch (err) {
        console.error(err.message);
        handleClose();
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [taskId]);

  // Listen for WebSocket comment additions (or task updates) while modal is open
  useEffect(() => {
    if (!taskId) return;

    const handleSocketMessage = (e) => {
      try {
        const message = JSON.parse(e.data);
        if (message.type === 'COMMENT_ADDED' && Number(message.taskId) === Number(taskId)) {
          // Prepend/append new comment if not already present
          setComments(prev => {
            if (prev.some(c => c.id === message.comment.id)) return prev;
            return [...prev, message.comment];
          });
        } else if (message.type === 'TASK_UPDATED' && Number(message.taskId) === Number(taskId)) {
          // Sync live modifications (excluding fields current user might be editing)
          setTask(message.task);
        }
      } catch (err) {
        console.error('Socket message parse error in TaskModal:', err);
      }
    };

    window.addEventListener('websocket-message', handleSocketMessage);
    return () => window.removeEventListener('websocket-message', handleSocketMessage);
  }, [taskId]);

  const handleClose = () => {
    if (dialogRef.current) {
      dialogRef.current.close();
    }
    // Give 250ms for fade out transition, then trigger parent onClose
    setTimeout(() => {
      onClose();
    }, 250);
  };

  // Sync changes to backend
  const handleUpdate = async (updatedFields) => {
    try {
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      };
      
      const payload = {
        title: updatedFields.hasOwnProperty('title') ? updatedFields.title : title,
        description: updatedFields.hasOwnProperty('description') ? updatedFields.description : description,
        priority: updatedFields.hasOwnProperty('priority') ? updatedFields.priority : priority,
        status: updatedFields.hasOwnProperty('status') ? updatedFields.status : status,
        due_date: updatedFields.hasOwnProperty('due_date') ? updatedFields.due_date : dueDate,
        assignee_id: updatedFields.hasOwnProperty('assignee_id') ? updatedFields.assignee_id : assigneeId
      };

      const res = await fetch(`${API_URL}/tasks/${taskId}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error('Failed to update task');
      const data = await res.json();
      
      setTask(data);
      if (onTaskUpdated) onTaskUpdated(data);
    } catch (err) {
      console.error('Error updating task:', err);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      const res = await fetch(`${API_URL}/comments/${taskId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ content: newComment.trim() })
      });

      if (!res.ok) throw new Error('Failed to post comment');
      const data = await res.json();

      setComments(prev => [...prev, data]);
      setNewComment('');
      
      // Update task comment count badge locally
      if (task) {
        const updatedTask = { ...task, comment_count: (task.comment_count || 0) + 1 };
        setTask(updatedTask);
        if (onTaskUpdated) onTaskUpdated(updatedTask);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteTask = async () => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    try {
      const res = await fetch(`${API_URL}/tasks/${taskId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to delete task');
      
      if (onTaskUpdated) onTaskUpdated({ id: taskId, deleted: true });
      handleClose();
    } catch (err) {
      console.error(err);
    }
  };

  if (!taskId) return null;

  return (
    <dialog ref={dialogRef} className="modal-wrapper large" onClose={handleClose}>
      <button className="modal-close-btn" onClick={handleClose}>
        <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {loading ? (
        <div style={{ gridColumn: 'span 2', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '300px' }}>
          Loading task details...
        </div>
      ) : (
        <>
          {/* Main Details and Comments */}
          <div className="task-details-main">
            <div style={{ marginBottom: '15px' }}>
              <input
                type="text"
                className="form-input"
                style={{ 
                  fontSize: '1.25rem', 
                  fontWeight: '600', 
                  border: 'none', 
                  background: 'transparent', 
                  padding: '4px 0',
                  borderBottom: '1px solid transparent'
                }}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onBlur={() => handleUpdate({ title })}
                placeholder="Task Title"
              />
            </div>

            {/* Description */}
            <div>
              <h4 className="details-label">Description</h4>
              <textarea
                className="details-textarea"
                placeholder="Add a detailed description for this task..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                onBlur={() => handleUpdate({ description })}
              />
            </div>

            {/* Comments Thread */}
            <div className="comments-container">
              <h4 className="details-label" style={{ marginBottom: '15px' }}>Activity & Comments</h4>
              
              <form onSubmit={handleCommentSubmit} className="comment-input-box">
                <textarea
                  className="comment-field"
                  placeholder="Write a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                />
                <button type="submit" className="comment-submit-btn">Post</button>
              </form>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                {comments.map((c) => (
                  <div key={c.id} className="comment-item">
                    <div 
                      className="avatar" 
                      style={{ 
                        backgroundColor: c.avatar_color || '#6366f1',
                        width: '28px',
                        height: '28px',
                        fontSize: '0.8rem'
                      }}
                    >
                      {c.username.charAt(0).toUpperCase()}
                    </div>
                    <div className="comment-bubble">
                      <div className="comment-header-row">
                        <span className="comment-author">{c.username}</span>
                        <span className="comment-time">
                          {new Date(c.created_at).toLocaleDateString(undefined, { 
                            month: 'short', 
                            day: 'numeric',
                            hour: '2-digit', 
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                      <p className="comment-content">{c.content}</p>
                    </div>
                  </div>
                ))}
                {comments.length === 0 && (
                  <div style={{ textAlign: 'center', color: 'var(--text-disabled)', padding: '20px 0', fontSize: '0.8rem' }}>
                    No comments yet. Be the first to start the conversation!
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar Controls */}
          <div className="task-details-sidebar">
            {/* Status */}
            <div>
              <h4 className="details-label">Status</h4>
              <div className="select-wrapper">
                <select 
                  className="select-dropdown" 
                  value={status} 
                  onChange={(e) => {
                    setStatus(e.target.value);
                    handleUpdate({ status: e.target.value });
                  }}
                >
                  <option value="todo">To Do</option>
                  <option value="in_progress">In Progress</option>
                  <option value="review">Review</option>
                  <option value="done">Completed</option>
                </select>
              </div>
            </div>

            {/* Priority */}
            <div>
              <h4 className="details-label">Priority</h4>
              <div className="select-wrapper">
                <select 
                  className="select-dropdown" 
                  value={priority} 
                  onChange={(e) => {
                    setPriority(e.target.value);
                    handleUpdate({ priority: e.target.value });
                  }}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>

            {/* Assignee */}
            <div>
              <h4 className="details-label">Assignee</h4>
              <div className="select-wrapper">
                <select 
                  className="select-dropdown" 
                  value={assigneeId} 
                  onChange={(e) => {
                    const val = e.target.value ? Number(e.target.value) : '';
                    setAssigneeId(val);
                    handleUpdate({ assignee_id: val });
                  }}
                >
                  <option value="">Unassigned</option>
                  {projectMembers.map(m => (
                    <option key={m.id} value={m.id}>{m.username}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Due Date */}
            <div>
              <h4 className="details-label">Due Date</h4>
              <input
                type="date"
                className="form-input"
                style={{ padding: '8px 10px', fontSize: '0.85rem' }}
                value={dueDate}
                onChange={(e) => {
                  setDueDate(e.target.value);
                  handleUpdate({ due_date: e.target.value });
                }}
              />
            </div>

            {/* Delete Card */}
            <div style={{ marginTop: 'auto', paddingTop: '20px' }}>
              <button 
                className="action-btn btn-secondary" 
                style={{ 
                  width: '100%', 
                  color: 'var(--priority-high)', 
                  borderColor: 'rgba(239,68,68,0.2)',
                  display: 'flex',
                  justifyContent: 'center'
                }}
                onClick={handleDeleteTask}
              >
                Delete Card
              </button>
            </div>
          </div>
        </>
      )}
    </dialog>
  );
}
