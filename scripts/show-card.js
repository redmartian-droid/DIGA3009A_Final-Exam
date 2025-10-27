// Fetch anime data from Kitsu API
async function fetchAnimeData() {
  const apiUrl = "https://kitsu.io/api/edge/anime?page[limit]=5"; // Kitsu API endpoint here, documentation is a bit confusing. API key may be needed for log in functionality, confirm

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

// Display my anime cards
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

  card.appendChild(img);
  card.appendChild(titleElement); // confirm usage inside of card

  return card;
}

// Initialise the app
fetchAnimeData();
