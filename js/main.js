const plantList = document.getElementById("plantList");
const difficultyFilter = document.getElementById("difficultyFilter");
const priceFilter = document.getElementById("priceFilter");
const resetButton = document.getElementById("resetButton");
const resultCount = document.getElementById("resultCount");

let plants = [];

// 植物データを読み込む
fetch("data/plants.json")
  .then((response) => response.json())
  .then((data) => {
    plants = data;
    displayPlants(plants);
  })
  .catch((error) => {
    console.error("植物データの読み込みに失敗しました", error);
  });

// 植物一覧を表示する
function displayPlants(plantData) {
  plantList.innerHTML = "";

  resultCount.textContent = `${plantData.length}件の植物が見つかりました`;

  plantData.forEach((plant) => {
    const instagramUrl =
      "https://www.instagram.com/explore/search/keyword/?q=" +
      encodeURIComponent(plant.name);

    const card = document.createElement("div");
    card.className = "plant-card";

    card.innerHTML = `
      <h3>${plant.name}</h3>
  <p><strong>分類：</strong>${plant.category}</p>
  <p><strong>科・属：</strong>${plant.family}</p>
  <p><strong>原産地：</strong>${plant.origin}</p>
  <p><strong>食毒：</strong>${plant.toxicity}</p>
  <p><strong>育てやすさ：</strong>${plant.difficulty}</p>
  <p><strong>価格帯：</strong>${plant.priceCategory}</p>
  <p><strong>相場：</strong>${plant.price}</p>
  <p><strong>日当たり：</strong>${plant.light}</p>
  <p><strong>水やり：</strong>${plant.water}</p>
  <p>${plant.description}</p>

  <a href="${instagramUrl}" target="_blank" rel="noopener noreferrer">
    Instagramで「${plant.name}」を検索する
  </a>
`;

    plantList.appendChild(card);
  });
}

// 絞り込み処理
function filterPlants() {
  const selectedDifficulty = difficultyFilter.value;
  const selectedPrice = priceFilter.value;

  const filteredPlants = plants.filter((plant) => {
    const matchDifficulty =
      selectedDifficulty === "" || plant.difficulty === selectedDifficulty;

    const matchPrice =
      selectedPrice === "" || plant.priceCategory === selectedPrice;

    return matchDifficulty && matchPrice;
  });

  displayPlants(filteredPlants);
}

// セレクトボックスが変わったとき
difficultyFilter.addEventListener("change", filterPlants);
priceFilter.addEventListener("change", filterPlants);

// リセットボタン
resetButton.addEventListener("click", () => {
  difficultyFilter.value = "";
  priceFilter.value = "";
  displayPlants(plants);
});