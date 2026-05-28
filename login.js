import { initializeApp } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-app.js";

            import {
                getAuth,
                signInWithEmailAndPassword
            } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-auth.js";

            import {
                getFirestore,
                doc,
                setDoc
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

            document.getElementById("loginBtn").addEventListener("click", async () => {

                const email = document.getElementById("email").value;
                const password = document.getElementById("password").value;

                try {
                    // Sign in
                    const userCredential =
                        await signInWithEmailAndPassword(auth, email, password);

                    const user = userCredential.user;

                    // Redirect to home page
                    location.href = "index.html";

                } catch (error) {
                    console.error("Error signing in:", error);
                    alert("Login failed: " + error.message);
                }
            });