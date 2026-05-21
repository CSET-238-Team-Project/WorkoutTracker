console.log("Hello, world!");
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-app.js";
import { 
    getAuth, 
    onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/10.0.0/firebase-auth.js";

import { 
    getFirestore, 
    doc, 
    getDoc 
} from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyCWlRQ5ZVI3_v3on9X3mBrnmS2DrPq1dt0",
    authDomain: "workouttracker-f174d.firebaseapp.com",
    projectId: "workouttracker-f174d",
    storageBucket: "workouttracker-f174d.firebasestorage.app",
    messagingSenderId: "984311835015",
    appId: "1:984311835015:web:fcd67f664b9de2f34a4b22",
    measurementId: "G-1GPW2LQJ4Z"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const db = getFirestore(app);

onAuthStateChanged(auth, async (user) => {

    if (!user) {
        window.location.href = "signup.html";
        return;
    }
    try {
        console.log(user);
        const myRef = doc(db, "users", user.uid);

        const snap = await getDoc(myRef);

        if (!snap.exists()) {
            console.log("No user document found");
            return;
        }

        const data = snap.data();

        const streak = data.streak || [];

        const streakList = [
            document.getElementById("mon"),
            document.getElementById("tue"),
            document.getElementById("wed"),
            document.getElementById("thu"),
            document.getElementById("fri"),
            document.getElementById("sat"),
            document.getElementById("sun")
        ];

        for (let i = 0; i < streak.length; i++) {

            if (streak[i]) {
                streakList[i].classList.add("complete");
            }
        }

    } catch (error) {

        console.error(error);

    }

});