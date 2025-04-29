document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const viewResultsBtn = document.getElementById('view-results');
    const manageQuestionsBtn = document.getElementById('manage-questions');
    const resultsSection = document.getElementById('results-section');
    const questionsSection = document.getElementById('questions-section');
    const searchInput = document.getElementById('search-students');
    const studentsTable = document.getElementById('students-table')?.getElementsByTagName('tbody')[0];
    
    // Question Management Elements
    const questionsContainer9_12 = document.getElementById('questions-container-9-12');
    const questionsContainer13_15 = document.getElementById('questions-container-13-15');
    const questionsContainer16_19 = document.getElementById('questions-container-16-19');
    const addQuestion9_12Btn = document.getElementById('add-question-9-12');
    const addQuestion13_15Btn = document.getElementById('add-question-13-15');
    const addQuestion16_19Btn = document.getElementById('add-question-16-19');
    const saveQuestions9_12Btn = document.getElementById('save-questions-9-12');
    const saveQuestions13_15Btn = document.getElementById('save-questions-13-15');
     const saveQuestions16_19Btn = document.getElementById('save-questions-16-19');
    
    
    // Password Change Elements
    const changePasswordBtn = document.getElementById('change-password-btn');
    const passwordModal = document.getElementById('password-modal');
    const closeModal = document.querySelector('.close-modal');
    const changePasswordForm = document.getElementById('change-password-form');
    
    // Data Stores
    let questions9_12 = [];
    let questions13_15 = [];
    let questions16_19 = [];
    
    // Initialize the page
    function initPage() {
        if (viewResultsBtn && manageQuestionsBtn && resultsSection && questionsSection) {
            viewResultsBtn.classList.add('active');
            resultsSection.style.display = 'block';
            questionsSection.style.display = 'none';
        }
        
        // Load initial data if needed
        if (questionsSection.style.display === 'block') {
            loadQuestions();
        }
    }
    
    // Tab switching
    if (viewResultsBtn && manageQuestionsBtn) {
        viewResultsBtn.addEventListener('click', function() {
            viewResultsBtn.classList.add('active');
            manageQuestionsBtn.classList.remove('active');
            if (resultsSection) resultsSection.style.display = 'block';
            if (questionsSection) questionsSection.style.display = 'none';
        });
        
        manageQuestionsBtn.addEventListener('click', function() {
            manageQuestionsBtn.classList.add('active');
            viewResultsBtn.classList.remove('active');
            if (resultsSection) resultsSection.style.display = 'none';
            if (questionsSection) questionsSection.style.display = 'block';
            loadQuestions();
        });
    }
    
    // Age group switching
    document.querySelectorAll('.age-group-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.age-group-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            const ageGroup = this.dataset.ageGroup;
            const questionsList9_12 = document.getElementById('questions-list-9-12');
            const questionsList13_15 = document.getElementById('questions-list-13-15');
            const questionsList16_19 = document.getElementById('questions-list-16-19');
            
            if (questionsList9_12) questionsList9_12.style.display = ageGroup === '9-12' ? 'block' : 'none';
            if (questionsList13_15) questionsList13_15.style.display = ageGroup === '13-15' ? 'block' : 'none';
            if (questionsList16_19) questionsList16_19.style.display = ageGroup === '16-19' ? 'block' : 'none';
        });
    });
    
    // Search functionality
    if (searchInput && studentsTable) {
        searchInput.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase();
            const rows = studentsTable.getElementsByTagName('tr');
            
            for (let row of rows) {
                const name = row.cells[0].textContent.toLowerCase();
                row.style.display = name.includes(searchTerm) ? '' : 'none';
            }
        });
    }
    
    // Load questions function
    function loadQuestions() {
        console.log('Loading questions...');
        
        // Set loading states
        if (questionsContainer9_12) questionsContainer9_12.innerHTML = '<p>Loading questions for 9-12...</p>';
        if (questionsContainer13_15) questionsContainer13_19.innerHTML = '<p>Loading questions for 13-15...</p>';
        if (questionsContainer16_19) questionsContainer13_19.innerHTML = '<p>Loading questions for 16-19...</p>';
        
        // Load questions for 9-12
        fetch('/questions/9-12')
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                if (!Array.isArray(data)) {
                    throw new Error('Invalid data format received');
                }
                questions9_12 = data;
                renderQuestions('9-12', data);
            })
            .catch(error => {
                console.error('Error loading 9-12 questions:', error);
                if (questionsContainer9_12) {
                    questionsContainer9_12.innerHTML = `<p class="error">Error loading questions: ${error.message}</p>`;
                }
            });

        
        
        // Load questions for 13-15
        fetch('/questions/13-15')
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                if (!Array.isArray(data)) {
                    throw new Error('Invalid data format received');
                }
                questions13_15 = data;
                renderQuestions('13-15', data);
            })
            .catch(error => {
                console.error('Error loading 13-15 questions:', error);
                if (questionsContainer13_15) {
                    questionsContainer13_15.innerHTML = `<p class="error">Error loading questions: ${error.message}</p>`;
                }
            });

        

            // Load questions for 16-19
        fetch('/questions/16-19')
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                if (!Array.isArray(data)) {
                    throw new Error('Invalid data format received');
                }
                questions16_19 = data;
                renderQuestions('16-19', data);
            })
            .catch(error => {
                console.error('Error loading 16-19 questions:', error);
                if (questionsContainer16_19) {
                    questionsContainer16_19.innerHTML = `<p class="error">Error loading questions: ${error.message}</p>`;
                }
            });
    }

    
    // Render questions
    function renderQuestions(ageGroup, questions) {
        const container = document.getElementById(`questions-container-${ageGroup}`);
        if (!container) {
            console.error(`Container not found for age group ${ageGroup}`);
            return;
        }
        
        container.innerHTML = '';
        
        if (!questions || questions.length === 0) {
            container.innerHTML = '<p>No questions found. Add some using the button below.</p>';
            return;
        }
        
        questions.forEach((question, index) => {
            const questionDiv = document.createElement('div');
            questionDiv.className = 'question-item';
            questionDiv.innerHTML = `
                <div class="question-header">
                    <h4>Question ${index + 1}</h4>
                    <button class="delete-question" data-age-group="${ageGroup}" data-index="${index}">Delete</button>
                </div>
                <div class="form-group">
                    <label>Question:</label>
                    <input type="text" class="question-text" value="${question.question || ''}" 
                           data-age-group="${ageGroup}" data-index="${index}">
                </div>
                <div class="form-group">
                    <label>Options:</label>
                    ${(question.options || ['', '', '', '']).map((option, i) => `
                        <input type="text" class="question-option" value="${option || ''}" 
                               data-age-group="${ageGroup}" data-index="${index}" data-option="${i}">
                    `).join('')}
                </div>
                <div class="form-group">
                    <label>Correct Answer:</label>
                    <select class="correct-answer" data-age-group="${ageGroup}" data-index="${index}">
                        ${(question.options || ['', '', '', '']).map((_, i) => `
                            <option value="${i}" ${i === (question.correctAnswer || 0) ? 'selected' : ''}>
                                Option ${i + 1}
                            </option>
                        `).join('')}
                    </select>
                </div>
            `;
            
            container.appendChild(questionDiv);
        });
        
        // Add event listeners for delete buttons
        document.querySelectorAll(`.delete-question[data-age-group="${ageGroup}"]`).forEach(btn => {
            btn.addEventListener('click', function() {
                const index = parseInt(this.dataset.index);
                if (ageGroup === '9-12') {
                    questions9_12.splice(index, 1);
                } else {
                    questions13_15.splice(index, 1);
                    questions16_19.splice(index, 1);
                }
                renderQuestions(ageGroup, ageGroup === '9-12' ? questions9_12 : ageGroup === '13-15' ? questions13_15 : questions16_19);        

            });
        });
        
        // Add event listeners for question updates
        document.querySelectorAll(`.question-text[data-age-group="${ageGroup}"]`).forEach(input => {
            input.addEventListener('change', function() {
                const index = parseInt(this.dataset.index);
                if (ageGroup === '9-12') {
                    questions9_12[index].question = this.value;
                } else {
                    questions13_15[index].question = this.value;
                    questions16_19[index].question = this.value;
                }
            });
        });
        
        document.querySelectorAll(`.question-option[data-age-group="${ageGroup}"]`).forEach(input => {
            input.addEventListener('change', function() {
                const index = parseInt(this.dataset.index);
                const optionIndex = parseInt(this.dataset.option);
                if (ageGroup === '9-12') {
                    if (!questions9_12[index].options) questions9_12[index].options = ['', '', '', ''];
                    questions9_12[index].options[optionIndex] = this.value;
                } else {
                    if (!questions13_15[index].options) questions13_15[index].options = ['', '', '', ''];
                    questions13_15[index].options[optionIndex] = this.value;
                    if (!questions16_19[index].options) questions16_19[index].options = ['', '', '', ''];
                    questions16_19[index].options[optionIndex] = this.value;
                }
            });
        });
        
        document.querySelectorAll(`.correct-answer[data-age-group="${ageGroup}"]`).forEach(select => {
            select.addEventListener('change', function() {
                const index = parseInt(this.dataset.index);
                if (ageGroup === '9-12') {
                    questions9_12[index].correctAnswer = parseInt(this.value);
                } else {
                    questions13_15[index].correctAnswer = parseInt(this.value);
                    questions16_19[index].correctAnswer = parseInt(this.value);
                }
            });
        });
    }
    
    // Add new question
    if (addQuestion9_12Btn) {
        addQuestion9_12Btn.addEventListener('click', function() {
            questions9_12.push({
                question: 'New question',
                options: ['Option 1', 'Option 2', 'Option 3', 'Option 4'],
                correctAnswer: 0
            });
            renderQuestions('9-12', questions9_12);
        });
    }
    
    if (addQuestion13_15Btn) {
        addQuestion13_15Btn.addEventListener('click', function() {
            questions13_15.push({
                question: 'New question',
                options: ['Option 1', 'Option 2', 'Option 3', 'Option 4'],
                correctAnswer: 0
            });
            renderQuestions('13-15', questions13_15);
        });
    }

    if (addQuestion16_19Btn) {
        addQuestion16_19Btn.addEventListener('click', function() {
            questions16_19.push({
                question: 'New question',
                options: ['Option 1', 'Option 2', 'Option 3', 'Option 4'],
                correctAnswer: 0
            });
            renderQuestions('16-19', questions16_19);
        });
    }
    
    // Save questions
    if (saveQuestions9_12Btn) {
        saveQuestions9_12Btn.addEventListener('click', function() {
            saveQuestions('9-12', questions9_12);
        });
    }
    
    if (saveQuestions13_15Btn) {
        saveQuestions13_15Btn.addEventListener('click', function() {
            saveQuestions('13-15', questions13_15);
        });
    }

    if (saveQuestions16_19Btn) {
        saveQuestions16_19Btn.addEventListener('click', function() {
            saveQuestions('16-19', questions16_19);
        });
    }
    
    function saveQuestions(ageGroup, questions) {
        fetch('/admin/questions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ ageGroup, questions })
        })
        .then(response => {
            if (!response.ok) {
                return response.json().then(err => {
                    throw new Error(err.error || 'Failed to save questions');
                });
            }
            return response.json();
        })
        .then(data => {
            alert('Questions saved successfully!');
        })
        .catch(error => {
            console.error('Error saving questions:', error);
            alert(`Error saving questions: ${error.message}`);
        });
    }
    
    // Password change functionality
    if (changePasswordBtn && passwordModal && closeModal && changePasswordForm) {
        changePasswordBtn.addEventListener('click', function() {
            passwordModal.style.display = 'block';
        });
        
        closeModal.addEventListener('click', function() {
            passwordModal.style.display = 'none';
        });
        
        window.addEventListener('click', function(event) {
            if (event.target === passwordModal) {
                passwordModal.style.display = 'none';
            }
        });
        
        changePasswordForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const currentPassword = document.getElementById('current-password').value;
            const newPassword = document.getElementById('new-password').value;
            const confirmPassword = document.getElementById('confirm-password').value;
            const messageEl = document.getElementById('password-change-message');
            
            // Validation
            if (newPassword !== confirmPassword) {
                messageEl.textContent = 'New passwords do not match';
                messageEl.style.color = 'red';
                return;
            }
            
            if (newPassword.length < 8) {
                messageEl.textContent = 'Password must be at least 8 characters';
                messageEl.style.color = 'red';
                return;
            }
            
            // Submit to server
            fetch('/admin/change-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    currentPassword,
                    newPassword
                })
            })
            .then(response => {
                if (!response.ok) {
                    return response.json().then(err => {
                        throw new Error(err.error || 'Password change failed');
                    });
                }
                return response.json();
            })
            .then(data => {
                messageEl.textContent = 'Password changed successfully!';
                messageEl.style.color = 'green';
                changePasswordForm.reset();
                setTimeout(() => {
                    passwordModal.style.display = 'none';
                    messageEl.textContent = '';
                }, 2000);
            })
            .catch(error => {
                console.error('Error:', error);
                messageEl.textContent = error.message || 'An error occurred';
                messageEl.style.color = 'red';
            });
        });
    }
    
    // Initialize the page
    initPage();
});