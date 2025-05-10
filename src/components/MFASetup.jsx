import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { Shield, Smartphone, Key } from 'lucide-react';
import { toast } from 'react-toastify';
import { authenticator } from 'otplib';
import { auth } from '../firebase';

const MFASetup = () => {
  const navigate = useNavigate();
  const [mfaMethod, setMfaMethod] = useState('authenticator'); // 'authenticator' or 'phone'
  const [secretKey, setSecretKey] = useState('');
  const [qrCode, setQrCode] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    // Check if user is logged in
    const userName = localStorage.getItem('userName');
    if (!userName) {
      navigate('/login');
    }
  }, [navigate]);

  const handleSetupAuthenticator = async () => {
    try {
      // Generate a new secret key
      const secret = authenticator.generateSecret();
      setSecretKey(secret);
      
      // Generate QR code data
      const userEmail = localStorage.getItem('userEmail');
      const qrData = `otpauth://totp/FoodieHub:${userEmail}?secret=${secret}&issuer=FoodieHub`;
      setQrCode(qrData);
    } catch (error) {
      console.error('Failed to setup authenticator:', error);
      toast.error('Failed to setup authenticator');
    }
  };

  const handleVerifyCode = async () => {
    setIsVerifying(true);
    try {
      // Verify the TOTP code
      const isValid = authenticator.verify({
        token: verificationCode,
        secret: secretKey
      });

      if (!isValid) {
        throw new Error('Invalid verification code');
      }

      // Get current user
      const user = auth.currentUser;
      if (!user) {
        throw new Error('No user logged in');
      }

      // Store MFA status and secret in localStorage
      localStorage.setItem(`mfa_enabled_${user.uid}`, 'true');
      localStorage.setItem(`mfa_secret_${user.uid}`, secretKey);
      
      toast.success('Two-factor authentication enabled successfully!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.message || 'Invalid verification code');
    } finally {
      setIsVerifying(false);
    }
  };

  const handlePhoneVerification = async () => {
    try {
      // In a real implementation, this would send a verification code to the phone
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      toast.success('Verification code sent to your phone');
    } catch (error) {
      console.error('Phone verification error:', error);
      toast.error('Failed to send verification code');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
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
                    className="w-full bg-orange-500 text-white py-2 px-4 rounded-lg hover:bg-orange-600 transition-colors"
                  >
                    Setup Google Authenticator
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
                      className="w-full bg-orange-500 text-white py-2 px-4 rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50"
                    >
                      {isVerifying ? 'Verifying...' : 'Verify and Enable 2FA'}
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
                  disabled={!phoneNumber}
                  className="w-full bg-orange-500 text-white py-2 px-4 rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50"
                >
                  Send Verification Code
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
                      className="w-full bg-orange-500 text-white py-2 px-4 rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50"
                    >
                      {isVerifying ? 'Verifying...' : 'Verify and Enable 2FA'}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MFASetup;
