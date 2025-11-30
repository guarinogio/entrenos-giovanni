// =================== CONFIG / STORAGE ===================

const STORAGE_KEY = "giovanni_workouts_v2";
const SCHEMA_VERSION = 1;

// Carga segura desde localStorage (soporta formato viejo de solo array)
function loadRawData() {
  let rawStr =
    localStorage.getItem(STORAGE_KEY) ||
    localStorage.getItem("giovanni_workouts");

  if (!rawStr) {
    return { schemaVersion: SCHEMA_VERSION, sessions: [] };
  }

  try {
    const parsed = JSON.parse(rawStr);
    if (Array.isArray(parsed)) {
      // formato antiguo: solo array
      return { schemaVersion: SCHEMA_VERSION, sessions: parsed };
    }
    if (parsed && Array.isArray(parsed.sessions)) {
      return {
        schemaVersion: parsed.schemaVersion || SCHEMA_VERSION,
        sessions: parsed.sessions
      };
    }
  } catch (err) {
    console.error("Error leyendo almacenamiento:", err);
  }

  return { schemaVersion: SCHEMA_VERSION, sessions: [] };
}

function getSessions() {
  return loadRawData().sessions;
}

function saveSessions(sessions) {
  const payload = { schemaVersion: SCHEMA_VERSION, sessions };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  // limpia clave antigua si existía
  localStorage.removeItem("giovanni_workouts");
}

function todayStr() {
  return new Date().toISOString().split("T")[0];
}

// mostrar fecha en header
document.addEventListener("DOMContentLoaded", () => {
  const dateSpan = document.getElementById("todayDate");
  if (dateSpan) dateSpan.textContent = todayStr();
});

// =================== PLANES DE ENTRENAMIENTO ===================

const WORKOUTS = {
  A: [
    {
      name: "Squat (Barbell)",
      rest: "2–4 min",
      description: "Top set + 2 back-offs al 90%. Técnica y bracing.",
      warmupPercents: [0, 0.4, 0.6, 0.8],
      warmupReps: [8, 5, 3, "1–2"],
      defaultSets: [
        { label: "Set 1 (Top)", weight: 70, targetReps: 4 },
        { label: "Set 2 (90%)", weight: 63, targetReps: 5 },
        { label: "Set 3 (90%)", weight: 63, targetReps: 5 }
      ]
    },
    {
      name: "Bench Press (Barbell)",
      rest: "2–3 min",
      description: "Empuje principal del día.",
      defaultSets: [
        { label: "Set 1", weight: 50, targetReps: 8 },
        { label: "Set 2", weight: 50, targetReps: 8 },
        { label: "Set 3", weight: 50, targetReps: 8 }
      ]
    },
    {
      name: "Seated Row (Machine)",
      rest: "60–90 s",
      description: "Tirón horizontal dominante.",
      defaultSets: [
        { label: "Set 1", weight: 60, targetReps: 10 },
        { label: "Set 2", weight: 60, targetReps: 10 },
        { label: "Set 3", weight: 60, targetReps: 10 },
        { label: "Set 4", weight: 60, targetReps: 10 }
      ]
    },
    {
      name: "Lat Pulldown",
      rest: "60–90 s",
      description: "Tirón vertical, pecho arriba.",
      defaultSets: [
        { label: "Set 1", weight: 50, targetReps: 10 },
        { label: "Set 2", weight: 50, targetReps: 10 },
        { label: "Set 3", weight: 50, targetReps: 10 }
      ]
    },
    {
      name: "Face Pull",
      rest: "60 s",
      description: "Postura y deltoides posterior.",
      defaultSets: [
        { label: "Set 1", weight: 20, targetReps: 12 },
        { label: "Set 2", weight: 20, targetReps: 12 },
        { label: "Set 3", weight: 20, targetReps: 12 }
      ]
    },
    {
      name: "Core (Plancha 25s)",
      rest: "45–60 s",
      description: "3×25 s controlando lumbar.",
      defaultSets: [
        { label: "Set 1", weight: "25 s", targetReps: 1 },
        { label: "Set 2", weight: "25 s", targetReps: 1 },
        { label: "Set 3", weight: "25 s", targetReps: 1 }
      ]
    }
  ],
  B: [
    {
      name: "Deadlift (Barbell)",
      rest: "2–4 min",
      description: "Top set + 2 back-offs, lumbar neutra.",
      warmupPercents: [0.4, 0.6, 0.8],
      warmupReps: [5, 3, "1–2"],
      defaultSets: [
        { label: "Set 1 (Top)", weight: 90, targetReps: 3 },
        { label: "Set 2 (90%)", weight: 80, targetReps: 5 },
        { label: "Set 3 (90%)", weight: 80, targetReps: 5 }
      ]
    },
    {
      name: "Overhead Press",
      rest: "2–3 min",
      description: "Empuje vertical, controlado.",
      defaultSets: [
        { label: "Set 1", weight: 30, targetReps: 8 },
        { label: "Set 2", weight: 30, targetReps: 8 },
        { label: "Set 3", weight: 30, targetReps: 8 }
      ]
    },
    {
      name: "Single Arm Row (DB)",
      rest: "60–90 s",
      description: "Tirón unilateral, estabilidad.",
      defaultSets: [
        { label: "Set 1", weight: 26, targetReps: 10 },
        { label: "Set 2", weight: 26, targetReps: 10 },
        { label: "Set 3", weight: 26, targetReps: 10 }
      ]
    }
  ]
};

