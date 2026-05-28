import { initializeApp } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-app.js";
import { 
    getAuth, 
    onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/10.0.0/firebase-auth.js";
import { 
    getFirestore, 
    doc, 
    setDoc,
    collection,
    addDoc
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

var currentUser = null;
var savedEdit = JSON.parse(localStorage.getItem('editWorkout')) || null;
onAuthStateChanged(auth, function (user) {
    if (!user) {
        window.location.href = "signup.html";
        return;
    }
    currentUser = user;
});
// Workout Data
var workout = savedEdit || {
    name: "Upper Day",
    exercises: [
        {
            name: "Incline Bench Press (Smith Machine)",
            sets: [
                { reps: 8, weight: 135 },
                { reps: 8, weight: 135 }
            ]
        }
    ]
};
var originalWorkout = JSON.stringify(workout);

function hasChanges() {
    // Read the current name from the input
    var currentName = document.getElementById("workout-name").value.trim();
    
    // Build a copy of the workout with current input values
    var current = JSON.parse(JSON.stringify(workout));
    current.name = currentName;

    return JSON.stringify(current) !== originalWorkout;
}

// Set Title
document.getElementById("workout-name").value = workout.name;

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
            '<TD><input type="number" class="edit-input" data-exercise="' + i + '" data-set="' + j + '" data-field="reps" value="' + set.reps + '"></TD>' +
            '<TD><input type="number" class="edit-input" data-exercise="' + i + '" data-set="' + j + '" data-field="weight" value="' + set.weight + '"></TD>' +
            "</TR>";
    }

    var cardHTML =
        '<DIV class="exercise-card">' +
            '<DIV class="card-header">' +
                '<input type="text" class="card-title-input" data-exercise="' + i + '" value="' + exercise.name + '">' +
                '<BUTTON class="delete-exercise-btn" data-exercise="' + i + '">Delete</BUTTON>' +
            "</DIV>" +
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
            '<DIV class="set-btns">' +
                '<BUTTON class="add-set-button">+ Add set</BUTTON>' +
                '<BUTTON class="remove-set-button" data-exercise="' + i + '">- Remove set</BUTTON>' +
            '</DIV>' +
        "</DIV>";

    list.innerHTML = list.innerHTML + cardHTML;
}

function AddSet()
{
    var card = this.closest(".exercise-card");
    var ei = parseInt(card.querySelector(".card-title-input").dataset.exercise);

    syncInputsToWorkout();

    var lastSet = workout.exercises[ei].sets.slice(-1)[0];
    workout.exercises[ei].sets.push({ reps: lastSet.reps, weight: lastSet.weight });

    rebuildExerciseList();
}

var addSetButton = document.getElementsByClassName("add-set-button");
for (var i = 0; i < addSetButton.length; i++)
{
    addSetButton[i].addEventListener("click", AddSet);
}

document.addEventListener("change", function (e) {
    if (e.target.classList.contains("edit-input")) {
        var ei = parseInt(e.target.dataset.exercise);
        var si = parseInt(e.target.dataset.set);
        var field = e.target.dataset.field;
        var value = parseFloat(e.target.value) || 0;
        workout.exercises[ei].sets[si][field] = value;
    }
    if (e.target.classList.contains("card-title-input")) {
        var ei = parseInt(e.target.dataset.exercise);
        workout.exercises[ei].name = e.target.value;
    }
});

document.getElementById("save-button").addEventListener("click", async function () {
    if (!currentUser) {
        alert("You must be signed in to save.");
        return;
    }

    syncInputsToWorkout();
    workout.name = document.getElementById("workout-name").value.trim() || "Untitled Workout";

    var dataToSave = {
        name: workout.name,
        exercises: workout.exercises,
        updatedAt: new Date()
    };

    try {
        var workoutsCollection = collection(db, "users", currentUser.uid, "workouts");
        await addDoc(workoutsCollection, dataToSave);

        localStorage.setItem('editWorkout', JSON.stringify(workout));
        window.location.href = "WorkoutDetail.html";
    } catch (error) {
        console.error("Error saving workout:", error);
        alert("Failed to save: " + error.message);
    }
});

document.getElementById("back-button").addEventListener("click", function () {
    if (hasChanges()) {
        document.getElementById("confirmOverlay").classList.remove("hidden");
    } else {
        window.history.back();
    }
});

function hideConfirm() {
    document.getElementById("confirmOverlay").classList.add("hidden");
}

function leaveWithoutSaving() {
    window.history.back();
}

window.hideConfirm = hideConfirm;
window.leaveWithoutSaving = leaveWithoutSaving;

