const express = require('express');
const cors = require('cors');
const multer = require('multer');
const pdfParse = require('pdf-parse');
const axios = require('axios');

const app = express();
app.use(cors());
app.use(express.json());

const upload = multer({ storage: multer.memoryStorage() });
const OLLAMA_HOST = process.env.OLLAMA_HOST || 'http://localhost:11434';

app.post('/api/process', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded.' });
    }

    const model = req.body.model || 'llama3';
    
    // Parse PDF text
    const pdfData = await pdfParse(req.file.buffer);
    const textContent = pdfData.text.slice(0, 4000); // Truncate to fit context window safely

    const prompt = `Analyze the following document text and extract key details into a strict JSON format with these exact keys:
{
  "vendor": "Name of issuer, person, or company",
  "document_type": "Invoice, Resume, Receipt, Contract, etc.",
  "date": "Date found on document or N/A",
  "total_amount": "Total amount or N/A",
  "summary": "A 2-3 sentence executive summary of the document",
  "key_skills": ["Skill 1", "Skill 2", "Skill 3", "Skill 4"] (or relevant key highlights if not a resume)
}
Return ONLY valid JSON. No markdown code blocks, no explanations.

Document Text:
${textContent}`;

    // Call Ollama API
    const ollamaResponse = await axios.post(`${OLLAMA_HOST}/api/generate`, {
      model: model,
      prompt: prompt,
      stream: false,
      format: 'json'
    });

    let parsedData;
    try {
      parsedData = JSON.parse(ollamaResponse.data.response);
    } catch (parseErr) {
      parsedData = {
        vendor: "N/A",
        document_type: "General Document",
        date: "N/A",
        total_amount: "N/A",
        summary: ollamaResponse.data.response,
        key_skills: []
      };
    }

    res.json({
      filename: req.file.originalname,
      model_used: model,
      data: parsedData
    });

  } catch (err) {
    console.error('Processing error:', err.message);
    res.status(500).json({ error: err.message || 'Internal server error during processing.' });
  }
});

const PORT = 5001;
app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});
