// script.js
const categories = {
  fruits: ["🍎", "🍌", "🍇", "🍊", "🍓", "🍍", "🥭", "🍒"],
  emojis: ["😀", "😎", "🤩", "😍", "🥳", "😜", "🤪", "😇"],
  animals: ["🐶", "🐱", "🐭", "🐹", "🐰", "🦊", "🐻", "🐼"],
  planets: ["🌍", "🌕", "🌖", "🌗", "🌘", "🌑", "🌒", "🌓"],
  flags: ["🇺🇸", "🇬🇧", "🇨🇦", "🇦🇺", "🇯🇵", "🇩🇪", "🇫🇷", "🇮🇳"]
};

let selectedCategory = [];
let flippedCards = [];
let matchedPairs = 0;
let score = 0;
let timer;
let timeLeft = 30;

const landingPage = document.querySelector(".landing-page");
const gameContainer = document.querySelector(".game-container");
const cardsGrid = document.querySelector(".cards-grid");
const scoreDisplay = document.getElementById("score");
const timerDisplay = document.getElementById("timer");
const gameOverScreen = document.querySelector(".game-over");
const finalScoreDisplay = document.getElementById("final-score");
const playAgainButton = document.getElementById("play-again");

// Event listeners for category buttons
document.querySelectorAll(".category-buttons button").forEach(button => {
  button.addEventListener("click", () => {
    selectedCategory = categories[button.id];
    startGame();
  });
});

// Start the game
function startGame() {
  landingPage.classList.add("hidden");
  gameContainer.classList.remove("hidden");
  initializeCards();
  startTimer();
  saveGameState();
}

// Initialize cards
function initializeCards() {
  const cards = [...selectedCategory, ...selectedCategory];
  cards.sort(() => Math.random() - 0.5);
  cardsGrid.innerHTML = "";
  cards.forEach(item => {
    const card = document.createElement("div");
    card.classList.add("card");
    card.dataset.value = item;
    card.addEventListener("click", handleCardClick);
    cardsGrid.appendChild(card);
  });

  // Restore flipped cards if game state exists
  const savedState = JSON.parse(localStorage.getItem("memoryMatchGameState"));
  if (savedState && savedState.flippedCards) {
    savedState.flippedCards.forEach(value => {
      const card = Array.from(cardsGrid.children).find(card => card.dataset.value === value);
      if (card) {
        card.classList.add("flipped");
        card.textContent = value;
        flippedCards.push(card);
      }
    });
  }
}

// Handle card clicks
function handleCardClick(event) {
  const card = event.target;
  if (flippedCards.length < 2 && !card.classList.contains("flipped")) {
    card.classList.add("flipped");
    card.textContent = card.dataset.value;
    flippedCards.push(card);
    playSound("flip-sound");
    saveGameState();

    if (flippedCards.length === 2) {
      setTimeout(checkForMatch, 1000);
    }
  }
}

// Check for matches
function checkForMatch() {
  const [card1, card2] = flippedCards;
  if (card1.dataset.value === card2.dataset.value) {
    card1.classList.add("matched");
    card2.classList.add("matched");
    matchedPairs++;
    score += 10;
    scoreDisplay.textContent = score;
    playSound("match-sound");
    saveGameState();

    if (matchedPairs === selectedCategory.length) {
      endGame(true);
    }
  } else {
    card1.classList.remove("flipped");
    card2.classList.remove("flipped");
    card1.textContent = "";
    card2.textContent = "";
  }
  flippedCards = [];
}

// Start the timer
function startTimer() {
  timer = setInterval(() => {
    timeLeft--;
    timerDisplay.textContent = timeLeft;
    saveGameState();
    if (timeLeft === 0) {
      endGame(false);
    }
  }, 1000);
}

// End the game
function endGame(isWin) {
  clearInterval(timer);
  gameOverScreen.classList.remove("hidden");
  finalScoreDisplay.textContent = score;
  playSound(isWin ? "match-sound" : "game-over-sound");
  clearGameState();
}

// Play sound effects
function playSound(soundId) {
  const sound = document.getElementById(soundId);
  sound.currentTime = 0;
  sound.play();
}

// Save game state to localStorage
function saveGameState() {
  const gameState = {
    score: score,
    timeLeft: timeLeft,
    matchedPairs: matchedPairs,
    flippedCards: flippedCards.map(card => card.dataset.value),
    selectedCategory: selectedCategory
  };
  localStorage.setItem("memoryMatchGameState", JSON.stringify(gameState));
}

// Clear game state from localStorage
function clearGameState() {
  localStorage.removeItem("memoryMatchGameState");
}

// Load game state when the page loads
window.addEventListener("load", () => {
  const savedState = JSON.parse(localStorage.getItem("memoryMatchGameState"));
  if (savedState) {
    selectedCategory = savedState.selectedCategory;
    score = savedState.score;
    timeLeft = savedState.timeLeft;
    matchedPairs = savedState.matchedPairs;
    scoreDisplay.textContent = score;
    timerDisplay.textContent = timeLeft;
    startGame();
  }
});

// Play again button
playAgainButton.addEventListener("click", () => {
  clearGameState();
  location.reload();
});