document.getElementById("add-exercise-button").addEventListener("click", function () {
    // Add a blank exercise to the workout data
    workout.exercises.push({
        name: "New Exercise",
        sets: [{ reps: 8, weight: 0 }]
    });

    // Build the new card
    var i = workout.exercises.length - 1;
    var exercise = workout.exercises[i];

    var rowsHTML =
        "<TR>" +
            '<TD class="set-num">1</TD>' +
            '<TD><input type="number" class="edit-input" data-exercise="' + i + '" data-set="0" data-field="reps" value="8"></TD>' +
            '<TD><input type="number" class="edit-input" data-exercise="' + i + '" data-set="0" data-field="weight" value="0"></TD>' +
        "</TR>";

    var cardHTML =
        '<DIV class="exercise-card">' +
            '<DIV class="card-header">' +
                '<input type="text" class="card-title-input" data-exercise="' + i + '" value="' + exercise.name + '">' +
                '<BUTTON class="delete-exercise-btn" data-exercise="' + i + '">Delete</BUTTON>' +
            "</DIV>" +
            '<TABLE class="sets-table">' +
                "<THEAD><TR><TH>Set</TH><TH>Reps</TH><TH>Weight</TH></TR></THEAD>" +
                "<TBODY>" + rowsHTML + "</TBODY>" +
            "</TABLE>" +
            '<DIV class="set-btns">' +
                '<BUTTON class="add-set-button">+ Add set</BUTTON>' +
                '<BUTTON class="remove-set-button" data-exercise="' + i + '">- Remove set</BUTTON>' +
            '</DIV>' +
        "</DIV>";

    list.insertAdjacentHTML("beforeend", cardHTML);

    // Re-attach add set listeners since we rebuilt innerHTML
    var buttons = document.getElementsByClassName("add-set-button");
    for (var b = 0; b < buttons.length; b++) {
        buttons[b].removeEventListener("click", AddSet);
        buttons[b].addEventListener("click", AddSet);
    }
});

function syncInputsToWorkout() {
    var nameInputs = document.getElementsByClassName("card-title-input");
    for (var i = 0; i < nameInputs.length; i++) {
        var ei = parseInt(nameInputs[i].dataset.exercise);
        workout.exercises[ei].name = nameInputs[i].value;
    }

    var editInputs = document.getElementsByClassName("edit-input");
    for (var i = 0; i < editInputs.length; i++) {
        var ei = parseInt(editInputs[i].dataset.exercise);
        var si = parseInt(editInputs[i].dataset.set);
        var field = editInputs[i].dataset.field;
        if (!isNaN(ei) && !isNaN(si) && field) {
            workout.exercises[ei].sets[si][field] = parseFloat(editInputs[i].value) || 0;
        }
    }
}

function rebuildExerciseList() {
    list.innerHTML = "";

    for (var i = 0; i < workout.exercises.length; i++) {
        var exercise = workout.exercises[i];
        var rowsHTML = "";

        for (var j = 0; j < exercise.sets.length; j++) {
            var set = exercise.sets[j];
            rowsHTML +=
                "<TR>" +
                    '<TD class="set-num">' + (j + 1) + "</TD>" +
                    '<TD><input type="number" class="edit-input" data-exercise="' + i + '" data-set="' + j + '" data-field="reps" value="' + set.reps + '"></TD>' +
                    '<TD><input type="number" class="edit-input" data-exercise="' + i + '" data-set="' + j + '" data-field="weight" value="' + set.weight + '"></TD>' +
                "</TR>";
        }

        var cardHTML =
            '<DIV class="exercise-card">' +
                '<DIV class="card-header">' +
                    '<input type="text" class="card-title-input" data-exercise="' + i + '" value="' + exercise.name + '">' +
                    '<BUTTON class="delete-exercise-btn" data-exercise="' + i + '">Delete</BUTTON>' +
                "</DIV>" +
                '<TABLE class="sets-table">' +
                    "<THEAD><TR><TH>Set</TH><TH>Reps</TH><TH>Weight</TH></TR></THEAD>" +
                    "<TBODY>" + rowsHTML + "</TBODY>" +
                "</TABLE>" +
                '<DIV class="set-btns">' +
                    '<BUTTON class="add-set-button">+ Add set</BUTTON>' +
                    '<BUTTON class="remove-set-button" data-exercise="' + i + '">- Remove set</BUTTON>' +
                '</DIV>' +
            "</DIV>";

        list.innerHTML += cardHTML;
    }

    // Re-attach add set listeners
    var buttons = document.getElementsByClassName("add-set-button");
    for (var b = 0; b < buttons.length; b++) {
        buttons[b].removeEventListener("click", AddSet);
        buttons[b].addEventListener("click", AddSet);
    }
}

document.addEventListener("click", function (e) {
    if (e.target.classList.contains("delete-exercise-btn")) {
        var ei = parseInt(e.target.dataset.exercise);
        syncInputsToWorkout();
        workout.exercises.splice(ei, 1);
        rebuildExerciseList();
    }
    if (e.target.classList.contains("remove-set-button")) {
        var ei = parseInt(e.target.dataset.exercise);
        if (workout.exercises[ei].sets.length > 1) {
            syncInputsToWorkout();
            workout.exercises[ei].sets.pop();
            rebuildExerciseList();
        }
    }
});