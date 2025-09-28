// EmailJS Initialization (Replace with your keys)
emailjs.init('YOUR_PUBLIC_KEY'); // Replace with your EmailJS public key. Get one from https://www.emailjs.com/

// Quiz Data - High School Level on Climate Change Evidence
const quizData = [
    {
        question: "What is the main human activity driving current climate change since the 1800s?",
        type: "multiple-choice",
        options: ["Natural orbital changes", "Burning fossil fuels", "Volcanic eruptions", "Solar flares"],
        correct: 1 // Index of Burning fossil fuels
    },
    {
        question: "How much has Earth's average surface temperature risen since the late 19th century, according to the article?",
        type: "short-answer",
        correctAnswer: "1 degree Celsius" // Or "about 2 degrees Fahrenheit" – case-insensitive match for checking logic.
    },
    {
        question: "Which evidence shows large ice masses are shrinking? (Choose the best example from the article)",
        type: "multiple-choice",
        options: ["Increasing snow cover", "Greenland losing 279 billion tons of ice per year", "Cooler oceans", "Lower sea levels"],
        correct: 1 // Index of Greenland losing 279 billion tons
    },
    {
        question: "What phenomenon has caused ocean acidity to increase by 30% since the Industrial Revolution?",
        type: "short-answer",
        correctAnswer: "CO2 absorption" // Or "absorbing carbon dioxide" or "carbon dioxide absorption" – flexible matching
    },
    {
        question: "How does the current rate of global warming compare to the warming period after the last ice age?",
        type: "multiple-choice",
        options: ["Significantly slower", "About the same", "Approximately 10 times faster", "Exactly 100 times faster"],
        correct: 2 // Index of Approximately 10 times faster
    },
    {
        question: "According to the IPCC, what is the level of certainty that human activities are the principal cause of current climate change?",
        type: "multiple-choice",
        options: ["Possible", "Likely", "Unequivocal", "Uncertain"],
        correct: 2 // Index of Unequivocal
    }
];

// Motivational Science Quotes (Updated for climate theme)
const motivationalQuotes = [
    "“The climate crisis is a real and present danger. We must act now to protect our planet.” – NASA",
    "“Human influence on the climate system is clear. It's time for bold action.” – IPCC",
    "“Science shows us the path: reduce emissions to secure a livable future.” – UN Climate Report",
    "“Every fraction of a degree matters. We can limit warming if we act today.” – Greta Thunberg",
    "“The evidence is unequivocal—our choices today shape tomorrow's climate.” – Al Gore"
];

let currentQuestionIndex = 0;
let score = 0;
let userName = '';
let userAnswers = []; // Stores { question: string, type: string, userAnswer: string, isCorrect: boolean, correctAnswer: string }

// DOM Elements
const article = document.querySelector('.article');
const startQuizBtn = document.getElementById('start-quiz-btn');
const quizSection = document.getElementById('quiz-section');
const userNameInput = document.getElementById('user-name');
const beginQuizBtn = document.getElementById('begin-quiz-btn');
const quizForm = document.getElementById('quiz-form');
const questionText = document.getElementById('question-text');
const optionsContainer = document.getElementById('options');
const shortAnswerInput = document.getElementById('short-answer-input');
const submitAnswerBtn = document.getElementById('submit-answer-btn');
const feedbackMessage = document.getElementById('feedback-message');
const quizProgress = document.getElementById('quiz-progress');
const thankYouScreen = document.getElementById('thank-you-screen');
const displayUserName = document.getElementById('display-user-name');
const finalScore = document.getElementById('final-score');
const motivationQuote = document.querySelector('.motivation-quote');
const submissionStatus = document.getElementById('submission-status');
const tryAgainBtn = document.getElementById('try-again-btn');
const progressBar = document.getElementById('progress-bar');


// --- Initial Setup and Event Listeners ---

// Activate article content for scroll animations
document.addEventListener('DOMContentLoaded', () => {
    article.classList.add('active'); // Trigger initial fade-in for article content

    // Enable begin quiz button only when name is entered
    userNameInput.addEventListener('input', () => {
        beginQuizBtn.disabled = userNameInput.value.trim() === '';
    });
});


