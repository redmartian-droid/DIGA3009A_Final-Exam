// Fetch anime data from Kitsu API
async function fetchAnimeData() {
  const apiUrl = "https://kitsu.io/api/edge/anime?page[limit]=5"; // Kitsu API endpoint here, documentation is a bit confusing. API key may be needed for log in functionality, confirm. NB: Couldn't find page relating to API keys and such, just use fake data

  fetch(apiUrl, {
    headers: {
      Accept: "application/vnd.api+json",
      "Content-Type": "application/vnd.api+json", // NB: important for when I figure out the login documentation, do NOT remove
    },
  })
    .then((response) => response.json())
    .then((data) => {
      displayAnime(data.data);
    })
    .catch((error) => {
      console.error("Error fetching anime:", error);
    }); // API fetching logic; prompted change due to the coding test, this looks the cleanest for me
}

// Display my show cards
function displayAnime(animeList) {
  const contentDiv = document.querySelector(".content");
  contentDiv.innerHTML = "";

  animeList.forEach((anime) => {
    const card = createShowCard(anime);
    contentDiv.appendChild(card); // confirm usage inside of content div class
  });
}

// Create a show card
function createShowCard(anime) {
  const card = document.createElement("div");
  card.className = "show-card";

  const attributes = anime.attributes;
  const imageUrl =
    attributes.posterImage?.medium || attributes.posterImage?.small || ""; // fallbacks if one doesn't load or is missing=TRUE
  const title =
    attributes.titles.en ||
    attributes.titles.en_jp ||
    attributes.canonicalTitle ||
    "Unknown Title"; // fallbacks if one doesn't load or is missing=TRUE

  const img = document.createElement("img");
  img.src = imageUrl;
  img.alt = title; // image settings, also acts as how we initialise it on page

  const titleElement = document.createElement("h3");
  titleElement.textContent = title; // title related content is initialised here

  // Create popup container
  const popup = createPopup(attributes);

  // Add click event to show popup, changed to hover to account for navigaion logic clash
  //card.addEventListener("mouseover", () => {
  // clearTimeout(popupTimeout); /// added to fix popup timing issues
  // showPopup(popup);
  //});

  card.addEventListener("mouseout", () => {
    popupTimeout = setTimeout(() => {
      removePopup(popup);
    }, 300);
  });

  // Add basic data rerouting navigation NB:this interferes with popup logic
  card.addEventListener("click", () => {
    navigateToDetails(anime);
  });

  card.appendChild(img);
  card.appendChild(titleElement); // confirm usage inside of card

  return card;
}

// Send to details page with anime data
function navigateToDetails(anime) {
  // Store anime data
  localStorage.setItem("selectedAnime", JSON.stringify(anime));

  // Send user to details page using anime ID
  window.location.href = `show-page/index.html?id=${anime.id}`;
}

// Create popup element with anime details
function createPopup(attributes) {
  const popup = document.createElement("div");
  popup.className = "popup-overlay";

  const popupContent = document.createElement("div");
  popupContent.className = "popup-content";

  // Close button
  const closeBtn = document.createElement("button");
  closeBtn.className = "popup-close";
  closeBtn.innerHTML = "&times;";
  closeBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    popup.remove();
  });

  // Title
  const title = document.createElement("h2");
  title.textContent = attributes.titles.en || attributes.canonicalTitle;

  // Synopsis/Description
  const synopsis = document.createElement("p");
  synopsis.className = "popup-synopsis";
  synopsis.textContent =
    attributes.synopsis ||
    attributes.description ||
    "No description available.";

  // Additional info such as metrics recorded for user suggestions
  const infoDiv = document.createElement("div");
  infoDiv.className = "popup-info";

  const info = [
    attributes.averageRating ? `Rating: ${attributes.averageRating}/100` : null,
    attributes.episodeCount ? `Episodes: ${attributes.episodeCount}` : null,
    attributes.status ? `Status: ${attributes.status}` : null,
    attributes.startDate ? `Aired: ${attributes.startDate}` : null,
    attributes.ageRating ? `Age Rating: ${attributes.ageRating}` : null,
  ].filter(Boolean);

  infoDiv.innerHTML = info.map((i) => `<span>${i}</span>`).join(" • ");

  popupContent.appendChild(closeBtn);
  popupContent.appendChild(title);
  popupContent.appendChild(synopsis);
  popupContent.appendChild(infoDiv);
  popup.appendChild(popupContent);

  // Close on overlay click
  popup.addEventListener("click", (e) => {
    if (e.target === popup) {
      popup.remove();
    }
  });

  return popup;
}

// Show popup
function showPopup(popup) {
  document.body.appendChild(popup);
}

// Remove popup
function removePopup(popup) {
  document.body.removeChild(popup);
}

// Initialise the app
fetchAnimeData();
