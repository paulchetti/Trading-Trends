import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  Upload,
  FileText,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Lock,
  Eye,
  EyeOff,
  MessageSquare,
  Camera,
  Clock,
  Sparkles
} from 'lucide-react';
import { API_BASE } from '../apiConfig.js';

export function KycModal({ isOpen, onClose }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    dob: '',
    address: '',
    aadhar: '',
    password: '',
    confirmPassword: '',
    referralCode: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [aadharFrontFile, setAadharFrontFile] = useState(null);
  const [aadharBackFile, setAadharBackFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (isOpen) {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const refUrl = urlParams.get('ref');
        const storedRef = refUrl || localStorage.getItem('nexora_ref');
        if (storedRef) {
          setFormData(prev => ({ ...prev, referralCode: storedRef.trim().toUpperCase() }));
        }
      } catch (e) {
        // Ignore URL parsing errors
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  function handleChange(e) {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErrorMessage('');
    setSubmissionResult(null);

    if (!formData.name || !formData.email || !formData.phone || !formData.dob || !formData.address || !formData.aadhar) {
      setErrorMessage('Please fill in all identity details.');
      return;
    }

    if (!formData.password || formData.password.length < 6) {
      setErrorMessage('Please create a secure password of at least 6 characters.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setErrorMessage('Passwords do not match. Please verify your password.');
      return;
    }

    if (!aadharFrontFile) {
      setErrorMessage('Please attach your Aadhaar Card Front Side (Image/PDF).');
      return;
    }

    if (!aadharBackFile) {
      setErrorMessage('Please attach your Aadhaar Card Back Side (Image/PDF).');
      return;
    }

    setSubmitting(true);

    try {
      const data = new FormData();
      data.append('name', formData.name);
      data.append('email', formData.email);
      data.append('phone', formData.phone);
      data.append('dob', formData.dob);
      data.append('address', formData.address);
      data.append('aadhar', formData.aadhar);
      data.append('pan', 'N/A');
      data.append('password', formData.password);
      data.append('referralCode', formData.referralCode ? formData.referralCode.trim() : '');
      data.append('aadharFrontFile', aadharFrontFile);
      data.append('aadharBackFile', aadharBackFile);

      const res = await fetch(`${API_BASE}/api/kyc/submit`, {
        method: 'POST',
        body: data
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || 'Failed to submit KYC application');
      }

      setSubmissionResult({
        submissionId: json.submissionId || 'KYC-' + Date.now(),
        name: formData.name,
        email: formData.email,
        timestamp: new Date().toLocaleString()
      });
    } catch (err) {
      setErrorMessage(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  function handleOpenSupport() {
    onClose();
    // Dispatch custom event to auto-open support chat with prefilled context
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('open-support-chat', {
        detail: {
          message: `Hello Customer Support, I have just created my account (${formData.name}, ${formData.email}) and submitted my KYC documents for verification. Here is my confirmation screenshot.`
        }
      }));
    }, 150);
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '640px' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, rgba(0, 242, 254, 0.2), rgba(139, 92, 246, 0.2))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid rgba(0, 242, 254, 0.35)'
            }}>
              <ShieldCheck size={20} color="#00f2fe" />
            </div>
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#ffffff' }}>Create Account & KYC Verification</h3>
              <p style={{ fontSize: '12px', color: '#94a3b8' }}>Set your password and submit compliance identity documents</p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer',
              padding: '6px'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* SUCCESS / VERIFICATION SCREEN */}
        {submissionResult ? (
          <div style={{ textAlign: 'center', padding: '10px 4px' }}>
            {/* Pulsing Status Icon */}
            <div style={{
              width: '68px',
              height: '68px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(0, 242, 254, 0.2) 0%, rgba(16, 185, 129, 0.25) 100%)',
              border: '2px solid #00f2fe',
              boxShadow: '0 0 25px rgba(0, 242, 254, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px'
            }}>
              <Clock size={34} color="#00f2fe" />
            </div>

            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 14px',
              borderRadius: '999px',
              background: 'rgba(245, 158, 11, 0.15)',
              border: '1px solid rgba(251, 191, 36, 0.4)',
              color: '#fbbf24',
              fontSize: '12px',
              fontWeight: 700,
              marginBottom: '12px'
            }}>
              <Clock size={13} /> Account Created — Verification in Progress
            </div>

            <h4 style={{ fontSize: '22px', fontWeight: 800, color: '#ffffff', marginBottom: '8px' }}>
              Account Sent for Verification!
            </h4>
            <p style={{ fontSize: '13px', color: '#cbd5e1', lineHeight: '1.6', maxWidth: '520px', margin: '0 auto 20px' }}>
              Your account has been registered with your custom password. It is now awaiting compliance desk review.
            </p>

            {/* Confirmation Card formatted for screenshotting */}
            <div style={{
              background: 'linear-gradient(145deg, rgba(20, 28, 64, 0.9) 0%, rgba(13, 18, 44, 0.95) 100%)',
              padding: '18px 20px',
              borderRadius: '14px',
              border: '1px solid rgba(0, 242, 254, 0.35)',
              boxShadow: '0 8px 30px rgba(0, 0, 0, 0.35)',
              textAlign: 'left',
              marginBottom: '20px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '10px', marginBottom: '12px' }}>
                <span style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.5px' }}>
                  Account Registration Details
                </span>
                <span style={{ fontSize: '11px', color: '#00f2fe', fontFamily: 'JetBrains Mono', fontWeight: 700 }}>
                  {submissionResult.submissionId}
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#94a3b8' }}>Full Legal Name:</span>
                  <strong style={{ color: '#ffffff' }}>{submissionResult.name}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#94a3b8' }}>Registered Email / Login ID:</span>
                  <strong style={{ color: '#38bdf8' }}>{submissionResult.email}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#94a3b8' }}>Submission Timestamp:</span>
                  <span style={{ color: '#cbd5e1', fontFamily: 'JetBrains Mono', fontSize: '12px' }}>{submissionResult.timestamp}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#94a3b8' }}>Compliance Status:</span>
                  <span style={{ color: '#fbbf24', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    ● Pending Admin Acceptance
                  </span>
                </div>
              </div>
            </div>

            {/* Critical Next-Steps Instruction Box (Golden & Cyan Callout) */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.12) 0%, rgba(99, 102, 241, 0.12) 100%)',
              border: '1px solid rgba(251, 191, 36, 0.45)',
              borderRadius: '12px',
              padding: '16px',
              textAlign: 'left',
              marginBottom: '24px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#fbbf24', fontWeight: 700, fontSize: '13px', marginBottom: '8px' }}>
                <Camera size={16} /> Important: Take a Screenshot & Contact Customer Support
              </div>
              <ul style={{ paddingLeft: '18px', fontSize: '12px', color: '#e2e8f0', lineHeight: '1.65' }}>
                <li><strong>When admin accepts your account, you will be eligible for investing</strong> and earning 1% daily compounding growth.</li>
                <li>Please <strong>take a screenshot of this confirmation screen now</strong> as proof of your registration.</li>
                <li><strong>Contact Customer Support</strong> using the button below to notify them that you have created your account and share your screenshot for rapid approval.</li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button
                className="btn btn-primary"
                style={{ width: '100%', padding: '13px', fontSize: '14px', gap: '8px' }}
                onClick={handleOpenSupport}
              >
                <MessageSquare size={17} /> Contact Customer Support with Screenshot
              </button>
              <button
                className="btn btn-secondary"
                style={{ width: '100%', padding: '11px', fontSize: '13px' }}
                onClick={onClose}
              >
                Close Window
              </button>
            </div>
          </div>
        ) : (
          /* REGISTRATION & KYC FORM */
          <form onSubmit={handleSubmit}>
            {errorMessage && (
              <div style={{
                background: 'rgba(255, 71, 87, 0.12)',
                border: '1px solid rgba(255, 71, 87, 0.3)',
                padding: '12px 16px',
                borderRadius: '10px',
                color: '#ff4757',
                fontSize: '13px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '16px'
              }}>
                <AlertCircle size={18} />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* 10% Investment Bonus Callout */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.12) 0%, rgba(16, 185, 129, 0.12) 100%)',
              border: '1px solid rgba(251, 191, 36, 0.35)',
              borderRadius: '12px',
              padding: '12px 14px',
              marginBottom: '18px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              <span style={{ fontSize: '18px' }}>🎁</span>
              <div style={{ fontSize: '12px', color: '#e2e8f0', lineHeight: '1.45' }}>
                <strong style={{ color: '#fbbf24' }}>+10% Investment Bonus Activated:</strong> You will automatically receive a 10% bonus added to your invested balance upon admin acceptance!
              </div>
            </div>

            {/* 1 & 2: Name and Email */}
            <div className="responsive-form-grid">
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '6px' }}>
                  1. Full Legal Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Johnathan Doe"
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '6px' }}>
                  2. Registered Email Address (Login ID) *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="name@domain.com"
                  className="input-field"
                  required
                />
              </div>
            </div>

            {/* 3 & 4: Password Creation & Verification */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(6, 182, 212, 0.1) 100%)',
              padding: '14px',
              borderRadius: '12px',
              border: '1px solid rgba(148, 163, 240, 0.3)',
              marginBottom: '14px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
                <Lock size={15} color="#00f2fe" />
                <span style={{ fontSize: '13px', fontWeight: 700, color: '#ffffff' }}>
                  Create Account Login Password
                </span>
                <span style={{ fontSize: '11px', color: '#00f2fe', marginLeft: 'auto' }}>Direct Account Creation</span>
              </div>

              <div className="responsive-form-grid" style={{ marginBottom: 0 }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', color: '#94a3b8', marginBottom: '4px' }}>
                    Create Password * (Min 6 chars)
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="••••••••"
                      className="input-field"
                      style={{ paddingRight: '36px' }}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{
                        position: 'absolute',
                        right: '10px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'transparent',
                        border: 'none',
                        color: '#94a3b8',
                        cursor: 'pointer',
                        padding: '2px'
                      }}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '11px', color: '#94a3b8', marginBottom: '4px' }}>
                    Verify Password (Confirm) *
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="••••••••"
                      className="input-field"
                      style={{ paddingRight: '36px' }}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      style={{
                        position: 'absolute',
                        right: '10px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'transparent',
                        border: 'none',
                        color: '#94a3b8',
                        cursor: 'pointer',
                        padding: '2px'
                      }}
                    >
                      {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* 5 & 6: Phone and DOB */}
            <div className="responsive-form-grid">
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '6px' }}>
                  3. Phone Number *
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+91 98765 43210"
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '6px' }}>
                  4. Date of Birth (DOB) *
                </label>
                <input
                  type="date"
                  name="dob"
                  value={formData.dob}
                  onChange={handleChange}
                  className="input-field"
                  required
                />
              </div>
            </div>

            {/* 7: Address */}
            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '6px' }}>
                5. Permanent Residential Address *
              </label>
              <textarea
                name="address"
                rows={2}
                value={formData.address}
                onChange={handleChange}
                placeholder="House/Street, City, State, Postal Code"
                className="input-field"
                required
              />
            </div>

            {/* 8: Aadhaar Section */}
            <div style={{
              background: 'linear-gradient(145deg, rgba(18, 25, 60, 0.7) 0%, rgba(12, 17, 45, 0.8) 100%)',
              padding: '14px',
              borderRadius: '12px',
              border: '1px solid rgba(148, 163, 240, 0.22)',
              marginBottom: '14px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <label style={{ fontSize: '12px', fontWeight: 600, color: '#ffffff' }}>
                  6. Aadhaar Number & Documents (Front & Back) *
                </label>
                <span style={{ fontSize: '11px', color: '#00f2fe' }}>2 Required Files</span>
              </div>
              <input
                type="text"
                name="aadhar"
                value={formData.aadhar}
                onChange={handleChange}
                placeholder="12-digit Aadhaar Number (XXXX XXXX XXXX)"
                className="input-field"
                style={{ marginBottom: '12px' }}
                required
              />

              {/* Box 1: Front Side */}
              <div style={{ marginBottom: '10px' }}>
                <div style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '4px', display: 'flex', justifyContent: 'space-between' }}>
                  <span>Front Side (Photo, Name, DOB & Aadhaar No.)</span>
                  {aadharFrontFile && <span style={{ color: '#00e676', fontWeight: 600 }}>✓ Attached</span>}
                </div>
                <div style={{
                  border: '1px dashed rgba(148, 163, 240, 0.3)',
                  borderRadius: '8px',
                  padding: '10px 14px',
                  background: 'rgba(255, 255, 255, 0.02)'
                }} className="responsive-upload-box">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0, overflow: 'hidden' }}>
                    <FileText size={18} color="#00f2fe" style={{ flexShrink: 0 }} />
                    <span style={{ fontSize: '13px', color: aadharFrontFile ? '#00e676' : '#94a3b8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {aadharFrontFile ? aadharFrontFile.name : 'No file chosen (Front Side)'}
                    </span>
                  </div>
                  <label style={{
                    padding: '8px 12px',
                    background: 'rgba(0, 242, 254, 0.15)',
                    color: '#00f2fe',
                    borderRadius: '6px',
                    fontSize: '12px',
                    cursor: 'pointer',
                    fontWeight: 600,
                    flexShrink: 0,
                    textAlign: 'center'
                  }}>
                    <Upload size={14} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} />
                    Browse Front Side
                    <input
                      type="file"
                      accept="image/*,application/pdf"
                      style={{ display: 'none' }}
                      onChange={e => setAadharFrontFile(e.target.files[0] || null)}
                    />
                  </label>
                </div>
              </div>

              {/* Box 2: Back Side */}
              <div>
                <div style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '4px', display: 'flex', justifyContent: 'space-between' }}>
                  <span>Back Side (Permanent Address & QR Code)</span>
                  {aadharBackFile && <span style={{ color: '#00e676', fontWeight: 600 }}>✓ Attached</span>}
                </div>
                <div style={{
                  border: '1px dashed rgba(148, 163, 240, 0.3)',
                  borderRadius: '8px',
                  padding: '10px 14px',
                  background: 'rgba(255, 255, 255, 0.02)'
                }} className="responsive-upload-box">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0, overflow: 'hidden' }}>
                    <FileText size={18} color="#00f2fe" style={{ flexShrink: 0 }} />
                    <span style={{ fontSize: '13px', color: aadharBackFile ? '#00e676' : '#94a3b8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {aadharBackFile ? aadharBackFile.name : 'No file chosen (Back Side)'}
                    </span>
                  </div>
                  <label style={{
                    padding: '8px 12px',
                    background: 'rgba(0, 242, 254, 0.15)',
                    color: '#00f2fe',
                    borderRadius: '6px',
                    fontSize: '12px',
                    cursor: 'pointer',
                    fontWeight: 600,
                    flexShrink: 0,
                    textAlign: 'center'
                  }}>
                    <Upload size={14} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} />
                    Browse Back Side
                    <input
                      type="file"
                      accept="image/*,application/pdf"
                      style={{ display: 'none' }}
                      onChange={e => setAadharBackFile(e.target.files[0] || null)}
                    />
                  </label>
                </div>
              </div>
            </div>

            {/* 7: Referral Code (Optional) */}
            <div style={{
              background: 'rgba(18, 25, 60, 0.5)',
              padding: '14px',
              borderRadius: '12px',
              border: '1px solid rgba(148, 163, 240, 0.22)',
              marginBottom: '16px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label style={{ fontSize: '12px', color: '#ffffff', fontWeight: 600 }}>
                  7. Referral Partner Code (Optional)
                </label>
                <span style={{ fontSize: '11px', color: '#00f2fe' }}>5% Partner Program</span>
              </div>
              <input
                type="text"
                name="referralCode"
                value={formData.referralCode}
                onChange={handleChange}
                placeholder="e.g. NX-RAHUL102"
                className="input-field"
                style={{ fontFamily: 'JetBrains Mono', textTransform: 'uppercase' }}
              />
              <span style={{ display: 'block', fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>
                If you were invited by a friend, enter their referral code to link your account under their affiliate rewards.
              </span>
            </div>

            {/* Disclaimer */}
            <p style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '18px', lineHeight: '1.5' }}>
              By submitting this form, your account is immediately provisioned and your verification documents are dispatched to compliance administration. When admin accepts your account, you will be eligible for investing.
            </p>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                type="button"
                className="btn btn-secondary"
                style={{ flex: 1 }}
                onClick={onClose}
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                style={{ flex: 2 }}
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" /> Provisioning Account...
                  </>
                ) : (
                  <>
                    <ShieldCheck size={16} /> Create Account & Submit KYC
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
