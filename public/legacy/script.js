"use strict";

// ------------------- Data Initialization -------------------
let sessions = JSON.parse(localStorage.getItem("seshTrackerSessions")) || [];
let inventory = JSON.parse(localStorage.getItem("seshTrackerInventory")) || [];
let inventoryHistory = JSON.parse(localStorage.getItem("seshTrackerInventoryHistory")) || {};

// ------------------- Chart Variables -------------------
let usageChart, productChart, hitChart, inventoryChart, goalAdherenceChart;

// ------------------- Session Timer State -------------------
let sessionStartTime = null;
let timerIntervalId = null;

// ------------------- Live Session State -------------------
let liveSessionActive = false;
let liveSessionStartTime = null;
let liveTimerIntervalId = null;
let liveMessageTimeoutId = null;

// ------------------- Global Filter Variables & View Mode -------------------
let filterText = "";
let filterProduct = "";
let filterTag = "";
let filterStartDate = "";
let filterEndDate = "";
let viewMode = "daily"; // daily, weekly, or monthly

// ------------------- DOM Elements -------------------
const sessionCount = document.getElementById("sessionCount");
const elapsed = document.getElementById("elapsed");
const avgInterval = document.getElementById("avgInterval");
const strainInput = document.getElementById("strainInput");
const strainSelect = document.getElementById("strainSelect");
const productType = document.getElementById("productType");
const hitType = document.getElementById("hitType");
const amountSmoked = document.getElementById("amountSmoked");
const invName = document.getElementById("invName");
const invType = document.getElementById("invType");
const invQty = document.getElementById("invQty");
const inventoryList = document.getElementById("inventoryList");

const dailyView = document.getElementById("dailyView");
const weeklyView = document.getElementById("weeklyView");
const monthlyView = document.getElementById("monthlyView");

// New DOM Elements for logging features
const effectsCheckboxesContainer = document.getElementById("effectsCheckboxes");
const settingCheckboxesContainer = document.getElementById("settingCheckboxes");
const startTimerBtn = document.getElementById("startTimerBtn");
const endTimerBtn = document.getElementById("endTimerBtn");
const timerDisplay = document.getElementById("timerDisplay");
const clearLogFormBtn = document.getElementById("clearLogFormBtn");
const sessionNotesInput = document.getElementById('sessionNotes'); // Get reference

// Live Session DOM Elements
const liveSessionBox = document.getElementById("liveSessionBox");
const liveTimerDisplay = document.getElementById("liveTimerDisplay");
const liveMessageDisplay = document.getElementById("liveMessageDisplay");
const startLiveSessionBtn = document.getElementById("startLiveSessionBtn");
const endLiveSessionBtn = document.getElementById("endLiveSessionBtn");

// New Module DOM Elements
const costAnalysisOutput = document.getElementById("costAnalysisOutput");
const strainNotesOutput = document.getElementById("strainNotesOutput");
const deviceTrackingOutput = document.getElementById("deviceTrackingOutput");

// Modal DOM Elements
const loadRecentModal = document.getElementById("loadRecentModal");
const closeLoadRecentModal = document.getElementById("closeLoadRecentModal");
const loadRecentList = document.getElementById("loadRecentList");
const openLoadRecentModalBtn = document.getElementById("openLoadRecentModalBtn");

// ------------------- Fade-In Animation Helper -------------------
function applyFadeInEffect(element) {
  element.classList.add("fade-in");
  element.addEventListener("animationend", () => {
    element.classList.remove("fade-in");
  }, { once: true });
}

// ------------------- Draggable Settings Menu -------------------
let isDragging = false;
let offsetX = 0;
let offsetY = 0;
const settingsMenu = document.getElementById("settingsMenu");
const settingsHeader = document.querySelector(".settings-header");

settingsHeader.addEventListener("mousedown", (e) => {
  if (e.target.id === "closeSettings") return;
  isDragging = true;
  offsetX = e.clientX - settingsMenu.offsetLeft;
  offsetY = e.clientY - settingsMenu.offsetTop;
  settingsMenu.style.cursor = "grabbing";
});
document.addEventListener("mousemove", (e) => {
  if (!isDragging) return;
  e.preventDefault();
  settingsMenu.style.left = (e.clientX - offsetX) + "px";
  settingsMenu.style.top = (e.clientY - offsetY) + "px";
});
document.addEventListener("mouseup", () => {
  isDragging = false;
  settingsMenu.style.cursor = "default";
});

// ------------------- Utility Functions -------------------
function formatTime(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}
function getWeekNumber(d) {
  d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}

// Format duration (milliseconds) into HH:MM:SS or MM:SS
function formatDuration(ms) {
  if (!ms || ms < 0) return ''; // Return empty if no duration
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  } else {
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }
}

// ------------------- Shadow Plugin for Charts -------------------
const shadowPlugin = {
  id: 'shadowPlugin',
  beforeDraw: function(chart, args, options) {
    if (['doughnut','bar'].includes(chart.config.type)) {
      const ctx = chart.ctx;
      ctx.save();
      ctx.shadowColor = options.shadowColor || 'rgba(0,0,0,0.25)';
      ctx.shadowBlur = options.shadowBlur || 10;
      ctx.shadowOffsetX = options.shadowOffsetX || 0;
      ctx.shadowOffsetY = options.shadowOffsetY || 4;
    }
  },
  afterDraw: function(chart, args, options) {
    if (['doughnut','bar'].includes(chart.config.type)) {
      chart.ctx.restore();
    }
  }
};
Chart.register(shadowPlugin);

// ------------------- Custom Progress Bar Rendering -------------------
function renderProgress(labelText, current, goal) {
  const percentage = goal > 0 ? Math.min((current / goal) * 100, 100) : 0;
  return `<div class="progress-label">${labelText}: ${current.toFixed(2)}g of ${goal}g (${percentage.toFixed(0)}%)</div>
          <div class="progress">
            <div class="progress-bar" style="width: ${percentage}%">
              <span class="progress-text">${percentage.toFixed(0)}%</span>
            </div>
          </div>`;
}

// ------------------- Goal Progress -------------------
function updateGoalProgress() {
  const dailyGoal = parseFloat(localStorage.getItem("dailyGoal") || "5");
  const weeklyGoal = parseFloat(localStorage.getItem("weeklyGoal") || "20");
  const monthlyGoal = parseFloat(localStorage.getItem("monthlyGoal") || "80");

  const dailyGoalInput = document.getElementById("dailyGoal");
  const weeklyGoalInput = document.getElementById("weeklyGoal");
  const monthlyGoalInput = document.getElementById("monthlyGoal");
  if (dailyGoalInput) dailyGoalInput.value = dailyGoal;
  if (weeklyGoalInput) weeklyGoalInput.value = weeklyGoal;
  if (monthlyGoalInput) monthlyGoalInput.value = monthlyGoal;

  const now = new Date();
  const todayStr = now.toISOString().split("T")[0];
  let dailyTotal = sessions.filter(s => s.time.startsWith(todayStr))
                           .reduce((acc, s) => acc + (s.amount || 0), 0);

  let dayOfWeek = now.getDay();
  let startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - dayOfWeek);
  let endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  let weeklyTotal = sessions.filter(s => {
    let d = new Date(s.time);
    return d >= startOfWeek && d <= endOfWeek;
  }).reduce((acc, s) => acc + (s.amount || 0), 0);

  let monthlyTotal = sessions.filter(s => {
    let d = new Date(s.time);
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
  }).reduce((acc, s) => acc + (s.amount || 0), 0);

  document.getElementById("dailyProgress").innerHTML = renderProgress("Daily", dailyTotal, dailyGoal);
  document.getElementById("weeklyProgress").innerHTML = renderProgress("Weekly", weeklyTotal, weeklyGoal);
  document.getElementById("monthlyProgress").innerHTML = renderProgress("Monthly", monthlyTotal, monthlyGoal);
}

// Function to save goals from settings
function saveGoals() {
  const dailyGoal = parseFloat(document.getElementById("dailyGoal").value) || 5;
  const weeklyGoal = parseFloat(document.getElementById("weeklyGoal").value) || 20;
  const monthlyGoal = parseFloat(document.getElementById("monthlyGoal").value) || 80;
  localStorage.setItem("dailyGoal", dailyGoal.toString());
  localStorage.setItem("weeklyGoal", weeklyGoal.toString());
  localStorage.setItem("monthlyGoal", monthlyGoal.toString());
  updateGoalProgress(); // Re-render progress bars
  renderCharts(); // Re-render adherence chart
  alert("Goals saved!");
}

