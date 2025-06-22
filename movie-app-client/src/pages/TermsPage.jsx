// src/pages/TermsPage.jsx
import React from 'react';
import { Link } from 'react-router-dom';

function TermsPage() {
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f8fafc',
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
          }}>📄</div>
          <h1 style={{
            fontSize: '2.5rem',
            fontWeight: '800',
            color: '#1f2937',
            marginBottom: '15px'
          }}>Terms of Service</h1>
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
              borderLeft: '4px solid #ff9a9e'
            }}>1. Acceptance of Terms</h2>
            <p style={{ marginBottom: '15px' }}>
              By accessing and using Movie App, you accept and agree to be bound by the terms and provision of this agreement. 
              If you do not agree to abide by the above, please do not use this service.
            </p>
          </section>

          <section style={{ marginBottom: '40px' }}>
            <h2 style={{
              fontSize: '1.5rem',
              fontWeight: '700',
              color: '#1f2937',
              marginBottom: '20px',
              paddingLeft: '15px',
              borderLeft: '4px solid #ff9a9e'
            }}>2. Use License</h2>
            <p style={{ marginBottom: '15px' }}>
              Permission is granted to temporarily download one copy of Movie App per device for personal, 
              non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
            </p>
            <ul style={{ paddingLeft: '30px', marginBottom: '15px' }}>
              <li style={{ marginBottom: '8px' }}>modify or copy the materials</li>
              <li style={{ marginBottom: '8px' }}>use the materials for any commercial purpose</li>
              <li style={{ marginBottom: '8px' }}>attempt to decompile or reverse engineer any software</li>
              <li style={{ marginBottom: '8px' }}>remove any copyright or other proprietary notations</li>
            </ul>
          </section>

          <section style={{ marginBottom: '40px' }}>
            <h2 style={{
              fontSize: '1.5rem',
              fontWeight: '700',
              color: '#1f2937',
              marginBottom: '20px',
              paddingLeft: '15px',
              borderLeft: '4px solid #ff9a9e'
            }}>3. User Accounts</h2>
            <p style={{ marginBottom: '15px' }}>
              When you create an account with us, you must provide information that is accurate, complete, and current at all times. 
              You are responsible for safeguarding the password and for all activities that occur under your account.
            </p>
            <p style={{ marginBottom: '15px' }}>
              You agree not to disclose your password to any third party and to take sole responsibility for any activities 
              or actions under your account, whether or not you have authorized such activities.
            </p>
          </section>

          <section style={{ marginBottom: '40px' }}>
            <h2 style={{
              fontSize: '1.5rem',
              fontWeight: '700',
              color: '#1f2937',
              marginBottom: '20px',
              paddingLeft: '15px',
              borderLeft: '4px solid #ff9a9e'
            }}>4. Content</h2>
            <p style={{ marginBottom: '15px' }}>
              Our Service allows you to post, link, store, share and otherwise make available certain information, text, 
              graphics, or other material. You are responsible for the content that you post to the Service.
            </p>
            <p style={{ marginBottom: '15px' }}>
              You retain any and all of your rights to any content you submit, post or display on or through the Service 
              and you are responsible for protecting those rights.
            </p>
          </section>

          <section style={{ marginBottom: '40px' }}>
            <h2 style={{
              fontSize: '1.5rem',
              fontWeight: '700',
              color: '#1f2937',
              marginBottom: '20px',
              paddingLeft: '15px',
              borderLeft: '4px solid #ff9a9e'
            }}>5. Privacy Policy</h2>
            <p style={{ marginBottom: '15px' }}>
              Your privacy is important to us. Please review our Privacy Policy, which also governs your use of the Service, 
              to understand our practices.
            </p>
          </section>

          <section style={{ marginBottom: '40px' }}>
            <h2 style={{
              fontSize: '1.5rem',
              fontWeight: '700',
              color: '#1f2937',
              marginBottom: '20px',
              paddingLeft: '15px',
              borderLeft: '4px solid #ff9a9e'
            }}>6. Prohibited Uses</h2>
            <p style={{ marginBottom: '15px' }}>You may not use our Service:</p>
            <ul style={{ paddingLeft: '30px', marginBottom: '15px' }}>
              <li style={{ marginBottom: '8px' }}>For any unlawful purpose or to solicit others to unlawful acts</li>
              <li style={{ marginBottom: '8px' }}>To violate any international, federal, provincial, or state regulations, rules, laws, or local ordinances</li>
              <li style={{ marginBottom: '8px' }}>To infringe upon or violate our intellectual property rights or the intellectual property rights of others</li>
              <li style={{ marginBottom: '8px' }}>To harass, abuse, insult, harm, defame, slander, disparage, intimidate, or discriminate</li>
              <li style={{ marginBottom: '8px' }}>To submit false or misleading information</li>
            </ul>
          </section>

          <section style={{ marginBottom: '40px' }}>
            <h2 style={{
              fontSize: '1.5rem',
              fontWeight: '700',
              color: '#1f2937',
              marginBottom: '20px',
              paddingLeft: '15px',
              borderLeft: '4px solid #ff9a9e'
            }}>7. Termination</h2>
            <p style={{ marginBottom: '15px' }}>
              We may terminate or suspend your account and bar access to the Service immediately, without prior notice or liability, 
              under our sole discretion, for any reason whatsoever and without limitation.
            </p>
          </section>

          <section style={{ marginBottom: '40px' }}>
            <h2 style={{
              fontSize: '1.5rem',
              fontWeight: '700',
              color: '#1f2937',
              marginBottom: '20px',
              paddingLeft: '15px',
              borderLeft: '4px solid #ff9a9e'
            }}>8. Changes to Terms</h2>
            <p style={{ marginBottom: '15px' }}>
              We reserve the right, at our sole discretion, to modify or replace these Terms at any time. 
              If a revision is material, we will provide at least 30 days notice prior to any new terms taking effect.
            </p>
          </section>

          <section style={{ marginBottom: '40px' }}>
            <h2 style={{
              fontSize: '1.5rem',
              fontWeight: '700',
              color: '#1f2937',
              marginBottom: '20px',
              paddingLeft: '15px',
              borderLeft: '4px solid #ff9a9e'
            }}>9. Contact Information</h2>
            <p style={{ marginBottom: '15px' }}>
              If you have any questions about these Terms of Service, please contact us at:
            </p>
            <div style={{
              backgroundColor: '#f3f4f6',
              padding: '20px',
              borderRadius: '8px',
              marginTop: '15px'
            }}>
              <p style={{ margin: '0', fontWeight: '600' }}>Movie App Support</p>
              <p style={{ margin: '5px 0' }}>Email: support@movieapp.com</p>
              <p style={{ margin: '0' }}>Address: 123 Cinema Street, Movie City, MC 12345</p>
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
              backgroundColor: '#ff9a9e',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '8px',
              fontWeight: '600',
              marginRight: '15px',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#ff7883'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#ff9a9e'}
          >
            Back to Registration
          </Link>
          <Link
            to="/privacy"
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
            Privacy Policy
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

export default TermsPage;