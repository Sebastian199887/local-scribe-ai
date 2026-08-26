import React, { useState } from 'react';

function App() {
  const [file, setFile] = useState(null);
  const [model, setModel] = useState('llama3');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setResult(null);
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a PDF file first.');
      return;
    }

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('model', model);

    // Explicitly target your server IP and port 5001
    const apiBaseUrl = 'http://192.168.1.14:5001';

    try {
      const response = await fetch(`${apiBaseUrl}/api/process`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Processing failed');

      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6">
      <div className="max-w-2xl w-full bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-8">
        <div className="text-center mb-8">
          <span className="bg-emerald-500/10 text-emerald-400 text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider">
            100% Local & Private
          </span>
          <h1 className="text-3xl font-bold mt-3 tracking-tight">LocalScribe AI</h1>
          <p className="text-slate-400 text-sm mt-1">
            Secure, structured document extraction powered by local LLMs.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Model Selector */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Select Local AI Model
            </label>
            <select
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-sm text-slate-200 focus:outline-none focus:border-emerald-500 transition-colors"
            >
              <option value="llama3">Llama 3 (Balanced & Accurate)</option>
              <option value="mistral">Mistral 7B (Fast & Efficient)</option>
              <option value="phi3">Phi-3 (Ultra-Lightweight)</option>
            </select>
          </div>

          {/* File Upload Box */}
          <div className="border-2 border-dashed border-slate-700 hover:border-emerald-500 transition-colors rounded-xl p-6 text-center bg-slate-950/50 cursor-pointer">
            <input
              type="file"
              accept=".pdf"
              onChange={handleFileChange}
              className="w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-emerald-600 file:text-white hover:file:bg-emerald-500 cursor-pointer"
            />
            <p className="text-xs text-slate-500 mt-2">Upload a resume or business document (PDF)</p>
          </div>

          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl transition shadow-lg disabled:opacity-50"
          >
            {loading ? `Extracting via ${model}...` : 'Analyze Document'}
          </button>
        </form>

        {result && (
          <div className="mt-8 space-y-6">
            <div className="p-6 bg-slate-950 border border-slate-800 rounded-xl">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
                  Structured Extraction: <span className="text-slate-300 font-normal">{result.filename}</span>
                </h2>
                <span className="bg-slate-900 border border-slate-800 text-slate-400 text-xs px-2.5 py-1 rounded-md">
                  Model: <strong className="text-emerald-400">{result.model_used}</strong>
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                  <span className="text-xs text-slate-500 block">Vendor / Issuer</span>
                  <span className="text-sm font-medium text-slate-200">{result.data.vendor || 'N/A'}</span>
                </div>
                <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                  <span className="text-xs text-slate-500 block">Document Type</span>
                  <span className="text-sm font-medium text-slate-200">{result.data.document_type || 'N/A'}</span>
                </div>
                <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                  <span className="text-xs text-slate-500 block">Date</span>
                  <span className="text-sm font-medium text-slate-200">{result.data.date || 'N/A'}</span>
                </div>
                <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                  <span className="text-xs text-slate-500 block">Total Amount</span>
                  <span className="text-sm font-medium text-emerald-400">{result.data.total_amount || 'N/A'}</span>
                </div>
              </div>

              <div className="bg-slate-900 p-4 rounded-lg border border-slate-800 mb-4">
                <span className="text-xs text-slate-500 block mb-1">Executive Summary</span>
                <p className="text-slate-300 text-sm leading-relaxed">
                  {result.data.summary || 'No summary provided.'}
                </p>
              </div>

              {result.data.key_skills && result.data.key_skills.length > 0 && (
                <div className="bg-slate-900 p-4 rounded-lg border border-slate-800">
                  <span className="text-xs text-slate-500 block mb-2">Key Highlights / Skills</span>
                  <div className="flex flex-wrap gap-2">
                    {result.data.key_skills.map((skill, index) => (
                      <span key={index} className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs px-2.5 py-1 rounded-md">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
