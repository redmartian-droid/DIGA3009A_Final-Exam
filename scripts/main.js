function createNavbar(title) {
  return `
    <div class = "navbar">
    <h1>${title}</h1>
    <a href = "/login/index.html">Log In</a>
    <a href = "/signup/index.html">Sign Up</a>
    </div>`;
}

const header = document.querySelector("header");
header.innerHTML = createNavbar("Yo!Anime");
