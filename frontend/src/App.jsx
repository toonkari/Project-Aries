import { useState, useEffect, useRef } from 'react';
import './App.css';

export default function App() {
  const [activeTab, setActiveTab] = useState('intro');
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isProjectsInView, setIsProjectsInView] = useState(false);

  const introRef = useRef(null);
  const projectsRef = useRef(null);
  const socialsRef = useRef(null);

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

  useEffect(() => {
    fetch('http://localhost:8000/api/projects')
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
          }
        });
      },
      { threshold: 0.55 }
    );

    if (introRef.current) observer.observe(introRef.current);
    if (projectsRef.current) observer.observe(projectsRef.current);
    if (socialsRef.current) observer.observe(socialsRef.current);

    return () => observer.disconnect();
  }, []);

  const scrollToSection = (ref, tabName) => {
    setActiveTab(tabName);
    ref.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="snap-container">
      <video src="/background.mp4" autoPlay loop muted playsInline className="video-background" />

      {/* SECTION 1: INTRO */}
      <section ref={introRef} className="snap-section">
        <div style={{ width: '100%', maxWidth: '580px', marginBottom: '1.5rem' }}>
          {/* Inter-Knot Profile Banner Header (No Logo Badge) */}
          <div className="zzz-banner">
            <h1 style={{ fontSize: '1.6rem', fontWeight: '900', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              PROJECT ARIES
            </h1>
            <p style={{ color: '#00f0ff', fontSize: '0.8rem', fontWeight: '800', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
              // INTER-KNOT PROXY AGENT PROFILE
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="tab-switcher">
          <button className={`zzz-tab-button ${activeTab === 'intro' ? 'active' : ''}`} onClick={() => scrollToSection(introRef, 'intro')}>
            <span>Intro</span>
          </button>
          <button className={`zzz-tab-button ${activeTab === 'projects' ? 'active' : ''}`} onClick={() => scrollToSection(projectsRef, 'projects')}>
            <span>Projects</span>
          </button>
          <button className={`zzz-tab-button ${activeTab === 'socials' ? 'active' : ''}`} onClick={() => scrollToSection(socialsRef, 'socials')}>
            <span>Socials</span>
          </button>
        </div>

        <div className="zzz-panel" style={{ padding: '1.75rem', maxWidth: '580px', width: '100%', textAlign: 'left' }}>
          <h2 style={{ fontSize: '1.1rem', color: '#00f0ff', marginBottom: '0.6rem', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            The first breath of my career.
          </h2>
          <p style={{ color: '#cbd5e1', fontSize: '0.9rem', lineHeight: '1.5' }}>
            Authorized proxy channel connected. Specializing in full-stack architecture, secure system frameworks, and interactive web application layers.
          </p>
        </div>

        <div className="scroll-indicator">
          <span>SCROLL DOWN</span>
          <span style={{ fontSize: '1rem' }}>▼</span>
        </div>
      </section>

      {/* SECTION 2: PROJECTS */}
      <section ref={projectsRef} className="snap-section">
        <main style={{ width: '100%', maxWidth: '640px', marginBottom: '2rem', textAlign: 'left' }}>
          <h2 style={{ fontSize: '1.1rem', color: '#00f0ff', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.75rem', fontWeight: '900' }}>
            [ COMMISSIONS & PROJECTS ]
          </h2>

          {loading ? (
            <p style={{ color: '#94a3b8', textAlign: 'center', fontWeight: '800' }}>Accessing database...</p>
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
                      backgroundColor: project.status === 'Active' ? 'rgba(0, 240, 255, 0.2)' : 'rgba(255, 85, 0, 0.2)',
                      color: project.status === 'Active' ? '#00f0ff' : '#ff5500',
                      border: `1px solid ${project.status === 'Active' ? '#00f0ff' : '#ff5500'}`
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
                        <span key={index} style={{ fontSize: '0.65rem', backgroundColor: '#0c0d12', padding: '0.15rem 0.4rem', border: '1px solid rgba(255,255,255,0.15)', color: '#00f0ff', fontWeight: '800' }}>
                          {tech}
                        </span>
                      ))}
                    </div>

                    <a href={project.githubUrl} target="_blank" rel="noreferrer" style={{ fontSize: '0.8rem', color: '#ff5500', textDecoration: 'none', fontWeight: '900', textTransform: 'uppercase' }}>
                      Source Code →
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>

        <div className={`projects-status-bar ${isProjectsInView ? 'visible' : ''}`}>
          <span style={{ width: '7px', height: '7px', backgroundColor: '#00f0ff', boxShadow: '0 0 6px #00f0ff' }}></span>
          <span>FastAPI Proxy Live // Connection Secure</span>
        </div>
      </section>

      {/* SECTION 3: SOCIALS */}
      <section ref={socialsRef} className="snap-section">
        <div style={{ width: '100%', maxWidth: '640px', textAlign: 'left' }}>
          <h2 style={{ fontSize: '1.1rem', color: '#00f0ff', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.75rem', fontWeight: '900' }}>
            [ NETWORK CHANNELS ]
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {socialLinks.map((link, idx) => (
              <a key={idx} href={link.url} target="_blank" rel="noreferrer" className="zzz-social-card">
                <div style={{ color: '#00f0ff', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  {link.icon}
                  <div>
                    <div style={{ fontWeight: '900', letterSpacing: '0.04em', color: '#fff' }}>{link.name}</div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 'normal', marginTop: '0.1rem' }}>
                      {link.desc}
                    </div>
                  </div>
                </div>
                <span style={{ color: '#ff5500', fontWeight: '900', fontSize: '1.1rem' }}>→</span>
              </a>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}