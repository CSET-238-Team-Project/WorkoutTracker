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

onAuthStateChanged(auth, (user) => 
    {
    if (!user) {
        window.location.href = "signup.html";
        return;
    }

    // grab streak from local storage, logger.js
    const streakCount = parseInt(localStorage.getItem('workoutStreak')) || 0;
    const streakWeek = JSON.parse(localStorage.getItem('streakWeek')) || [false,false,false,false,false,false,false];

    // update streak text
    document.querySelector('.streak-count').textContent = `${streakCount} day streak`;
    document.querySelector('.stat-card p').textContent = `${streakCount} Days`;

    // mark today's day streak
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

    // highlight the completed days
    for (let i = 0; i < streakWeek.length; i++) {
        if (streakWeek[i]) streakList[i].classList.add("complete");
    }

    document.querySelectorAll('.workout-block').forEach(block => {
    block.addEventListener('click', function() {
        const workoutId = this.getAttribute('data-workout');
        localStorage.setItem('selectedWorkout', workoutId);
        location.href = 'WorkoutDetail.html';
    });
});
});