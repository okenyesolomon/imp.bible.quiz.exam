const express = require('express');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const session = require('express-session');

const app = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
    secret: 'your-secret-key-here', // Change this to a strong random string
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Set to true if using HTTPS
}));

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'html');
app.engine('html', require('ejs').renderFile);

// Data paths
const DATA_DIR = path.join(__dirname, 'data');
const QUESTIONS_9_12_PATH = path.join(DATA_DIR, 'questions_9-12.json');
const QUESTIONS_13_15_PATH = path.join(DATA_DIR, 'questions_13-15.json');
const QUESTIONS_16_19_PATH = path.join(DATA_DIR, 'questions_16-19.json');
const RESULTS_FILE = path.join(DATA_DIR, 'results.json');

const STUDENTS_PATH = path.join(DATA_DIR, 'students.json');
const ADMIN_CREDENTIALS_PATH = path.join(DATA_DIR, 'admin.json');

// Initialize empty results file if it doesn't exist
if (!fs.existsSync(RESULTS_FILE)) {
    fs.writeFileSync(RESULTS_FILE, JSON.stringify([], null, 2));
}

// Helper function to read results
function readResults() {
    try {
        const data = fs.readFileSync(RESULTS_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error reading results file:', error);
        return [];
    }
}

// Helper function to save results
function saveResults(results) {
    try {
        fs.writeFileSync(RESULTS_FILE, JSON.stringify(results, null, 2));
        return true;
    } catch (error) {
        console.error('Error saving results:', error);
        return false;
    }
}


// Initialize data files if they don't exist
function initializeDataFiles() {
    if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR);
    }

    if (!fs.existsSync(QUESTIONS_9_12_PATH)) {
        fs.writeFileSync(QUESTIONS_9_12_PATH, JSON.stringify([
            {
                "question": "Sample question for 9-12",
                "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
                "correctAnswer": 0
            }
        ], null, 2));
    }

    if (!fs.existsSync(QUESTIONS_13_15_PATH)) {
        fs.writeFileSync(QUESTIONS_13_15_PATH, JSON.stringify([
            {
                "question": "Sample question for 13-15",
                "options": ["Option A", "Option B", "Option C", "Option D"],
                "correctAnswer": 0
            }
        ], null, 2));
    }

    if (!fs.existsSync(QUESTIONS_16_19_PATH)) {
        fs.writeFileSync(QUESTIONS_16_19_PATH, JSON.stringify([
            {
                "question": "Sample question for 16-19",
                "options": ["Option A", "Option B", "Option C", "Option D"],
                "correctAnswer": 0
            }
        ], null, 2));
    }

    if (!fs.existsSync(STUDENTS_PATH)) {
        fs.writeFileSync(STUDENTS_PATH, JSON.stringify([], null, 2));
    }

    if (!fs.existsSync(ADMIN_CREDENTIALS_PATH)) {
        const salt = bcrypt.genSaltSync(10);
        const hashedPassword = bcrypt.hashSync('Admin@123', salt);
        fs.writeFileSync(ADMIN_CREDENTIALS_PATH, JSON.stringify({
            username: 'admin',
            password: hashedPassword
        }, null, 2));
    }
}

initializeDataFiles();

// Middleware to check admin authentication
const isAuthenticated = (req, res, next) => {
    if (req.session && req.session.admin) {
        return next();
    }
    res.redirect('/admin/login');
};

// Routes
app.get('/', (req, res) => {
    res.render('index.html');
});

app.get('/exam', (req, res) => {
    res.render('exam.html');
});

app.get('/page', (req, res) => {
    res.render('page.html');
});

app.get('/results', (req, res) => {
    res.sendFile(path.join(__dirname, 'views/results.html'));
});

app.get('/search', (req, res) => {
    res.sendFile(path.join(__dirname, 'views/search.html'));
});

// Admin login routes
app.get('/admin/login', (req, res) => {
    res.render('admin-login.html');
});

// API Routes
app.post('/api/results', (req, res) => {
    try {
        const newResult = {
            _id: Date.now().toString(),
            date: new Date().toISOString(),
            ...req.body
        };
        
        const results = readResults();
        results.push(newResult);
        
        if (saveResults(results)) {
            res.status(201).json(newResult);
        } else {
            res.status(500).json({ error: 'Failed to save result' });
        }
    } catch (error) {
        console.error('Error:', error);
        res.status(400).json({ error: 'Invalid request' });
    }
});

app.get('/api/results', (req, res) => {
    try {
        const results = readResults();
        res.json(results);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Failed to load results' });
    }
});

app.get('/api/results/search', (req, res) => {
    try {
        const query = req.query.q?.toLowerCase() || '';
        const results = readResults();
        
        const filtered = results.filter(result => 
            result.fullName.toLowerCase().includes(query) ||
            result.parish.toLowerCase().includes(query) ||
            result.zone.toLowerCase().includes(query)
        );
        
        res.json(filtered);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Search failed' });
    }
});

app.post('/admin/login', (req, res) => {
    const { username, password } = req.body;
    try {
        const adminCredentials = JSON.parse(fs.readFileSync(ADMIN_CREDENTIALS_PATH, 'utf8'));
        
        if (username === adminCredentials.username && bcrypt.compareSync(password, adminCredentials.password)) {
            req.session.admin = true;
            return res.redirect('/admin');
        }
        return res.render('admin-login.html', { error: 'Invalid username or password' });
    } catch (error) {
        console.error('Login error:', error);
        return res.render('admin-login.html', { error: 'Login failed. Please try again.' });
    }
});

app.get('/admin/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/admin/login');
});