// CARDIO
const CARDIO_MODALITIES = [
  "Bici estática / Spinning",
  "Elíptica",
  "Caminata cinta 2–6%",
  "Remo",
  "Piscina"
];

const CARDIO_ZONES = [
  { label: "Zona 2 (110–128 lpm) — RPE 3–4", value: "Z2" },
  { label: "Zona 3 (128–146 lpm) — RPE 5–6", value: "Z3" },
  { label: "Picos controlados (155–170 lpm) — RPE 7–8", value: "PICOS" }
];

// MOVILIDAD
const MOBILITY_BLOCKS = [
  {
    title: "Daily Reset (8–10 min)",
    items: [
      "90/90 Hip Lift con reach — 3×5 resp.",
      "Dead Bug — 2×6–8",
      "Wall Slides — 2×8–10",
      "Chin Tucks + Nods — 2×8 (2 s)",
      "Short-Foot + Toe Splay — 2×20–30 s/pie"
    ]
  },
  {
    title: "Pre-Fuerza A (sentadilla/rodilla)",
    items: [
      "Knee-to-Wall — 2×8/lado",
      "Couch Stretch — 2×30–40 s/lado",
      "90/90 Hip Lift — 1×3 resp.",
      "Wall Slides — 1×10",
      "Goblet Squat respirado — 2×5"
    ]
  },
  {
    title: "Pre-Fuerza B (bisagra/peso muerto)",
    items: [
      "Hinge Drill con palo — 2×8",
      "Soleus Raises — 2×12",
      "Hamstring Sweep — 2×8/lado",
      "Pallof Press — 2×8/lado",
      "Serratus Punches — 2×10"
    ]
  },
  {
    title: "Post-Fuerza (6–8 min)",
    items: [
      "Open Book — 1×8/lado",
      "Extensión torácica en foam — 1–2 min",
      "Child’s Pose con exhalación — 1–2 min",
      "Pantorrilla a pared — 1×30 s/ángulo"
    ]
  },
  {
    title: "Pies / Fascitis (3×/sem)",
    items: [
      "Gemelos de pie — 3×12 @ 3-0-3",
      "Sóleo sentado — 3×12 @ 3-0-3",
      "Big-Toe Stretch — 2×30 s/pie",
      "Rodillo/Bola fascia plantar — 1–2 min/pie"
    ]
  }
];

// =================== HELPERS DE PROGRESIÓN ===================

function getExerciseHistory(exName) {
  const all = getSessions().slice().reverse();
  const arr = [];
  all.forEach(sess => {
    (sess.exercises || []).forEach(ex => {
      if (ex.name === exName) arr.push(ex);
    });
  });
  return arr;
}

