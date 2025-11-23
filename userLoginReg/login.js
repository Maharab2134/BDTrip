// API Configuration
const API_BASE_URL = "http://localhost:3000";

// DOM Elements
const emailInput = document.getElementById("logemail");
const passwordInput = document.getElementById("password");
const loginBtn = document.getElementById("logbtn");
const loginForm = document.getElementById("logForm");
const passwordToggle = document.getElementById("passwordToggle");
const rememberMe = document.getElementById("rememberMe");

// Initialize the page
document.addEventListener("DOMContentLoaded", function () {
  // Check if user wanted to be remembered
  const savedEmail = localStorage.getItem("rememberedEmail");
  if (savedEmail) {
    emailInput.value = savedEmail;
    rememberMe.checked = true;
  }

  // Add input validation
  emailInput.addEventListener("blur", validateEmail);
  passwordInput.addEventListener("blur", validatePassword);

  // Password toggle functionality
  passwordToggle.addEventListener("click", togglePasswordVisibility);

  // Form submission
  loginForm.addEventListener("submit", handleLogin);
});

// Toggle password visibility
function togglePasswordVisibility() {
  const type =
    passwordInput.getAttribute("type") === "password" ? "text" : "password";
  passwordInput.setAttribute("type", type);

  // Toggle eye icon
  const icon = passwordToggle.querySelector("i");
  icon.classList.toggle("fa-eye");
  icon.classList.toggle("fa-eye-slash");
}

// Email validation
function validateEmail() {
  const email = emailInput.value.trim();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (email === "") {
    showError(emailInput, "Email is required");
    return false;
  } else if (!emailRegex.test(email)) {
    showError(emailInput, "Please enter a valid email address");
    return false;
  } else {
    clearError(emailInput);
    return true;
  }
}

// Password validation
function validatePassword() {
  const password = passwordInput.value.trim();

  if (password === "") {
    showError(passwordInput, "Password is required");
    return false;
  } else if (password.length < 6) {
    showError(passwordInput, "Password must be at least 6 characters");
    return false;
  } else {
    clearError(passwordInput);
    return true;
  }
}

// Show error message
function showError(input, message) {
  const formGroup = input.closest(".form-group");
  let errorMessage = formGroup.querySelector(".error-message");

  if (!errorMessage) {
    errorMessage = document.createElement("div");
    errorMessage.className = "error-message";
    formGroup.appendChild(errorMessage);
  }

  input.classList.add("error");
  errorMessage.textContent = message;
  errorMessage.style.display = "block";
}

// Clear error message
function clearError(input) {
  const formGroup = input.closest(".form-group");
  const errorMessage = formGroup.querySelector(".error-message");

  input.classList.remove("error");
  if (errorMessage) {
    errorMessage.style.display = "none";
  }
}

// Handle login form submission
function handleLogin(e) {
  e.preventDefault();

  // Validate inputs
  const isEmailValid = validateEmail();
  const isPasswordValid = validatePassword();

  if (!isEmailValid || !isPasswordValid) {
    return;
  }

  // Show loading state
  setLoadingState(true);

  // Prepare login data
  const loginData = {
    email: emailInput.value.trim(),
    password: passwordInput.value,
  };

  // Attempt login
  login(loginData);
}

// Set loading state
function setLoadingState(isLoading) {
  const btnText = loginBtn.querySelector(".btn-text");
  const btnLoader = loginBtn.querySelector(".btn-loader");

  if (isLoading) {
    loginBtn.disabled = true;
    btnText.style.display = "none";
    btnLoader.style.display = "block";
  } else {
    loginBtn.disabled = false;
    btnText.style.display = "block";
    btnLoader.style.display = "none";
  }
}

// Login function
function login(obj) {
  console.log("Login attempt:", obj);

  fetch(`${API_BASE_URL}/users`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((res) => {
      if (!res.ok) {
        throw new Error("Network response was not ok");
      }
      return res.json();
    })
    .then((data) => {
      console.log("User data:", data);
      let found = false;
      let username;
      let userId = null;

      data.forEach((user) => {
        if (user.email === obj.email && user.passward === obj.password) {
          found = true;
          username = user.name;
          // capture user id if present for later existence checks
          userId = user.id || user._id || user.legacyId || null;
        }
      });

      if (found) {
        // Save remember me preference
        if (rememberMe.checked) {
          localStorage.setItem("rememberedEmail", obj.email);
        } else {
          localStorage.removeItem("rememberedEmail");
        }

        // Save login info
        localStorage.setItem("username", username);
        localStorage.setItem("userEmail", obj.email);
        if (typeof userId !== "undefined" && userId)
          localStorage.setItem("userId", String(userId));
        localStorage.setItem("logStatus", true);

        // Show success and redirect
        showSuccess();
        setTimeout(() => {
          window.location.href = "../index.html";
        }, 1500);
      } else {
        setLoadingState(false);
        showError(emailInput, "Invalid email or password");
        showError(passwordInput, "Invalid email or password");
      }
    })
    .catch((error) => {
      console.error("Login error:", error);
      setLoadingState(false);
      alert("An error occurred during login. Please try again.");
    });
}

// Show success animation
function showSuccess() {
  loginBtn.classList.add("success");
  loginBtn.style.background = "linear-gradient(to right, #2ecc71, #27ae60)";

  const btnText = loginBtn.querySelector(".btn-text");
  btnText.textContent = "Login Successful!";
}