// Scroll progress bar
window.addEventListener('scroll', () => {
    // Calculate the total scrollable height of the article within its container
    // We want the progress bar to fill as the user scrolls through the article content.
    const scrollHeight = article.scrollHeight;
    const clientHeight = article.clientHeight; // Visible height of the article

    // The maximum scroll position for the article content (when the bottom is reached)
    const maxArticleScroll = scrollHeight - clientHeight;

    // Get the current scroll position relative to the article's top
    const scrollTop = window.scrollY - article.offsetTop;

    let scrolledPercentage = 0;
    if (maxArticleScroll > 0) {
        scrolledPercentage = (scrollTop / maxArticleScroll) * 100;
        // Clamp the percentage between 0 and 100
        scrolledPercentage = Math.max(0, Math.min(100, scrolledPercentage));
    }
    
    progressBar.style.width = scrolledPercentage + '%';
});

// Start Quiz Button
startQuizBtn.addEventListener('click', () => {
    quizSection.classList.remove('hidden');
    quizSection.classList.add('visible');
    quizSection.scrollIntoView({ behavior: 'smooth' });
    article.style.marginBottom = '20px'; // Adjust spacing
});

// Begin Quiz Button (after name input)
beginQuizBtn.addEventListener('click', () => {
    userName = userNameInput.value.trim();
    if (userName) {
        quizForm.classList.remove('hidden');
        userNameInput.classList.add('hidden');
        beginQuizBtn.classList.add('hidden');
        displayQuestion();
    }
});

// Submit Answer Button
submitAnswerBtn.addEventListener('click', submitAnswer);
submitAnswerBtn.disabled = true; // Disable initially until an option is selected or text entered


// --- Quiz Logic ---

function displayQuestion() {
    feedbackMessage.textContent = ''; // Clear previous feedback
    shortAnswerInput.value = ''; // Clear previous short answer
    submitAnswerBtn.disabled = true; // Disable button for new question

    if (currentQuestionIndex < quizData.length) {
        const question = quizData[currentQuestionIndex];
        questionText.textContent = question.question;
        quizProgress.textContent = `Question ${currentQuestionIndex + 1} of ${quizData.length}`;

        optionsContainer.innerHTML = ''; // Clear previous options
        shortAnswerInput.classList.add('hidden'); // Hide short answer input by default

        if (question.type === "multiple-choice") {
            optionsContainer.classList.remove('hidden');
            question.options.forEach((option, index) => {
                const optionDiv = document.createElement('div');
                optionDiv.classList.add('option');
                optionDiv.textContent = option;
                optionDiv.dataset.index = index;
                optionDiv.addEventListener('click', () => selectOption(optionDiv, index));
                optionsContainer.appendChild(optionDiv);
            });
        } else if (question.type === "short-answer") {
            optionsContainer.classList.add('hidden');
            shortAnswerInput.classList.remove('hidden');
            shortAnswerInput.focus();
            shortAnswerInput.removeEventListener('input', toggleSubmitButton); // Remove old listener if exists
            shortAnswerInput.addEventListener('input', toggleSubmitButton); // Add new listener
            submitAnswerBtn.disabled = shortAnswerInput.value.trim() === ''; // Enable/disable based on current input
        }
    } else {
        showResults();
    }
}

function toggleSubmitButton() {
    submitAnswerBtn.disabled = shortAnswerInput.value.trim() === '';
}

function selectOption(selectedDiv, selectedIndex) {
    // Deselect all other options visually
    document.querySelectorAll('.option').forEach(opt => opt.classList.remove('selected'));
    // Mark the selected one
    selectedDiv.classList.add('selected');
    submitAnswerBtn.disabled = false; // Enable submit button

    // Directly submit for multiple-choice after selection
    // Add a small delay for visual feedback before moving to the next question
    setTimeout(() => submitAnswer(selectedIndex), 700); 
}

