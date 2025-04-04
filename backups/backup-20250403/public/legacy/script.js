"use strict";

// ------------------- Data Initialization -------------------
let sessions = JSON.parse(localStorage.getItem("seshTrackerSessions")) || [];
let inventory = JSON.parse(localStorage.getItem("seshTrackerInventory")) || [];
let inventoryHistory = JSON.parse(localStorage.getItem("seshTrackerInventoryHistory")) || {};

// ------------------- Chart Variables -------------------
let usageChart, productChart, hitChart, inventoryChart;

// ------------------- Global Filter Variables & View Mode -------------------
let filterText = "";
let filterProduct = "";
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
  let dailyGoal = document.getElementById("dailyGoal").value || 5;
  let weeklyGoal = document.getElementById("weeklyGoal").value || 20;
  let monthlyGoal = document.getElementById("monthlyGoal").value || 80;
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
}

// ------------------- Daily View Rendering -------------------
function renderDailyView() {
  dailyView.innerHTML = "";
  const filtered = getFilteredSessions();
  filtered.forEach((s, index) => {
    const row = document.createElement("div");
    row.className = "session-row";
    const label = `${formatTime(s.time)}${s.strain ? " • " + s.strain : ""}${s.product ? " • " + s.product : ""}${s.hit ? " • " + s.hit : ""}${s.amount ? " • " + s.amount + "g" : ""}`;
    row.innerHTML = `
      <div class="session-label">${label}</div>
      <div class="session-actions">
        <button class="btn btn-small" onclick="editSession(${index})">Edit</button>
        <button class="btn btn-small btn-danger" onclick="deleteSession(${index})">Delete</button>
      </div>
    `;
    dailyView.appendChild(row);
    applyFadeInEffect(row);
  });
}

// ------------------- Weekly View Rendering -------------------
function renderWeeklyView() {
  weeklyView.innerHTML = "";
  const filtered = getFilteredSessions();
  let groups = {};
  filtered.forEach(s => {
    const d = new Date(s.time);
    const year = d.getFullYear();
    const week = getWeekNumber(d);
    const key = `${year}-W${week}`;
    if (!groups[key]) groups[key] = [];
    groups[key].push(s);
  });
  Object.keys(groups).forEach(weekKey => {
    const container = document.createElement("div");
    container.className = "week-group";
    const header = document.createElement("div");
    header.className = "week-header";
    header.textContent = `Week: ${weekKey}`;
    container.appendChild(header);

    groups[weekKey].forEach(s => {
      const row = document.createElement("div");
      row.className = "session-row small";
      const label = `${formatTime(s.time)}${s.strain ? " • " + s.strain : ""}${s.product ? " • " + s.product : ""}${s.hit ? " • " + s.hit : ""}${s.amount ? " • " + s.amount + "g" : ""}`;
      row.innerHTML = `
        <div class="session-label">${label}</div>
        <div class="session-actions">
          <button class="btn btn-small" onclick="editSession(${sessions.indexOf(s)})">Edit</button>
          <button class="btn btn-small btn-danger" onclick="deleteSession(${sessions.indexOf(s)})">Delete</button>
        </div>
      `;
      container.appendChild(row);
      applyFadeInEffect(row);
    });
    container.style.marginBottom = "1.5rem";
    weeklyView.appendChild(container);
    applyFadeInEffect(container);
  });
}

