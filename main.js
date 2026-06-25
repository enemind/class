// ============================================================
//  MAIN PAGE — Homepage interactions
// ============================================================

function toggleNav() {
  document.getElementById("navMobile").classList.toggle("open");
}

async function loadHomepage() {
  // Load live stats
  const stats = await API.getStats();
  if (stats.success) {
    animateCount("statStudents", stats.students || 0);
    animateCount("statClasses", stats.activeClasses || 0);
    animateCount("statSessions", stats.sessionsThisMonth || 0);
  }

  // Load preview classes
  const result = await API.getClasses();
  const container = document.getElementById("previewClasses");
  if (!container) return;

  if (!result.success || !result.classes?.length) {
    container.innerHTML = `<div class="empty-state" style="grid-column:1/-1">
      <div class="empty-state-icon">📚</div>
      <h3>No classes scheduled yet</h3>
      <p>Check back soon or contact your instructor.</p>
    </div>`;
    return;
  }

  const preview = result.classes.slice(0, CONFIG.HOMEPAGE_PREVIEW_COUNT);
  container.innerHTML = preview.map(cls => buildClassCard(cls)).join("");
}

function animateCount(id, target) {
  const el = document.getElementById(id);
  if (!el) return;
  let current = 0;
  const step = Math.ceil(target / 40);
  const timer = setInterval(() => {
    current = Math.min(current + step, target);
    el.textContent = current.toLocaleString();
    if (current >= target) clearInterval(timer);
  }, 30);
}

// Redirect to enroll page with class pre-selected
function enrollClass(classId) {
  const session = Session.get();
  if (!session) {
    window.location.href = `pages/login.html?redirect=register&class=${classId}`;
    return;
  }
  window.location.href = `pages/schedule.html?enroll=${classId}`;
}

function joinWaitlist(classId) {
  const session = Session.get();
  if (!session) {
    window.location.href = `pages/login.html?redirect=schedule&class=${classId}`;
    return;
  }
  window.location.href = `pages/schedule.html?waitlist=${classId}`;
}

// Init
loadHomepage();
