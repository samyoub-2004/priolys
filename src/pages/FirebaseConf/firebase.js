// Import des SDK Firebase nécessaires
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { 
  getAuth, 
  GoogleAuthProvider, 
  OAuthProvider, 
  sendEmailVerification 
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Configuration Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCT68wtgOFbKiFBk52ijbQrXl_XYVi46dY",
  authDomain: "vtccc-a34fd.firebaseapp.com",
  projectId: "vtccc-a34fd",
  storageBucket: "vtccc-a34fd.appspot.com",
  messagingSenderId: "548137400763",
  appId: "1:548137400763:web:1e155fef7fb09278b2ac9e",
  measurementId: "G-DBV3M8FXEH"
};

// Initialisation de Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);

// Fournisseurs d'authentification
const googleProvider = new GoogleAuthProvider();
const appleProvider = new OAuthProvider('apple.com');

// Fonction pour envoyer un email de confirmation
const sendConfirmationEmail = async (user) => {
  try {
    await sendEmailVerification(user);
    console.log("Email de confirmation envoyé !");
  } catch (error) {
    console.error("Erreur lors de l'envoi de l'email", error);
    throw error;
  }
};

// Export des fonctionnalités
export {
  auth,
  analytics,
  googleProvider,
  appleProvider,
  sendConfirmationEmail,
  db
};