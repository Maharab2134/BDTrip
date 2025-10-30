(function () {
  // Keyboard shortcut to open admin login: Ctrl + Alt + A
  // Ignores input/textarea content so it doesn't trigger while typing.
  document.addEventListener("keydown", function (e) {
    try {
      const active = document.activeElement && document.activeElement.tagName;
      if (active === "INPUT" || active === "TEXTAREA" || active === "SELECT")
        return;

      if (e.ctrlKey && e.altKey && (e.key === "a" || e.key === "A")) {
        // Navigate to admin login (relative path)
        window.location.href = "login/adminlogin.html";
      }
    } catch (err) {
      console.error("admin-shortcut error", err);
    }
  });
})();
