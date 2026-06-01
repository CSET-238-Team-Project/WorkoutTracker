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
    updateDoc
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
let currentUser = null;

onAuthStateChanged(auth, async (user) => {
    if (!user) 
    {
        window.location.href = "signup.html";
        return;
    }

    const myRef = doc(db, "users", user.uid);
    const snap = await getDoc(myRef);
    const data = snap.data() || {};
    const name = data.name;
    const email = user.email;
    currentUser = user;

    document.getElementById("username").textContent = name;
    document.getElementById('signoutBtn').addEventListener('click', () => auth.signOut());

    const milestonesRef = collection(
        db,
        "users",
        user.uid,
        "milestones"
    );

    const milestoneSnapshot =
        await getDocs(milestonesRef);

    milestoneList.innerHTML = "";

    milestoneSnapshot.forEach(docSnap => {

        const milestone = docSnap.data();

        createMilestoneElement(
            docSnap.id,
            milestone.name,
            milestone.goal,
            milestone.completed
        );
    });
});


const addMilestoneBtn = document.getElementById("addMilestoneBtn");
const modal = document.getElementById("milestoneModal");
const saveMilestone = document.getElementById("saveMilestone");
const cancelMilestone = document.getElementById("cancelMilestone");

const milestoneName = document.getElementById("milestoneName");
const milestoneGoal = document.getElementById("milestoneGoal");

const milestoneList = document.getElementById("milestoneList");

// Open popup
addMilestoneBtn.addEventListener("click", () => {
    modal.style.display = "flex";
});

// Close popup
cancelMilestone.addEventListener("click", () => {
    modal.style.display = "none";

    milestoneName.value = "";
    milestoneGoal.value = "";
});

// Save milestone
saveMilestone.addEventListener("click", () => {

    const name = milestoneName.value.trim();
    const goal = milestoneGoal.value.trim();

    if (!name || !goal) {
        alert("Please fill out both fields.");
        return;
    }

    const milestone = document.createElement("div");
    milestone.className = "milestone";

    milestone.innerHTML = `
        <div class="milestone-info">
            <div class="milestone-title">
                ${name}
            </div>

            <div class="milestone-date">
                Goal: ${goal}
            </div>
        </div>

        <button class="complete-btn pending">
            Complete
        </button>
    `;

    milestoneList.appendChild(milestone);

    const completeButton =
        milestone.querySelector(".complete-btn");

    completeButton.addEventListener("click", markCompleted);

    milestoneName.value = "";
    milestoneGoal.value = "";

    modal.style.display = "none";
});

function createMilestoneElement(id, name, goal, completed) {

    const milestone = document.createElement("div");
    milestone.className = "milestone";

    milestone.innerHTML = `
        <div class="milestone-info">
            <div class="milestone-title">
                ${name}
            </div>

            <div class="milestone-date">
                Goal: ${goal}
            </div>
        </div>

        <button class="complete-btn ${
            completed ? "completed" : "pending"
        }">
            ${
                completed
                    ? "✓ Completed"
                    : "Complete"
            }
        </button>
    `;

    const button =
        milestone.querySelector(".complete-btn");

    if (!completed) {

        button.addEventListener("click", async () => {

            const milestoneRef = doc(
                db,
                "users",
                currentUser.uid,
                "milestones",
                id
            );

            await updateDoc(milestoneRef, {
                completed: true
            });

            button.textContent = "✓ Completed";
            button.classList.remove("pending");
            button.classList.add("completed");
            button.disabled = true;
        });
    }
    else {
        button.disabled = true;
    }

    milestoneList.appendChild(milestone);
}

saveMilestone.addEventListener("click", async () => {

    const name = milestoneName.value.trim();
    const goal = milestoneGoal.value.trim();

    if (!name || !goal) {
        alert("Please fill out both fields.");
        return;
    }

    const docRef = await addDoc(
        collection(
            db,
            "users",
            currentUser.uid,
            "milestones"
        ),
        {
            name,
            goal,
            completed: false
        }
    );

    createMilestoneElement(
        docRef.id,
        name,
        goal,
        false
    );

    milestoneName.value = "";
    milestoneGoal.value = "";

    modal.style.display = "none";
});