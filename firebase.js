import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js';
import { getAnalytics } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-analytics.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';

const firebaseConfig = {
  apiKey: "AIzaSyDYNEco78gDJMUo_B-PsrSQrPoc5Bm6fCA",
  authDomain: "ucptetris.firebaseapp.com",
  projectId: "ucptetris",
  storageBucket: "ucptetris.appspot.com",
  messagingSenderId: "133247975489",
  appId: "1:133247975489:web:8ca132b30afc5e56c406c0",
  measurementId: "G-KRW120LFTS"
};

const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);
const analytics = getAnalytics(app);

export { app, analytics, firestore }; // Exporta app, analytics e firestore
