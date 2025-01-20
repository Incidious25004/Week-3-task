const express = require('express');
const multer = require('multer');
const fs = require('fs');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');

const app = express();
const port = 3000;

// Set up file upload with Multer
const upload = multer({ dest: 'uploads/' });

app.use(express.static('public')); // Serve static files (HTML, CSS, JS)

app.post('/upload', upload.single('resume'), (req, res) => {
    const filePath = req.file.path;

    // Process PDF, DOCX, or TXT files
    if (req.file.mimetype === 'application/pdf') {
        processPDF(filePath, res);
    } else if (req.file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        processDOCX(filePath, res);
    } else if (req.file.mimetype === 'text/plain') {
        processTXT(filePath, res);
    } else {
        res.status(400).json([{ type: 'Error', message: 'Unsupported file format. Please upload a PDF, DOCX, or TXT file.' }]);
    }
});

// Process PDF files
function processPDF(filePath, res) {
    const dataBuffer = fs.readFileSync(filePath);
    pdfParse(dataBuffer).then(function (data) {
        const feedback = generateFeedback(data.text);
        res.json(feedback);
    });
}

// Process DOCX files
function processDOCX(filePath, res) {
    const data = fs.readFileSync(filePath);
    mammoth.extractRawText({ buffer: data }).then(function (result) {
        const feedback = generateFeedback(result.value);
        res.json(feedback);
    });
}

// Process TXT files
function processTXT(filePath, res) {
    const text = fs.readFileSync(filePath, 'utf-8');
    const feedback = generateFeedback(text);
    res.json(feedback);
}

// Simple feedback generation algorithm
function generateFeedback(text) {
    const feedback = [];

    // Check for key sections in the resume (simple example)
    const sections = ['Contact Information', 'Education', 'Experience', 'Skills'];
    sections.forEach(section => {
        if (!text.includes(section)) {
            feedback.push({
                type: 'Structure',
                message: `Your resume is missing the "${section}" section.`
            });
        }
    });

    // Check for readability (example: very simple check for sentence length)
    const sentences = text.split('.').filter(sentence => sentence.trim().length > 0);
    if (sentences.length < 5) {
        feedback.push({
            type: 'Content',
            message: 'Your resume seems too short. Consider adding more details to improve your resume.'
        });
    }

    // Check for overused phrases (example: "hardworking", "team player")
    const overusedPhrases = ['hardworking', 'team player', 'responsible for'];
    overusedPhrases.forEach(phrase => {
        if (text.toLowerCase().includes(phrase)) {
            feedback.push({
                type: 'Content',
                message: `Try to avoid overused phrases like "${phrase}". Consider using stronger action verbs.`
            });
        }
    });

    return feedback;
}

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
