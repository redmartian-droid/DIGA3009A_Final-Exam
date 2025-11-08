// Detect if we're on anime or manga page
function getContentType() {
  return window.location.pathname.includes("manga-page") ? "manga" : "anime"; // using this as an if statement is simpler than having two separate files; might come back to bite me later but time constrants
}

// Get content data from localStorage or fetch from API
async function loadContentDetails() {
  const contentType = getContentType();
  const urlParams = new URLSearchParams(window.location.search);
  const contentId = urlParams.get("id");

  // Try to get from localStorage first
  const storageKey =
    contentType === "manga" ? "selectedManga" : "selectedAnime";
  let content = JSON.parse(localStorage.getItem(storageKey));

  // If not in localStorage or ID doesn't match, fetch from API
  if (!content || content.id !== contentId) {
    content = await fetchContentById(contentId, contentType);
  }

  if (content) {
    populateShowDetails(content, contentType);
    initializeTabs();
  }
}

// Library management stuff
function initializeLibraryButtons(content, contentType) {
  const btnCompleted = document.querySelector(".btn-completed");
  const btnWatchlist = document.querySelector(".btn-watchlist");
  const btnWatching = document.querySelector(".btn-watching");

  // Check current status and update button states
  updateButtonStates(content.id, contentType);

  // Add event listeners with appropriate categories
  btnCompleted.addEventListener("click", () =>
    addToLibrary(content, "completed", contentType)
  );
  btnWatchlist.addEventListener("click", () =>
    addToLibrary(content, "planToWatch", contentType)
  );
  btnWatching.addEventListener("click", () =>
    addToLibrary(content, "watching", contentType)
  );
}

function addToLibrary(content, status, contentType) {
  // Check if user is logged in
  const sessionData = localStorage.getItem("yoanime_session");
  if (!sessionData) {
    alert(`Please log in to add ${contentType} to your library.`);
    window.location.href = "/login/index.html";
    return;
  }

  const session = JSON.parse(sessionData);
  const usersData = localStorage.getItem("yoanime_users");

  if (!usersData) {
    alert("Please log in again.");
    return;
  }

  const users = JSON.parse(usersData);
  const userIndex = users.findIndex((u) => u.id === session.userId);

  if (userIndex === -1) {
    alert("User not found.");
    return;
  }

  // Initialise library if it doesn't exist
  if (!users[userIndex].library) {
    users[userIndex].library = {
      watching: [],
      completed: [],
      planToWatch: [],
      onHold: [],
      dropped: [],
    };
  }

  // Create content object with necessary data
  const contentData = {
    id: content.id,
    type: contentType,
    title:
      content.attributes.titles.en ||
      content.attributes.titles.en_jp ||
      content.attributes.canonicalTitle,
    posterImage:
      content.attributes.posterImage?.medium ||
      content.attributes.posterImage?.large ||
      content.attributes.posterImage?.original ||
      "",
  };

  // Remove from all categories first (to avoid duplicates)
  const library = users[userIndex].library;
  const allStatuses = [
    "watching",
    "completed",
    "planToWatch",
    "onHold",
    "dropped",
  ];

  allStatuses.forEach((s) => {
    library[s] = library[s].filter((a) => a.id !== content.id);
  });

  // Add to the selected category
  library[status].push(contentData);

  // Save back to localStorage
  localStorage.setItem("yoanime_users", JSON.stringify(users));

  // Update button states
  updateButtonStates(content.id, contentType);

  // Show confirmation with appropriate text
  const statusNames = {
    watching:
      contentType === "manga" ? "Currently Reading" : "Currently Watching",
    completed: "Completed",
    planToWatch: contentType === "manga" ? "Plan to Read" : "Plan to Watch",
    onHold: "On Hold",
    dropped: "Dropped",
  };
  alert(`Added to ${statusNames[status]}!`);
}

