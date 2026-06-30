import React, { useState } from 'react';
import { 
  Shield, 
  Sparkles, 
  Key, 
  Mail, 
  Lock, 
  User as UserIcon, 
  CheckCircle, 
  RefreshCw, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  Globe as GlobeIcon, 
  Brain, 
  TrendingUp, 
  FileText, 
  Layers, 
  Map, 
  Star, 
  Check, 
  ArrowLeft,
  Search,
  MessageSquare,
  Compass
} from 'lucide-react';
import { api } from '../utils/api';

interface LoginProps {
  onLoginSuccess: (user: any) => void;
}

export default function Login({ onLoginSuccess }: LoginProps) {
  // Mode state: 'landing' shows features and hero. 'auth' shows the split-screen login page.
  const [viewMode, setViewMode] = useState<'landing' | 'auth'>('landing');
  const [isSignup, setIsSignup] = useState(false);
  
  // Login / Signup states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (isSignup) {
        if (password !== confirmPassword) {
          throw new Error('Passwords do not match.');
        }
        const data = await api.signup({
          name,
          email,
          password,
          confirmPassword
        });
        setSuccess('Account registered successfully! Loading executive dashboard...');
        setTimeout(() => {
          onLoginSuccess(data.user);
        }, 1200);
      } else {
        const data = await api.login(email, password);
        setSuccess('Authentication approved. Fetching region telemetry...');
        setTimeout(() => {
          onLoginSuccess(data.user);
        }, 1000);
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please check network logs.');
    } finally {
      setLoading(false);
    }
  };

  const fillCredentials = (role: 'admin' | 'viewer') => {
    setIsSignup(false);
    if (role === 'admin') {
      setEmail('devanshgautam0001@gmail.com');
      setPassword('admin123');
    } else {
      setEmail('viewer@geobi.com');
      setPassword('viewer123');
    }
  };

  const features = [
    {
      icon: <Layers className="w-5 h-5 text-[#4F8CFF]" />,
      title: "Interactive GIS Intelligence",
      description: "Analyze geographical hubs, density clusters, and district ratings with deep coordinate filters.",
      badge: "GIS Standard"
    },
    {
      icon: <Brain className="w-5 h-5 text-[#7C5CFF]" />,
      title: "AI Business Consultant",
      description: "Contextual business assistance fueled by predictive neural pipelines for direct regional strategies.",
      badge: "LLM Powered"
    },
    {
      icon: <TrendingUp className="w-5 h-5 text-[#32D583]" />,
      title: "Digital Presence Analytics",
      description: "Drill down into domain penetration, organic review velocity, and regional SEO benchmarks.",
      badge: "SEO Insights"
    },
    {
      icon: <Sparkles className="w-5 h-5 text-[#F59E0B]" />,
      title: "Growth Opportunity Detection",
      description: "Algorithmic scoring models designed to automatically isolate high-potential regional leads.",
      badge: "Predictive"
    },
    {
      icon: <FileText className="w-5 h-5 text-[#4F8CFF]" />,
      title: "Executive Reports Suite",
      description: "Compile production-ready PDFs, Excel exports, and pre-formatted Power BI structures in seconds.",
      badge: "Enterprise"
    },
    {
      icon: <Map className="w-5 h-5 text-[#7C5CFF]" />,
      title: "Real Google Maps Dataset",
      description: "Authentic, live-mapped data points tracking Chandigarh and Mohali commercial coordinates.",
      badge: "Verified"
    }
  ];

  const stats = [
    { value: "1,200+", label: "Commercial Nodes Mapped", color: "text-[#4F8CFF]" },
    { value: "98.4%", label: "Domain Presence Precision", color: "text-[#7C5CFF]" },
    { value: "120+", label: "Heuristics Checked Per Cohort", color: "text-[#32D583]" },
    { value: "10x", label: "Executive Analytics Speedup", color: "text-[#F59E0B]" }
  ];

  return (
    <div className="min-h-screen bg-[#050505] text-[#E5E5E5] flex flex-col font-sans relative overflow-x-hidden selection:bg-[#4F8CFF]/30 selection:text-white">
      
      {/* Animated Abstract Aurora Canvas */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-gradient-to-tr from-[#4F8CFF]/15 to-transparent blur-[120px] animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-gradient-to-bl from-[#7C5CFF]/12 to-transparent blur-[120px] animate-pulse" style={{ animationDuration: '12s' }} />
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      </div>

      {viewMode === 'landing' ? (
        // ==========================================
        // STUNNING LANDING PAGE VIEW
        // ==========================================
        <div className="relative z-10 flex flex-col min-h-screen">
          
          {/* Header */}
          <header className="w-full py-5 px-6 sm:px-12 flex justify-between items-center border-b border-white/[0.05] backdrop-blur-md sticky top-0 bg-[#050505]/40">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-[#4F8CFF]/20 to-[#7C5CFF]/20 border border-white/[0.08] rounded-xl">
                <Shield className="w-5 h-5 text-[#4F8CFF]" />
              </div>
              <div>
                <span className="font-serif italic text-xl text-white tracking-tight flex items-center gap-1.5">
                  GeoVision <span className="font-mono text-[9px] uppercase tracking-widest text-[#4F8CFF] bg-[#4F8CFF]/10 px-2 py-0.5 rounded-md border border-[#4F8CFF]/20">AI</span>
                </span>
              </div>
            </div>
            
            <button 
              onClick={() => { setViewMode('auth'); setIsSignup(false); }}
              className="px-4.5 py-2 bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.08] hover:border-white/20 rounded-full text-xs font-mono font-semibold tracking-wider transition-all duration-300 cursor-pointer text-white"
            >
              System Authentication
            </button>
          </header>

          {/* Hero Section */}
          <section className="flex-1 max-w-7xl mx-auto px-6 sm:px-12 py-12 md:py-20 lg:py-24 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6 text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#4F8CFF]/10 border border-[#4F8CFF]/20 rounded-full">
                <Sparkles className="w-3 h-3 text-[#4F8CFF] animate-pulse" />
                <span className="text-[9px] font-mono tracking-widest uppercase font-extrabold text-[#4F8CFF]">Next-Gen Intelligence Core</span>
              </div>
              
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-serif text-white tracking-tight leading-[1.05]">
                GeoVision <span className="text-[#4F8CFF] italic font-normal">AI</span>
              </h1>
              
              <p className="text-lg sm:text-xl text-white/70 font-sans tracking-wide leading-relaxed max-w-xl">
                AI-Powered Business Intelligence Platform for Local Market Growth. Master the spatial coordinates, SEO, and domain penetration of entire metropolitan hubs.
              </p>
              
              <div className="flex flex-wrap items-center gap-4 pt-4">
                <button
                  onClick={() => { setViewMode('auth'); setIsSignup(true); }}
                  className="px-6 py-3.5 bg-gradient-to-r from-[#4F8CFF] to-[#7C5CFF] text-white hover:opacity-95 text-xs font-mono font-bold uppercase tracking-widest rounded-xl transition-all cursor-pointer shadow-lg shadow-[#4F8CFF]/20 hover:-translate-y-0.5 flex items-center gap-2 active:scale-95"
                >
                  Get Started
                  <ArrowRight className="w-4 h-4" />
                </button>
                
                <button
                  onClick={() => { setViewMode('auth'); setIsSignup(false); }}
                  className="px-6 py-3.5 bg-white/[0.02] hover:bg-white/[0.05] text-white border border-white/[0.08] hover:border-white/20 text-xs font-mono font-bold uppercase tracking-widest rounded-xl transition-all cursor-pointer hover:-translate-y-0.5 active:scale-95"
                >
                  Live Demo
                </button>
              </div>
            </div>

            {/* Right Interactive Globe Section */}
            <div className="lg:col-span-5 flex justify-center items-center relative h-96">
              
              {/* Premium Floating Glowing Globe Background Visuals */}
              <div className="absolute w-72 h-72 rounded-full bg-gradient-to-br from-[#4F8CFF]/5 to-[#7C5CFF]/5 filter blur-2xl" />
              
              {/* Spinning 3D Tech Globe representation made with advanced SVG & CSS */}
              <div className="relative w-80 h-80 flex items-center justify-center animate-float-1">
                <svg className="w-full h-full text-white/10" viewBox="0 0 200 200">
                  <defs>
                    <linearGradient id="globeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#4F8CFF" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="#7C5CFF" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  
                  {/* Outer Orbit Rings */}
                  <circle cx="100" cy="100" r="95" fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="5,5" className="animate-spin" style={{ animationDuration: '40s' }} />
                  <circle cx="100" cy="100" r="85" fill="none" stroke="currentColor" strokeWidth="0.5" className="opacity-40" />
                  
                  {/* Interactive Globe Grid */}
                  <circle cx="100" cy="100" r="70" fill="url(#globeGrad)" stroke="rgba(255, 255, 255, 0.15)" strokeWidth="1" />
                  
                  {/* Vertical Slices representing longitude */}
                  <ellipse cx="100" cy="100" rx="45" ry="70" fill="none" stroke="rgba(79, 140, 255, 0.25)" strokeWidth="0.75" className="animate-spin" style={{ animationDuration: '15s', transformOrigin: 'center' }} />
                  <ellipse cx="100" cy="100" rx="20" ry="70" fill="none" stroke="rgba(124, 92, 255, 0.25)" strokeWidth="0.75" className="animate-pulse" />
                  
                  {/* Horizontal Lines representing latitude */}
                  <line x1="33" y1="70" x2="167" y2="70" stroke="rgba(255,255,255,0.08)" strokeWidth="0.75" />
                  <line x1="30" y1="100" x2="170" y2="100" stroke="rgba(255,255,255,0.15)" strokeWidth="0.75" />
                  <line x1="33" y1="130" x2="167" y2="130" stroke="rgba(255,255,255,0.08)" strokeWidth="0.75" />
                  
                  {/* Glowing Pulse Nodes (Connecting Points) */}
                  <circle cx="60" cy="80" r="2.5" fill="#4F8CFF" className="animate-ping" style={{ animationDuration: '3s' }} />
                  <circle cx="60" cy="80" r="2" fill="#4F8CFF" />
                  
                  <circle cx="140" cy="120" r="3" fill="#7C5CFF" className="animate-ping" style={{ animationDuration: '4.5s' }} />
                  <circle cx="140" cy="120" r="2.5" fill="#7C5CFF" />
                  
                  <circle cx="100" cy="50" r="2.5" fill="#32D583" className="animate-pulse" style={{ animationDuration: '2s' }} />
                  <circle cx="100" cy="50" r="1.5" fill="#32D583" />
                </svg>

                {/* Overlaid Floating Metrics Card */}
                <div className="absolute bottom-4 left-4 glass-panel border border-white/[0.08] rounded-xl p-3 shadow-2xl backdrop-blur-md max-w-[170px] text-left">
                  <div className="flex items-center gap-1.5 text-[9px] font-mono text-[#32D583] uppercase tracking-wider font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#32D583] animate-pulse" />
                    Telemetric Online
                  </div>
                  <p className="text-[10px] font-mono text-white/50 mt-1 leading-normal">Sector 35, Chandigarh pipeline verified.</p>
                </div>
              </div>
            </div>

          </section>

          {/* Customer Statistics Row */}
          <section className="border-y border-white/[0.05] bg-white/[0.01]">
            <div className="max-w-7xl mx-auto px-6 sm:px-12 py-10 grid grid-cols-2 md:grid-cols-4 gap-6">
              {stats.map((st, idx) => (
                <div key={idx} className="text-center md:text-left space-y-1">
                  <span className={`text-3xl font-space font-medium tracking-tight ${st.color}`}>
                    {st.value}
                  </span>
                  <p className="text-[9px] font-mono uppercase tracking-widest text-white/40 font-bold leading-tight">
                    {st.label}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Bento-Grid Scrolling Feature Section */}
          <section className="max-w-7xl mx-auto px-6 sm:px-12 py-16 sm:py-24 text-center">
            <div className="space-y-4 max-w-2xl mx-auto mb-16">
              <span className="text-[10px] font-mono uppercase tracking-[0.2em] font-extrabold text-[#7C5CFF]">Core Modules</span>
              <h2 className="text-3xl sm:text-4xl font-serif text-white tracking-tight">
                Designed for high-end strategic operations.
              </h2>
              <p className="text-white/50 text-xs sm:text-sm font-sans tracking-wide leading-relaxed">
                GeoVision AI unifies map indexing, predictive optimization, and streaming assistance into a unified high-speed workflow.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-left">
              {features.map((fe, index) => (
                <div 
                  key={index}
                  className="glass-panel border border-white/[0.05] rounded-2xl p-6 hover:border-[#4F8CFF]/20 hover:-translate-y-1 duration-300 transition-all cursor-pointer group flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <div className="p-3 bg-white/[0.03] border border-white/[0.06] rounded-xl group-hover:bg-[#4F8CFF]/10 group-hover:border-[#4F8CFF]/25 transition-all">
                        {fe.icon}
                      </div>
                      <span className="text-[8px] font-mono uppercase tracking-widest text-white/40 bg-white/[0.04] border border-white/[0.06] py-1 px-2.5 rounded-full font-bold">
                        {fe.badge}
                      </span>
                    </div>
                    
                    <h3 className="text-base font-serif italic text-white leading-snug">
                      {fe.title}
                    </h3>
                    
                    <p className="text-xs text-white/50 leading-relaxed">
                      {fe.description}
                    </p>
                  </div>
                  
                  <div className="pt-5 border-t border-white/[0.04] mt-5 flex items-center justify-between text-[9px] font-mono uppercase tracking-widest font-extrabold text-white/30 group-hover:text-[#4F8CFF] transition-all">
                    <span>Initialize module</span>
                    <ArrowRight className="w-3 h-3 translate-x-[-4px] group-hover:translate-x-0 transition-transform" />
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Premium Footer */}
          <footer className="w-full py-8 px-6 sm:px-12 border-t border-white/[0.05] mt-auto text-center flex flex-col sm:flex-row justify-between items-center gap-4 bg-[#050505]/60">
            <p className="text-[9px] font-mono text-white/30 tracking-widest uppercase">
              © 2026 GeoVision AI Inc. All rights reserved.
            </p>
            <div className="flex gap-4.5 text-[9px] font-mono text-white/40 uppercase tracking-wider">
              <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
              <span>•</span>
              <a href="#" className="hover:text-white transition-colors">License Agreement</a>
              <span>•</span>
              <a href="#" className="hover:text-white transition-colors">System Health Status</a>
            </div>
          </footer>

        </div>
      ) : (
        // ==========================================
        // PREMIUM AUTHENTICATION PAGE (SPLIT-SCREEN)
        // ==========================================
        <div className="min-h-screen flex flex-col lg:flex-row relative z-10">
          
          {/* LEFT: Premium Animated Illustration & Statistics */}
          <div className="hidden lg:flex lg:w-1/2 bg-[#0E1117]/30 border-r border-white/[0.05] relative overflow-hidden flex-col justify-between p-12">
            
            {/* Ambient subtle noise grid & auroras */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_40%,#050505_95%)] pointer-events-none z-0" />
            
            <button 
              onClick={() => setViewMode('landing')}
              className="relative z-10 self-start flex items-center gap-2 px-4 py-2 bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.06] rounded-xl text-[10px] font-mono uppercase tracking-wider font-bold transition-all cursor-pointer text-white"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Return to overview
            </button>

            {/* Interactive Neural Mapping Graphics */}
            <div className="relative z-10 my-auto max-w-md space-y-8">
              <div className="inline-flex p-3 bg-[#4F8CFF]/10 border border-[#4F8CFF]/20 rounded-2xl">
                <GlobeIcon className="w-8 h-8 text-[#4F8CFF]" />
              </div>
              
              <h2 className="text-4xl font-serif italic text-white tracking-tight leading-tight">
                Deep Spatial Intelligence for Modern Enterprises.
              </h2>
              
              <p className="text-sm text-white/50 leading-relaxed font-sans">
                Authenticate with GeoVision AI to access verified commercial datasets, run dynamic local indices, and coordinate growth tactics.
              </p>

              {/* Scrolling Tech Feed Simulator */}
              <div className="border border-white/[0.06] bg-[#0A0D14]/80 rounded-2xl p-4.5 font-mono text-[10px] space-y-2.5 max-w-sm shadow-2xl">
                <div className="flex items-center justify-between text-white/40 pb-2 border-b border-white/[0.05] uppercase tracking-wider font-extrabold text-[9px]">
                  <span>System Log Console</span>
                  <span className="text-[#32D583]">ONLINE</span>
                </div>
                <div className="text-[#4F8CFF] flex gap-2">
                  <span>[03:27:01]</span>
                  <span>SYNCING CHANDIGARH COHORTS...</span>
                </div>
                <div className="text-white/60 flex gap-2">
                  <span>[03:27:02]</span>
                  <span>EVALUATED 1,200 SPATIAL DATA POINTS</span>
                </div>
                <div className="text-[#7C5CFF] flex gap-2">
                  <span>[03:27:03]</span>
                  <span>AI CONSULTANT PIPELINE RE-ESTABLISHED</span>
                </div>
                <div className="text-white/30 flex gap-2">
                  <span>[03:27:05]</span>
                  <span>READY FOR ENTERPRISE ANALYST CONNECT</span>
                </div>
              </div>
            </div>

            {/* Micro branding */}
            <div className="relative z-10 flex items-center gap-2">
              <Shield className="w-4 h-4 text-white/30" />
              <span className="text-[9px] font-mono text-white/30 uppercase tracking-[0.2em] font-bold">
                ENCRYPTED TRANSIT PORTAL • TLS 1.3
              </span>
            </div>

          </div>

          {/* RIGHT: Login Form Card */}
          <div className="flex-1 flex flex-col justify-center items-center p-6 sm:p-12 lg:p-20 relative">
            
            {/* Small screen Back Button */}
            <button 
              onClick={() => setViewMode('landing')}
              className="lg:hidden absolute top-6 left-6 flex items-center gap-1.5 px-3.5 py-1.5 bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.06] rounded-xl text-[9px] font-mono uppercase tracking-wider font-bold transition-all cursor-pointer text-white"
            >
              <ArrowLeft className="w-3 h-3" />
              Back
            </button>

            <div className="w-full max-w-md glass-panel rounded-2xl p-8 relative z-10 border border-white/[0.06] shadow-2xl animate-fadeIn">
              
              {/* Platform Title */}
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center p-3.5 bg-gradient-to-br from-[#4F8CFF]/20 to-[#7C5CFF]/20 border border-white/[0.08] rounded-2xl mb-4 shadow-[0_0_20px_rgba(79,140,255,0.12)]">
                  <Shield className="w-6 h-6 text-[#4F8CFF]" />
                </div>
                <h1 className="font-serif italic text-3xl text-white tracking-tight">
                  GeoVision <span className="text-[#4F8CFF] italic font-normal">AI</span>
                </h1>
                <p className="text-[10px] uppercase tracking-[0.25em] text-white/40 mt-1.5 font-bold font-mono">
                  Enterprise Access Portal
                </p>
              </div>

              {/* Seed Selection */}
              {!isSignup && (
                <div className="bg-[#141922]/40 border border-white/[0.06] rounded-xl p-4 mb-6 shadow-inner">
                  <p className="text-[9px] font-mono tracking-widest text-white/40 mb-3 flex items-center gap-1.5 uppercase font-bold">
                    <Key className="w-3.5 h-3.5 text-[#4F8CFF]" />
                    Fill analyst credentials seed
                  </p>
                  <div className="grid grid-cols-2 gap-2.5">
                    <button
                      onClick={() => fillCredentials('admin')}
                      className="flex items-center justify-center gap-1.5 text-[9px] uppercase tracking-wider py-2.5 px-3 bg-white/[0.03] hover:bg-[#4F8CFF]/10 hover:text-[#4F8CFF] border border-white/[0.06] hover:border-[#4F8CFF]/20 text-white/80 font-mono transition-all duration-300 cursor-pointer rounded-xl"
                    >
                      <Check className="w-3.5 h-3.5 text-[#4F8CFF]" />
                      Admin seed
                    </button>
                    <button
                      onClick={() => fillCredentials('viewer')}
                      className="flex items-center justify-center gap-1.5 text-[9px] uppercase tracking-wider py-2.5 px-3 bg-white/[0.03] hover:bg-[#7C5CFF]/10 hover:text-[#7C5CFF] border border-white/[0.06] hover:border-[#7C5CFF]/20 text-white/80 font-mono transition-all duration-300 cursor-pointer rounded-xl"
                    >
                      <Check className="w-3.5 h-3.5 text-[#7C5CFF]" />
                      Viewer seed
                    </button>
                  </div>
                </div>
              )}

              {/* Authentication Form */}
              <form onSubmit={handleAuthSubmit} className="space-y-4">
                {isSignup && (
                  <div>
                    <label className="block text-[9px] font-mono text-white/40 uppercase tracking-widest mb-1.5 font-extrabold">
                      Full Analyst Name
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                        <UserIcon className="w-4 h-4 text-white/25" />
                      </span>
                      <input
                        type="text"
                        required
                        placeholder="Devansh Gautam"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-[#0E1117]/80 border border-white/[0.06] focus:border-[#4F8CFF]/40 focus:ring-1 focus:ring-[#4F8CFF]/20 rounded-xl text-xs text-white placeholder-white/20 focus:outline-none transition-all duration-300 font-mono"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-[9px] font-mono text-white/40 uppercase tracking-widest mb-1.5 font-extrabold">
                    Analyst Email Address
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <Mail className="w-4 h-4 text-white/25" />
                    </span>
                    <input
                      type="email"
                      required
                      placeholder={isSignup ? "analyst.name@domain.com" : "email@geobi.com"}
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-[#0E1117]/80 border border-white/[0.06] focus:border-[#4F8CFF]/40 focus:ring-1 focus:ring-[#4F8CFF]/20 rounded-xl text-xs text-white placeholder-white/20 focus:outline-none transition-all duration-300 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[9px] font-mono text-white/40 uppercase tracking-widest mb-1.5 font-extrabold">
                    Security Passkey
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <Lock className="w-4 h-4 text-white/25" />
                    </span>
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      className="w-full pl-10 pr-10 py-3 bg-[#0E1117]/80 border border-white/[0.06] focus:border-[#4F8CFF]/40 focus:ring-1 focus:ring-[#4F8CFF]/20 rounded-xl text-xs text-white placeholder-white/20 focus:outline-none transition-all duration-300 font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-white/25 hover:text-white/60 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {isSignup && (
                  <div>
                    <label className="block text-[9px] font-mono text-white/40 uppercase tracking-widest mb-1.5 font-extrabold">
                      Confirm Passkey
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                        <Lock className="w-4 h-4 text-white/25" />
                      </span>
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={e => setConfirmPassword(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-[#0E1117]/80 border border-white/[0.06] focus:border-[#4F8CFF]/40 focus:ring-1 focus:ring-[#4F8CFF]/20 rounded-xl text-xs text-white placeholder-white/20 focus:outline-none transition-all duration-300 font-mono"
                      />
                    </div>
                  </div>
                )}

                {error && (
                  <div className="text-[#EF4444] text-[10px] bg-[#EF4444]/10 border border-[#EF4444]/20 rounded-xl p-3 font-mono leading-relaxed">
                    {error}
                  </div>
                )}

                {success && (
                  <div className="text-[#32D583] text-[10px] bg-[#32D583]/10 border border-[#32D583]/20 rounded-xl p-3 font-mono leading-relaxed">
                    {success}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-gradient-to-r from-[#4F8CFF] to-[#7C5CFF] hover:opacity-95 text-white font-bold rounded-xl text-xs uppercase tracking-[0.25em] cursor-pointer flex items-center justify-center gap-2 transition-all duration-300 border-t border-white/10 active:scale-95 shadow-lg shadow-[#4F8CFF]/20"
                >
                  {loading ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      {isSignup ? 'Register Authorization' : 'System Connect'}
                    </>
                  )}
                </button>
              </form>

              {/* Toggle view */}
              <div className="mt-5 text-center">
                <button
                  onClick={() => {
                    setIsSignup(!isSignup);
                    setError('');
                    setSuccess('');
                  }}
                  className="text-[10px] font-mono text-[#4F8CFF] hover:text-[#7C5CFF] underline transition-colors cursor-pointer"
                >
                  {isSignup ? 'Already have credentials? Sign In' : "Don't have an analyst account? Sign Up"}
                </button>
              </div>

              <div className="mt-8 pt-6 border-t border-white/[0.06] text-center">
                <p className="text-[8px] font-mono text-white/20 tracking-widest font-bold uppercase">
                  SECURE PORTAL • CHANDIGARH & MOHALI REGION
                </p>
              </div>
            </div>

          </div>

        </div>
      )}

    </div>
  );
}
