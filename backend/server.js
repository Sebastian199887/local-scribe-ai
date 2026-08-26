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

// PDF Processing and Structured AI extraction endpoint
app.post('/api/process', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Extract text from uploaded PDF
    const pdfData = await pdfParse(req.file.buffer);
    const extractedText = pdfData.text;

    // Craft a prompt forcing strict JSON output
    const prompt = `You are an expert document extraction engine. Analyze the following document text and extract the key information into valid JSON format with these exact keys: 
    - "vendor": (string, name of company or sender)
    - "document_type": (string, e.g., Invoice, Contract, Receipt, Report)
    - "date": (string, document date if found)
    - "total_amount": (string, total price or value if found, with currency)
    - "summary": (string, a brief 2-3 sentence summary of the document)

    Document Text:
    ${extractedText}`;

    const ollamaResponse = await fetch(`${OLLAMA_HOST}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'llama3',
        prompt: prompt,
        format: 'json',
        stream: false
      })
    });

    const aiData = await ollamaResponse.json();
    
    let structuredData;
    try {
      structuredData = JSON.parse(aiData.response);
    } catch (parseError) {
      structuredData = { summary: aiData.response };
    }

    res.json({
      success: true,
      filename: req.file.originalname,
      data: structuredData
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
