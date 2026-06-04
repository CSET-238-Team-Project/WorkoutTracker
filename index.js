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

const workoutPanel = document.querySelector('.workout-panel');
if (workoutPanel) {
    workoutPanel.addEventListener('click', function (e) {
        const workoutBlock = e.target.closest('.workout-block');
        if (workoutBlock) {
            const workoutId = workoutBlock.getAttribute('data-workout');
            localStorage.removeItem('isNewWorkout');
            localStorage.setItem('selectedWorkout', workoutId);
            location.href = 'WorkoutDetail.html';
        }
    });
}

onAuthStateChanged(auth, async (user) => {
    console.log('Auth state changed, user:', user?.uid);
    
    if (!user) {
        window.location.href = "signup.html";
        return;
    }
    
    const myRef = doc(db, "users", user.uid);
    const snap = await getDoc(myRef);
    const data = snap.data() || {};
    
    // Safely initialize streak with defaults
    const streak = data.streak || {};
    streak.weeks = streak.weeks || 0;
    streak.days = streak.days || [0, 0, 0, 0, 0, 0, 0];
    
    const streakCount = parseInt(localStorage.getItem('workoutStreak')) || 0;

    // Safe updates with null checks
    const streakCountEl = document.querySelector('.streak-count');
    const statCardEl = document.querySelector('.stat-card p');
    
    if (streakCountEl) streakCountEl.textContent = `${streakCount} day streak`;
    if (statCardEl) statCardEl.textContent = `${streakCount} Days`;

    // Safe streak list access
    const todayIndex = (new Date().getDay() + 6) % 7;
    const dayIds = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
    const streakList = dayIds.map(id => document.getElementById(id)).filter(el => el !== null);

    if (streakList.length > 0 && streakList[todayIndex]) {
        streakList[todayIndex].classList.add("today");
    }

    const streakWeeksEl = document.getElementById('streak-weeks');
    if (streakWeeksEl) streakWeeksEl.textContent = `${streak.weeks || 0} week(s)`;
    
    let count = 0;
    if (Array.isArray(streak.days)) {
        for (let i = todayIndex; i >= 0; i--) {
            if (streak.days[i]) count++;
        }
    }
    
    const streakCountEl2 = document.getElementById('streak-count');
    if (streakCountEl2) streakCountEl2.textContent = `${count + (7 * (streak.weeks || 0))} day streak`;

    // Safe complete days update
    if (Array.isArray(streak.days)) {
        for (let i = 0; i < 7 && i < streakList.length; i++) {
            if (streak.days[i] && streakList[i]) {
                streakList[i].classList.add("complete");
            }
        }
    }
    
    console.log('Loading custom workouts...');
    await loadCustomWorkouts(user.uid);
    console.log('Setting up workout block listeners...');
    setupWorkoutBlockListeners();
});

async function loadCustomWorkouts(userId) 
{
    const workoutPanel = document.querySelector(".workout-panel");
    
    console.log('loadCustomWorkouts called for user:', userId);
    console.log('workoutPanel found:', !!workoutPanel);

    if(!workoutPanel) {
        console.error('workout-panel not found!');
        return;
    }

    // Remove any previously loaded dynamic blocks
    const existingDynamic = workoutPanel.querySelectorAll(".workout-block[data-dynamic]");
    console.log('Removing existing dynamic blocks:', existingDynamic.length);
    existingDynamic.forEach(el => el.remove());

    try
    {
        console.log('Querying Firestore for workouts...');
        const workoutsCollection = collection(db, "users", userId, "workouts");
        const querySnapshot = await getDocs(workoutsCollection);

        console.log('✓ Query returned:', querySnapshot.docs.length, 'workouts');

        if(querySnapshot.empty) {
            console.log('No workouts found in Firestore');
            return;
        }

        querySnapshot.forEach(doc => {
            const workoutData = doc.data();
            const workoutId = doc.id;
            const exerciseCount = workoutData.exercises ? workoutData.exercises.length : 0;

            console.log('Processing workout:', {
                id: workoutId,
                name: workoutData.name,
                exerciseCount: exerciseCount
            });

            let exerciseRowsHTML = '';
            if(workoutData.exercises)
            {
                workoutData.exercises.slice(0,3).forEach(exercise => {
                    exerciseRowsHTML += `
                        <div class="exercise-row">
                            <span>${exercise.name}</span>
                            <span>${exercise.sets.length} sets</span>
                        </div>
                    `;
                });
                if(exerciseCount > 3)
                {
                    exerciseRowsHTML += `
                        <div class="exercise-row">
                            <span>...and ${exerciseCount - 3} more</span>
                        </div>
                    `;
                }
            }

            const blockHTML = `
                <div class="workout-block" data-workout="${workoutId}" data-dynamic="true">
                    <div class="block-header">
                        <h3>${workoutData.name}</h3>
                        <span>${exerciseCount} exercises</span>
                    </div>
                    ${exerciseRowsHTML}
                </div>
            `;

            console.log('Inserting block HTML for:', workoutData.name);
            workoutPanel.insertAdjacentHTML('beforeend', blockHTML);
        });

        console.log('✓ All workouts inserted into DOM');
    }
    catch (error)
    {
        console.error("✗ Error loading custom workouts:", error);
    }
}

//function to initiate new workout creation
function addNewWorkout()
{
    localStorage.removeItem('editWorkout');
    localStorage.removeItem('selectedWorkout');
    localStorage.setItem('isNewWorkout', 'true');
    window.location.href = 'EditWorkout.html';
}

function setupWorkoutBlockListeners() 
{
    console.log('setupWorkoutBlockListeners called');
    
    const workoutPanel = document.querySelector('.workout-panel');
    if(!workoutPanel) {
        console.error('workout-panel not found!');
        return;
    }

    // Check if listener already attached to avoid duplicates
    if (workoutPanel._listenerAttached) {
        console.log('Listener already attached');
        return;
    }

    workoutPanel.addEventListener('click', function(e) {
        console.log('Workout panel clicked');
        const workoutBlock = e.target.closest('.workout-block');
        if (workoutBlock) {
            const workoutId = workoutBlock.getAttribute('data-workout');
            console.log('Navigating to workout:', workoutId);
            localStorage.removeItem('isNewWorkout');
            localStorage.setItem('selectedWorkout', workoutId);
            location.href = 'WorkoutDetail.html';
        }
    });

    workoutPanel._listenerAttached = true;
    console.log('Click listener attached');
}

window.addNewWorkout = addNewWorkout;