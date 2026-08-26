import React, { useState } from 'react';

function App() {
  const [file, setFile] = useState(null);
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

    try {
      const response = await fetch('http://localhost:5001/api/process', {
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
      <div className="max-w-xl w-full bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-8">
        <div className="text-center mb-8">
          <span className="bg-emerald-500/10 text-emerald-400 text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider">
            100% Local & Private
          </span>
          <h1 className="text-3xl font-bold mt-3 tracking-tight">LocalScribe AI</h1>
          <p className="text-slate-400 text-sm mt-1">
            Secure, containerised document extraction powered by local AI.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="border-2 border-dashed border-slate-700 hover:border-emerald-500 transition-colors rounded-xl p-6 text-center bg-slate-950/50 cursor-pointer">
            <input
              type="file"
              accept=".pdf"
              onChange={handleFileChange}
              className="w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-emerald-600 file:text-white hover:file:bg-emerald-500 cursor-pointer"
            />
            <p className="text-xs text-slate-500 mt-2">Upload a PDF document to parse offline</p>
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
            {loading ? 'Processing Locally via AI...' : 'Analyze Document'}
          </button>
        </form>

        {result && (
          <div className="mt-8 p-6 bg-slate-950 border border-slate-800 rounded-xl">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-emerald-400 mb-2">
              Extraction Result: <span className="text-slate-300 font-normal">{result.filename}</span>
            </h2>
            <div className="bg-slate-900 p-4 rounded-lg text-slate-300 text-sm whitespace-pre-wrap leading-relaxed border border-slate-800/60">
              {result.summary}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
