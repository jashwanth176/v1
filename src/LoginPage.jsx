import { useState } from 'react';
import { FcGoogle } from 'react-icons/fc';
import { Link, useNavigate } from 'react-router-dom';
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaShield } from 'react-icons/fa6';
import { Eye, EyeOff } from "lucide-react";

const firebaseConfig = {
    apiKey: "AIzaSyAeCeaEhnXG_OYNenxf3obf3aHsckyo7v8",
    authDomain: "fsad-f59af.firebaseapp.com",
    projectId: "fsad-f59af",
    storageBucket: "fsad-f59af.firebasestorage.app",
    messagingSenderId: "986099512182",
    appId: "1:986099512182:web:b390fa435baa75ec5d8057"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [adminUsername, setAdminUsername] = useState('');
  const navigate = useNavigate();

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      console.log("Logged in user:", user);
      
      // Show success toast with user's name
      toast.success(`Welcome, ${user.displayName}! 👋`, {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });

      // Store user's name in localStorage or your state management solution
      localStorage.setItem('userName', user.displayName);
      localStorage.setItem('userEmail', user.email);
      
      navigate('/');
    } catch (error) {
      console.error("Google login error: ", error);
      toast.error('Failed to login with Google. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const validatePassword = () => {
    if (password.length < 6 && !isAdmin) {
      setPasswordError('Password must be at least 6 characters long');
      return false;
    }
    if (isSignUp && password !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return false;
    }
    setPasswordError('');
    return true;
  };

  const handleAdminLogin = (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simple admin authentication with hardcoded credentials
    if (adminUsername.trim() && password === "admin123") {
      // Set admin role in localStorage
      localStorage.setItem("userName", "Administrator");
      localStorage.setItem("userEmail", adminUsername);
      localStorage.setItem("userRole", "admin");
      
      toast.success("Admin login successful!", {
        position: "top-right",
        autoClose: 2000,
      });
      
      setTimeout(() => {
        navigate("/admin-dashboard");
      }, 1000);
    } else {
      toast.error("Invalid admin credentials", {
        position: "top-right",
        autoClose: 3000,
      });
    }
    
    setIsLoading(false);
  };

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    
    // If in admin mode, use simple admin login
    if (isAdmin) {
      handleAdminLogin(e);
      return;
    }
    
    // Regular user authentication
    if (!email || !password) {
      toast.error('Please enter both email and password');
      return;
    }

    if (isSignUp && !name.trim()) {
      toast.error('Please enter your name');
      return;
    }

    if (!validatePassword()) {
      return;
    }

    setIsLoading(true);
    try {
      if (isSignUp) {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        // Update profile with name
        await updateProfile(userCredential.user, {
          displayName: name
        });
        localStorage.setItem("userName", name);
        localStorage.setItem("userEmail", email);
        localStorage.setItem("userRole", "user");
        toast.success("Account created successfully!");
        navigate("/");
      } else {
        try {
          // Attempt sign in, it may throw MFA required error
          const userCredential = await signInWithEmailAndPassword(auth, email, password);
          
          // If we get here, MFA is not required
          const user = userCredential.user;
          localStorage.setItem("userName", user.displayName || email.split('@')[0]);
          localStorage.setItem("userEmail", user.email);
          localStorage.setItem("userRole", "user");
          toast.success("Login successful!");
          navigate("/");
        } catch (error) {
          if (error.code === 'auth/multi-factor-auth-required') {
            // If MFA is required, redirect to OTP verification
            navigate('/verify-otp', { 
              state: { 
                email: email,
                password: password,
                isLogin: true
              }
            });
          } else {
            // Re-throw the error to be caught by the outer catch block
            throw error;
          }
        }
      }
    } catch (error) {
      console.error("Auth error:", error);
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!email) {
      toast.error('Please enter your email address first');
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      toast.success('Password reset email sent! Check your inbox.', {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } catch (error) {
      console.error("Password reset error: ", error);
      toast.error(error.message);
    }
  };

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    setIsAdmin(false);
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setName('');
    setPasswordError('');
  };
  
  const toggleAdminMode = () => {
    setIsAdmin(!isAdmin);
    setIsSignUp(false);
    setEmail('');
    setPassword('');
    setAdminUsername('');
    setPasswordError('');
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center bg-gradient-to-r from-indigo-500 to-purple-600">
      <div className="absolute inset-0 bg-cover bg-center opacity-20"
           style={{ backgroundImage: "url('https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80')" }}></div>
      <div className="absolute inset-0 bg-black opacity-50"></div>

      <div className="relative z-10 bg-white bg-opacity-90 backdrop-blur-md rounded-3xl shadow-lg px-10 py-12 max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800">Welcome to FoodieHub</h1>
          <p className="mt-2 text-lg text-gray-600">
            {isAdmin ? 'Admin Login' : (isSignUp ? 'Create an account' : 'Sign in to continue')}
          </p>
        </div>

        <form onSubmit={handleEmailAuth} className="space-y-4 mb-6">
          {isSignUp && !isAdmin && (
            <div>
              <input
                type="text"
                placeholder="Your name"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required={isSignUp}
              />
            </div>
          )}
          <div>
            <input
              type={isAdmin ? "text" : "email"}
              placeholder={isAdmin ? "Admin username" : "Email address"}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              value={isAdmin ? adminUsername : email}
              onChange={(e) => isAdmin ? setAdminUsername(e.target.value) : setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <div className="mt-1 relative">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-500"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>
          {isSignUp && !isAdmin && (
            <div>
              <input
                type="password"
                placeholder="Confirm Password"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
          )}
          {passwordError && (
            <p className="text-red-500 text-sm mt-1">{passwordError}</p>
          )}
          {!isSignUp && !isAdmin && (
            <div className="text-right">
              <button
                type="button"
                onClick={handlePasswordReset}
                className="text-sm text-indigo-600 hover:text-indigo-800 hover:underline"
              >
                Forgot Password?
              </button>
            </div>
          )}
          <button
            type="submit"
            className={`w-full ${isAdmin ? 'bg-red-600 hover:bg-red-700' : 'bg-indigo-600 hover:bg-indigo-700'} text-white rounded-lg py-3 font-medium transition-colors`}
            disabled={isLoading}
          >
            {isLoading ? 'Processing...' : (isAdmin ? 'Admin Login' : (isSignUp ? 'Sign Up' : 'Sign In'))}
          </button>
          
          {isAdmin && (
            <div className="text-xs text-gray-500 text-center mt-2">
              <p>Username: <span className="font-medium">admin</span> (or any username)</p>
              <p>Password: <span className="font-medium">&ldquo;admin123&rdquo;</span></p>
            </div>
          )}
        </form>

        {!isAdmin && (
          <>
            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or continue with</span>
              </div>
            </div>

            <button
              onClick={handleGoogleLogin}
              className="w-full flex items-center justify-center border border-gray-300 rounded-lg py-3 px-4 hover:bg-gray-50 transition-colors"
              disabled={isLoading}
            >
              <FcGoogle className="text-2xl mr-3" />
              <span className="font-medium">Continue with Google</span>
            </button>
          </>
        )}

        <div className="mt-8 text-center flex flex-col gap-2">
          {!isAdmin && (
            <button
              onClick={toggleMode}
              className="text-sm text-indigo-600 hover:underline"
            >
              {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
            </button>
          )}
          
          <button
            onClick={toggleAdminMode}
            className="text-sm text-red-600 hover:underline flex items-center justify-center gap-1 mx-auto"
          >
            <FaShield className="text-xs" />
            {isAdmin ? 'Back to User Login' : 'Admin Login'}
          </button>
          
          <div className="mt-2">
            <Link to="/" className="text-sm text-gray-600 hover:underline">
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage; 