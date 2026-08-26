const express = require('express');
const cors = require('cors');
const multer = require('multer');
const pdfParse = require('pdf-parse');

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

app.use(cors());
app.use(express.json());

const OLLAMA_HOST = process.env.OLLAMA_HOST || 'http://localhost:11434';

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'online', ollama: OLLAMA_HOST });
});

// PDF Processing and AI extraction endpoint
app.post('/api/process', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Extract text from uploaded PDF
    const pdfData = await pdfParse(req.file.buffer);
    const extractedText = pdfData.text;

    // Call local Ollama instance
    const prompt = `Extract key structured information (like dates, names, totals, and a brief summary) from the following document text:\n\n${extractedText}`;
    
    const ollamaResponse = await fetch(`${OLLAMA_HOST}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'llama3',
        prompt: prompt,
        stream: false
      })
    });

    const aiData = await ollamaResponse.json();

    res.json({
      success: true,
      filename: req.file.originalname,
      summary: aiData.response || 'No response generated from local model.'
    });

  } catch (error) {
    console.error('Error processing document:', error);
    res.status(500).json({ error: 'Failed to process document locally.' });
  }
});

const PORT = 5001;
app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});
