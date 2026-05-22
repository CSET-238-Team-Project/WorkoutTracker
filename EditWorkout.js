// Workout Data
var workout = {
    name: "Upper Day",
    exercises: [
    {
        name: "Incline Bench Press (Smith Machine)",
        sets: [
            { reps: 8, weight: 135 },
            { reps: 8, weight: 135 }
        ]
    },
    {
        name: "Chest Fly (Machine)",
        sets: [
            { reps: 8, weight: 120 },
            { reps: 8, weight: 120 }
        ]
    },
    {
        name: "Single Arm Lateral Raise (Cable)",
        sets: [
            { reps: 8, weight: 15 },
            { reps: 8, weight: 15 }
        ]
    },
    {
        name: "Seated Shoulder Press (Smith Machine)",
        sets: [
            { reps: 8, weight: 95 },
            { reps: 8, weight: 95 }
        ]
    },
    {
        name: "Lat Pulldown (Cable)",
        sets: [
            { reps: 8, weight: 120 },
            { reps: 8, weight: 120 }
        ]
    },
    {
        name: "Seated Cable Row - V Grip (Cable)",
        sets: [
            { reps: 8, weight: 90 },
            { reps: 8, weight: 90 }
        ]
    },
    {
        name: "Tricep Pushdown (Cable)",
        sets: [
            { reps: 8, weight: 55 },
            { reps: 8, weight: 55 }
        ]
    },
    {
        name: "Preacher Curl (Machine)",
        sets: [
            { reps: 8, weight: 70 },
            { reps: 8, weight: 70 }
        ]
    }
    ]
};

// Set Title
document.getElementById("workout-name").textContent = workout.name;

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