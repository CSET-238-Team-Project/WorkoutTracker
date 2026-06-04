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
var isNewWorkout = localStorage.getItem('isNewWorkout') === 'true';
var savedEdit = JSON.parse(localStorage.getItem('editWorkout')) || null;

// Workout Data
var workout = isNewWorkout 
    ? { name: "", exercises: [] }
    : (savedEdit || {
        name: "Upper Day",
        exercises: [{
            name: "Incline Bench Press (Smith Machine)",
            sets: [
                { reps: 8, weight: 135 },
                { reps: 8, weight: 135 }
            ]
        }]
    });

var originalWorkout = JSON.stringify(workout);
var list = document.getElementById("exercise-list");

// Setup UI based on isNewWorkout
if(isNewWorkout) {
    document.getElementById("workout-day").style.display = "block";
    document.getElementById("workout-name").style.display = "none";
    document.getElementById("page-title").textContent = "Create Workout";
    document.getElementById("workout-day").value = "";
} else {
    document.getElementById("workout-day").style.display = "none";
    document.getElementById("workout-name").style.display = "block";
    document.getElementById("page-title").textContent = "Edit Workout";
    document.getElementById("workout-name").value = workout.name;
}

// Build initial exercise cards
for (var i = 0; i < workout.exercises.length; i++) {
    var exercise = workout.exercises[i];
    var rowsHTML = "";

    for (var j = 0; j < exercise.sets.length; j++) {
        var set = exercise.sets[j];
        rowsHTML += "<TR>" +
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

// Wait for auth before attaching listeners
onAuthStateChanged(auth, function (user) {
    console.log('Auth state changed, user:', user?.uid);
    
    if (!user) {
        window.location.href = "signup.html";
        return;
    }
    
    currentUser = user;
    console.log('✓ currentUser set to:', currentUser.uid);

    // NOW attach all event listeners when user is authenticated
    attachEventListeners();
});

function attachEventListeners() {
    console.log('Attaching event listeners, currentUser:', currentUser?.uid);

    // Add set buttons
    var addSetButton = document.getElementsByClassName("add-set-button");
    for (var i = 0; i < addSetButton.length; i++) {
        addSetButton[i].addEventListener("click", AddSet);
    }

    // Change events
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

    // SAVE button
    document.getElementById("save-button").addEventListener("click", async function () {
        console.log('✓ Save button clicked');
        console.log('currentUser value:', currentUser?.uid);
        
        if (!currentUser) {
            console.log('✗ currentUser is null');
            alert("You must be signed in to save.");
            return;
        }

        syncInputsToWorkout();

        var workoutName;
        if(isNewWorkout) {
            workoutName = document.getElementById("workout-day").value.trim();
            console.log('New workout name:', workoutName);
            if(!workoutName) {
                alert("Please enter a workout name.");
                return;
            }
        } else {
            workoutName = document.getElementById("workout-name").value.trim() || "Untitled Workout";
        }
        
        workout.name = workoutName;
        var dataToSave = {
            name: workout.name,
            exercises: workout.exercises,
            updatedAt: new Date()
        };

        console.log('Saving workout:', dataToSave);
        document.getElementById("save-button").disabled = true;

        try {
            if (isNewWorkout) {
                console.log('Creating new workout...');
                const workoutsCollection = collection(db, "users", currentUser.uid, "workouts");
                const newDocRef = await addDoc(workoutsCollection, dataToSave);
                console.log("✓ New workout saved with ID:", newDocRef.id);
                console.log("✓ Workout name:", workout.name);
                console.log("✓ Exercise count:", workout.exercises.length);
            } else {
                console.log('Updating existing workout...');
                const workoutId = localStorage.getItem('selectedWorkout');
                if (workoutId) {
                    const workoutRef = doc(db, "users", currentUser.uid, "workouts", workoutId);
                    await setDoc(workoutRef, dataToSave);
                    console.log("✓ Workout updated:", workoutId);
                }
            }

            localStorage.removeItem('editWorkout');
            localStorage.removeItem('isNewWorkout');
            console.log('✓ Redirecting to index.html...');
            window.location.href = "index.html";
        } catch (error) {
            console.error("✗ Error saving workout:", error);
            alert("Failed to save: " + error.message);
            document.getElementById("save-button").disabled = false;
        }
    });

    // BACK button
    document.getElementById("back-button").addEventListener("click", function () {
        if (hasChanges()) {
            document.getElementById("confirmOverlay").classList.remove("hidden");
        } else {
            window.history.back();
        }
    });

    // ADD EXERCISE button
    document.getElementById("add-exercise-button").addEventListener("click", function () {
        workout.exercises.push({
            name: "New Exercise",
            sets: [{ reps: 8, weight: 0 }]
        });

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

        var buttons = document.getElementsByClassName("add-set-button");
        for (var b = 0; b < buttons.length; b++) {
            buttons[b].removeEventListener("click", AddSet);
            buttons[b].addEventListener("click", AddSet);
        }
    });

    // Delete and remove set listeners
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
}

// Helper functions
function hasChanges() {
    var currentName = isNewWorkout
        ? document.getElementById("workout-day").value.trim()
        : document.getElementById("workout-name").value.trim();

    var current = JSON.parse(JSON.stringify(workout));
    current.name = currentName;

    return JSON.stringify(current) !== originalWorkout;
}

function AddSet() {
    var card = this.closest(".exercise-card");
    var ei = parseInt(card.querySelector(".card-title-input").dataset.exercise);

    syncInputsToWorkout();

    var lastSet = workout.exercises[ei].sets.slice(-1)[0];
    workout.exercises[ei].sets.push({ reps: lastSet.reps, weight: lastSet.weight });

    rebuildExerciseList();
}

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

    var buttons = document.getElementsByClassName("add-set-button");
    for (var b = 0; b < buttons.length; b++) {
        buttons[b].removeEventListener("click", AddSet);
        buttons[b].addEventListener("click", AddSet);
    }
}

function hideConfirm() {
    document.getElementById("confirmOverlay").classList.add("hidden");
}

function leaveWithoutSaving() {
    window.history.back();
}

window.hideConfirm = hideConfirm;
window.leaveWithoutSaving = leaveWithoutSaving;