// Add listener to save goals button
document.getElementById("saveGoals")?.addEventListener("click", saveGoals);

// ------------------- Chart Rendering -------------------
const chartPalette = ["#4e79a7", "#f28e2b", "#e15759", "#76b7b2", "#59a14f"];

function renderCharts() {
  // Usage Chart (Bar)
  const ctx1 = document.getElementById("usageChart").getContext("2d");
  const buckets = Array(24).fill(0);
  sessions.forEach(s => {
    const h = new Date(s.time).getHours();
    buckets[h]++;
  });
  const hourLabels = Array.from({ length: 24 }, (_, i) => `${i}:00`);
  if (usageChart) usageChart.destroy();
  usageChart = new Chart(ctx1, {
    type: "bar",
    data: {
      labels: hourLabels,
      datasets: [{
        label: "Sessions",
        data: buckets,
        backgroundColor: chartPalette[0],
        borderColor: "#ffffff",
        borderWidth: 1,
        borderRadius: 5
      }]
    },
    options: {
      animation: { duration: 1000, easing: "easeOutQuart" },
      plugins: {
        shadowPlugin: { shadowColor: 'rgba(0,0,0,0.25)', shadowBlur: 10, shadowOffsetX: 0, shadowOffsetY: 4 },
        legend: { display: false },
        tooltip: { backgroundColor: "var(--container-color)", titleColor: "var(--text-color)", bodyColor: "var(--text-color)" }
      },
      maintainAspectRatio: false,
      responsive: true,
      scales: { y: { beginAtZero: true, grid: { color: "rgba(0,0,0,0.1)" } } }
    }
  });

  // Product Chart (Donut)
  const ctx2 = document.getElementById("productChart").getContext("2d");
  const productCounts = {};
  sessions.forEach(s => {
    if (s.product) {
      productCounts[s.product] = (productCounts[s.product] || 0) + 1;
    }
  });
  if (productChart) productChart.destroy();
  productChart = new Chart(ctx2, {
    type: "doughnut",
    data: {
      labels: Object.keys(productCounts),
      datasets: [{
        data: Object.values(productCounts),
        backgroundColor: chartPalette,
        borderColor: "#ffffff",
        borderWidth: 1
      }]
    },
    options: {
      animation: { duration: 1000, easing: "easeOutQuart" },
      plugins: {
        shadowPlugin: { shadowColor: 'rgba(0,0,0,0.25)', shadowBlur: 10, shadowOffsetX: 0, shadowOffsetY: 4 },
        legend: { labels: { boxWidth: 12, padding: 10 } },
        tooltip: { backgroundColor: "var(--container-color)", titleColor: "var(--text-color)", bodyColor: "var(--text-color)" }
      },
      maintainAspectRatio: false,
      responsive: true
    }
  });

  // Hit Chart (Donut)
  const ctx3 = document.getElementById("hitChart").getContext("2d");
  const hitCounts = {};
  sessions.forEach(s => {
    if (s.hit) {
      hitCounts[s.hit] = (hitCounts[s.hit] || 0) + 1;
    }
  });
  if (hitChart) hitChart.destroy();
  hitChart = new Chart(ctx3, {
    type: "doughnut",
    data: {
      labels: Object.keys(hitCounts),
      datasets: [{
        data: Object.values(hitCounts),
        backgroundColor: chartPalette,
        borderColor: "#ffffff",
        borderWidth: 1
      }]
    },
    options: {
      animation: { duration: 1000, easing: "easeOutQuart" },
      plugins: {
        shadowPlugin: { shadowColor: 'rgba(0,0,0,0.25)', shadowBlur: 10, shadowOffsetX: 0, shadowOffsetY: 4 },
        legend: { labels: { boxWidth: 12, padding: 10 } },
        tooltip: { backgroundColor: "var(--container-color)", titleColor: "var(--text-color)", bodyColor: "var(--text-color)" }
      },
      maintainAspectRatio: false,
      responsive: true
    }
  });

  // Inventory History Chart (Line)
  const ctx4 = document.getElementById("inventoryChart").getContext("2d");
  const invDatasets = Object.entries(inventoryHistory).map(([strain, history], i) => ({
    label: strain,
    data: history.map(h => ({ x: new Date(h.x), y: h.y })),
    borderColor: chartPalette[i % chartPalette.length],
    tension: 0.2,
    borderWidth: 2,
    pointBackgroundColor: chartPalette[i % chartPalette.length]
  }));
  if (inventoryChart) inventoryChart.destroy();
  inventoryChart = new Chart(ctx4, {
    type: "line",
    data: { datasets: invDatasets },
    options: {
      animation: { duration: 1000, easing: "easeOutQuart" },
      maintainAspectRatio: false,
      responsive: true,
      parsing: false,
      scales: {
        x: { type: "time", time: { unit: "day" }, grid: { color: "rgba(0,0,0,0.1)" } },
        y: { beginAtZero: true, grid: { color: "rgba(0,0,0,0.1)" } }
      },
      plugins: {
        tooltip: { backgroundColor: "var(--container-color)", titleColor: "var(--text-color)", bodyColor: "var(--text-color)" },
        legend: { labels: { boxWidth: 12, padding: 10 } }
      }
    }
  });

  // Render Goal Adherence Chart
  renderGoalAdherenceChart();
}

