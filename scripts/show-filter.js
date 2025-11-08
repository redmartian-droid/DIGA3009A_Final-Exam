// Show filter for homepage sections NB: FIX LINKS IF TIME ALLOWS

let currentUser = null;

// Check if user is logged in
function checkUserLogin() {
  const sessionData = localStorage.getItem("yoanime_session");
  if (sessionData) {
    const session = JSON.parse(sessionData);
    if (session && session.loggedIn) {
      const usersData = localStorage.getItem("yoanime_users");
      if (usersData) {
        const users = JSON.parse(usersData);
        currentUser = users.find((u) => u.id === session.userId);
      }
    }
  }
}

// Fetch and display currently following (for logged-in users)
async function loadCurrentlyFollowing() {
  if (!currentUser || !currentUser.library) return;

  const followingSection = document.querySelector(".currently-following");
  const container = document.getElementById("currently-following");

  // Get all watching anime
  const watchingAnime = currentUser.library.watching || [];

  if (watchingAnime.length > 0) {
    followingSection.style.display = "block";
    container.innerHTML = "";

    // Display up to 10 anime from watching list
    const displayAnime = watchingAnime.slice(0, 5);

    for (const anime of displayAnime) {
      // Fetch full anime data to get complete info
      const apiUrl = `https://kitsu.io/api/edge/anime/${anime.id}`;

      fetch(apiUrl, {
        headers: {
          Accept: "application/vnd.api+json",
          "Content-Type": "application/vnd.api+json",
        },
      })
        .then((response) => response.json())
        .then((data) => {
          const card = createShowCard(data.data);
          container.appendChild(card);
        })
        .catch((error) => {
          console.error("Error fetching anime:", error);
        });
    }
  }
}

// Fetch trending anime
async function loadTrendingAnime() {
  const apiUrl = "https://kitsu.io/api/edge/trending/anime?limit=5";

  fetch(apiUrl, {
    headers: {
      Accept: "application/vnd.api+json",
      "Content-Type": "application/vnd.api+json",
    },
  })
    .then((response) => response.json())
    .then((data) => {
      displayInContainer("trending-anime", data.data);
    })
    .catch((error) => {
      console.error("Error fetching trending anime:", error);
    });
}

// Fetch highest rated anime
async function loadHighestRatedAnime() {
  const apiUrl =
    "https://kitsu.io/api/edge/anime?sort=-averageRating&page[limit]=5";

  fetch(apiUrl, {
    headers: {
      Accept: "application/vnd.api+json",
      "Content-Type": "application/vnd.api+json",
    },
  })
    .then((response) => response.json())
    .then((data) => {
      displayInContainer("highest-rated-anime", data.data);
    })
    .catch((error) => {
      console.error("Error fetching highest rated anime:", error);
    });
}

// Fetch most popular anime
async function loadMostPopularAnime() {
  const apiUrl =
    "https://kitsu.io/api/edge/anime?sort=-userCount&page[limit]=5";

  fetch(apiUrl, {
    headers: {
      Accept: "application/vnd.api+json",
      "Content-Type": "application/vnd.api+json",
    },
  })
    .then((response) => response.json())
    .then((data) => {
      displayInContainer("most-popular-anime", data.data);
    })
    .catch((error) => {
      console.error("Error fetching most popular anime:", error);
    });
}

// Fetch trending manga
async function loadTrendingManga() {
  const apiUrl = "https://kitsu.io/api/edge/trending/manga?limit=5";

  fetch(apiUrl, {
    headers: {
      Accept: "application/vnd.api+json",
      "Content-Type": "application/vnd.api+json",
    },
  })
    .then((response) => response.json())
    .then((data) => {
      displayInContainer("trending-manga", data.data, "manga");
    })
    .catch((error) => {
      console.error("Error fetching trending manga:", error);
    });
}

// Fetch highest rated manga
async function loadHighestRatedManga() {
  const apiUrl =
    "https://kitsu.io/api/edge/manga?sort=-averageRating&page[limit]=5";

  fetch(apiUrl, {
    headers: {
      Accept: "application/vnd.api+json",
      "Content-Type": "application/vnd.api+json",
    },
  })
    .then((response) => response.json())
    .then((data) => {
      displayInContainer("highest-rated-manga", data.data, "manga");
    })
    .catch((error) => {
      console.error("Error fetching highest rated manga:", error);
    });
}

// Fetch most popular manga
async function loadMostPopularManga() {
  const apiUrl =
    "https://kitsu.io/api/edge/manga?sort=-userCount&page[limit]=5";

  fetch(apiUrl, {
    headers: {
      Accept: "application/vnd.api+json",
      "Content-Type": "application/vnd.api+json",
    },
  })
    .then((response) => response.json())
    .then((data) => {
      displayInContainer("most-popular-manga", data.data, "manga");
    })
    .catch((error) => {
      console.error("Error fetching most popular manga:", error);
    });
}

// Display anime/manga in container
function displayInContainer(containerId, items, type = "anime") {
  const container = document.getElementById(containerId);
  container.innerHTML = "";

  items.forEach((item) => {
    const card =
      type === "manga" ? createMangaCard(item) : createShowCard(item);
    container.appendChild(card);
  });
}

// Create manga card (similar to what we did in show-card.js, thank you modularity 〒▽〒)
function createMangaCard(manga) {
  const card = document.createElement("div");
  card.className = "show-card";

  const attributes = manga.attributes;
  const imageUrl =
    attributes.posterImage?.medium || attributes.posterImage?.small || "";
  const title =
    attributes.titles.en ||
    attributes.titles.en_jp ||
    attributes.canonicalTitle ||
    "Unknown Title";

  const img = document.createElement("img");
  img.src = imageUrl;
  img.alt = title;
  img.onerror = function () {
    this.src = "/images/show-card.jpg";
  };

  const titleElement = document.createElement("h3");
  titleElement.textContent = title;

  // Redirect to manga page on click
  card.addEventListener("click", () => {
    localStorage.setItem("selectedManga", JSON.stringify(manga));

    // Navigate to the manga details page
    window.location.href = "manga-page/index.html?id=" + manga.id;
  });

  card.appendChild(img);
  card.appendChild(titleElement);

  return card;
}

// Initialise all sections
async function initializeHomepage() {
  checkUserLogin();

  // Load all sections
  await loadCurrentlyFollowing();
  await loadTrendingAnime();
  await loadHighestRatedAnime();
  await loadMostPopularAnime();
  await loadTrendingManga();
  await loadHighestRatedManga();
  await loadMostPopularManga();
}

// Start loading when page loads
initializeHomepage();
