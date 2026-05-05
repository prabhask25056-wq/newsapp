const url = "http://localhost:5001/news";

window.addEventListener("load", () => {
  fetchNews();
});

function reload() {
  window.location.reload();
}

async function fetchNews(query = "") {
  try {
    const res = await fetch(url);

    if (!res.ok) {
      throw new Error("Failed to fetch news");
    }

    const data = await res.json();
    let newsList = data.news || [];

    if (query) {
      const searchQuery = query.toLowerCase();

      newsList = newsList.filter((news) =>
        news.title?.toLowerCase().includes(searchQuery) ||
        news.source?.toLowerCase().includes(searchQuery) ||
        news.description?.toLowerCase().includes(searchQuery) ||
        news.category?.toLowerCase().includes(searchQuery)
      );
    }

    bindData(newsList);
  } catch (error) {
    console.error("Error fetching news:", error);

    const cardsContainer = document.getElementById("cards-container");
    cardsContainer.innerHTML = "<h2>Unable to load news. Check backend server.</h2>";
  }
}

function bindData(newsList) {
  const cardsContainer = document.getElementById("cards-container");
  const newsCardTemplate = document.getElementById("template-news-card");

  cardsContainer.innerHTML = "";

  if (!newsList || newsList.length === 0) {
    cardsContainer.innerHTML = "<h2>No news found</h2>";
    return;
  }

  newsList.forEach((news) => {
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
  const newsUrl = cardClone.querySelector("#news-url");
  const card = cardClone.querySelector(".card");

  newsImg.src =
    news.thumbnail ||
    "https://development-and-testing-bucket-abcdxyz1234.s3.ap-south-1.amazonaws.com/no-pictures.png";

  newsImg.alt = news.title || "News image";

  newsTitle.textContent = news.title || "No title";
  newsSource.textContent = `${news.source || "Unknown source"} ${news.category ? "• " + news.category : ""}`;
  newsDesc.textContent = news.description || "No description available";

  if (news.url) {
    newsUrl.href = news.url;

    card.addEventListener("click", () => {
      window.open(news.url, "_blank");
    });
  } else {
    newsUrl.style.display = "none";
  }

  newsUrl.addEventListener("click", (event) => {
    event.stopPropagation();
  });
}

let curSelectedNav = null;

function onNavItemClick(category) {
  fetchNews(category);

  const navItem = document.getElementById(category);

  if (curSelectedNav) {
    curSelectedNav.classList.remove("active");
  }

  curSelectedNav = navItem;

  if (curSelectedNav) {
    curSelectedNav.classList.add("active");
  }

  document.getElementById("search-text").value = "";
}

const searchButton = document.getElementById("search-button");
const searchText = document.getElementById("search-text");

searchButton.addEventListener("click", () => {
  const query = searchText.value.trim();

  if (!query) return;

  fetchNews(query);

  if (curSelectedNav) {
    curSelectedNav.classList.remove("active");
  }

  curSelectedNav = null;
});

searchText.addEventListener("keypress", (event) => {
  if (event.key === "Enter") {
    searchButton.click();
  }
});

async function addNews(newsData) {
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(newsData)
    });

    const data = await res.json();

    if (!res.ok) {
      console.error("Error adding news:", data);
      return;
    }

    console.log("News added successfully:", data);
    fetchNews();

  } catch (error) {
    console.error("POST request failed:", error);
  }
}