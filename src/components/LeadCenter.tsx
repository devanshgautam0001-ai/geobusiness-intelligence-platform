import { useState, useMemo } from 'react';
import {
  Sparkles, Download, Search, Filter, Compass, AlertTriangle, ShieldCheck, CheckCircle,
  TrendingUp, DollarSign, Star, FileSpreadsheet, FileText, ChevronRight, Phone, Mail,
  Laptop, RefreshCw, Send, CheckCircle2, Award, Zap, HelpCircle
} from 'lucide-react';
import { Cafe } from '../types';

interface LeadCenterProps {
  cafes: Cafe[];
  onSelectCafe: (id: string) => void;
  onAddNotification?: (type: 'success' | 'opportunity' | 'warning' | 'info', title: string, message: string) => void;
}

export interface LeadItem {
  id: string;
  name: string;
  category: string;
  area: string;
  city: string;
  rating: number;
  reviews: number;
  website: string;
  digitalScore: number;
  leadScore: number; // calculated score
  priority: 'Alpha (Critical)' | 'Beta (High)' | 'Gamma (Medium)';
  dealValue: number; // estimated contract value in INR
  commission: number; // estimated consultant commission in INR
  vulnerabilities: string[];
}

export default function LeadCenter({ cafes, onSelectCafe, onAddNotification }: LeadCenterProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [areaFilter, setAreaFilter] = useState('');
  const [vulnerabilityFilter, setVulnerabilityFilter] = useState('all');
  const [sortBy, setSortBy] = useState<'leadScore' | 'dealValue' | 'rating'>('leadScore');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedLeads, setSelectedLeads] = useState<string[]>([]);
  
  // Simulations state
  const [contactingLeadId, setContactingLeadId] = useState<string | null>(null);
  const [exporting, setExporting] = useState<string | null>(null);

  // Derive rich lead intelligence objects
  const leadsDataset = useMemo<LeadItem[]>(() => {
    return cafes.map(cafe => {
      const isNoWebsite = cafe.website !== 'Y';
      const isWeakSEO = cafe.digitalPresenceScore < 60;
      const isPoorProfile = cafe.reviews < 200 || cafe.rating < 4.2;
      const isWeakSocial = cafe.digitalPresenceScore < 50;
      const isHighRating = cafe.rating >= 4.3;
      const isHighReviews = cafe.reviews >= 250;

      const vulnerabilities: string[] = [];
      if (isNoWebsite) vulnerabilities.push('Missing Website Domain');
      if (isWeakSEO) vulnerabilities.push('Under-Optimized Local SEO');
      if (isPoorProfile) vulnerabilities.push('Unconfigured GMB Profile');
      if (isWeakSocial) vulnerabilities.push('Deficient Social Footprint');

      // Lead Score Formula: Gaps make it a higher potential lead, high reputation (rating/reviews) makes it high conversion
      // Base opportunity score + reputation bonus - digital score penalty
      let baseScore = cafe.growthOpportunityScore;
      if (isNoWebsite) baseScore += 15;
      if (isHighRating) baseScore += 10;
      if (isHighReviews) baseScore += 5;
      const leadScore = Math.min(100, Math.max(30, baseScore));

      // Prioritization threshold
      let priority: LeadItem['priority'] = 'Gamma (Medium)';
      if (leadScore >= 78) priority = 'Alpha (Critical)';
      else if (leadScore >= 60) priority = 'Beta (High)';

      // Estimated Contract Value based on digital flaws (Website development: 55k, SEO: 25k, GMB setup: 15k)
      let dealValue = 25000;
      if (isNoWebsite) dealValue += 55000;
      if (isWeakSEO) dealValue += 25000;
      if (isPoorProfile) dealValue += 15000;
      if (isWeakSocial) dealValue += 20000;

      // Commission is 25% of enterprise deal value
      const commission = Math.round(dealValue * 0.25);

      return {
        id: cafe.id,
        name: cafe.name,
        category: cafe.category,
        area: cafe.area,
        city: cafe.city,
        rating: cafe.rating,
        reviews: cafe.reviews,
        website: cafe.website,
        digitalScore: cafe.digitalPresenceScore,
        leadScore,
        priority,
        dealValue,
        commission,
        vulnerabilities
      };
    });
  }, [cafes]);

  // Unique areas list for selection
  const uniqueAreas = useMemo(() => {
    return Array.from(new Set(cafes.map(c => c.area))).sort();
  }, [cafes]);

  // Filtered and Sorted Leads
  const processedLeads = useMemo(() => {
    return leadsDataset
      .filter(lead => {
        const matchesSearch = lead.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                              lead.category.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesArea = areaFilter === '' || lead.area === areaFilter;
        
        let matchesVulnerability = true;
        if (vulnerabilityFilter === 'no_website') matchesVulnerability = lead.website !== 'Y';
        else if (vulnerabilityFilter === 'weak_seo') matchesVulnerability = lead.digitalScore < 60;
        else if (vulnerabilityFilter === 'poor_profile') matchesVulnerability = lead.reviews < 150 || lead.rating < 4.2;
        else if (vulnerabilityFilter === 'weak_social') matchesVulnerability = lead.digitalScore < 50;

        return matchesSearch && matchesArea && matchesVulnerability;
      })
      .sort((a, b) => {
        let valA = a[sortBy];
        let valB = b[sortBy];
        if (typeof valA === 'string') return 0; // fallback

        return sortOrder === 'desc' 
          ? (valB as number) - (valA as number) 
          : (valA as number) - (valB as number);
      });
  }, [leadsDataset, searchTerm, areaFilter, vulnerabilityFilter, sortBy, sortOrder]);

  // Calculate Aggregated Metrics
  const summaryMetrics = useMemo(() => {
    const activeCount = processedLeads.length;
    const totalPotentialValue = processedLeads.reduce((sum, item) => sum + item.dealValue, 0);
    const totalPotentialComm = processedLeads.reduce((sum, item) => sum + item.commission, 0);
    const alphaCount = processedLeads.filter(l => l.priority === 'Alpha (Critical)').length;

    return {
      activeCount,
      totalPotentialValue,
      totalPotentialComm,
      alphaCount
    };
  }, [processedLeads]);

  // Handle Export Suite
  const handleExportLeads = (format: 'CSV' | 'Excel' | 'PDF') => {
    setExporting(format);
    setTimeout(() => {
      setExporting(null);
      if (onAddNotification) {
        onAddNotification(
          'success',
          `Lead Export Succeeded`,
          `Successfully exported ${processedLeads.length} enterprise lead profiles in premium ${format} format.`
        );
      }
      
      // Simulate file download
      const headers = ['Business Name', 'Category', 'Area', 'Rating', 'Presence Score', 'Lead Score', 'Priority', 'Est Deal Value (INR)', 'Commission (INR)'];
      const rows = processedLeads.map(l => [
        l.name,
        l.category,
        l.area,
        l.rating,
        l.digitalScore,
        l.leadScore,
        l.priority,
        l.dealValue,
        l.commission
      ]);
      const csvContent = "data:text/csv;charset=utf-8," 
        + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `GeoVision_Leads_${format.toLowerCase()}_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }, 1200);
  };

  // Toggle Lead Selection
  const toggleSelect = (id: string) => {
    setSelectedLeads(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedLeads.length === processedLeads.length) {
      setSelectedLeads([]);
    } else {
      setSelectedLeads(processedLeads.map(l => l.id));
    }
  };

  // Simulated Outreach Proposal Dispatch
  const triggerOutreach = (lead: LeadItem) => {
    setContactingLeadId(lead.id);
    setTimeout(() => {
      setContactingLeadId(null);
      if (onAddNotification) {
        onAddNotification(
          'opportunity',
          `Enterprise Pitch Sent`,
          `AI personalized digital overhaul audit dispatched to ${lead.name} management inbox successfully.`
        );
      }
    }, 1500);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* 1. BRAND HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-5 border-b border-white/[0.06]">
        <div>
          <h2 className="text-2xl font-serif italic text-white flex items-center gap-2.5">
            <Zap className="w-5.5 h-5.5 text-[#7C5CFF] animate-pulse" />
            Strategic Lead Generation Command
          </h2>
          <p className="text-[10px] font-mono text-white/40 uppercase tracking-widest mt-1">
            Algorithmic diagnostic profiling & business acquisition indexer
          </p>
        </div>

        {/* Action Export Row */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => handleExportLeads('CSV')}
            disabled={exporting !== null}
            className="px-4 py-2.5 bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.06] text-white text-[10px] font-mono font-bold uppercase tracking-widest rounded-xl transition-all cursor-pointer flex items-center gap-2"
          >
            <FileSpreadsheet className="w-4 h-4 text-[#32D583]" />
            {exporting === 'CSV' ? 'Writing...' : 'Export CSV'}
          </button>
          
          <button
            onClick={() => handleExportLeads('Excel')}
            disabled={exporting !== null}
            className="px-4 py-2.5 bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.06] text-white text-[10px] font-mono font-bold uppercase tracking-widest rounded-xl transition-all cursor-pointer flex items-center gap-2"
          >
            <Download className="w-4 h-4 text-[#4F8CFF]" />
            {exporting === 'Excel' ? 'Compiling...' : 'Excel Suite'}
          </button>

          <button
            onClick={() => handleExportLeads('PDF')}
            disabled={exporting !== null}
            className="px-4 py-2.5 bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.06] text-white text-[10px] font-mono font-bold uppercase tracking-widest rounded-xl transition-all cursor-pointer flex items-center gap-2"
          >
            <FileText className="w-4 h-4 text-[#EF4444]" />
            {exporting === 'PDF' ? 'Formatting...' : 'Download PDF'}
          </button>
        </div>
      </div>

      {/* 2. STATS OVERVIEW */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="glass-panel border border-white/[0.06] rounded-2xl p-5 relative overflow-hidden shadow-xl">
          <div className="absolute top-0 right-0 p-3 text-white/5 font-serif text-6xl pointer-events-none select-none font-bold">LEADS</div>
          <span className="text-[9px] font-mono font-extrabold uppercase tracking-widest text-white/40 block">Total Target Funnel</span>
          <span className="text-3xl font-space font-extrabold text-white block mt-1.5">{summaryMetrics.activeCount}</span>
          <span className="text-[9px] font-mono text-white/30 block mt-1.5 uppercase font-bold flex items-center gap-1">
            <CheckCircle className="w-3.5 h-3.5 text-[#32D583]" /> Filtered cohort size
          </span>
        </div>

        <div className="glass-panel border border-white/[0.06] rounded-2xl p-5 relative overflow-hidden shadow-xl">
          <div className="absolute top-0 right-0 p-3 text-white/5 font-serif text-6xl pointer-events-none select-none font-bold">ALPHA</div>
          <span className="text-[9px] font-mono font-extrabold uppercase tracking-widest text-white/40 block">Alpha High-Yield Signals</span>
          <span className="text-3xl font-space font-extrabold text-[#EF4444] block mt-1.5">{summaryMetrics.alphaCount}</span>
          <span className="text-[9px] font-mono text-[#EF4444] block mt-1.5 uppercase font-bold tracking-widest animate-pulse">Critical Gaps Discovered</span>
        </div>

        <div className="glass-panel border border-white/[0.06] rounded-2xl p-5 bg-gradient-to-br from-[#4F8CFF]/5 to-transparent relative overflow-hidden shadow-xl">
          <div className="absolute top-0 right-0 p-3 text-white/5 font-serif text-6xl pointer-events-none select-none font-bold">DEAL</div>
          <span className="text-[9px] font-mono font-extrabold uppercase tracking-widest text-white/40 block">Estimated Pipeline Value</span>
          <span className="text-3xl font-space font-extrabold text-[#4F8CFF] block mt-1.5">₹{summaryMetrics.totalPotentialValue.toLocaleString()}</span>
          <span className="text-[9px] font-mono text-white/30 block mt-1.5 uppercase font-bold">Calculated Overhaul Estimates</span>
        </div>

        <div className="glass-panel border border-white/[0.06] rounded-2xl p-5 bg-gradient-to-br from-[#32D583]/5 to-transparent relative overflow-hidden shadow-xl">
          <div className="absolute top-0 right-0 p-3 text-white/5 font-serif text-6xl pointer-events-none select-none font-bold">COMM</div>
          <span className="text-[9px] font-mono font-extrabold uppercase tracking-widest text-white/40 block">Target Agent Commissions</span>
          <span className="text-3xl font-space font-extrabold text-[#32D583] block mt-1.5">₹{summaryMetrics.totalPotentialComm.toLocaleString()}</span>
          <span className="text-[9px] font-mono text-[#32D583] block mt-1.5 uppercase font-bold tracking-wider font-extrabold">25% Agency Split Rate</span>
        </div>
      </div>

      {/* 3. MULTI-FILTER BAR */}
      <div className="glass-panel border border-white/[0.06] p-5 rounded-2xl grid grid-cols-1 md:grid-cols-12 gap-4 items-center shadow-lg">
        {/* Search Input */}
        <div className="md:col-span-4 relative">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <Search className="w-4 h-4 text-white/30" />
          </span>
          <input
            type="text"
            placeholder="Search leads name or type..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-[#0E1117]/70 border border-white/[0.06] rounded-xl text-xs text-white placeholder-white/20 focus:border-[#7C5CFF]/60 focus:outline-none transition-colors font-mono"
          />
        </div>

        {/* Sector Area Filter */}
        <div className="md:col-span-3">
          <select
            value={areaFilter}
            onChange={(e) => setAreaFilter(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-[#0E1117]/70 border border-white/[0.06] rounded-xl text-xs text-white/60 focus:outline-none focus:border-[#7C5CFF]/60 font-mono cursor-pointer"
          >
            <option value="">All Sectors / Area Codes</option>
            {uniqueAreas.map(area => (
              <option key={area} value={area}>{area}</option>
            ))}
          </select>
        </div>

        {/* Critical Vacancy Filters */}
        <div className="md:col-span-3">
          <select
            value={vulnerabilityFilter}
            onChange={(e) => setVulnerabilityFilter(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-[#0E1117]/70 border border-white/[0.06] rounded-xl text-xs text-white/60 focus:outline-none focus:border-[#7C5CFF]/60 font-mono cursor-pointer"
          >
            <option value="all">All Discovered Vacancy Gaps</option>
            <option value="no_website">Lacks Custom Domain Website</option>
            <option value="weak_seo">SEO Deficiencies (Presence &lt; 60)</option>
            <option value="poor_profile">Unconfigured Google Business profiles</option>
            <option value="weak_social">Deficient Social Media integrations</option>
          </select>
        </div>

        {/* Sort Vector Controls */}
        <div className="md:col-span-2 flex items-center gap-2">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="w-full px-3 py-2.5 bg-[#0E1117]/70 border border-white/[0.06] rounded-xl text-xs text-white/50 focus:outline-none font-mono font-bold cursor-pointer"
          >
            <option value="leadScore">Lead Score</option>
            <option value="dealValue">Deal Value</option>
            <option value="rating">Rating</option>
          </select>
          <button
            onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
            className="p-2.5 bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.05] rounded-xl text-white transition-colors cursor-pointer"
          >
            {sortOrder === 'desc' ? '▼' : '▲'}
          </button>
        </div>
      </div>

      {/* 4. LEADS SPREADSHEET CARD */}
      <div className="glass-panel border border-white/[0.06] rounded-2xl shadow-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-white/[0.06] bg-white/[0.02] text-white/35 font-mono text-[9px] uppercase tracking-widest font-extrabold">
                <th className="py-4.5 px-6 flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={selectedLeads.length === processedLeads.length && processedLeads.length > 0}
                    onChange={handleSelectAll}
                    className="rounded border-white/10 text-[#7C5CFF]"
                  />
                  <span>Target Entity</span>
                </th>
                <th className="py-4.5 px-4 font-mono">Vacancy Gaps</th>
                <th className="py-4.5 px-4 font-mono text-center">Digital Score</th>
                <th className="py-4.5 px-4 font-mono text-center">Lead Score</th>
                <th className="py-4.5 px-4 font-mono text-center">Priority</th>
                <th className="py-4.5 px-4 font-mono text-right">Est Contract Value</th>
                <th className="py-4.5 px-4 font-mono text-right">Commission (25%)</th>
                <th className="py-4.5 px-6 text-center">Quick Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {processedLeads.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-white/35 font-mono text-[10px] uppercase tracking-widest">
                    No active leads match the specified criteria vectors.
                  </td>
                </tr>
              ) : (
                processedLeads.map((lead) => (
                  <tr
                    key={lead.id}
                    className="hover:bg-white/[0.01] transition-all cursor-pointer group"
                    onClick={() => onSelectCafe(lead.id)}
                  >
                    <td className="py-4 px-6 flex items-start gap-3 min-w-[240px]">
                      <div className="pt-1.5" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={selectedLeads.includes(lead.id)}
                          onChange={() => toggleSelect(lead.id)}
                          className="rounded border-white/10 text-[#7C5CFF]"
                        />
                      </div>
                      <div>
                        <span className="font-bold text-white group-hover:text-[#7C5CFF] transition-colors text-[13px] block">
                          {lead.name}
                        </span>
                        <span className="text-[9px] font-mono text-white/30 block mt-1 uppercase tracking-wider">
                          {lead.category} • {lead.area}
                        </span>
                      </div>
                    </td>
                    
                    <td className="py-4 px-4 max-w-[280px]">
                      <div className="flex flex-wrap gap-1.5">
                        {lead.vulnerabilities.map((v, i) => (
                          <span
                            key={i}
                            className={`text-[8px] font-mono uppercase font-bold tracking-wider px-2 py-0.5 rounded ${
                              v.includes('Missing') 
                                ? 'bg-[#EF4444]/10 border border-[#EF4444]/20 text-[#EF4444]'
                                : v.includes('SEO')
                                ? 'bg-[#F59E0B]/10 border border-[#F59E0B]/20 text-[#F59E0B]'
                                : 'bg-[#4F8CFF]/10 border border-[#4F8CFF]/20 text-[#4F8CFF]'
                            }`}
                          >
                            {v}
                          </span>
                        ))}
                      </div>
                    </td>

                    <td className="py-4 px-4 text-center">
                      <span className="font-mono font-bold text-white/70">{lead.digitalScore}%</span>
                    </td>

                    <td className="py-4 px-4 text-center">
                      <div className="inline-flex items-center gap-1.5">
                        <span className="font-mono font-bold text-white bg-[#7C5CFF]/15 border border-[#7C5CFF]/25 px-2.5 py-0.5 rounded-lg">
                          {lead.leadScore}
                        </span>
                      </div>
                    </td>

                    <td className="py-4 px-4 text-center">
                      <span className={`text-[9px] font-mono font-extrabold tracking-widest uppercase px-2 py-0.5 rounded-full ${
                        lead.priority.startsWith('Alpha')
                          ? 'text-[#EF4444] bg-[#EF4444]/10 border border-[#EF4444]/20'
                          : lead.priority.startsWith('Beta')
                          ? 'text-[#F59E0B] bg-[#F59E0B]/10 border border-[#F59E0B]/20'
                          : 'text-[#32D583] bg-[#32D583]/10 border border-[#32D583]/20'
                      }`}>
                        {lead.priority.split(' ')[0]}
                      </span>
                    </td>

                    <td className="py-4 px-4 text-right font-mono font-bold text-white">
                      ₹{lead.dealValue.toLocaleString()}
                    </td>

                    <td className="py-4 px-4 text-right font-mono font-bold text-[#32D583]">
                      ₹{lead.commission.toLocaleString()}
                    </td>

                    <td className="py-4 px-6 text-center" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => triggerOutreach(lead)}
                        disabled={contactingLeadId === lead.id}
                        className="p-2 bg-gradient-to-r from-[#4F8CFF]/15 to-[#7C5CFF]/15 border border-[#4F8CFF]/20 text-white hover:text-white hover:border-[#4F8CFF]/50 rounded-xl transition-all font-mono text-[9px] tracking-widest uppercase font-bold flex items-center gap-1.5 mx-auto cursor-pointer"
                      >
                        {contactingLeadId === lead.id ? (
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <>
                            <Send className="w-3 h-3 text-[#4F8CFF]" />
                            Outreach
                          </>
                        )}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
