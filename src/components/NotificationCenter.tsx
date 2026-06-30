import { Bell, CheckCircle2, AlertCircle, Info, Trash2, X, Sparkles } from 'lucide-react';

export interface AppNotification {
  id: string;
  type: 'opportunity' | 'warning' | 'info' | 'success';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

interface NotificationCenterProps {
  notifications: AppNotification[];
  isOpen: boolean;
  onClose: () => void;
  onMarkAsRead: (id: string) => void;
  onClearAll: () => void;
}

export default function NotificationCenter({
  notifications,
  isOpen,
  onClose,
  onMarkAsRead,
  onClearAll
}: NotificationCenterProps) {
  if (!isOpen) return null;

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="absolute top-16 right-8 w-80 sm:w-96 glass-panel bg-[#0E1117]/95 backdrop-blur-md border border-white/[0.08] rounded-2xl shadow-2xl z-50 animate-slideDown overflow-hidden flex flex-col max-h-[480px]">
      {/* Header */}
      <div className="p-4 border-b border-white/[0.06] flex items-center justify-between bg-gradient-to-r from-white/[0.01] to-transparent">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Bell className="w-4.5 h-4.5 text-[#4F8CFF]" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-[#EF4444] rounded-full" />
            )}
          </div>
          <div>
            <h4 className="text-xs font-mono font-bold text-white uppercase tracking-wider">Enterprise Signal Center</h4>
            <p className="text-[8px] font-mono text-white/40 uppercase tracking-widest mt-0.5">{unreadCount} Pending Alerts</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {notifications.length > 0 && (
            <button
              onClick={onClearAll}
              className="p-1.5 text-white/40 hover:text-[#EF4444] hover:bg-white/[0.02] rounded-lg transition-colors cursor-pointer"
              title="Clear All Notifications"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1.5 text-white/40 hover:text-white hover:bg-white/[0.02] rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Notifications Scroll Area */}
      <div className="flex-1 overflow-y-auto divide-y divide-white/[0.04] max-h-[360px]">
        {notifications.length === 0 ? (
          <div className="p-8 text-center flex flex-col items-center justify-center gap-2">
            <Sparkles className="w-8 h-8 text-white/10" />
            <p className="text-[10px] font-mono text-white/30 uppercase tracking-widest">No active telemetry alerts</p>
          </div>
        ) : (
          notifications.map(n => (
            <div
              key={n.id}
              onClick={() => onMarkAsRead(n.id)}
              className={`p-4 transition-all duration-300 cursor-pointer flex gap-3 items-start ${
                n.read ? 'bg-transparent opacity-60' : 'bg-white/[0.01] hover:bg-white/[0.03]'
              }`}
            >
              {/* Icon map */}
              <div className="mt-0.5">
                {n.type === 'opportunity' && <Sparkles className="w-4 h-4 text-[#7C5CFF]" />}
                {n.type === 'warning' && <AlertCircle className="w-4 h-4 text-[#F59E0B]" />}
                {n.type === 'success' && <CheckCircle2 className="w-4 h-4 text-[#32D583]" />}
                {n.type === 'info' && <Info className="w-4 h-4 text-[#4F8CFF]" />}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start gap-2">
                  <p className={`text-[10px] font-mono font-bold truncate leading-tight ${n.read ? 'text-white/70' : 'text-white'}`}>
                    {n.title}
                  </p>
                  {!n.read && (
                    <span className="w-1.5 h-1.5 bg-[#4F8CFF] rounded-full flex-shrink-0 mt-1" />
                  )}
                </div>
                <p className="text-[10px] text-white/50 mt-1 font-sans leading-relaxed">
                  {n.message}
                </p>
                <span className="text-[8px] font-mono text-white/20 uppercase tracking-wider block mt-1.5">
                  {n.timestamp}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="p-3 bg-white/[0.01] border-t border-white/[0.04] text-center">
        <p className="text-[8px] font-mono text-white/30 uppercase tracking-wider">Telemetry refresh cycle: Instant (Push Active)</p>
      </div>
    </div>
  );
}
