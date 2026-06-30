import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Award,
  Globe,
  AlertTriangle,
  Coffee,
  MapPin,
  RefreshCw,
  BarChart2,
  Sparkles,
  Layers,
  Star,
  MessageSquare,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Zap,
  CheckCircle,
  Bell,
  Gauge
} from 'lucide-react';
import { DashboardKPIs } from '../types';
import { api } from '../utils/api';

// ECharts decoupled custom sub-components
import CategoryEChart from './CategoryEChart';
import WebsitePieEChart from './WebsitePieEChart';
import ReviewsAreaEChart from './ReviewsAreaEChart';
import AreaClusterBarEChart from './AreaClusterBarEChart';

interface DashboardProps {
  onSelectCafe: (id: string) => void;
  filters: any;
}

export default function Dashboard({ onSelectCafe, filters }: DashboardProps) {
  const [data, setData] = useState<(DashboardKPIs & { categoryDistribution: any[] }) | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeAlertIndex, setActiveAlertIndex] = useState(0);

  const fetchAnalytics = async () => {
    setLoading(true);
    setError('');
    try {
      const stats = await api.getAnalytics();
      setData(stats);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch analytics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [filters]);

  // Rolling alert simulator
  useEffect(() => {
    if (!data) return;
    const interval = setInterval(() => {
      setActiveAlertIndex(prev => (prev + 1) % aiAlerts.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [data]);

  const aiAlerts = [
    {
      type: "opportunity",
      text: "Mohali Sector 62 regional digital vacancy represents a high-priority $120K annual market pool.",
      badge: "High Value"
    },
    {
      type: "alert",
      text: "Critical SEO vacuum: 8 highly-rated cafes are missing functional custom web domains.",
      badge: "Lead Opportunity"
    },
    {
      type: "insight",
      text: "Average satisfaction index has climbed to 4.38 across Chandigarh premium sectors.",
      badge: "Market Trend"
    }
  ];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4 font-mono">
        <div className="relative flex items-center justify-center">
          <div className="w-12 h-12 rounded-full border-t-2 border-[#4F8CFF] border-r-2 border-transparent animate-spin" />
          <Coffee className="w-5 h-5 text-[#7C5CFF] absolute animate-pulse" />
        </div>
        <p className="text-xs font-mono text-white/50 tracking-[0.2em] uppercase font-bold animate-pulse">Running Neural Analytics Suite...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-[#EF4444]/10 border border-[#EF4444]/20 rounded-2xl p-8 text-center max-w-lg mx-auto my-12 glass-panel">
        <AlertTriangle className="w-12 h-12 text-[#EF4444] mx-auto mb-3 animate-bounce" />
        <h3 className="font-serif italic text-xl text-white">Pipeline Sync Interrupted</h3>
        <p className="text-white/50 text-xs mt-2 font-mono">{error || 'Unable to compute dataset metrics'}</p>
        <button
          onClick={fetchAnalytics}
          className="mt-5 px-5 py-2.5 bg-gradient-to-r from-[#4F8CFF] to-[#7C5CFF] text-white hover:opacity-90 text-xs uppercase tracking-wider font-bold rounded-xl transition-all cursor-pointer font-mono border-t border-white/10 active:scale-95 shadow-lg shadow-[#4F8CFF]/20"
        >
          Re-establish Pipeline Connection
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn relative">
      
      {/* EXECUTIVE COMMAND OVERVIEW & HEALTH INDEX */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Today's Briefing Panel */}
        <div className="glass-panel rounded-2xl p-6 border border-white/[0.06] shadow-2xl lg:col-span-8 flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute inset-0 opacity-[0.01] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '16px 16px' }} />
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="p-1.5 bg-[#4F8CFF]/10 rounded-lg text-[#4F8CFF]">
                  <Activity className="w-4 h-4" />
                </span>
                <span className="text-[10px] text-white/40 uppercase tracking-[0.2em] font-extrabold font-mono">Today's Executive Summary</span>
              </div>
              <span className="text-[9px] font-mono text-white/30 bg-white/[0.03] border border-white/[0.05] px-2 py-0.5 rounded-full uppercase tracking-wider">
                Telemetry Active
              </span>
            </div>

            <div className="space-y-2">
              <h2 className="text-3xl font-serif italic text-white tracking-tight">
                Enterprise Command Suite
              </h2>
              <p className="text-white/60 text-xs leading-relaxed max-w-2xl font-sans">
                GeoVision neural metrics indicate high transaction potential in regional coffee hubs. Digital vacancy remains standard at <span className="text-[#EF4444] font-mono font-bold">{data.noWebsitePercentage}%</span>. We recommend launching automated Instagram & SEO targeting pipelines for qualified leads in Sector 35.
              </p>
            </div>
          </div>

          {/* AI Alert Ticker */}
          <div className="mt-6 pt-5 border-t border-white/[0.05] flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#10141D]/30 -mx-6 -mb-6 p-6">
            <div className="flex items-center gap-3.5">
              <div className="relative">
                <Bell className="w-4 h-4 text-[#7C5CFF]" />
                <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-[#7C5CFF] rounded-full animate-ping" />
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-[8px] font-mono font-extrabold uppercase bg-[#7C5CFF]/10 border border-[#7C5CFF]/20 text-[#7C5CFF] px-1.5 py-0.2 rounded">
                    {aiAlerts[activeAlertIndex].badge}
                  </span>
                  <span className="text-[9px] font-mono text-white/30 uppercase tracking-widest font-extrabold">Active AI Insight</span>
                </div>
                <p className="text-[11px] font-mono text-white/70 tracking-wide animate-fadeIn">
                  {aiAlerts[activeAlertIndex].text}
                </p>
              </div>
            </div>
            
            <button className="flex items-center gap-1 text-[9px] font-mono font-bold text-[#4F8CFF] hover:text-[#7C5CFF] uppercase tracking-widest transition-colors self-end sm:self-center">
              Scan All Updates
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Business Health Index Widget */}
        <div className="glass-panel rounded-2xl p-6 border border-white/[0.06] shadow-2xl lg:col-span-4 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute inset-0 opacity-[0.01] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '16px 16px' }} />
          
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-white/40 uppercase tracking-[0.2em] font-extrabold font-mono">Business Health Index</span>
            <span className="p-1.5 bg-[#32D583]/10 rounded-lg text-[#32D583]">
              <Gauge className="w-4 h-4" />
            </span>
          </div>

          {/* Graphical Radial Arc representation */}
          <div className="my-5 flex flex-col items-center justify-center relative">
            <svg className="w-32 h-32" viewBox="0 0 100 100">
              {/* Underlay track */}
              <circle cx="50" cy="50" r="40" fill="transparent" stroke="rgba(255, 255, 255, 0.04)" strokeWidth="6" strokeDasharray="251.2" strokeDashoffset="0" strokeLinecap="round" />
              {/* Rating arc */}
              <circle cx="50" cy="50" r="40" fill="transparent" stroke="url(#healthGrad)" strokeWidth="6" strokeDasharray="251.2" strokeDashoffset={251.2 - (251.2 * (data.websitePercentage / 100))} strokeLinecap="round" className="rotate-[-90deg] origin-center transition-all duration-1000" />
              
              <defs>
                <linearGradient id="healthGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#4F8CFF" />
                  <stop offset="100%" stopColor="#32D583" />
                </linearGradient>
              </defs>
            </svg>
            
            {/* Value overlay */}
            <div className="absolute flex flex-col items-center justify-center pointer-events-none">
              <span className="text-3xl font-space font-extrabold text-white leading-none">
                {data.websitePercentage}
              </span>
              <span className="text-[8px] font-mono text-white/40 uppercase tracking-widest font-bold mt-1">
                AGGREGATE
              </span>
            </div>
          </div>

          <div className="space-y-1.5 border-t border-white/[0.05] pt-4 text-[9px] font-mono uppercase tracking-widest text-white/40">
            <div className="flex justify-between items-center">
              <span>Chandigarh Core Status</span>
              <span className="text-[#32D583] font-bold">EXCELLENT</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Mohali Sub-nodes</span>
              <span className="text-[#F59E0B] font-bold">MODERATE</span>
            </div>
          </div>
        </div>

      </div>
      
      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* KPI 1: Total Cafes */}
        <div 
          id="kpi-total-cafes" 
          className="glass-panel rounded-2xl p-6 flex flex-col justify-between shadow-2xl relative overflow-hidden group glow-on-hover transition-all duration-300 border border-white/[0.06]"
        >
          <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '16px 16px' }} />
          
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-white/40 uppercase tracking-[0.2em] font-bold font-mono">Cohorts Evaluated</span>
            <div className="p-2.5 bg-[#4F8CFF]/10 rounded-xl border border-[#4F8CFF]/20 text-[#4F8CFF] group-hover:scale-110 transition-transform duration-300">
              <Coffee className="w-4 h-4" />
            </div>
          </div>
          
          <div className="mt-4">
            <h3 className="text-4xl font-space font-medium text-white tracking-tight leading-none">
              {data.totalCafes}
            </h3>
            <p className="text-[10px] font-mono text-[#32D583] mt-2.5 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              100% Regional coverage
            </p>
          </div>

          {/* Sparkline Visualizer */}
          <div className="mt-4 pt-4 border-t border-white/[0.05] flex items-center justify-between">
            <span className="text-[9px] text-white/30 font-mono uppercase font-semibold">Real-time Node Map</span>
            <svg className="w-16 h-6 text-[#32D583]" viewBox="0 0 60 20">
              <path d="M0,15 Q15,5 30,12 T60,3" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
        </div>

        {/* KPI 2: Average Rating */}
        <div 
          id="kpi-avg-rating" 
          className="glass-panel rounded-2xl p-6 flex flex-col justify-between shadow-2xl relative overflow-hidden group glow-on-hover transition-all duration-300 border border-white/[0.06]"
        >
          <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '16px 16px' }} />
          
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-white/40 uppercase tracking-[0.2em] font-bold font-mono">Satisfaction Index</span>
            <div className="p-2.5 bg-[#7C5CFF]/10 rounded-xl border border-[#7C5CFF]/20 text-[#7C5CFF] group-hover:scale-110 transition-transform duration-300">
              <Star className="w-4 h-4" />
            </div>
          </div>
          
          <div className="mt-4">
            <h3 className="text-4xl font-space font-medium text-white tracking-tight leading-none">
              {data.averageRating} <span className="text-xs font-mono font-normal text-white/30">/ 5.0</span>
            </h3>
            <p className="text-[10px] font-mono text-white/40 mt-2.5">
              SaaS industry standard: 4.10
            </p>
          </div>

          {/* Sparkline Visualizer */}
          <div className="mt-4 pt-4 border-t border-white/[0.05] flex items-center justify-between">
            <span className="text-[9px] text-white/30 font-mono uppercase font-semibold">Velocity curve</span>
            <svg className="w-16 h-6 text-[#4F8CFF]" viewBox="0 0 60 20">
              <path d="M0,18 Q15,10 30,8 T60,2" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
        </div>

        {/* KPI 3: Average Reviews */}
        <div 
          id="kpi-avg-reviews" 
          className="glass-panel rounded-2xl p-6 flex flex-col justify-between shadow-2xl relative overflow-hidden group glow-on-hover transition-all duration-300 border border-white/[0.06]"
        >
          <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '16px 16px' }} />
          
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-white/40 uppercase tracking-[0.2em] font-bold font-mono">Feedback Density</span>
            <div className="p-2.5 bg-[#4F8CFF]/10 rounded-xl border border-[#4F8CFF]/20 text-[#4F8CFF] group-hover:scale-110 transition-transform duration-300">
              <MessageSquare className="w-4 h-4" />
            </div>
          </div>
          
          <div className="mt-4">
            <h3 className="text-4xl font-space font-medium text-white tracking-tight leading-none">
              {data.averageReviews.toLocaleString()}
            </h3>
            <p className="text-[10px] font-mono text-white/40 mt-2.5">
              Extremely high engagement volume
            </p>
          </div>

          {/* Sparkline Visualizer */}
          <div className="mt-4 pt-4 border-t border-white/[0.05] flex items-center justify-between">
            <span className="text-[9px] text-white/30 font-mono uppercase font-semibold">Volume trajectory</span>
            <svg className="w-16 h-6 text-[#7C5CFF]" viewBox="0 0 60 20">
              <path d="M0,15 Q15,18 30,8 T60,1" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
        </div>

        {/* KPI 4: Digital Presence / Website Ratio */}
        <div 
          id="kpi-website-ratio" 
          className="glass-panel rounded-2xl p-6 flex flex-col justify-between shadow-2xl relative overflow-hidden group glow-on-hover transition-all duration-300 border border-white/[0.06]"
        >
          <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '16px 16px' }} />
          
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-white/40 uppercase tracking-[0.2em] font-bold font-mono">Pipeline Health</span>
            <div className="p-2.5 bg-[#F59E0B]/10 rounded-xl border border-[#F59E0B]/20 text-[#F59E0B] group-hover:scale-110 transition-transform duration-300">
              <Globe className="w-4 h-4" />
            </div>
          </div>
          
          <div className="mt-4">
            <h3 className="text-4xl font-space font-medium text-white tracking-tight leading-none">
              {data.websitePercentage}%
            </h3>
            <p className="text-[10px] font-mono text-[#EF4444]/90 mt-2.5">
              {data.noWebsitePercentage}% missing domain presence
            </p>
          </div>

          {/* Sparkline Visualizer */}
          <div className="mt-4 pt-4 border-t border-white/[0.05] flex items-center justify-between">
            <span className="text-[9px] text-white/30 font-mono uppercase font-semibold">Market vacancy</span>
            <svg className="w-16 h-6 text-[#F59E0B]" viewBox="0 0 60 20">
              <path d="M0,10 Q15,5 30,15 T60,5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
        </div>

      </div>

      {/* Main Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Chart 1: Category Analysis (Apache ECharts Upgrade) */}
        <div className="glass-panel rounded-2xl p-6 shadow-2xl lg:col-span-8 relative border border-white/[0.06]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
            <div>
              <h3 className="font-serif italic text-xl text-white">Category Density & digital strength</h3>
              <p className="text-[10px] font-mono text-white/40 uppercase tracking-widest mt-1">Cohort breakdowns against active web presences</p>
            </div>
            <div className="flex items-center gap-1.5 bg-white/[0.02] border border-white/[0.05] rounded-full py-1 px-3 text-[10px] font-mono text-white/50">
              <Layers className="w-3.5 h-3.5 text-[#4F8CFF]" />
              <span>Multi-Axis aggregation</span>
            </div>
          </div>
          <div className="h-80 w-full">
            <CategoryEChart data={data.categoryDistribution} />
          </div>
        </div>

        {/* Chart 2: Website Breakdown (Apache ECharts Upgrade) */}
        <div className="glass-panel rounded-2xl p-6 shadow-2xl lg:col-span-4 relative border border-white/[0.06] flex flex-col justify-between">
          <div>
            <h3 className="font-serif italic text-xl text-white">Domain penetration</h3>
            <p className="text-[10px] font-mono text-white/40 uppercase tracking-widest mt-1">Direct web footprint vacuum analysis</p>
          </div>
          
          <div className="h-56 flex items-center justify-center relative my-4">
            <WebsitePieEChart 
              websitePercentage={data.websitePercentage} 
              noWebsitePercentage={data.noWebsitePercentage} 
            />
            
            {/* Centered glass value over doughnut hole */}
            <div className="absolute flex flex-col items-center justify-center pointer-events-none">
              <span className="text-[9px] font-mono text-white/35 uppercase tracking-widest font-bold">DIGITAL</span>
              <span className="text-2xl font-space font-bold text-[#4F8CFF] mt-1 leading-none">{data.websitePercentage}%</span>
            </div>
          </div>

          <div className="space-y-2 text-[10px] font-mono uppercase tracking-widest border-t border-white/[0.05] pt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#4F8CFF]" />
                <span className="text-white/60">Digital Strongholds</span>
              </div>
              <span className="text-white font-bold">{data.websitePercentage}%</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#EF4444]" />
                <span className="text-white/40">Vacancy Pool</span>
              </div>
              <span className="text-white/50 font-bold">{data.noWebsitePercentage}%</span>
            </div>
          </div>
        </div>

      </div>

      {/* Secondary Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Chart 3: Review count distribution density (Apache ECharts Upgrade) */}
        <div className="glass-panel rounded-2xl p-6 shadow-2xl lg:col-span-5 relative border border-white/[0.06]">
          <div>
            <h3 className="font-serif italic text-xl text-white">Maps feedback distribution</h3>
            <p className="text-[10px] font-mono text-white/40 uppercase tracking-widest mt-1">Review volume densities plotted against scales</p>
          </div>
          <div className="h-72 w-full mt-6">
            <ReviewsAreaEChart data={data.reviewDistribution} />
          </div>
        </div>

        {/* Chart 4: Area-wise BI distributions (Apache ECharts Upgrade) */}
        <div className="glass-panel rounded-2xl p-6 shadow-2xl lg:col-span-7 relative border border-white/[0.06]">
          <div>
            <h3 className="font-serif italic text-xl text-white">Major regional clusters</h3>
            <p className="text-[10px] font-mono text-white/40 uppercase tracking-widest mt-1">Comparison of top hub sectors digital presence metrics</p>
          </div>
          <div className="h-72 w-full mt-6">
            <AreaClusterBarEChart data={data.areaDistribution.slice(0, 6)} />
          </div>
        </div>

      </div>

      {/* Target Focus Group Panels */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Panel 1: Top opportunity targets */}
        <div className="glass-panel rounded-2xl p-6 shadow-2xl relative border border-white/[0.06] flex flex-col justify-between">
          <div className="flex items-center justify-between mb-5 border-b border-white/[0.05] pb-4">
            <div>
              <h4 className="font-serif italic text-lg text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#7C5CFF]" />
                Alpha Growth Targets
              </h4>
              <p className="text-[10px] font-mono text-white/40 uppercase tracking-widest mt-1">High public rating paired with digital gaps</p>
            </div>
            <span className="text-[9px] font-mono font-bold text-[#7C5CFF] bg-[#7C5CFF]/10 border border-[#7C5CFF]/20 px-2.5 py-1 rounded-full uppercase tracking-widest">
              PRIORITY ONBOARD
            </span>
          </div>
          
          <div className="space-y-3">
            {data.topOpportunityCafes.slice(0, 5).map((cafe) => (
              <div
                key={cafe.id}
                onClick={() => onSelectCafe(cafe.id)}
                className="flex items-center justify-between p-4 bg-[#141922]/45 hover:bg-[#141922]/90 border border-white/[0.04] rounded-xl transition-all duration-300 cursor-pointer group active:scale-[0.99] hover:-translate-y-0.5"
              >
                <div>
                  <h5 className="text-xs font-bold text-white group-hover:text-[#4F8CFF] transition-colors">
                    {cafe.name}
                  </h5>
                  <p className="text-[10px] text-white/40 mt-1.5 flex items-center gap-1.5 font-mono">
                    <MapPin className="w-3.5 h-3.5 text-white/20 flex-shrink-0" />
                    <span className="truncate max-w-[180px]">{cafe.area}, {cafe.city}</span>
                  </p>
                </div>
                <div className="text-right flex items-center gap-4">
                  <div>
                    <span className="text-xs font-mono font-bold text-[#7C5CFF] block">
                      {cafe.growthOpportunityScore}/100
                    </span>
                    <span className="text-[8px] font-mono text-white/30 block mt-0.5 uppercase tracking-wider font-semibold">
                      Opp Index
                    </span>
                  </div>
                  <div className="p-1 bg-[#7C5CFF]/10 rounded-lg text-[#7C5CFF] group-hover:bg-[#7C5CFF] group-hover:text-white transition-all duration-300">
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Panel 2: Digital leaders */}
        <div className="glass-panel rounded-2xl p-6 shadow-2xl relative border border-white/[0.06] flex flex-col justify-between">
          <div className="flex items-center justify-between mb-5 border-b border-white/[0.05] pb-4">
            <div>
              <h4 className="font-serif italic text-lg text-white flex items-center gap-2">
                <Award className="w-4 h-4 text-[#32D583]" />
                Market Strongholds
              </h4>
              <p className="text-[10px] font-mono text-white/40 uppercase tracking-widest mt-1">Leading local benchmarks with advanced footprints</p>
            </div>
            <span className="text-[9px] font-mono font-bold text-[#32D583] bg-[#32D583]/10 border border-[#32D583]/20 px-2.5 py-1 rounded-full uppercase tracking-widest">
              STABLE BENCHMARK
            </span>
          </div>

          <div className="space-y-3">
            {data.topRatedCafes.slice(0, 5).map((cafe) => (
              <div
                key={cafe.id}
                onClick={() => onSelectCafe(cafe.id)}
                className="flex items-center justify-between p-4 bg-[#141922]/45 hover:bg-[#141922]/90 border border-white/[0.04] rounded-xl transition-all duration-300 cursor-pointer group active:scale-[0.99] hover:-translate-y-0.5"
              >
                <div>
                  <h5 className="text-xs font-bold text-white group-hover:text-[#32D583] transition-colors">
                    {cafe.name}
                  </h5>
                  <p className="text-[10px] text-white/40 mt-1.5 flex items-center gap-1.5 font-mono">
                    <MapPin className="w-3.5 h-3.5 text-white/20 flex-shrink-0" />
                    <span className="truncate max-w-[180px]">{cafe.area}, {cafe.city}</span>
                  </p>
                </div>
                <div className="text-right flex items-center gap-4">
                  <div>
                    <span className="text-xs font-mono font-bold text-[#32D583] block">
                      {cafe.digitalPresenceScore}/100
                    </span>
                    <span className="text-[8px] font-mono text-white/30 block mt-0.5 uppercase tracking-wider font-semibold">
                      Presence
                    </span>
                  </div>
                  <div className="p-1 bg-[#32D583]/10 rounded-lg text-[#32D583] transition-all duration-300">
                    <Award className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
