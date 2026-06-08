import { useState, useEffect } from 'react';
import AgileSpaceLogo from './AgileSpaceLogo';
import LoginCharacter from './LoginCharacter';

const EyeIcon = ({ show }) => {
  if (show) {
    return (
      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
        <path strokeLinecap="round" d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    );
  }
  return (
    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
      <path strokeLinecap="round" d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
      <line x1="3" y1="3" x2="21" y2="21" stroke="currentColor" strokeWidth="2.2" />
    </svg>
  );
};

const Typewriter = ({ text, delay = 50, startDelay = 0, className = '', style = {} }) => {
  const [currentText, setCurrentText] = useState('');
  const [started, setStarted] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setStarted(true);
    }, startDelay);
    return () => clearTimeout(timer);
  }, [startDelay]);

  useEffect(() => {
    if (!started) return;
    let i = 0;
    const interval = setInterval(() => {
      setCurrentText(text.slice(0, i + 1));
      i++;
      if (i >= text.length) {
        clearInterval(interval);
        setDone(true);
      }
    }, delay);
    return () => clearInterval(interval);
  }, [text, delay, started]);

  return (
    <span className={className} style={style}>
      {currentText}
      {!done && started && <span className="typewriter-cursor">|</span>}
    </span>
  );
};

const HEADLINE_FONTS = [
  { family: "'Syne', sans-serif", name: 'Syne' },
  { family: "'Orbitron', sans-serif", name: 'Orbitron' },
  { family: "'Outfit', sans-serif", name: 'Outfit' },
  { family: "'Righteous', sans-serif", name: 'Righteous' },
  { family: "'Space Grotesk', sans-serif", name: 'Space Grotesk' },
  { family: "'Cinzel', serif", name: 'Cinzel' },
  { family: "'Playfair Display', serif", name: 'Playfair Display' },
  { family: "'Syncopate', sans-serif", name: 'Syncopate' },
  { family: "'Unbounded', sans-serif", name: 'Unbounded' },
  { family: "'Plus Jakarta Sans', sans-serif", name: 'Plus Jakarta Sans' }
];

const GRADIENT_PALETTES = [
  'linear-gradient(135deg, #06b6d4 0%, #a855f7 50%, #ec4899 100%)',
  'linear-gradient(135deg, #ff007f 0%, #ff7e00 50%, #ff00ff 100%)',
  'linear-gradient(135deg, #00f2fe 0%, #4facfe 50%, #6366f1 100%)',
  'linear-gradient(135deg, #10b981 0%, #06b6d4 50%, #6366f1 100%)',
  'linear-gradient(135deg, #f59e0b 0%, #ef4444 50%, #ec4899 100%)',
  'linear-gradient(135deg, #34d399 0%, #3b82f6 50%, #8b5cf6 100%)'
];