function roundTo2_5(num) {
  return Math.round(num / 2.5) * 2.5;
}

function estimate1RM(weight, reps) {
  const w = Number(weight),
    r = Number(reps);
  if (!w || !r) return null;
  return w * (1 + r / 30);
}

function getBest1RMForExercise(exName) {
  const hist = getExerciseHistory(exName);
  let best = 0;
  hist.forEach(ex => {
    ex.sets.forEach(s => {
      const e = estimate1RM(s.weight, s.reps);
      if (e && e > best) best = e;
    });
  });
  return best;
}

function restToSeconds(restStr) {
  if (!restStr) return 60;
  const r = restStr.toLowerCase();
  if (r.includes("2–4") || r.includes("2-4")) return 180;
  if (r.includes("2–3") || r.includes("2-3")) return 150;
  if (r.includes("60–90") || r.includes("60-90")) return 75;
  if (r.includes("45–60") || r.includes("45-60")) return 50;
  if (r.includes("90 s")) return 90;
  if (r.includes("60 s") || r.includes("60s")) return 60;
  return 60;
}

function formatTime(s) {
  const m = Math.floor(s / 60),
    sec = s % 60;
  return `${m.toString().padStart(2, "0")}:${sec
    .toString()
    .padStart(2, "0")}`;
}

// Semáforo de carga
function getSuggestedWeight(exName, setIndex, defW) {
  const history = getExerciseHistory(exName);
  if (!history.length) return defW;
  const last1 = history[0],
    last1set = last1.sets[setIndex];
  if (!last1set) return defW;
  if (history.length === 1) return Number(last1set.weight) || defW;
  const last2 = history[1],
    last2set = last2.sets[setIndex];
  if (!last2set) return Number(last1set.weight) || defW;

  const reps1 = Number(last1set.reps) || 0;
  const reps2 = Number(last2set.reps) || 0;
  const rpe1 = Number(last1set.rpe) || 0;
  const rpe2 = Number(last2set.rpe) || 0;
  const target1 = last1set.targetReps || 5;
  const target2 = last2set.targetReps || 5;
  const w1 = Number(last1set.weight) || defW;

  const good1 = reps1 >= target1 && (rpe1 === 0 || rpe1 <= 8);
  const good2 = reps2 >= target2 && (rpe2 === 0 || rpe2 <= 8);
  const bad1 = reps1 < target1 || (rpe1 !== 0 && rpe1 >= 9);
  const bad2 = reps2 < target2 || (rpe2 !== 0 && rpe2 >= 9);

  if (good1 && good2) return roundTo2_5(w1 + 2.5);
  if (bad1 && bad2) return Math.round(w1 * 0.9 * 10) / 10;
  return w1;
}

// =================== RENDER FUERZA ===================

const activeTimers = {};

function updateWarmupsForExercise(dayKey, exIndex) {
  const ex = WORKOUTS[dayKey][exIndex];
  if (!ex.warmupPercents) return;
  const topInput = document.querySelector(
    `input[data-ex="${exIndex}"][data-set="0"][data-field="weight"]`
  );
  const topWeight = Number(topInput?.value) || ex.defaultSets[0].weight;
  const warmupContainer = document.querySelector(
    `#ex-${dayKey}-${exIndex} .warmups`
  );
  if (!warmupContainer) return;
  warmupContainer.innerHTML = "";
  ex.warmupPercents.forEach((p, i) => {
    const w = Math.round(topWeight * p);
    const repsText =
      ex.warmupReps && ex.warmupReps[i] ? ex.warmupReps[i] : "";
    const wb = document.createElement("div");
    wb.className = "warmups-block";
    wb.innerHTML = `<strong>W${i + 1}</strong><span class="small">${w} kg × ${repsText}</span>`;
    warmupContainer.appendChild(wb);
  });
}

