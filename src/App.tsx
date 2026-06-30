import { useState, useEffect } from 'react';
import {
  Coffee,
  Sliders,
  TrendingUp,
  MapPin,
  FileText,
  Plus,
  LogOut,
  User,
  RefreshCw,
  Compass,
  AlertCircle,
  Terminal,
  Brain
} from 'lucide-react';
import { Cafe, User as UserType, DashboardKPIs } from './types';
import { api, getAuthToken, clearAuthToken, getCurrentUser } from './utils/api';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import CafeTable from './components/CafeTable';
import CafeMap from './components/CafeMap';
import CafeDetails from './components/CafeDetails';
import AdminPanel from './components/AdminPanel';
import ReportExport from './components/ReportExport';
import DeveloperConsole from './components/DeveloperConsole';
import AiConsultant from './components/AiConsultant';
import UserProfileModal from './components/UserProfileModal';

export default function App() {
  // Session States
  const [currentUser, setCurrentUser] = useState<UserType | null>(null);
  const [sessionChecking, setSessionChecking] = useState(true);
  const [userProfileOpen, setUserProfileOpen] = useState(false);

  // Active Panel Navigation (dashboard, explorer, consultant, map, reports, developer)
  const [activeTab, setActiveTab] = useState<'dashboard' | 'explorer' | 'consultant' | 'map' | 'reports' | 'developer'>('dashboard');

  // Business Dataset States
  const [cafes, setCafes] = useState<Cafe[]>([]);
  const [analytics, setAnalytics] = useState<DashboardKPIs & { categoryDistribution: any[] } | null>(null);
  const [loadingDataset, setLoadingDataset] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Split-View Selection Drawers
  const [selectedCafeId, setSelectedCafeId] = useState<string | null>(null);
  const [adminPanelOpen, setAdminPanelOpen] = useState(false);
  const [editTargetCafe, setEditTargetCafe] = useState<Cafe | null>(null);

  // Filter syncing across views
  const [filters, setFilters] = useState({
    search: '',
    city: '',
    category: '',
    website: '',
    minRating: undefined,
    minOpportunity: undefined,
    sortBy: '',
    sortOrder: 'desc' as 'asc' | 'desc'
  });

  // Check auth session on load
  useEffect(() => {
    const token = getAuthToken();
    if (token) {
      const decoded = getCurrentUser();
      if (decoded) {
        // Fetch fresh details from backend to ensure fields like profilePicture or lastLogin are up to date
        api.getMe().then(res => {
          if (res && res.user) {
            setCurrentUser(res.user);
          } else {
            setCurrentUser(decoded);
          }
        }).catch(() => {
          setCurrentUser(decoded);
        });
      } else {
        clearAuthToken();
      }
    }
    setSessionChecking(false);
  }, []);

  // Fetch full dataset whenever refreshTrigger or filters update
  useEffect(() => {
    if (!currentUser) return;

    const loadDataset = async () => {
      setLoadingDataset(true);
      try {
        const list = await api.getCafes(filters);
        setCafes(list);
        
        const stats = await api.getAnalytics();
        setAnalytics(stats);
      } catch (err: any) {
        console.error("Failed to sync client dataset with backend:", err);
        const errMsg = err?.message || "";
        if (
          errMsg.includes("403") ||
          errMsg.includes("401") ||
          errMsg.includes("token") ||
          errMsg.includes("expired") ||
          errMsg.includes("forbidden") ||
          errMsg.includes("unauthorized")
        ) {
          handleLogout();
        }
      } finally {
        setLoadingDataset(false);
      }
    };

    loadDataset();
  }, [currentUser, refreshTrigger, filters]);

  const handleLoginSuccess = (user: UserType) => {
    setCurrentUser(user);
    setActiveTab('dashboard');
  };

  const handleLogout = () => {
    clearAuthToken();
    setCurrentUser(null);
    setSelectedCafeId(null);
    setAdminPanelOpen(false);
    setEditTargetCafe(null);
    setUserProfileOpen(false);
  };

  const handleSelectCafe = (id: string) => {
    setSelectedCafeId(id);
    setAdminPanelOpen(false);
    setEditTargetCafe(null);
  };

  const handleTriggerEdit = (cafe: Cafe) => {
    setEditTargetCafe(cafe);
    setAdminPanelOpen(true);
  };

  const handleTriggerCreate = () => {
    setEditTargetCafe(null);
    setAdminPanelOpen(true);
    setSelectedCafeId(null);
  };

  const handleRefreshData = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const handleExportCsvDirectly = () => {
    window.open('/api/reports/csv', '_blank');
  };

  const handleProfileUpdate = (updatedUser: any) => {
    setCurrentUser(updatedUser);
  };

  if (sessionChecking) {
    return (
      <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center gap-4 font-mono text-[#4F8CFF] text-xs">
        <RefreshCw className="w-6 h-6 text-[#7C5CFF] animate-spin" />
        <span className="tracking-[0.2em] uppercase font-bold text-white/50 animate-pulse">Initializing Neural Analytics Core...</span>
      </div>
    );
  }

  // Not authenticated? Render beautiful JWT Login Portal
  if (!currentUser) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-[#050505] text-[#E5E5E5] flex flex-col select-none antialiased relative overflow-x-hidden">
      
      {/* Premium Ambient Background System */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        {/* Floating Aurora Mesh Blobs */}
        <div className="absolute -top-[30%] -left-[10%] w-[60%] h-[60%] rounded-full bg-gradient-to-tr from-[#4F8CFF]/12 to-[#7C5CFF]/3 blur-[130px] animate-float-1" />
        <div className="absolute -bottom-[25%] -right-[10%] w-[60%] h-[60%] rounded-full bg-gradient-to-bl from-[#7C5CFF]/12 to-[#4F8CFF]/3 blur-[130px] animate-float-2" />
        
        {/* High-Tech Fine Grid Overlay */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        
        {/* Radial Ambient Center Darkening */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_20%,#050505_80%)]" />
      </div>

      {/* Global Header */}
      <header className="sticky top-0 z-50 glass-header border-b border-white/[0.06] backdrop-blur-md py-3.5 px-8 flex flex-col xl:flex-row justify-between items-center gap-4 relative z-10">
        
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-br from-[#4F8CFF]/20 to-[#7C5CFF]/20 border border-white/[0.08] rounded-xl shadow-[0_0_15px_rgba(79,140,255,0.15)]">
            <Coffee className="w-5 h-5 text-[#4F8CFF] animate-heartbeat" />
          </div>
          <div>
            <h1 className="font-serif italic text-2xl text-white tracking-tight flex items-center gap-2">
              GeoBusiness
              <span className="text-[9px] font-mono tracking-wider font-bold text-[#4F8CFF] bg-[#4F8CFF]/10 px-2 py-0.5 rounded-full border border-[#4F8CFF]/20 uppercase">
                v4.2.0-Enterprise
              </span>
            </h1>
            <p className="text-[9px] uppercase tracking-[0.25em] text-white/40 mt-1 font-bold font-mono">CHANDIGARH & MOHALI REGION INTELLIGENCE</p>
          </div>
        </div>

        {/* Tab Controls */}
        <nav className="flex flex-wrap items-center justify-center bg-white/[0.03] border border-white/[0.06] p-1 rounded-3xl xl:rounded-full backdrop-blur-md shadow-[inset_0_1px_2px_rgba(255,255,255,0.03)] max-w-full gap-1">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center gap-1.5 px-4.5 py-2 text-[10px] font-mono uppercase tracking-wider font-bold transition-all duration-300 cursor-pointer rounded-full ${
              activeTab === 'dashboard'
                ? 'bg-gradient-to-r from-[#4F8CFF] to-[#7C5CFF] text-white shadow-[0_4px_12px_rgba(79,140,255,0.3)] border-t border-white/10'
                : 'text-white/40 hover:text-white hover:bg-white/[0.03]'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            Insights Dashboard
          </button>
          
          <button
            onClick={() => setActiveTab('explorer')}
            className={`flex items-center gap-1.5 px-4.5 py-2 text-[10px] font-mono uppercase tracking-wider font-bold transition-all duration-300 cursor-pointer rounded-full ${
              activeTab === 'explorer'
                ? 'bg-gradient-to-r from-[#4F8CFF] to-[#7C5CFF] text-white shadow-[0_4px_12px_rgba(79,140,255,0.3)] border-t border-white/10'
                : 'text-white/40 hover:text-white hover:bg-white/[0.03]'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            Explorer spreadsheet
          </button>

          <button
            onClick={() => setActiveTab('consultant')}
            className={`flex items-center gap-1.5 px-4.5 py-2 text-[10px] font-mono uppercase tracking-wider font-bold transition-all duration-300 cursor-pointer rounded-full ${
              activeTab === 'consultant'
                ? 'bg-gradient-to-r from-[#4F8CFF] to-[#7C5CFF] text-white shadow-[0_4px_12px_rgba(79,140,255,0.3)] border-t border-white/10'
                : 'text-white/40 hover:text-white hover:bg-white/[0.03]'
            }`}
          >
            <Brain className="w-3.5 h-3.5" />
            AI Consultant
          </button>

          <button
            onClick={() => setActiveTab('map')}
            className={`flex items-center gap-1.5 px-4.5 py-2 text-[10px] font-mono uppercase tracking-wider font-bold transition-all duration-300 cursor-pointer rounded-full ${
              activeTab === 'map'
                ? 'bg-gradient-to-r from-[#4F8CFF] to-[#7C5CFF] text-white shadow-[0_4px_12px_rgba(79,140,255,0.3)] border-t border-white/10'
                : 'text-white/40 hover:text-white hover:bg-white/[0.03]'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            Interactive Map
          </button>

          <button
            onClick={() => setActiveTab('reports')}
            className={`flex items-center gap-1.5 px-4.5 py-2 text-[10px] font-mono uppercase tracking-wider font-bold transition-all duration-300 cursor-pointer rounded-full ${
              activeTab === 'reports'
                ? 'bg-gradient-to-r from-[#4F8CFF] to-[#7C5CFF] text-white shadow-[0_4px_12px_rgba(79,140,255,0.3)] border-t border-white/10'
                : 'text-white/40 hover:text-white hover:bg-white/[0.03]'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            Exports Suite
          </button>

          {currentUser.role === 'admin' && (
            <button
              onClick={() => setActiveTab('developer')}
              className={`flex items-center gap-1.5 px-4.5 py-2 text-[10px] font-mono uppercase tracking-wider font-bold transition-all duration-300 cursor-pointer rounded-full ${
                activeTab === 'developer'
                  ? 'bg-gradient-to-r from-[#EF4444] to-[#7C5CFF] text-white shadow-[0_4px_12px_rgba(239,68,68,0.3)] border-t border-white/10'
                  : 'text-[#EF4444]/60 hover:text-[#EF4444] hover:bg-white/[0.03]'
              }`}
            >
              <Terminal className="w-3.5 h-3.5" />
              Dev Console
            </button>
          )}
        </nav>

        {/* User Account Area */}
        <div className="flex items-center gap-3">
          {/* Status Indicator */}
          <div className="hidden sm:flex items-center gap-2 bg-[#0E1117] border border-white/[0.06] rounded-full py-1.5 px-3">
            <span className="w-1.5 h-1.5 rounded-full bg-[#32D583] animate-pulse" />
            <span className="text-[9px] font-mono font-semibold tracking-wider text-white/50">LIVE PIPELINE</span>
          </div>

          {/* Clickable Profile Card */}
          <button
            onClick={() => setUserProfileOpen(true)}
            className="flex items-center gap-2.5 bg-white/[0.03] border border-white/[0.06] hover:border-[#4F8CFF]/40 py-1.5 px-3 rounded-xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.02)] cursor-pointer group transition-all duration-300"
            title="Configure profile and keys"
          >
            <img
              src={currentUser.profilePicture || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop&crop=face"}
              alt="Avatar"
              referrerPolicy="no-referrer"
              className="w-6 h-6 rounded-lg object-cover border border-white/10 group-hover:border-[#4F8CFF]/40 transition-colors"
            />
            <div className="text-left">
              <p className="text-[10px] font-mono text-white leading-none font-bold group-hover:text-[#4F8CFF] transition-colors">{currentUser.name}</p>
              <p className="text-[8px] font-mono text-white/40 leading-none mt-1 uppercase tracking-wider font-bold">
                Role: <span className={currentUser.role === 'admin' ? 'text-[#EF4444]' : 'text-[#32D583]'}>{currentUser.role}</span>
              </p>
            </div>
          </button>

          {currentUser.role === 'admin' && (
            <button
              onClick={handleTriggerCreate}
              className="px-4 py-2 bg-gradient-to-r from-[#4F8CFF] to-[#7C5CFF] hover:opacity-95 text-white rounded-xl shadow-[0_4px_12px_rgba(79,140,255,0.25)] border-t border-white/10 cursor-pointer flex items-center justify-center gap-1.5 text-[10px] font-mono font-bold uppercase tracking-wider transition-all duration-300 active:scale-95"
              title="Add Cafe"
            >
              <Plus className="w-4 h-4" />
              Register
            </button>
          )}

          <button
            onClick={handleLogout}
            className="p-2.5 bg-white/[0.03] border border-white/[0.06] hover:bg-[#EF4444]/10 hover:border-[#EF4444]/20 hover:text-[#EF4444] text-white/60 rounded-xl cursor-pointer transition-all duration-300"
            title="Disconnect authentication"
          >
            <LogOut className="w-4.5 h-4.5" />
          </button>
        </div>

      </header>

      {/* Main Layout Shell Split View */}
      <main className="flex-1 flex overflow-hidden relative z-10">
        
        {/* Core Working Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 relative">
          
          {loadingDataset && (
            <div className="absolute top-4 right-6 bg-[#0E1117]/95 border border-white/[0.08] px-3.5 py-2 rounded-xl flex items-center gap-2 text-xs font-mono text-[#4F8CFF] z-50 shadow-2xl backdrop-blur-md animate-fadeIn">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#7C5CFF]" />
              <span className="tracking-wide">Data pipeline synchronization...</span>
            </div>
          )}

          {activeTab === 'dashboard' && (
            <Dashboard onSelectCafe={handleSelectCafe} filters={filters} />
          )}

          {activeTab === 'explorer' && (
            <CafeTable
              cafes={cafes}
              onSelectCafe={handleSelectCafe}
              filters={filters}
              setFilters={setFilters}
              onExportCsv={handleExportCsvDirectly}
            />
          )}

          {activeTab === 'consultant' && (
            <AiConsultant cafes={cafes} />
          )}

          {activeTab === 'map' && (
            <CafeMap cafes={cafes} onSelectCafe={handleSelectCafe} />
          )}

          {activeTab === 'reports' && (
            <ReportExport cafes={cafes} analytics={analytics} />
          )}

          {activeTab === 'developer' && currentUser.role === 'admin' && (
            <DeveloperConsole />
          )}

        </div>

        {/* Right Split View Pane: Renders Selected Cafe Details */}
        {selectedCafeId && (
          <CafeDetails
            cafeId={selectedCafeId}
            onClose={() => setSelectedCafeId(null)}
            onEditClick={handleTriggerEdit}
            isAdmin={currentUser.role === 'admin'}
            allCafes={cafes}
          />
        )}

        {/* Right Split View Pane: Renders Add/Edit Administrative Drawers */}
        {adminPanelOpen && (
          <AdminPanel
            editCafe={editTargetCafe}
            onClose={() => setAdminPanelOpen(false)}
            onRefresh={handleRefreshData}
          />
        )}

      </main>

      {/* Global Modals */}
      <UserProfileModal
        isOpen={userProfileOpen}
        onClose={() => setUserProfileOpen(false)}
        currentUser={currentUser}
        onProfileUpdate={handleProfileUpdate}
        onLogout={handleLogout}
      />

    </div>
  );
}
