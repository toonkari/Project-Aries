import { useState, useEffect, useRef } from 'react';
import './App.css';

const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:8000').replace(/\/$/, '');


// Pure helper moved outside component so it never triggers React dependency warnings
const playHudClick = () => {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(900, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.04);
    gain.gain.setValueAtTime(0.04, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.001, ctx.currentTime + 0.04);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.04);
  } catch {
    // Audio context suppressed before user interaction
  }
};

export default function App() {
  const [activeTab, setActiveTab] = useState('intro');
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isProjectsInView, setIsProjectsInView] = useState(false);

  // Transmission Terminal State
  const [senderHandle, setSenderHandle] = useState('');
  const [messageBody, setMessageBody] = useState('');
  const [transmissionStatus, setTransmissionStatus] = useState(null);
  const [isTransmitting, setIsTransmitting] = useState(false);

  const introRef = useRef(null);
  const projectsRef = useRef(null);
  const socialsRef = useRef(null);
  const terminalRef = useRef(null);

  const socialLinks = [
    { 
      name: 'GitHub', 
      url: 'https://github.com/toonkari', 
      desc: 'Inspect source code & repositories',
      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"></path><path d="M9 18c-4.51 2-5-2-7-2"></path></svg>
    },
    { 
      name: 'Instagram', 
      url: 'https://instagram.com/teominhh', 
      desc: 'Visual repository & creative shots',
      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"></line></svg>
    },
    { 
      name: 'TikTok', 
      url: 'https://tiktok.com/@teominhh', 
      desc: 'Short-form content & clips',
      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"></path></svg>
    },
    { 
      name: 'LinkedIn', 
      url: 'https://linkedin.com', 
      desc: 'Professional network & experience',
      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect width="4" height="12" x="2" y="9"></rect><circle cx="4" cy="4" r="2"></circle></svg>
    },
    { 
      name: 'Cobalt', 
      url: '#', 
      desc: 'System engine & utility module',
      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="12" x2="12" y1="8" y2="12"></line><line x1="12" x2="12.01" y1="16" y2="16"></line></svg>
    }
  ];

  const scrollToSection = (ref, tabName) => {
    playHudClick();
    setActiveTab(tabName);
    ref.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
  fetch(`${API_BASE_URL}/api/projects`)
    .then((res) => res.json())
    .then((data) => {
      setProjects(data.projects);
      setLoading(false);
    })
    .catch((err) => {
      console.error("Failed to fetch projects:", err);
      setLoading(false);
    });
}, []);

  useEffect(() => {
    const container = document.querySelector('.snap-container');
    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            if (entry.target === introRef.current) setActiveTab('intro');
            if (entry.target === projectsRef.current) {
              setActiveTab('projects');
              setIsProjectsInView(true);
            } else {
              setIsProjectsInView(false);
            }
            if (entry.target === socialsRef.current) setActiveTab('socials');
            if (entry.target === terminalRef.current) setActiveTab('terminal');
          }
        });
      },
      { root: container, threshold: 0.3 }
    );

    if (introRef.current) observer.observe(introRef.current);
    if (projectsRef.current) observer.observe(projectsRef.current);
    if (socialsRef.current) observer.observe(socialsRef.current);
    if (terminalRef.current) observer.observe(terminalRef.current);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      
      const navigate = (ref, tabName) => {
        playHudClick();
        setActiveTab(tabName);
        ref.current?.scrollIntoView({ behavior: 'smooth' });
      };

      if (e.key === '1') navigate(introRef, 'intro');
      if (e.key === '2') navigate(projectsRef, 'projects');
      if (e.key === '3') navigate(socialsRef, 'socials');
      if (e.key === '4') navigate(terminalRef, 'terminal');
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSendTransmission = async (e) => {
    e.preventDefault();
    if (!senderHandle || !messageBody) return;
    setIsTransmitting(true);
    setTransmissionStatus(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/proxy-message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sender_handle: senderHandle, message: messageBody })
      });
      const data = await response.json();
      if (response.ok) {
        setTransmissionStatus(data.acknowledgement);
        setSenderHandle('');
        setMessageBody('');
      } else {
        setTransmissionStatus('Transmission failed. Connection error.');
      }
    } catch {
      setTransmissionStatus('Server unreachable. FastAPI offline.');
    } finally {
      setIsTransmitting(false);
    }
  };

  return (
    <div className="snap-container">
      <video src="/background.mp4" autoPlay loop muted playsInline className="video-background" />
      <div className="zzz-hud-overlay" />
      <div className="zzz-hud-frame">
        <span className="zzz-hud-crosshair top-left">+++ // SYS.ARIES.01</span>
        <span className="zzz-hud-crosshair bottom-right">NEW ERIDU PROXY // +++</span>
      </div>

      {/* 4-Item Right-Side Navigation Rail */}
      <div className="tab-switcher">
        <button className={`zzz-tab-button ${activeTab === 'intro' ? 'active' : ''}`} onClick={() => scrollToSection(introRef, 'intro')}>
          <span>01 // Intro</span>
        </button>
        <button className={`zzz-tab-button ${activeTab === 'projects' ? 'active' : ''}`} onClick={() => scrollToSection(projectsRef, 'projects')}>
          <span>02 // Work</span>
        </button>
        <button className={`zzz-tab-button ${activeTab === 'socials' ? 'active' : ''}`} onClick={() => scrollToSection(socialsRef, 'socials')}>
          <span>03 // Links</span>
        </button>
        <button className={`zzz-tab-button ${activeTab === 'terminal' ? 'active' : ''}`} onClick={() => scrollToSection(terminalRef, 'terminal')}>
          <span>04 // Terminal</span>
        </button>
      </div>

      {/* SECTION 1: INTRO */}
      <section ref={introRef} className="snap-section">
        <div style={{ width: '100%', maxWidth: '580px', marginBottom: '1.5rem' }}>
          <div className="zzz-banner">
            <h1 style={{ fontSize: '1.8rem', fontWeight: '900', letterSpacing: '0.05em', textTransform: 'uppercase', color: '#fff' }}>
              PROJECT ARIES
            </h1>
            <p style={{ color: '#76ff03', fontSize: '0.8rem', fontWeight: '800', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
              // INTER-KNOT PROXY AGENT PROFILE
            </p>
          </div>
        </div>

        <div className="zzz-panel" style={{ padding: '1.75rem', maxWidth: '580px', width: '100%', textAlign: 'left' }}>
          <h2 style={{ fontSize: '1.1rem', color: '#76ff03', marginBottom: '0.6rem', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            The first breath of my career.
          </h2>
          <p style={{ color: '#cbd5e1', fontSize: '0.9rem', lineHeight: '1.5' }}>
            Authorized proxy channel connected. Specializing in full-stack architecture, secure system frameworks, and interactive web application layers.
          </p>
        </div>

        <div className="scroll-indicator">
          <span>SCROLL DOWN [PRESS 2]</span>
          <span style={{ fontSize: '1rem', color: '#76ff03' }}>▼</span>
        </div>
      </section>

      {/* SECTION 2: PROJECTS */}
      <section ref={projectsRef} className="snap-section">
        <div className={`bg-sliding-word ${isProjectsInView ? 'slide-in' : ''}`}>
          DESIGN
        </div>

        <main style={{ width: '100%', maxWidth: '640px', marginBottom: '2rem', textAlign: 'left', position: 'relative', zIndex: 2 }}>
          <h2 style={{ fontSize: '1.1rem', color: '#121316', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.75rem', fontWeight: '900' }}>
            [ COMMISSIONS & PROJECTS ]
          </h2>

          {loading ? (
            <p style={{ color: '#121316', textAlign: 'left', fontWeight: '800' }}>Accessing database...</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {projects.map((project) => (
                <div key={project.id} className="zzz-panel" style={{ padding: '1.1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.4rem' }}>
                    <h3 style={{ margin: 0, color: '#fff', fontSize: '1rem', fontWeight: '900', letterSpacing: '0.03em' }}>
                      {project.title}
                    </h3>
                    <span style={{ 
                      fontSize: '0.65rem', padding: '0.15rem 0.5rem', fontWeight: '900',
                      backgroundColor: project.status === 'Active' ? 'rgba(118, 255, 3, 0.15)' : 'rgba(255, 85, 0, 0.15)',
                      color: project.status === 'Active' ? '#76ff03' : '#ff5500',
                      border: `1px solid ${project.status === 'Active' ? '#76ff03' : '#ff5500'}`
                    }}>
                      {project.status.toUpperCase()}
                    </span>
                  </div>
                  
                  <p style={{ color: '#94a3b8', fontSize: '0.85rem', lineHeight: '1.4', marginBottom: '0.75rem' }}>
                    {project.description}
                  </p>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.4rem' }}>
                    <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap' }}>
                      {project.techStack.map((tech, index) => (
                        <span key={index} style={{ fontSize: '0.65rem', backgroundColor: '#141620', padding: '0.15rem 0.4rem', border: '1px solid rgba(255,255,255,0.15)', color: '#76ff03', fontWeight: '800' }}>
                          {tech}
                        </span>
                      ))}
                    </div>

                    <a href={project.githubUrl} target="_blank" rel="noreferrer" style={{ fontSize: '0.8rem', color: '#76ff03', textDecoration: 'none', fontWeight: '900', textTransform: 'uppercase' }}>
                      Source Code →
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>

        <div className={`projects-status-bar ${isProjectsInView ? 'visible' : ''}`}>
          <span style={{ width: '7px', height: '7px', backgroundColor: '#76ff03', boxShadow: '0 0 6px #76ff03' }}></span>
          <span>FastAPI Proxy Live // Connection Secure</span>
        </div>
      </section>

      {/* SECTION 3: SOCIALS */}
      <section ref={socialsRef} className="snap-section">
        <main style={{ width: '100%', maxWidth: '640px', textAlign: 'left', position: 'relative', zIndex: 2 }}>
          <h2 style={{ fontSize: '1.1rem', color: '#121316', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.75rem', fontWeight: '900' }}>
            [ NETWORK CHANNELS ]
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {socialLinks.map((link, idx) => (
              <a key={idx} href={link.url} target="_blank" rel="noreferrer" className="zzz-social-card">
                <div style={{ color: '#76ff03', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  {link.icon}
                  <div>
                    <div style={{ fontWeight: '900', letterSpacing: '0.04em', color: '#fff' }}>{link.name}</div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 'normal', marginTop: '0.1rem' }}>
                      {link.desc}
                    </div>
                  </div>
                </div>
                <span style={{ color: '#76ff03', fontWeight: '900', fontSize: '1.1rem' }}>→</span>
              </a>
            ))}
          </div>
        </main>
      </section>

      {/* SECTION 4: TRANSMISSION TERMINAL */}
      <section ref={terminalRef} className="snap-section">
        <main style={{ width: '100%', maxWidth: '640px', textAlign: 'left', position: 'relative', zIndex: 2 }}>
          <h2 style={{ fontSize: '1.1rem', color: '#121316', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.75rem', fontWeight: '900' }}>
            [ DIRECT TRANSMISSION ]
          </h2>
          <form onSubmit={handleSendTransmission} className="zzz-terminal-form" style={{ marginTop: 0 }}>
            <div style={{ fontSize: '0.8rem', fontWeight: '900', color: '#76ff03', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              // SECURE PROXY TRANSMISSION TERMINAL
            </div>
            <input 
              type="text" 
              placeholder="Your Proxy Handle / Name" 
              value={senderHandle}
              onChange={(e) => setSenderHandle(e.target.value)}
              className="zzz-input"
              required 
            />
            <textarea 
              placeholder="Enter secure message or commission brief..." 
              value={messageBody}
              onChange={(e) => setMessageBody(e.target.value)}
              className="zzz-input"
              rows="3"
              required 
            />
            <button type="submit" className="zzz-submit-btn" disabled={isTransmitting}>
              {isTransmitting ? 'Transmitting...' : 'Send Transmission →'}
            </button>
            {transmissionStatus && (
              <div className="zzz-response-msg">
                {transmissionStatus}
              </div>
            )}
          </form>
        </main>
      </section>
    </div>
  );

  
}