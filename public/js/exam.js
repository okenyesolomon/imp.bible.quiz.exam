document.addEventListener('DOMContentLoaded', function() {
    const infoForm = document.getElementById('infoForm');
    const examSection = document.getElementById('exam-section');
    const resultsSection = document.getElementById('results-section');
    const questionsContainer = document.getElementById('questions-container');
    const examForm = document.getElementById('examForm');
    const timeDisplay = document.getElementById('time');
    const navButtonsContainer = document.getElementById('nav-buttons');
    
    let timer;
    let timeLeft = 15 * 60; // 15 minutes in seconds
    let studentData = {};
    let questions = [];
    let userAnswers = []; // Array to store all user answers
    let currentQuestionIndex = 0;
    
    // Handle student info form submission
    infoForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        studentData = {
            fullName: document.getElementById('fullName').value,
            gender: document.getElementById('gender').value,
            zone: document.getElementById('zone').value,
            parish: document.getElementById('parish').value,
            ageGroup: document.querySelector('input[name="ageGroup"]:checked').value
        };
        
        fetch(`/questions/${studentData.ageGroup}`)
            .then(response => response.json())
            .then(data => {
                questions = data;
                userAnswers = new Array(questions.length).fill(null); // Initialize answers array
                document.getElementById('student-info-form').style.display = 'none';
                examSection.style.display = 'block';
                startTimer();
                displayQuestion(currentQuestionIndex);
                updateNavButtons();
            })
            .catch(error => {
                console.error('Error fetching questions:', error);
                alert('Failed to load questions. Please try again.');
            });
    });
    
    function displayQuestion(index) {
        questionsContainer.innerHTML = '';
        
        const question = questions[index];
        const questionDiv = document.createElement('div');
        questionDiv.className = 'question';
        
        let questionHTML = `
            <h3>Question ${index + 1}: ${question.question}</h3>
            <div class="options">
        `;
        
        switch(question.type) {
            case 'truefalse':
                questionHTML += `
                    <label>
                        <input type="radio" name="q${index}" value="true" 
                               onchange="saveAnswer(${index}, this.value)" ${userAnswers[index] === 'true' ? 'checked' : ''}>
                        True
                    </label>
                    <label>
                        <input type="radio" name="q${index}" value="false" 
                               onchange="saveAnswer(${index}, this.value)" ${userAnswers[index] === 'false' ? 'checked' : ''}>
                        False
                    </label>
                `;
                break;
                
            case 'fillblank':
                questionHTML += `
                    <input type="text" name="q${index}" placeholder="Type your answer here..." 
                           value="${userAnswers[index] || ''}" 
                           onchange="saveAnswer(${index}, this.value)" 
                           onkeyup="saveAnswer(${index}, this.value)"
                           class="${userAnswers[index] ? 'answered' : ''}">
                `;
                break;
                                
            case 'multiple':
            default:
                questionHTML += question.options.map((option, i) => `
                    <label>
                        <input type="radio" name="q${index}" value="${i}" 
                               onchange="saveAnswer(${index}, this.value)" ${userAnswers[index] === i.toString() ? 'checked' : ''}>
                        ${option}
                    </label>
                `).join('');
        }
        
        questionHTML += `</div>`;
        questionDiv.innerHTML = questionHTML;
        questionsContainer.appendChild(questionDiv);
        
        // Add event listeners to prevent default selection
        preventDefaultSelection(index);
    }
    
    // Function to prevent default selection of options
    function preventDefaultSelection(index) {
        const inputs = document.querySelectorAll(`input[name="q${index}"]`);
        inputs.forEach(input => {
            input.addEventListener('mousedown', function(e) {
                if (this.checked) {
                    e.preventDefault();
                }
            });
            
            input.addEventListener('keydown', function(e) {
                if (this.checked && (e.key === ' ' || e.key === 'Enter')) {
                    e.preventDefault();
                }
            });
        });
    }
    
    // Save answer to userAnswers array
    window.saveAnswer = function(index, value) {
        userAnswers[index] = value;
        // Update the navigation buttons to reflect answered questions
        updateNavButtons();
    };
    
    // Update navigation buttons
    function updateNavButtons() {
        navButtonsContainer.innerHTML = '';

       // Create main navigation container
    const mainNav = document.createElement('div');
    mainNav.className = 'main-navigation';
    
    // Previous button
    if (currentQuestionIndex > 0) {
        const prevButton = document.createElement('button');
        prevButton.type = 'button';
        prevButton.textContent = 'Previous';
        prevButton.className = 'nav-button prev-button';
        prevButton.addEventListener('click', goToPreviousQuestion);
        mainNav.appendChild(prevButton);
    }
    
    // Next/Submit button
    if (currentQuestionIndex < questions.length - 1) {
        const nextButton = document.createElement('button');
        nextButton.type = 'button';
        nextButton.textContent = userAnswers[currentQuestionIndex] !== null ? 'Save & Next' : 'Next';
        nextButton.className = 'nav-button next-button';
        nextButton.addEventListener('click', () => {
            saveCurrentAnswer();
            goToNextQuestion();
        });
        mainNav.appendChild(nextButton);
    } else {
        const submitButton = document.createElement('button');
        submitButton.type = 'button';
        submitButton.textContent = 'Submit Exam';
        submitButton.className = 'nav-button submit-button';
        submitButton.addEventListener('click', submitExam);
        mainNav.appendChild(submitButton);
    }
    
    navButtonsContainer.appendChild(mainNav);
    
    // Create question number navigation (positioned at bottom)
    const questionNav = document.createElement('div');
    questionNav.className = 'question-number-nav';
    
    questions.forEach((_, i) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.textContent = i + 1;
        btn.className = `question-nav-btn ${i === currentQuestionIndex ? 'active' : ''} ${userAnswers[i] !== null ? 'answered' : ''}`;
        btn.addEventListener('click', () => {
            saveCurrentAnswer();
            currentQuestionIndex = i;
            displayQuestion(currentQuestionIndex);
            updateNavButtons();
        });
        questionNav.appendChild(btn);
    });
    
    navButtonsContainer.appendChild(questionNav);
}

    
    // Save the current question's answer
    function saveCurrentAnswer() {
        const question = questions[currentQuestionIndex];
        if (question.type === 'fillblank') {
            const input = document.querySelector(`input[name="q${currentQuestionIndex}"]`);
            if (input && input.value.trim()) {
                userAnswers[currentQuestionIndex] = input.value.trim();
            }
        } else {
            const selected = document.querySelector(`input[name="q${currentQuestionIndex}"]:checked`);
            if (selected) {
                userAnswers[currentQuestionIndex] = selected.value;
            }
        }
    }
    
    // Go to next question
    function goToNextQuestion() {
        if (currentQuestionIndex < questions.length - 1) {
            currentQuestionIndex++;
            displayQuestion(currentQuestionIndex);
            updateNavButtons();
        }
    }
    
    // Go to previous question
    function goToPreviousQuestion() {
        if (currentQuestionIndex > 0) {
            currentQuestionIndex--;
            displayQuestion(currentQuestionIndex);
            updateNavButtons();
        }
    }
    
    // Start exam timer
    function startTimer() {
        updateTimerDisplay();
        
        timer = setInterval(() => {
            timeLeft--;
            updateTimerDisplay();
            
            if (timeLeft <= 0) {
                clearInterval(timer);
                submitExam();
            }
        }, 1000);
    }
    
    // Update timer display
    function updateTimerDisplay() {
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        timeDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        if (timeLeft <= 60) { // Last minute
            timeDisplay.style.color = 'red';
        }
    }
    
    // Handle exam form submission
    examForm.addEventListener('submit', function(e) {
        e.preventDefault();
        submitExam();
    });
    
    // Submit exam
    function submitExam() {
        clearInterval(timer);
        
        // Make sure all answers are saved
        saveCurrentAnswer();
        
        const answers = [];
        questions.forEach((question, index) => {
            const userAnswer = userAnswers[index];
            answers.push({
                questionId: question.id || index,
                type: question.type,
                userAnswer: userAnswer,
                correctAnswer: question.correctAnswer,
                isCorrect: checkAnswerCorrectness(question, userAnswer)
            });
        });
        
        const submission = {
            ...studentData,
            answers
        };
        
        fetch('/submit', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(submission)
        })
        .then(response => {
            if (!response.ok) {
                return response.json().then(err => { throw new Error(err.error); });
            }
            return response.json();
        })
        .then(data => {
            examSection.style.display = 'none';
            resultsSection.style.display = 'block';
            
            document.getElementById('student-name').textContent = studentData.fullName;
            document.getElementById('score').textContent = `${data.score}/${data.totalQuestions}`;
            document.getElementById('percentage').textContent = `${data.percentage}%`;
            document.getElementById('total-questions').textContent = data.totalQuestions;
        })
        .catch(error => {
            alert(error.message);
            window.location.href = '/exam';
        });
    }
    
    // Check if answer is correct based on question type
    function checkAnswerCorrectness(question, userAnswer) {
        if (userAnswer === null) return false;
        
        switch(question.type) {
            case 'truefalse':
                return userAnswer === question.correctAnswer.toString();
                
            case 'fillblank':
                // Case-insensitive comparison for fill-in-the-blank
                return userAnswer.toLowerCase() === question.correctAnswer.toLowerCase();
                
            case 'multiple':
                return parseInt(userAnswer) === question.correctAnswer;
                
            default:
                return false;
        }
    }
});

document.addEventListener('keydown', function(e) {
    // Detect Ctrl+T (Windows/Linux) or Cmd+T (Mac)
    if ((e.ctrlKey || e.metaKey) && e.key === 't') {
        e.preventDefault();
        alert('Opening new tabs is not allowed!');
    }
});

window.addEventListener('beforeunload', function(e) {
    e.preventDefault();
    // Modern browsers require setting returnValue
    e.returnValue = 'Are you sure you want to leave?';
    return e.returnValue;
});

document.addEventListener('keydown', function(e) {
    // Detect F5 or Ctrl+R (Windows/Linux) or Cmd+R (Mac)
    if (e.key === 'F5' || ((e.ctrlKey || e.metaKey) && e.key === 'r')) {
        e.preventDefault();
        alert('Page reload is not allowed!');
    }
});

// Also prevent right-click -> reload
document.addEventListener('contextmenu', function(e) {
    e.preventDefault();
    alert('Right-click is disabled!');
});