// ------------------- Daily View Rendering -------------------
function renderDailyView() {
  dailyView.innerHTML = "";
  const filtered = getFilteredSessions();
  filtered.sort((a, b) => new Date(b.startTime || b.time) - new Date(a.startTime || a.time)); // Sort newest first

  filtered.forEach((s) => {
    // Find the original index in the main sessions array for editing/deleting
    const originalIndex = sessions.findIndex(session => session.startTime === s.startTime && session.endTime === s.endTime);

    const row = document.createElement("div");
    row.className = "session-row with-details";

    // Combine old tags with new effects and settings for display
    const allTags = [
      ...(s.effects || []).map(e => ({ type: 'effect', value: e })),
      ...(s.settingTags || []).map(t => ({ type: 'setting', value: t })),
      ...(s.tags || []).map(t => ({ type: 'legacy', value: t })) // Include legacy tags if they exist
    ];
    const tagsHTML = allTags.length > 0
      ? `<div class="session-tags">${allTags.map(tag => `<span class="tag ${tag.type}-tag">${tag.value}</span>`).join('')}</div>`
      : '';

    const notesHTML = s.notes ? `<div class="session-notes hidden">${s.notes}</div>` : '';
    const durationText = formatDuration(s.duration);
    const durationHTML = durationText ? `<span class="session-duration">(${durationText})</span>` : '';
    const startTime = s.startTime || s.time; // Fallback for older sessions
    const label = `${formatTime(startTime)} ${durationHTML}${s.strain ? " • " + s.strain : ""}${s.product ? " • " + s.product : ""}${s.hit ? " • " + s.hit : ""}${s.amount ? " • " + s.amount + "g" : ""}`;

    row.innerHTML = `
      <div class="session-main-info">
        <div class="session-label">${label}</div>
        ${tagsHTML}
      </div>
      <div class="session-actions">
        ${s.notes ? '<button class="btn btn-small btn-toggle-notes">Notes</button>' : ''}
        <button class="btn btn-small" onclick="editSession(${originalIndex})">Edit</button>
        <button class="btn btn-small btn-danger" onclick="deleteSession(${originalIndex})">Delete</button>
      </div>
      ${notesHTML}
    `;

    const notesButton = row.querySelector('.btn-toggle-notes');
    if (notesButton) {
      notesButton.addEventListener('click', () => {
        const notesDiv = row.querySelector('.session-notes');
        notesDiv.classList.toggle('hidden');
        // Scroll notes into view if they become visible
        if (!notesDiv.classList.contains('hidden')) {
            notesDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      });
    }

    dailyView.appendChild(row);
    // Don't apply fade-in on every render, only initial or significant changes
    // applyFadeInEffect(row);
  });
   // Apply fade-in to the container once after rendering
   if (filtered.length > 0) {
       applyFadeInEffect(dailyView);
   }
}

// ------------------- Weekly View Rendering -------------------
function renderWeeklyView() {
  weeklyView.innerHTML = "";
  const filtered = getFilteredSessions();
  let groups = {};
  filtered.forEach(s => {
    const d = new Date(s.startTime || s.time); // Use startTime if available
    const year = d.getFullYear();
    const week = getWeekNumber(d);
    const key = `${year}-W${week}`;
    if (!groups[key]) groups[key] = [];
    groups[key].push(s);
  });
  Object.keys(groups).sort().reverse().forEach(weekKey => {
    const container = document.createElement("div");
    container.className = "week-group";
    const header = document.createElement("div");
    header.className = "week-header";
    header.textContent = `Week: ${weekKey}`;
    container.appendChild(header);

    // Sort sessions within the week
    groups[weekKey].sort((a, b) => new Date(b.startTime || b.time) - new Date(a.startTime || a.time));

    groups[weekKey].forEach(s => {
      const originalIndex = sessions.findIndex(session => session.startTime === s.startTime && session.endTime === s.endTime);
      const row = document.createElement("div");
      row.className = "session-row small with-details";

      // Combine tags for weekly view
      const allTags = [
        ...(s.effects || []).map(e => ({ type: 'effect', value: e })),
        ...(s.settingTags || []).map(t => ({ type: 'setting', value: t })),
        ...(s.tags || []).map(t => ({ type: 'legacy', value: t })) // Include legacy tags
      ];
      const tagsHTML = allTags.length > 0
        ? `<div class="session-tags">${allTags.map(tag => `<span class="tag ${tag.type}-tag">${tag.value}</span>`).join('')}</div>`
        : '';

      const notesHTML = s.notes ? `<div class="session-notes hidden">${s.notes}</div>` : '';
      const durationText = formatDuration(s.duration);
      const durationHTML = durationText ? `<span class="session-duration">(${durationText})</span>` : '';
      const startTime = s.startTime || s.time; // Fallback
      const label = `${formatTime(startTime)} ${durationHTML}${s.strain ? " • " + s.strain : ""}${s.product ? " • " + s.product : ""}${s.hit ? " • " + s.hit : ""}${s.amount ? " • " + s.amount + "g" : ""}`;

      row.innerHTML = `
        <div class="session-main-info">
          <div class="session-label">${label}</div>
           ${tagsHTML}
        </div>
        <div class="session-actions">
          ${s.notes ? '<button class="btn btn-small btn-toggle-notes">Notes</button>' : ''}
          <button class="btn btn-small" onclick="editSession(${originalIndex})">Edit</button>
          <button class="btn btn-small btn-danger" onclick="deleteSession(${originalIndex})">Delete</button>
        </div>
         ${notesHTML}
      `;

      const notesButton = row.querySelector('.btn-toggle-notes');
      if (notesButton) {
        notesButton.addEventListener('click', () => {
          const notesDiv = row.querySelector('.session-notes');
          notesDiv.classList.toggle('hidden');
          if (!notesDiv.classList.contains('hidden')) {
            notesDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          }
        });
      }

      container.appendChild(row);
      // applyFadeInEffect(row); // Avoid excessive animation
    });
    container.style.marginBottom = "1.5rem";
    weeklyView.appendChild(container);
    // applyFadeInEffect(container); // Avoid excessive animation
  });
  // Apply fade-in to the container once
  if (Object.keys(groups).length > 0) {
      applyFadeInEffect(weeklyView);
  }
}

// ------------------- Monthly View Rendering -------------------
function renderMonthlyView() {
  monthlyView.innerHTML = "";
  const filtered = getFilteredSessions();
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startDay = firstDay.getDay();
  const daysInMonth = lastDay.getDate();
  let html = `<table class="monthly-calendar">
    <thead>
      <tr>
        <th>Sun</th><th>Mon</th><th>Tue</th><th>Wed</th><th>Thu</th><th>Fri</th><th>Sat</th>
      </tr>
    </thead>
    <tbody>`;
  let day = 1;
  for (let week = 0; week < 6; week++) {
    html += `<tr>`;
    for (let d = 0; d < 7; d++) {
      if (week === 0 && d < startDay) {
        html += `<td></td>`;
      } else if (day > daysInMonth) {
        html += `<td></td>`;
      } else {
        let dateStr = new Date(year, month, day).toISOString().split("T")[0];
        let daySessions = filtered.filter(s => { // Use pre-filtered sessions
            const sessionDate = new Date(s.startTime || s.time); // Use startTime
            return sessionDate.toISOString().startsWith(dateStr);
        });
        // Sort sessions within the day cell
        daySessions.sort((a, b) => new Date(a.startTime || a.time) - new Date(b.startTime || b.time));

        let sessionsHTML = "";
        daySessions.forEach(s => {
          const durationText = formatDuration(s.duration);
          sessionsHTML += `<div class="calendar-cell-session">${formatTime(s.startTime || s.time)} - ${s.strain || "N/A"} ${durationText ? '(' + durationText + ')' : ''}</div>`;
        });
        html += `<td class="calendar-cell">
          <div class="calendar-cell-date">${day}</div>
          ${sessionsHTML}
        </td>`;
        day++;
      }
    }
    html += `</tr>`;
    if (day > daysInMonth) break;
  }
  html += `</tbody></table>`;
  monthlyView.innerHTML = html;
}

// ------------------- Render Sessions (Main) -------------------
function renderSessions() {
  dailyView.classList.add("hidden");
  weeklyView.classList.add("hidden");
  monthlyView.classList.add("hidden");

  updateStats();
  updateGoalProgress();
  renderCharts();

  // Update filter indicator status
  const filterIndicator = document.getElementById('filterIndicator');
  const filtersActive = filterText || filterProduct || filterTag || filterStartDate || filterEndDate;
  if (filterIndicator) {
    if (filtersActive) {
      filterIndicator.classList.add('active');
    } else {
      filterIndicator.classList.remove('active');
    }
  }

  if (viewMode === "daily") {
    dailyView.classList.remove("hidden");
    renderDailyView();
  } else if (viewMode === "weekly") {
    weeklyView.classList.remove("hidden");
    renderWeeklyView();
  } else if (viewMode === "monthly") {
    monthlyView.classList.remove("hidden");
    renderMonthlyView();
  }
  sessionCount.textContent = sessions.length;
}

// ------------------- Update Stats -------------------
function updateStats() {
  if (sessions.length === 0) {
    elapsed.textContent = "N/A";
    avgInterval.textContent = "0";
    document.title = "Sesh Tracker";
    return;
  }
  // Ensure sessions are sorted by startTime for accurate stats
  const sortedSessions = [...sessions].sort((a, b) => new Date(a.startTime || a.time) - new Date(b.startTime || b.time));

  const lastSession = sortedSessions[sortedSessions.length - 1];
  const last = new Date(lastSession.startTime || lastSession.time); // Use startTime if available
  const diff = Date.now() - last.getTime();
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  elapsed.textContent = `${h}h ${m}m ${s}s`;
  document.title = `Sesh Tracker - ${h}h ${m}m ${s}s`;

  let intervals = [];
  for (let i = 1; i < sortedSessions.length; i++) {
    const t1 = new Date(sortedSessions[i - 1].startTime || sortedSessions[i - 1].time);
    const t2 = new Date(sortedSessions[i].startTime || sortedSessions[i].time);
    intervals.push((t2 - t1) / 60000);
  }
  avgInterval.textContent = intervals.length
    ? (intervals.reduce((a, b) => a + b) / intervals.length).toFixed(1)
    : "0";
}

// ------------------- Inventory -------------------
function renderInventory() {
  inventoryList.innerHTML = "";
  if (inventory.length === 0) {
    strainSelect.innerHTML = `<option value="">No inventory available. Please add one.</option>`;
  } else {
    strainSelect.innerHTML = `<option value="">Select strain from inventory (optional)</option>`;
  }
  inventory.forEach((item, index) => {
    const row = document.createElement("div");
    row.className = "inventory-row";
    let details = `${item.name} • ${item.type} • ${item.qty.toFixed(2)}g`;
    if (item.cost && item.qty > 0) {
      const costPerGram = (item.cost / item.qty).toFixed(2);
      details += ` • ($${costPerGram}/g)`;
    }
    if (item.potency) {
      details += ` • ${item.potency}% THC`;
    }
    if (item.purchaseDate) {
      details += ` • Purchased: ${item.purchaseDate}`;
    }

    // Low stock check
    const lowStockThreshold = 1.0;
    if (item.qty < lowStockThreshold && item.qty > 0) { // Check if low but not empty
      row.classList.add('low-stock');
    }

    row.innerHTML = `
      <div class="inventory-label">${details}</div>
      <button class="btn btn-small btn-danger" onclick="deleteInventoryItem(${index})">Delete</button>
    `;
    inventoryList.appendChild(row);

    const opt = document.createElement("option");
    opt.value = item.name;
    opt.textContent = `${item.name} (${item.qty.toFixed(2)}g)`;
    if (item.qty < lowStockThreshold && item.qty > 0) {
        opt.classList.add('low-stock'); // Add class to option too
        opt.textContent += ' - Low Stock!';
    }
    strainSelect.appendChild(opt);

    if (!inventoryHistory[item.name]) {
      inventoryHistory[item.name] = [{ x: item.purchaseDate || new Date().toString(), y: item.qty }];
    } else {
      inventoryHistory[item.name].push({ x: item.purchaseDate || new Date().toString(), y: item.qty });
      inventoryHistory[item.name].sort((a, b) => new Date(a.x) - new Date(b.x));
    }
    localStorage.setItem("seshTrackerInventoryHistory", JSON.stringify(inventoryHistory));
  });
  renderCharts();
}
window.deleteInventoryItem = (index) => {
  inventory.splice(index, 1);
  localStorage.setItem("seshTrackerInventory", JSON.stringify(inventory));
  renderInventory();
};

// ------------------- Filters -------------------
function getFilteredSessions() {
  return sessions.filter(s => {
    let include = true;
    if (filterText) {
      const searchStr = `${s.strain || ""} ${s.product || ""} ${s.hit || ""} ${s.notes || ""}`.toLowerCase();
      if (!searchStr.includes(filterText.toLowerCase())) include = false;
    }
    if (filterProduct && s.product !== filterProduct) include = false;
    if (filterTag && (!s.tags || !s.tags.some(tag => tag.toLowerCase().includes(filterTag.toLowerCase())))) {
      include = false;
    }
    const sessionDate = new Date(s.time);
    if (filterStartDate) {
      const start = new Date(filterStartDate);
      if (sessionDate < start) include = false;
    }
    if (filterEndDate) {
      const end = new Date(filterEndDate);
      end.setHours(23,59,59,999);
      if (sessionDate > end) include = false;
    }
    return include;
  });
}

// ------------------- Session Event Functions -------------------

// Get selected checkbox values
function getSelectedCheckboxes(container) {
  if (!container) return []; // Safety check
  return Array.from(container.querySelectorAll('input[type="checkbox"]:checked')).map(cb => cb.value);
}

// Start Timer Function
function startTimer() {
  sessionStartTime = new Date();
  startTimerBtn.disabled = true;
  endTimerBtn.disabled = false;
  timerDisplay.textContent = "Session Running: 0:00";
  timerIntervalId = setInterval(() => {
    const elapsedMs = Date.now() - sessionStartTime.getTime();
    timerDisplay.textContent = `Session Running: ${formatDuration(elapsedMs)}`;
  }, 1000);
}

// End Timer and Log Session Function (Replaces old logSession)
function endTimerAndLog() {
  if (!sessionStartTime) {
    // Maybe log instantly if timer wasn't started? Or show alert.
    // For now, let's assume instant log if timer wasn't running.
    sessionStartTime = new Date(); // Log with current time as start
    // alert("Timer wasn't started. Logging with current time.");
    // return;
  }

  if (timerIntervalId) {
      clearInterval(timerIntervalId);
      timerIntervalId = null;
  }
  const endTime = new Date();
  const duration = endTime.getTime() - sessionStartTime.getTime();

  const strain = strainSelect.value || strainInput.value.trim();
  const product = productType.value;
  const hit = hitType.value;
  const amount = parseFloat(amountSmoked.value) || 0;
  const notes = sessionNotesInput.value.trim();
  const effects = getSelectedCheckboxes(effectsCheckboxesContainer);
  const settingTags = getSelectedCheckboxes(settingCheckboxesContainer);

  const session = {
    startTime: sessionStartTime.toString(), // Store as string
    endTime: endTime.toString(),       // Store as string
    duration: duration,                // Store duration in ms
    strain: strain,
    product: product,
    hit: hit,
    amount: amount,
    notes: notes,
    effects: effects,                  // Array of strings
    settingTags: settingTags           // Array of strings
    // 'time' field is deprecated but kept for potential backward compatibility checks
  };

  sessions.push(session);
  localStorage.setItem("seshTrackerSessions", JSON.stringify(sessions));

  // Update inventory
  const match = inventory.find(i => i.name === strain);
  if (match && amount > 0) {
    match.qty = Math.max(match.qty - amount, 0);
    localStorage.setItem("seshTrackerInventory", JSON.stringify(inventory));
    if (!inventoryHistory[strain]) {
      inventoryHistory[strain] = [];
    }
    // Record inventory change at the *end* time of the session
    inventoryHistory[strain].push({ x: endTime.toString(), y: match.qty });
    inventoryHistory[strain].sort((a, b) => new Date(a.x) - new Date(b.x)); // Ensure history is sorted
    localStorage.setItem("seshTrackerInventoryHistory", JSON.stringify(inventoryHistory));
  }

  clearLogForm(); // Clear the form and reset timer state
  renderSessions();
  renderInventory();
  stopFlashingTab(); // From notification system
}

// Clear Log Form Function
function clearLogForm() {
  // Clear inputs
  strainSelect.value = "";
  strainInput.value = "";
  productType.value = "";
  hitType.value = "";
  amountSmoked.value = "";
  sessionNotesInput.value = "";

  // Clear checkboxes
  if (effectsCheckboxesContainer) {
    effectsCheckboxesContainer.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = false);
  }
  if (settingCheckboxesContainer) {
    settingCheckboxesContainer.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = false);
  }

  // Reset timer state
  if (timerIntervalId) {
    clearInterval(timerIntervalId);
    timerIntervalId = null;
  }
  sessionStartTime = null;
  if (timerDisplay) timerDisplay.textContent = "Session Not Started";
  if (startTimerBtn) startTimerBtn.disabled = false;
  if (endTimerBtn) endTimerBtn.disabled = true;
}

