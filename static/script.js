let currentOperand = '0';
let previousOperand = '';
let operation = null;

const currentOperandElement = document.getElementById('current-operand');
const previousOperandElement = document.getElementById('previous-operand');

function updateDisplay() {
    currentOperandElement.textContent = currentOperand;
    if (previousOperand !== '' && operation !== null) {
        previousOperandElement.textContent = `${previousOperand} ${getOperatorSymbol(operation)}`;
    } else {
        previousOperandElement.textContent = previousOperand;
    }
}

function getOperatorSymbol(op) {
    const symbols = {
        '+': '+',
        '-': '−',
        '*': '×',
        '/': '÷',
        '%': '%'
    };
    return symbols[op] || op;
}

function appendNumber(number) {
    // Remove error state if present
    document.querySelector('.display').classList.remove('error');

    if (number === '.' && currentOperand.includes('.')) return;

    if (currentOperand === '0' && number !== '.') {
        currentOperand = number;
    } else {
        currentOperand += number;
    }

    updateDisplay();
    addButtonAnimation(event.target);
}

function appendOperator(op) {
    if (currentOperand === '') return;

    if (previousOperand !== '') {
        calculate();
    }

    operation = op;
    previousOperand = currentOperand;
    currentOperand = '';

    updateDisplay();
    addButtonAnimation(event.target);
}

function calculate() {
    const display = document.querySelector('.display');
    display.classList.remove('error');

    if (operation === null || currentOperand === '') {
        return;
    }

    const expression = `${previousOperand}${operation}${currentOperand}`;

    fetch('/calculate', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ expression: expression })
    })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                currentOperand = 'Error';
                display.classList.add('error');
            } else {
                // Format the result to avoid floating point issues
                let result = data.result;
                if (typeof result === 'number') {
                    // Round to 10 decimal places to avoid floating point errors
                    result = Math.round(result * 10000000000) / 10000000000;
                    // Convert to string and remove trailing zeros
                    result = result.toString();
                }
                currentOperand = result;
            }
            previousOperand = '';
            operation = null;
            updateDisplay();
        })
        .catch(error => {
            currentOperand = 'Error';
            display.classList.add('error');
            previousOperand = '';
            operation = null;
            updateDisplay();
        });

    addButtonAnimation(event.target);
}

function clearDisplay() {
    currentOperand = '0';
    previousOperand = '';
    operation = null;
    document.querySelector('.display').classList.remove('error');
    updateDisplay();
    addButtonAnimation(event.target);
}

function deleteLast() {
    if (currentOperand === 'Error') {
        clearDisplay();
        return;
    }

    if (currentOperand.length === 1) {
        currentOperand = '0';
    } else {
        currentOperand = currentOperand.slice(0, -1);
    }

    updateDisplay();
    addButtonAnimation(event.target);
}

function addButtonAnimation(button) {
    if (!button) return;

    button.style.transform = 'scale(0.95)';
    setTimeout(() => {
        button.style.transform = '';
    }, 100);
}

// Keyboard support
document.addEventListener('keydown', (e) => {
    if (e.key >= '0' && e.key <= '9') {
        appendNumber(e.key);
    } else if (e.key === '.') {
        appendNumber('.');
    } else if (e.key === '+' || e.key === '-' || e.key === '*' || e.key === '/') {
        appendOperator(e.key);
    } else if (e.key === '%') {
        appendOperator('%');
    } else if (e.key === 'Enter' || e.key === '=') {
        e.preventDefault();
        calculate();
    } else if (e.key === 'Escape') {
        clearDisplay();
    } else if (e.key === 'Backspace') {
        e.preventDefault();
        deleteLast();
    }
});

// Initialize display
updateDisplay();

// Timer functionality
let timerInterval = null;
let timerSeconds = 0;
let isTimerRunning = false;

const timerDisplay = document.getElementById('timer-display');
const startBtn = document.getElementById('start-btn');
const stopBtn = document.getElementById('stop-btn');
const resetBtn = document.getElementById('reset-btn');

function formatTime(totalSeconds) {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function updateTimerDisplay() {
    timerDisplay.textContent = formatTime(timerSeconds);
}

function updateTimerButtons() {
    if (isTimerRunning) {
        startBtn.disabled = true;
        stopBtn.disabled = false;
        resetBtn.disabled = true;
        timerDisplay.classList.add('running');
    } else {
        startBtn.disabled = false;
        stopBtn.disabled = true;
        resetBtn.disabled = timerSeconds === 0;
        timerDisplay.classList.remove('running');
    }
}

function startTimer() {
    if (isTimerRunning) return;

    isTimerRunning = true;
    updateTimerButtons();

    timerInterval = setInterval(() => {
        timerSeconds++;
        updateTimerDisplay();
    }, 1000);

    // Add animation to start button
    startBtn.style.transform = 'scale(0.95)';
    setTimeout(() => {
        startBtn.style.transform = '';
    }, 100);
}

function stopTimer() {
    if (!isTimerRunning) return;

    isTimerRunning = false;
    clearInterval(timerInterval);
    timerInterval = null;
    updateTimerButtons();

    // Add animation to stop button
    stopBtn.style.transform = 'scale(0.95)';
    setTimeout(() => {
        stopBtn.style.transform = '';
    }, 100);
}

function resetTimer() {
    if (isTimerRunning) return;

    timerSeconds = 0;
    updateTimerDisplay();
    updateTimerButtons();

    // Add animation to reset button
    resetBtn.style.transform = 'scale(0.95)';
    setTimeout(() => {
        resetBtn.style.transform = '';
    }, 100);
}

// Initialize timer buttons
updateTimerButtons();
