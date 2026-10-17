import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";

const config = {
  apiKey: import.meta.env.VITE_APP_API_KEY,
  authDomain: import.meta.env.VITE_APP_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_APP_PROJECT_ID,
  appId: import.meta.env.VITE_APP_APP_ID,
};

let auth = null;
let googleProvider = null;

if (config.apiKey) {
  const app = initializeApp(config);
  auth = getAuth(app);
  googleProvider = new GoogleAuthProvider();
}

export const signInWithGoogle = async () => {
  if (!auth || !googleProvider) {
    throw new Error("Google login is not configured");
  }
  return signInWithPopup(auth, googleProvider);
};