window.deleteSession = (index) => {
  // Ensure index is valid
  if (index < 0 || index >= sessions.length) {
      console.error("Invalid index for deleteSession:", index);
      return;
  }
  if (confirm("Are you sure you want to delete this session?")) {
    sessions.splice(index, 1);
    localStorage.setItem("seshTrackerSessions", JSON.stringify(sessions));
    renderSessions();
  }
};

// ------------------- Editing Sessions with Modal -------------------
let currentEditingIndex = null;
const editModal = document.getElementById("editModal");
const closeEditModal = document.getElementById("closeEditModal");
const editSessionForm = document.getElementById("editSessionForm");
// Add references for modal checkboxes
const editEffectsCheckboxesContainer = document.getElementById("editEffectsCheckboxes");
const editSettingCheckboxesContainer = document.getElementById("editSettingCheckboxes");

window.editSession = (index) => {
  currentEditingIndex = index;
  const session = sessions[index];
  const date = new Date(session.startTime || session.time); // Use startTime preferably
  document.getElementById("editTime").value = date.toISOString().slice(0,16);
  document.getElementById("editStrain").value = session.strain || "";
  document.getElementById("editProduct").value = session.product || "";
  document.getElementById("editHit").value = session.hit || "";
  document.getElementById("editAmount").value = session.amount || 0;
  document.getElementById("editNotes").value = session.notes || "";
  // Clear and populate effect checkboxes
  if (editEffectsCheckboxesContainer) {
      editEffectsCheckboxesContainer.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = false);
      (session.effects || []).forEach(effect => {
          const cb = editEffectsCheckboxesContainer.querySelector(`input[value="${effect}"]`);
          if (cb) cb.checked = true;
      });
  }

  // Clear and populate setting checkboxes
  if (editSettingCheckboxesContainer) {
      editSettingCheckboxesContainer.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = false);
      (session.settingTags || []).forEach(tag => {
          const cb = editSettingCheckboxesContainer.querySelector(`input[value="${tag}"]`);
          if (cb) cb.checked = true;
      });
  }

  editModal.style.display = "block";
  const modalContent = editModal.querySelector(".modal-content");
  applyFadeInEffect(modalContent);
};

