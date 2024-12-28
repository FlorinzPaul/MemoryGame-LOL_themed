const API_VERSION = "14.10.1"; // Current DDragon version
const BASE_URL = `https://ddragon.leagueoflegends.com/cdn/${API_VERSION}`;

// Fetch champion data
async function fetchChampionData() {
  const loadingMessage = document.createElement("p");
  loadingMessage.id = "loading";
  loadingMessage.style.position = "fixed";
  loadingMessage.style.bottom = "50%";
  loadingMessage.style.left = "45%";
  loadingMessage.textContent = "Loading champions...";
  document.body.appendChild(loadingMessage);

  try {
    const response = await fetch(`${BASE_URL}/data/en_US/champion.json`);
    const data = await response.json();
    const champions = Object.keys(data.data).map((key) => ({
      name: data.data[key].id,
      image: `${BASE_URL}/img/champion/${data.data[key].id}.png`,
    }));
    return champions;
  } catch (error) {
    console.error("Error fetching champion data:", error);
    return [];
  } finally {
    loadingMessage.remove();
  }
}
