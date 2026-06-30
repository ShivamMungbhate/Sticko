import React, { useState } from 'react';
import { ShieldCheck, MessageSquare, AlertCircle } from 'lucide-react';

export default function OtpModal({ isOpen, onClose, onSuccess, targetPhone, targetAadhaar }) {
  const [step, setStep] = useState(1); // 1 = Mobile OTP, 2 = Aadhaar OTP (if applicable)
  const [otpInput, setOtpInput] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const showAadhaarStep = !!targetAadhaar;

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (step === 1) {
      // Mobile OTP check (Requirement)
      if (otpInput === '123456') {
        if (showAadhaarStep) {
          setStep(2);
          setOtpInput('');
        } else {
          onSuccess();
        }
      } else {
        setError('Invalid Mobile OTP. Enter 123456 to verify.');
      }
    } else if (step === 2) {
      // Aadhaar OTP check (Requirement)
      if (otpInput === '654321') {
        onSuccess();
      } else {
        setError('Invalid UIDAI Aadhaar Verification OTP. Enter 654321 to verify.');
      }
    }
  };

  return (
    <div className="modal-overlay" style={{ zIndex: 500 }}>
      <div className="modal-content" style={{ maxWidth: '400px', border: '1px solid var(--primary-glow)' }}>
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div style={{ 
            width: '60px', 
            height: '60px', 
            borderRadius: '50%', 
            background: 'var(--primary-glow)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            margin: '0 auto 1rem auto',
            border: '1px solid var(--primary)'
          }}>
            {step === 1 ? <MessageSquare size={28} className="star-icon" style={{ color: 'var(--primary)' }} /> 
                       : <ShieldCheck size={28} className="star-icon" style={{ color: 'var(--secondary)' }} />}
          </div>
          
          <h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-main)' }}>
            {step === 1 ? 'Mobile Verification' : 'UIDAI Aadhaar Check'}
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.5rem' }}>
            {step === 1 
              ? `We sent a 6-digit OTP code to +91 ${targetPhone || 'your registered number'}`
              : `Enter the Aadhaar OTP sent by UIDAI to mobile linked with ID: ${targetAadhaar}`}
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" style={{ textAlign: 'center', display: 'block', fontSize: '0.85rem' }}>
              {step === 1 ? 'Enter 6-Digit Mobile OTP (Default: 123456)' : 'Enter 6-Digit Aadhaar OTP (Default: 654321)'}
            </label>
            <input 
              type="text" 
              className="form-input" 
              maxLength="6"
              placeholder="••••••"
              value={otpInput}
              onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, ''))}
              style={{ 
                letterSpacing: '1rem', 
                textAlign: 'center', 
                fontSize: '1.5rem', 
                fontWeight: 700,
                padding: '0.75rem' 
              }}
              required
              autoFocus
            />
          </div>

          {error && (
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.5rem', 
              background: 'rgba(239, 68, 68, 0.1)', 
              color: 'var(--danger)', 
              padding: '0.75rem', 
              borderRadius: '6px', 
              fontSize: '0.85rem',
              marginBottom: '1rem',
              border: '1px solid rgba(239, 68, 68, 0.2)'
            }}>
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button 
              type="button" 
              className="btn btn-secondary" 
              onClick={onClose} 
              style={{ flex: 1 }}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn btn-primary" 
              style={{ flex: 2 }}
            >
              Verify & Complete
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
