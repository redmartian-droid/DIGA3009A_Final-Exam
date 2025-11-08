// Profile page with fake authentication and localStorage library
let currentUserData = null;
let currentLibrary = [];

// Check if user is logged in
const sessionData = localStorage.getItem("yoanime_session");
if (!sessionData) {
  alert("Please log in to view your profile.");
  window.location.href = "login/index.html";
}

const session = JSON.parse(sessionData);
if (!session || !session.loggedIn) {
  alert("Please log in to view your profile.");
  window.location.href = "login/index.html";
}

// Get user data
function getUserData() {
  const usersData = localStorage.getItem("yoanime_users");
  if (!usersData) {
    alert("User not found. Please log in again.");
    localStorage.removeItem("yoanime_session");
    window.location.href = "login/index.html";
    return null;
  }

  const users = JSON.parse(usersData);
  const user = users.find((u) => u.id === session.userId);

  if (!user) {
    alert("User not found. Please log in again.");
    localStorage.removeItem("yoanime_session");
    window.location.href = "login/index.html";
    return null;
  }

  return user;
}

// Initialise profile
function initProfile() {
  currentUserData = getUserData();
  if (!currentUserData) return;

  displayProfileHeader(currentUserData);
  displayFilterButtons();
  loadUserLibrary();
}

// Display profile header
function displayProfileHeader(userData) {
  const profileHero = document.querySelector(".profile-hero");
  const profileImgSection = document.querySelector(".profile-img-section");

  // Set page title
  document.title = `Yo!Anime - ${userData.username}`;

  // Create profile image
  profileImgSection.innerHTML = "";
  const profileImg = document.createElement("img");
  profileImg.className = "profile-img";
  profileImg.src = userData.avatar || "images/character-image.png";
  profileImg.alt = "Profile Image";
  profileImgSection.appendChild(profileImg);

  // Create username display
  const usernameDisplay = document.createElement("h1");
  usernameDisplay.className = "username";
  usernameDisplay.textContent = userData.username;
  profileHero.appendChild(usernameDisplay);
}

// Display filter buttons
function displayFilterButtons() {
  const filterButtons = document.querySelector(".filter-buttons");
  filterButtons.innerHTML = "";
  const filters = [
    "All",
    "Watching/Reading",
    "Completed",
    "Plan to Watch/Read",
  ];

  filters.forEach((filter) => {
    const button = document.createElement("button");
    button.className = "filter-btn";
    button.textContent = filter;
    button.addEventListener("click", () => filterLibrary(filter));
    filterButtons.appendChild(button);
  });

  // Set first button as active
  filterButtons.querySelector(".filter-btn").classList.add("active");
}

// Load user's anime library from localStorage
function loadUserLibrary() {
  if (!currentUserData || !currentUserData.library) {
    currentLibrary = [];
    displayLibraryContent("All", []);
    return;
  }

  // Combine all library statuses into one array with status info
  currentLibrary = [
    ...currentUserData.library.watching.map((item) => ({
      ...item,
      status: "watching",
    })),
    ...currentUserData.library.completed.map((item) => ({
      ...item,
      status: "completed",
    })),
    ...currentUserData.library.planToWatch.map((item) => ({
      ...item,
      status: "planToWatch",
    })),
  ];

  displayLibraryContent("All", currentLibrary);
}

// Filter library
function filterLibrary(status) {
  // Remove active class from all buttons
  document
    .querySelectorAll(".filter-btn")
    .forEach((btn) => btn.classList.remove("active"));
  // Add active class to clicked button
  event.target.classList.add("active");

  let filteredLibrary = currentLibrary;

  if (status !== "All") {
    const statusMap = {
      "Watching/Reading": "watching",
      Completed: "completed",
      "Plan to Watch/Read": "planToWatch",
    };

    filteredLibrary = currentLibrary.filter(
      (item) => item.status === statusMap[status]
    );
  }

  displayLibraryContent(status, filteredLibrary);
}

// Display library content
function displayLibraryContent(status, library) {
  const contentSection = document.querySelector(".content");
  contentSection.innerHTML = "";

  if (library.length === 0) {
    contentSection.innerHTML = `<p>No content found in ${status.toLowerCase()}.</p>`;
    return;
  }

  library.forEach((item) => {
    const itemCard = document.createElement("div");
    itemCard.className = "show-card";
    itemCard.style.cursor = "pointer";

    // Add click handler to navigate to show details
    itemCard.addEventListener("click", () => {
      const contentType = item.type || "anime";
      const pagePath =
        contentType === "manga"
          ? "manga-page/index.html"
          : "show-page/index.html";
      window.location.href = `${pagePath}?id=${item.id}`;
    });

    // Create image element
    const itemImage = document.createElement("img");
    itemImage.className = "anime-image";
    itemImage.src = item.posterImage || "images/show-card.jpg";
    itemImage.alt = item.title;
    itemImage.onerror = function () {
      this.src = "images/show-card.jpg";
    };

    const itemTitle = document.createElement("h3");
    itemTitle.className = "anime-title";
    itemTitle.textContent = item.title;

    const itemStatus = document.createElement("p");
    itemStatus.className = "anime-status";
    const contentTypeLabel = item.type === "manga" ? "Manga" : "Anime";
    itemStatus.textContent = `${contentTypeLabel} • ${formatStatus(
      item.status,
      item.type
    )}`;

    itemCard.appendChild(itemImage);
    itemCard.appendChild(itemTitle);
    itemCard.appendChild(itemStatus);
    contentSection.appendChild(itemCard);
  });
}

// Format status for display
function formatStatus(status, contentType) {
  const statusMap = {
    watching: contentType === "manga" ? "Reading" : "Watching",
    completed: "Completed",
    planToWatch: contentType === "manga" ? "Plan to Read" : "Plan to Watch",
  };
  return statusMap[status] || status;
}

// Add logout functionality
function addLogoutButton() {
  const profileHero = document.querySelector(".profile-hero");
  const logoutBtn = document.createElement("button");
  logoutBtn.className = "logout-btn";
  logoutBtn.textContent = "Logout";

  logoutBtn.addEventListener("click", () => {
    if (confirm("Are you sure you want to logout?")) {
      localStorage.removeItem("yoanime_session");
      localStorage.removeItem("yoanime_users");
      window.location.href = "login/index.html";
    }
  });
  profileHero.appendChild(logoutBtn);
}

// Initialise profile page
initProfile();
addLogoutButton();