export default function Auth({ onAuthSuccess, API_URL }) {
  const [tab, setTab] = useState('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [selectedFont] = useState(() => HEADLINE_FONTS[Math.floor(Math.random() * HEADLINE_FONTS.length)]);
  const [selectedGradient] = useState(() => GRADIENT_PALETTES[Math.floor(Math.random() * GRADIENT_PALETTES.length)]);

  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [regData, setRegData] = useState({ username: '', email: '', password: '', confirm: '' });

  const [activeField, setActiveField] = useState('none');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showRegConfirmPassword, setShowRegConfirmPassword] = useState(false);

  const getMascotState = () => {
    if (activeField === 'email' || activeField === 'username') {
      return 'watching';
    }
    if (activeField === 'password') {
      return showLoginPassword ? 'peeking' : 'shy';
    }
    if (activeField === 'reg-password') {
      return showRegPassword ? 'peeking' : 'shy';
    }
    if (activeField === 'reg-confirm') {
      return showRegConfirmPassword ? 'peeking' : 'shy';
    }
    return 'idle';
  };

  const handleLoginChange = (e) => {
    setError('');
    setLoginData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };
  
  const handleRegChange = (e) => {
    setError('');
    setRegData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!loginData.email || !loginData.password) { setError('Please fill in all fields.'); return; }
    setLoading(true); setError('');
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginData.email, password: loginData.password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed');
      onAuthSuccess(data.user, data.token);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!regData.username || !regData.email || !regData.password) { setError('Please fill in all fields.'); return; }
    if (regData.password !== regData.confirm) { setError('Passwords do not match.'); return; }
    if (regData.password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    setLoading(true); setError('');
    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: regData.username, email: regData.email, password: regData.password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Registration failed');
      onAuthSuccess(data.user, data.token);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const switchTab = (newTab) => {
    setTab(newTab);
    setError('');
    setActiveField('none');
    setShowLoginPassword(false);
    setShowRegPassword(false);
    setShowRegConfirmPassword(false);
  };

  return (
    <div className="auth-page">
      <div className="auth-card split">
        
        <div className="auth-card-left">
          <div className="auth-logo-wrap" style={{ marginBottom: 12 }}>
            <AgileSpaceLogo size={42} className="auth-logo-anim" />
            <div 
              className="auth-brand auth-brand-anim animate-gradient-motion"
              style={{
                fontFamily: selectedFont.family,
                backgroundImage: selectedGradient,
              }}
            >
              <Typewriter text="AgileSpace" delay={120} startDelay={100} />
            </div>
            <div className="auth-tagline auth-tagline-anim" style={{ minHeight: '2.8em' }}>
              <Typewriter text="Collaborative project management, reimagined." delay={40} startDelay={1400} />
            </div>
          </div>
          
          <LoginCharacter state={getMascotState()} />
        </div>

        <div className="auth-card-right">
          <div className="auth-tabs">
            <button className={`auth-tab${tab === 'login' ? ' active' : ''}`} onClick={() => switchTab('login')} id="tab-login">
              Sign In
            </button>
            <button className={`auth-tab${tab === 'register' ? ' active' : ''}`} onClick={() => switchTab('register')} id="tab-register">
              Create Account
            </button>
          </div>

          {error && (
            <div className="error-banner">
              <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10"/><path strokeLinecap="round" d="M12 8v4m0 4h.01"/>
              </svg>
              {error}
            </div>
          )}

          {tab === 'login' ? (
            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <div className="form-field">
                <label className="form-label" htmlFor="login-email">Email address</label>
                <input
                  id="login-email" name="email" type="email" className="form-input"
                  placeholder="you@example.com" autoComplete="email"
                  value={loginData.email} onChange={handleLoginChange} required
                  onFocus={() => setActiveField('email')}
                  onBlur={() => setActiveField('none')}
                />
              </div>
              <div className="form-field">
                <label className="form-label" htmlFor="login-password">Password</label>
                <div className="password-input-wrapper">
                  <input
                    id="login-password" name="password"
                    type={showLoginPassword ? 'text' : 'password'}
                    className="form-input"
                    placeholder="••••••••" autoComplete="current-password"
                    value={loginData.password} onChange={handleLoginChange} required
                    onFocus={() => setActiveField('password')}
                    onBlur={() => setActiveField('none')}
                  />
                  <button
                    type="button"
                    className="password-toggle-btn"
                    onClick={() => setShowLoginPassword(p => !p)}
                    title={showLoginPassword ? 'Hide password' : 'Show password'}
                  >
                    <EyeIcon show={showLoginPassword} />
                  </button>
                </div>
              </div>
              <button id="login-submit" type="submit" className="btn btn-primary btn-full auth-submit" disabled={loading}>
                {loading ? <><span className="loading-spinner" style={{width:16,height:16,borderWidth:2}} /> Signing in…</> : 'Sign In'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <div className="form-field">
                <label className="form-label" htmlFor="reg-username">Username</label>
                <input
                  id="reg-username" name="username" type="text" className="form-input"
                  placeholder="yourname" autoComplete="username"
                  value={regData.username} onChange={handleRegChange} required
                  onFocus={() => setActiveField('username')}
                  onBlur={() => setActiveField('none')}
                />
              </div>
              <div className="form-field">
                <label className="form-label" htmlFor="reg-email">Email address</label>
                <input
                  id="reg-email" name="email" type="email" className="form-input"
                  placeholder="you@example.com" autoComplete="email"
                  value={regData.email} onChange={handleRegChange} required
                  onFocus={() => setActiveField('email')}
                  onBlur={() => setActiveField('none')}
                />
              </div>
              <div className="form-field">
                <label className="form-label" htmlFor="reg-password">Password</label>
                <div className="password-input-wrapper">
                  <input
                    id="reg-password" name="password"
                    type={showRegPassword ? 'text' : 'password'}
                    className="form-input"
                    placeholder="Min. 6 characters" autoComplete="new-password"
                    value={regData.password} onChange={handleRegChange} required
                    onFocus={() => setActiveField('reg-password')}
                    onBlur={() => setActiveField('none')}
                  />
                  <button
                    type="button"
                    className="password-toggle-btn"
                    onClick={() => setShowRegPassword(p => !p)}
                    title={showRegPassword ? 'Hide password' : 'Show password'}
                  >
                    <EyeIcon show={showRegPassword} />
                  </button>
                </div>
              </div>
              <div className="form-field">
                <label className="form-label" htmlFor="reg-confirm">Confirm password</label>
                <div className="password-input-wrapper">
                  <input
                    id="reg-confirm" name="confirm"
                    type={showRegConfirmPassword ? 'text' : 'password'}
                    className="form-input"
                    placeholder="Re-enter password" autoComplete="new-password"
                    value={regData.confirm} onChange={handleRegChange} required
                    onFocus={() => setActiveField('reg-confirm')}
                    onBlur={() => setActiveField('none')}
                  />
                  <button
                    type="button"
                    className="password-toggle-btn"
                    onClick={() => setShowRegConfirmPassword(p => !p)}
                    title={showRegConfirmPassword ? 'Hide password' : 'Show password'}
                  >
                    <EyeIcon show={showRegConfirmPassword} />
                  </button>
                </div>
              </div>
              <button id="register-submit" type="submit" className="btn btn-primary btn-full auth-submit" disabled={loading}>
                {loading ? <><span className="loading-spinner" style={{width:16,height:16,borderWidth:2}} /> Creating account…</> : 'Create Account'}
              </button>
            </form>
          )}

          <div className="auth-switch" style={{ marginTop: 24 }}>
            {tab === 'login' ? (
              <>Don't have an account?<button onClick={() => switchTab('register')}>Sign up free</button></>
            ) : (
              <>Already have an account?<button onClick={() => switchTab('login')}>Sign in</button></>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
