// src/pages/PrivacyPage.jsx
import React from 'react';
import { Link } from 'react-router-dom';

function PrivacyPage() {
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f0f9ff',
      padding: '40px 20px',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <div style={{
        maxWidth: '800px',
        margin: '0 auto',
        backgroundColor: 'white',
        borderRadius: '16px',
        boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
        padding: '60px',
        lineHeight: '1.7'
      }}>
        {/* Header */}
        <div style={{
          textAlign: 'center',
          marginBottom: '50px',
          paddingBottom: '30px',
          borderBottom: '2px solid #e5e7eb'
        }}>
          <div style={{
            fontSize: '3rem',
            marginBottom: '20px'
          }}>🔒</div>
          <h1 style={{
            fontSize: '2.5rem',
            fontWeight: '800',
            color: '#1f2937',
            marginBottom: '15px'
          }}>Privacy Policy</h1>
          <p style={{
            color: '#6b7280',
            fontSize: '1.1rem'
          }}>Last updated: {new Date().toLocaleDateString()}</p>
        </div>

        {/* Content */}
        <div style={{ color: '#374151', fontSize: '1rem' }}>
          <section style={{ marginBottom: '40px' }}>
            <h2 style={{
              fontSize: '1.5rem',
              fontWeight: '700',
              color: '#1f2937',
              marginBottom: '20px',
              paddingLeft: '15px',
              borderLeft: '4px solid #3b82f6'
            }}>1. Introduction</h2>
            <p style={{ marginBottom: '15px' }}>
              Movie App ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how your personal 
              information is collected, used, and disclosed by Movie App when you use our mobile application and website.
            </p>
            <p style={{ marginBottom: '15px' }}>
              By using our Service, you agree to the collection and use of information in accordance with this policy.
            </p>
          </section>

          <section style={{ marginBottom: '40px' }}>
            <h2 style={{
              fontSize: '1.5rem',
              fontWeight: '700',
              color: '#1f2937',
              marginBottom: '20px',
              paddingLeft: '15px',
              borderLeft: '4px solid #3b82f6'
            }}>2. Information We Collect</h2>
            
            <h3 style={{
              fontSize: '1.2rem',
              fontWeight: '600',
              color: '#1f2937',
              marginBottom: '15px',
              marginTop: '25px'
            }}>Personal Information</h3>
            <p style={{ marginBottom: '15px' }}>
              We collect information you provide directly to us, such as when you:
            </p>
            <ul style={{ paddingLeft: '30px', marginBottom: '20px' }}>
              <li style={{ marginBottom: '8px' }}>Create an account</li>
              <li style={{ marginBottom: '8px' }}>Update your profile</li>
              <li style={{ marginBottom: '8px' }}>Add movies to your favorites</li>
              <li style={{ marginBottom: '8px' }}>Contact us for support</li>
            </ul>

            <h3 style={{
              fontSize: '1.2rem',
              fontWeight: '600',
              color: '#1f2937',
              marginBottom: '15px',
              marginTop: '25px'
            }}>Usage Information</h3>
            <p style={{ marginBottom: '15px' }}>
              We automatically collect certain information about your use of our Service, including:
            </p>
            <ul style={{ paddingLeft: '30px', marginBottom: '15px' }}>
              <li style={{ marginBottom: '8px' }}>Device information (device type, operating system)</li>
              <li style={{ marginBottom: '8px' }}>App usage data (features used, time spent)</li>
              <li style={{ marginBottom: '8px' }}>Log information (IP address, browser type)</li>
              <li style={{ marginBottom: '8px' }}>Location information (if you grant permission)</li>
            </ul>
          </section>

          <section style={{ marginBottom: '40px' }}>
            <h2 style={{
              fontSize: '1.5rem',
              fontWeight: '700',
              color: '#1f2937',
              marginBottom: '20px',
              paddingLeft: '15px',
              borderLeft: '4px solid #3b82f6'
            }}>3. How We Use Your Information</h2>
            <p style={{ marginBottom: '15px' }}>We use the information we collect to:</p>
            <ul style={{ paddingLeft: '30px', marginBottom: '15px' }}>
              <li style={{ marginBottom: '8px' }}>Provide, maintain, and improve our Service</li>
              <li style={{ marginBottom: '8px' }}>Process transactions and send related information</li>
              <li style={{ marginBottom: '8px' }}>Send technical notices and support messages</li>
              <li style={{ marginBottom: '8px' }}>Respond to your comments and questions</li>
              <li style={{ marginBottom: '8px' }}>Personalize and improve your experience</li>
              <li style={{ marginBottom: '8px' }}>Monitor and analyze usage patterns</li>
              <li style={{ marginBottom: '8px' }}>Detect and prevent fraud and abuse</li>
            </ul>
          </section>

          <section style={{ marginBottom: '40px' }}>
            <h2 style={{
              fontSize: '1.5rem',
              fontWeight: '700',
              color: '#1f2937',
              marginBottom: '20px',
              paddingLeft: '15px',
              borderLeft: '4px solid #3b82f6'
            }}>4. Information Sharing</h2>
            <p style={{ marginBottom: '15px' }}>
              We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, except as described in this policy:
            </p>
            
            <h3 style={{
              fontSize: '1.2rem',
              fontWeight: '600',
              color: '#1f2937',
              marginBottom: '15px',
              marginTop: '25px'
            }}>Service Providers</h3>
            <p style={{ marginBottom: '15px' }}>
              We may share your information with third-party service providers who perform services on our behalf, such as hosting, 
              analytics, and customer support.
            </p>

            <h3 style={{
              fontSize: '1.2rem',
              fontWeight: '600',
              color: '#1f2937',
              marginBottom: '15px',
              marginTop: '25px'
            }}>Legal Requirements</h3>
            <p style={{ marginBottom: '15px' }}>
              We may disclose your information if required by law or if we believe such disclosure is necessary to protect our rights, 
              property, or safety, or the rights, property, or safety of others.
            </p>
          </section>

          <section style={{ marginBottom: '40px' }}>
            <h2 style={{
              fontSize: '1.5rem',
              fontWeight: '700',
              color: '#1f2937',
              marginBottom: '20px',
              paddingLeft: '15px',
              borderLeft: '4px solid #3b82f6'
            }}>5. Data Security</h2>
            <p style={{ marginBottom: '15px' }}>
              We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, 
              alteration, disclosure, or destruction. However, no method of transmission over the internet is 100% secure.
            </p>
            <div style={{
              backgroundColor: '#eff6ff',
              padding: '20px',
              borderRadius: '8px',
              border: '1px solid #bfdbfe',
              marginTop: '15px'
            }}>
              <p style={{ margin: '0', fontWeight: '600', color: '#1e40af' }}>🛡️ Security Measures:</p>
              <ul style={{ paddingLeft: '20px', margin: '10px 0 0 0', color: '#1e40af' }}>
                <li>Encrypted data transmission</li>
                <li>Secure password storage</li>
                <li>Regular security audits</li>
                <li>Limited access controls</li>
              </ul>
            </div>
          </section>

          <section style={{ marginBottom: '40px' }}>
            <h2 style={{
              fontSize: '1.5rem',
              fontWeight: '700',
              color: '#1f2937',
              marginBottom: '20px',
              paddingLeft: '15px',
              borderLeft: '4px solid #3b82f6'
            }}>6. Your Rights and Choices</h2>
            <p style={{ marginBottom: '15px' }}>You have the following rights regarding your personal information:</p>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '20px',
              marginTop: '20px'
            }}>
              <div style={{
                backgroundColor: '#f8fafc',
                padding: '20px',
                borderRadius: '8px',
                border: '1px solid #e2e8f0'
              }}>
                <h4 style={{ margin: '0 0 10px 0', color: '#1f2937', fontWeight: '600' }}>📋 Access</h4>
                <p style={{ margin: '0', fontSize: '0.9rem' }}>Request access to your personal data</p>
              </div>
              <div style={{
                backgroundColor: '#f8fafc',
                padding: '20px',
                borderRadius: '8px',
                border: '1px solid #e2e8f0'
              }}>
                <h4 style={{ margin: '0 0 10px 0', color: '#1f2937', fontWeight: '600' }}>✏️ Update</h4>
                <p style={{ margin: '0', fontSize: '0.9rem' }}>Correct or update your information</p>
              </div>
              <div style={{
                backgroundColor: '#f8fafc',
                padding: '20px',
                borderRadius: '8px',
                border: '1px solid #e2e8f0'
              }}>
                <h4 style={{ margin: '0 0 10px 0', color: '#1f2937', fontWeight: '600' }}>🗑️ Delete</h4>
                <p style={{ margin: '0', fontSize: '0.9rem' }}>Request deletion of your data</p>
              </div>
              <div style={{
                backgroundColor: '#f8fafc',
                padding: '20px',
                borderRadius: '8px',
                border: '1px solid #e2e8f0'
              }}>
                <h4 style={{ margin: '0 0 10px 0', color: '#1f2937', fontWeight: '600' }}>📤 Export</h4>
                <p style={{ margin: '0', fontSize: '0.9rem' }}>Download your data in a portable format</p>
              </div>
            </div>
          </section>

          <section style={{ marginBottom: '40px' }}>
            <h2 style={{
              fontSize: '1.5rem',
              fontWeight: '700',
              color: '#1f2937',
              marginBottom: '20px',
              paddingLeft: '15px',
              borderLeft: '4px solid #3b82f6'
            }}>7. Data Retention</h2>
            <p style={{ marginBottom: '15px' }}>
              We retain your personal information for as long as necessary to provide our services and fulfill the purposes outlined in this policy. 
              When we no longer need your information, we will securely delete or anonymize it.
            </p>
          </section>

          <section style={{ marginBottom: '40px' }}>
            <h2 style={{
              fontSize: '1.5rem',
              fontWeight: '700',
              color: '#1f2937',
              marginBottom: '20px',
              paddingLeft: '15px',
              borderLeft: '4px solid #3b82f6'
            }}>8. Children's Privacy</h2>
            <p style={{ marginBottom: '15px' }}>
              Our Service is not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13. 
              If you are a parent or guardian and believe your child has provided us with personal information, please contact us.
            </p>
          </section>

          <section style={{ marginBottom: '40px' }}>
            <h2 style={{
              fontSize: '1.5rem',
              fontWeight: '700',
              color: '#1f2937',
              marginBottom: '20px',
              paddingLeft: '15px',
              borderLeft: '4px solid #3b82f6'
            }}>9. Changes to This Policy</h2>
            <p style={{ marginBottom: '15px' }}>
              We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page 
              and updating the "Last updated" date. You are advised to review this Privacy Policy periodically for any changes.
            </p>
          </section>

          <section style={{ marginBottom: '40px' }}>
            <h2 style={{
              fontSize: '1.5rem',
              fontWeight: '700',
              color: '#1f2937',
              marginBottom: '20px',
              paddingLeft: '15px',
              borderLeft: '4px solid #3b82f6'
            }}>10. Contact Us</h2>
            <p style={{ marginBottom: '15px' }}>
              If you have any questions about this Privacy Policy or our data practices, please contact us:
            </p>
            <div style={{
              backgroundColor: '#eff6ff',
              padding: '25px',
              borderRadius: '12px',
              border: '1px solid #bfdbfe',
              marginTop: '15px'
            }}>
              <h4 style={{ margin: '0 0 15px 0', color: '#1e40af', fontWeight: '700' }}>📧 Get in Touch</h4>
              <p style={{ margin: '0 0 10px 0', fontWeight: '600', color: '#1e40af' }}>Movie App Privacy Team</p>
              <p style={{ margin: '0 0 8px 0', color: '#1e40af' }}>Email: privacy@movieapp.com</p>
              <p style={{ margin: '0 0 8px 0', color: '#1e40af' }}>Phone: +1 (555) 123-MOVIE</p>
              <p style={{ margin: '0', color: '#1e40af' }}>Address: 123 Cinema Street, Movie City, MC 12345</p>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div style={{
          textAlign: 'center',
          marginTop: '50px',
          paddingTop: '30px',
          borderTop: '2px solid #e5e7eb'
        }}>
          <Link
            to="/register"
            style={{
              display: 'inline-block',
              padding: '12px 30px',
              backgroundColor: '#3b82f6',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '8px',
              fontWeight: '600',
              marginRight: '15px',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#2563eb'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#3b82f6'}
          >
            Back to Registration
          </Link>
          <Link
            to="/terms"
            style={{
              display: 'inline-block',
              padding: '12px 30px',
              backgroundColor: '#6b7280',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '8px',
              fontWeight: '600',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#4b5563'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#6b7280'}
          >
            Terms of Service
          </Link>
        </div>
      </div>

      {/* Mobile Responsive */}
      <style>{`
        @media (max-width: 768px) {
          div[style*="padding: 60px"] {
            padding: 30px 20px !important;
          }
          h1[style*="fontSize: '2.5rem'"] {
            font-size: 2rem !important;
          }
          div[style*="gridTemplateColumns: '1fr 1fr'"] {
            grid-template-columns: 1fr !important;
          }
          div[style*="display: 'inline-block'"] {
            display: block !important;
            margin: 10px 0 !important;
            text-align: center;
          }
        }
      `}</style>
    </div>
  );
}

export default PrivacyPage;