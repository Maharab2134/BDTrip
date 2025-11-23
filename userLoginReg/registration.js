// API Configuration
const API_BASE_URL = "http://localhost:3000";
// Redirect mode after successful registration: 'toast' = show toast then redirect, 'direct' = go straight to login
const REDIRECT_MODE = "toast";

// DOM Elements
const nameInput = document.getElementById("name");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const addressInput = document.getElementById("address");
const phoneInput = document.getElementById("phone");
const regForm = document.getElementById("regForm");
const registerBtn = document.getElementById("registerBtn");
const passwordToggle = document.getElementById("passwordToggle");
const termsCheck = document.getElementById("termsCheck");
const strengthFill = document.getElementById("strengthFill");
const strengthText = document.getElementById("strengthText");
const addressPicker = document.getElementById("addressPicker");
const GOOGLE_MAPS_BASE = "https://www.google.com/maps?q=";

// Initialize the page
document.addEventListener("DOMContentLoaded", function () {
  // Add input validation
  nameInput.addEventListener("blur", validateName);
  emailInput.addEventListener("blur", validateEmail);
  passwordInput.addEventListener("input", validatePassword);
  passwordInput.addEventListener("input", updatePasswordStrength);
  addressInput.addEventListener("blur", validateAddress);
  phoneInput.addEventListener("blur", validatePhone);

  // Password toggle functionality
  passwordToggle.addEventListener("click", togglePasswordVisibility);

  // Address picker (get current location and reverse-geocode)
  if (addressPicker) addressPicker.addEventListener("click", handleAddressPick);

  // Form submission
  regForm.addEventListener("submit", handleRegistration);
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

// Name validation
function validateName() {
  const name = nameInput.value.trim();

  if (name === "") {
    showError(nameInput, "Full name is required");
    return false;
  } else if (name.length < 2) {
    showError(nameInput, "Name must be at least 2 characters");
    return false;
  } else {
    clearError(nameInput);
    return true;
  }
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
  const password = passwordInput.value;

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

// Update password strength indicator
function updatePasswordStrength() {
  const password = passwordInput.value;
  let strength = 0;
  let text = "Weak";

  // Remove previous strength classes
  passwordInput.parentElement.parentElement.classList.remove(
    "strength-weak",
    "strength-medium",
    "strength-strong"
  );

  if (password.length === 0) {
    strengthFill.style.width = "0%";
    strengthText.textContent = "";
    return;
  }

  // Check password strength
  if (password.length >= 6) strength += 1;
  if (password.length >= 8) strength += 1;
  if (/[A-Z]/.test(password)) strength += 1;
  if (/[0-9]/.test(password)) strength += 1;
  if (/[^A-Za-z0-9]/.test(password)) strength += 1;

  // Apply strength classes and update UI
  if (strength <= 2) {
    passwordInput.parentElement.parentElement.classList.add("strength-weak");
    strengthFill.style.width = "33%";
    text = "Weak";
  } else if (strength <= 4) {
    passwordInput.parentElement.parentElement.classList.add("strength-medium");
    strengthFill.style.width = "66%";
    text = "Medium";
  } else {
    passwordInput.parentElement.parentElement.classList.add("strength-strong");
    strengthFill.style.width = "100%";
    text = "Strong";
  }

  strengthText.textContent = text;
}

// Address validation
function validateAddress() {
  const addr = addressInput.value.trim();
  if (addr === "") {
    showError(addressInput, "Address is required");
    return false;
  } else if (addr.length < 5) {
    showError(addressInput, "Please enter a more specific address");
    return false;
  } else {
    clearError(addressInput);
    return true;
  }
}

// Phone validation: accept digits, +, spaces, dashes, min 7 chars
function validatePhone() {
  const phone = phoneInput.value.trim();
  const phoneRegex = /^[+\d][\d\s\-()]{6,}$/;
  if (phone === "") {
    showError(phoneInput, "Phone number is required");
    return false;
  } else if (!phoneRegex.test(phone)) {
    showError(phoneInput, "Please enter a valid phone number");
    return false;
  } else {
    clearError(phoneInput);
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
  errorMessage.classList.add("show");
}

// Clear error message
function clearError(input) {
  const formGroup = input.closest(".form-group");
  const errorMessage = formGroup.querySelector(".error-message");

  input.classList.remove("error");
  if (errorMessage) {
    errorMessage.classList.remove("show");
  }
}

// Set loading state
function setLoadingState(isLoading) {
  const btnText = registerBtn.querySelector(".btn-text");
  const btnLoader = registerBtn.querySelector(".btn-loader");

  if (isLoading) {
    registerBtn.disabled = true;
    btnText.style.display = "none";
    btnLoader.style.display = "block";
  } else {
    registerBtn.disabled = false;
    btnText.style.display = "block";
    btnLoader.style.display = "none";
  }
}

// Handle registration form submission
function handleRegistration(e) {
  e.preventDefault();

  // Validate all inputs
  const isNameValid = validateName();
  const isEmailValid = validateEmail();
  const isPasswordValid = validatePassword();
  const isAddressValid = validateAddress();
  const isPhoneValid = validatePhone();
  const isTermsAccepted = termsCheck.checked;

  if (!isTermsAccepted) {
    alert("Please accept the Terms & Conditions and Privacy Policy");
    return;
  }

  if (
    !isNameValid ||
    !isEmailValid ||
    !isPasswordValid ||
    !isAddressValid ||
    !isPhoneValid
  ) {
    return;
  }

  // Show loading state
  setLoadingState(true);

  // Check if email already exists
  checkEmailExists()
    .then((emailExists) => {
      if (emailExists) {
        setLoadingState(false);
        showError(emailInput, "This email is already registered");
      } else {
        // Proceed with registration
        registerUser();
      }
    })
    .catch((error) => {
      setLoadingState(false);
      console.error("Error checking email:", error);
      alert("An error occurred. Please try again.");
    });
}

// Check if email already exists
function checkEmailExists() {
  return fetch(`${API_BASE_URL}/users`)
    .then((res) => {
      if (!res.ok) {
        throw new Error("Network response was not ok");
      }
      return res.json();
    })
    .then((data) => {
      const email = emailInput.value.trim();
      return data.some((user) => user.email === email);
    });
}

// Register new user
function registerUser() {
  const userData = {
    name: nameInput.value.trim(),
    email: emailInput.value.trim(),
    passward: passwordInput.value, // Note: Typo in property name to match your API
    address: addressInput.value.trim(),
    phone: phoneInput.value.trim(),
    createdAt: new Date().toISOString(),
  };

  fetch(`${API_BASE_URL}/users`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(userData),
  })
    .then((res) => {
      if (!res.ok) {
        throw new Error("Registration failed");
      }
      return res.json();
    })
    .then((data) => {
      console.log("Registration successful:", data);

      // Show success animation
      showSuccess();

      // On success, show confirmation then redirect to login (mode configurable)
      if (REDIRECT_MODE === "direct") {
        // direct redirect to login page
        setTimeout(() => {
          window.location.href = "login.html";
        }, 200);
      } else {
        // show toast with option to go to login now, auto-redirect after short delay
        showToast(
          "Registration successful! Redirecting to login...",
          1400,
          () => {
            window.location.href = "login.html";
          }
        );
      }
    })
    .catch((error) => {
      setLoadingState(false);
      console.error("Registration error:", error);
      alert("Registration failed. Please try again.");
    });
}

// When address icon clicked: get geolocation, reverse geocode via Nominatim, fill field and open Google Maps
function handleAddressPick(e) {
  if (!navigator.geolocation) {
    alert("Geolocation is not supported by your browser");
    return;
  }
  addressPicker.style.opacity = "0.6";
  navigator.geolocation.getCurrentPosition(
    async (pos) => {
      const lat = pos.coords.latitude;
      const lon = pos.coords.longitude;
      try {
        // try reverse geocoding with Nominatim (no API key)
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}`
        );
        if (res.ok) {
          const data = await res.json();
          if (data && data.display_name) {
            addressInput.value = data.display_name;
          } else {
            addressInput.value = `${lat.toFixed(6)}, ${lon.toFixed(6)}`;
          }
        } else {
          addressInput.value = `${lat.toFixed(6)}, ${lon.toFixed(6)}`;
        }
      } catch (err) {
        console.warn("Reverse geocode failed", err);
        addressInput.value = `${lat.toFixed(6)}, ${lon.toFixed(6)}`;
      } finally {
        addressPicker.style.opacity = "1";
        // open Google Maps in a new tab showing the location
        window.open(GOOGLE_MAPS_BASE + lat + "," + lon, "_blank");
      }
    },
    (err) => {
      addressPicker.style.opacity = "1";
      console.error("Geolocation error", err);
      alert(
        "Unable to retrieve your location. Please allow location access and try again."
      );
    },
    { enableHighAccuracy: true, timeout: 10000 }
  );
}

// Show success animation
function showSuccess() {
  registerBtn.classList.add("success");
  registerBtn.style.background = "linear-gradient(to right, #2ecc71, #27ae60)";

  const btnText = registerBtn.querySelector(".btn-text");
  btnText.textContent = "Registration Successful!";
}

// Simple toast helper: message, duration(ms), onClose callback
function showToast(message, duration = 1200, onClose) {
  // create container if missing
  let container = document.getElementById("toast-container");
  if (!container) {
    container = document.createElement("div");
    container.id = "toast-container";
    container.style.position = "fixed";
    container.style.right = "20px";
    container.style.bottom = "20px";
    container.style.zIndex = 99999;
    document.body.appendChild(container);
  }

  const toast = document.createElement("div");
  toast.className = "simple-toast";
  toast.style.background = "rgba(34,34,34,0.95)";
  toast.style.color = "#fff";
  toast.style.padding = "12px 16px";
  toast.style.borderRadius = "8px";
  toast.style.boxShadow = "0 6px 18px rgba(0,0,0,0.2)";
  toast.style.marginTop = "8px";
  toast.style.minWidth = "240px";
  toast.style.display = "flex";
  toast.style.alignItems = "center";
  toast.style.justifyContent = "space-between";

  const msg = document.createElement("div");
  msg.style.flex = "1";
  msg.style.paddingRight = "8px";
  msg.textContent = message;

  const action = document.createElement("button");
  action.textContent = "Go to Login";
  action.style.background = "transparent";
  action.style.color = "#ffd39b";
  action.style.border = "none";
  action.style.cursor = "pointer";

  action.addEventListener("click", () => {
    if (onClose) onClose();
    container.removeChild(toast);
  });

  toast.appendChild(msg);
  toast.appendChild(action);
  container.appendChild(toast);

  // auto remove
  setTimeout(() => {
    try {
      if (container.contains(toast)) container.removeChild(toast);
    } catch (e) {}
    if (onClose) onClose();
  }, duration);
}
