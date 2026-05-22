import { initializeApp } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyCWlRQ5ZVI3_v3on9X3mBrnmS2DrPq1dt0",
    authDomain: "workouttracker-f174d.firebaseapp.com",
    projectId: "workouttracker-f174d",
    storageBucket: "workouttracker-f174d.firebasestorage.app",
    messagingSenderId: "984311835015",
    appId: "1:984311835015:web:fcd67f664b9de2f34a4b22",
    measurementId: "G-1GPW2LQJ4Z"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

onAuthStateChanged(auth, (user) => {
    if (!user) {
        window.location.href = "signup.html";
        return;
    }

    // --- Streak from localStorage ---
    const streakCount = parseInt(localStorage.getItem('workoutStreak')) || 0;
    const streakWeek = JSON.parse(localStorage.getItem('streakWeek')) || [false,false,false,false,false,false,false];

    // Update streak text in both places
    document.querySelector('.streak-count').textContent = `${streakCount} day streak`;
    document.querySelector('.stat-card p').textContent = `${streakCount} Days`;

    // Mark today's day pill
    const todayIndex = (new Date().getDay() + 6) % 7; // Mon=0, Sun=6
    const streakList = [
        document.getElementById("mon"),
        document.getElementById("tue"),
        document.getElementById("wed"),
        document.getElementById("thu"),
        document.getElementById("fri"),
        document.getElementById("sat"),
        document.getElementById("sun")
    ];

    streakList[todayIndex].classList.add("today");

    // Light up completed days
    for (let i = 0; i < streakWeek.length; i++) {
        if (streakWeek[i]) streakList[i].classList.add("complete");
    }
});