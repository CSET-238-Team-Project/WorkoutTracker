import { initializeApp } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-app.js";
import { 
    getAuth, 
    onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/10.0.0/firebase-auth.js";

import {
    getFirestore,
    doc,
    getDoc,
    collection,
    addDoc,
    getDocs,
    updateDoc,
    deleteDoc
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

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const db = getFirestore(app);
let currentUser = null;

onAuthStateChanged(auth, async (user) => {
    if (!user) {
        window.location.href = "signup.html";
        return;
    }
    const myRef = doc(db, "users", user.uid);
    const snap = await getDoc(myRef);
    const data = snap.data() || {};
    const streak = data.streak || {weeks: 0, days: [0, 0, 0, 0, 0, 0, 0]};
    // updates streaks based on the logger page's count
    const streakCount = parseInt(localStorage.getItem('workoutStreak')) || 0;
    const streakWeek = JSON.parse(localStorage.getItem('streakWeek')) || [0,0,0,0,0,0,0];

    // updates the streak text... do not know how well it works though
    document.querySelector('.streak-count').textContent = `${streakCount} day streak`;
    document.querySelector('.stat-card p').textContent = `${streakCount} Days`;

    // updates the streak day
    const todayIndex = (new Date().getDay() + 6) % 7;
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
    document.getElementById('streak-weeks').textContent = `${streak.weeks} week(s)`;
    let count = 0;
    for (let i = todayIndex; i >= 0; i--) {
        if (streak.days[i]) {
            count++
        }
    }
    document.getElementById('streak-count').textContent = `${count + (7*streak.weeks)} day streak`;

    // populates the weekly counter
    for (let i = 0; i < 7; i++) {
        if (streak.days[i]) {
            streakList[i].classList.add("complete");
        }
    }
});

// this will pass specific workouts to the detail page when pull push or legs is clicked
document.querySelectorAll('.workout-block').forEach(block => {
    block.addEventListener('click', function () {
        const workoutId = this.getAttribute('data-workout');
        localStorage.setItem('selectedWorkout', workoutId);
        location.href = 'WorkoutDetail.html';
    });
});