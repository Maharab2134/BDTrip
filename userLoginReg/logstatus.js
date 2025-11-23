// Use existing `API_BASE_URL` if another script defined it; otherwise fall back.
const _API_BASE_URL =
  typeof API_BASE_URL !== "undefined" ? API_BASE_URL : "http://localhost:3000";

function parseBool(val) {
  try {
    return JSON.parse(val);
  } catch (e) {
    return String(val) === "true";
  }
}

function updateAuthUI() {
  const loginstatus = parseBool(localStorage.getItem("logStatus"));
  const username = localStorage.getItem("username");
  const logDiv = document.getElementById("logdiv");
  const registerDiv = document.getElementById("registerDiv");

  if (!logDiv || !registerDiv) return;

  registerDiv.innerText = "Register";
  registerDiv.setAttribute("href", "userLoginReg/registration.html");

  if (loginstatus === true) {
    logDiv.innerHTML =
      '<i class="fa-solid fa-user"></i> ' + (username || "User");
    registerDiv.innerText = "Logout";
    registerDiv.setAttribute("href", "#");
    try {
      logDiv.setAttribute("href", "/profile.html");
    } catch (e) {}

    // attach logout handler if not already attached
    if (!registerDiv.__logoutHandler) {
      const handler = function (e) {
        e.preventDefault();
        try {
          if (window.__userExistenceCheckInterval)
            clearInterval(window.__userExistenceCheckInterval);
        } catch (err) {}
        localStorage.removeItem("logStatus");
        localStorage.removeItem("username");
        localStorage.removeItem("userEmail");
        logDiv.innerText = "Login";
        registerDiv.innerText = "Register";
        window.location.href = "/index.html";
      };
      registerDiv.addEventListener("click", handler);
      registerDiv.__logoutHandler = handler;
    }

    // ensure periodic existence check is running when logged in
    try {
      if (!window.__userExistenceCheckInterval) {
        checkUserStillExists();
        window.__userExistenceCheckInterval = setInterval(
          checkUserStillExists,
          10000
        );
      }
    } catch (err) {}
  } else {
    logDiv.innerText = "Login";
    try {
      logDiv.setAttribute("href", "userLoginReg/login.html");
    } catch (e) {}
    // remove logout handler if present
    if (registerDiv.__logoutHandler) {
      registerDiv.removeEventListener("click", registerDiv.__logoutHandler);
      delete registerDiv.__logoutHandler;
    }
  }
}

// Update UI on DOM ready and when storage changes (login from another tab)
document.addEventListener("DOMContentLoaded", () => {
  updateAuthUI();
});
window.addEventListener("storage", (e) => {
  if (e.key === "logStatus" || e.key === "username") updateAuthUI();
});

// Periodically verify that the logged-in user still exists on the server.
// If the admin deleted the user, auto-clear localStorage and redirect to login.
async function checkUserStillExists() {
  try {
    const isLogged = JSON.parse(localStorage.getItem("logStatus"));
    if (!isLogged) return;
    const userId = localStorage.getItem("userId");
    const userEmail = localStorage.getItem("userEmail");

    if (!userId && !userEmail) return;

    if (userId) {
      const resp = await fetch(`${_API_BASE_URL}/users/${userId}`);
      if (resp.status === 404) {
        // user removed
        doAutoLogout();
      }
      // if other non-ok, ignore (network issue)
      return;
    }

    if (userEmail) {
      const resp = await fetch(`${_API_BASE_URL}/users`);
      if (!resp.ok) return;
      const list = await resp.json();
      const found = list.find(
        (u) => u.email && u.email.toLowerCase() === userEmail.toLowerCase()
      );
      if (!found) doAutoLogout();
    }
  } catch (err) {
    console.warn("User-existence check failed", err);
  }
}

function doAutoLogout() {
  try {
    if (window.__userExistenceCheckInterval)
      clearInterval(window.__userExistenceCheckInterval);
  } catch (e) {}
  // Clear auth-related localStorage keys
  localStorage.removeItem("logStatus");
  localStorage.removeItem("username");
  localStorage.removeItem("userEmail");
  localStorage.removeItem("userId");
  localStorage.removeItem("userPhone");
  localStorage.removeItem("userAddress");
  alert(
    "Your account has been removed by an administrator. You have been logged out."
  );
  // redirect to login page
  window.location.href = "/userLoginReg/login.html";
}

// Start periodic checking when the page loads if already logged in, and respond to storage changes
(function initPeriodicCheck() {
  try {
    const isLogged = parseBool(localStorage.getItem("logStatus"));
    if (isLogged && !window.__userExistenceCheckInterval) {
      checkUserStillExists();
      window.__userExistenceCheckInterval = setInterval(
        checkUserStillExists,
        10000
      );
    }
  } catch (e) {}

  window.addEventListener("storage", (e) => {
    if (e.key !== "logStatus") return;
    const nowLogged = parseBool(e.newValue);
    if (nowLogged) {
      if (!window.__userExistenceCheckInterval) {
        checkUserStillExists();
        window.__userExistenceCheckInterval = setInterval(
          checkUserStillExists,
          10000
        );
      }
    } else {
      try {
        if (window.__userExistenceCheckInterval) {
          clearInterval(window.__userExistenceCheckInterval);
          delete window.__userExistenceCheckInterval;
        }
      } catch (err) {}
    }
  });
})();
