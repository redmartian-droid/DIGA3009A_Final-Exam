// Generate header menu with search functionality
function createNavbar(title) {
  return `
    <div class="navbar">
    <div class = "group-1">
      <div id="hamburger-icon" onclick="toggleMobileMenu(this)">
        <div class="bar1"></div>
        <div class="bar2"></div>
        <div class="bar3"></div>
        <ul class="auth-menu">
          <li><a href="/login/index.html">Log In</a></li>
          <li><a href="/signup/index.html">Sign Up</a></li>
        </ul>
      </div>

     <h1><a href="/">${title}</a></h1>

     </div>
      
      <div class="search-wrapper">
        <input class="search-field" type="search" id="search" autocomplete="off">
        
       <!-- Search results container -->
        <div id="search-results" class="search-results" style="display: none;">
          <div class="search-results-content"></div>
        </div>
      </div>
      
      <a href="/profile/index.html">
      <img class="profile-img" src="images/character-image.png" alt="Profile">
       </a>
    </div>`;
}

const header = document.querySelector("header");
header.innerHTML = createNavbar("Yo!Anime");

// Menu toggle functionality
function toggleMobileMenu(menu) {
  menu.classList.toggle("open");

  var blur = document.getElementById("blur");
  if (blur) {
    blur.classList.toggle("active");
  }
}

// Global Search Functionality
const searchInput = document.getElementById("search");
const searchResults = document.getElementById("search-results");
const searchResultsContent = searchResults?.querySelector(
  ".search-results-content"
);

let searchTimeout = null;
let currentQuery = "";

function initializeSearch() {
  if (!searchInput) return;

  // Real-time search as user types
  searchInput.addEventListener("input", (e) => {
    clearTimeout(searchTimeout);
    const query = e.target.value.trim();

    if (query.length >= 2) {
      searchTimeout = setTimeout(() => performSearch(query), 300);
    } else {
      hideSearchResults();
    }
  });

  // Search on Enter key
  searchInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      const query = searchInput.value.trim();
      if (query.length >= 2) {
        performSearch(query);
      }
    }
  });

  // Hide results when clicking outside
  document.addEventListener("click", (e) => {
    if (!e.target.closest(".search-wrapper")) {
      hideSearchResults();
    }
  });

  // Show results when clicking in search input (if we have cached results)
  searchInput.addEventListener("focus", () => {
    if (searchResultsContent?.children.length > 0) {
      showSearchResults();
    }
  });
}

async function performSearch(query) {
  if (query === currentQuery) return;
  currentQuery = query;

  showSearchLoading();

  try {
    // Search both anime and manga
    const [animeResponse, mangaResponse] = await Promise.all([
      fetch(
        `https://kitsu.io/api/edge/anime?filter[text]=${encodeURIComponent(
          query
        )}&page[limit]=5`
      ),
      fetch(
        `https://kitsu.io/api/edge/manga?filter[text]=${encodeURIComponent(
          query
        )}&page[limit]=5`
      ),
    ]);

    const animeData = await animeResponse.json();
    const mangaData = await mangaResponse.json();

    const results = [
      ...animeData.data.map((item) => ({ ...item, type: "anime" })),
      ...mangaData.data.map((item) => ({ ...item, type: "manga" })),
    ];

    displaySearchResults(results);
  } catch (error) {
    console.error("Search error:", error);
    showSearchError();
  }
}

function showSearchLoading() {
  searchResultsContent.innerHTML =
    '<div class="search-loading">Searching...</div>';
  showSearchResults();
}

function showSearchError() {
  searchResultsContent.innerHTML =
    '<div class="search-no-results">Error loading results. Please try again.</div>';
  showSearchResults();
}

function displaySearchResults(results) {
  if (results.length === 0) {
    searchResultsContent.innerHTML =
      '<div class="search-no-results">No results found</div>';
    showSearchResults();
    return;
  }

  searchResultsContent.innerHTML = results
    .map((item) => {
      const attrs = item.attributes;
      const title =
        attrs.canonicalTitle ||
        attrs.titles?.en ||
        attrs.titles?.en_jp ||
        "Unknown Title";

      return `
      <a href="/show-page/index.html?type=${item.type}&id=${item.id}" class="search-result-item">
        <div class="search-result-title">${title}</div>
      </a>
    `;
    })
    .join("");

  showSearchResults();
}

function showSearchResults() {
  searchResults.style.display = "block";
}

function hideSearchResults() {
  searchResults.style.display = "none";
}

// Initialise search after header is created
initializeSearch();
