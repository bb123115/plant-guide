const plantList = document.getElementById("plantList");
const searchInput = document.getElementById("searchInput");
const difficultyFilter = document.getElementById("difficultyFilter");
const priceFilter = document.getElementById("priceFilter");
const resetButton = document.getElementById("resetButton");
const resultCount = document.getElementById("resultCount");

let map;
let countryLayer;
let selectedCountryCodes = [];

// GeoJSON側の国コードを取得する
function getFeatureCountryCode(feature) {
  return (
    feature.properties.ISO_A3 ||
    feature.properties.ADM0_A3 ||
    feature.properties.iso_a3 ||
    feature.properties["ISO3166-1-Alpha-3"] ||
    ""
  );
}

// 国の色を決める
function countryStyle(feature) {
  const code = getFeatureCountryCode(feature);
  const isSelected = selectedCountryCodes.includes(code);

  return {
    color: "#222",
    weight: 0.6,
    fillColor: isSelected ? "#e60000" : "#ffffff",
    fillOpacity: isSelected ? 0.85 : 1
  };
}

// 地図の初期化
async function initMap() {
  map = L.map("map", {
    zoomControl: true
  }).setView([20, 0], 2);

  // 白黒の世界地図用の国境データ
  const response = await fetch(
    "https://raw.githubusercontent.com/datasets/geo-countries/master/data/countries.geojson"
  );

  const countries = await response.json();

  countryLayer = L.geoJSON(countries, {
    style: countryStyle,
    onEachFeature: (feature, layer) => {
      const name =
        feature.properties.ADMIN ||
        feature.properties.name ||
        feature.properties.NAME ||
        "国名不明";

      layer.bindPopup(name);
    }
  }).addTo(map);
}

// countryCodeに合う国を赤くする
function showOriginsOnMap(plant) {
  if (!plant.originLocations || plant.originLocations.length === 0) {
    alert("この植物の原産地情報が登録されていません。");
    return;
  }

  const codes = plant.originLocations
    .map(location => location.countryCode)
    .filter(code => code);

  if (codes.length === 0) {
    alert("この植物にはcountryCodeが登録されていません。");
    return;
  }

  selectedCountryCodes = [...new Set(codes)];

  if (!countryLayer) {
    alert("地図データの読み込み中です。少し待ってからもう一度押してください。");
    return;
  }

  countryLayer.setStyle(countryStyle);

  const selectedLayers = [];

  countryLayer.eachLayer(layer => {
    const code = getFeatureCountryCode(layer.feature);

    if (selectedCountryCodes.includes(code)) {
      selectedLayers.push(layer);
    }
  });

  if (selectedLayers.length > 0) {
    const group = L.featureGroup(selectedLayers);
    map.fitBounds(group.getBounds(), {
      padding: [40, 40]
    });
  }
}

// 植物一覧を表示
function displayPlants(plantData) {
  plantList.innerHTML = "";

  resultCount.textContent = `${plantData.length}件の植物が見つかりました`;

  if (plantData.length === 0) {
    plantList.innerHTML = `<p>条件に合う植物が見つかりませんでした。</p>`;
    return;
  }

  plantData.forEach((plant) => {
    const card = document.createElement("div");
    card.className = "plant-card";

    const origin = plant.originText || plant.origin || "不明";
    const watering = plant.watering || plant.water || "不明";
    const priceLevel = plant.priceLevel || plant.priceCategory || "不明";

    card.innerHTML = `
      <img src="${plant.image}" alt="${plant.name}" class="plant-image">
      <h3>${plant.name}</h3>
      <p><strong>価格：</strong>${plant.price || "不明"}</p>
      <p><strong>価格帯：</strong>${priceLevel}</p>
      <p><strong>サイズ：</strong>${plant.size || "不明"}</p>
      <p><strong>難易度：</strong>${plant.difficulty || "不明"}</p>
      <p><strong>日当たり：</strong>${plant.light || "不明"}</p>
      <p><strong>水やり：</strong>${watering}</p>
      <p><strong>原産地：</strong>${origin}</p>
      <p>${plant.description || ""}</p>
      <button class="map-button">地図で見る</button>
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

  const filteredPlants = plants.filter((plant) => {
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

async function startApp() {
  await initMap();
  await loadPlants();
}

startApp();