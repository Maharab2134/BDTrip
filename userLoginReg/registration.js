// API Configuration
const API_BASE_URL = "http://localhost:3000";

// DOM Elements
const nameInput = document.getElementById("name");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const regForm = document.getElementById("regForm");
const registerBtn = document.getElementById("registerBtn");
const passwordToggle = document.getElementById("passwordToggle");
const termsCheck = document.getElementById("termsCheck");
const strengthFill = document.getElementById("strengthFill");
const strengthText = document.getElementById("strengthText");

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
  // Add input validation
  nameInput.addEventListener('blur', validateName);
  emailInput.addEventListener('blur', validateEmail);
  passwordInput.addEventListener('input', validatePassword);
  passwordInput.addEventListener('input', updatePasswordStrength);
  
  // Password toggle functionality
  passwordToggle.addEventListener('click', togglePasswordVisibility);
  
  // Form submission
  regForm.addEventListener('submit', handleRegistration);
});

// Toggle password visibility
function togglePasswordVisibility() {
  const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
  passwordInput.setAttribute('type', type);
  
  // Toggle eye icon
  const icon = passwordToggle.querySelector('i');
  icon.classList.toggle('fa-eye');
  icon.classList.toggle('fa-eye-slash');
}

// Name validation
function validateName() {
  const name = nameInput.value.trim();
  
  if (name === '') {
    showError(nameInput, 'Full name is required');
    return false;
  } else if (name.length < 2) {
    showError(nameInput, 'Name must be at least 2 characters');
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
  
  if (email === '') {
    showError(emailInput, 'Email is required');
    return false;
  } else if (!emailRegex.test(email)) {
    showError(emailInput, 'Please enter a valid email address');
    return false;
  } else {
    clearError(emailInput);
    return true;
  }
}

// Password validation
function validatePassword() {
  const password = passwordInput.value;
  
  if (password === '') {
    showError(passwordInput, 'Password is required');
    return false;
  } else if (password.length < 6) {
    showError(passwordInput, 'Password must be at least 6 characters');
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
  let text = 'Weak';
  
  // Remove previous strength classes
  passwordInput.parentElement.parentElement.classList.remove('strength-weak', 'strength-medium', 'strength-strong');
  
  if (password.length === 0) {
    strengthFill.style.width = '0%';
    strengthText.textContent = '';
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
    passwordInput.parentElement.parentElement.classList.add('strength-weak');
    strengthFill.style.width = '33%';
    text = 'Weak';
  } else if (strength <= 4) {
    passwordInput.parentElement.parentElement.classList.add('strength-medium');
    strengthFill.style.width = '66%';
    text = 'Medium';
  } else {
    passwordInput.parentElement.parentElement.classList.add('strength-strong');
    strengthFill.style.width = '100%';
    text = 'Strong';
  }
  
  strengthText.textContent = text;
}

// Show error message
function showError(input, message) {
  const formGroup = input.closest('.form-group');
  let errorMessage = formGroup.querySelector('.error-message');
  
  if (!errorMessage) {
    errorMessage = document.createElement('div');
    errorMessage.className = 'error-message';
    formGroup.appendChild(errorMessage);
  }
  
  input.classList.add('error');
  errorMessage.textContent = message;
  errorMessage.classList.add('show');
}

// Clear error message
function clearError(input) {
  const formGroup = input.closest('.form-group');
  const errorMessage = formGroup.querySelector('.error-message');
  
  input.classList.remove('error');
  if (errorMessage) {
    errorMessage.classList.remove('show');
  }
}

// Set loading state
function setLoadingState(isLoading) {
  const btnText = registerBtn.querySelector('.btn-text');
  const btnLoader = registerBtn.querySelector('.btn-loader');
  
  if (isLoading) {
    registerBtn.disabled = true;
    btnText.style.display = 'none';
    btnLoader.style.display = 'block';
  } else {
    registerBtn.disabled = false;
    btnText.style.display = 'block';
    btnLoader.style.display = 'none';
  }
}

// Handle registration form submission
function handleRegistration(e) {
  e.preventDefault();
  
  // Validate all inputs
  const isNameValid = validateName();
  const isEmailValid = validateEmail();
  const isPasswordValid = validatePassword();
  const isTermsAccepted = termsCheck.checked;
  
  if (!isTermsAccepted) {
    alert('Please accept the Terms & Conditions and Privacy Policy');
    return;
  }
  
  if (!isNameValid || !isEmailValid || !isPasswordValid) {
    return;
  }
  
  // Show loading state
  setLoadingState(true);
  
  // Check if email already exists
  checkEmailExists()
    .then(emailExists => {
      if (emailExists) {
        setLoadingState(false);
        showError(emailInput, 'This email is already registered');
      } else {
        // Proceed with registration
        registerUser();
      }
    })
    .catch(error => {
      setLoadingState(false);
      console.error('Error checking email:', error);
      alert('An error occurred. Please try again.');
    });
}

// Check if email already exists
function checkEmailExists() {
  return fetch(`${API_BASE_URL}/users`)
    .then(res => {
      if (!res.ok) {
        throw new Error('Network response was not ok');
      }
      return res.json();
    })
    .then(data => {
      const email = emailInput.value.trim();
      return data.some(user => user.email === email);
    });
}

// Register new user
function registerUser() {
  const userData = {
    name: nameInput.value.trim(),
    email: emailInput.value.trim(),
    passward: passwordInput.value // Note: Typo in property name to match your API
  };
  
  fetch(`${API_BASE_URL}/users`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(userData),
  })
    .then(res => {
      if (!res.ok) {
        throw new Error('Registration failed');
      }
      return res.json();
    })
    .then(data => {
      console.log('Registration successful:', data);
      
      // Show success animation
      showSuccess();
      
      // Redirect to login page after delay
      setTimeout(() => {
        window.location.href = "login.html";
      }, 1500);
    })
    .catch(error => {
      setLoadingState(false);
      console.error('Registration error:', error);
      alert('Registration failed. Please try again.');
    });
}

// Show success animation
function showSuccess() {
  registerBtn.classList.add('success');
  registerBtn.style.background = 'linear-gradient(to right, #2ecc71, #27ae60)';
  
  const btnText = registerBtn.querySelector('.btn-text');
  btnText.textContent = 'Registration Successful!';
}