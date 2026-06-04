import { initializeApp } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-auth.js";
import { getFirestore, collection, query, where, getDocs, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js";

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

// Workout Data
var workout = null;

onAuthStateChanged(auth, async (user) => {
    const selectedWorkout = localStorage.getItem('selectedWorkout'); // pulls from index.js
    var edited = JSON.parse(localStorage.getItem('editWorkout')) || null;
    
    if (!user) {
        window.location.href = "signup.html";
        return;
    }

    if (edited) {
        workout = edited;
    } else if (selectedWorkout === 'push') {
        workout = {
            name: "Push Day",
            exercises: [
                {
                    name: "Bench Press",
                    sets: [
                        { reps: 10, weight: 135 },
                        { reps: 10, weight: 135 },
                        { reps: 10, weight: 135 },
                        { reps: 10, weight: 135 }
                    ]
                },
                {
                    name: "Shoulder Press",
                    sets: [
                        { reps: 12, weight: 120 },
                        { reps: 12, weight: 120 },
                        { reps: 12, weight: 120 },
                        { reps: 12, weight: 120 }
                    ]
                },
                {
                    name: "Tricep Dips",
                    sets: [
                        { reps: 15, weight: 15 },
                        { reps: 15, weight: 15 },
                        { reps: 15, weight: 15 }
                    ]
                },
                {
                    name: "Incline Dumbbell Press",
                    sets: [
                        { reps: 10, weight: 95 },
                        { reps: 10, weight: 95 },
                        { reps: 10, weight: 95 }
                    ]
                }
            ]
        };
    } else if (selectedWorkout === 'pull') {    
        workout = {
            name: "Pull Day",
            exercises: [
                {
                    name: "Pull-Ups",
                    sets: [
                        { reps: 8, weight: 45 },
                        { reps: 8, weight: 45 },
                        { reps: 8, weight: 45 },
                        { reps: 8, weight: 45 }
                    ]
                },
                {
                    name: "Barbell Rows",
                    sets: [
                        { reps: 10, weight: 120 },
                        { reps: 10, weight: 120 },
                        { reps: 10, weight: 120 },
                        { reps: 10, weight: 120 }
                    ]
                },
                {
                    name: "Bicep Curls",
                    sets: [
                        { reps: 12, weight: 15 }, 
                        { reps: 12, weight: 15 },
                        { reps: 12, weight: 15 }
                    ]
                },
                {
                    name: "Lat Pulldown",
                    sets: [
                        { reps: 12, weight: 100 },
                        { reps: 12, weight: 100 },
                        { reps: 12, weight: 100 }
                    ]
                }
            ]
        };
    } else if (selectedWorkout === 'legs') {
        workout = {
            name: "Leg Day",
            exercises: [
                {
                    name: "Squats",
                    sets: [
                        { reps: 8, weight: 135 },
                        { reps: 8, weight: 135 },
                        { reps: 8, weight: 135 },
                        { reps: 8, weight: 135 },
                        { reps: 8, weight: 135 }
                    ]
                },
                {
                    name: "Romanian Deadlifts",
                    sets: [
                        { reps: 10, weight: 120 },
                        { reps: 10, weight: 120 },
                        { reps: 10, weight: 120 },
                        { reps: 10, weight: 120 }
                    ]
                },
                {
                    name: "Leg Press",
                    sets: [
                        { reps: 12, weight: 15 },
                        { reps: 12, weight: 15 },
                        { reps: 12, weight: 15 },
                        { reps: 12, weight: 15 }
                    ]
                },
                {
                    name: "Calf Raises",
                    sets: [
                        { reps: 15, weight: 95 },
                        { reps: 15, weight: 95 },
                        { reps: 15, weight: 95 },
                        { reps: 15, weight: 95 }
                    ]
                }
            ]
        };
    } else if (selectedWorkout) {
        // Load custom workout from Firestore
        try {
            const docRef = doc(db, "users", user.uid, "workouts", selectedWorkout);
            const docSnap = await getDoc(docRef);
            
            if (docSnap.exists()) {
                workout = docSnap.data();
            } else {
                console.error("Workout not found");
                window.location.href = "index.html";
            }
        } catch (error) {
            console.error("Error loading workout:", error);
            window.location.href = "index.html";
        }
    }

    initializeWorkoutDetail();
});

function initializeWorkoutDetail()
{
    if (!workout)
        return;

    localStorage.removeItem('editWorkout');

    // Set Title
    document.getElementById("workout-title").textContent = workout.name;

    // Count Sets
    var totalSets = 0;
    for (var i = 0; i < workout.exercises.length; i++) {
        totalSets = totalSets + workout.exercises[i].sets.length;
    }

    // Estimate Time
    var totalMinutes = (totalSets * 4) + ((workout.exercises.length - 1) * 2.5);
    var timeText;

    if (totalMinutes >= 60) {
        var hours = Math.floor(totalMinutes / 60);
        var mins = Math.round(totalMinutes % 60);

        if (mins > 0) {
            timeText = "~" + hours + " hr " + mins + " min";
        } else {
                        timeText = "~" + hours + " hr";
        }
    } else {
        // Under 60 minutes, just show minutes
        timeText = "~" + Math.round(totalMinutes) + " min";
    }

    // Update Info Sub-Heading
    document.getElementById("info-exercises").textContent = workout.exercises.length + " exercises";
    document.getElementById("info-time").textContent = timeText;

    // Build Exercise Cards
    var list = document.getElementById("exercise-list");

    for (var i = 0; i < workout.exercises.length; i++) {
        var exercise = workout.exercises[i];

        var rowsHTML = "";

        for (var j = 0; j < exercise.sets.length; j++) {
            var set = exercise.sets[j];

            var repsText = set.reps;

            rowsHTML = rowsHTML +
                "<TR>" +
                    '<TD class="set-num">' + (j + 1) + "</TD>" +
                    "<TD>" + repsText + "</TD>" +
                    "<TD>" + set.weight + " lbs</TD>" +
                "</TR>";
        }

        var cardHTML =
            '<DIV class="exercise-card">' +
                '<DIV class="card-title">' + exercise.name + "</DIV>" +
                '<TABLE class="sets-table">' +
                    "<THEAD>" +
                        "<TR>" +
                            "<TH>Set</TH>" +
                            "<TH>Reps</TH>" +
                            "<TH>Weight</TH>" +
                        "</TR>" +
                    "</THEAD>" +
                    "<TBODY>" + rowsHTML + "</TBODY>" +
                "</TABLE>" +
            "</DIV>";

        list.innerHTML = list.innerHTML + cardHTML;
    }
}

function startWorkout() 
{
    localStorage.setItem('activeWorkout' , JSON.stringify(workout));
    window.location.href = 'LoggerPage.html';
}

function editWorkout()
{
    localStorage.removeItem('isNewWorkout');
    localStorage.setItem('editWorkout', JSON.stringify(workout));
    window.location.href = 'EditWorkout.html';
}

function goBack()
{
    window.location.href = 'index.html';
}

window.startWorkout = startWorkout;
window.editWorkout = editWorkout;
window.goBack = goBack;