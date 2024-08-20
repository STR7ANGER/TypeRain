const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const highScoreDisplay = document.getElementById('high-score');
const yourScoreDisplay = document.getElementById('your-score');

let words = [];
let score = 0;
let highScore = 0;

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

function startGame() {
    setInterval(dropWord, 3000); // Drop a word every 3 seconds
    setInterval(moveWordsDown, 50);
    window.addEventListener('keydown', handleTyping);
}

function dropWord() {
    fetch(`https://random-word-api.herokuapp.com/word?number=1`)
        .then(response => response.json())
        .then(data => {
            const word = {
                text: data[0],
                x: canvas.width / 2, // Center horizontally
                y: -50, // Start above the screen
                ready: false,
                timer: 5 // 5-second delay before the word can be typed
            };
            words.push(word);
        })
        .catch(error => console.error('Error fetching words:', error));
}

function moveWordsDown() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    words.forEach((word, index) => {
        word.y += 2; // Speed of the word falling
        word.timer -= 0.05; // Decrease the timer

        if (word.timer <= 0) {
            word.ready = true; // Mark word as ready to type
        }

        ctx.font = '46px Kaushan Script';
        ctx.fillStyle = word.ready ? 'white' : 'gray'; // Gray before it's ready, white when it's ready
        ctx.textAlign = 'center';
        ctx.fillText(word.text, word.x, word.y);

        // Game over if word reaches the bottom of the screen
        if (word.y >= canvas.height) {
            endGame();
        }
    });
}

function handleTyping(event) {
    const key = event.key;

    if (key.length === 1 && /^[a-zA-Z]$/.test(key)) {
        const activeWord = words.find(word => word.ready && word.text.startsWith(key));

        if (activeWord) {
            activeWord.text = activeWord.text.slice(1); // Remove the typed character
            if (activeWord.text.length === 0) {
                score += activeWord.text.length;
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

function endGame() {
    alert(`Game Over! Your final score is: ${score}`);
    resetGame();
}

function resetGame() {
    words = [];
    score = 0;
    yourScoreDisplay.textContent = `Your Score: ${score}`;
    highScoreDisplay.textContent = `High Score: ${highScore}`;
    startGame();
}

startGame();
