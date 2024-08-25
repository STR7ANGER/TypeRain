const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const highScoreDisplay = document.getElementById('high-score');
const yourScoreDisplay = document.getElementById('your-score');

let words = [];
let score = 0;
let highScore = 0;
let lives = 3;
let dropSpeed = 2;
let spawnRate = 3500;

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

function startGame() {
    dropWord(); // Drop the first word immediately
    setInterval(dropWord, spawnRate); // Continue dropping words at the current spawn rate
    setInterval(moveWordsDown, 50); // Move words down every 50ms
    setInterval(increaseDifficulty, 5000); // Increase difficulty every 5 seconds
    window.addEventListener('keydown', handleTyping);
}

function moveWordsDown() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    words.forEach((word, index) => {
        word.y += dropSpeed; // Speed of the word falling, increasing over time
        word.timer -= 0.05; // Decrease the timer

        if (word.timer <= 0) {
            word.ready = true; // Mark word as ready to type
        }

        // Check if word is going out of border
        if (word.x < 0) {
            word.x = 0;
        } else if (word.x > canvas.width) {
            word.x = canvas.width;
        }

        ctx.font = '46px Kaushan Script';
        ctx.fillStyle = word.color; // Use the word's assigned color
        ctx.textAlign = 'center';
        ctx.fillText(word.text, word.x, word.y);

        // Game over if word reaches the bottom of the screen
        if (word.y >= canvas.height) {
            words = words.filter(w => w !== word); // Remove the word
            loseLife();
        }
    });
}

function dropWord() {
    fetch(`https://random-word-api.herokuapp.com/word?number=1`)
        .then(response => response.json())
        .then(data => {
            const word = {
                text: data[0],
                x: Math.random() * canvas.width, // Random x position
                y: -50, // Start above the screen
                ready: false,
                timer: 0, // No delay before the word can be typed
                color: getRandomNeonColor() // Assign a random neon color to the word
            };
            words.push(word);
        })
        .catch(error => console.error('Error fetching words:', error));
}

function getRandomNeonColor() {
    const neonColors = ['#33CCFF', '#FF99CC', '#CCFF33', '#FFCC00', '#33FFCC'];
    return neonColors[Math.floor(Math.random() * neonColors.length)];
}
function handleTyping(event) {
    const key = event.key;

    if (key.length === 1 && /^[a-zA-Z]$/.test(key)) {
        const activeWord = words.find(word => word.ready && word.text.startsWith(key));

        if (activeWord) {
            activeWord.text = activeWord.text.slice(1); // Remove the typed character
            if (activeWord.text.length === 0) {
                score += 10; // 10 points for each word
                yourScoreDisplay.textContent = `Your Score: ${score}`;
                words = words.filter(word => word !== activeWord); // Remove the word from the array
                if (score > highScore) {
                    highScore = score;
                    highScoreDisplay.textContent = `High Score: ${highScore}`;
                }
            }
        }
    }
}

function loseLife() {
    lives--;
    if (lives > 0) {
        resetGame();
    } else {
        showRestartButton();
    }
}

function resetGame() {
    words = [];
    yourScoreDisplay.textContent = `Your Score: ${score}`;
    highScoreDisplay.textContent = `High Score: ${highScore}`;
}

function showRestartButton() {
    const restartButton = document.createElement('button');
    restartButton.textContent = 'Restart';
    restartButton.style.position = 'absolute';
    restartButton.style.top = '50%';
    restartButton.style.left = '50%';
    restartButton.style.transform = 'translate(-50%, -50%)';
    restartButton.style.padding = '10px 20px';
    restartButton.style.fontSize = '1.5em';
    restartButton.style.backgroundColor = '#fff';
    restartButton.style.border = 'none';
    restartButton.style.cursor = 'pointer';
    document.body.appendChild(restartButton);

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.font = '46px Kaushan Script';
    ctx.fillStyle = 'white';
    ctx.textAlign = 'center';
    ctx.fillText(score > highScore ? `New High Score: ${score}` : `Your Score: ${score}`, canvas.width / 2, canvas.height / 2 - 50);

    restartButton.addEventListener('click', () => {
        lives = 3;
        score = 0;
        dropSpeed = 2; // Reset drop speed
        spawnRate = 3500; // Reset spawn rate
        resetGame();
        document.body.removeChild(restartButton);
        startGame();
    });
}

function increaseDifficulty() {
    dropSpeed += 0.1; // Increase drop speed
    spawnRate = Math.max(1000, spawnRate - 100); // Decrease spawn rate, minimum 1 second
}

startGame();