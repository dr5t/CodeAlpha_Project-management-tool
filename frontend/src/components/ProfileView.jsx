import React, { useState } from 'react';

const AVATAR_COLORS = [
  '#6366f1','#8b5cf6','#ec4899','#ef4444','#f59e0b',
  '#10b981','#06b6d4','#3b82f6','#84cc16','#14b8a6','#f97316','#06d6a0'
];

function Avatar({ user, size = 'xl', style = {} }) {
  const sz = size === 'xl' ? 72 : size === 'lg' ? 48 : 36;
  const fs = size === 'xl' ? '1.6rem' : size === 'lg' ? '1.1rem' : '0.875rem';
  const letter = user?.username ? user.username[0].toUpperCase() : '?';
  return (
    <div style={{
      width: sz, height: sz, borderRadius: '50%',
      background: user?.avatar_color || '#6366f1',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: fs, fontWeight: 700, flexShrink: 0, ...style
    }}>
      {letter}
    </div>
  );
}

export default function ProfileView({ user, API_URL, token, onProfileUpdated, onLogout }) {
  const [tab, setTab] = useState('profile');
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({ username: user?.username || '', email: user?.email || '' });
  const [selectedColor, setSelectedColor] = useState(user?.avatar_color || '#6366f1');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Password change state
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [pwLoading, setPwLoading] = useState(false);
  const [pwError, setPwError] = useState('');
  const [pwSuccess, setPwSuccess] = useState('');

  // Danger zone
  const [deleteConfirm, setDeleteConfirm] = useState('');

  const handleFormChange = (e) => {
    setError(''); setSuccess('');
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSaveProfile = async () => {
    if (!form.username.trim() || !form.email.trim()) { setError('Username and email are required.'); return; }
    setLoading(true); setError(''); setSuccess('');
    try {
      const res = await fetch(`${API_URL}/auth/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ username: form.username.trim(), email: form.email.trim(), avatar_color: selectedColor })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Update failed');
      onProfileUpdated(data.user, data.token);
      setSuccess('Profile updated successfully!');
      setEditMode(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (!pwForm.currentPassword || !pwForm.newPassword) { setPwError('Fill in both passwords.'); return; }
    if (pwForm.newPassword !== pwForm.confirm) { setPwError('New passwords do not match.'); return; }
    if (pwForm.newPassword.length < 6) { setPwError('Password must be at least 6 characters.'); return; }
    setPwLoading(true); setPwError(''); setPwSuccess('');
    try {
      const res = await fetch(`${API_URL}/auth/profile/password`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Password change failed');
      setPwSuccess('Password changed successfully!');
      setPwForm({ currentPassword: '', newPassword: '', confirm: '' });
    } catch (err) {
      setPwError(err.message);
    } finally {
      setPwLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirm !== user?.username) return;
    try {
      await fetch(`${API_URL}/auth/profile`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      onLogout();
    } catch (err) {
      setError('Failed to delete account.');
    }
  };

  return (
    <div className="animate-fade">
      <div className="page-header">
        <div>
          <h1 className="page-title">My Profile</h1>
          <p className="page-subtitle">Manage your account settings and preferences.</p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 24, background: 'rgba(0,0,0,0.2)', padding: 4, borderRadius: 'var(--radius-sm)', width: 'fit-content' }}>
        {['profile', 'security'].map(t => (
          <button
            key={t}
            id={`profile-tab-${t}`}
            className={`auth-tab${tab === t ? ' active' : ''}`}
            style={{ minWidth: 110 }}
            onClick={() => setTab(t)}
          >
            {t === 'profile' ? '👤 Profile' : '🔒 Security'}
          </button>
        ))}
      </div>

      <div className="profile-panel">
        {tab === 'profile' && (
          <>
            {/* Hero card */}
            <div className="profile-hero">
              <div style={{ position: 'relative', cursor: editMode ? 'pointer' : 'default' }}>
                <Avatar user={{ ...user, avatar_color: selectedColor }} size="xl" />
                {editMode && (
                  <div style={{
                    position: 'absolute', inset: 0, borderRadius: '50%',
                    background: 'rgba(0,0,0,0.55)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexDirection: 'column', gap: 2,
                    color: 'white', fontSize: '0.65rem', fontWeight: 500
                  }}>
                    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/>
                    </svg>
                    Edit
                  </div>
                )}
              </div>
              <div className="profile-meta">
                <h3>{user?.username}</h3>
                <p>{user?.email}</p>
                <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
                  {!editMode ? (
                    <button id="btn-edit-profile" className="btn btn-secondary btn-sm" onClick={() => {
                      setEditMode(true);
                      setForm({ username: user?.username || '', email: user?.email || '' });
                      setSelectedColor(user?.avatar_color || '#6366f1');
                      setError(''); setSuccess('');
                    }}>
                      Edit Profile
                    </button>
                  ) : (
                    <>
                      <button id="btn-save-profile" className="btn btn-primary btn-sm" onClick={handleSaveProfile} disabled={loading}>
                        {loading ? 'Saving…' : 'Save Changes'}
                      </button>
                      <button id="btn-cancel-edit" className="btn btn-ghost btn-sm" onClick={() => { setEditMode(false); setError(''); setSuccess(''); }}>
                        Cancel
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Edit form */}
            {editMode && (
              <div className="profile-section">
                <div className="profile-section-header">
                  <h4>Edit Profile</h4>
                </div>
                <div className="profile-section-body">
                  {error && <div className="error-banner"><svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path strokeLinecap="round" d="M12 8v4m0 4h.01"/></svg>{error}</div>}
                  {success && <div className="success-banner">✅ {success}</div>}

                  <div className="form-field">
                    <label className="form-label" htmlFor="profile-username">Username</label>
                    <input
                      id="profile-username" name="username" className="form-input"
                      value={form.username} onChange={handleFormChange}
                      placeholder="your username"
                    />
                  </div>
                  <div className="form-field">
                    <label className="form-label" htmlFor="profile-email">Email address</label>
                    <input
                      id="profile-email" name="email" type="email" className="form-input"
                      value={form.email} onChange={handleFormChange}
                      placeholder="your@email.com"
                    />
                  </div>
                  <div className="form-field">
                    <label className="form-label">Avatar Color</label>
                    <div className="color-swatches" style={{ marginTop: 6 }}>
                      {AVATAR_COLORS.map(color => (
                        <div
                          key={color}
                          id={`color-swatch-${color.replace('#','')}`}
                          className={`color-swatch${selectedColor === color ? ' selected' : ''}`}
                          style={{ background: color }}
                          onClick={() => setSelectedColor(color)}
                          title={color}
                        />
                      ))}
                    </div>
                    <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-2)' }}>Preview:</span>
                      <Avatar user={{ username: form.username || user?.username, avatar_color: selectedColor }} size="md" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Info display */}
            {!editMode && (
              <div className="profile-section">
                <div className="profile-section-header">
                  <h4>Account Details</h4>
                </div>
                <div className="profile-section-body">
                  {success && <div className="success-banner">✅ {success}</div>}
                  <div className="settings-row" style={{ padding: '10px 0' }}>
                    <div>
                      <div className="settings-row-label">Username</div>
                    </div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-2)' }}>{user?.username}</div>
                  </div>
                  <div className="settings-row" style={{ padding: '10px 0' }}>
                    <div>
                      <div className="settings-row-label">Email</div>
                    </div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-2)' }}>{user?.email}</div>
                  </div>
                  <div className="settings-row" style={{ padding: '10px 0', borderBottom: 'none' }}>
                    <div>
                      <div className="settings-row-label">Avatar Color</div>
                    </div>
                    <div style={{ width: 24, height: 24, borderRadius: '50%', background: user?.avatar_color }} />
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {tab === 'security' && (
          <>
            {/* Password change */}
            <div className="profile-section">
              <div className="profile-section-header">
                <h4>🔑 Change Password</h4>
              </div>
              <div className="profile-section-body">
                {pwError && <div className="error-banner"><svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path strokeLinecap="round" d="M12 8v4m0 4h.01"/></svg>{pwError}</div>}
                {pwSuccess && <div className="success-banner">✅ {pwSuccess}</div>}
                <form onSubmit={handlePasswordChange} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div className="form-field">
                    <label className="form-label" htmlFor="current-pw">Current Password</label>
                    <input
                      id="current-pw" type="password" className="form-input"
                      placeholder="Enter current password"
                      value={pwForm.currentPassword}
                      onChange={e => { setPwError(''); setPwSuccess(''); setPwForm(p => ({ ...p, currentPassword: e.target.value })); }}
                    />
                  </div>
                  <div className="form-field">
                    <label className="form-label" htmlFor="new-pw">New Password</label>
                    <input
                      id="new-pw" type="password" className="form-input"
                      placeholder="Min. 6 characters"
                      value={pwForm.newPassword}
                      onChange={e => { setPwError(''); setPwForm(p => ({ ...p, newPassword: e.target.value })); }}
                    />
                  </div>
                  <div className="form-field">
                    <label className="form-label" htmlFor="confirm-pw">Confirm New Password</label>
                    <input
                      id="confirm-pw" type="password" className="form-input"
                      placeholder="Re-enter new password"
                      value={pwForm.confirm}
                      onChange={e => { setPwError(''); setPwForm(p => ({ ...p, confirm: e.target.value })); }}
                    />
                  </div>
                  <button id="btn-change-pw" type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-start' }} disabled={pwLoading}>
                    {pwLoading ? 'Updating…' : 'Change Password'}
                  </button>
                </form>
              </div>
            </div>

            {/* Danger zone */}
            <div className="profile-section" style={{ borderColor: 'rgba(248,113,113,0.2)' }}>
              <div className="profile-section-header" style={{ borderColor: 'rgba(248,113,113,0.15)' }}>
                <h4 style={{ color: 'var(--red)' }}>⚠️ Danger Zone</h4>
              </div>
              <div className="profile-section-body">
                <p style={{ fontSize: '0.85rem', color: 'var(--text-2)', marginBottom: 12 }}>
                  This action is irreversible. All your projects (that you own) and data will be permanently deleted.
                </p>
                <div className="form-field">
                  <label className="form-label" htmlFor="delete-confirm-input">
                    Type <strong style={{ color: 'var(--text-1)' }}>{user?.username}</strong> to confirm
                  </label>
                  <input
                    id="delete-confirm-input"
                    className="form-input"
                    style={{ borderColor: deleteConfirm === user?.username ? 'var(--red)' : undefined }}
                    placeholder={user?.username}
                    value={deleteConfirm}
                    onChange={e => setDeleteConfirm(e.target.value)}
                  />
                </div>
                <button
                  id="btn-delete-account"
                  className="btn btn-danger"
                  disabled={deleteConfirm !== user?.username}
                  onClick={handleDeleteAccount}
                >
                  Delete My Account
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
