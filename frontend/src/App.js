import React, { useState, useEffect, useRef } from 'react';

function App() {
  const [activeTab, setActiveTab] = useState('stream'); // 'stream', 'document', 'vision', or 'rag'
  const [files, setFiles] = useState([]);
  const [model, setModel] = useState('llama3.1:8b');
  const [visionModel, setVisionModel] = useState('llava');
  const [availableModels, setAvailableModels] = useState(['llama3.1:8b', 'mistral', 'llava']);
  const [loading, setLoading] = useState(false);
  
  // Streaming state
  const [streamText, setStreamText] = useState('');
  const [streamStats, setStreamStats] = useState(null);

  // Batch / Vision result state
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  // RAG / Archive Chat State
  const [archiveQuery, setArchiveQuery] = useState('');
  const [chatMessages, setChatMessages] = useState([
    { role: 'system', content: 'NET_ACCESS: ENCRYPTED // AI MATRIX ONLINE. Click the NETCITY header badge to boot the secret perimeter mini-game.' }
  ]);

  // QoL States
  const [history, setHistory] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const [toast, setToast] = useState(null);
  const [healthStatus, setHealthStatus] = useState({ backend: 'checking', ollama: 'checking' });

  // Secret Mini-Game Activation State (Triggered by clicking NETCITY tag)
  const [gameActive, setGameActive] = useState(false);

  // Space Invaders Mini-Game Score State (Session-only, resets on page refresh)
  const [invaderScore, setInvaderScore] = useState(0);
  
  // Refs to track score and game activation inside the canvas loop without closure staleness
  const scoreRef = useRef(0);
  useEffect(() => {
    scoreRef.current = invaderScore;
  }, [invaderScore]);

  const gameActiveRef = useRef(false);
  useEffect(() => {
    gameActiveRef.current = gameActive;
  }, [gameActive]);

  // Canvas background reference
  const canvasRef = useRef(null);
  const apiBaseUrl = 'http://192.168.1.14:5000';

  // Interactive Animated Cyberpunk Canvas & Perimeter Space Invaders Engine
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    let animationFrameId;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Matrix Rain Columns
    const cols = Math.floor(width / 20);
    const drops = Array(cols).fill(1);

    // Mouse tracking for ambient background glow
    let mouse = { x: -1000, y: -1000 };
    const handleMouseMove = (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };
    window.addEventListener('mousemove', handleMouseMove);

    // Strict perimeter generator to keep invaders outside the central terminal box boundaries
    const getRandomPerimeterCoords = (w, h) => {
      const centerX = w / 2;
      const centerY = h / 2;
      const safeHalfW = 440; 
      const safeHalfH = 340;

      let x, y;
      let attempts = 0;
      do {
        x = Math.random() * (w - 120) + 60;
        y = Math.random() * (h - 120) + 60;
        attempts++;
        
        const inCenter = (
          x > centerX - safeHalfW && 
          x < centerX + safeHalfW && 
          y > centerY - safeHalfH && 
          y < centerY + safeHalfH
        );

        if (!inCenter || attempts > 30) break;
      } while (true);

      return { x, y };
    };

    let invaders = [];
    let bossEntity = null;

    const spawnInvaders = () => {
      invaders = [];
      for (let i = 0; i < 6; i++) {
        const pos = getRandomPerimeterCoords(width, height);
        invaders.push({
          x: pos.x,
          y: pos.y,
          baseVx: (Math.random() - 0.5) * 0.8,
          baseVy: (Math.random() - 0.5) * 0.5,
          size: 24,
          alive: true
        });
      }
    };
    spawnInvaders();

    let activeClickAnimations = [];
    let effectPool = ['shockwave', 'glitchStorm', 'codeFountain', 'laserGrid', 'dataCollapse', 'hexBurst'];
    let remainingEffects = [...effectPool];

    const getNextUniqueEffect = () => {
      if (remainingEffects.length === 0) remainingEffects = [...effectPool];
      const randomIndex = Math.floor(Math.random() * remainingEffects.length);
      return remainingEffects.splice(randomIndex, 1)[0];
    };

    const handleClick = (e) => {
      if (!gameActiveRef.current) return; // Only process game clicks if mini-game is activated

      const x = e.clientX;
      const y = e.clientY;
      let hitEntity = false;

      // Check Boss hit if score >= 2000 and boss is active
      if (bossEntity && bossEntity.alive && Math.hypot(bossEntity.x - x, bossEntity.y - y) < bossEntity.size + 15) {
        bossEntity.health -= 1;
        hitEntity = true;

        for (let p = 0; p < 12; p++) {
          const angle = Math.random() * Math.PI * 2;
          const speed = Math.random() * 4 + 2;
          activeClickAnimations.push({
            type: 'particle',
            x: bossEntity.x, y: bossEntity.y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            char: String.fromCharCode(0x30a0 + Math.random() * 96),
            life: 1
          });
        }

        if (bossEntity.health <= 0) {
          bossEntity.alive = false;
          setInvaderScore(prev => prev + 1000);
          
          for (let p = 0; p < 40; p++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 7 + 3;
            activeClickAnimations.push({
              type: 'particle',
              x: bossEntity.x, y: bossEntity.y,
              vx: Math.cos(angle) * speed,
              vy: Math.sin(angle) * speed,
              char: '#',
              life: 1.2
            });
          }

          setTimeout(() => {
            if (scoreRef.current >= 2000) {
              const pos = getRandomPerimeterCoords(width, height);
              bossEntity = {
                x: pos.x,
                y: pos.y,
                baseVx: (Math.random() - 0.5) * 0.4,
                baseVy: (Math.random() - 0.5) * 0.3,
                size: 55,
                health: 5,
                maxHealth: 5,
                alive: true
              };
            }
          }, 15000);
        }
      }

      // Check regular invader entities
      if (!hitEntity) {
        invaders.forEach(inv => {
          if (inv.alive && Math.hypot(inv.x - x, inv.y - y) < inv.size + 10) {
            inv.alive = false;
            hitEntity = true;
            setInvaderScore(prev => prev + 100);

            for (let p = 0; p < 20; p++) {
              const angle = Math.random() * Math.PI * 2;
              const speed = Math.random() * 5 + 2;
              activeClickAnimations.push({
                type: 'particle',
                x: inv.x, y: inv.y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                char: String.fromCharCode(0x30a0 + Math.random() * 96),
                life: 1
              });
            }

            setTimeout(() => {
              const newPos = getRandomPerimeterCoords(width, height);
              inv.x = newPos.x;
              inv.y = newPos.y;
              inv.baseVx = (Math.random() - 0.5) * 0.8;
              inv.baseVy = (Math.random() - 0.5) * 0.5;
              inv.alive = true;
            }, 3000);
          }
        });
      }

      // Standard click background effects if not hitting game entities
      if (!hitEntity) {
        const chosenEffect = getNextUniqueEffect();
        if (chosenEffect === 'shockwave') {
          activeClickAnimations.push({ type: 'shockwave', x, y, radius: 10, maxRadius: 250, alpha: 1 });
        } else if (chosenEffect === 'glitchStorm') {
          for (let i = 0; i < 25; i++) {
            activeClickAnimations.push({
              type: 'glitchPixel',
              x: x + (Math.random() - 0.5) * 300,
              y: y + (Math.random() - 0.5) * 300,
              w: Math.random() * 40 + 5,
              h: Math.random() * 6 + 2,
              color: Math.random() > 0.5 ? '#00ffcc' : '#ffee00',
              life: 1
            });
          }
        } else if (chosenEffect === 'codeFountain') {
          for (let i = 0; i < 40; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 6 + 2;
            activeClickAnimations.push({
              type: 'particle',
              x, y,
              vx: Math.cos(angle) * speed,
              vy: Math.sin(angle) * speed - 2,
              char: String.fromCharCode(0x30a0 + Math.random() * 96),
              life: 1
            });
          }
        } else if (chosenEffect === 'laserGrid') {
          activeClickAnimations.push({ type: 'laserGrid', x, y, size: 10, maxSize: Math.max(width, height), alpha: 1 });
        } else if (chosenEffect === 'dataCollapse') {
          activeClickAnimations.push({ type: 'collapse', x, y, radius: 200, minRadius: 5, alpha: 1 });
        } else if (chosenEffect === 'hexBurst') {
          for (let i = 0; i < 6; i++) {
            activeClickAnimations.push({
              type: 'hexPolygon',
              x, y,
              radius: 20 + i * 25,
              maxRadius: 200 + i * 30,
              alpha: 1,
              rotation: i * 0.5
            });
          }
        }
      }
    };

    window.addEventListener('click', handleClick);

    const draw = () => {
      ctx.fillStyle = 'rgba(5, 5, 10, 0.2)';
      ctx.fillRect(0, 0, width, height);

      // Matrix Rain Background
      ctx.font = '12px monospace';
      for (let i = 0; i < drops.length; i++) {
        const text = String.fromCharCode(0x30a0 + Math.random() * 96);
        const x = i * 20;
        const y = drops[i] * 20;

        const dist = Math.hypot(x - mouse.x, y - mouse.y);
        if (dist < 100) {
          ctx.fillStyle = '#ffee00';
        } else {
          ctx.fillStyle = Math.random() > 0.85 ? '#ffffff' : '#00ffcc';
        }

        ctx.fillText(text, x, y);

        if (y > height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }

      // Render invaders and boss ONLY if gameActive is true
      if (gameActiveRef.current) {
        const speedMultiplier = 1 + (scoreRef.current / 300) * 0.75;

        invaders.forEach(inv => {
          if (!inv.alive) return;
          
          inv.x += inv.baseVx * speedMultiplier;
          inv.y += inv.baseVy * speedMultiplier;

          const centerX = width / 2;
          const centerY = height / 2;
          const safeHalfW = 420;
          const safeHalfH = 320;

          if (inv.x < 60 || inv.x > width - 60) inv.baseVx *= -1;
          if (inv.y < 60 || inv.y > height - 60) inv.baseVy *= -1;

          if (inv.x > centerX - safeHalfW && inv.x < centerX + safeHalfW && inv.y > centerY - safeHalfH && inv.y < centerY + safeHalfH) {
            inv.baseVx *= -1;
            inv.baseVy *= -1;
            inv.x += inv.baseVx * 10;
            inv.y += inv.baseVy * 10;
          }

          ctx.fillStyle = 'rgba(255, 0, 85, 0.35)';
          ctx.strokeStyle = 'rgba(255, 0, 85, 0.6)';
          ctx.lineWidth = 1.5;

          const sz = 4;
          const px = inv.x;
          const py = inv.y;
          ctx.fillRect(px - 12, py - 8, sz, sz);
          ctx.fillRect(px + 8, py - 8, sz, sz);
          ctx.fillRect(px - 4, py - 4, sz * 2, sz);
          ctx.fillRect(px - 16, py, sz * 9, sz);
          ctx.fillRect(px - 16, py + 4, sz, sz * 2);
          ctx.fillRect(px + 12, py + 4, sz, sz * 2);
        });

        if (scoreRef.current >= 2000) {
          if (!bossEntity) {
            const pos = getRandomPerimeterCoords(width, height);
            bossEntity = {
              x: pos.x,
              y: pos.y,
              baseVx: (Math.random() - 0.5) * 0.4,
              baseVy: (Math.random() - 0.5) * 0.3,
              size: 55,
              health: 5,
              maxHealth: 5,
              alive: true
            };
          } else if (bossEntity.alive) {
            bossEntity.x += bossEntity.baseVx * speedMultiplier;
            bossEntity.y += bossEntity.baseVy * speedMultiplier;

            if (bossEntity.x < 80 || bossEntity.x > width - 80) bossEntity.baseVx *= -1;
            if (bossEntity.y < 80 || bossEntity.y > height - 80) bossEntity.baseVy *= -1;

            ctx.fillStyle = 'rgba(255, 238, 0, 0.4)';
            ctx.strokeStyle = 'rgba(255, 238, 0, 0.9)';
            ctx.lineWidth = 2.5;

            const bx = bossEntity.x;
            const by = bossEntity.y;

            ctx.beginPath();
            ctx.arc(bx, by, bossEntity.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();

            ctx.strokeStyle = 'rgba(255, 0, 85, 0.8)';
            ctx.beginPath();
            ctx.rect(bx - 25, by - 25, 50, 50);
            ctx.stroke();

            ctx.fillStyle = '#ff0055';
            ctx.fillRect(bx - 30, by - 45, 60, 6);
            ctx.fillStyle = '#ffee00';
            ctx.fillRect(bx - 30, by - 45, (60 * (bossEntity.health / bossEntity.maxHealth)), 6);
            ctx.strokeStyle = '#ffffff';
            ctx.strokeRect(bx - 30, by - 45, 60, 6);
          }
        }
      }

      // Render click animations
      activeClickAnimations.forEach((anim) => {
        if (anim.type === 'shockwave') {
          anim.radius += 8;
          anim.alpha -= 0.04;
          ctx.strokeStyle = `rgba(0, 255, 204, ${anim.alpha})`;
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(anim.x, anim.y, anim.radius, 0, Math.PI * 2);
          ctx.stroke();
        } else if (anim.type === 'glitchPixel') {
          anim.life -= 0.05;
          ctx.fillStyle = anim.color;
          ctx.fillRect(anim.x, anim.y, anim.w, anim.h);
        } else if (anim.type === 'particle') {
          anim.x += anim.vx;
          anim.y += anim.vy;
          anim.vy += 0.15;
          anim.life -= 0.03;
          ctx.fillStyle = `rgba(255, 238, 0, ${anim.life})`;
          ctx.font = '14px monospace';
          ctx.fillText(anim.char, anim.x, anim.y);
        } else if (anim.type === 'laserGrid') {
          anim.size += 20;
          anim.alpha -= 0.03;
          ctx.strokeStyle = `rgba(255, 0, 85, ${anim.alpha})`;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(0, anim.y); ctx.lineTo(width, anim.y);
          ctx.moveTo(anim.x, 0); ctx.lineTo(anim.x, height);
          ctx.stroke();
        } else if (anim.type === 'collapse') {
          anim.radius -= 12;
          anim.alpha -= 0.05;
          ctx.strokeStyle = `rgba(0, 255, 204, ${anim.alpha})`;
          ctx.lineWidth = 4;
          ctx.beginPath();
          ctx.arc(anim.x, anim.y, Math.max(anim.radius, 5), 0, Math.PI * 2);
          ctx.stroke();
        } else if (anim.type === 'hexPolygon') {
          anim.radius += 5;
          anim.alpha -= 0.03;
          ctx.strokeStyle = `rgba(255, 238, 0, ${anim.alpha})`;
          ctx.lineWidth = 2;
          ctx.beginPath();
          for (let s = 0; s < 6; s++) {
            const angle = anim.rotation + (s * Math.PI) / 3;
            const hx = anim.x + anim.radius * Math.cos(angle);
            const hy = anim.y + anim.radius * Math.sin(angle);
            if (s === 0) ctx.moveTo(hx, hy);
            else ctx.lineTo(hx, hy);
          }
          ctx.closePath();
          ctx.stroke();
        }
      });

      activeClickAnimations = activeClickAnimations.filter(a => (a.alpha !== undefined ? a.alpha > 0 : a.life > 0));

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('click', handleClick);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const res = await fetch(`${apiBaseUrl}/api/health`);
        const data = await res.json();
        setHealthStatus(data);
        if (data.available_models && data.available_models.length > 0) {
          setAvailableModels(data.available_models);
        }
      } catch (e) {
        setHealthStatus({ backend: 'offline', ollama: 'offline' });
      }
    };
    checkHealth();
    const interval = setInterval(checkHealth, 15000);
    return () => clearInterval(interval);
  }, [apiBaseUrl]);

  useEffect(() => {
    const saved = localStorage.getItem('local_scribe_cyberpunk_history');
    if (saved) {
      try { setHistory(JSON.parse(saved)); } catch (e) { console.error(e); }
    }
  }, []);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const saveToHistory = (newResult) => {
    const itemsToAdd = newResult.results ? newResult.results : [newResult];
    const updated = [...itemsToAdd, ...history.filter(h => !itemsToAdd.some(newItem => newItem.id === h.id))].slice(0, 50);
    setHistory(updated);
    localStorage.setItem('local_scribe_cyberpunk_history', JSON.stringify(updated));
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem('local_scribe_cyberpunk_history');
    showToast('NETPURGE: Archives wiped.', 'success');
  };

  const handleFileChange = (e) => {
    setFiles(Array.from(e.target.files));
    setResult(null);
    setStreamText('');
    setStreamStats(null);
    setError(null);
  };

  const handleStreamSubmit = async (e) => {
    e.preventDefault();
    if (files.length === 0) {
      setError('ERR: NO_DATA_STREAM_SELECTED');
      return;
    }

    setLoading(true);
    setError(null);
    setStreamText('');
    setStreamStats(null);

    const formData = new FormData();
    formData.append('file', files[0]);
    formData.append('model', model);

    try {
      const response = await fetch(`${apiBaseUrl}/api/process-stream`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('NET_ERR: Stream handshake failed');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n\n').filter(Boolean);

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = JSON.parse(line.replace('data: ', ''));
            if (data.type === 'meta') {
              setStreamStats(data.stats);
            } else if (data.type === 'token') {
              setStreamText((prev) => prev + data.token);
            } else if (data.type === 'done') {
              setLoading(false);
              showToast('NEURAL DECRYPTION COMPLETE', 'success');
            }
          }
        }
      }
    } catch (err) {
      setError(err.message);
      showToast(err.message, 'error');
      setLoading(false);
    }
  };

  const handleStandardSubmit = async (e) => {
    e.preventDefault();
    if (files.length === 0) {
      setError('ERR: NO_PAYLOAD_ATTACHED');
      return;
    }

    setLoading(true);
    setError(null);

    const formData = new FormData();
    if (activeTab === 'document') {
      files.forEach((file) => formData.append('files', file));
      formData.append('model', model);
    } else {
      formData.append('image', files[0]);
      formData.append('model', visionModel);
    }

    const endpoint = activeTab === 'document' ? `${apiBaseUrl}/api/process` : `${apiBaseUrl}/api/analyze-vision`;

    try {
      const response = await fetch(endpoint, { method: 'POST', body: formData });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'NET_ERR: Execution aborted');

      setResult(data);
      saveToHistory(data);
      showToast('ICE BREACH SUCCESSFUL', 'success');
    } catch (err) {
      setError(err.message);
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRagQuery = (e) => {
    e.preventDefault();
    if (!archiveQuery.trim()) return;

    const userMsg = archiveQuery;
    setArchiveQuery('');
    setChatMessages(prev => [...prev, { role: 'user', content: userMsg }]);

    const matches = history.filter(h => 
      h.filename?.toLowerCase().includes(userMsg.toLowerCase()) ||
      h.data?.summary?.toLowerCase().includes(userMsg.toLowerCase()) ||
      h.data?.vendor?.toLowerCase().includes(userMsg.toLowerCase())
    );

    let reply = "";
    if (matches.length > 0) {
      reply = `[DATABASE MATCH: ${matches.length} RECORD(S) FOUND]\n` + 
        matches.map(m => `> FILE: ${m.filename} [${m.data?.vendor || 'N/A'}]\n  SUMMARY: ${m.data?.summary || m.data?.notes || 'N/A'}`).join('\n\n');
    } else {
      reply = `[WARNING: 0 MATCHES FOR "${userMsg}" ACROSS ${history.length} ARCHIVED DATABASES]`;
    }

    setTimeout(() => {
      setChatMessages(prev => [...prev, { role: 'assistant', content: reply }]);
    }, 400);
  };

  const filteredHistory = history.filter(item => {
    const query = searchQuery.toLowerCase();
    return (
      item.filename?.toLowerCase().includes(query) ||
      item.data?.vendor?.toLowerCase().includes(query) ||
      item.data?.summary?.toLowerCase().includes(query)
    );
  });

  return (
    <div className="min-h-screen text-[#00ffcc] font-mono selection:bg-[#ffee00] selection:text-black flex flex-col items-center justify-between p-4 sm:p-6 relative overflow-x-hidden cursor-crosshair">

      {/* Matrix Canvas (Invaders render conditionally when gameActive is true) */}
      <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0 opacity-50"></canvas>

      {/* Neon Glow Vignette Overlay */}
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(5,5,10,0.85)_100%)] pointer-events-none z-0"></div>

      {/* Scoreboard (Visible only when game is activated) */}
      {gameActive && (
        <div className="fixed top-5 right-6 z-50 bg-[#0a0a12]/90 border border-[#ff0055] px-4 py-2 shadow-[0_0_20px_rgba(255,0,85,0.4)] backdrop-blur-md flex items-center space-x-3 animate-fade-in">
          <span className="text-[10px] text-[#ff0055] font-bold uppercase tracking-widest">INVADER_SCORE:</span>
          <span className="text-sm font-black text-[#ffee00] drop-shadow-[0_0_8px_#ffee00]">{invaderScore}</span>
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-16 right-5 z-50 px-4 py-3 bg-[#0a0a12]/95 border-2 ${toast.type === 'error' ? 'border-[#ff0055] text-[#ff0055] shadow-[0_0_25px_rgba(255,0,85,0.6)]' : 'border-[#00ffcc] text-[#00ffcc] shadow-[0_0_25px_rgba(0,255,204,0.6)]'} text-xs font-bold uppercase tracking-wider flex items-center space-x-2 backdrop-blur-md`}>
          <span>{toast.type === 'error' ? '[FAULT]' : '[OK]'}</span>
          <span>{toast.message}</span>
        </div>
      )}

      {/* Top Navigation Bar */}
      <div className="w-full max-w-5xl flex flex-col sm:flex-row justify-between items-center py-3 px-4 bg-[#0a0a12]/80 border border-[#00ffcc]/30 shadow-[0_0_20px_rgba(0,255,204,0.15)] backdrop-blur-xl mb-6 z-10 relative">
        <div className="flex items-center space-x-4 mb-3 sm:mb-0">
          {/* NETCITY Header Badge - Click to toggle mini-game */}
          <span 
            onClick={() => {
              setGameActive(prev => !prev);
              showToast(gameActive ? 'MINI-GAME DEACTIVATED' : 'MINI-GAME BOOTED: PERIMETER ENGAGED', 'success');
            }}
            title="Click to toggle mini-game"
            className="bg-[#ffee00] text-black text-[10px] font-black px-2.5 py-1 uppercase tracking-widest shadow-[0_0_12px_rgba(255,238,0,0.7)] animate-pulse cursor-pointer hover:bg-[#00ffcc] transition"
          >
            NETCITY // v2.077
          </span>
          <h2 className="text-sm font-black tracking-widest text-white uppercase">LOCAL_SCRIBE <span className="text-[#00ffcc] drop-shadow-[0_0_8px_#00ffcc]">// GODMODE</span></h2>

          <div className="hidden md:flex items-center space-x-3 text-[10px] bg-[#05050a]/90 px-3 py-1 border border-[#2e2e4f]">
            <span className="flex items-center space-x-1.5">
              <span className={`w-2 h-2 ${healthStatus.backend === 'online' ? 'bg-[#00ffcc] shadow-[0_0_10px_#00ffcc]' : 'bg-[#ff0055]'}`}></span>
              <span className="text-slate-400">API_LINK</span>
            </span>
            <span className="text-slate-700">|</span>
            <span className="flex items-center space-x-1.5">
              <span className={`w-2 h-2 ${healthStatus.ollama === 'online' ? 'bg-[#00ffcc] shadow-[0_0_10px_#00ffcc]' : 'bg-[#ff0055]'}`}></span>
              <span className="text-slate-400">OLLAMA ({healthStatus.ollama})</span>
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="text-xs px-3.5 py-1.5 bg-[#12121f]/90 border border-[#00ffcc]/40 text-[#ffee00] hover:bg-[#ffee00] hover:text-black transition uppercase tracking-wider font-bold shadow-[0_0_15px_rgba(255,238,0,0.2)] cursor-pointer"
          >
            Archives [{history.length}]
          </button>
        </div>
      </div>

      {/* Main Terminal Shell */}
      <div className="w-full max-w-3xl bg-[#0a0a12]/90 border-2 border-[#00ffcc]/40 shadow-[0_0_40px_rgba(0,255,204,0.2)] p-6 sm:p-8 relative z-10 backdrop-blur-2xl">

        {/* Decorative Cyber Corner Accents with Neon Glow */}
        <div className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-[#00ffcc] shadow-[0_0_10px_#00ffcc]"></div>
        <div className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-[#ffee00] shadow-[0_0_10px_#ffee00]"></div>
        <div className="absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-[#ff0055] shadow-[0_0_10px_#ff0055]"></div>
        <div className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-[#00ffcc] shadow-[0_0_10px_#ffee00]"></div>

        {showHistory && (
          <div className="mb-6 p-4 bg-[#05050a]/95 border border-[#00ffcc]/30 shadow-[inset_0_0_15px_rgba(0,255,204,0.1)]">
            <div className="flex justify-between items-center mb-3">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#ffee00]">DATABASE ARCHIVES</span>
              {history.length > 0 && (
                <button onClick={clearHistory} className="text-[10px] text-[#ff0055] hover:underline uppercase">PURGE ALL</button>
              )}
            </div>
            <input
              type="text"
              placeholder="FILTER_ARCHIVES..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full mb-3 px-3 py-2 text-xs bg-[#0a0a12] border border-[#2e2e4f] text-white outline-none focus:border-[#00ffcc] shadow-[0_0_10px_rgba(0,255,204,0.1)]"
            />
            {filteredHistory.length === 0 ? (
              <p className="text-[11px] text-slate-500">NO MATCHING DATA CHUNKS FOUND.</p>
            ) : (
              <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
                {filteredHistory.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => { setResult(item); setShowHistory(false); setActiveTab('document'); }}
                    className="p-2.5 bg-[#0a0a12] border border-[#2e2e4f] hover:border-[#00ffcc] text-xs cursor-pointer flex justify-between items-center transition shadow-sm"
                  >
                    <span className="font-bold text-white truncate max-w-[220px]">{item.filename}</span>
                    <span className="text-[10px] text-slate-500">{new Date(item.processed_at).toLocaleTimeString()}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="text-center mb-6">
          <h1 className="text-2xl sm:text-3xl font-black tracking-tighter text-white uppercase drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">
            NEURAL <span className="text-[#ffee00] drop-shadow-[0_0_10px_#ffee00]">DATA DECK</span>
          </h1>
          <p className="text-[11px] text-[#00ffcc]/80 mt-1 uppercase tracking-widest drop-shadow-[0_0_5px_rgba(0,255,204,0.4)]">
            CLICK 'NETCITY' BADGE TOP-LEFT TO TOGGLE PERIMETER MINI-GAME
          </p>
        </div>

        {/* Cyberpunk Navigation Tabs */}
        <div className="grid grid-cols-4 gap-1.5 p-1 bg-[#05050a] border border-[#2e2e4f] mb-6 text-[10px] sm:text-xs font-bold uppercase tracking-wider">
          <button
            type="button"
            onClick={() => setActiveTab('stream')}
            className={`py-2 text-center transition cursor-pointer ${activeTab === 'stream' ? 'bg-[#00ffcc] text-black shadow-[0_0_15px_rgba(0,255,204,0.6)] font-black' : 'text-slate-400 hover:text-white bg-[#0a0a12]'}`}
          >
            ⚡ STREAM
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('document')}
            className={`py-2 text-center transition cursor-pointer ${activeTab === 'document' ? 'bg-[#00ffcc] text-black shadow-[0_0_15px_rgba(0,255,204,0.6)] font-black' : 'text-slate-400 hover:text-white bg-[#0a0a12]'}`}
          >
            📄 BATCH
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('vision')}
            className={`py-2 text-center transition cursor-pointer ${activeTab === 'vision' ? 'bg-[#00ffcc] text-black shadow-[0_0_15px_rgba(0,255,204,0.6)] font-black' : 'text-slate-400 hover:text-white bg-[#0a0a12]'}`}
          >
            📐 VISION
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('rag')}
            className={`py-2 text-center transition cursor-pointer ${activeTab === 'rag' ? 'bg-[#00ffcc] text-black shadow-[0_0_15px_rgba(0,255,204,0.6)] font-black' : 'text-slate-400 hover:text-white bg-[#0a0a12]'}`}
          >
            💬 RAG CHAT
          </button>
        </div>

        {/* Tab 1: Live Typewriter Streaming */}
        {activeTab === 'stream' && (
          <form onSubmit={handleStreamSubmit} className="space-y-5">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest mb-2 text-[#ffee00]">TARGET LLM MODEL</label>
              <select
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="w-full bg-[#05050a] border border-[#2e2e4f] text-[#00ffcc] p-3 text-xs focus:outline-none focus:border-[#00ffcc] shadow-[0_0_10px_rgba(0,255,204,0.1)] cursor-pointer"
              >
                {availableModels.map(m => (<option key={m} value={m}>{m}</option>))}
              </select>
            </div>

            <div className="border-2 border-dashed border-[#2e2e4f] hover:border-[#ffee00] p-6 text-center cursor-pointer transition bg-[#05050a]/50">
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                className="w-full text-xs text-slate-400 file:mr-4 file:py-2 file:px-4 file:border-0 file:text-xs file:font-bold file:bg-[#ffee00] file:text-black hover:file:bg-[#00ffcc] cursor-pointer uppercase shadow-md"
              />
              <p className="text-[10px] text-slate-500 mt-2 uppercase">UPLOAD PDF FILE FOR REAL-TIME DECRYPTION</p>
            </div>

            {error && <div className="p-3 bg-[#ff0055]/10 border border-[#ff0055] text-[#ff0055] text-xs shadow-[0_0_10px_rgba(255,0,85,0.3)]">{error}</div>}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-[#ffee00] hover:bg-[#00ffcc] text-black font-black uppercase tracking-widest text-xs transition shadow-[0_0_25px_rgba(255,238,0,0.4)] disabled:opacity-50 cursor-pointer"
            >
              {loading ? 'DECRYPTING STREAM...' : 'EXECUTE LIVE STREAM'}
            </button>

            {(streamText || loading) && (
              <div className="p-4 bg-[#05050a]/90 border border-[#00ffcc]/30 mt-6 shadow-[inset_0_0_20px_rgba(0,255,204,0.1)]">
                <div className="flex justify-between items-center mb-2 pb-2 border-b border-[#2e2e4f]">
                  <span className="text-[10px] font-bold text-[#ffee00] uppercase tracking-widest">LIVE TYPEWRITER OUTPUT // STREAM</span>
                  {streamStats && <span className="text-[10px] text-slate-400">{streamStats.wordCount} WORDS</span>}
                </div>
                <p className="text-xs leading-relaxed whitespace-pre-wrap font-mono text-slate-200">
                  {streamText}
                  {loading && <span className="inline-block w-2 h-3.5 ml-1 bg-[#00ffcc] shadow-[0_0_8px_#00ffcc] animate-pulse"></span>}
                </p>
              </div>
            )}
          </form>
        )}

        {/* Tab 2 & 3: Standard Batch & Vision */}
        {(activeTab === 'document' || activeTab === 'vision') && (
          <form onSubmit={handleStandardSubmit} className="space-y-5">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest mb-2 text-[#ffee00]">TARGET MODEL</label>
              <select
                value={activeTab === 'document' ? model : visionModel}
                onChange={(e) => activeTab === 'document' ? setModel(e.target.value) : setVisionModel(e.target.value)}
                className="w-full bg-[#05050a] border border-[#2e2e4f] text-[#00ffcc] p-3 text-xs focus:outline-none focus:border-[#00ffcc] shadow-[0_0_10px_rgba(0,255,204,0.1)] cursor-pointer"
              >
                {activeTab === 'document' ? availableModels.map(m => <option key={m} value={m}>{m}</option>) : <option value="llava">llava</option>}
              </select>
            </div>

            <div className="border-2 border-dashed border-[#2e2e4f] hover:border-[#ffee00] p-6 text-center cursor-pointer transition bg-[#05050a]/50">
              <input
                type="file"
                multiple={activeTab === 'document'}
                accept={activeTab === 'document' ? '.pdf' : 'image/*'}
                onChange={handleFileChange}
                className="w-full text-xs text-slate-400 file:mr-4 file:py-2 file:px-4 file:border-0 file:text-xs file:font-bold file:bg-[#ffee00] file:text-black hover:file:bg-[#00ffcc] cursor-pointer uppercase shadow-md"
              />
            </div>

            {error && <div className="p-3 bg-[#ff0055]/10 border border-[#ff0055] text-[#ff0055] text-xs shadow-[0_0_10px_rgba(255,0,85,0.3)]">{error}</div>}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-[#ffee00] hover:bg-[#00ffcc] text-black font-black uppercase tracking-widest text-xs transition shadow-[0_0_25px_rgba(255,238,0,0.4)] disabled:opacity-50 cursor-pointer"
            >
              {loading ? 'PROCESSING...' : 'RUN ICE BREAKER'}
            </button>

            {result && !result.results && (
              <div className="p-5 bg-[#05050a]/90 border border-[#00ffcc]/30 mt-6 shadow-[inset_0_0_15px_rgba(0,255,204,0.1)]">
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-[#ffee00] mb-2">{result.filename}</h3>
                <p className="text-xs text-slate-300 leading-relaxed">{result.data.summary || result.data.notes}</p>
              </div>
            )}
          </form>
        )}

        {/* Tab 4: Archive RAG Chat */}
        {activeTab === 'rag' && (
          <div className="space-y-4">
            <div className="h-72 overflow-y-auto p-4 bg-[#05050a]/90 border border-[#00ffcc]/30 space-y-3 shadow-[inset_0_0_15px_rgba(0,255,204,0.1)]">
              {chatMessages.map((msg, index) => (
                <div key={index} className={`p-3 text-xs leading-relaxed border ${msg.role === 'user' ? 'bg-[#ffee00]/10 border-[#ffee00]/40 text-[#ffee00] ml-6 shadow-[0_0_10px_rgba(255,238,0,0.15)]' : 'bg-[#0a0a12] border-[#2e2e4f] text-slate-300 mr-6 shadow-sm'}`}>
                  <span className="block font-bold mb-1 text-[9px] uppercase tracking-wider text-[#00ffcc]">{msg.role === 'user' ? '// OPERATOR' : '// ARCHIVE_RAG'}</span>
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                </div>
              ))}
            </div>

            <form onSubmit={handleRagQuery} className="flex space-x-2">
              <input
                type="text"
                placeholder="QUERY ARCHIVED DATABASES..."
                value={archiveQuery}
                onChange={(e) => setArchiveQuery(e.target.value)}
                className="flex-1 px-4 py-3 text-xs bg-[#05050a] border border-[#2e2e4f] text-white outline-none focus:border-[#00ffcc] shadow-[0_0_10px_rgba(0,255,204,0.1)]"
              />
              <button type="submit" className="px-5 py-3 bg-[#ffee00] hover:bg-[#00ffcc] text-black font-black text-xs uppercase transition shadow-[0_0_15px_rgba(255,238,0,0.3)] cursor-pointer">QUERY</button>
            </form>
          </div>
        )}

      </div>

      <footer className="text-[10px] text-slate-500 uppercase tracking-widest mt-6 z-10 relative">
        NIGHTCITY NETWORKS // SECURE OFFLINE TERMINAL
      </footer>
    </div>
  );
}

export default App;
