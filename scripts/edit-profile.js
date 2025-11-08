// TO-DO
// Fix signup and login scripts to properly interact with Kitsu API NB: Gave up on this due to time constraints and complexity of API authentication
// Ensure proper error handling and user feedback mechanisms are in place

// Edit Profile page with fake authentication
let currentUserData = null;

// Check if user is logged in
const sessionData = localStorage.getItem("yoanime_session");
if (!sessionData) {
  alert("Please log in to edit your profile.");
  window.location.href = "/login/index.html";
}

const session = JSON.parse(sessionData);
if (!session || !session.loggedIn) {
  alert("Please log in to edit your profile.");
  window.location.href = "/login/index.html";
}

// Get user data
function getUserData() {
  const usersData = localStorage.getItem("yoanime_users");
  if (!usersData) {
    alert("User not found. Please log in again.");
    localStorage.removeItem("yoanime_session");
    window.location.href = "/login/index.html";
    return null;
  }

  const users = JSON.parse(usersData);
  const user = users.find((u) => u.id === session.userId);

  if (!user) {
    alert("User not found. Please log in again.");
    localStorage.removeItem("yoanime_session");
    window.location.href = "/login/index.html";
    return null;
  }

  return user;
}

// Fetch and display user profile
function fetchUserProfile() {
  currentUserData = getUserData();
  if (!currentUserData) return;

  displayEditForm(currentUserData);
  displayAvatar(currentUserData);
}

// Display edit form
function displayEditForm(userData) {
  const formSection = document.querySelector(".form-section");
  formSection.innerHTML = "";

  // Email field
  const emailLabel = document.createElement("label");
  emailLabel.textContent = "Email";
  emailLabel.className = "form-label";

  const emailInput = document.createElement("input");
  emailInput.type = "email";
  emailInput.className = "form-input";
  emailInput.value = userData.email || "";
  emailInput.id = "email-input";

  // Username field
  const nameLabel = document.createElement("label");
  nameLabel.textContent = "Username";
  nameLabel.className = "form-label";

  const nameInput = document.createElement("input");
  nameInput.type = "text";
  nameInput.className = "form-input";
  nameInput.value = userData.username || "";
  nameInput.id = "username-input";

  // Change Password field
  const passwordLabel = document.createElement("label");
  passwordLabel.textContent = "Change Password";
  passwordLabel.className = "form-label";

  const passwordInput = document.createElement("input");
  passwordInput.type = "password";
  passwordInput.className = "form-input";
  passwordInput.placeholder = "Leave blank to keep current password";
  passwordInput.id = "password-input";

  // Save button
  const saveButton = document.createElement("button");
  saveButton.className = "save-button";
  saveButton.textContent = "Save";
  saveButton.addEventListener("click", saveProfile);

  formSection.appendChild(emailLabel);
  formSection.appendChild(emailInput);
  formSection.appendChild(nameLabel);
  formSection.appendChild(nameInput);
  formSection.appendChild(passwordLabel);
  formSection.appendChild(passwordInput);
  formSection.appendChild(saveButton);
}

// Display avatar
function displayAvatar(userData) {
  const avatarSection = document.querySelector(".img-section");
  avatarSection.innerHTML = "";

  const avatarContainer = document.createElement("div");
  avatarContainer.className = "user-img-display";

  const avatar = document.createElement("img");
  avatar.className = "profile-img";
  avatar.src = userData.avatar || "/images/character-image.png";
  avatar.alt = "User Image";

  const editIcon = document.createElement("div");
  editIcon.className = "edit-icon";
  editIcon.innerHTML = "&#9998;";
  editIcon.addEventListener("click", () => {
    alert("Image upload coming soon!");
  });

  avatarContainer.appendChild(avatar);
  avatarContainer.appendChild(editIcon);
  avatarSection.appendChild(avatarContainer);
}

// Save profile changes
function saveProfile() {
  if (!currentUserData) {
    alert("User data not loaded.");
    return;
  }

  const email = document.getElementById("email-input").value.trim();
  const username = document.getElementById("username-input").value.trim();
  const password = document.getElementById("password-input").value.trim();

  // Validate inputs
  if (!email || !username) {
    alert("Email and username are required.");
    return;
  }

  if (!email.includes("@")) {
    alert("Please enter a valid email address.");
    return;
  }

  if (password && password.length < 6) {
    alert("Password must be at least 6 characters.");
    return;
  }

  // Get all users
  const users = JSON.parse(localStorage.getItem("yoanime_users") || "[]");

  // Find and update the current user
  const userIndex = users.findIndex((u) => u.id === currentUserData.id);
  if (userIndex === -1) {
    alert("User not found.");
    return;
  }

  users[userIndex].email = email;
  users[userIndex].username = username;
  if (password) {
    users[userIndex].password = password;
  }

  // Save to localStorage
  localStorage.setItem("yoanime_users", JSON.stringify(users));

  // Update session
  session.email = email;
  session.username = username;
  localStorage.setItem("yoanime_session", JSON.stringify(session));

  alert("Profile updated successfully!");
  window.location.href = "/profile/index.html";
}

// Initialise edit profile page
fetchUserProfile();
