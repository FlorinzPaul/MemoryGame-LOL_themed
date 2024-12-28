const modeSelection = document.getElementById("mode-selection");
const difficultySelection = document.getElementById("difficulty-selection");
const gameBoard = document.getElementById("game-board");
const restartBtn = document.getElementById("restart-btn");
const quitBtn = document.getElementById("quit-btn");
const timerDisplay = document.getElementById("timer");
const scoreDisplay = document.getElementById("scoreboard");
const timeSpan = document.getElementById("time");
const gameInfo = document.getElementById("game-info");

let gameMode = null;
let difficulty = null;
let cards = [];
let flippedCards = [];
let matchedCards = [];
let timer;
let time = 0;
let score = 0;

// Start Progressive Mode
document.getElementById("progressive-btn").addEventListener("click", () => {
  gameMode = "progressive";
  startGame(4);
});

// Show difficulty selection for Time Trial Mode
document.getElementById("time-trial-btn").addEventListener("click", () => {
  gameMode = "time-trial";
  difficultySelection.classList.remove("hidden");
});

// Handle difficulty selection
difficultySelection.addEventListener("click", (e) => {
  if (e.target.tagName === "BUTTON") {
    difficulty = e.target.dataset.difficulty;
    const pairs = getPairsByDifficulty(difficulty);
    startGame(pairs, true);
  }
});

// Update the score display
function updateScore(points) {
  score += points; // Increment or decrement score
  const scoreElement = document.getElementById("score");
  if (scoreElement) {
    scoreElement.textContent = score; // Update the displayed score
  } else {
    console.error("Score element not found in the DOM!");
  }
}

// Check for matches
function checkMatch() {
  const [card1, card2] = flippedCards;
  const img1 = card1.querySelector("img").src;
  const img2 = card2.querySelector("img").src;

  if (img1 === img2) {
    matchedCards.push(card1, card2);
    card1.classList.add("matched");
    card2.classList.add("matched");

    // Add points for a match
    updateScore(10); // Increment score by 10 points

    // Make matched cards less visible
    setTimeout(() => {
      card1.style.opacity = "0.4";
      card2.style.opacity = "0.4";
    }, 200);
  } else {
    // Deduct points for incorrect flips in Time Trial mode
    if (gameMode === "time-trial") updateScore(-5);

    card1.classList.remove("flipped");
    card2.classList.remove("flipped");
  }

  flippedCards = [];

  // Check for win condition
  if (matchedCards.length === cards.length) {
    stopTimer();
    alert(`You win! Final Score: ${score}`);
  }
}


// Return pairs count based on difficulty
function getPairsByDifficulty(level) {
  switch (level) {
    case "easy": return 4;
    case "normal": return 8;
    case "hard": return 12;
  }
}

// Start the game
async function startGame(pairs, isTimed = false) {
  modeSelection.classList.add("hidden");
  difficultySelection.classList.add("hidden");
  gameBoard.classList.remove("hidden");
  restartBtn.classList.remove("hidden");
  quitBtn.classList.remove("hidden");

  if (gameMode === "progressive"){
    timerDisplay.classList.add("hidden")
    scoreDisplay.classList.remove("hidden")
  } else if (gameMode === "time-trial") {
    scoreDisplay.classList.add("hidden")
    timerDisplay.classList.remove("hidden")
    startTimer();
  }

  // Show game info section
  gameInfo.classList.remove("hidden");

  if (isTimed) startTimer();

  const champions = await fetchChampionData();
  if (champions.length === 0) return;

  setupCards(champions, pairs);
  renderBoard();
}

// Timer Logic
function startTimer() {
  timerDisplay.classList.remove("hidden"); // Ensure timer is visible
  time = 0;
  timeSpan.textContent = time; // Reset timer display

  // Update timer every second
  timer = setInterval(() => {
    time++;
    timeSpan.textContent = time; // Update timer display
  }, 1000);
}

function stopTimer() {
  clearInterval(timer);
}

// Setup cards
function setupCards(champions, pairs) {
  const selectedChampions = champions
    .sort(() => Math.random() - 0.5)
    .slice(0, pairs);
  cards = [...selectedChampions, ...selectedChampions].sort(() => Math.random() - 0.5);
  flippedCards = [];
  matchedCards = [];
}

// Render the game board
function renderBoard() {
  gameBoard.innerHTML = "";

  cards.forEach((champion, index) => {
    const card = document.createElement("div");
    card.classList.add("card");
    card.dataset.index = index;

    // Card Front
    const front = document.createElement("div");
    front.classList.add("front");
    const img = document.createElement("img");
    img.src = champion.image;
    img.alt = champion.name;
    front.appendChild(img);

    // Card Back
    const back = document.createElement("div");
    back.classList.add("back");
    const backImg = document.createElement("img");
    backImg.src = "./asset/card-back.png";
    backImg.alt = "";
    back.appendChild(backImg);

    card.appendChild(front);
    card.appendChild(back);

    card.addEventListener("click", () => flipCard(card));

    gameBoard.appendChild(card);
  });

  // Adjust the grid after rendering cards
  adjustGrid();
}

// Flip card
function flipCard(card) {
  if (flippedCards.length >= 2 || card.classList.contains("flipped")) return;

  card.classList.add("flipped");
  flippedCards.push(card);

  if (flippedCards.length === 2) setTimeout(checkMatch, 800);
}
// Check for matches
function checkMatch() {
  const [card1, card2] = flippedCards;
  const img1 = card1.querySelector("img").src;
  const img2 = card2.querySelector("img").src;

  if (img1 === img2) {
    matchedCards.push(card1, card2);
    card1.classList.add("matched");
    card2.classList.add("matched");

    // Add points for a match
    updateScore(10);

    // Make matched cards less visible
    setTimeout(() => {
    card1.style.opacity = "0.4";
    card2.style.opacity = "0.4";
    }, 200);
  } else {
    card1.classList.remove("flipped");
    card2.classList.remove("flipped");
  }
  flippedCards = [];

  // Win conditions
  if (matchedCards.length === cards.length) {
    if (gameMode === "progressive") {
      alert("Level Up!");
      startGame(cards.length / 2 + 4);
    } else {
      stopTimer();
      alert(`You win! Time: ${time} seconds`);
    }
  }
}

// Restart game
restartBtn.addEventListener("click", () => {
  stopTimer();
  time = 0;
  score = 0; // Reset score
  updateScore(0); // Update score display to reflect reset
  startGame(4); // Restart with initial number of pairs
});

// Quit game
quitBtn.addEventListener("click", () => {
  stopGame();
  score = 0; // Reset score on quit
  updateScore(0); // Update score display to reflect reset
  gameInfo.classList.add("hidden");
});

function stopGame() {
  stopTimer();
  time = 0;
  cards = [];
  flippedCards = [];
  matchedCards = [];
  gameBoard.innerHTML = "";
  gameBoard.classList.add("hidden");
  restartBtn.classList.add("hidden");
  quitBtn.classList.add("hidden");
  modeSelection.classList.remove("hidden");
}

// Adjust grid based on card count
function adjustGrid() {
  let columns;

  if (cards.length === 8) {
    columns = 4; // First round: 4 columns
  } else {
    columns = Math.min(6, Math.ceil(Math.sqrt(cards.length)));
  }

  gameBoard.style.gridTemplateColumns = `repeat(${columns}, 1fr)`;

  // Dynamically adjust card size based on grid columns
  const cardSize = Math.min(100, 400 / columns); // Adjust max size as needed
  document.querySelectorAll(".card").forEach((card) => {
    card.style.width = `${cardSize}px`;
    card.style.height = `${cardSize}px`;
  });
}