function updateButtonStates(contentId, contentType) {
  const sessionData = localStorage.getItem("yoanime_session");
  if (!sessionData) return;

  const session = JSON.parse(sessionData);
  const usersData = localStorage.getItem("yoanime_users");
  if (!usersData) return;

  const users = JSON.parse(usersData);
  const user = users.find((u) => u.id === session.userId);

  if (!user || !user.library) return;

  const btnCompleted = document.querySelector(".btn-completed");
  const btnWatchlist = document.querySelector(".btn-watchlist");
  const btnWatching = document.querySelector(".btn-watching");

  // Reset all buttons with appropriate text
  const watchingText =
    contentType === "manga" ? "Started Reading" : "Started Watching";
  const watchlistText =
    contentType === "manga" ? "Add to Readlist" : "Add to Watchlist";

  [btnCompleted, btnWatchlist, btnWatching].forEach((btn) => {
    btn.style.opacity = "1";
    btn.textContent = btn.className.includes("completed")
      ? "Completed"
      : btn.className.includes("watchlist")
      ? watchlistText
      : watchingText;
  });

  // Check which category the content is in
  if (user.library.completed.some((a) => a.id === contentId)) {
    btnCompleted.textContent = "✓ Completed";
    btnCompleted.style.opacity = "0.7";
  }
  if (user.library.planToWatch.some((a) => a.id === contentId)) {
    btnWatchlist.textContent =
      contentType === "manga" ? "✓ In Readlist" : "✓ In Watchlist";
    btnWatchlist.style.opacity = "0.7";
  }
  if (user.library.watching.some((a) => a.id === contentId)) {
    btnWatching.textContent =
      contentType === "manga" ? "✓ Reading" : "✓ Watching";
    btnWatching.style.opacity = "0.7";
  }
}

// Fetch content by ID from API
async function fetchContentById(id, contentType) {
  const apiUrl = `https://kitsu.io/api/edge/${contentType}/${id}`;

  return fetch(apiUrl, {
    headers: {
      Accept: "application/vnd.api+json",
      "Content-Type": "application/vnd.api+json",
    },
  })
    .then((response) => response.json())
    .then((data) => data.data)
    .catch((error) => {
      console.error(`Error fetching ${contentType}:`, error);
      return null;
    });
}

// Helper function to create image elements with error handling
function createImageElement(src, alt, className) {
  const img = document.createElement("img");
  img.src = src;
  img.alt = alt;
  img.className = className;
  img.onerror = function () {
    this.src = "/images/show-thumbnail.png";
    console.warn(`Failed to load image: ${src}, using fallback`);
  };
  return img;
}

// Populate all show details
function populateShowDetails(content, contentType) {
  const attributes = content.attributes;

  const heroBanner = document.querySelector(".hero-banner");
  heroBanner.innerHTML = "";

  const coverImage = getCoverImage(attributes);
  if (coverImage) {
    const heroImg = createImageElement(
      coverImage,
      `${contentType} banner`,
      "hero-image"
    );
    heroBanner.appendChild(heroImg);
  } else {
    const defaultHero = createImageElement(
      "/images/show-banner.png", // forgot to change from .jpg to .png
      "Default show banner",
      "hero-image"
    );
    heroBanner.appendChild(defaultHero);
  }

  const posterContainer = document.querySelector(".poster-image");
  posterContainer.innerHTML = "";

  const posterUrl = getPosterImage(attributes);
  if (posterUrl) {
    const posterImg = createImageElement(
      posterUrl,
      `${contentType} poster`,
      "poster-img"
    );
    posterContainer.appendChild(posterImg);
  } else {
    const defaultPoster = createImageElement(
      "/images/show-card.png",
      "Default show card",
      "poster-img"
    );
    posterContainer.appendChild(defaultPoster);
  }

  // Title and year
  const title =
    attributes.titles.en ||
    attributes.titles.en_jp ||
    attributes.canonicalTitle ||
    "Unknown Title";
  document.querySelector(".show-title").textContent = title;

  const year = attributes.startDate
    ? new Date(attributes.startDate).getFullYear()
    : "";
  document.querySelector(".show-year").textContent = year;

  // Synopsis
  const synopsis =
    attributes.synopsis ||
    attributes.description ||
    "No description available.";
  document.querySelector(".synopsis").textContent = synopsis;

  // Details sidebar
  populateDetailsInfo(attributes, contentType);

  // Load additional data
  if (contentType === "anime") {
    loadEpisodes(content.id);
  } else {
    loadChapters(content.id);
  }
  loadCharacters(content.id, contentType);
  loadReactions(contentType);
  loadComments(contentType);

  initializeLibraryButtons(content, contentType);
}

