// ============================================================
//  EDUTRACK API — Communicates with Google Apps Script
// ============================================================

const API = {

  // Generic request handler
  async request(action, data = {}) {
    const params = new URLSearchParams({ action, ...data });
    try {
      const res = await fetch(`${CONFIG.SCRIPT_URL}?${params.toString()}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      console.error(`[API] ${action} failed:`, err);
      return { success: false, error: err.message };
    }
  },

  // POST request (for form submissions)
  async post(action, payload = {}) {
    try {
      const res = await fetch(CONFIG.SCRIPT_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, ...payload }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      console.error(`[API] POST ${action} failed:`, err);
      return { success: false, error: err.message };
    }
  },

  // ── STUDENTS ──────────────────────────────────────────────
  async registerStudent(data)    { return this.post("registerStudent", data); },
  async loginStudent(email)      { return this.request("loginStudent", { email }); },
  async verifyToken(token)       { return this.request("verifyToken", { token }); },
  async getStudentDashboard(sid) { return this.request("getStudentDashboard", { studentId: sid }); },

  // ── CLASSES ───────────────────────────────────────────────
  async getClasses(filter = "")  { return this.request("getClasses", { filter }); },
  async getClassDetail(cid)      { return this.request("getClassDetail", { classId: cid }); },
  async getStats()               { return this.request("getStats"); },

  // ── ENROLLMENT ────────────────────────────────────────────
  async enroll(studentId, classId)    { return this.post("enroll", { studentId, classId }); },
  async unenroll(studentId, classId)  { return this.post("unenroll", { studentId, classId }); },
  async joinWaitlist(studentId, classId) { return this.post("joinWaitlist", { studentId, classId }); },

  // ── ATTENDANCE ────────────────────────────────────────────
  async getAttendance(sid)            { return this.request("getAttendance", { studentId: sid }); },
  async markAttendance(token, sid)    { return this.post("markAttendance", { qrToken: token, studentId: sid }); },

  // ── ADMIN ─────────────────────────────────────────────────
  async adminLogin(password)          { return this.request("adminLogin", { password }); },
  async adminGetDashboard()           { return this.request("adminDashboard"); },
  async adminGetStudents()            { return this.request("adminGetStudents"); },
  async adminGetClasses()             { return this.request("adminGetClasses"); },
  async adminAddClass(data)           { return this.post("adminAddClass", data); },
  async adminUpdateClass(data)        { return this.post("adminUpdateClass", data); },
  async adminDeleteClass(classId)     { return this.post("adminDeleteClass", { classId }); },
  async adminSendAnnouncement(data)   { return this.post("adminSendAnnouncement", data); },
  async adminGetAttendance(classId)   { return this.request("adminGetAttendance", { classId }); },
  async adminMarkAttendance(data)     { return this.post("adminMarkAttendance", data); },
};

// ── SESSION HELPERS ───────────────────────────────────────────
const Session = {
  set(data) { localStorage.setItem(CONFIG.SESSION_KEY, JSON.stringify(data)); },
  get()     {
    try { return JSON.parse(localStorage.getItem(CONFIG.SESSION_KEY)); }
    catch { return null; }
  },
  clear()   { localStorage.removeItem(CONFIG.SESSION_KEY); },
  isAdmin() { const s = this.get(); return s && s.role === "admin"; },
  isStudent(){ const s = this.get(); return s && s.role === "student"; },
};

// ── UI HELPERS ────────────────────────────────────────────────
function showAlert(id, msg, type = "success") {
  const el = document.getElementById(id);
  if (!el) return;
  el.className = `alert alert-${type} show`;
  el.textContent = msg;
  if (type === "success") setTimeout(() => el.classList.remove("show"), 5000);
}

function setLoading(btn, loading) {
  if (loading) {
    btn.dataset.orig = btn.innerHTML;
    btn.innerHTML = `<span class="spinner"></span> Please wait…`;
    btn.disabled = true;
  } else {
    btn.innerHTML = btn.dataset.orig || btn.innerHTML;
    btn.disabled = false;
  }
}

function formatDate(dateStr) {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-KE", { weekday: "short", month: "short", day: "numeric" });
}

function formatTime(timeStr) {
  if (!timeStr) return "";
  const [h, m] = timeStr.split(":");
  const hour = parseInt(h);
  return `${hour > 12 ? hour - 12 : hour}:${m} ${hour >= 12 ? "PM" : "AM"}`;
}

function capacityClass(filled, total) {
  const pct = (filled / total) * 100;
  if (pct >= 100) return "full";
  if (pct >= 75) return "warn";
  return "";
}

function buildClassCard(cls, showEnroll = true) {
  const pct = Math.min(100, Math.round((cls.enrolled / cls.capacity) * 100));
  const capCls = capacityClass(cls.enrolled, cls.capacity);
  const full = cls.enrolled >= cls.capacity;
  return `
    <div class="class-card" data-id="${cls.id}">
      <div class="class-card-subject">${cls.subject || "General"}</div>
      <div class="class-card-title">${cls.title}</div>
      <div class="class-card-meta">
        <span>👤 ${cls.instructor}</span>
        <span>📅 ${formatDate(cls.date)} · ${formatTime(cls.time)}</span>
        <span>📍 ${cls.location || "Online"}</span>
      </div>
      <div class="class-card-footer">
        <div class="capacity-bar"><div class="capacity-fill ${capCls}" style="width:${pct}%"></div></div>
        <span class="capacity-label">${cls.enrolled}/${cls.capacity}</span>
      </div>
      ${showEnroll ? `
      <div class="mt-2">
        ${full
          ? `<button class="btn btn-sm btn-gold w-full" onclick="joinWaitlist('${cls.id}')">Join Waitlist</button>`
          : `<button class="btn btn-sm btn-primary w-full" onclick="enrollClass('${cls.id}')">Enroll →</button>`
        }
      </div>` : ""}
    </div>`;
}
