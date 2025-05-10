import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { Shield, Smartphone, Key, Loader } from 'lucide-react';
import { toast } from 'react-toastify';
import { auth } from '../firebase';
import { SiteHeader } from '../App';

const MFASetup = () => {
  const navigate = useNavigate();
  const [mfaMethod, setMfaMethod] = useState('authenticator'); // 'authenticator' or 'phone'
  const [secretKey, setSecretKey] = useState('');
  const [qrCode, setQrCode] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSettingUp, setIsSettingUp] = useState(false);

  useEffect(() => {
    // Check if user is logged in
    const userName = localStorage.getItem('userName');
    if (!userName) {
      navigate('/login');
      return;
    }
  }, [navigate]);

  // Simple demo function to generate a fake QR code
  const handleSetupAuthenticator = async () => {
    setIsSettingUp(true);
    try {
      // Generate a demo secret key
      const demoSecret = 'DEMO' + Math.random().toString(36).substring(2, 15).toUpperCase();
      setSecretKey(demoSecret);
      
      // Generate a demo QR code URL
      const userEmail = localStorage.getItem('userEmail') || 'demo@foodiehub.com';
      const demoQrData = `otpauth://totp/FoodieHub:${userEmail}?secret=${demoSecret}&issuer=FoodieHub`;
      setQrCode(demoQrData);
      
      toast.info('QR code generated successfully');
    } catch (error) {
      console.error('Demo setup error:', error);
      toast.error('Failed to setup authenticator');
    } finally {
      setIsSettingUp(false);
    }
  };

  // Demo verification function
  const handleVerifyCode = async () => {
    setIsVerifying(true);
    try {
      // In a real implementation, this would verify the code with Firebase
      // For demo, we'll just accept any 6-digit code
      if (verificationCode.length === 6 && /^\d+$/.test(verificationCode)) {
        // Store demo MFA status in localStorage
        const userId = auth.currentUser?.uid || 'demo-user';
        localStorage.setItem(`mfa_enabled_${userId}`, 'true');
        localStorage.setItem(`mfa_secret_${userId}`, secretKey);
        
        toast.success('Two-factor authentication enabled successfully!');
        navigate('/dashboard');
      } else {
        throw new Error('Please enter a valid 6-digit verification code');
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsVerifying(false);
    }
  };

  // Demo phone verification
  const handlePhoneVerification = async () => {
    if (!phoneNumber || phoneNumber.length < 10) {
      toast.error('Please enter a valid phone number');
      return;
    }

    setIsSettingUp(true);
    try {
      // In a real implementation, this would send an SMS
      // For demo, we'll just simulate a delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Store demo verification ID
      const demoVerificationId = 'demo-' + Date.now();
      localStorage.setItem('demo_verification_id', demoVerificationId);
      
      toast.success('Verification code sent to your phone');
      // Auto-fill verification code for demo
      setVerificationCode('123456');
    } catch {
      // Ignore specific error details
      toast.error('Failed to send verification code');
    } finally {
      setIsSettingUp(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <SiteHeader />
      <div className="py-12 px-4 sm:px-6 lg:px-8 pt-20">
        <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden">
          <div className="p-8">
            <div className="text-center mb-8">
              <Shield className="w-12 h-12 text-orange-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900">Setup Two-Factor Authentication</h2>
              <p className="mt-2 text-gray-600">Choose your preferred 2FA method</p>
            </div>

            <div className="space-y-6">
              {/* Method Selection */}
              <div className="flex space-x-4">
                <button
                  onClick={() => setMfaMethod('authenticator')}
                  className={`flex-1 p-4 rounded-lg border ${
                    mfaMethod === 'authenticator'
                      ? 'border-orange-500 bg-orange-50'
                      : 'border-gray-200 hover:border-orange-500'
                  }`}
                >
                  <Key className="w-6 h-6 text-orange-500 mx-auto mb-2" />
                  <span className="block text-sm font-medium">Google Authenticator</span>
                </button>
                <button
                  onClick={() => setMfaMethod('phone')}
                  className={`flex-1 p-4 rounded-lg border ${
                    mfaMethod === 'phone'
                      ? 'border-orange-500 bg-orange-50'
                      : 'border-gray-200 hover:border-orange-500'
                  }`}
                >
                  <Smartphone className="w-6 h-6 text-orange-500 mx-auto mb-2" />
                  <span className="block text-sm font-medium">Phone Number</span>
                </button>
              </div>

              {/* Google Authenticator Setup */}
              {mfaMethod === 'authenticator' && (
                <div className="space-y-4">
                  {!secretKey ? (
                    <button
                      onClick={handleSetupAuthenticator}
                      disabled={isSettingUp}
                      className="w-full bg-orange-500 text-white py-2 px-4 rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 flex items-center justify-center"
                    >
                      {isSettingUp ? (
                        <>
                          <Loader className="animate-spin mr-2 h-5 w-5" />
                          Setting up...
                        </>
                      ) : (
                        'Setup Google Authenticator'
                      )}
                    </button>
                  ) : (
                    <div className="space-y-4">
                      <div className="text-center">
                        <QRCodeSVG value={qrCode} size={200} className="mx-auto" />
                        <p className="mt-2 text-sm text-gray-600">
                          Scan this QR code with Google Authenticator
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Manual Entry Code
                        </label>
                        <input
                          type="text"
                          value={secretKey}
                          readOnly
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Verification Code
                        </label>
                        <input
                          type="text"
                          value={verificationCode}
                          onChange={(e) => setVerificationCode(e.target.value)}
                          placeholder="Enter 6-digit code"
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                        />
                      </div>
                      <button
                        onClick={handleVerifyCode}
                        disabled={isVerifying || !verificationCode}
                        className="w-full bg-orange-500 text-white py-2 px-4 rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 flex items-center justify-center"
                      >
                        {isVerifying ? (
                          <>
                            <Loader className="animate-spin mr-2 h-5 w-5" />
                            Verifying...
                          </>
                        ) : (
                          'Verify and Enable 2FA'
                        )}
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Phone Number Setup */}
              {mfaMethod === 'phone' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="+1 (555) 000-0000"
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>
                  <button
                    onClick={handlePhoneVerification}
                    disabled={!phoneNumber || isSettingUp}
                    className="w-full bg-orange-500 text-white py-2 px-4 rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 flex items-center justify-center"
                  >
                    {isSettingUp ? (
                      <>
                        <Loader className="animate-spin mr-2 h-5 w-5" />
                        Sending code...
                      </>
                    ) : (
                      'Send Verification Code'
                    )}
                  </button>
                  
                  {verificationCode && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Verification Code
                        </label>
                        <input
                          type="text"
                          value={verificationCode}
                          onChange={(e) => setVerificationCode(e.target.value)}
                          placeholder="Enter 6-digit code"
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                        />
                      </div>
                      <button
                        onClick={handleVerifyCode}
                        disabled={isVerifying || !verificationCode}
                        className="w-full bg-orange-500 text-white py-2 px-4 rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 flex items-center justify-center"
                      >
                        {isVerifying ? (
                          <>
                            <Loader className="animate-spin mr-2 h-5 w-5" />
                            Verifying...
                          </>
                        ) : (
                          'Verify and Enable 2FA'
                        )}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MFASetup;