app.get('/admin', isAuthenticated, (req, res) => {
    try {
        const students = JSON.parse(fs.readFileSync(STUDENTS_PATH, 'utf8'));
        res.render('admin.html', { students });
    } catch (error) {
        console.error('Error loading admin page:', error);
        res.status(500).render('admin.html', { students: [] });
    }
});

// Questions endpoints
app.get('/questions/:ageGroup', (req, res) => {
    try {
        const ageGroup = req.params.ageGroup;
        const filePath = ageGroup === '9-12' ? QUESTIONS_9_12_PATH : ageGroup === '13-15' ? QUESTIONS_13_15_PATH : QUESTIONS_16_19_PATH;        
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ error: 'Questions file not found' });
        }

        const questions = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        
        if (!Array.isArray(questions)) {
            return res.status(500).json({ error: 'Invalid questions format' });
        }

        res.json(questions);
    } catch (error) {
        console.error('Error getting questions:', error);
        res.status(500).json({ error: 'Failed to load questions' });
    }
});

// Fixed submission endpoint
app.post('/submit', (req, res) => {
    try {
        const { fullName, gender, zone, parish, ageGroup, answers } = req.body;
        
        if (!fullName || !gender || !zone || !parish || !ageGroup || !answers) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

// Read current students
        let students = [];
        try {
            students = JSON.parse(fs.readFileSync(STUDENTS_PATH, 'utf8'));
        } catch (error) {
            console.error('Error reading students file:', error);
        }

        // Check for duplicate
        if (students.some(s => s.fullName === fullName)) {
            return res.status(400).json({ error: 'Student has already taken the exam' });
        }

        // Get questions
        const filePath = ageGroup === '9-12' ? QUESTIONS_9_12_PATH : 
                       ageGroup === '13-15' ? QUESTIONS_13_15_PATH : 
                       QUESTIONS_16_19_PATH;
        const questions = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        
        // Calculate score
        let score = 0;
        questions.forEach((question, index) => {
            const userAnswer = answers[index];
            
            if (!userAnswer) return; // Skip if no answer
            
            // Handle different question types
            switch(question.type || 'multiple') { // Default to multiple if type not specified
                case 'truefalse':
                    if (String(userAnswer.userAnswer) === String(question.correctAnswer)) {
                        score++;
                    }
                    break;
                    
                case 'fillblank':
                    if (userAnswer.userAnswer && 
                        userAnswer.userAnswer.toLowerCase().trim() === 
                        question.correctAnswer.toLowerCase().trim()) {
                        score++;
                    }
                    break;
                    
                case 'multiple':
                default:
                    if (parseInt(userAnswer.userAnswer) === parseInt(question.correctAnswer)) {
                        score++;
                    }
            }
        });

// Create new student record
        const newStudent = {
            id: Date.now(),
            fullName,
            gender,
            zone,
            parish,
            ageGroup,
            score,
            totalQuestions: questions.length,
            percentage: Math.round((score / questions.length) * 100),
            date: new Date().toISOString(),
            answers: answers.map((a, i) => ({
                question: questions[i].question,
                userAnswer: a.userAnswer,
                correctAnswer: questions[i].correctAnswer,
                isCorrect: a.isCorrect
            }))
        };

        // Save to file
        students.push(newStudent);
        fs.writeFileSync(STUDENTS_PATH, JSON.stringify(students, null, 2));

        // Send response
        res.json({
            success: true,
            score,
            totalQuestions: questions.length,
            percentage: Math.round((score / questions.length) * 100)
        });

    } catch (error) {
        console.error('Submission error:', error);
        res.status(500).json({ 
            error: 'Failed to process submission',
            details: error.message 
        });
    }
});
// Fixed question saving endpoint
app.post('/admin/questions', isAuthenticated, (req, res) => {
    try {
        const { ageGroup, questions } = req.body;
        
        if (!ageGroup || !questions || !Array.isArray(questions)) {
            return res.status(400).json({ error: 'Invalid request data' });
        }

        const filePath = ageGroup === '9-12' ? QUESTIONS_9_12_PATH : ageGroup === '13-15' ? QUESTIONS_13_15_PATH : QUESTIONS_16_19_PATH;
        
        // Validate questions structure
        const isValid = questions.every(q => 
            q.question && 
            Array.isArray(q.options) && 
            q.options.length === 4 &&
            typeof q.correctAnswer === 'number'
        );

        if (!isValid) {
            return res.status(400).json({ error: 'Invalid questions format' });
        }

        fs.writeFileSync(filePath, JSON.stringify(questions, null, 2));
        res.json({ success: true });
    } catch (error) {
        console.error('Error saving questions:', error);
        res.status(500).json({ error: 'Failed to save questions' });
    }
});

// Password change endpoint
app.post('/admin/change-password', isAuthenticated, (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const adminCredentials = JSON.parse(fs.readFileSync(ADMIN_CREDENTIALS_PATH, 'utf8'));
        
        if (!bcrypt.compareSync(currentPassword, adminCredentials.password)) {
            return res.status(400).json({ error: 'Current password is incorrect' });
        }
        
        if (newPassword.length < 8) {
            return res.status(400).json({ error: 'Password must be at least 8 characters' });
        }
        
        const salt = bcrypt.genSaltSync(10);
        const hashedPassword = bcrypt.hashSync(newPassword, salt);
        
        adminCredentials.password = hashedPassword;
        fs.writeFileSync(ADMIN_CREDENTIALS_PATH, JSON.stringify(adminCredentials, null, 2));
        
        res.json({ success: true });
    } catch (error) {
        console.error('Password change error:', error);
        res.status(500).json({ error: 'Failed to change password' });
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});