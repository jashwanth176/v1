// This is a mock firebase.js file for CI/CD workflow purposes only
// It contains no real credentials or sensitive information

import { initializeApp } from 'firebase/app';
import { 
  getAuth,
  RecaptchaVerifier as FirebaseRecaptchaVerifier
} from 'firebase/auth';

// Mock configuration with placeholder values
const firebaseConfig = {
  apiKey: "MOCK-API-KEY-FOR-CI",
  authDomain: "mock-project.firebaseapp.com",
  projectId: "mock-project",
  storageBucket: "mock-project.appspot.com",
  messagingSenderId: "000000000000",
  appId: "1:000000000000:web:0000000000000000000000"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Export RecaptchaVerifier for OTPVerification component
const RecaptchaVerifier = FirebaseRecaptchaVerifier;

export { auth, RecaptchaVerifier };
