const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// Database file paths
const DATA_DIR = path.join(__dirname, 'data');
const QUESTIONS_DIR = path.join(DATA_DIR, 'questions');
const STUDENTS_FILE = path.join(DATA_DIR, 'students.json');
const RESULTS_FILE = path.join(DATA_DIR, 'results.json');

// Initialize the database structure
function initializeDB() {
    // Create directories if they don't exist
    if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR);
    }
    
    if (!fs.existsSync(QUESTIONS_DIR)) {
        fs.mkdirSync(QUESTIONS_DIR);
    }
    
    // Create question files for each age group
    const juniorQuestionsFile = path.join(QUESTIONS_DIR, '9-12.json');
    if (!fs.existsSync(juniorQuestionsFile)) {
        fs.writeFileSync(juniorQuestionsFile, JSON.stringify(getSampleQuestions('9-12')));
    }

     const juniorQuestionsFile = path.join(QUESTIONS_DIR, '13-15.json');
    if (!fs.existsSync(juniorQuestionsFile)) {
        fs.writeFileSync(juniorQuestionsFile, JSON.stringify(getSampleQuestions('13-15')));
    }
    
    const seniorQuestionsFile = path.join(QUESTIONS_DIR, '16-19.json');
    if (!fs.existsSync(seniorQuestionsFile)) {
        fs.writeFileSync(seniorQuestionsFile, JSON.stringify(getSampleQuestions('16-19')));
    }
    
    // Create students file
    if (!fs.existsSync(STUDENTS_FILE)) {
        fs.writeFileSync(STUDENTS_FILE, JSON.stringify([]));
    }
    
    // Create results file
    if (!fs.existsSync(RESULTS_FILE)) {
        fs.writeFileSync(RESULTS_FILE, JSON.stringify([]));
    }
}

// Sample questions for initial setup
function getSampleQuestions(ageGroup) {
    if (ageGroup === '9-12') {
        return [
            {
                id: uuidv4(),
                question: "Who was the first person created by God according to the Bible?",
                options: ["Adam", "Eve", "Noah", "Abraham"],
                correctAnswerIndex: 0
            },
            {
                id: uuidv4(),
                question: "How many days did it take God to create the world?",
                options: ["3 days", "6 days", "7 days", "40 days"],
                correctAnswerIndex: 1
            },
            {
                id: uuidv4(),
                question: "What is the first book of the Bible?",
                options: ["Exodus", "Genesis", "Matthew", "Psalms"],
                correctAnswerIndex: 1
            },
            {
                id: uuidv4(),
                question: "Who built the ark as instructed by God?",
                options: ["Moses", "Abraham", "Noah", "David"],
                correctAnswerIndex: 2
            },
            {
                id: uuidv4(),
                question: "What did God create on the fourth day?",
                options: ["Plants", "Animals", "Humans", "Sun, moon, and stars"],
                correctAnswerIndex: 3
            }
        ];
    } else {
        return [
            {
                id: uuidv4(),
                question: "Who was the youngest king in the Bible?",
                options: ["David", "Solomon", "Joash", "Josiah"],
                correctAnswerIndex: 2
            },
            {
                id: uuidv4(),
                question: "How many books are in the New Testament?",
                options: ["27", "39", "66", "73"],
                correctAnswerIndex: 0
            },
            {
                id: uuidv4(),
                question: "Which disciple denied Jesus three times?",
                options: ["John", "Peter", "James", "Thomas"],
                correctAnswerIndex: 1
            },
            {
                id: uuidv4(),
                question: "On which day was Jesus resurrected?",
                options: ["Friday", "Saturday", "Sunday", "Monday"],
                correctAnswerIndex: 2
            },
            {
                id: uuidv4(),
                question: "How many plagues did God send on Egypt?",
                options: ["7", "10", "12", "14"],
                correctAnswerIndex: 1
            }
        ];
    }
}

// Check if student already exists
async function checkStudentExists(fullName, parish) {
    try {
        const students = JSON.parse(fs.readFileSync(STUDENTS_FILE));
        return students.some(s => 
            s.fullName.toLowerCase() === fullName.toLowerCase() && 
            s.parish.toLowerCase() === parish.toLowerCase()
        );
    } catch (error) {
        console.error('Error checking if student exists:', error);
        throw error;
    }
}

// Get questions for an age group
async function getQuestions(ageGroup) {
    try {
        const filePath = path.join(QUESTIONS_DIR, `${ageGroup}.json`);
        const questions = JSON.parse(fs.readFileSync(filePath));
        
        // Deep clone and remove correct answer index for student view
        return questions.map(q => ({
            id: q.id,
            question: q.question,
            options: [...q.options],
            correctAnswerIndex: q.correctAnswerIndex
        }));
    } catch (error) {
        console.error(`Error getting ${ageGroup} questions:`, error);
        throw error;
    }
}

