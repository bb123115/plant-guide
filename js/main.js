const plantList = document.getElementById("plantList");
const searchInput = document.getElementById("searchInput");
const difficultyFilter = document.getElementById("difficultyFilter");
const priceFilter = document.getElementById("priceFilter");
const resetButton = document.getElementById("resetButton");
const resultCount = document.getElementById("resultCount");

let plants = [];
let map;
let markers = [];

// 地図の初期化
function initMap() {
  map = L.map("map").setView([20, 0], 2);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "&copy; OpenStreetMap contributors"
  }).addTo(map);
}

// 既存マーカーを消す
function clearMarkers() {
  markers.forEach(marker => {
    map.removeLayer(marker);
  });
  markers = [];
}

// 原産地を地図に表示
function showOriginsOnMap(plant) {
  if (!plant.originLocations || plant.originLocations.length === 0) {
    alert("この植物の地図情報はまだ登録されていません。");
    return;
  }

  clearMarkers();

  const bounds = [];

  plant.originLocations.forEach(location => {
    const marker = L.marker([location.lat, location.lng])
      .addTo(map)
      .bindPopup(`${plant.name}<br>原産地：${location.name}`);

    markers.push(marker);
    bounds.push([location.lat, location.lng]);
  });

  if (bounds.length > 0) {
    map.fitBounds(bounds, { padding: [50, 50] });
  }
}

// Instagram検索リンクを作る
function createInstagramUrl(plantName) {
  return `https://www.instagram.com/explore/search/keyword/?q=${encodeURIComponent(plantName)}`;
}

// 植物一覧を表示
function displayPlants(plantData) {
  plantList.innerHTML = "";

  resultCount.textContent = `${plantData.length}件の植物が見つかりました`;

  plantData.forEach(plant => {
    const card = document.createElement("div");
    card.className = "plant-card";

    const origin = plant.originText || plant.origin || "不明";
    const watering = plant.watering || plant.water || "不明";
    const priceLevel = plant.priceLevel || plant.priceCategory || "不明";
    const instagramUrl = createInstagramUrl(plant.name);

    card.innerHTML = `
      <h3>${plant.name}</h3>
      <p><strong>分類：</strong>${plant.category || "不明"}</p>
      <p><strong>科・属：</strong>${plant.family || "不明"}</p>
      <p><strong>価格：</strong>${plant.price || "不明"}</p>
      <p><strong>価格帯：</strong>${priceLevel}</p>
      <p><strong>サイズ：</strong>${plant.size || "不明"}</p>
      <p><strong>難易度：</strong>${plant.difficulty || "不明"}</p>
      <p><strong>日当たり：</strong>${plant.light || "不明"}</p>
      <p><strong>水やり：</strong>${watering}</p>
      <p><strong>原産地：</strong>${origin}</p>
      <p><strong>食毒：</strong>${plant.toxicity || "不明"}</p>
      <p>${plant.description || ""}</p>

      <button class="map-button">地図で見る</button>

      <a href="${instagramUrl}" target="_blank" rel="noopener noreferrer">
        Instagramで「${plant.name}」を検索する
      </a>
    `;

    const mapButton = card.querySelector(".map-button");

    mapButton.addEventListener("click", () => {
      showOriginsOnMap(plant);
    });

    plantList.appendChild(card);
  });
}

// 絞り込み処理
function filterPlants() {
  const keyword = searchInput.value.trim();
  const selectedDifficulty = difficultyFilter.value;
  const selectedPrice = priceFilter.value;

  const filteredPlants = plants.filter(plant => {
    const priceLevel = plant.priceLevel || plant.priceCategory || "";

    const matchName =
      keyword === "" || plant.name.includes(keyword);

    const matchDifficulty =
      selectedDifficulty === "" || plant.difficulty === selectedDifficulty;

    const matchPrice =
      selectedPrice === "" || priceLevel === selectedPrice;

    return matchName && matchDifficulty && matchPrice;
  });

  displayPlants(filteredPlants);
}

// リセット処理
resetButton.addEventListener("click", () => {
  searchInput.value = "";
  difficultyFilter.value = "";
  priceFilter.value = "";
  displayPlants(plants);
});

// 入力・選択が変わったとき
searchInput.addEventListener("input", filterPlants);
difficultyFilter.addEventListener("change", filterPlants);
priceFilter.addEventListener("change", filterPlants);

// JSON読み込み
async function loadPlants() {
  try {
    const response = await fetch("data/plants.json");

    if (!response.ok) {
      throw new Error("plants.jsonが読み込めませんでした");
    }

    plants = await response.json();

    console.log(plants);

    displayPlants(plants);
  } catch (error) {
    console.error("植物データの読み込みに失敗しました:", error);
  }
}

initMap();
loadPlants();