function submitAnswer(selectedIndex = -1) { // selectedIndex is only for multiple-choice
    const currentQ = quizData[currentQuestionIndex];
    let isCorrect = false;
    let userAnswerText = '';
    let correctAnswerText = '';

    if (currentQ.type === "multiple-choice") {
        userAnswerText = currentQ.options[selectedIndex];
        correctAnswerText = currentQ.options[currentQ.correct];
        isCorrect = (selectedIndex === currentQ.correct);

        // Visual feedback
        document.querySelectorAll('.option').forEach((opt, index) => {
            opt.style.pointerEvents = 'none'; // Disable clicking further options
            if (index === currentQ.correct) {
                opt.classList.add('correct');
            } else if (index === selectedIndex && !isCorrect) {
                opt.classList.add('incorrect');
            }
        });

    } else if (currentQ.type === "short-answer") {
        userAnswerText = shortAnswerInput.value.trim();
        correctAnswerText = currentQ.correctAnswer;
        // Case-insensitive comparison for short answers
        isCorrect = userAnswerText.toLowerCase() === currentQ.correctAnswer.toLowerCase();

        // Visual feedback
        shortAnswerInput.disabled = true; // Disable input
        if (isCorrect) {
            feedbackMessage.textContent = "Correct! 🎉";
            feedbackMessage.style.color = '#27ae60';
        } else {
            feedbackMessage.textContent = `Incorrect. The answer was: ${currentQ.correctAnswer}.`;
            feedbackMessage.style.color = '#e74c3c';
        }
    }

    if (isCorrect) {
        score++;
    }

    userAnswers.push({
        question: currentQ.question,
        type: currentQ.type,
        userAnswer: userAnswerText,
        isCorrect: isCorrect,
        correctAnswer: correctAnswerText
    });

    submitAnswerBtn.disabled = true; // Disable button after submission
    
    // Move to next question after a short delay for feedback
    setTimeout(() => {
        currentQuestionIndex++;
        displayQuestion();
        // Re-enable input if it's a short answer for next question
        shortAnswerInput.disabled = false;
        // Re-enable option clicking for next question
        document.querySelectorAll('.option').forEach(opt => opt.style.pointerEvents = 'auto');
    }, 1500); // 1.5 seconds delay
}

function showResults() {
    quizForm.classList.add('hidden');
    thankYouScreen.classList.remove('hidden');
    displayUserName.textContent = userName;
    finalScore.textContent = `${score} out of ${quizData.length}`;
    motivationQuote.textContent = motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)];
    
    // Auto-scroll to thank you screen
    thankYouScreen.scrollIntoView({ behavior: 'smooth' });

    sendEmailResults();
}

// Send results via EmailJS
function sendEmailResults() {
    submissionStatus.textContent = 'Sending your results...';
    submissionStatus.style.color = '#f39c12'; // Orange for pending

    const answersSummary = userAnswers.map((ua, index) => {
        const status = ua.isCorrect ? 'Correct' : `Incorrect (Correct was: ${ua.correctAnswer})`;
        return `Q${index + 1}: ${ua.question}\nYour Answer: "${ua.userAnswer}"\nStatus: ${status}\n`;
    }).join('\n---\n');

    const templateParams = {
        user_name: userName,
        score: `${score}/${quizData.length}`,
        answers_summary: answersSummary,
        to_email: 'matajomarr@gmail.com' // Hardcoded recipient email
    };

    // IMPORTANT: Replace 'YOUR_SERVICE_ID' and 'YOUR_TEMPLATE_ID' with your actual EmailJS IDs
    // You'll need to set these up on the EmailJS website (emailjs.com)
    emailjs.send('YOUR_SERVICE_ID', 'YOUR_TEMPLATE_ID', templateParams)
        .then((response) => {
            console.log('SUCCESS!', response.status, response.text);
            submissionStatus.textContent = 'Your results have been sent successfully! 🎉';
            submissionStatus.style.color = '#27ae60'; // Green for success
        }, (error) => {
            console.error('FAILED...', error);
            submissionStatus.textContent = 'Failed to send results. Please check your internet and EmailJS setup. Error: ' + error.text;
            submissionStatus.style.color = '#e74c3c'; // Red for error
        });
}

// Try Again Button
tryAgainBtn.addEventListener('click', () => {
    currentQuestionIndex = 0;
    score = 0;
    userName = '';
    userAnswers = [];
    
    // Reset display
    thankYouScreen.classList.add('hidden');
    quizForm.classList.add('hidden');
    userNameInput.classList.remove('hidden');
    beginQuizBtn.classList.remove('hidden');
    userNameInput.value = ''; // Clear name input
    beginQuizBtn.disabled = true; // Disable begin button
    quizSection.scrollIntoView({ behavior: 'smooth' }); // Scroll back to quiz start
    submissionStatus.textContent = ''; // Clear submission message
});