function startRestTimer(dayKey, exIndex) {
  const ex = WORKOUTS[dayKey][exIndex];
  const secs = restToSeconds(ex.rest);
  const span = document.getElementById(`timer-${dayKey}-${exIndex}`);
  if (activeTimers[`${dayKey}-${exIndex}`]) {
    clearInterval(activeTimers[`${dayKey}-${exIndex}`]);
  }
  let remaining = secs;
  span.textContent = formatTime(remaining);
  activeTimers[`${dayKey}-${exIndex}`] = setInterval(() => {
    remaining--;
    span.textContent = formatTime(remaining);
    if (remaining <= 0) {
      clearInterval(activeTimers[`${dayKey}-${exIndex}`]);
      span.textContent = "✅";
    }
  }, 1000);
}

function renderStrength(dayKey) {
  const cont = document.getElementById("workoutContainer");
  const dayHint = document.getElementById("dayHint");
  cont.innerHTML = "";
  if (dayHint) dayHint.textContent = `Mostrando Día ${dayKey}.`;

  WORKOUTS[dayKey].forEach((ex, exIndex) => {
    const card = document.createElement("div");
    card.className = "card exercise";
    card.id = `ex-${dayKey}-${exIndex}`;

    const header = document.createElement("div");
    header.className = "exercise-header";
    header.innerHTML = `
      <div>
        <h3>${ex.name}</h3>
        <div class="info-line">${ex.description || ""}</div>
      </div>
      <div class="tags">
        <span class="tag">Descanso: ${ex.rest}</span>
      </div>
    `;
    card.appendChild(header);

    if (ex.warmupPercents) {
      const wDiv = document.createElement("div");
      wDiv.className = "warmups";
      card.appendChild(wDiv);
    }

    const setsDiv = document.createElement("div");
    setsDiv.className = "sets";
    ex.defaultSets.forEach((set, setIndex) => {
      const suggested = getSuggestedWeight(ex.name, setIndex, set.weight);
      const block = document.createElement("div");
      block.className = "set-field";
      block.innerHTML = `
        <label>${set.label} <span class="field-hint">(plan: ${set.weight} kg)</span></label>
        <input type="text" inputmode="decimal" autocomplete="off"
          data-ex="${exIndex}" data-set="${setIndex}" data-field="weight"
          value="${suggested}" placeholder="peso (kg)" />
        <input type="text" inputmode="numeric" autocomplete="off"
          data-ex="${exIndex}" data-set="${setIndex}" data-field="reps"
          placeholder="reps" />
        <input type="text" inputmode="decimal" autocomplete="off"
          data-ex="${exIndex}" data-set="${setIndex}" data-field="rpe"
          placeholder="RPE" />
        <div class="field-hint">Objetivo: ${set.targetReps} reps</div>
      `;
      setsDiv.appendChild(block);
    });
    card.appendChild(setsDiv);

    const restDiv = document.createElement("div");
    restDiv.className = "rest-timer";
    restDiv.innerHTML = `
      <button type="button" data-rest-ex="${exIndex}">⏱ Descanso</button>
      <span id="timer-${dayKey}-${exIndex}">--:--</span>
    `;
    card.appendChild(restDiv);

    cont.appendChild(card);
  });

  // warmups iniciales
  WORKOUTS[dayKey].forEach((ex, exIndex) =>
    updateWarmupsForExercise(dayKey, exIndex)
  );

  // actualizar warmups al cambiar top set
  const allTopInputs = document.querySelectorAll(
    `input[data-set="0"][data-field="weight"]`
  );
  allTopInputs.forEach(inp => {
    inp.addEventListener("input", e => {
      const exIndex = e.target.getAttribute("data-ex");
      updateWarmupsForExercise(dayKey, exIndex);
    });
  });

  const timerButtons = document.querySelectorAll(`button[data-rest-ex]`);
  timerButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      const exIndex = btn.getAttribute("data-rest-ex");
      startRestTimer(dayKey, exIndex);
    });
  });
}

// =================== RENDER CARDIO ===================

