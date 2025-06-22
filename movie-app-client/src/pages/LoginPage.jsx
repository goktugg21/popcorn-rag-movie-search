// src/pages/LoginPage.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:5000';

function LoginPage({ setIsLoggedIn }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  setError('');

  console.log('🔐 LOGIN STARTED:', { username, password: '***' });
  console.log('🔗 API URL:', `${API_BASE_URL}/login`);

  try {
    const response = await axios.post(`${API_BASE_URL}/login`, {
      username,
      password
    }, {
      withCredentials: true,  // REQUIRED FOR COOKIES
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ LOGIN SUCCESSFUL:', response.data);
    console.log('🍪 RESPONSE HEADERS:', response.headers);
    console.log('🍪 SET-COOKIE:', response.headers['set-cookie']);
    
    // Cookie check
    setTimeout(() => {
      const cookies = document.cookie;
      console.log('🍪 COOKIES AFTER LOGIN:', cookies);
      
      const tokenMatch = cookies.match(/token=([^;]+)/);
      if (tokenMatch) {
        console.log('✅ TOKEN FOUND:', tokenMatch[1].substring(0, 20) + '...');
      } else {
        console.log('❌ TOKEN NOT FOUND!');
      }
    }, 100);

    setIsLoggedIn(true);
    navigate('/');
  } catch (error) {
    console.error('❌ LOGIN ERROR:', error);
    if (error.response) {
      setError(error.response.data || 'Login failed!');
    } else {
      setError('Backend connection error!');
    }
  } finally {
    setLoading(false);
  }
};

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        maxWidth: '1200px',
        width: '100%',
        backgroundColor: 'white',
        borderRadius: '20px',
        boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
        overflow: 'hidden',
        minHeight: '600px'
      }}>
        
        {/* Left side - Illustration */}
        <div style={{
          background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '60px 40px',
          color: 'white',
          position: 'relative'
        }}>
          <div style={{
            fontSize: '3rem',
            marginBottom: '20px'
          }}>🎬</div>
          <h2 style={{
            fontSize: '2.5rem',
            fontWeight: 'bold',
            marginBottom: '20px',
            textAlign: 'center'
          }}>CineScope</h2>
          <p style={{
            fontSize: '1.2rem',
            textAlign: 'center',
            opacity: 0.9,
            lineHeight: '1.6'
          }}>
            Discover amazing movies, create your favorites list, and explore the world of cinema
          </p>
          
          {/* Decorative shapes */}
          <div style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            width: '60px',
            height: '60px',
            backgroundColor: 'rgba(255,255,255,0.2)',
            borderRadius: '50%'
          }}></div>
          <div style={{
            position: 'absolute',
            bottom: '40px',
            left: '30px',
            width: '40px',
            height: '40px',
            backgroundColor: 'rgba(255,255,255,0.15)',
            borderRadius: '50%'
          }}></div>
        </div>

        {/* Right side - Login Form */}
        <div style={{
          padding: '60px 50px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center'
        }}>
          <div style={{ marginBottom: '40px' }}>
            <h1 style={{
              fontSize: '2.5rem',
              fontWeight: 'bold',
              color: '#2d3748',
              marginBottom: '10px'
            }}>Welcome Back</h1>
            <p style={{
              color: '#718096',
              fontSize: '1rem'
            }}>
              Don't have an account? {' '}
              <Link to="/register" style={{
                color: '#667eea',
                textDecoration: 'none',
                fontWeight: '500'
              }}>Sign up</Link>
            </p>
          </div>

          {/* Debug Info */}
          <div style={{
            backgroundColor: '#f0f9ff',
            color: '#1e40af',
            padding: '12px 16px',
            borderRadius: '8px',
            marginBottom: '20px',
            fontSize: '0.9rem',
            border: '1px solid #bfdbfe'
          }}>
            🔗 API: {API_BASE_URL} | 🍪 Check console for cookie debug info
          </div>

          {error && (
            <div style={{
              backgroundColor: '#fed7d7',
              color: '#c53030',
              padding: '12px 16px',
              borderRadius: '8px',
              marginBottom: '20px',
              fontSize: '0.9rem'
            }}>
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '25px' }}>
              <label style={{
                display: 'block',
                fontSize: '0.9rem',
                fontWeight: '500',
                color: '#4a5568',
                marginBottom: '8px'
              }}>Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                required
                style={{
                  width: '100%',
                  padding: '16px 20px',
                  fontSize: '1rem',
                  border: '2px solid #e2e8f0',
                  borderRadius: '12px',
                  backgroundColor: '#f7fafc',
                  transition: 'all 0.2s',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#667eea';
                  e.target.style.backgroundColor = 'white';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e2e8f0';
                  e.target.style.backgroundColor = '#f7fafc';
                }}
              />
            </div>

            <div style={{ marginBottom: '30px' }}>
              <label style={{
                display: 'block',
                fontSize: '0.9rem',
                fontWeight: '500',
                color: '#4a5568',
                marginBottom: '8px'
              }}>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                style={{
                  width: '100%',
                  padding: '16px 20px',
                  fontSize: '1rem',
                  border: '2px solid #e2e8f0',
                  borderRadius: '12px',
                  backgroundColor: '#f7fafc',
                  transition: 'all 0.2s',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#667eea';
                  e.target.style.backgroundColor = 'white';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e2e8f0';
                  e.target.style.backgroundColor = '#f7fafc';
                }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '16px',
                fontSize: '1.1rem',
                fontWeight: '600',
                color: 'white',
                background: loading ? '#a0aec0' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                border: 'none',
                borderRadius: '12px',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s',
                transform: loading ? 'none' : 'translateY(0px)',
                boxShadow: loading ? 'none' : '0 4px 15px rgba(102, 126, 234, 0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px'
              }}
              onMouseOver={(e) => {
                if (!loading) {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.6)';
                }
              }}
              onMouseOut={(e) => {
                if (!loading) {
                  e.target.style.transform = 'translateY(0px)';
                  e.target.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.4)';
                }
              }}
            >
              {loading && (
                <div style={{
                  width: '20px',
                  height: '20px',
                  border: '2px solid transparent',
                  borderTop: '2px solid white',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }}></div>
              )}
              {loading ? 'Signing in...' : 'Log in'}
            </button>
          </form>

          <div style={{
            textAlign: 'center',
            marginTop: '30px',
            fontSize: '0.9rem',
            color: '#718096'
          }}>
            Test with any username/password combination
          </div>

          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      </div>

      {/* Media query for responsive design */}
      <style>{`
        @media (max-width: 768px) {
          div[style*="gridTemplateColumns"] {
            grid-template-columns: 1fr !important;
            max-width: 400px !important;
          }
          div[style*="gradient(135deg, #f093fb"] {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}

export default LoginPage;