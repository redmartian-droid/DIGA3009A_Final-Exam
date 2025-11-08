// Hardcoded user credentials because using the Kitsu API for authentication is not feasible, rather it'd take too long to implement properly
const VALID_USER = {
  id: "user001",
  username: "thoriso45",
  password: "demo123",
  avatar: "/images/character-image.png",
  library: {
    watching: [],
    completed: [],
    planToWatch: [],
    onHold: [],
    dropped: [],
  },
};

// Get form elements
const loginForm = document.querySelector("form");
const usernameInput = document.querySelector('input[type="text"]');
const passwordInput = document.querySelector('input[type="password"]');
const loginButton = document.querySelector('button[type="submit"]');

// Handle login
loginButton.addEventListener("click", function (e) {
  e.preventDefault();

  const enteredUsername = usernameInput.value.trim();
  const enteredPassword = passwordInput.value.trim();

  // Check if credentials match
  if (
    enteredUsername === VALID_USER.username &&
    enteredPassword === VALID_USER.password
  ) {
    // Create session object
    const session = {
      loggedIn: true,
      userId: VALID_USER.id,
      username: VALID_USER.username,
    };

    // Store session and user data in localStorage
    localStorage.setItem("yoanime_session", JSON.stringify(session));

    // Store users array with the valid user
    const users = [VALID_USER];
    localStorage.setItem("yoanime_users", JSON.stringify(users));

    const profilePath = `${window.location.origin}/profile/index.html`;
    window.location.href = profilePath;
  } else {
    alert("Login details entered incorrectly. Please try again.");
  }
});

// Optional: Handle Enter key on form
loginForm.addEventListener("submit", function (e) {
  e.preventDefault();
  loginButton.click();
});
