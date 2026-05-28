// Workout Data
const selectedWorkout = localStorage.getItem('selectedWorkout'); // pulls from index.js
if(selectedWorkout === 'push')
{
    var workout = {
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
}

else if(selectedWorkout === 'pull')
{
    var workout = {
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
}

else if(selectedWorkout === 'legs')
{
    var workout = {
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
}
else (selectedWorkout !== 'push' 
    && selectedWorkout !== 'pull' 
    && selectedWorkout !== 'legs')
    {
        var workout = {
            name: "Custom Workout", 
            exercises: [

            ]
        };
    }

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

function startWorkout() 
{
    localStorage.setItem('activeWorkout' , JSON.stringify(workout));
    window.location.href = 'LoggerPage.html';
}
