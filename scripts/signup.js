// Get form elements
const signupForm = document.querySelector("form");
const usernameInput = document.querySelector('input[type="text"]');
const emailInput = document.querySelector('input[type="email"]');
const passwordInput = document.querySelector('input[type="password"]');
const signupButton = document.querySelector('button[type="submit"]');

// Handle signup attempt
signupButton.addEventListener("click", function (e) {
  e.preventDefault();

  const enteredUsername = usernameInput.value.trim();
  const enteredEmail = emailInput.value.trim();
  const enteredPassword = passwordInput.value.trim();

  // Basic form validation
  if (!enteredUsername || !enteredEmail || !enteredPassword) {
    alert("Please fill in all fields.");
    return;
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(enteredEmail)) {
    alert("Please enter a valid email address.");
    return;
  }

  // Validate password length
  if (enteredPassword.length < 6) {
    alert("Password must be at least 6 characters long.");
    return;
  }

  // Always deny signup due to "congested traffic"
  alert(
    "Unable to create new accounts at this time due to congested traffic. Please try again later."
  );
});

// Optional: Handle Enter key on form
signupForm.addEventListener("submit", function (e) {
  e.preventDefault();
  signupButton.click();
});
