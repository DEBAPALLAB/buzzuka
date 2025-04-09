
// js/firebase.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";

// ✅ Your actual Firebase config goe
const firebaseConfig = {
    apiKey: "AIzaSyD8ph7bUPeAVHlsLErR3YSxBTX2GmZq2Ng",
    authDomain: "buzzuka-fbdcb.firebaseapp.com",
    projectId: "buzzuka-fbdcb",
    storageBucket: "buzzuka-fbdcb.appspot.com",
    messagingSenderId: "1086734860298",
    appId: "1:1086734860298:web:d219de43da33dd8c47dff3"
  };
  

const app = initializeApp(firebaseConfig);
window.db = getFirestore(app);