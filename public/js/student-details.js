document.addEventListener('DOMContentLoaded', async function() {
    const studentId = new URLSearchParams(window.location.search).get('id');
    if (!studentId) {
        alert('No student ID provided');
        window.location.href = '/admin';
        return;
    }

    try {
        const token = localStorage.getItem('adminToken');
        if (!token) throw new Error('Not authenticated');
        
        const response = await fetch(`/api/student/${studentId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) throw new Error('Failed to fetch student');
        
        const student = await response.json();
        renderStudentDetails(student);
        
    } catch (error) {
        console.error('Error:', error);
        alert(error.message);
        window.location.href = '/login';
    }
});

function renderStudentDetails(student) {
    const percentage = student.answers.length > 0 
        ? Math.round((student.score / student.answers.length) * 100)
        : 0;
    
    document.getElementById('studentInfo').innerHTML = `
        <h2>${student.fullName}</h2>
        <div class="student-meta">
            <p><strong>Gender:</strong> ${student.gender}</p>
            <p><strong>Age Group:</strong> ${student.ageGroup}</p>
            <p><strong>Parish:</strong> ${student.parish}</p>
            <p><strong>Zone:</strong> ${student.zone}</p>
            <p><strong>Score:</strong> ${student.score}/${student.answers.length} (${percentage}%)</p>
        </div>
    `;
    
    const resultsDiv = document.getElementById('examResults');
    resultsDiv.innerHTML = '<h3>Exam Answers:</h3>';
    
    if (student.answers.length === 0) {
        resultsDiv.innerHTML += '<p>No answers recorded</p>';
        return;
    }
    
    student.answers.forEach((answer, index) => {
        resultsDiv.innerHTML += `
            <div class="question-result ${answer.isCorrect ? 'correct' : 'incorrect'}">
                <p><strong>Question ${index + 1}:</strong></p>
                <p>Answer: ${answer.answer || 'N/A'}</p>
                <p>Status: ${answer.isCorrect ? '✅ Correct' : '❌ Incorrect'}</p>
            </div>
        `;
    });
}