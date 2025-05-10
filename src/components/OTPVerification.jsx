import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  signInWithEmailAndPassword, 
  getMultiFactorResolver, 
  PhoneAuthProvider, 
  PhoneMultiFactorGenerator, 
  TotpMultiFactorGenerator 
} from 'firebase/auth';
import { auth, RecaptchaVerifier } from '../firebase';
import { toast } from 'react-toastify';
import { Shield, Loader } from 'lucide-react';

const OTPVerification = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [otp, setOtp] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [mfaResolver, setMfaResolver] = useState(null);
  const [mfaHint, setMfaHint] = useState('');
  const [verificationId, setVerificationId] = useState('');

  useEffect(() => {
    // Check if we have the required state
    if (!location.state?.email || !location.state?.password) {
      navigate('/login');
      return;
    }
    
    // Start the login process to trigger MFA
    startMfaSignIn();
  }, [location.state, navigate]);
  
  const startMfaSignIn = async () => {
    try {
      await signInWithEmailAndPassword(
        auth,
        location.state.email,
        location.state.password
      );
      
      // If we got here without error, MFA is not required
      // This should not happen as we already checked in LoginPage
      toast.success("Login successful!");
      navigate("/dashboard");
    } catch (error) {
      if (error.code === 'auth/multi-factor-auth-required') {
        // MFA is required, initialize the resolver
        const resolver = getMultiFactorResolver(auth, error);
        setMfaResolver(resolver);
        
        // Get the hint about which MFA is enrolled
        const hint = resolver.hints[0];
        if (hint.factorId === PhoneMultiFactorGenerator.FACTOR_ID) {
          setMfaHint(`Phone (${hint.phoneNumber})`);
          
          // For phone verification, we'll need to send verification code
          const recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
            size: 'invisible',
          });
          
          const phoneInfoOptions = {
            multiFactorHint: hint,
            session: resolver.session
          };
          
          const phoneAuthProvider = new PhoneAuthProvider(auth);
          const verificationId = await phoneAuthProvider.verifyPhoneNumber(
            phoneInfoOptions, 
            recaptchaVerifier
          );
          
          setVerificationId(verificationId);
          toast.info("Verification code sent to your phone");
        } else if (hint.factorId === TotpMultiFactorGenerator.FACTOR_ID) {
          setMfaHint("Authenticator App");
        }
      } else {
        // Not an MFA error, show error and redirect
        toast.error(error.message || "Login failed");
        navigate("/login");
      }
    }
  };

  const handleVerifyOTP = async () => {
    if (!mfaResolver) {
      toast.error("Authentication setup incomplete. Please try again.");
      navigate("/login");
      return;
    }

    setIsVerifying(true);
    try {
      const hint = mfaResolver.hints[0];
      let credential;
      
      if (hint.factorId === PhoneMultiFactorGenerator.FACTOR_ID) {
        // Complete phone verification
        credential = PhoneAuthProvider.credential(verificationId, otp);
        const multiFactorAssertion = PhoneMultiFactorGenerator.assertion(credential);
        const userCredential = await mfaResolver.resolveSignIn(multiFactorAssertion);
        completeLogin(userCredential.user);
      } else if (hint.factorId === TotpMultiFactorGenerator.FACTOR_ID) {
        // Complete TOTP verification
        try {
          const multiFactorAssertion = TotpMultiFactorGenerator.assertionForSignIn(
            mfaResolver.hints[0].uid, 
            otp
          );
          const userCredential = await mfaResolver.resolveSignIn(multiFactorAssertion);
          completeLogin(userCredential.user);
        } catch {
          // Error is ignored because we show a generic message
          toast.error("Invalid verification code. Please try again.");
        }
      }
    } catch (error) {
      toast.error(error.message || "Verification failed");
    } finally {
      setIsVerifying(false);
    }
  };
  
  const completeLogin = (user) => {
    // Set user information in localStorage
    localStorage.setItem("userName", user.displayName || location.state.email.split('@')[0]);
    localStorage.setItem("userEmail", user.email);
    localStorage.setItem("userRole", "user");
    
    toast.success("Login successful!");
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Shield className="mx-auto h-12 w-12 text-orange-500" />
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Enter Verification Code
          </h2>
          {mfaHint && (
            <p className="mt-2 text-sm text-gray-600">
              Please enter the verification code from your {mfaHint}
            </p>
          )}
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
            {/* Invisible reCAPTCHA container for phone auth */}
            <div id="recaptcha-container"></div>
          </div>
          <div>
            <button
              onClick={handleVerifyOTP}
              disabled={isVerifying || !otp || !mfaResolver}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-orange-500 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50"
            >
              {isVerifying ? (
                <span className="flex items-center">
                  <Loader className="animate-spin mr-2 h-5 w-5" />
                  Verifying...
                </span>
              ) : (
                'Verify Code'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OTPVerification;