// Helper functions for image URL extraction
function getCoverImage(attributes) {
  return (
    attributes.coverImage?.large ||
    attributes.coverImage?.original ||
    attributes.coverImage?.meta?.large ||
    ""
  );
}

function getPosterImage(attributes) {
  return (
    attributes.posterImage?.large ||
    attributes.posterImage?.medium ||
    attributes.posterImage?.original ||
    attributes.posterImage?.meta?.large ||
    ""
  );
}

// Populate details sidebar
function populateDetailsInfo(attributes, contentType) {
  const detailsDiv = document.querySelector(".details-info");
  detailsDiv.innerHTML = "";

  const details = [
    { label: "English", value: attributes.titles.en || "N/A" },
    { label: "Japanese", value: attributes.titles.ja_jp || "N/A" },
    { label: "Japanese (Romaji)", value: attributes.titles.en_jp || "N/A" },
    {
      label: "Synonyms",
      value: attributes.abbreviatedTitles?.join(", ") || "N/A",
    },
    {
      label: "Type",
      value: attributes.showType || attributes.mangaType || "N/A",
    },
    {
      label: contentType === "manga" ? "Chapters" : "Episodes",
      value: attributes.chapterCount || attributes.episodeCount || "N/A",
    },
    { label: "Status", value: attributes.status || "N/A" },
    {
      label: contentType === "manga" ? "Published" : "Aired",
      value: attributes.startDate || "N/A",
    },
    {
      label: "Season",
      value:
        `${attributes.season || ""} ${attributes.seasonYear || ""}`.trim() ||
        "N/A",
    },
  ];

  details.forEach((detail) => {
    const detailItem = document.createElement("div");
    detailItem.className = "detail-item";
    detailItem.innerHTML = `
      <span class="detail-label">${detail.label}</span>
      <span class="detail-value">${detail.value}</span>
    `;
    detailsDiv.appendChild(detailItem);
  });
}

// Load episodes (for anime)
async function loadEpisodes(animeId) {
  const apiUrl = `https://kitsu.io/api/edge/anime/${animeId}/episodes`;

  fetch(apiUrl, {
    headers: {
      Accept: "application/vnd.api+json",
      "Content-Type": "application/vnd.api+json",
    },
  })
    .then((response) => response.json())
    .then((data) => {
      displayEpisodes(data.data);
    })
    .catch((error) => {
      console.error("Error fetching episodes:", error);
      displayEpisodes([]);
    });
}

// Load chapters (for manga)
async function loadChapters(mangaId) {
  const apiUrl = `https://kitsu.io/api/edge/manga/${mangaId}/chapters`;

  fetch(apiUrl, {
    headers: {
      Accept: "application/vnd.api+json",
      "Content-Type": "application/vnd.api+json",
    },
  })
    .then((response) => response.json())
    .then((data) => {
      displayEpisodes(data.data, true); // Reuse display function with manga flag
    })
    .catch((error) => {
      console.error("Error fetching chapters:", error);
      displayEpisodes([], true);
    });
}