closeEditModal.addEventListener("click", () => {
  editModal.style.display = "none";
});

editSessionForm.addEventListener("submit", (e) => {
  e.preventDefault();
  if (currentEditingIndex === null || currentEditingIndex >= sessions.length) return; // Add bounds check

  // Get existing session data
  const originalSession = sessions[currentEditingIndex];

  const updatedStartTimeValue = document.getElementById("editTime").value;
  const updatedStartTime = new Date(updatedStartTimeValue).toString();
  const updatedStrain = document.getElementById("editStrain").value;
  const updatedProduct = document.getElementById("editProduct").value;
  const updatedHit = document.getElementById("editHit").value;
  const updatedAmount = parseFloat(document.getElementById("editAmount").value) || 0;
  const updatedNotes = document.getElementById("editNotes").value.trim();
  const updatedTagsRaw = document.getElementById("editTags").value.trim(); // Still using old tags input
  const updatedTags = updatedTagsRaw ? updatedTagsRaw.split(',').map(tag => tag.trim()).filter(tag => tag !== '') : [];

  // Preserve original endTime and duration if only startTime is edited
  let updatedEndTime = originalSession.endTime;
  let updatedDuration = originalSession.duration;
  if (originalSession.startTime !== updatedStartTime && updatedEndTime) {
      // Recalculate duration if start time changed and end time exists
      updatedDuration = new Date(updatedEndTime).getTime() - new Date(updatedStartTime).getTime();
  } else if (!updatedEndTime) {
      // If there was no end time (e.g., old data), keep duration null
      updatedDuration = null;
  }

  // Get updated effects and settings from modal checkboxes
  const updatedEffects = getSelectedCheckboxes(editEffectsCheckboxesContainer);
  const updatedSettingTags = getSelectedCheckboxes(editSettingCheckboxesContainer);

  sessions[currentEditingIndex] = {
    // time: updatedStartTime, // Keep original time field maybe? Or remove?
    startTime: updatedStartTime,
    endTime: updatedEndTime, // Keep original end time
    duration: updatedDuration, // Recalculate or keep original duration
    strain: updatedStrain,
    product: updatedProduct,
    hit: updatedHit,
    amount: updatedAmount,
    notes: updatedNotes,
    tags: updatedTags, // Keep old tags for now
    effects: updatedEffects, // Use preserved or newly edited effects
    settingTags: updatedSettingTags // Use preserved or newly edited settings
  };
  localStorage.setItem("seshTrackerSessions", JSON.stringify(sessions));
  renderSessions();
  editModal.style.display = "none";
});

function logSession() {
  const time = new Date().toString();
  const strain = strainSelect.value || strainInput.value.trim();
  const product = productType.value;
  const hit = hitType.value;
  const amount = parseFloat(amountSmoked.value) || 0;
  const notes = document.getElementById('sessionNotes').value.trim();
  const tagsRaw = document.getElementById('sessionTags').value.trim();
  const tags = tagsRaw ? tagsRaw.split(',').map(tag => tag.trim()).filter(tag => tag !== '') : [];

  const session = { time, strain, product, hit, amount, notes, tags };
  sessions.push(session);
  localStorage.setItem("seshTrackerSessions", JSON.stringify(sessions));
  const match = inventory.find(i => i.name === strain);
  if (match) {
    match.qty = Math.max(match.qty - amount, 0);
    localStorage.setItem("seshTrackerInventory", JSON.stringify(inventory));
    if (!inventoryHistory[strain]) {
      inventoryHistory[strain] = [];
    }
    inventoryHistory[strain].push({ x: new Date().toString(), y: match.qty });
    localStorage.setItem("seshTrackerInventoryHistory", JSON.stringify(inventoryHistory));
  }
  renderSessions();
  renderInventory();
  stopFlashingTab();
  strainInput.value = "";
  productType.value = "";
  hitType.value = "";
  amountSmoked.value = "";
  document.getElementById('sessionNotes').value = '';
  document.getElementById('sessionTags').value = '';
}

function clearSessions() {
  if (confirm("Are you sure you want to delete ALL sessions? This cannot be undone.")) {
    sessions = [];
    localStorage.removeItem("seshTrackerSessions");
    renderSessions();
    updateGoalProgress();
  }
}

// ------------------- Notification System -------------------

// Save the time the page loaded (used if no sessions exist)
let pageLoadTime = new Date();
// Cooldown period (in ms) to avoid spamming notifications (5 minutes)
let lastNotificationTime = 0;
// Interval ID for flashing tab notifications
let flashIntervalId = null;

function getNotificationSettings() {
  return {
    notifyPopup: localStorage.getItem("notifyPopup") === "true",
    notifySound: localStorage.getItem("notifySound") === "true",
    notifyFlash: localStorage.getItem("notifyFlash") === "true",
    notifySystem: localStorage.getItem("notifySystem") === "true",
    notifyInterval: localStorage.getItem("notifyInterval") || "60"
  };
}

function updateNotificationSettings() {
  const notifyPopup = document.getElementById("notifyPopup").checked;
  const notifySound = document.getElementById("notifySound").checked;
  const notifyFlash = document.getElementById("notifyFlash").checked;
  const notifySystem = document.getElementById("notifySystem").checked;
  const notifyInterval = document.getElementById("notifyInterval").value;
  localStorage.setItem("notifyPopup", notifyPopup);
  localStorage.setItem("notifySound", notifySound);
  localStorage.setItem("notifyFlash", notifyFlash);
  localStorage.setItem("notifySystem", notifySystem);
  localStorage.setItem("notifyInterval", notifyInterval);
  // Request system notification permission only once when enabled
  if (notifySystem && Notification.permission === "default") {
    Notification.requestPermission().then(permission => {
      console.log("System notification permission:", permission);
    });
  }
}

function showPopupNotification(message) {
  const container = document.getElementById("notificationContainer");
  container.textContent = message;
  container.classList.remove("hidden");
  container.classList.add("show");
  setTimeout(() => {
    container.classList.remove("show");
    container.classList.add("hidden");
  }, 10000);
}

function playNotificationSound() {
  const audio = document.getElementById("notificationSound");
  if (audio) {
    audio.play();
  }
}

function startFlashingTab(message) {
  if (flashIntervalId) return;
  const originalTitle = document.title;
  flashIntervalId = setInterval(() => {
    document.title = document.title === message ? originalTitle : message;
  }, 1000);
}

function stopFlashingTab() {
  if (flashIntervalId) {
    clearInterval(flashIntervalId);
    flashIntervalId = null;
    document.title = "Sesh Tracker";
  }
}

function sendSystemNotification(message) {
  if (!("Notification" in window)) {
    console.log("This browser does not support system notifications.");
    return;
  }
  if (Notification.permission === "granted") {
    new Notification("Sesh Tracker Reminder", {
      body: message,
      icon: "favicon.png"
    });
  }
}

function checkNotifications() {
  const settings = getNotificationSettings();
  const intervalMinutes = parseInt(settings.notifyInterval) || 60;
  const now = new Date();
  let referenceTime = sessions.length > 0 ? new Date(sessions[sessions.length - 1].time) : pageLoadTime;
  if ((now - referenceTime) >= (intervalMinutes * 60000) && (now - lastNotificationTime) >= (5 * 60000)) {
    lastNotificationTime = now;
    if (settings.notifyPopup) {
      showPopupNotification("Don't forget to log your session!");
    }
    if (settings.notifySound) {
      playNotificationSound();
    }
    if (settings.notifyFlash) {
      startFlashingTab("Reminder: Log your session!");
    }
    if (settings.notifySystem) {
      sendSystemNotification("Don't forget to log your session!");
    }
  }
}

setInterval(checkNotifications, 60000);

document.getElementById("notifyPopup").addEventListener("change", updateNotificationSettings);
document.getElementById("notifySound").addEventListener("change", updateNotificationSettings);
document.getElementById("notifyFlash").addEventListener("change", updateNotificationSettings);
document.getElementById("notifySystem").addEventListener("change", updateNotificationSettings);
document.getElementById("notifyInterval").addEventListener("change", updateNotificationSettings);

