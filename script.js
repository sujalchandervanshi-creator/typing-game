const gameArea = document.getElementById("game-area");
const correctSound = new Audio("sounds/correct.wav");
const wrongSound = new Audio("sounds/wrong.wav");
const completeSound = new Audio("sounds/complete.wav");
const gameOverSound = new Audio("sounds/over.wav");
let words = [];
let usedWords = [];
async function loadWords() {
    try {
        const response = await fetch(
            "https://random-word-api.herokuapp.com/word?number=50"
        );
        words = await response.json();
        console.log("Words loaded:", words);
    } catch (error) {
        console.log("Could not load words:", error);
    }
}
loadWords();
let highScore = localStorage.getItem("highScore") || 0;
let isPaused = false;
document.getElementById("high-score").innerText = highScore;
let startTime = null;
let totalTypedCharacters = 0;
let score = 0;
let lives = 3;
let currentWord = "";
let currentLetter = 0;
let activeWord = null;
let gameLoop = null;

function createWord() {
let level = Math.floor(score / 5) + 1;
let availableWords = words.filter(function(word) {
    if (level === 1) {
        return word.length >= 3 && word.length <= 5;
    }
    if (level === 2) {
        return word.length >= 5 && word.length <= 7;
    }
    if (level === 3) {
        return word.length >= 7 && word.length <= 9;
    }
    return word.length >= 9 && word.length <= 10;
});
let unusedWords = availableWords.filter(function(word) {
    return !usedWords.includes(word.toUpperCase());
});
if (unusedWords.length === 0) {
    usedWords = [];
    unusedWords = availableWords;
}
currentWord = unusedWords[
    Math.floor(Math.random() * unusedWords.length)
].toUpperCase();
usedWords.push(currentWord);
    currentLetter = 0;
    const word = document.createElement("div");
    word.classList.add("word");
    currentWord.split("").forEach(function(letter) {
        const letterElement = document.createElement("span");
        letterElement.innerText = letter;
        word.appendChild(letterElement);
    });
    const randomPosition = Math.random() * (gameArea.clientWidth - 150);
    word.style.left = randomPosition + "px";
    gameArea.appendChild(word);
    activeWord = word;

    let position = 100;
    gameLoop = setInterval(function() {
        if (isPaused) return;
       position = position + (1 + Math.floor(score / 5) * 0.5);
        word.style.top = position + "px";
      
        if (position + word.offsetHeight >= gameArea.clientHeight) {
    clearInterval(gameLoop);
    word.remove();
    activeWord = null;
    gameArea.classList.add("damage-flash");
    setTimeout(function() {
    gameArea.classList.remove("damage-flash");
    }, 350);
    lives--;
document.getElementById("lives").innerText = lives;
if (lives <= 0) {
    gameOverSound.currentTime = 0;
    gameOverSound.play();
    document.getElementById("final-score").innerText = score;
    document.getElementById("game-over").style.display = "block";

} else {
    createWord();
}
}
    }, 30);
}

document.addEventListener("keydown", function(event) {

    if (event.code === "Space") {   
        return;
    }
    if (event.key.length !== 1) {
        return;
    }
    if (startTime === null) {
    startTime = Date.now();
    }
    const typedLetter = event.key.toUpperCase();
    totalTypedCharacters++;
    const correctLetter = currentWord[currentLetter];
    if (typedLetter === correctLetter) {
        console.log("Correct!");
        correctSound.currentTime = 0;
        correctSound.play();    
        activeWord.children[currentLetter].classList.add("typed");
        currentLetter++;
        document.getElementById("typing-display").innerText =
    currentWord.substring(0, currentLetter);
        if (currentLetter === currentWord.length) {
            console.log("WORD DESTROYED!");
            const spaceship = document.getElementById("spaceship");
            spaceship.classList.remove("spaceship-attack");
            void spaceship.offsetWidth;
            spaceship.classList.add("spaceship-attack");
            completeSound.currentTime = 0;
            completeSound.play();
            clearInterval(gameLoop);
            const explosion = document.createElement("div");
            explosion.classList.add("explosion");
            explosion.style.left = activeWord.offsetLeft + "px";
            explosion.style.top = activeWord.offsetTop + "px";
            gameArea.appendChild(explosion);
            setTimeout(function() {
                explosion.remove();
            }, 400);
           activeWord.remove();
            activeWord = null;
            score++;
            document.getElementById("score").innerText = score;
            if (score > highScore) {
    highScore = score;
    localStorage.setItem("highScore", highScore);
    document.getElementById("high-score").innerText = highScore;
}
            let level = Math.floor(score / 5) + 1;
            document.getElementById("level").innerText = level;
            document.getElementById("typing-display").innerText = "";
            createWord();
        }
    } else {

    console.log("Wrong!");
    wrongSound.currentTime = 0;
    wrongSound.play();
    const typingDisplay = document.getElementById("typing-display");
    typingDisplay.innerText = typedLetter;
    typingDisplay.classList.add("wrong-letter");
    setTimeout(function() {
        typingDisplay.classList.remove("wrong-letter");
        typingDisplay.innerText =
            currentWord.substring(0, currentLetter);
    }, 300);

}

if (startTime !== null) {
    const elapsedTime = (Date.now() - startTime) / 60000;
    if (elapsedTime > 0) {
        const wpm = Math.round(
            (totalTypedCharacters / 5) / elapsedTime
        );
        document.getElementById("wpm").innerText = wpm;
    }
}
});

   document.getElementById("start-button").addEventListener("click", async function() {
    await loadWords();
    startTime = null;
    totalTypedCharacters = 0;
    document.getElementById("wpm").innerText = "0"; 
    document.getElementById("start-screen").style.display = "none";
    createWord();
});

document.getElementById("restart-button").addEventListener("click", function() {
    console.log("Restart button clicked!");
    location.reload();
});

document.getElementById("pause-button").addEventListener("click", function() {
    isPaused = !isPaused;
    if (isPaused) {
        this.innerText = "▶ RESUME";
    } else {
        this.innerText = "⏸ PAUSE";
    }
});