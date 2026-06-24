import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyDqvVAk2QAX54YnvpevQqo8W5giik-0ov4",
  authDomain: "feedme-login.firebaseapp.com",
  projectId: "feedme-login",
  storageBucket: "feedme-login.firebasestorage.app",
  messagingSenderId: "677921170519",
  appId: "1:677921170519:web:3d0690c62357e39f5fef12",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