// ------------------- Enhanced Export/Import -------------------
function exportData() {
  // Ensure goals are read from input fields before exporting
  const dailyGoalVal = document.getElementById("dailyGoal").value;
  const weeklyGoalVal = document.getElementById("weeklyGoal").value;
  const monthlyGoalVal = document.getElementById("monthlyGoal").value;

  const state = {
    sessions: sessions,
    inventory: inventory,
    inventoryHistory: inventoryHistory,
    theme: localStorage.getItem("themeColor") || "material-dark",
    dailyGoal: dailyGoalVal,
    weeklyGoal: weeklyGoalVal,
    monthlyGoal: monthlyGoalVal,
    viewMode: viewMode,
    notificationSettings: getNotificationSettings()
  };
  // Add compatibility check - ensure new fields exist before stringifying
  state.sessions = state.sessions.map(s => ({
      startTime: s.startTime || s.time, // Use time as fallback for old sessions
      endTime: s.endTime || null,
      duration: s.duration || null,
      strain: s.strain || '',
      product: s.product || '',
      hit: s.hit || '',
      amount: s.amount || 0,
      notes: s.notes || '',
      effects: s.effects || [],
      settingTags: s.settingTags || [],
      tags: s.tags || [] // Also include legacy tags if they exist
      // time: s.time // Optionally keep original time for debugging?
  }));

  const jsonData = JSON.stringify(state, null, 2);
  const blob = new Blob([jsonData], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "sesh-tracker-state.json";
  a.click();
}

const importFileInput = document.getElementById("importFile");
importFileInput.addEventListener("change", function(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const data = JSON.parse(e.target.result);
      if (data.sessions && data.inventory && data.inventoryHistory && data.theme !== undefined) {
        sessions = data.sessions;
        inventory = data.inventory;
        inventoryHistory = data.inventoryHistory;
        localStorage.setItem("seshTrackerSessions", JSON.stringify(sessions));
        localStorage.setItem("seshTrackerInventory", JSON.stringify(inventory));
        localStorage.setItem("seshTrackerInventoryHistory", JSON.stringify(inventoryHistory));
        localStorage.setItem("themeColor", data.theme);
        document.getElementById("dailyGoal").value = data.dailyGoal;
        document.getElementById("weeklyGoal").value = data.weeklyGoal;
        document.getElementById("monthlyGoal").value = data.monthlyGoal;
        viewMode = data.viewMode;
        applyTheme(data.theme);
        themeSelector.value = data.theme;
        renderSessions();
        renderInventory();
        updateGoalProgress();
        // Apply imported notification settings
        if (data.notificationSettings) {
            localStorage.setItem("notifyPopup", data.notificationSettings.notifyPopup);
            localStorage.setItem("notifySound", data.notificationSettings.notifySound);
            localStorage.setItem("notifyFlash", data.notificationSettings.notifyFlash);
            localStorage.setItem("notifySystem", data.notificationSettings.notifySystem);
            localStorage.setItem("notifyInterval", data.notificationSettings.notifyInterval);
            // Update UI checkboxes/inputs
            document.getElementById("notifyPopup").checked = data.notificationSettings.notifyPopup;
            document.getElementById("notifySound").checked = data.notificationSettings.notifySound;
            document.getElementById("notifyFlash").checked = data.notificationSettings.notifyFlash;
            document.getElementById("notifySystem").checked = data.notificationSettings.notifySystem;
            document.getElementById("notifyInterval").value = data.notificationSettings.notifyInterval;
        }
        alert("Data imported successfully!");
      } else {
        alert("Invalid data format.");
      }
    } catch (error) {
      alert("Error reading file: " + error);
    }
  };
  reader.readAsText(file);
});

// ------------------- Button Event Listeners -------------------
const addInvBtn = document.getElementById("addInvBtn");
const clearInvBtn = document.getElementById("clearInvBtn");
const exportDataBtn = document.getElementById("exportData");
const importDataBtn = document.getElementById("importData");

if (addInvBtn) {
  addInvBtn.addEventListener("click", () => {
    const name = invName.value.trim();
    const type = invType.value;
    const qty = parseFloat(invQty.value) || 0;
    const purchaseDate = document.getElementById('invPurchaseDate').value;
    const cost = parseFloat(document.getElementById('invCost').value) || null;
    const potency = parseFloat(document.getElementById('invPotency').value) || null;

    if (name && type && qty > 0) {
      const newItem = { name, type, qty, purchaseDate, cost, potency };
      inventory.push(newItem);
      localStorage.setItem("seshTrackerInventory", JSON.stringify(inventory));
      if (!inventoryHistory[name]) {
        inventoryHistory[name] = [{ x: purchaseDate || new Date().toString(), y: qty }];
      } else {
        inventoryHistory[name].push({ x: purchaseDate || new Date().toString(), y: qty });
        inventoryHistory[name].sort((a, b) => new Date(a.x) - new Date(b.x));
      }
      localStorage.setItem("seshTrackerInventoryHistory", JSON.stringify(inventoryHistory));
      renderInventory();
      invName.value = "";
      invType.value = "";
      invQty.value = "";
      document.getElementById('invPurchaseDate').value = '';
      document.getElementById('invCost').value = '';
      document.getElementById('invPotency').value = '';
    } else {
      alert('Please enter at least Strain Name, Product Type, and Quantity.');
    }
  });
}
if (clearInvBtn) {
  clearInvBtn.addEventListener("click", () => {
    if (confirm("Are you sure you want to clear ALL inventory items? This cannot be undone.")) {
      inventory = [];
      inventoryHistory = {};
      localStorage.removeItem("seshTrackerInventory");
      localStorage.removeItem("seshTrackerInventoryHistory");
      renderInventory();
    }
  });
}
if (exportDataBtn) exportDataBtn.addEventListener("click", exportData);
if (importDataBtn) importDataBtn.addEventListener("click", () => { importFileInput.click(); });
strainSelect.addEventListener("change", () => {
  const selected = strainSelect.value;
  const found = inventory.find(i => i.name === selected);
  if (found && found.type) { // Add null check for found and type property
    productType.value = found.type;
  } else if (selected === "") { // Optionally clear if default is selected
    productType.value = "";
  }
});

// ------------------- Filter Event Listeners -------------------
const filterTextInput = document.getElementById("filterText");
const filterProductSelect = document.getElementById("filterProduct");
const filterTagInput = document.getElementById("filterTag");
const filterStartDateInput = document.getElementById("filterStartDate");
const filterEndDateInput = document.getElementById("filterEndDate");
const resetFiltersBtn = document.getElementById("resetFilters");

filterTextInput.addEventListener("input", () => {
  filterText = filterTextInput.value;
  renderSessions();
});
filterProductSelect.addEventListener("change", () => {
  filterProduct = filterProductSelect.value;
  renderSessions();
});
filterTagInput.addEventListener("input", () => {
  filterTag = filterTagInput.value;
  renderSessions();
});
filterStartDateInput.addEventListener("change", () => {
  filterStartDate = filterStartDateInput.value;
  renderSessions();
});
filterEndDateInput.addEventListener("change", () => {
  filterEndDate = filterEndDateInput.value;
  renderSessions();
});
resetFiltersBtn.addEventListener("click", () => {
  filterText = "";
  filterProduct = "";
  filterTag = "";
  filterStartDate = "";
  filterEndDate = "";
  filterTextInput.value = "";
  filterProductSelect.value = "";
  filterTagInput.value = "";
  filterStartDateInput.value = "";
  filterEndDateInput.value = "";
  renderSessions();
});

// ------------------- View Mode Toggle -------------------
const calendarDailyBtn = document.getElementById("calendarDaily");
const calendarWeeklyBtn = document.getElementById("calendarWeekly");
const calendarMonthlyBtn = document.getElementById("calendarMonthly");

if (calendarDailyBtn) {
  calendarDailyBtn.addEventListener("click", () => {
    viewMode = "daily";
    renderSessions();
  });
}
if (calendarWeeklyBtn) {
  calendarWeeklyBtn.addEventListener("click", () => {
    viewMode = "weekly";
    renderSessions();
  });
}
if (calendarMonthlyBtn) {
  calendarMonthlyBtn.addEventListener("click", () => {
    viewMode = "monthly";
    renderSessions();
  });
}

