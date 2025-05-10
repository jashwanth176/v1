import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';
import { toast } from 'react-toastify';
import { Shield } from 'lucide-react';
import { authenticator } from 'otplib';

const OTPVerification = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [otp, setOtp] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    // Check if we have the required state
    if (!location.state?.email || !location.state?.password) {
      navigate('/login');
    }
  }, [location.state, navigate]);

  const handleVerifyOTP = async () => {
    setIsVerifying(true);
    try {
      // Get the stored secret key for the current user
      const user = auth.currentUser;
      if (!user) {
        throw new Error('No user logged in');
      }

      const secretKey = localStorage.getItem(`mfa_secret_${user.uid}`);
      if (!secretKey) {
        throw new Error('MFA not properly configured');
      }

      // Verify the TOTP code
      const isValid = authenticator.verify({
        token: otp,
        secret: secretKey
      });

      if (!isValid) {
        throw new Error('Invalid verification code');
      }

      // If OTP is valid, complete the login
      const userCredential = await signInWithEmailAndPassword(
        auth,
        location.state.email,
        location.state.password
      );
      
      const loggedInUser = userCredential.user;
      localStorage.setItem("userName", loggedInUser.displayName || location.state.email.split('@')[0]);
      localStorage.setItem("userEmail", loggedInUser.email);
      localStorage.setItem("userRole", "user");
      
      toast.success("Login successful!");
      navigate("/dashboard");
    } catch (error) {
      toast.error(error.message || "Invalid OTP");
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Shield className="mx-auto h-12 w-12 text-orange-500" />
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Enter Verification Code
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Please enter the 6-digit code from your authenticator app
          </p>
        </div>
        <div className="mt-8 space-y-6">
          <div>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="Enter 6-digit code"
              className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-orange-500 focus:border-orange-500 focus:z-10 sm:text-sm"
            />
          </div>
          <div>
            <button
              onClick={handleVerifyOTP}
              disabled={isVerifying || !otp}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-orange-500 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50"
            >
              {isVerifying ? 'Verifying...' : 'Verify Code'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OTPVerification;