// Display episodes/chapters
function displayEpisodes(items, isManga = false) {
  const episodesList = document.querySelector(".episodes-list");

  if (!items || items.length === 0) {
    episodesList.innerHTML = `<p class="no-data">No ${
      isManga ? "chapter" : "episode"
    } information available.</p>`;
    return;
  }

  episodesList.innerHTML = "";

  items.forEach((item) => {
    const attributes = item.attributes;
    const itemCard = document.createElement("div");
    itemCard.className = "episode-card";

    const thumbnail = attributes.thumbnail?.original || "";
    const itemTitle =
      attributes.canonicalTitle || attributes.title || "Untitled";

    // Create thumbnail container
    const thumbnailContainer = document.createElement("div");
    thumbnailContainer.className = "episode-thumbnail";

    if (thumbnail) {
      const thumbnailImg = createImageElement(
        thumbnail,
        `Thumbnail for ${itemTitle}`,
        "episode-thumb-img"
      );
      thumbnailContainer.appendChild(thumbnailImg);
    } else {
      const defaultThumb = createImageElement(
        "/images/show-thumbnail.png",
        "Default show thumbnail",
        "episode-thumb-img"
      );
      thumbnailContainer.appendChild(defaultThumb);
    }

    itemCard.innerHTML = `
      <div class="episode-info">
        <h4>${isManga ? "Chapter" : "Episode"} ${
      attributes.number || "N/A"
    }</h4>
        <p class="episode-title">${itemTitle}</p>
        ${
          !isManga && attributes.length
            ? `<p class="episode-duration">${attributes.length} minutes</p>`
            : ""
        }
        <p class="episode-date">${
          attributes.airdate || attributes.published || ""
        }</p>
        <p class="episode-synopsis">${
          attributes.synopsis ||
          attributes.description ||
          "No description available."
        }</p>
      </div>
    `;

    // Insert thumbnail at the beginning
    itemCard.insertBefore(thumbnailContainer, itemCard.firstChild);
    episodesList.appendChild(itemCard);
  });
}

// Load characters
async function loadCharacters(contentId, contentType) {
  const apiUrl = `https://kitsu.io/api/edge/${contentType}/${contentId}/characters`;

  fetch(apiUrl, {
    headers: {
      Accept: "application/vnd.api+json",
      "Content-Type": "application/vnd.api+json",
    },
  })
    .then((response) => response.json())
    .then((data) => {
      displayCharacters(data.data);
    })
    .catch((error) => {
      console.error("Error fetching characters:", error);
      displayCharacters([]);
    });
}

// Display characters
async function displayCharacters(characters) {
  const charactersGrid = document.querySelector(".characters-grid");

  if (!characters || characters.length === 0) {
    charactersGrid.innerHTML =
      '<p class="no-data">No character information available.</p>';
    return;
  }

  charactersGrid.innerHTML = "";

  // Fetch full character details for each character
  for (const character of characters) {
    const apiUrl = `https://kitsu.io/api/edge/media-characters/${character.id}/character`;

    fetch(apiUrl, {
      headers: {
        Accept: "application/vnd.api+json",
        "Content-Type": "application/vnd.api+json",
      },
    })
      .then((response) => response.json())
      .then((charData) => {
        if (charData.data) {
          const charAttributes = charData.data.attributes;
          const charCard = document.createElement("div");
          charCard.className = "character-card";

          const imageUrl =
            charAttributes.image?.original ||
            charAttributes.image?.large ||
            charAttributes.image?.medium ||
            "";
          const charName =
            charAttributes.name || charAttributes.canonicalName || "Unknown";

          // Create character image container
          const charImageContainer = document.createElement("div");
          charImageContainer.className = "character-image";

          if (imageUrl) {
            const charImg = createImageElement(
              imageUrl,
              `Image of ${charName}`,
              "character-img"
            );
            charImageContainer.appendChild(charImg);
          } else {
            const defaultCharImg = createImageElement(
              "/images/character-image.png",
              `Default image for ${charName}`,
              "character-img"
            );
            charImageContainer.appendChild(defaultCharImg);
          }

          const charNameP = document.createElement("p");
          charNameP.className = "character-name";
          charNameP.textContent = charName;

          charCard.appendChild(charImageContainer);
          charCard.appendChild(charNameP);
          charactersGrid.appendChild(charCard);
        }
      })
      .catch((error) => {
        console.error("Error fetching character details:", error);
      });
  }
}