// ------------------- Settings Menu Toggle -------------------
document.getElementById("openSettings").addEventListener("click", () => {
  settingsMenu.classList.remove("hidden");
  setTimeout(() => {
    settingsMenu.classList.add("active");
  }, 10);
  document.getElementById("openSettings").classList.add("hidden");
});
document.getElementById("closeSettings").addEventListener("click", () => {
  settingsMenu.classList.remove("active");
  setTimeout(() => {
    settingsMenu.classList.add("hidden");
  }, 300);
  document.getElementById("openSettings").classList.remove("hidden");
});

// ------------------- Tab Switching for Settings Menu -------------------
document.querySelectorAll('.tab-button').forEach(button => {
  button.addEventListener('click', () => {
    document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
    button.classList.add('active');
    document.querySelectorAll('.tab-content').forEach(content => content.classList.add('hidden'));
    const tab = button.getAttribute('data-tab');
    document.getElementById('tab-' + tab).classList.remove('hidden');
  });
});

// ------------------- Theme Application -------------------
function applyTheme(theme) {
  document.body.classList.remove(
    "neutral-light", "neutral-dark",
    "material-light", "material-dark",
    "ocean-light", "ocean-dark",
    "sage-light", "sage-dark",
    "amber-light", "amber-dark",
    "tiedye"
  );
  document.body.classList.add(theme);
  localStorage.setItem("themeColor", theme);
}
const themeSelector = document.getElementById("themeSelector");
const savedTheme = localStorage.getItem("themeColor") || "material-dark";
applyTheme(savedTheme);
themeSelector.value = savedTheme;
themeSelector.addEventListener("change", (e) => { applyTheme(e.target.value); });

// ------------------- Collapsibles & Initialization -------------------
function initCollapsibles() {
  document.querySelectorAll(".module .module-header").forEach(header => {
    header.addEventListener("click", () => {
      const module = header.parentElement;
      module.classList.toggle("collapsed");
      const toggleBtn = header.querySelector(".toggle-button");
      if (toggleBtn) {
        toggleBtn.textContent = module.classList.contains("collapsed") ? "+" : "−";
      }
    });
  });
}

function renderGoalAdherenceChart() {
  const ctx = document.getElementById('goalAdherenceChart')?.getContext('2d');
  if (!ctx) return;

  const dailyGoal = parseFloat(localStorage.getItem("dailyGoal") || "5");
  const labels = [];
  const data = [];
  const backgroundColors = [];
  const today = new Date();

  const dailyTotals = {};
  sessions.forEach(s => {
      const dateStr = s.time.split('T')[0]; // Use YYYY-MM-DD
      dailyTotals[dateStr] = (dailyTotals[dateStr] || 0) + (s.amount || 0);
  });

  for (let i = 29; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    const dayOfMonth = date.getDate();
    labels.push(dayOfMonth.toString()); // Show day of month

    const total = dailyTotals[dateStr] || 0;
    data.push(total);

    // Color based on goal achievement
    if (total === 0) {
        backgroundColors.push('rgba(150, 150, 150, 0.5)'); // Grey for no data
    } else if (total <= dailyGoal) {
        backgroundColors.push('rgba(75, 192, 192, 0.6)'); // Greenish for met/under
    } else {
        backgroundColors.push('rgba(255, 99, 132, 0.6)'); // Reddish for over
    }
  }

  if (goalAdherenceChart) goalAdherenceChart.destroy();

  goalAdherenceChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: 'Daily Consumption (g)',
        data: data,
        backgroundColor: backgroundColors,
        borderColor: backgroundColors.map(color => color.replace('0.6', '1')), // Slightly darker border
        borderWidth: 1,
        borderRadius: 3
      }]
    },
    options: {
      maintainAspectRatio: false,
      responsive: true,
      scales: {
        y: {
          beginAtZero: true,
          title: {
              display: true,
              text: 'Grams'
          }
        },
        x: {
          title: {
              display: true,
              text: 'Day of Month (Last 30 Days)'
          }
        }
      },
      plugins: {
        legend: { display: false }, // Hide legend as colors show status
        tooltip: {
          callbacks: {
            label: function(context) {
              let label = context.dataset.label || '';
              if (label) {
                label += ': ';
              }
              if (context.parsed.y !== null) {
                label += context.parsed.y.toFixed(2) + 'g';
                if (context.parsed.y > dailyGoal) {
                  label += ` (Over Goal: ${dailyGoal}g)`;
                }
              }
              return label;
            }
          }
        }
      }
    }
  });
}

// Initial setup call needs to include reading goals
document.addEventListener('DOMContentLoaded', () => {
    // Set initial state for live session box
    const liveBox = document.getElementById('liveSessionBox');
    if (liveBox) {
        liveBox.classList.add('live-inactive');
    }

    loadNotificationSettings(); // Load notification settings on startup
    migrateOldData(); // Attempt to migrate old data format if necessary
    updateGoalProgress(); // Load and apply goals on startup
    renderInventory();
    renderSessions(); // This calls renderCharts internally
    initCollapsibles();
    setInterval(updateStats, 30000);
});

// Helper function to migrate old data (if necessary)
function migrateOldData() {
    let needsSave = false;
    sessions = sessions.map(s => {
        // If session only has 'time' and not 'startTime', migrate it
        if (s.time && !s.startTime) {
            needsSave = true;
            return {
                ...s, // Keep existing fields
                startTime: s.time, // Copy 'time' to 'startTime'
                endTime: null,     // No end time for old logs
                duration: null,    // No duration for old logs
                effects: s.tags || [], // Use old 'tags' as 'effects' maybe? Or keep separate? Let's keep separate for now.
                settingTags: []
            };
        }
        // Ensure effects and settingTags arrays exist
        if (!s.effects) {
            s.effects = [];
            needsSave = true;
        }
        if (!s.settingTags) {
            s.settingTags = [];
            needsSave = true;
        }
        return s;
    });

    if (needsSave) {
        console.log("Migrating old session data format...");
        localStorage.setItem("seshTrackerSessions", JSON.stringify(sessions));
    }
}

// Helper function to load notification settings into UI on start
function loadNotificationSettings() {
    document.getElementById("notifyPopup").checked = localStorage.getItem("notifyPopup") === "true";
    document.getElementById("notifySound").checked = localStorage.getItem("notifySound") === "true";
    document.getElementById("notifyFlash").checked = localStorage.getItem("notifyFlash") === "true";
    document.getElementById("notifySystem").checked = localStorage.getItem("notifySystem") === "true";
    document.getElementById("notifyInterval").value = localStorage.getItem("notifyInterval") || "60";
}

// ------------------- Logo Scroll Animation -------------------
document.addEventListener('scroll', () => {
  const logoContainer = document.querySelector('.logo-container');
  const logo = document.querySelector('.app-logo');
  if (!logoContainer || !logo) return;
  const rect = logoContainer.getBoundingClientRect();
  
  if (rect.bottom < 0) {
    logo.classList.add('scrolled');
  } else {
    logo.classList.remove('scrolled');
  }
});

