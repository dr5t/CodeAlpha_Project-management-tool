import { useState, useRef } from 'react';
import { Avatar, AvatarEditable, Icons, AVATAR_COLORS } from './Avatar';

// const BACKEND = 'http://localhost:5001';

export default function ProfileView({ user, API_URL, token, onProfileUpdated, onLogout }) {
  const [tab, setTab] = useState('profile');
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({ username: user?.username || '', email: user?.email || '' });
  const [selectedColor, setSelectedColor] = useState(user?.avatar_color || '#6366f1');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = useRef(null);

  // Password form
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [pwLoading, setPwLoading] = useState(false);
  const [pwError, setPwError] = useState('');
  const [pwSuccess, setPwSuccess] = useState('');

  // Delete confirm
  const [deleteConfirm, setDeleteConfirm] = useState('');

  const handleFormChange = (e) => {
    setError(''); setSuccess('');
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // ── Avatar file picker ─────────────────────────────────────────────────────
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'].includes(file.type)) {
      setError('Please select a JPG, PNG, WebP, or GIF image.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be smaller than 5 MB.');
      return;
    }
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
    setError('');
  };

  const handleUploadAvatar = async () => {
    if (!avatarFile) return;
    setUploadingAvatar(true); setError('');
    try {
      const formData = new FormData();
      formData.append('avatar', avatarFile);
      const res = await fetch(`${API_URL}/auth/profile/avatar`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');
      onProfileUpdated(data.user, null);
      setAvatarFile(null);
      setAvatarPreview(null);
      setSuccess('Profile photo updated!');
    } catch (err) {
      setError(err.message);
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleRemoveAvatar = async () => {
    try {
      await fetch(`${API_URL}/auth/profile/avatar`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      onProfileUpdated({ ...user, avatar_url: null }, null);
      setAvatarPreview(null);
      setAvatarFile(null);
      setSuccess('Profile photo removed.');
    } catch {
      setError('Failed to remove photo.');
    }
  };

  const handleSaveProfile = async () => {
    if (!form.username.trim() || !form.email.trim()) { setError('Username and email are required.'); return; }
    setLoading(true); setError(''); setSuccess('');
    try {
      const res = await fetch(`${API_URL}/auth/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
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
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
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
        headers: { Authorization: `Bearer ${token}` }
      });
      onLogout();
    } catch {
      setError('Failed to delete account.');
    }
  };

  // Compose the "current" user for avatar display (merging any preview)
  const displayUser = avatarPreview
    ? { ...user, avatar_url: avatarPreview, avatar_color: selectedColor }
    : { ...user, avatar_color: selectedColor };

  return (
    <div className="animate-fade">
      <div className="page-header">
        <div>
          <h1 className="page-title">My Profile</h1>
          <p className="page-subtitle">Manage your account details, photo, and security settings.</p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 24, background: 'rgba(0,0,0,0.2)', padding: 4, borderRadius: 'var(--radius-sm)', width: 'fit-content' }}>
        {[
          { id: 'profile', icon: <Icons.Profile s={14}/>, label: 'Profile' },
          { id: 'security', icon: <Icons.Lock s={14}/>, label: 'Security' },
        ].map(t => (
          <button
            key={t.id}
            id={`profile-tab-${t.id}`}
            className={`auth-tab${tab === t.id ? ' active' : ''}`}
            style={{ minWidth: 120, display: 'flex', alignItems: 'center', gap: 7, justifyContent: 'center' }}
            onClick={() => setTab(t.id)}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      <div className="profile-panel">
        {tab === 'profile' && (
          <>
            {/* ── Hero card ── */}
            <div className="profile-hero">
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                <AvatarEditable user={displayUser} size="xl" onEditClick={() => fileInputRef.current?.click()} />
                {/* Hidden file input */}
                <input
                  ref={fileInputRef}
                  id="avatar-file-input"
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                  style={{ display: 'none' }}
                  onChange={handleFileSelect}
                />
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'center' }}>
                  <button
                    id="btn-pick-photo"
                    className="btn btn-secondary btn-sm"
                    onClick={() => fileInputRef.current?.click()}
                    style={{ display: 'flex', alignItems: 'center', gap: 7 }}
                  >
                    <Icons.Camera s={14} />
                    {user?.avatar_url ? 'Change Photo' : 'Upload Photo'}
                  </button>
                  {user?.avatar_url && !avatarPreview && (
                    <button
                      id="btn-remove-photo"
                      className="btn btn-ghost btn-sm"
                      style={{ fontSize: '0.75rem', color: 'var(--red)' }}
                      onClick={handleRemoveAvatar}
                    >
                      Remove photo
                    </button>
                  )}
                  <p style={{ fontSize: '0.72rem', color: 'var(--text-3)', textAlign: 'center' }}>
                    JPG, PNG, WebP up to 5 MB
                  </p>
                </div>
                {avatarPreview && (
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      id="btn-upload-confirm"
                      className="btn btn-primary btn-sm"
                      onClick={handleUploadAvatar}
                      disabled={uploadingAvatar}
                      style={{ display: 'flex', alignItems: 'center', gap: 6 }}
                    >
                      <Icons.Upload s={13} />
                      {uploadingAvatar ? 'Uploading…' : 'Save Photo'}
                    </button>
                    <button
                      id="btn-upload-cancel"
                      className="btn btn-ghost btn-sm"
                      onClick={() => { setAvatarPreview(null); setAvatarFile(null); }}
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>

              <div className="profile-meta" style={{ flex: 1 }}>
                <h3 style={{ fontSize: '1.2rem' }}>{user?.username}</h3>
                <p style={{ marginBottom: 14 }}>{user?.email}</p>
                {!editMode ? (
                  <button
                    id="btn-edit-profile"
                    className="btn btn-secondary btn-sm"
                    onClick={() => {
                      setEditMode(true);
                      setForm({ username: user?.username || '', email: user?.email || '' });
                      setSelectedColor(user?.avatar_color || '#6366f1');
                      setError(''); setSuccess('');
                    }}
                    style={{ display: 'flex', alignItems: 'center', gap: 7 }}
                  >
                    <Icons.Edit s={14} /> Edit Profile
                  </button>
                ) : (
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      id="btn-save-profile"
                      className="btn btn-primary btn-sm"
                      onClick={handleSaveProfile}
                      disabled={loading}
                      style={{ display: 'flex', alignItems: 'center', gap: 6 }}
                    >
                      <Icons.Check s={13} />
                      {loading ? 'Saving…' : 'Save Changes'}
                    </button>
                    <button id="btn-cancel-edit" className="btn btn-ghost btn-sm" onClick={() => { setEditMode(false); setError(''); setSuccess(''); }}>
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* ── Status messages ── */}
            {error && (
              <div className="error-banner">
                <Icons.Alert s={14} /> {error}
              </div>
            )}
            {success && (
              <div className="success-banner" style={{ background: 'var(--green-bg)', border: '1px solid rgba(52,211,153,0.3)', color: 'var(--green)', borderRadius: 'var(--radius-sm)', padding: '10px 14px', fontSize: '0.83rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                <Icons.Check s={14} /> {success}
              </div>
            )}

            {/* ── Edit form ── */}
            {editMode && (
              <div className="profile-section">
                <div className="profile-section-header">
                  <h4 style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Icons.Edit s={15}/> Edit Details</h4>
                </div>
                <div className="profile-section-body">
                  <div className="form-field">
                    <label className="form-label" htmlFor="profile-username">Username</label>
                    <input
                      id="profile-username" name="username" className="form-input"
                      value={form.username} onChange={handleFormChange}
                    />
                  </div>
                  <div className="form-field">
                    <label className="form-label" htmlFor="profile-email">Email address</label>
                    <input
                      id="profile-email" name="email" type="email" className="form-input"
                      value={form.email} onChange={handleFormChange}
                    />
                  </div>
                  <div className="form-field">
                    <label className="form-label">Avatar Color (when no photo set)</label>
                    <div className="color-swatches" style={{ marginTop: 8 }}>
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
                    <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-2)' }}>Preview:</span>
                      <Avatar user={{ username: form.username || user?.username, avatar_color: selectedColor, avatar_url: null }} size="md" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── Info display ── */}
            {!editMode && (
              <div className="profile-section">
                <div className="profile-section-header">
                  <h4 style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Icons.Profile s={15}/> Account Details</h4>
                </div>
                <div>
                  {[
                    { label: 'Username', value: user?.username },
                    { label: 'Email', value: user?.email },
                    { label: 'Avatar color', value: (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ width: 20, height: 20, borderRadius: '50%', background: user?.avatar_color }} />
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-2)' }}>{user?.avatar_color}</span>
                      </div>
                    )},
                  ].map((row, i) => (
                    <div key={i} className="settings-row" style={{ borderBottom: i < 2 ? undefined : 'none' }}>
                      <div className="settings-row-label">{row.label}</div>
                      <div style={{ fontSize: '0.875rem', color: 'var(--text-2)' }}>{row.value}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {tab === 'security' && (
          <>
            {/* ── Password change ── */}
            <div className="profile-section">
              <div className="profile-section-header">
                <h4 style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Icons.Key s={15}/> Change Password</h4>
              </div>
              <div className="profile-section-body">
                {pwError && <div className="error-banner"><Icons.Alert s={14}/>{pwError}</div>}
                {pwSuccess && (
                  <div style={{ background: 'var(--green-bg)', border: '1px solid rgba(52,211,153,0.3)', color: 'var(--green)', borderRadius: 'var(--radius-sm)', padding: '10px 14px', fontSize: '0.83rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Icons.Check s={13}/> {pwSuccess}
                  </div>
                )}
                <form onSubmit={handlePasswordChange} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div className="form-field">
                    <label className="form-label" htmlFor="current-pw">Current Password</label>
                    <input id="current-pw" type="password" className="form-input"
                      placeholder="Your current password"
                      value={pwForm.currentPassword}
                      onChange={e => { setPwError(''); setPwSuccess(''); setPwForm(p => ({ ...p, currentPassword: e.target.value })); }}
                    />
                  </div>
                  <div className="form-field">
                    <label className="form-label" htmlFor="new-pw">New Password</label>
                    <input id="new-pw" type="password" className="form-input"
                      placeholder="Min. 6 characters"
                      value={pwForm.newPassword}
                      onChange={e => { setPwError(''); setPwForm(p => ({ ...p, newPassword: e.target.value })); }}
                    />
                  </div>
                  <div className="form-field">
                    <label className="form-label" htmlFor="confirm-pw">Confirm New Password</label>
                    <input id="confirm-pw" type="password" className="form-input"
                      placeholder="Re-enter new password"
                      value={pwForm.confirm}
                      onChange={e => { setPwError(''); setPwForm(p => ({ ...p, confirm: e.target.value })); }}
                    />
                  </div>
                  <button id="btn-change-pw" type="submit"
                    className="btn btn-primary"
                    style={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: 7 }}
                    disabled={pwLoading}
                  >
                    <Icons.Lock s={14}/> {pwLoading ? 'Updating…' : 'Change Password'}
                  </button>
                </form>
              </div>
            </div>

            {/* ── Danger zone ── */}
            <div className="profile-section" style={{ borderColor: 'rgba(248,113,113,0.25)' }}>
              <div className="profile-section-header" style={{ borderColor: 'rgba(248,113,113,0.15)' }}>
                <h4 style={{ color: 'var(--red)', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Icons.Warning s={15}/> Danger Zone
                </h4>
              </div>
              <div className="profile-section-body">
                <p style={{ fontSize: '0.85rem', color: 'var(--text-2)', marginBottom: 12, lineHeight: 1.6 }}>
                  Deleting your account is permanent and irreversible. All your projects (that you own) and personal data will be removed.
                </p>
                <div className="form-field">
                  <label className="form-label" htmlFor="delete-confirm-input">
                    Type <strong style={{ color: 'var(--text-1)' }}>{user?.username}</strong> to confirm deletion
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
                  style={{ display: 'flex', alignItems: 'center', gap: 7 }}
                >
                  <Icons.Trash s={14}/> Delete My Account Permanently
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
