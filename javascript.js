let timeLeft = 60;
let score = 0;
let timerInterval;

// Start game
document.getElementById("startBtn").addEventListener("click", startGame);

function startGame() {
    score = 0;
    timeLeft = 60;
    document.getElementById("score").textContent = "Score: 0";
    document.getElementById("timer").textContent = "Time: 60s";

    document.getElementById("startBtn").style.display = "none";

    generateQuestion();

    timerInterval = setInterval(() => {
        timeLeft--;
        document.getElementById("timer").textContent = `Time: ${timeLeft}s`;

        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            endGame();
        }
    }, 1000);
}

// Generate beginner-friendly math questions
function generateQuestion() {
    const num1 = Math.floor(Math.random() * 10) + 1;
    const num2 = Math.floor(Math.random() * 10) + 1;

    const correctAnswer = num1 + num2;

    document.getElementById("question").textContent =
        `${num1} + ${num2} = ?`;

    generateAnswers(correctAnswer);
}

// Create clickable answer buttons
function generateAnswers(correct) {
    const answersDiv = document.getElementById("answers");
    answersDiv.innerHTML = "";

    let answers = [correct];

    // Generate 3 wrong answers
    while (answers.length < 4) {
        let wrong = Math.floor(Math.random() * 20) + 1;
        if (!answers.includes(wrong)) answers.push(wrong);
    }

    // Shuffle buttons
    answers.sort(() => Math.random() - 0.5);

    // Create answer buttons
    answers.forEach(answer => {
        const btn = document.createElement("button");
        btn.className = "answer-btn";
        btn.textContent = answer;

        btn.onclick = () => {
            if (answer === correct) {
                score++;
                document.getElementById("score").textContent = `Score: ${score}`;
            }
            generateQuestion();
        };

        answersDiv.appendChild(btn);
    });
}

// End of game
function endGame() {
    document.getElementById("question").textContent = "Time's up!";
    document.getElementById("answers").innerHTML =
        `<h3>Your final score: ${score}</h3>`;

    document.getElementById("startBtn").style.display = "block";
}
