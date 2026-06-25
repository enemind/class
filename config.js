// ============================================================
//  EDUTRACK CONFIG — Edit these values before deploying
// ============================================================

const CONFIG = {
  // Paste your Google Apps Script Web App URL here after deployment
  // See README.md for step-by-step instructions
  SCRIPT_URL: "https://script.google.com/macros/s/AKfycby-oc-qKl1oigxV-IIEQCOl7amM0wxozVfc96-TJZHpfu9x3tSmOzCd0FNURNdyLuzk/exec",

  // Your institution / site name
  SITE_NAME: "EduTrack",

  // Max students per class (can also be overridden per class in Sheets)
  DEFAULT_CAPACITY: 20,

  // Session token key for localStorage
  SESSION_KEY: "edutrack_session",

  // How many upcoming classes to show on homepage
  HOMEPAGE_PREVIEW_COUNT: 3,
};