function renderCardio() {
  const cont = document.getElementById("workoutContainer");
  const dayHint = document.getElementById("dayHint");
  cont.innerHTML = "";
  if (dayHint)
    dayHint.textContent = "Aeróbico de bajo impacto (Zona 2 base).";

  const card = document.createElement("div");
  card.className = "card";
  card.innerHTML = `
    <h3>Plan Aeróbico — Giovanni</h3>
    <p class="small">Objetivo: +gasto, hígado graso, OSA, proteger lumbar/pies.</p>
    <div class="cardio-grid">
      <div class="cardio-field">
        <label>Modalidad</label>
        <select id="cardioMod">
          ${CARDIO_MODALITIES.map(
            m => `<option value="${m}">${m}</option>`
          ).join("")}
        </select>
      </div>
      <div class="cardio-field">
        <label>Duración (min)</label>
        <input type="text" inputmode="numeric" autocomplete="off" id="cardioDur" value="30" />
      </div>
      <div class="cardio-field">
        <label>Intensidad / Zona</label>
        <select id="cardioZone">
          ${CARDIO_ZONES.map(
            z => `<option value="${z.value}">${z.label}</option>`
          ).join("")}
        </select>
      </div>
      <div class="cardio-field">
        <label>RPE (opcional)</label>
        <input type="text" inputmode="decimal" autocomplete="off" id="cardioRpe" placeholder="3–4" />
      </div>
    </div>
    <p class="small">
      37 años → FC máx ≈ 183 lpm. Zona 2: 110–128. Caminata: prioriza inclinación antes que velocidad.
    </p>
  `;
  cont.appendChild(card);
}

// =================== RENDER MOVILIDAD ===================

function renderMobility() {
  const cont = document.getElementById("workoutContainer");
  const dayHint = document.getElementById("dayHint");
  cont.innerHTML = "";
  if (dayHint)
    dayHint.textContent = "Movilidad y Postura — bloques breves y repetibles.";

  const card = document.createElement("div");
  card.className = "card";
  card.innerHTML = `
    <h3>Plan de Movilidad y Postura — Giovanni</h3>
    <p class="small">Exhala 6–7 s, costillas abajo, movimientos lentos. Marca lo que hagas hoy.</p>
  `;

  const grid = document.createElement("div");
  grid.className = "mob-grid";

  MOBILITY_BLOCKS.forEach((block, idx) => {
    const box = document.createElement("div");
    box.className = "mob-block";
    box.innerHTML = `<h4>${block.title}</h4>`;
    block.items.forEach((it, i2) => {
      const row = document.createElement("div");
      row.className = "mob-item";
      row.innerHTML = `
        <input type="checkbox" id="mob-${idx}-${i2}" />
        <label for="mob-${idx}-${i2}" class="small">${it}</label>
      `;
      box.appendChild(row);
    });
    grid.appendChild(box);
  });

  card.appendChild(grid);
  cont.appendChild(card);
}

// =================== GUARDAR SESIONES ===================

function saveStrength(dayKey) {
  const todayWorkout = WORKOUTS[dayKey];
  const exercisesData = [];

  todayWorkout.forEach((ex, exIndex) => {
    const sets = [];
    ex.defaultSets.forEach((set, setIndex) => {
      const wInput = document.querySelector(
        `input[data-ex="${exIndex}"][data-set="${setIndex}"][data-field="weight"]`
      );
      const rInput = document.querySelector(
        `input[data-ex="${exIndex}"][data-set="${setIndex}"][data-field="reps"]`
      );
      const rpeInput = document.querySelector(
        `input[data-ex="${exIndex}"][data-set="${setIndex}"][data-field="rpe"]`
      );
      const weightVal = wInput ? wInput.value : "";
      const repsVal = rInput ? rInput.value : "";
      const rpeVal = rpeInput ? rpeInput.value : "";

      const prevBest = getBest1RMForExercise(ex.name);
      const currentEst = estimate1RM(weightVal, repsVal);
      const isPR = currentEst && currentEst > prevBest;

      sets.push({
        label: set.label,
        weight: weightVal,
        reps: repsVal,
        rpe: rpeVal,
        targetReps: set.targetReps,
        est1RM: currentEst || null,
        isPR: !!isPR
      });
    });
    exercisesData.push({ name: ex.name, rest: ex.rest, sets });
  });

  const notes = document.getElementById("notes").value;
  const payload = {
    date: todayStr(),
    type: dayKey,
    notes,
    exercises: exercisesData
  };

  const all = getSessions();
  all.push(payload);
  saveSessions(all);
  alert("Sesión de fuerza guardada ✅");
}

