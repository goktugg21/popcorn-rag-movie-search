// src/pages/RegisterPage.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:5000';

function RegisterPage() {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (error) setError('');
  };

  const validateForm = () => {
    if (!formData.username.trim()) {
      setError('Username is required');
      return false;
    }
    if (formData.username.length < 3) {
      setError('Username must be at least 3 characters');
      return false;
    }
    if (!formData.password) {
      setError('Password is required');
      return false;
    }
    if (formData.password.length < 3) {
      setError('Password must be at least 3 characters');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      console.log('Sending registration request to:', `${API_BASE_URL}/register`);
      console.log('Data:', { username: formData.username, password: formData.password });

      const response = await axios.post(`${API_BASE_URL}/register`, {
        username: formData.username,
        password: formData.password
      }, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 10000 // 10 second timeout
      });

      console.log('Registration successful:', response.data);
      setSuccess(true);
      
      // Redirect after 3 seconds
      setTimeout(() => {
        navigate('/login');
      }, 3000);

    } catch (error) {
      console.error('Registration error:', error);
      
      if (error.code === 'ECONNREFUSED') {
        setError('Cannot connect to server. Please make sure the backend is running on port 5000.');
      } else if (error.response) {
        // Server responded with an error
        const errorMessage = error.response.data;
        if (typeof errorMessage === 'string') {
          setError(errorMessage);
        } else {
          setError('Registration failed. Please try again.');
        }
        console.log('Server error response:', error.response.data);
        console.log('Status:', error.response.status);
      } else if (error.request) {
        // Request was made but no response received
        setError('No response from server. Please check your connection.');
        console.log('No response received:', error.request);
      } else {
        // Something else happened
        setError('An unexpected error occurred. Please try again.');
        console.log('Error:', error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  // Success Page
  if (success) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }}>
        <div style={{
          backgroundColor: 'white',
          borderRadius: '24px',
          padding: '80px 60px',
          textAlign: 'center',
          boxShadow: '0 25px 50px rgba(0,0,0,0.15)',
          maxWidth: '500px',
          width: '100%'
        }}>
          <div style={{
            fontSize: '5rem',
            marginBottom: '30px',
            animation: 'bounce 2s ease-in-out infinite'
          }}>🎉</div>
          
          <h1 style={{
            fontSize: '2.8rem',
            fontWeight: '800',
            color: '#10b981',
            marginBottom: '20px',
            lineHeight: '1.2'
          }}>Welcome to CineScope!</h1>
          
          <p style={{
            fontSize: '1.3rem',
            color: '#6b7280',
            marginBottom: '40px',
            lineHeight: '1.5'
          }}>
            Your account has been created successfully! 🎬<br />
            Get ready to discover amazing movies and create your personal collection.
          </p>

          <div style={{
            width: '100%',
            height: '6px',
            backgroundColor: '#e5e7eb',
            borderRadius: '3px',
            overflow: 'hidden',
            marginBottom: '20px'
          }}>
            <div style={{
              height: '100%',
              backgroundColor: '#667eea',
              borderRadius: '3px',
              animation: 'progress 3s linear forwards'
            }}></div>
          </div>

          <p style={{
            color: '#9ca3af',
            fontSize: '1rem',
            marginBottom: '20px'
          }}>
            Redirecting to login page...
          </p>

          <Link 
            to="/login"
            style={{
              display: 'inline-block',
              padding: '12px 24px',
              backgroundColor: '#667eea',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '12px',
              fontWeight: '600',
              transition: 'all 0.2s ease'
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#5a67d8'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#667eea'}
          >
            Continue to Login
          </Link>

          <style>{`
            @keyframes bounce {
              0%, 20%, 53%, 80%, 100% { 
                transform: translate3d(0,0,0); 
              }
              40%, 43% { 
                transform: translate3d(0, -20px, 0); 
              }
              70% { 
                transform: translate3d(0, -10px, 0); 
              }
              90% { 
                transform: translate3d(0, -4px, 0); 
              }
            }
            @keyframes progress {
              from { width: 0%; }
              to { width: 100%; }
            }
          `}</style>
        </div>
      </div>
    );
  }

  // Register Form
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        maxWidth: '1400px',
        width: '100%',
        backgroundColor: 'white',
        borderRadius: '32px',
        boxShadow: '0 25px 50px rgba(0,0,0,0.15)',
        overflow: 'hidden',
        minHeight: '750px'
      }}>
        
        {/* Left Panel - Illustration */}
        <div style={{
          background: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 50%, #fecfef 100%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '80px 60px',
          color: 'white',
          position: 'relative',
          textAlign: 'center'
        }}>
          {/* Floating elements */}
          <div style={{
            position: 'absolute',
            top: '60px',
            left: '60px',
            width: '100px',
            height: '100px',
            backgroundColor: 'rgba(255,255,255,0.1)',
            borderRadius: '50%',
            animation: 'float 3s ease-in-out infinite'
          }}></div>
          
          <div style={{
            position: 'absolute',
            bottom: '80px',
            right: '80px',
            width: '60px',
            height: '60px',
            backgroundColor: 'rgba(255,255,255,0.15)',
            borderRadius: '50%',
            animation: 'float 3s ease-in-out infinite 1s'
          }}></div>

          <div style={{
            fontSize: '4rem',
            marginBottom: '30px',
            filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.1))'
          }}>🎬</div>
          
          <h1 style={{
            fontSize: '3.5rem',
            fontWeight: '900',
            marginBottom: '30px',
            lineHeight: '1.1',
            textShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            Join CineScope<br />Community
          </h1>
          
          <p style={{
            fontSize: '1.4rem',
            opacity: 0.95,
            lineHeight: '1.6',
            maxWidth: '400px'
          }}>
            Discover amazing movies, create your personal watchlist, and explore the world of cinema with custom character tropes.
          </p>

          <style>{`
            @keyframes float {
              0%, 100% { transform: translateY(0px); }
              50% { transform: translateY(-20px); }
            }
          `}</style>
        </div>

        {/* Right Panel - Form */}
        <div style={{
          padding: '80px 60px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center'
        }}>
          <div style={{ marginBottom: '50px' }}>
            <h2 style={{
              fontSize: '3rem',
              fontWeight: '800',
              color: '#1f2937',
              marginBottom: '15px',
              lineHeight: '1.2'
            }}>Create Account</h2>
            
            <p style={{
              color: '#6b7280',
              fontSize: '1.1rem',
              lineHeight: '1.5'
            }}>
              Already have an account?{' '}
              <Link to="/login" style={{
                color: '#ff9a9e',
                textDecoration: 'none',
                fontWeight: '600',
                borderBottom: '2px solid transparent',
                transition: 'border-color 0.2s'
              }}
              onMouseOver={(e) => e.target.style.borderBottomColor = '#ff9a9e'}
              onMouseOut={(e) => e.target.style.borderBottomColor = 'transparent'}
              >
                Sign in here
              </Link>
            </p>
          </div>

          {/* Connection Status */}
          <div style={{
            backgroundColor: '#f0f9ff',
            color: '#1e40af',
            padding: '12px 16px',
            borderRadius: '8px',
            marginBottom: '20px',
            fontSize: '0.9rem',
            border: '1px solid #bfdbfe',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span>🔗</span>
            Backend API: {API_BASE_URL}
          </div>

          {/* Cookie Debug Info */}
          <div style={{
            backgroundColor: '#fffbeb',
            color: '#92400e',
            padding: '12px 16px',
            borderRadius: '8px',
            marginBottom: '20px',
            fontSize: '0.9rem',
            border: '1px solid #fbbf24'
          }}>
            <span>🍪</span>
            <strong> Debug:</strong> Check console for cookie information after login
          </div>

          {error && (
            <div style={{
              backgroundColor: '#fef2f2',
              color: '#dc2626',
              padding: '16px 20px',
              borderRadius: '12px',
              marginBottom: '30px',
              fontSize: '0.95rem',
              border: '1px solid #fecaca',
              display: 'flex',
              alignItems: 'center'
            }}>
              <span style={{ marginRight: '8px' }}>⚠️</span>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ width: '100%' }}>
            <div style={{ marginBottom: '30px' }}>
              <label style={{
                display: 'block',
                fontSize: '1rem',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '12px'
              }}>
                Username *
              </label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                placeholder="Choose your username (min 3 characters)"
                required
                minLength={3}
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '18px 24px',
                  fontSize: '1.1rem',
                  border: `2px solid ${error && error.includes('username') ? '#ef4444' : '#e5e7eb'}`,
                  borderRadius: '16px',
                  backgroundColor: loading ? '#f3f4f6' : '#f9fafb',
                  transition: 'all 0.3s ease',
                  outline: 'none',
                  boxSizing: 'border-box',
                  opacity: loading ? 0.7 : 1
                }}
                onFocus={(e) => {
                  if (!loading) {
                    e.target.style.borderColor = '#ff9a9e';
                    e.target.style.backgroundColor = 'white';
                    e.target.style.boxShadow = '0 0 0 3px rgba(255, 154, 158, 0.1)';
                  }
                }}
                onBlur={(e) => {
                  if (!loading) {
                    e.target.style.borderColor = '#e5e7eb';
                    e.target.style.backgroundColor = '#f9fafb';
                    e.target.style.boxShadow = 'none';
                  }
                }}
              />
              <small style={{ color: '#6b7280', fontSize: '0.85rem' }}>
                Username must be at least 3 characters long
              </small>
            </div>

            <div style={{ marginBottom: '30px' }}>
              <label style={{
                display: 'block',
                fontSize: '1rem',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '12px'
              }}>
                Password *
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Create a secure password (min 3 characters)"
                required
                minLength={3}
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '18px 24px',
                  fontSize: '1.1rem',
                  border: `2px solid ${error && error.includes('password') ? '#ef4444' : '#e5e7eb'}`,
                  borderRadius: '16px',
                  backgroundColor: loading ? '#f3f4f6' : '#f9fafb',
                  transition: 'all 0.3s ease',
                  outline: 'none',
                  boxSizing: 'border-box',
                  opacity: loading ? 0.7 : 1
                }}
                onFocus={(e) => {
                  if (!loading) {
                    e.target.style.borderColor = '#ff9a9e';
                    e.target.style.backgroundColor = 'white';
                    e.target.style.boxShadow = '0 0 0 3px rgba(255, 154, 158, 0.1)';
                  }
                }}
                onBlur={(e) => {
                  if (!loading) {
                    e.target.style.borderColor = '#e5e7eb';
                    e.target.style.backgroundColor = '#f9fafb';
                    e.target.style.boxShadow = 'none';
                  }
                }}
              />
            </div>

            <div style={{ marginBottom: '40px' }}>
              <label style={{
                display: 'block',
                fontSize: '1rem',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '12px'
              }}>
                Confirm Password *
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                placeholder="Confirm your password"
                required
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '18px 24px',
                  fontSize: '1.1rem',
                  border: `2px solid ${error && error.includes('match') ? '#ef4444' : '#e5e7eb'}`,
                  borderRadius: '16px',
                  backgroundColor: loading ? '#f3f4f6' : '#f9fafb',
                  transition: 'all 0.3s ease',
                  outline: 'none',
                  boxSizing: 'border-box',
                  opacity: loading ? 0.7 : 1
                }}
                onFocus={(e) => {
                  if (!loading) {
                    e.target.style.borderColor = '#ff9a9e';
                    e.target.style.backgroundColor = 'white';
                    e.target.style.boxShadow = '0 0 0 3px rgba(255, 154, 158, 0.1)';
                  }
                }}
                onBlur={(e) => {
                  if (!loading) {
                    e.target.style.borderColor = '#e5e7eb';
                    e.target.style.backgroundColor = '#f9fafb';
                    e.target.style.boxShadow = 'none';
                  }
                }}
              />
              {formData.password && formData.confirmPassword && formData.password !== formData.confirmPassword && (
                <small style={{ color: '#ef4444', fontSize: '0.85rem' }}>
                  Passwords do not match
                </small>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '20px',
                fontSize: '1.2rem',
                fontWeight: '700',
                color: 'white',
                background: loading 
                  ? '#9ca3af' 
                  : 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
                border: 'none',
                borderRadius: '16px',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s ease',
                transform: loading ? 'none' : 'translateY(0px)',
                boxShadow: loading 
                  ? 'none' 
                  : '0 10px 25px rgba(255, 154, 158, 0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px'
              }}
              onMouseOver={(e) => {
                if (!loading) {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 15px 35px rgba(255, 154, 158, 0.6)';
                }
              }}
              onMouseOut={(e) => {
                if (!loading) {
                  e.target.style.transform = 'translateY(0px)';
                  e.target.style.boxShadow = '0 10px 25px rgba(255, 154, 158, 0.4)';
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
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <div style={{
            textAlign: 'center',
            marginTop: '40px',
            fontSize: '0.95rem',
            color: '#6b7280'
          }}>
            By creating an account, you agree to our{' '}
            <Link 
              to="/terms" 
              style={{
                color: '#ff9a9e',
                textDecoration: 'none',
                fontWeight: '500'
              }}
              onMouseOver={(e) => e.target.style.textDecoration = 'underline'}
              onMouseOut={(e) => e.target.style.textDecoration = 'none'}
            >
              Terms of Service
            </Link>
            {' '}and{' '}
            <Link 
              to="/privacy" 
              style={{
                color: '#ff9a9e',
                textDecoration: 'none',
                fontWeight: '500'
              }}
              onMouseOver={(e) => e.target.style.textDecoration = 'underline'}
              onMouseOut={(e) => e.target.style.textDecoration = 'none'}
            >
              Privacy Policy
            </Link>
          </div>

          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      </div>

      {/* Mobile Responsive */}
      <style>{`
        @media (max-width: 768px) {
          div[style*="gridTemplateColumns"] {
            grid-template-columns: 1fr !important;
            max-width: 500px !important;
          }
          div[style*="gradient(135deg, #ff9a9e"] {
            display: none !important;
          }
          div[style*="padding: 80px 60px"] {
            padding: 40px 30px !important;
          }
        }
      `}</style>
    </div>
  );
}

export default RegisterPage;