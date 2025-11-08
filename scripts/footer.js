// Reusable footer using rehashed logic from what i did for the navbar

const FOOTER_BASE_PATH = window.location.pathname.includes(
  "/DIGA3009A_Final-Exam"
)
  ? "/DIGA3009A_Final-Exam"
  : "";

function createFooter() {
  return `
  <div class="footer-content">
    <small><a href="${BASE_PATH}/">Yo<span class="header-color">!</span>Anime</a></small>
    <div class="footer-images">
      <img src="${BASE_PATH}/images/social_media_icon_1.png" alt="YouTube Icon." />
      <img src="${BASE_PATH}/images/social_media_icon_2.png" alt="Instagram Icon." />
      <img src="${BASE_PATH}/images/social_media_icon_3.png" alt="Twitter Icon." />
    </div>
  </div>`;
}

const footer = document.querySelector("footer");
if (footer) {
  footer.innerHTML = createFooter();
  console.log("Footer created successfully");
} else {
  console.error("Footer element not found");
}
