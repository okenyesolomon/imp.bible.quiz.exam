document.addEventListener('DOMContentLoaded', function() {
    // Get result ID from URL or localStorage
    const urlParams = new URLSearchParams(window.location.search);
    const resultId = urlParams.get('id') || localStorage.getItem('resultId');
    
    if (!resultId) {
        window.location.href = '/'; // Redirect if no result ID
        return;
    }
    
    // Load results
    fetch(`/api/results/${resultId}`)
        .then(response => response.json())
        .then(data => {
            displayResults(data);
        })
        .catch(error => {
            console.error('Error loading results:', error);
            alert('Failed to load examination results. Please try again.');
            window.location.href = '/';
        });
    
    function displayResults(result) {
        // Display student info
        document.getElementById('studentName').textContent = result.student.fullName;
        document.getElementById('ageGroup').textContent = result.student.ageGroup;
        document.getElementById('parish').textContent = result.student.parish;
        document.getElementById('zone').textContent = result.student.zone;
        
        // Display score summary
        const totalQuestions = result.questions.length;
        const correctAnswers = result.score;
        const wrongAnswers = totalQuestions - correctAnswers;
        const percentage = Math.round((correctAnswers / totalQuestions) * 100);
        
        document.getElementById('totalQuestions').textContent = totalQuestions;
        document.getElementById('correctAnswers').textContent = correctAnswers;
        document.getElementById('wrongAnswers').textContent = wrongAnswers;
        document.getElementById('scorePercentage').textContent = `${percentage}%`;
        
        // Display question review
        const reviewContainer = document.getElementById('questionReview');
        reviewContainer.innerHTML = '';
        
        result.questions.forEach((question, index) => {
            const reviewItem = document.createElement('div');
            reviewItem.className = `review-item ${result.answers[index] === question.correctAnswerIndex ? 'correct' : 'incorrect'}`;
            
            const questionText = document.createElement('p');
            questionText.className = 'review-question';
            questionText.innerHTML = `${index + 1}. ${question.question}`;
            reviewItem.appendChild(questionText);
            
            // User's answer
            const userAnswer = document.createElement('p');
            if (result.answers[index] === -1) {
                userAnswer.innerHTML = `Your answer: No answer provided`;
            } else {
                userAnswer.innerHTML = `Your answer: ${question.options[result.answers[index]]}`;
            }
            reviewItem.appendChild(userAnswer);
            
            // Correct answer (only show if user got it wrong)
            if (result.answers[index] !== question.correctAnswerIndex) {
                const correctAnswer = document.createElement('p');
                correctAnswer.innerHTML = `Correct answer: ${question.options[question.correctAnswerIndex]}`;
                correctAnswer.className = 'correct-answer';
                reviewItem.appendChild(correctAnswer);
            }
            
            reviewContainer.appendChild(reviewItem);
        });
    }
});