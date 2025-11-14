// --- DOM Elements ---
const scoreDisplay = document.getElementById('score');
const timeLeftDisplay = document.getElementById('time-left');
const questionDisplay = document.getElementById('question');
const optionsContainer = document.getElementById('options-container');
const feedbackDisplay = document.getElementById('feedback');
const startBtn = document.getElementById('start-btn');
const resetBtn = document.getElementById('reset-btn');

// --- Game State Variables ---
let score = 0;
let currentQuestionIndex = 0;
const totalQuestions = 10;
let timer;
let timeLeft = 60;
let correctAnswer; // Stores the correct answer for the current question
let gameActive = false; // Flag to check if the game is running

// --- Event Listeners ---
startBtn.addEventListener('click', startGame);
resetBtn.addEventListener('click', resetGame);

// --- Core Game Functions ---

/**
 * Generates a random integer within a range.
 * @param {number} min - The minimum value (inclusive).
 * @param {number} max - The maximum value (inclusive).
 * @returns {number} A random integer.
 */
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Generates a simple math question (addition, subtraction, multiplication, or division).
 * @returns {{question: string, answer: number}} An object containing the question string and the correct answer.
 */
function generateQuestion() {
    const operation = ['+', '-', '*', '/'][getRandomInt(0, 3)];
    let num1, num2, answer;
    
    // Use smaller numbers for complexity, and ensure division is clean
    if (operation === '/') {
        // Ensure a clean integer division result
        answer = getRandomInt(2, 12);
        num2 = getRandomInt(2, 10);
        num1 = answer * num2;
    } else {
        // Standard operations
        num1 = getRandomInt(1, 20);
        num2 = getRandomInt(1, 20);

        if (operation === '-') {
            // Ensure positive result for subtraction
            [num1, num2] = [Math.max(num1, num2), Math.min(num1, num2)];
        }
        
        answer = eval(`${num1} ${operation} ${num2}`);
        // Round to 2 decimal places if the result isn't an integer (for non-perfect division)
        if (answer % 1 !== 0) {
            answer = parseFloat(answer.toFixed(2));
        }
    }

    const question = `${num1} ${operation} ${num2}`;
    return { question, answer };
}

/**
 * Generates 3 incorrect options around the correct answer.
 * @param {number} correctAnswer - The correct answer.
 * @returns {number[]} An array of 3 unique, incorrect answers.
 */
function generateIncorrectOptions(correctAnswer) {
    const incorrects = new Set();
    const range = 5; // Options will be within +/- range of the correct answer
    
    while (incorrects.size < 3) {
        let incorrect;
        if (correctAnswer % 1 !== 0) {
            // If the answer is a float, generate incorrect floats
            const offset = getRandomInt(1, range) * (Math.random() > 0.5 ? 1 : -1);
            incorrect = parseFloat((correctAnswer + offset + Math.random()).toFixed(2));
        } else {
            // If the answer is an integer, generate incorrect integers
            const offset = getRandomInt(1, range) * (Math.random() > 0.5 ? 1 : -1);
            incorrect = correctAnswer + offset;
        }

        if (incorrect !== correctAnswer && !incorrects.has(incorrect)) {
            incorrects.add(incorrect);
        }
    }
    return Array.from(incorrects);
}

/**
 * Displays a new question and its options.
 */
function displayNewQuestion() {
    optionsContainer.innerHTML = '';
    feedbackDisplay.textContent = '';

    const { question, answer } = generateQuestion();
    correctAnswer = answer;
    questionDisplay.textContent = `Question ${currentQuestionIndex + 1}: What is ${question}?`;

    const incorrectOptions = generateIncorrectOptions(answer);
    const options = [answer, ...incorrectOptions];

    // Shuffle the options array
    options.sort(() => Math.random() - 0.5);

    options.forEach(option => {
        const btn = document.createElement('button');
        btn.classList.add('option-btn');
        btn.textContent = option;
        btn.dataset.value = option; // Store the option value
        btn.addEventListener('click', checkAnswer);
        optionsContainer.appendChild(btn);
    });
}

/**
 * Checks the user's selected answer against the correct answer.
 * @param {Event} event - The click event from the option button.
 */
function checkAnswer(event) {
    if (!gameActive) return;

    // Disable all option buttons immediately after selection
    Array.from(optionsContainer.children).forEach(btn => btn.disabled = true);

    const selectedAnswer = parseFloat(event.target.dataset.value);
    
    if (selectedAnswer === correctAnswer) {
        score++;
        feedbackDisplay.textContent = '✅ Correct!';
        event.target.style.backgroundColor = '#28a745'; // Green for correct
    } else {
        feedbackDisplay.textContent = `❌ Wrong! The correct answer was ${correctAnswer}.`;
        event.target.style.backgroundColor = '#dc3545'; // Red for wrong
    }

    scoreDisplay.textContent = `${score}`;

    // Move to the next question after a brief delay
    setTimeout(() => {
        currentQuestionIndex++;
        if (currentQuestionIndex < totalQuestions) {
            displayNewQuestion();
        } else {
            endGame();
        }
    }, 1500); // 1.5 seconds delay
}

/**
 * Starts the game, initializes score, time, and starts the timer.
 */
function startGame() {
    if (gameActive) return;

    gameActive = true;
    score = 0;
    currentQuestionIndex = 0;
    timeLeft = 60;
    scoreDisplay.textContent = '0';
    timeLeftDisplay.textContent = '60';
    feedbackDisplay.textContent = '';
    
    startBtn.disabled = true;
    resetBtn.disabled = false;

    displayNewQuestion();
    startTimer();
}

/**
 * Ends the game, stops the timer, and displays the final result.
 */
function endGame() {
    gameActive = false;
    clearInterval(timer);
    // Clear options
    optionsContainer.innerHTML = '';
    
    questionDisplay.textContent = `Game Over! You scored ${score} out of ${totalQuestions}.`;
    
    resetBtn.disabled = false;
    startBtn.disabled = true;
}

/**
 * Resets the game state and display.
 */
function resetGame() {
    clearInterval(timer);
    gameActive = false;
    score = 0;
    currentQuestionIndex = 0;
    timeLeft = 60;

    scoreDisplay.textContent = '0';
    timeLeftDisplay.textContent = '60';
    questionDisplay.textContent = 'Press "Start Game" to begin!';
    optionsContainer.innerHTML = '';
    feedbackDisplay.textContent = '';

    startBtn.disabled = false;
    resetBtn.disabled = true;
}

/**
 * Starts the 60-second countdown timer.
 */
function startTimer() {
    clearInterval(timer); // Clear any existing timer
    timer = setInterval(() => {
        timeLeft--;
        timeLeftDisplay.textContent = timeLeft;

        if (timeLeft <= 0) {
            endGame();
            questionDisplay.textContent = `Time's up! You scored ${score} out of ${totalQuestions}.`;
        }
    }, 1000); // Update every 1 second
}