// Save exam result
async function saveResult(examData, score) {
    try {
        const students = JSON.parse(fs.readFileSync(STUDENTS_FILE));
        const results = JSON.parse(fs.readFileSync(RESULTS_FILE));
        
        // Generate IDs
        const studentId = uuidv4();
        const resultId = uuidv4();
        
        // Add student to database
        const student = {
            id: studentId,
            ...examData.student,
            created: new Date().toISOString()
        };
        
        students.push(student);
        
        // Calculate percentage
        const percentage = Math.round((score / examData.questions.length) * 100);
        
        // Create result record
        const result = {
            id: resultId,
            studentId,
            questions: examData.questions,
            answers: examData.answers,
            score,
            percentage,
            totalQuestions: examData.questions.length,
            startTime: examData.startTime,
            endTime: examData.endTime,
            timeSpent: 15 * 60 - examData.timeRemaining // Seconds spent
        };
        
        results.push(result);
        
        // Save to files
        fs.writeFileSync(STUDENTS_FILE, JSON.stringify(students, null, 2));
        fs.writeFileSync(RESULTS_FILE, JSON.stringify(results, null, 2));
        
        return resultId;
    } catch (error) {
        console.error('Error saving result:', error);
        throw error;
    }
}

// Get a specific result
async function getResult(resultId) {
    try {
        const students = JSON.parse(fs.readFileSync(STUDENTS_FILE));
        const results = JSON.parse(fs.readFileSync(RESULTS_FILE));
        
        const result = results.find(r => r.id === resultId);
        if (!result) return null;
        
        const student = students.find(s => s.id === result.studentId);
        if (!student) return null;
        
        return {
            ...result,
            student
        };
    } catch (error) {
        console.error('Error getting result:', error);
        throw error;
    }
}

// Get dashboard data for admin
async function getDashboardData() {
    try {
        const students = JSON.parse(fs.readFileSync(STUDENTS_FILE));
        const results = JSON.parse(fs.readFileSync(RESULTS_FILE));
        
        const totalStudents = students.length;
        const juniorCount = students.filter(s => s.ageGroup === '9-12').length;
        const juniorCount = students.filter(s => s.ageGroup === '13-15').length;
        const seniorCount = students.filter(s => s.ageGroup === '16-19').length;
        
        let averageScore = 0;
        if (results.length > 0) {
            const totalPercentage = results.reduce((sum, r) => sum + r.percentage, 0);
            averageScore = Math.round(totalPercentage / results.length);
        }
        
        return {
            totalStudents,
            juniorCount,
            seniorCount,
            averageScore
        };
    } catch (error) {
        console.error('Error getting dashboard data:', error);
        throw error;
    }
}

// Get all students
async function getAllStudents() {
    try {
        const students = JSON.parse(fs.readFileSync(STUDENTS_FILE));
        const results = JSON.parse(fs.readFileSync(RESULTS_FILE));
        
        // Attach score info to students who have taken the exam
        return students.map(student => {
            const studentResult = results.find(r => r.studentId === student.id);
            
            if (studentResult) {
                return {
                    ...student,
                    score: studentResult.percentage,
                    resultId: studentResult.id
                };
            }
            
            return student;
        });
    } catch (error) {
        console.error('Error getting all students:', error);
        throw error;
    }
}

// Get all results
async function getAllResults() {
    try {
        const students = JSON.parse(fs.readFileSync(STUDENTS_FILE));
        const results = JSON.parse(fs.readFileSync(RESULTS_FILE));
        
        // Combine results with student info
        return results.map(result => {
            const student = students.find(s => s.id === result.studentId);
            
            return {
                ...result,
                student: student || { fullName: 'Unknown Student', ageGroup: 'Unknown' }
            };
        });
    } catch (error) {
        console.error('Error getting all results:', error);
        throw error;
    }
}

// Add a question
async function addQuestion(ageGroup, question) {
    try {
        const filePath = path.join(QUESTIONS_DIR, `${ageGroup}.json`);
        const questions = JSON.parse(fs.readFileSync(filePath));
        
        // Add ID and save
        const newQuestion = {
            id: uuidv4(),
            ...question
        };
        
        questions.push(newQuestion);
        fs.writeFileSync(filePath, JSON.stringify(questions, null, 2));
    } catch (error) {
        console.error('Error adding question:', error);
        throw error;
    }
}

// Add multiple questions in batch
async function addQuestionsBatch(ageGroup, newQuestions) {
    try {
        const filePath = path.join(QUESTIONS_DIR, `${ageGroup}.json`);
        const questions = JSON.parse(fs.readFileSync(filePath));
        
        // Add IDs to new questions
        const questionsWithIds = newQuestions.map(q => ({
            id: uuidv4(),
            ...q
        }));
        
        // Combine and save
        const updatedQuestions = [...questions, ...questionsWithIds];
        fs.writeFileSync(filePath, JSON.stringify(updatedQuestions, null, 2));
    } catch (error) {
        console.error('Error adding questions batch:', error);
        throw error;
    }
}

// Delete a question
async function deleteQuestion(questionId) {
    try {
        // Check both age group files
        const ageGroups = ['9-12', '13-15', '16-19'];
        
        for (const ageGroup of ageGroups) {
            const filePath = path.join(QUESTIONS_DIR, `${ageGroup}.json`);
            const questions = JSON.parse(fs.readFileSync(filePath));
            
            const questionIndex = questions.findIndex(q => q.id === questionId);
            if (questionIndex !== -1) {
                // Found the question, remove it
                questions.splice(questionIndex, 1);
                fs.writeFileSync(filePath, JSON.stringify(questions, null, 2));
                return; // Exit after finding and removing
            }
        }
    } catch (error) {
        console.error('Error deleting question:', error);
        throw error;
    }
}

module.exports = {
    initializeDB,
    checkStudentExists,
    getQuestions,
    saveResult,
    getResult,
    getDashboardData,
    getAllStudents,
    getAllResults,
    addQuestion,
    addQuestionsBatch,
    deleteQuestion
};