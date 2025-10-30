// API Configuration
const API_BASE_URL = "http://localhost:3000";

const username = document.getElementById("user_name");
const password = document.getElementById("passwords");
const loginBtn = document.getElementById("login--btn");
const togglePassword = document.getElementById("togglePassword");

// Toggle Password Visibility
togglePassword.addEventListener("click", () => {
  if (password.type === "password") {
    password.type = "text";
    togglePassword.textContent = "🚫"; // or use "🙈"
  } else {
    password.type = "password";
    togglePassword.textContent = "👁️";
  }
});

loginBtn.addEventListener("click", () => {
  const userNameValue = username.value.trim();
  const passwordValue = password.value.trim();

  if (!userNameValue && !passwordValue) {
    alert("⚠️ Please enter your username and password.");
  } else if (!userNameValue) {
    alert("⚠️ Please enter your username.");
  } else if (!passwordValue) {
    alert("⚠️ Please enter your password.");
  } else {
    login({ username: userNameValue, password: passwordValue });
  }
});

function login(credentials) {
  fetch(`${API_BASE_URL}/admin`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((res) => res.json())
    .then((data) => {
      let isValid = false;
      data.forEach((admin) => {
        if (
          admin.name === credentials.username &&
          admin.passward === credentials.password
        ) {
          isValid = true;
        }
      });

      if (isValid) {
        alert("✅ Login successful!");
        window.location.href = "../admin/adminDashboard.html";
      } else {
        alert("❌ Invalid username or password.");
      }
    })
    .catch((err) => {
      console.error("Error:", err);
      alert("⚠️ Server error. Please try again later.");
    });
}
