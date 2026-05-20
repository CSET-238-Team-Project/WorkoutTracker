// ── Exercise data (replace with your Firestore fetch) ────────────────────────
const exercises = [
{ name: "Bench press", icon: "ti-barbell", sets: [{ w: 60, r: 10 }, { w: 65, r: 8 }, { w: 65, r: 8 }] },
{ name: "Overhead press", icon: "ti-arrow-up", sets: [{ w: 40, r: 10 }, { w: 42.5, r: 8 }] },
{ name: "Tricep pushdown", icon: "ti-arrow-down", sets: [{ w: 25, r: 12 }, { w: 27.5, r: 10 }] },
];

let openSections = new Set([0]);
let doneSets = {};

// ── Timer (starts when page opens) ───────────────────────────────────────────
const startTime = Date.now();
const timerInterval = setInterval(() => {
  let totalSecs = Math.floor((Date.now() - startTime) / 1000);
  const mins = Math.floor(totalSecs / 60);
  const secs = totalSecs % 60;
  document.getElementById('timerDisplay').textContent =
    String(mins).padStart(2, '0') + ':' + String(secs).padStart(2, '0');
}, 1000);

// ── Render ────────────────────────────────────────────────────────────────────
function render() {
  const list = document.getElementById('exerciseList');
  list.innerHTML = '';

  exercises.forEach((ex, ei) => {
    const isOpen = openSections.has(ei);
    const doneCount = ex.sets.filter((_, si) => doneSets[`${ei}-${si}`]).length;

    const card = document.createElement('div');
    card.className = 'exercise-card';

    let setsHTML = '';
    if (isOpen) {
      const rows = ex.sets.map((s, si) => `
        <div class="set-row">
          <span class="set-num">${si + 1}</span>
          <input class="set-input" type="number" value="${s.w}" step="0.5" min="0"
            onchange="exercises[${ei}].sets[${si}].w = parseFloat(this.value) || 0">
          <input class="set-input" type="number" value="${s.r}" step="1" min="0"
            onchange="exercises[${ei}].sets[${si}].r = parseInt(this.value) || 0">
          <input class="set-input" type="number" value="90" step="5" min="0">
          <button class="check-btn ${doneSets[ei + '-' + si] ? 'done' : ''}"
            onclick="toggleDone(${ei}, ${si})">
            <i class="ti ti-check"></i>
          </button>
        </div>
      `).join('');

      setsHTML = `
        <div class="sets-section">
          <div class="sets-head">
            <span>#</span>
            <span>Weight (kg)</span>
            <span>Reps</span>
            <span>Rest (s)</span>
            <span></span>
          </div>
          ${rows}
          <div class="set-btns">
          <div style="display: flex; gap: 12px;">
            <button class="add-set-btn" onclick="addSet(${ei})">
                <i class="ti ti-plus" style="font-size:14px"></i> Add set
            </button>

            <button class="remove-set-btn" onClick="removeSet(${ei})">
                <i class="ti ti-minus" style="font-size:14px"></i> Remove Set
            </button>
            </div>
        </div>
        </div>
      `;
    }

    card.innerHTML = `
      <div class="exercise-header" onclick="toggleSection(${ei})">
        <div class="ex-icon"><i class="ti ${ex.icon}"></i></div>
        <div style="flex:1">
          <div class="ex-name">${ex.name}</div>
          <div class="ex-summary">${doneCount} / ${ex.sets.length} sets done</div>
        </div>
        <i class="ti ti-chevron-down ex-chevron ${isOpen ? 'open' : ''}"></i>
      </div>
      ${setsHTML}
    `;

    list.appendChild(card);
  });
}

// ── Actions ───────────────────────────────────────────────────────────────────
function toggleSection(ei) {
  if (openSections.has(ei)) openSections.delete(ei);
  else openSections.add(ei);
  render();
}

function toggleDone(ei, si) {
  const key = `${ei}-${si}`;
  if (doneSets[key]) delete doneSets[key];
  else doneSets[key] = true;
  render();
}

function addSet(ei) {
  const last = exercises[ei].sets.slice(-1)[0] || { w: 0, r: 8 };
  exercises[ei].sets.push({ ...last });
  render();
}

function removeSet(ei) {
  if (exercises[ei].sets.length > 1) exercises[ei].sets.pop();
  render();
}

function showConfirm() {
  document.getElementById('confirmOverlay').classList.remove('hidden');
}

function hideConfirm() {
  document.getElementById('confirmOverlay').classList.add('hidden');
}

function goHome() {
  clearInterval(timerInterval);
  // Replace with your actual navigation, e.g: window.location.href = 'index.html';
  alert('Navigating back to home page...');
}

function finishWorkout() {
  clearInterval(timerInterval);
  // Replace with your actual navigation, e.g: window.location.href = 'summary.html';
  alert('Workout finished! Navigating to summary...');
}

// ── Init ──────────────────────────────────────────────────────────────────────
render();