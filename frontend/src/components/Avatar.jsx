

export function Avatar({ user, size = 'md', onClick, className = '', style = {} }) {
  const sizeMap = { xs: 22, sm: 28, md: 36, lg: 48, xl: 72, '2xl': 96 };
  const fontMap = { xs: 9, sm: 11, md: 14, lg: 18, xl: 28, '2xl': 38 };
  const px = sizeMap[size] || 36;
  const fs = fontMap[size] || 14;

  const letter = user?.username ? user.username[0].toUpperCase() : '?';
  const bgColor = user?.avatar_color || '#6366f1';

  const baseStyle = {
    width: px, height: px,
    borderRadius: '50%',
    flexShrink: 0,
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'transform 0.18s ease, box-shadow 0.18s ease',
    cursor: onClick ? 'pointer' : 'default',
    ...style
  };

  const handleClick = (e) => { if (onClick) onClick(e); };

  if (user?.avatar_url) {
    const src = (user.avatar_url.startsWith('http') || user.avatar_url.startsWith('blob:') || user.avatar_url.startsWith('data:'))
      ? user.avatar_url
      : `${window.location.port === '5173' ? 'http://localhost:5001' : ''}${user.avatar_url}`;
    return (
      <div style={baseStyle} className={className} onClick={handleClick} title={user?.username}>
        <img
          src={src}
          alt={user?.username || 'Avatar'}
          style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }}
          onError={(e) => {
            e.target.style.display = 'none';
            e.target.parentNode.style.background = bgColor;
          }}
        />
      </div>
    );
  }

  return (
    <div
      style={{ ...baseStyle, background: bgColor, color: '#fff', fontSize: fs, fontWeight: 700 }}
      className={className}
      onClick={handleClick}
      title={user?.username}
    >
      {letter}
    </div>
  );
}

export function AvatarEditable({ user, size = 'xl', onEditClick }) {
  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <Avatar user={user} size={size} />
      <button
        id="avatar-edit-btn"
        onClick={onEditClick}
        title="Change profile picture"
        style={{
          position: 'absolute',
          bottom: 0, right: 0,
          width: 28, height: 28,
          borderRadius: '50%',
          background: 'var(--primary)',
          border: '2px solid var(--bg-card)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          transition: 'background 0.15s ease, transform 0.15s ease',
          boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
        }}
        onMouseEnter={e => e.currentTarget.style.background = 'var(--primary-dark)'}
        onMouseLeave={e => e.currentTarget.style.background = 'var(--primary)'}
      >
        <svg width="13" height="13" fill="none" stroke="white" strokeWidth="2.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round"
            d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/>
        </svg>
      </button>
    </div>
  );
}