// ------------------- Data Summary Feature -------------------
function generateSummary() {
    const startDateInput = document.getElementById('summaryStartDate');
    const endDateInput = document.getElementById('summaryEndDate');
    const outputDiv = document.getElementById('summaryOutput');

    const startDateStr = startDateInput.value;
    const endDateStr = endDateInput.value;

    if (!startDateStr || !endDateStr) {
        outputDiv.innerHTML = '<p style="color: red;">Please select both a start and end date.</p>';
        return;
    }

    const start = new Date(startDateStr);
    const end = new Date(endDateStr);
    end.setHours(23, 59, 59, 999); // Include the entire end day

    if (start > end) {
         outputDiv.innerHTML = '<p style="color: red;">Start date cannot be after end date.</p>';
        return;
    }

    const relevantSessions = sessions.filter(s => {
        const sessionDate = new Date(s.time);
        return sessionDate >= start && sessionDate <= end;
    });

    if (relevantSessions.length === 0) {
        outputDiv.innerHTML = '<p>No sessions found in the selected date range.</p>';
        return;
    }

    let totalSessions = relevantSessions.length;
    let totalAmount = relevantSessions.reduce((acc, s) => acc + (s.amount || 0), 0);
    let avgAmountPerSession = totalSessions > 0 ? (totalAmount / totalSessions) : 0;

    // Calculate days in range for daily average
    const timeDiff = end.getTime() - start.getTime();
    const daysInRange = Math.max(1, Math.ceil(timeDiff / (1000 * 3600 * 24))); // At least 1 day
    let avgAmountPerDay = totalAmount / daysInRange;

    const productCounts = {};
    const strainCounts = {};
    const hitCounts = {};
    relevantSessions.forEach(s => {
        if (s.product) productCounts[s.product] = (productCounts[s.product] || 0) + 1;
        if (s.strain) strainCounts[s.strain] = (strainCounts[s.strain] || 0) + 1;
        if (s.hit) hitCounts[s.hit] = (hitCounts[s.hit] || 0) + 1;
    });

    // Function to get top N items from counts object
    const getTopItems = (counts, n = 3) => {
        return Object.entries(counts)
            .sort(([, a], [, b]) => b - a)
            .slice(0, n)
            .map(([name, count]) => `${name} (${count}x)`)
            .join(', ') || 'N/A';
    };

    let summaryHTML = `
        <h3>Summary for ${startDateStr} to ${endDateStr} (${daysInRange} days)</h3>
        <ul>
            <li><strong>Total Sessions:</strong> ${totalSessions}</li>
            <li><strong>Total Amount Consumed:</strong> ${totalAmount.toFixed(2)}g</li>
            <li><strong>Average Amount per Session:</strong> ${avgAmountPerSession.toFixed(2)}g</li>
            <li><strong>Average Amount per Day:</strong> ${avgAmountPerDay.toFixed(2)}g</li>
            <li><strong>Top Products:</strong> ${getTopItems(productCounts)}</li>
            <li><strong>Top Strains:</strong> ${getTopItems(strainCounts)}</li>
            <li><strong>Top Hit Types:</strong> ${getTopItems(hitCounts)}</li>
        </ul>
    `;

    outputDiv.innerHTML = summaryHTML;
}

document.getElementById('generateSummaryBtn')?.addEventListener('click', generateSummary);

// ------------------- Live Session Logic -------------------

const liveMessages = [
    "Enjoying the moment?",
    "Stay hydrated!",
    "How's the vibe?",
    "Relax and unwind...",
    "Peak incoming?",
    "Music check!",
    "Snack alert?",
    "Deep breaths...",
    "Creative thoughts flowing?",
    "Just chillin'...",
    "Time flies when you're having fun!",
    "Embrace the green."
];

function getRandomMessage() {
    return liveMessages[Math.floor(Math.random() * liveMessages.length)];
}

function showLiveMessage() {
    if (!liveSessionActive || !liveMessageDisplay) return;

    const message = getRandomMessage();
    liveMessageDisplay.textContent = message;
    liveMessageDisplay.classList.remove('fade-out');
    liveMessageDisplay.classList.add('fade-in');

    // Clear previous timeout if exists
    if (liveMessageTimeoutId) clearTimeout(liveMessageTimeoutId);

    // Set timeout to fade out current message
    const fadeOutTimer = setTimeout(() => {
        liveMessageDisplay.classList.remove('fade-in');
        liveMessageDisplay.classList.add('fade-out');
    }, 5000); // Message visible for 5 seconds

    // Set timeout to schedule the next message
    const nextMessageDelay = 15000 + Math.random() * 30000; // 15-45 seconds delay
    liveMessageTimeoutId = setTimeout(showLiveMessage, nextMessageDelay + 5000); // Schedule after fade out
}

function startLiveSession() {
    liveSessionActive = true;
    liveSessionStartTime = new Date();
    startLiveSessionBtn.classList.add('hidden');
    endLiveSessionBtn.classList.remove('hidden');
    liveTimerDisplay.textContent = "0:00";
    liveMessageDisplay.textContent = "Let the good times roll! ✨";
    liveMessageDisplay.classList.remove('fade-out');
    liveMessageDisplay.classList.add('fade-in');
    liveSessionBox.style.animationPlayState = 'running'; // Ensure animation is running

    liveTimerIntervalId = setInterval(() => {
        const elapsedMs = Date.now() - liveSessionStartTime.getTime();
        liveTimerDisplay.textContent = formatDuration(elapsedMs);
    }, 1000);

    // Start the message cycle after a short delay
    if (liveMessageTimeoutId) clearTimeout(liveMessageTimeoutId);
    liveMessageTimeoutId = setTimeout(showLiveMessage, 10000); // First message after 10s

    // Add active class, remove inactive
    liveSessionBox.classList.remove('live-inactive');
    liveSessionBox.classList.add('live-active');
}

function endLiveSession() {
    liveSessionActive = false;
    if (liveTimerIntervalId) clearInterval(liveTimerIntervalId);
    if (liveMessageTimeoutId) clearTimeout(liveMessageTimeoutId);
    liveTimerIntervalId = null;
    liveMessageTimeoutId = null;
    liveSessionStartTime = null;

    startLiveSessionBtn.classList.remove('hidden');
    endLiveSessionBtn.classList.add('hidden');
    liveTimerDisplay.textContent = "Ended";
    liveMessageDisplay.textContent = "";
    liveMessageDisplay.classList.remove('fade-in', 'fade-out');
    liveSessionBox.style.animationPlayState = 'paused'; // Pause animation

    // Add inactive class, remove active
    liveSessionBox.classList.remove('live-active');
    liveSessionBox.classList.add('live-inactive');
}

// ------------------- Load Recent Session Modal Logic -------------------

function populateLoadRecentModal() {
  if (!loadRecentList) return;
  loadRecentList.innerHTML = ''; // Clear previous

  const recentSessions = [...sessions].sort((a, b) => new Date(b.startTime || b.time) - new Date(a.startTime || a.time)).slice(0, 3);

  if (recentSessions.length === 0) {
    loadRecentList.innerHTML = '<p style="font-size: 0.9em; opacity: 0.7;">No recent sessions to load.</p>';
    return;
  }

  recentSessions.forEach(session => {
    const entryDiv = document.createElement('div');
    entryDiv.style.padding = '0.75rem 0';
    entryDiv.style.borderBottom = '1px dashed var(--border-color)';
    entryDiv.style.display = 'flex';
    entryDiv.style.justifyContent = 'space-between';
    entryDiv.style.alignItems = 'center';

    const details = `
      <span>
        ${session.strain || 'N/A'} • ${session.product || 'N/A'} • ${session.hit || 'N/A'}
        <small style="display: block; opacity: 0.7;">${new Date(session.startTime || session.time).toLocaleString()}</small>
      </span>
    `;

    const loadBtn = document.createElement('button');
    loadBtn.textContent = 'Load';
    loadBtn.className = 'btn btn-small btn-primary';
    loadBtn.style.marginLeft = '1rem';

    loadBtn.addEventListener('click', () => {
      // Prefill logic (similar to old quick log)
      if (inventory.find(inv => inv.name === session.strain)) {
        strainSelect.value = session.strain;
        strainInput.value = '';
      } else {
        strainSelect.value = '';
        strainInput.value = session.strain || '';
      }
      productType.value = session.product || '';
      hitType.value = session.hit || '';
      
      // Highlight briefly
      [strainSelect, strainInput, productType, hitType].forEach(el => {
             el.style.transition = 'background-color 0.5s ease';
             el.style.backgroundColor = 'color-mix(in srgb, var(--accent-color) 20%, transparent)';
             setTimeout(() => { el.style.backgroundColor = '' }, 1000);
      });

      // Close modal
      if (loadRecentModal) {
          loadRecentModal.style.display = "none";
      }
      console.log('Loaded session details:', session);
    });

    entryDiv.innerHTML = details;
    entryDiv.appendChild(loadBtn);
    loadRecentList.appendChild(entryDiv);
  });

  // Remove border from last item
  if(loadRecentList.lastElementChild) {
      loadRecentList.lastElementChild.style.borderBottom = 'none';
  }
}

// Event Listeners for Load Recent Modal
if (openLoadRecentModalBtn) {
  openLoadRecentModalBtn.addEventListener('click', () => {
    populateLoadRecentModal();
    if (loadRecentModal) {
      loadRecentModal.style.display = "block";
      applyFadeInEffect(loadRecentModal.querySelector('.modal-content'));
    }
  });
}

if (closeLoadRecentModal) {
  closeLoadRecentModal.addEventListener('click', () => {
    if (loadRecentModal) {
      loadRecentModal.style.display = "none";
    }
  });
}

// Close modal if clicking outside of it (optional but good UX)
window.addEventListener('click', (event) => {
  if (event.target == loadRecentModal) {
    loadRecentModal.style.display = "none";
  }
});
