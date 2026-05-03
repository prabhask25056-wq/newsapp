const url = "http://localhost:5001/news";

window.addEventListener("load", () => fetchNews());

function reload() {
  window.location.reload();
}

async function fetchNews(query = "") {
  try {
    const res = await fetch(url);
    const data = await res.json();

    let newsList = data.news || [];

    if (query) {
      const searchQuery = query.toLowerCase();

      newsList = newsList.filter(news =>
        news.title?.toLowerCase().includes(searchQuery) ||
        news.source?.toLowerCase().includes(searchQuery) ||
        news.description?.toLowerCase().includes(searchQuery) ||
        news.category?.toLowerCase().includes(searchQuery)
      );
    }

    bindData(newsList);
  } catch (error) {
    console.error("Error fetching news:", error);
  }
}

function bindData(newsList) {
  const cardsContainer = document.getElementById("cards-container");
  const newsCardTemplate = document.getElementById("template-news-card");

  cardsContainer.innerHTML = "";

  if (newsList.length === 0) {
    cardsContainer.innerHTML = `<h2>No news found</h2>`;
    return;
  }

  newsList.forEach(news => {
    const cardClone = newsCardTemplate.content.cloneNode(true);
    fillDataInCard(cardClone, news);
    cardsContainer.appendChild(cardClone);
  });
}

function fillDataInCard(cardClone, news) {
  const newsImg = cardClone.querySelector("#thumbnail");
  const newsTitle = cardClone.querySelector("#news-title");
  const newsSource = cardClone.querySelector("#news-source");
  const newsDesc = cardClone.querySelector("#news-description");

  newsImg.src = news.thumbnail || "https://via.placeholder.com/400x200";
  newsTitle.innerHTML = news.title || "No title";
  newsSource.innerHTML = news.source || "Unknown source";
  newsDesc.innerHTML = news.description || "No description available";

  cardClone.firstElementChild.addEventListener("click", () => {
    if (news.url) {
      window.open(news.url, "_blank");
    }
  });
}

let curSelectedNav = null;

function onNavItemClick(category) {
  fetchNews(category);

  const navItem = document.getElementById(category);

  curSelectedNav?.classList.remove("active");
  curSelectedNav = navItem;
  curSelectedNav.classList.add("active");
}

const searchButton = document.getElementById("search-button");
const searchText = document.getElementById("search-text");

searchButton.addEventListener("click", () => {
  const query = searchText.value.trim();

  if (!query) return;

  fetchNews(query);

  curSelectedNav?.classList.remove("active");
  curSelectedNav = null;
});