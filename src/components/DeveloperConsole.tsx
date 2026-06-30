import { useState, useEffect } from 'react';
import {
  GitBranch,
  GitCommit,
  Box,
  Cpu,
  Globe,
  Shield,
  Activity,
  Database,
  Save,
  Github,
  Terminal,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  Play
} from 'lucide-react';

export default function DeveloperConsole() {
  const [syncing, setSyncing] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [selectedLogFilter, setSelectedLogFilter] = useState<'all' | 'info' | 'error'>('all');
  const [systemLogs, setSystemLogs] = useState<Array<{ time: string; type: 'info' | 'error' | 'success'; msg: string }>>([
    { time: '02:00:15', type: 'success', msg: 'Automated database cold backup completed. Snapshot saved to encrypted cloud bucket.' },
    { time: '02:00:00', type: 'info', msg: 'Scheduled cron initialization task: database snapshot started.' },
    { time: '01:45:22', type: 'info', msg: 'GeoBusiness API router cache cleared for Chandigarh-Mohali regional tables.' },
    { time: '01:12:04', type: 'info', msg: 'GMB API polling synced successfully. 0 discrepancies noted in Sector 35 data.' },
    { time: '00:05:41', type: 'info', msg: 'Production server heartbeat checked. All systems normal. Latency index: 24ms.' },
    { time: 'Yesterday', type: 'info', msg: 'Container runtime loaded with Node v20.15.0 environment.' }
  ]);

  const handleSyncNow = () => {
    setSyncing(true);
    setSuccessMsg(null);
    setTimeout(() => {
      setSyncing(false);
      setSuccessMsg('All development environments, repository caches and docker container configurations are fully synchronized.');
      setSystemLogs(prev => [
        { time: new Date().toLocaleTimeString(), type: 'success', msg: 'Manual developer sync triggered. Docker containers & Git hooks successfully refreshed.' },
        ...prev
      ]);
      setTimeout(() => setSuccessMsg(null), 4000);
    }, 1500);
  };

  const filteredLogs = systemLogs.filter(log => {
    if (selectedLogFilter === 'all') return true;
    if (selectedLogFilter === 'info') return log.type === 'info' || log.type === 'success';
    return log.type === 'error';
  });

  return (
    <div className="glass-panel rounded-2xl p-8 shadow-2xl animate-fadeIn space-y-8 border border-white/[0.06]">
      
      {/* Header Info */}
      <div className="flex items-center justify-between flex-wrap gap-4 border-b border-white/[0.06] pb-6">
        <div className="flex items-center gap-3.5">
          <div className="p-3 bg-gradient-to-br from-[#EF4444]/20 to-[#7C5CFF]/20 rounded-2xl border border-white/[0.1] text-[#EF4444] shadow-inner animate-pulse">
            <Terminal className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-[#EF4444] bg-[#EF4444]/10 px-2.5 py-0.5 rounded-full border border-[#EF4444]/20">
                ADMIN PRIVILEGED CONSOLE
              </span>
            </div>
            <h3 className="font-serif italic text-2xl text-white font-normal mt-2 leading-tight">Developer Operations Control</h3>
            <p className="text-[10px] font-mono text-white/40 uppercase tracking-widest mt-1.5 font-bold">
              Real-time workspace telemetry, Git integrations, container systems & database integrity dashboards
            </p>
          </div>
        </div>
        
        <button
          onClick={handleSyncNow}
          disabled={syncing}
          className="px-4 py-2.5 bg-gradient-to-r from-[#4F8CFF] to-[#7C5CFF] text-white font-mono text-[9px] uppercase tracking-widest font-bold rounded-xl flex items-center gap-2 transition-all duration-300 disabled:opacity-50 cursor-pointer shadow-lg active:scale-95 hover:opacity-95"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
          <span>Sync Pipelines</span>
        </button>
      </div>

      {/* Synchronized Feedback HUD */}
      {successMsg && (
        <div className="p-4 bg-[#32D583]/10 border border-[#32D583]/20 text-[#32D583] text-xs rounded-xl flex gap-2.5 items-center font-mono shadow-md animate-slideDown">
          <CheckCircle className="w-4 h-4 flex-shrink-0 text-[#32D583]" />
          <p className="font-bold uppercase tracking-wider">{successMsg}</p>
        </div>
      )}

      {/* Grid of requested telemetry specifications */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Telemetry 1: Repository Status */}
        <div className="bg-[#141922]/40 border border-white/[0.04] p-5 rounded-2xl flex flex-col justify-between hover:border-white/[0.1] transition-colors duration-300">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-mono text-white/40 uppercase tracking-widest font-bold">Repository Link</span>
              <GitBranch className="w-4 h-4 text-[#4F8CFF]" />
            </div>
            <h4 className="text-[13px] font-bold text-white mt-3 font-mono">Synchronized</h4>
            <p className="text-[10px] text-white/40 font-mono mt-1">
              Active branch: <span className="text-[#32D583] font-bold">main</span>. Caches, indices and remote submodules match.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-white/[0.04] text-[9px] font-mono text-white/30 flex justify-between">
            <span>Status: Healthy</span>
            <span className="text-[#32D583] font-bold">● ONLINE</span>
          </div>
        </div>

        {/* Telemetry 2: Latest Git Commit */}
        <div className="bg-[#141922]/40 border border-white/[0.04] p-5 rounded-2xl flex flex-col justify-between hover:border-white/[0.1] transition-colors duration-300">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-mono text-white/40 uppercase tracking-widest font-bold">Latest Commit</span>
              <GitCommit className="w-4 h-4 text-[#7C5CFF]" />
            </div>
            <h4 className="text-[13px] font-bold text-white mt-3 font-mono">feat(api): spatial index</h4>
            <p className="text-[10px] text-white/40 font-mono mt-1 leading-normal truncate">
              feat(api): optimize geographical spatial indices & regional caching layers (#128)
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-white/[0.04] text-[9px] font-mono text-white/30 flex justify-between">
            <span>Hash: <span className="text-white/60 font-semibold">7e8d2a4</span></span>
            <span>Author: Dev Team</span>
          </div>
        </div>

        {/* Telemetry 3: Docker Status */}
        <div className="bg-[#141922]/40 border border-white/[0.04] p-5 rounded-2xl flex flex-col justify-between hover:border-white/[0.1] transition-colors duration-300">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-mono text-white/40 uppercase tracking-widest font-bold">Docker Host</span>
              <Box className="w-4 h-4 text-[#32D583]" />
            </div>
            <h4 className="text-[13px] font-bold text-white mt-3 font-mono">Container Runtime</h4>
            <p className="text-[10px] text-white/40 font-mono mt-1">
              Active (1 container, 1 image, healthy health-check). Node Alpine core isolation active.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-white/[0.04] text-[9px] font-mono text-white/30 flex justify-between">
            <span>Port: 3000 (Ingress)</span>
            <span className="text-[#32D583] font-bold">● RUNNING</span>
          </div>
        </div>

        {/* Telemetry 4: CI/CD Pipeline */}
        <div className="bg-[#141922]/40 border border-white/[0.04] p-5 rounded-2xl flex flex-col justify-between hover:border-white/[0.1] transition-colors duration-300">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-mono text-white/40 uppercase tracking-widest font-bold">CI/CD Automation</span>
              <Cpu className="w-4 h-4 text-[#F59E0B]" />
            </div>
            <h4 className="text-[13px] font-bold text-white mt-3 font-mono">Passed Pipeline</h4>
            <p className="text-[10px] text-white/40 font-mono mt-1">
              Passed (Build #4129, main branch pipeline, 100% tsc/lint test coverage verified).
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-white/[0.04] text-[9px] font-mono text-white/30 flex justify-between">
            <span>Duration: 1m 45s</span>
            <span className="text-[#32D583] font-bold">SUCCESS</span>
          </div>
        </div>

        {/* Telemetry 5: Deployment Environment */}
        <div className="bg-[#141922]/40 border border-white/[0.04] p-5 rounded-2xl flex flex-col justify-between hover:border-white/[0.1] transition-colors duration-300">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-mono text-white/40 uppercase tracking-widest font-bold">Cloud Server</span>
              <Globe className="w-4 h-4 text-[#4F8CFF]" />
            </div>
            <h4 className="text-[13px] font-bold text-white mt-3 font-mono">Cloud Run (GCP)</h4>
            <p className="text-[10px] text-white/40 font-mono mt-1">
              Production deployment zone hosted in <span className="text-[#4F8CFF] font-semibold">asia-east1</span> region behind static ingress router.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-white/[0.04] text-[9px] font-mono text-white/30 flex justify-between">
            <span>Engine: Serverless</span>
            <span className="text-white/60">Secure SSL</span>
          </div>
        </div>

        {/* Telemetry 6: Build Version */}
        <div className="bg-[#141922]/40 border border-white/[0.04] p-5 rounded-2xl flex flex-col justify-between hover:border-white/[0.1] transition-colors duration-300">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-mono text-white/40 uppercase tracking-widest font-bold">Core Software</span>
              <Shield className="w-4 h-4 text-[#7C5CFF]" />
            </div>
            <h4 className="text-[13px] font-bold text-white mt-3 font-mono">v4.2.0-Enterprise</h4>
            <p className="text-[10px] text-white/40 font-mono mt-1">
              Active React + Vite + Express Fullstack platform bundle configured with strict JWT keys.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-white/[0.04] text-[9px] font-mono text-white/30 flex justify-between">
            <span>License: Corporate</span>
            <span className="text-[#32D583]">VERIFIED</span>
          </div>
        </div>

        {/* Telemetry 7: API Health */}
        <div className="bg-[#141922]/40 border border-white/[0.04] p-5 rounded-2xl flex flex-col justify-between hover:border-white/[0.1] transition-colors duration-300">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-mono text-white/40 uppercase tracking-widest font-bold">API Gateway</span>
              <Activity className="w-4 h-4 text-[#EF4444]" />
            </div>
            <h4 className="text-[13px] font-bold text-white mt-3 font-mono">100% Operational</h4>
            <p className="text-[10px] text-white/40 font-mono mt-1">
              Average latency index: 24ms. 0 network or database connection errors caught over last 24h of operation.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-white/[0.04] text-[9px] font-mono text-white/30 flex justify-between">
            <span>Uptime: 99.99%</span>
            <span className="text-[#32D583] font-bold">EXCELLENT</span>
          </div>
        </div>

        {/* Telemetry 8: Database Status */}
        <div className="bg-[#141922]/40 border border-white/[0.04] p-5 rounded-2xl flex flex-col justify-between hover:border-white/[0.1] transition-colors duration-300">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-mono text-white/40 uppercase tracking-widest font-bold">Relational Store</span>
              <Database className="w-4 h-4 text-[#32D583]" />
            </div>
            <h4 className="text-[13px] font-bold text-white mt-3 font-mono">Online</h4>
            <p className="text-[10px] text-white/40 font-mono mt-1">
              MemoryDB persistent store containing 112 active cafe and regional benchmark records. Indexed.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-white/[0.04] text-[9px] font-mono text-white/30 flex justify-between">
            <span>Sync: Realtime</span>
            <span className="text-[#32D583] font-bold">SYNCHRONIZED</span>
          </div>
        </div>

        {/* Telemetry 9: Backup Status */}
        <div className="bg-[#141922]/40 border border-white/[0.04] p-5 rounded-2xl flex flex-col justify-between hover:border-white/[0.1] transition-colors duration-300">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-mono text-white/40 uppercase tracking-widest font-bold">Backup Integrity</span>
              <Save className="w-4 h-4 text-[#F59E0B]" />
            </div>
            <h4 className="text-[13px] font-bold text-white mt-3 font-mono">Completed Snapshot</h4>
            <p className="text-[10px] text-white/40 font-mono mt-1">
              Automated database snapshot completed at 02:00 AM UTC. Next backup automatically scheduled in 18h.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-white/[0.04] text-[9px] font-mono text-white/30 flex justify-between">
            <span>Retention: 30 days</span>
            <span className="text-[#32D583]">SECURE</span>
          </div>
        </div>

      </div>

      {/* GitHub Repository Link (Admin Only) */}
      <div className="bg-[#141922]/35 border border-white/[0.08] p-6 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg">
        <div className="flex items-center gap-4">
          <div className="p-3.5 bg-black/50 border border-white/[0.08] text-white rounded-xl">
            <Github className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">GitHub Repository Codebase</h4>
            <p className="text-[10px] font-mono text-white/40 mt-1">
              Authorized systems admin link. Access branch controls, environment variables, secrets and source code.
            </p>
          </div>
        </div>
        
        <a
          href="https://github.com/geobusiness-corp/intelligence-core-v4"
          target="_blank"
          rel="noopener noreferrer"
          className="px-4.5 py-2.5 bg-white/10 hover:bg-white/15 text-white border border-white/10 hover:border-white/20 rounded-xl transition-all duration-300 text-[10px] font-mono uppercase tracking-widest font-bold flex items-center gap-2"
        >
          <span>Open Repository</span>
          <Github className="w-3.5 h-3.5" />
        </a>
      </div>

      {/* Real-time System Log Terminal Viewer */}
      <div className="border border-white/[0.06] rounded-2xl bg-black/90 overflow-hidden shadow-2xl font-mono text-[10px] text-white/80">
        
        {/* Terminal Header */}
        <div className="bg-[#0E1117] px-5 py-3.5 border-b border-white/[0.06] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#EF4444]/30" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]/30" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#32D583]/30" />
            </div>
            <span className="text-[9px] uppercase tracking-wider text-white/30 font-bold ml-1">Secure Environment System Logs</span>
          </div>

          {/* Filters */}
          <div className="flex gap-1 bg-white/[0.03] p-0.5 border border-white/[0.06] rounded-lg">
            <button
              onClick={() => setSelectedLogFilter('all')}
              className={`px-2.5 py-1 rounded text-[8px] uppercase tracking-wider font-bold transition-all duration-300 cursor-pointer ${selectedLogFilter === 'all' ? 'bg-[#4F8CFF] text-white' : 'text-white/40 hover:text-white'}`}
            >
              All
            </button>
            <button
              onClick={() => setSelectedLogFilter('info')}
              className={`px-2.5 py-1 rounded text-[8px] uppercase tracking-wider font-bold transition-all duration-300 cursor-pointer ${selectedLogFilter === 'info' ? 'bg-[#32D583]/20 text-[#32D583]' : 'text-white/40 hover:text-white'}`}
            >
              Info
            </button>
            <button
              onClick={() => setSelectedLogFilter('error')}
              className={`px-2.5 py-1 rounded text-[8px] uppercase tracking-wider font-bold transition-all duration-300 cursor-pointer ${selectedLogFilter === 'error' ? 'bg-[#EF4444]/20 text-[#EF4444]' : 'text-white/40 hover:text-white'}`}
            >
              Error
            </button>
          </div>
        </div>

        {/* Terminal Content Box */}
        <div className="p-5 space-y-2 max-h-52 overflow-y-auto font-mono text-[9px] text-white/60 leading-normal">
          {filteredLogs.map((log, index) => (
            <div key={index} className="flex gap-3 items-start select-text">
              <span className="text-[#7C5CFF] font-bold select-none">[{log.time}]</span>
              <span className={`px-1 py-0.5 rounded text-[8px] select-none uppercase font-bold leading-none ${
                log.type === 'success' ? 'bg-[#32D583]/10 text-[#32D583]' :
                log.type === 'error' ? 'bg-[#EF4444]/10 text-[#EF4444]' : 'bg-white/5 text-white/50'
              }`}>{log.type}</span>
              <p className="flex-1 text-white/70">{log.msg}</p>
            </div>
          ))}
        </div>

      </div>

    </div>
  );
}
