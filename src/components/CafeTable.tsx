import { useState, useMemo } from 'react';
import {
  Search, Filter, ArrowUpDown, ChevronLeft, ChevronRight, Globe,
  MapPin, Compass, FileSpreadsheet, Layers, Sparkles, Info,
  Zap, Star, ShieldCheck, Download, Mail, Phone, ExternalLink, HelpCircle,
  RefreshCw
} from 'lucide-react';
import { Cafe } from '../types';

interface CafeTableProps {
  cafes: Cafe[];
  onSelectCafe: (id: string) => void;
  filters: any;
  setFilters: (f: any) => void;
  onExportCsv: () => void;
}

export default function CafeTable({ cafes, onSelectCafe, filters, setFilters, onExportCsv }: CafeTableProps) {
  // Navigation Mode inside the Explorer spreadsheet tab
  const [explorerMode, setExplorerMode] = useState<'registry' | 'leads'>('registry');
  
  // Registry states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Lead Generator Filters state
  const [leadFilterType, setLeadFilterType] = useState<'all' | 'no_website' | 'poor_seo' | 'weak_presence' | 'hidden_gems'>('all');
  const [selectedLeads, setSelectedLeads] = useState<string[]>([]);
  const [downloadingLeadId, setDownloadingLeadId] = useState<string | null>(null);

  // Sorting handlers
  const handleSort = (field: string) => {
    const isSameField = filters.sortBy === field;
    const nextOrder = isSameField && filters.sortOrder === 'desc' ? 'asc' : 'desc';
    setFilters({
      ...filters,
      sortBy: field,
      sortOrder: nextOrder
    });
    setCurrentPage(1);
  };

  // Pagination bounds
  const totalPages = Math.ceil(cafes.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedCafes = cafes.slice(startIndex, startIndex + itemsPerPage);

  const getPriorityBadge = (score: number) => {
    if (score >= 75) {
      return (
        <span className="text-[9px] font-mono font-bold tracking-widest px-2.5 py-1 bg-[#EF4444]/10 border border-[#EF4444]/25 text-[#EF4444] rounded-full uppercase">
          ALPHA TARGET
        </span>
      );
    } else if (score >= 55) {
      return (
        <span className="text-[9px] font-mono font-bold tracking-widest px-2.5 py-1 bg-[#F59E0B]/10 border border-[#F59E0B]/25 text-[#F59E0B] rounded-full uppercase">
          BETA TARGET
        </span>
      );
    }
    return (
      <span className="text-[9px] font-mono font-bold tracking-widest px-2.5 py-1 bg-[#32D583]/10 border border-[#32D583]/25 text-[#32D583] rounded-full uppercase">
        BENCHMARK
      </span>
    );
  };

  // ==========================================
  // LEAD GENERATION PIPELINE ENGINE
  // ==========================================
  const qualifiedLeads = useMemo(() => {
    return cafes.filter(cafe => {
      const isNoWebsite = cafe.website !== 'Y';
      const isWeakPresence = cafe.digitalPresenceScore < 50;
      const isPoorSeo = cafe.website === 'Y' && cafe.digitalPresenceScore < 60;
      const isHiddenGem = cafe.rating >= 4.3 && cafe.reviews < 100; // high ratings but low volume visibility

      if (leadFilterType === 'no_website') return isNoWebsite;
      if (leadFilterType === 'weak_presence') return isWeakPresence;
      if (leadFilterType === 'poor_seo') return isPoorSeo;
      if (leadFilterType === 'hidden_gems') return isHiddenGem;

      // 'all' shows any cafe with at least ONE digital gap (i.e. not fully benchmarked)
      return isNoWebsite || isWeakPresence || isPoorSeo || isHiddenGem;
    });
  }, [cafes, leadFilterType]);

  // Lead calculations
  const leadStats = useMemo(() => {
    const totalCount = qualifiedLeads.length;
    const avgRating = totalCount > 0 
      ? (qualifiedLeads.reduce((sum, item) => sum + item.rating, 0) / totalCount).toFixed(2)
      : '0.00';
    const noWebsiteCount = qualifiedLeads.filter(c => c.website !== 'Y').length;
    const estimatedSalesGaps = Math.round(totalCount * 140000); // INR estimated aggregate lift

    return {
      totalCount,
      avgRating,
      noWebsiteCount,
      estimatedSalesGaps: `₹${estimatedSalesGaps.toLocaleString()}`
    };
  }, [qualifiedLeads]);

  // Handle Export Single Lead Document Simulator
  const handleExportLeadDoc = (lead: Cafe) => {
    setDownloadingLeadId(lead.id);
    setTimeout(() => {
      setDownloadingLeadId(null);
      // Open a beautiful simulated PDF summary
      const blob = new Blob([
        `GEB-VISION ENTERPRISE AI AUDIT LEAD SUMMARY\n` +
        `========================================\n` +
        `Target Name: ${lead.name}\n` +
        `Area Coordinate: ${lead.area}, ${lead.city}\n` +
        `Google Maps Rating: ${lead.rating} / 5.0 (${lead.reviews} reviews)\n` +
        `Digital Presence Score: ${lead.digitalPresenceScore} / 100\n` +
        `Growth Opportunity Score: ${lead.growthOpportunityScore} / 100\n` +
        `----------------------------------------\n` +
        `CRITICAL DOMAIN GAP DETECTED: ${lead.website !== 'Y' ? 'YES (No Website registered)' : 'NO (SEO Optimization needed)'}\n` +
        `RECOMMENDED ONBOARDING STEPS:\n` +
        lead.recommendationsList.map((rec, i) => `${i+1}. ${rec}`).join('\n')
      ], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${lead.name.replace(/\s+/g, '_')}_AI_Lead_Report.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }, 1000);
  };

  const toggleSelectLead = (id: string) => {
    setSelectedLeads(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  return (
    <div className="space-y-6">
      
      {/* Tab Select Header */}
      <div className="flex border-b border-white/[0.05] p-1 bg-white/[0.02] rounded-2xl max-w-sm">
        <button
          onClick={() => setExplorerMode('registry')}
          className={`flex-1 py-2 px-4.5 text-[10px] font-mono uppercase tracking-wider font-extrabold rounded-xl transition-all duration-300 cursor-pointer ${
            explorerMode === 'registry'
              ? 'bg-[#4F8CFF]/15 border border-[#4F8CFF]/30 text-[#4F8CFF] shadow-inner'
              : 'text-white/40 hover:text-white'
          }`}
        >
          Registry Spreadsheet
        </button>
        <button
          onClick={() => setExplorerMode('leads')}
          className={`flex-1 py-2 px-4.5 text-[10px] font-mono uppercase tracking-wider font-extrabold rounded-xl transition-all duration-300 cursor-pointer flex items-center justify-center gap-1.5 ${
            explorerMode === 'leads'
              ? 'bg-[#7C5CFF]/15 border border-[#7C5CFF]/30 text-[#7C5CFF] shadow-inner'
              : 'text-white/40 hover:text-white'
          }`}
        >
          <Zap className="w-3.5 h-3.5 text-[#7C5CFF]" />
          Lead Generator
        </button>
      </div>

      {explorerMode === 'registry' ? (
        // ==========================================
        // STANDARD SPREADSHEET REGISTRY VIEW
        // ==========================================
        <div className="glass-panel rounded-2xl border border-white/[0.06] shadow-2xl overflow-hidden animate-fadeIn">
          
          {/* Search & Filters Rail */}
          <div className="p-6 border-b border-white/[0.06] space-y-5 bg-gradient-to-b from-white/[0.01] to-transparent">
            
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div>
                <h3 className="font-serif italic text-xl text-white flex items-center gap-2">
                  <Layers className="w-5 h-5 text-[#4F8CFF] animate-heartbeat" />
                  SaaS Business Registry
                </h3>
                <p className="text-[10px] font-mono text-white/40 uppercase tracking-widest mt-1">Granular cohort spreadsheet & vacancy intelligence</p>
              </div>
              
              <div className="flex w-full sm:w-auto gap-3 items-center justify-end">
                <button
                  onClick={onExportCsv}
                  className="flex items-center gap-2 px-4.5 py-2.5 bg-white hover:bg-zinc-200 text-black text-[10px] font-mono font-bold uppercase tracking-wider rounded-xl transition-all duration-300 cursor-pointer shadow-lg active:scale-95 border-t border-white/20"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  Export CSV Suite
                </button>
              </div>
            </div>

            {/* Inputs Layout */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
              
              {/* Keyword Search */}
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="w-4 h-4 text-white/30" />
                </span>
                <input
                  type="text"
                  placeholder="Query Name or Sector..."
                  value={filters.search || ''}
                  onChange={e => {
                    setFilters({ ...filters, search: e.target.value });
                    setCurrentPage(1);
                  }}
                  className="w-full pl-9 pr-3.5 py-2.5 bg-[#0E1117]/80 border border-white/[0.06] focus:border-[#4F8CFF]/50 rounded-xl text-xs text-white placeholder-white/25 focus:outline-none transition-all duration-300 font-mono"
                />
              </div>

              {/* City Selection */}
              <div>
                <select
                  value={filters.city || ''}
                  onChange={e => {
                    setFilters({ ...filters, city: e.target.value });
                    setCurrentPage(1);
                  }}
                  className="w-full px-3.5 py-2.5 bg-[#0E1117]/80 border border-white/[0.06] focus:border-[#4F8CFF]/50 rounded-xl text-xs text-white/60 focus:outline-none transition-all duration-300 font-mono cursor-pointer"
                >
                  <option value="">All Markets</option>
                  <option value="Chandigarh">Chandigarh</option>
                  <option value="Mohali">Mohali</option>
                </select>
              </div>

              {/* Category Selection */}
              <div>
                <select
                  value={filters.category || ''}
                  onChange={e => {
                    setFilters({ ...filters, category: e.target.value });
                    setCurrentPage(1);
                  }}
                  className="w-full px-3.5 py-2.5 bg-[#0E1117]/80 border border-white/[0.06] focus:border-[#4F8CFF]/50 rounded-xl text-xs text-white/60 focus:outline-none transition-all duration-300 font-mono cursor-pointer"
                >
                  <option value="">All Cohorts</option>
                  <option value="Coffee Shop">Coffee Shop</option>
                  <option value="Bistro">Bistro</option>
                  <option value="Bakery Cafe">Bakery Cafe</option>
                  <option value="Book Cafe">Book Cafe</option>
                  <option value="Dessert Cafe">Dessert Cafe</option>
                  <option value="Traditional Cafe">Traditional Cafe</option>
                </select>
              </div>

              {/* Website Selection */}
              <div>
                <select
                  value={filters.website || ''}
                  onChange={e => {
                    setFilters({ ...filters, website: e.target.value });
                    setCurrentPage(1);
                  }}
                  className="w-full px-3.5 py-2.5 bg-[#0E1117]/80 border border-white/[0.06] focus:border-[#4F8CFF]/50 rounded-xl text-xs text-white/60 focus:outline-none transition-all duration-300 font-mono cursor-pointer"
                >
                  <option value="">All Web States</option>
                  <option value="Y">Has Website</option>
                  <option value="N">No Website</option>
                </select>
              </div>

              {/* Sorting Filter */}
              <div>
                <select
                  value={filters.sortBy || ''}
                  onChange={e => {
                    setFilters({ ...filters, sortBy: e.target.value, sortOrder: 'desc' });
                    setCurrentPage(1);
                  }}
                  className="w-full px-3.5 py-2.5 bg-[#0E1117]/80 border border-white/[0.06] focus:border-[#4F8CFF]/50 rounded-xl text-xs text-white/60 focus:outline-none transition-all duration-300 font-mono cursor-pointer"
                >
                  <option value="">Rank by default</option>
                  <option value="rating">Google Rating</option>
                  <option value="reviews">Review Volume</option>
                  <option value="digitalPresenceScore">Presence Index</option>
                  <option value="growthOpportunityScore">Opportunity Index</option>
                </select>
              </div>

            </div>
          </div>

          {/* Tabular Spreadsheet Grid */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse font-sans text-xs">
              <thead>
                <tr className="border-b border-white/[0.06] bg-white/[0.01] text-white/35 font-mono text-[9px] uppercase tracking-widest font-bold">
                  <th className="py-4.5 px-6">Establishment</th>
                  <th className="py-4.5 px-4 cursor-pointer hover:text-white transition-colors" onClick={() => handleSort('rating')}>
                    <span className="flex items-center gap-1.5">Rating <ArrowUpDown className="w-3 h-3" /></span>
                  </th>
                  <th className="py-4.5 px-4 cursor-pointer hover:text-white transition-colors" onClick={() => handleSort('reviews')}>
                    <span className="flex items-center gap-1.5">Reviews <ArrowUpDown className="w-3 h-3" /></span>
                  </th>
                  <th className="py-4.5 px-4 cursor-pointer hover:text-white transition-colors" onClick={() => handleSort('digitalPresenceScore')}>
                    <span className="flex items-center gap-1.5">Presence <ArrowUpDown className="w-3 h-3" /></span>
                  </th>
                  <th className="py-4.5 px-4 cursor-pointer hover:text-white transition-colors" onClick={() => handleSort('growthOpportunityScore')}>
                    <span className="flex items-center gap-1.5">Opportunity <ArrowUpDown className="w-3 h-3" /></span>
                  </th>
                  <th className="py-4.5 px-6 text-right">Priority Target</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {paginatedCafes.map((cafe) => (
                  <tr
                    key={cafe.id}
                    onClick={() => onSelectCafe(cafe.id)}
                    className="hover:bg-white/[0.02] cursor-pointer transition-colors group"
                  >
                    <td className="py-4 px-6 flex items-start gap-3">
                      <div className="p-2.5 bg-white/[0.02] border border-white/[0.05] rounded-xl group-hover:bg-[#4F8CFF]/10 group-hover:border-[#4F8CFF]/25 transition-all text-white/50 group-hover:text-white">
                        <Globe className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-white group-hover:text-[#4F8CFF] transition-colors leading-snug">{cafe.name}</p>
                        <p className="text-[10px] text-white/30 flex items-center gap-1 mt-1 font-mono uppercase tracking-wider">
                          <MapPin className="w-3 h-3 text-white/10" />
                          {cafe.area}, {cafe.city}
                        </p>
                      </div>
                    </td>
                    <td className="py-4 px-4 font-mono font-bold text-white">
                      ★ {cafe.rating.toFixed(1)}
                    </td>
                    <td className="py-4 px-4 font-mono text-white/60">
                      {cafe.reviews.toLocaleString()}
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-[#4F8CFF]">{cafe.digitalPresenceScore}%</span>
                        <div className="w-16 bg-white/[0.05] h-1.5 rounded-full overflow-hidden hidden sm:block">
                          <div className="bg-[#4F8CFF] h-full" style={{ width: `${cafe.digitalPresenceScore}%` }} />
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-[#7C5CFF]">{cafe.growthOpportunityScore}%</span>
                        <div className="w-16 bg-white/[0.05] h-1.5 rounded-full overflow-hidden hidden sm:block">
                          <div className="bg-[#7C5CFF] h-full" style={{ width: `${cafe.growthOpportunityScore}%` }} />
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-right">
                      {getPriorityBadge(cafe.growthOpportunityScore)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          <div className="p-4 bg-white/[0.01] border-t border-white/[0.06] flex items-center justify-between font-mono text-[10px] text-white/40">
            <span>
              Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, cafes.length)} of {cafes.length} records
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                className="p-1.5 bg-white/[0.02] border border-white/[0.05] rounded-lg text-white disabled:opacity-30 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-white font-bold">
                Page {currentPage} of {totalPages}
              </span>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                className="p-1.5 bg-white/[0.02] border border-white/[0.05] rounded-lg text-white disabled:opacity-30 cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

        </div>
      ) : (
        // ==========================================
        // STUNNING LEAD GENERATION CENTER VIEW
        // ==========================================
        <div className="space-y-6 animate-fadeIn">
          
          {/* Statistical Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="glass-panel border border-white/[0.06] rounded-2xl p-5 shadow-xl">
              <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-white/40 block">Qualified Lead Count</span>
              <span className="text-3xl font-space font-extrabold text-[#7C5CFF] block mt-1.5">{leadStats.totalCount}</span>
              <span className="text-[9px] font-mono text-white/30 block mt-1.5 uppercase font-bold">High potential targets</span>
            </div>
            
            <div className="glass-panel border border-white/[0.06] rounded-2xl p-5 shadow-xl">
              <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-white/40 block">Average Lead Rating</span>
              <span className="text-3xl font-space font-extrabold text-[#F59E0B] block mt-1.5">{leadStats.avgRating} ★</span>
              <span className="text-[9px] font-mono text-white/30 block mt-1.5 uppercase font-bold">Excellent reputation pool</span>
            </div>

            <div className="glass-panel border border-white/[0.06] rounded-2xl p-5 shadow-xl">
              <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-white/40 block">Missing Website Domains</span>
              <span className="text-3xl font-space font-extrabold text-[#EF4444] block mt-1.5">{leadStats.noWebsiteCount}</span>
              <span className="text-[9px] font-mono text-white/30 block mt-1.5 uppercase font-bold">Immediate onboarding potential</span>
            </div>

            <div className="glass-panel border border-white/[0.06] rounded-2xl p-5 shadow-xl bg-gradient-to-br from-[#10141D] to-transparent">
              <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-white/40 block">Estimated Market ROI Gap</span>
              <span className="text-3xl font-space font-extrabold text-[#32D583] block mt-1.5">{leadStats.estimatedSalesGaps}</span>
              <span className="text-[9px] font-mono text-[#32D583] block mt-1.5 uppercase font-extrabold tracking-widest">Aggregate revenue lift</span>
            </div>
          </div>

          {/* Lead Controller Filters Panel */}
          <div className="glass-panel rounded-2xl p-6 border border-white/[0.06] shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <h4 className="font-serif italic text-lg text-white">Automated Qualification Pipeline</h4>
                <p className="text-[9px] font-mono text-white/40 uppercase tracking-widest mt-0.5">Filter discovered cohorts using direct criteria algorithms</p>
              </div>
              
              <button
                disabled={selectedLeads.length === 0}
                className="px-4.5 py-2.5 bg-gradient-to-r from-[#4F8CFF] to-[#7C5CFF] text-white disabled:opacity-40 text-[9px] font-mono font-bold uppercase tracking-widest rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow-lg active:scale-95 border-t border-white/10"
              >
                <Download className="w-3.5 h-3.5" />
                Batch Export ({selectedLeads.length} Selected)
              </button>
            </div>

            {/* Selection Toggles */}
            <div className="flex flex-wrap gap-2 pt-2 border-t border-white/[0.04]">
              {[
                { id: 'all', label: 'All qualified leads' },
                { id: 'no_website', label: 'Unregistered Website domains' },
                { id: 'poor_seo', label: 'Weak Local SEO structure' },
                { id: 'weak_presence', label: 'Low digital presence index' },
                { id: 'hidden_gems', label: 'High Ratings / Low Volume' }
              ].map(btn => (
                <button
                  key={btn.id}
                  onClick={() => setLeadFilterType(btn.id as any)}
                  className={`px-4 py-2 text-[9px] font-mono uppercase tracking-wider font-extrabold border transition-all rounded-xl cursor-pointer ${
                    leadFilterType === btn.id
                      ? 'bg-[#7C5CFF]/15 border-[#7C5CFF]/30 text-[#7C5CFF] shadow-inner'
                      : 'bg-white/[0.01] border-white/[0.05] hover:bg-white/[0.04] text-white/50'
                  }`}
                >
                  {btn.label}
                </button>
              ))}
            </div>
          </div>

          {/* Lead Grid Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {qualifiedLeads.map(lead => (
              <div
                key={lead.id}
                className="glass-panel border border-white/[0.05] rounded-2xl p-5 hover:border-[#7C5CFF]/30 transition-all duration-300 flex flex-col justify-between group cursor-pointer relative"
                onClick={() => onSelectCafe(lead.id)}
              >
                
                {/* Select Checkbox Indicator */}
                <div 
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleSelectLead(lead.id);
                  }}
                  className="absolute top-4 right-4 z-20 w-5 h-5 rounded border border-white/10 flex items-center justify-center hover:border-[#7C5CFF]/60 cursor-pointer"
                >
                  {selectedLeads.includes(lead.id) && (
                    <div className="w-3 h-3 bg-gradient-to-br from-[#4F8CFF] to-[#7C5CFF] rounded-sm" />
                  )}
                </div>

                <div className="space-y-4.5">
                  <div className="flex items-start gap-3.5">
                    <div className="p-2.5 bg-white/[0.02] border border-white/[0.05] rounded-xl text-white/40 group-hover:text-[#7C5CFF] group-hover:border-[#7C5CFF]/20 transition-all">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 pr-6">
                      <h4 className="font-bold text-white group-hover:text-[#7C5CFF] transition-colors truncate leading-tight">
                        {lead.name}
                      </h4>
                      <span className="text-[8px] font-mono uppercase tracking-wider text-white/35 mt-1 block">
                        {lead.category} • {lead.area}
                      </span>
                    </div>
                  </div>

                  {/* Rating check */}
                  <div className="grid grid-cols-2 gap-3.5 py-3 border-y border-white/[0.04]">
                    <div>
                      <span className="text-[8px] font-mono text-white/30 uppercase block">GMB Rating</span>
                      <span className="text-xs font-mono font-bold text-white flex items-center gap-1 mt-0.5">
                        <Star className="w-3.5 h-3.5 fill-[#F59E0B] text-[#F59E0B]" />
                        {lead.rating.toFixed(1)} <span className="text-[8px] text-white/35 font-normal">({lead.reviews})</span>
                      </span>
                    </div>
                    <div>
                      <span className="text-[8px] font-mono text-white/30 uppercase block">Presence score</span>
                      <span className="text-xs font-mono font-bold text-[#4F8CFF] block mt-0.5">
                        {lead.digitalPresenceScore} / 100
                      </span>
                    </div>
                  </div>

                  {/* Specific vacancies discovered */}
                  <div className="space-y-2">
                    <span className="text-[8px] font-mono uppercase tracking-widest text-white/30 font-bold block">Discovered Vacancy Gaps</span>
                    <div className="flex flex-wrap gap-1.5">
                      {lead.website !== 'Y' && (
                        <span className="text-[8px] font-mono uppercase font-bold text-[#EF4444] bg-[#EF4444]/10 border border-[#EF4444]/25 px-2 py-0.5 rounded">
                          No registered website
                        </span>
                      )}
                      {lead.digitalPresenceScore < 50 && (
                        <span className="text-[8px] font-mono uppercase font-bold text-[#F59E0B] bg-[#F59E0B]/10 border border-[#F59E0B]/25 px-2 py-0.5 rounded">
                          Weak digital footprint
                        </span>
                      )}
                      {lead.rating >= 4.3 && lead.reviews < 100 && (
                        <span className="text-[8px] font-mono uppercase font-bold text-[#7C5CFF] bg-[#7C5CFF]/10 border border-[#7C5CFF]/25 px-2 py-0.5 rounded">
                          Hidden Gem: High Rating
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Direct Action Button */}
                <div className="pt-4 border-t border-white/[0.04] mt-4.5 flex items-center justify-between">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleExportLeadDoc(lead);
                    }}
                    disabled={downloadingLeadId === lead.id}
                    className="py-2 px-3 bg-white/[0.03] hover:bg-white/[0.06] text-white border border-white/[0.05] hover:border-white/10 text-[9px] font-mono uppercase tracking-wider font-extrabold rounded-lg flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    {downloadingLeadId === lead.id ? (
                      <>
                        <RefreshCw className="w-3 h-3 animate-spin text-[#7C5CFF]" />
                        Compiling...
                      </>
                    ) : (
                      <>
                        <Download className="w-3 h-3" />
                        Qualified lead report
                      </>
                    )}
                  </button>

                  <span className="text-[9px] font-mono font-bold text-[#7C5CFF] hover:underline flex items-center gap-0.5">
                    Strategic Profile
                    <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>

              </div>
            ))}
          </div>

          {/* Informational Alert Tip */}
          <div className="bg-[#141922]/25 border border-white/[0.06] p-4 rounded-xl text-[10px] font-mono text-white/40 flex gap-2.5 items-center shadow-inner">
            <Info className="w-4 h-4 text-[#4F8CFF] flex-shrink-0" />
            <p className="leading-relaxed">
              <span className="font-bold text-[#4F8CFF] uppercase tracking-widest mr-1">Lead Optimization Tip:</span> The Lead Generator applies real-time filters against indexed Chandigarh/Mohali establishments to isolate hot leads. Uncovering "Hidden Gems" or cafes lacking custom domains gives you immediate outreach potential to sell high-margin SEO or design packages.
            </p>
          </div>

        </div>
      )}

    </div>
  );
}
