document.addEventListener('DOMContentLoaded', function() {
    const registrationForm = document.getElementById('registrationForm');
    
    if (registrationForm) {
        registrationForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form data
            const formData = {
                fullName: document.getElementById('fullName').value.trim(),
                gender: document.querySelector('input[name="gender"]:checked').value,
                zone: document.getElementById('zone').value.trim(),
                parish: document.getElementById('parish').value.trim(),
                ageGroup: document.querySelector('input[name="ageGroup"]:checked').value
            };
            
            // Validate data
            if (!formData.fullName || !formData.zone || !formData.parish) {
                alert('Please fill in all required fields.');
                return;
            }
            
            // Check if student has already taken the exam
            fetch('/api/check-student', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            })
            .then(response => response.json())
            .then(data => {
                if (data.exists) {
                    alert('You have already taken this examination. Each student can only take the exam once.');
                } else {
                    // Save to session and redirect to exam
                    localStorage.setItem('studentInfo', JSON.stringify(formData));
                    window.location.href = '/exam';
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('An error occurred. Please try again.');
            });
        });
    }
});