// ------------------- Monthly View Rendering -------------------
function renderMonthlyView() {
  monthlyView.innerHTML = "";
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
        let daySessions = getFilteredSessions().filter(s => s.time.startsWith(dateStr));
        let sessionsHTML = "";
        daySessions.forEach(s => {
          sessionsHTML += `<div class="calendar-cell-session">${formatTime(s.time)} - ${s.strain || "N/A"}</div>`;
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
  const last = new Date(sessions[sessions.length - 1].time);
  const diff = Date.now() - last.getTime();
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  elapsed.textContent = `${h}h ${m}m ${s}s`;
  document.title = `Sesh Tracker - ${h}h ${m}m ${s}s`;

  let intervals = [];
  for (let i = 1; i < sessions.length; i++) {
    const t1 = new Date(sessions[i - 1].time);
    const t2 = new Date(sessions[i].time);
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
    row.innerHTML = `
      <span>${item.name} • ${item.type} • ${item.qty}g</span>
      <button class="btn btn-small btn-danger" onclick="deleteInventoryItem(${index})">Delete</button>
    `;
    inventoryList.appendChild(row);

    const opt = document.createElement("option");
    opt.value = item.name;
    opt.textContent = `${item.name} (${item.qty}g)`;
    strainSelect.appendChild(opt);

    if (!inventoryHistory[item.name]) {
      inventoryHistory[item.name] = [{ x: new Date().toString(), y: item.qty }];
      localStorage.setItem("seshTrackerInventoryHistory", JSON.stringify(inventoryHistory));
    }
  });
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
      const searchStr = `${s.strain || ""} ${s.product || ""} ${s.hit || ""}`.toLowerCase();
      if (!searchStr.includes(filterText.toLowerCase())) include = false;
    }
    if (filterProduct && s.product !== filterProduct) include = false;
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
window.deleteSession = (index) => {
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

window.editSession = (index) => {
  currentEditingIndex = index;
  const session = sessions[index];
  const date = new Date(session.time);
  document.getElementById("editTime").value = date.toISOString().slice(0,16);
  document.getElementById("editStrain").value = session.strain || "";
  document.getElementById("editProduct").value = session.product || "";
  document.getElementById("editHit").value = session.hit || "";
  document.getElementById("editAmount").value = session.amount || 0;
  editModal.style.display = "block";
  const modalContent = editModal.querySelector(".modal-content");
  applyFadeInEffect(modalContent);
};

closeEditModal.addEventListener("click", () => {
  editModal.style.display = "none";
});

editSessionForm.addEventListener("submit", (e) => {
  e.preventDefault();
  if (currentEditingIndex === null) return;
  const updatedTime = document.getElementById("editTime").value;
  const updatedStrain = document.getElementById("editStrain").value;
  const updatedProduct = document.getElementById("editProduct").value;
  const updatedHit = document.getElementById("editHit").value;
  const updatedAmount = parseFloat(document.getElementById("editAmount").value) || 0;
  sessions[currentEditingIndex] = {
    time: new Date(updatedTime).toString(),
    strain: updatedStrain,
    product: updatedProduct,
    hit: updatedHit,
    amount: updatedAmount
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
  const session = { time, strain, product, hit, amount };
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
}

function clearSessions() {
  sessions = [];
  localStorage.removeItem("seshTrackerSessions");
  renderSessions();
  updateGoalProgress();
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
  const state = {
    sessions: sessions,
    inventory: inventory,
    inventoryHistory: inventoryHistory,
    theme: localStorage.getItem("themeColor") || "material-dark",
    dailyGoal: document.getElementById("dailyGoal").value,
    weeklyGoal: document.getElementById("weeklyGoal").value,
    monthlyGoal: document.getElementById("monthlyGoal").value,
    viewMode: viewMode
  };
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
const logBtn = document.getElementById("logBtn");
const clearBtn = document.getElementById("clearBtn");
const addInvBtn = document.getElementById("addInvBtn");
const clearInvBtn = document.getElementById("clearInvBtn");
const exportDataBtn = document.getElementById("exportData");
const importDataBtn = document.getElementById("importData");

if (logBtn) logBtn.addEventListener("click", logSession);
if (clearBtn) clearBtn.addEventListener("click", clearSessions);
if (addInvBtn) {
  addInvBtn.addEventListener("click", () => {
    const name = invName.value.trim();
    const type = invType.value;
    const qty = parseFloat(invQty.value) || 0;
    if (name && type && qty > 0) {
      inventory.push({ name, type, qty });
      localStorage.setItem("seshTrackerInventory", JSON.stringify(inventory));
      if (!inventoryHistory[name]) {
        inventoryHistory[name] = [{ x: new Date().toString(), y: qty }];
        localStorage.setItem("seshTrackerInventoryHistory", JSON.stringify(inventoryHistory));
      }
      renderInventory();
      invName.value = "";
      invType.value = "";
      invQty.value = "";
    }
  });
}
if (clearInvBtn) {
  clearInvBtn.addEventListener("click", () => {
    inventory = [];
    localStorage.removeItem("seshTrackerInventory");
    renderInventory();
  });
}
if (exportDataBtn) exportDataBtn.addEventListener("click", exportData);
if (importDataBtn) importDataBtn.addEventListener("click", () => { importFileInput.click(); });
strainSelect.addEventListener("change", () => {
  const selected = strainSelect.value;
  const found = inventory.find(i => i.name === selected);
  if (found) {
    productType.value = found.type;
  }
});

// ------------------- Filter Event Listeners -------------------
const filterTextInput = document.getElementById("filterText");
const filterProductSelect = document.getElementById("filterProduct");
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
  filterStartDate = "";
  filterEndDate = "";
  filterTextInput.value = "";
  filterProductSelect.value = "";
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
renderInventory();
renderSessions();
initCollapsibles();
setInterval(updateStats, 1000);

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