// Load reactions
async function loadReactions(contentType) {
  const reactionsList = document.querySelector(".reactions-list");
  const urlParams = new URLSearchParams(window.location.search);
  const contentId = urlParams.get("id");
  const apiUrl = `https://kitsu.io/api/edge/${contentType}/${contentId}/reviews`;

  fetch(apiUrl, {
    headers: {
      Accept: "application/vnd.api+json",
      "Content-Type": "application/vnd.api+json",
    },
  })
    .then((response) => response.json())
    .then((data) => {
      if (!data.data || data.data.length === 0) {
        reactionsList.innerHTML =
          '<p class="no-data">No reactions available yet.</p>';
        return;
      }

      reactionsList.innerHTML = "";

      data.data.forEach((review) => {
        const attributes = review.attributes;
        const reactionCard = document.createElement("div");
        reactionCard.className = "reaction-card";
        reactionCard.innerHTML = `
          <p class="reaction-username">User</p>
          <p class="reaction-text">${attributes.content || "No content"}</p>
        `;
        reactionsList.appendChild(reactionCard);
      });
    })
    .catch((error) => {
      console.error("Error fetching reactions:", error);
      reactionsList.innerHTML =
        '<p class="no-data">Unable to load reactions.</p>';
    });
}

// Load comments
async function loadComments(contentType) {
  const commentsList = document.querySelector(".comments-list");
  const urlParams = new URLSearchParams(window.location.search);
  const contentId = urlParams.get("id");
  const apiUrl = `https://kitsu.io/api/edge/comments?filter[postId]=${contentId}&include=user&sort=-createdAt`;

  fetch(apiUrl, {
    headers: {
      Accept: "application/vnd.api+json",
      "Content-Type": "application/vnd.api+json",
    },
  })
    .then((response) => response.json())
    .then((data) => {
      if (!data.data || data.data.length === 0) {
        commentsList.innerHTML =
          '<p class="no-data">No comments available yet.</p>';
        return;
      }

      commentsList.innerHTML = "";

      const included = data.included || [];
      const userMap = {};
      included.forEach((item) => {
        if (item.type === "users") {
          userMap[item.id] = item.attributes;
        }
      });

      data.data.forEach((comment) => {
        const attributes = comment.attributes;
        const userId = comment.relationships?.user?.data?.id;
        const user = userMap[userId];

        const commentCard = document.createElement("div");
        commentCard.className = "comment-card";
        commentCard.innerHTML = `
          <p class="comment-username">${user?.name || "Anonymous"}</p>
          <p class="comment-text">${
            attributes.content || attributes.contentFormatted || "No content"
          }</p>
        `;
        commentsList.appendChild(commentCard);
      });
    })
    .catch((error) => {
      console.error("Error fetching comments:", error);
      commentsList.innerHTML =
        '<p class="no-data">Unable to load comments at this time.</p>';
    });
}

// Initialise tab functionality
function initializeTabs() {
  const tabButtons = document.querySelectorAll(".tab-btn");
  const tabPanels = document.querySelectorAll(".tab-panel");

  tabButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const targetTab = button.getAttribute("data-tab");

      // Remove active class from all buttons and panels
      tabButtons.forEach((btn) => btn.classList.remove("active"));
      tabPanels.forEach((panel) => panel.classList.remove("active"));

      // Add active class to clicked button and corresponding panel
      button.classList.add("active");
      document
        .querySelector(`[data-panel="${targetTab}"]`)
        .classList.add("active");
    });
  });
}

// Initialise the page
loadContentDetails();