function saveCardio() {
  const mod = document.getElementById("cardioMod").value;
  const dur = document.getElementById("cardioDur").value;
  const zone = document.getElementById("cardioZone").value;
  const rpe = document.getElementById("cardioRpe").value;
  const notes = document.getElementById("notes").value;

  const payload = {
    date: todayStr(),
    type: "Cardio",
    cardio: { modality: mod, duration: dur, zone, rpe },
    notes
  };
  const all = getSessions();
  all.push(payload);
  saveSessions(all);
  alert("Sesión de aeróbicos guardada ✅");
}

function saveMobility() {
  const done = [];
  MOBILITY_BLOCKS.forEach((block, idx) => {
    block.items.forEach((it, i2) => {
      const chk = document.getElementById(`mob-${idx}-${i2}`);
      if (chk && chk.checked) done.push(it);
    });
  });
  const notes = document.getElementById("notes").value;
  const payload = {
    date: todayStr(),
    type: "Movilidad",
    mobility_done: done,
    notes
  };
  const all = getSessions();
  all.push(payload);
  saveSessions(all);
  alert("Sesión de movilidad guardada ✅");
}

// =================== EXPORT / IMPORT ===================

function exportSessions() {
  const data = getSessions();
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json"
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `entrenos-${todayStr()}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function handleImportFileChange(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = e => {
    try {
      const text = e.target.result;
      const parsed = JSON.parse(text);
      let sessions = [];
      if (Array.isArray(parsed)) {
        sessions = parsed;
      } else if (parsed && Array.isArray(parsed.sessions)) {
        sessions = parsed.sessions;
      } else {
        throw new Error("Formato inválido");
      }
      saveSessions(sessions);
      alert("Historial importado ✅");
      renderHistory();
    } catch (err) {
      console.error("Error importando historial:", err);
      alert("No pude importar ese archivo. ¿Es el JSON correcto?");
    } finally {
      event.target.value = "";
    }
  };
  reader.readAsText(file);
}

// =================== HISTORIAL ===================

function attachHistoryEvents() {
  const exportBtn = document.getElementById("exportBtn");
  const importBtn = document.getElementById("importBtn");

  if (exportBtn) {
    exportBtn.onclick = exportSessions;
  }
  if (importBtn) {
    importBtn.onclick = () => {
      const input = document.getElementById("importFile");
      if (input) input.click();
    };
  }

  const deleteBtns = document.querySelectorAll("[data-delete-index]");
  deleteBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      const idxStr = btn.getAttribute("data-delete-index");
      const idx = Number(idxStr);
      if (Number.isNaN(idx)) return;
      const sessions = getSessions();
      if (idx < 0 || idx >= sessions.length) return;
      const ok = confirm("¿Borrar esta sesión del historial?");
      if (!ok) return;
      sessions.splice(idx, 1);
      saveSessions(sessions);
      renderHistory();
    });
  });
}

function renderHistory() {
  const historyDiv = document.getElementById("history");
  const dataAsc = getSessions();
  const wrapped = dataAsc.map((sess, idx) => ({ sess, idx }));
  const data = wrapped.slice().reverse();

  let html =
    "<div class='history-header'>" +
    "<h3>Historial</h3>" +
    "<div class='history-actions'>" +
    "<button class='small-btn' id='exportBtn'>Exportar</button>" +
    "<button class='small-btn secondary' id='importBtn'>Importar</button>" +
    "</div></div>";

  if (!data.length) {
    html += "<p class='small'>No hay sesiones aún.</p>";
    historyDiv.innerHTML = html;
    historyDiv.style.display = "block";
    attachHistoryEvents();
    historyDiv.scrollIntoView({ behavior: "smooth" });
    return;
  }

  data.forEach(wrapper => {
    const sess = wrapper.sess;
    const originalIndex = wrapper.idx;

    html +=
      "<div class='session-header-row'>" +
      "<h4>" +
      sess.date +
      " — " +
      sess.type +
      "</h4>" +
      "<button class='small-btn danger' data-delete-index='" +
      originalIndex +
      "'>Borrar</button>" +
      "</div><table>";

    if (sess.type === "A" || sess.type === "B") {
      (sess.exercises || []).forEach(ex => {
        html +=
          "<tr><th colspan='4' style='text-align:left;'>" +
          ex.name +
          "</th></tr>";
        (ex.sets || []).forEach(s => {
          html +=
            "<tr>" +
            "<td>" +
            (s.label || "") +
            "</td>" +
            "<td>" +
            (s.weight || "") +
            "</td>" +
            "<td>" +
            (s.reps || "") +
            " reps</td>" +
            "<td>" +
            (s.isPR
              ? "<span class='pr-badge'>🏅 PR</span>"
              : s.rpe
              ? "RPE " + s.rpe
              : "") +
            "</td>" +
            "</tr>";
        });
      });
    } else if (sess.type === "Cardio") {
      html +=
        "<tr><td>Modalidad</td><td>" +
        sess.cardio.modality +
        "</td><td>Duración</td><td>" +
        sess.cardio.duration +
        " min</td></tr>";
      html +=
        "<tr><td>Zona</td><td>" +
        sess.cardio.zone +
        "</td><td>RPE</td><td>" +
        (sess.cardio.rpe || "-") +
        "</td></tr>";
    } else if (sess.type === "Movilidad") {
      html +=
        "<tr><td colspan='4'>" +
        ((sess.mobility_done || []).join("<br>") || "") +
        "</td></tr>";
    }

    if (sess.notes) {
      html +=
        "<tr><td colspan='4'><span class='small'>Notas: " +
        sess.notes +
        "</span></td></tr>";
    }

    html += "</table><br/>";
  });

  historyDiv.innerHTML = html;
  historyDiv.style.display = "block";
  attachHistoryEvents();
  historyDiv.scrollIntoView({ behavior: "smooth" });
}

// =================== INIT UI / EVENTOS ===================

document.addEventListener("DOMContentLoaded", () => {
  let currentView = "strength-A";
  renderStrength("A");

  const loadBtn = document.getElementById("loadBtn");
  const saveBtn = document.getElementById("saveBtn");
  const viewSelect = document.getElementById("viewSelect");
  const histBtn = document.getElementById("viewHistoryBtn");
  const importInput = document.getElementById("importFile");

  if (loadBtn && viewSelect) {
    loadBtn.addEventListener("click", () => {
      currentView = viewSelect.value;
      document.getElementById("history").style.display = "none";

      if (currentView === "strength-A") renderStrength("A");
      else if (currentView === "strength-B") renderStrength("B");
      else if (currentView === "cardio") renderCardio();
      else if (currentView === "mobility") renderMobility();
    });
  }

  if (saveBtn) {
    saveBtn.addEventListener("click", () => {
      if (currentView === "strength-A") saveStrength("A");
      else if (currentView === "strength-B") saveStrength("B");
      else if (currentView === "cardio") saveCardio();
      else if (currentView === "mobility") saveMobility();
    });
  }

  if (histBtn) {
    histBtn.addEventListener("click", () => {
      renderHistory();
    });
  }

  if (importInput) {
    importInput.addEventListener("change", handleImportFileChange);
  }
});

// =================== SERVICE WORKER (PWA) ===================

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("./sw.js")
      .then(reg => {
        // fuerza comprobación de nueva versión al abrir
        if (navigator.onLine && reg.update) {
          reg.update();
        }
      })
      .catch(err => {
        console.error("Service worker registration failed:", err);
      });
  });
}
