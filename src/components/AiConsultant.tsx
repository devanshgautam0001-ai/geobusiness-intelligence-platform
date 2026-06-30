import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles, Send, RefreshCw, Bot, User, Building, Compass, TrendingUp,
  Cpu, FileText, Search, ShieldCheck, AlertCircle, Award, CheckCircle,
  HelpCircle, ChevronRight, Zap, Target, Instagram, Facebook, LineChart,
  MessageSquare, Trash2, ArrowUpRight, Plus, MapPin, Star, Laptop, Globe
} from 'lucide-react';
import { Cafe } from '../types';
import { api } from '../utils/api';

interface AiConsultantProps {
  cafes: Cafe[];
}

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: Date;
}

interface Conversation {
  id: string;
  title: string;
  cafeId?: string;
  messages: Message[];
}

export default function AiConsultant({ cafes }: AiConsultantProps) {
  const [selectedCafeId, setSelectedCafeId] = useState<string>('');
  const [inputMessage, setInputMessage] = useState<string>('');
  
  // Conversation states
  const [conversations, setConversations] = useState<Conversation[]>([
    {
      id: 'conv_1',
      title: 'Mohali Digital Gap Audit',
      cafeId: '',
      messages: [
        {
          id: 'msg_welcome',
          sender: 'assistant',
          text: `### 💎 Welcome to GeoVision AI Enterprise Consultant
          
I am your dedicated **AI Growth Consultant** specializing in the Chandigarh and Mohali commercial cafe markets. 

Select a business from the dropdown above to bind context, then click any of the **Targeted Strategic Actions** or type a custom query.`,
          timestamp: new Date()
        }
      ]
    }
  ]);
  const [activeConvId, setActiveConvId] = useState<string>('conv_1');
  const [loading, setLoading] = useState<boolean>(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const activeConv = conversations.find(c => c.id === activeConvId) || conversations[0];
  const messages = activeConv.messages;

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSendMessage = async (customText?: string, actionId?: string) => {
    const text = customText || inputMessage;
    if (!text.trim() && !actionId) return;

    if (!customText) {
      setInputMessage('');
    }

    const userMsgId = `msg_user_${Date.now()}`;
    const userMsg: Message = {
      id: userMsgId,
      sender: 'user',
      text: actionId ? `Triggered Targeted ${actionId.toUpperCase().replace('_', ' ')} Audit` : text,
      timestamp: new Date()
    };

    // Update active conversation with user message
    setConversations(prev => prev.map(conv => {
      if (conv.id === activeConvId) {
        return {
          ...conv,
          messages: [...conv.messages, userMsg],
          title: conv.messages.length === 1 ? text.slice(0, 30) + '...' : conv.title
        };
      }
      return conv;
    }));

    setLoading(true);

    try {
      const response = await api.aiChat({
        message: text,
        cafeId: selectedCafeId || undefined,
        action: actionId
      });

      const fullResponse = response.response;
      const assistantMsgId = `msg_assistant_${Date.now()}`;
      
      // Initialize assistant message bubble
      setConversations(prev => prev.map(conv => {
        if (conv.id === activeConvId) {
          return {
            ...conv,
            messages: [...conv.messages, {
              id: assistantMsgId,
              sender: 'assistant',
              text: '',
              timestamp: new Date()
            }]
          };
        }
        return conv;
      }));

      let currentText = '';
      const words = fullResponse.split(' ');
      let wordIndex = 0;

      const timer = setInterval(() => {
        if (wordIndex < words.length) {
          currentText += (wordIndex === 0 ? '' : ' ') + words[wordIndex];
          setConversations(prev => prev.map(conv => {
            if (conv.id === activeConvId) {
              return {
                ...conv,
                messages: conv.messages.map(m => m.id === assistantMsgId ? { ...m, text: currentText } : m)
              };
            }
            return conv;
          }));
          wordIndex += Math.ceil(words.length / 45); // Smooth rapid streaming
        } else {
          // Finish stream
          setConversations(prev => prev.map(conv => {
            if (conv.id === activeConvId) {
              return {
                ...conv,
                messages: conv.messages.map(m => m.id === assistantMsgId ? { ...m, text: fullResponse } : m)
              };
            }
            return conv;
          }));
          clearInterval(timer);
          setLoading(false);
        }
      }, 15);

    } catch (err: any) {
      setConversations(prev => prev.map(conv => {
        if (conv.id === activeConvId) {
          return {
            ...conv,
            messages: [...conv.messages, {
              id: `msg_err_${Date.now()}`,
              sender: 'assistant',
              text: `### ❌ Pipeline Connection Fault\nFailed to receive advice: ${err.message || 'Unknown server error'}. Verify your system credentials.`,
              timestamp: new Date()
            }]
          };
        }
        return conv;
      }));
      setLoading(false);
    }
  };

  const createNewConversation = () => {
    const id = `conv_${Date.now()}`;
    const newConv: Conversation = {
      id,
      title: `Analysis Hub #${conversations.length + 1}`,
      cafeId: selectedCafeId,
      messages: [
        {
          id: `msg_welcome_${Date.now()}`,
          sender: 'assistant',
          text: `### 💎 New Intelligence Hub Initiated\nReady to formulate spatial growth maps. Select an action below or ask any direct query.`,
          timestamp: new Date()
        }
      ]
    };
    setConversations(prev => [...prev, newConv]);
    setActiveConvId(id);
  };

  const deleteConversation = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (conversations.length === 1) return;
    setConversations(prev => prev.filter(c => c.id !== id));
    if (activeConvId === id) {
      const remaining = conversations.filter(c => c.id !== id);
      setActiveConvId(remaining[0].id);
    }
  };

  const suggestedPrompts = [
    { title: "Growth Roadmap", prompt: "Give me a detailed 12-month growth plan including recommended popups & local events.", icon: Target },
    { title: "SEO Strategy", prompt: "Explain the best local SEO strategy to capture Google Maps rankings for a high-end cafe.", icon: Search },
    { title: "Marketing Campaign", prompt: "Design a viral multi-channel marketing campaign focusing on visual drinks & local influencers.", icon: Instagram },
    { title: "Revenue Forecast", prompt: "Calculate a predicted revenue lift if website ordering and Reservation CRO are fully deployed.", icon: LineChart }
  ];

  const actionCards = [
    { id: 'growth_plan', label: '12-Month Growth Roadmap', icon: Target, desc: 'Localized expansion events & spatial tactics' },
    { id: 'seo_audit', label: 'Local SEO Audit & Strategy', icon: Search, desc: 'Maps indexing, ranking & citations playbook' },
    { id: 'gmb_audit', label: 'Google Business Profile Optimization', icon: Building, desc: 'Review speed, visual hygiene & maps strategy' },
    { id: 'website_audit', label: 'Website CRO recommendation', icon: Laptop, desc: 'Reservation engines, booking funnels & CRO' },
    { id: 'instagram_strategy', label: 'Instagram Social Booster', icon: Instagram, desc: 'Aesthetic beverage design & hook templates' },
    { id: 'marketing_plan', label: 'Multi-Channel Marketing Campaign', icon: Sparkles, desc: 'ROI budgeting & hyper-local ads setup' },
    { id: 'revenue_prediction', label: 'Revenue ROI Projection', icon: LineChart, desc: 'Predicted sales lift following visual overhaul' },
    { id: 'competitor_analysis', label: 'Competitor Benchmarking', icon: TrendingUp, desc: 'Uncover rating & digital score discrepancies' },
  ];

  const selectedCafe = cafes.find(c => c.id === selectedCafeId);

  // Markdown renderer helper
  const renderMarkdownText = (text: string) => {
    const lines = text.split('\n');
    return (
      <div className="space-y-3 font-sans text-xs text-white/85 leading-relaxed">
        {lines.map((line, idx) => {
          const trimmed = line.trim();
          if (!trimmed) return <div key={idx} className="h-2" />;

          if (trimmed.startsWith('###')) {
            return (
              <h4 key={idx} className="text-sm font-bold text-white mt-5 mb-2 font-mono uppercase border-b border-white/[0.06] pb-2 tracking-widest flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#7C5CFF]" />
                {trimmed.replace(/^###\s*/, '')}
              </h4>
            );
          }
          if (trimmed.startsWith('####')) {
            return (
              <h5 key={idx} className="text-xs font-bold text-[#4F8CFF] mt-4 mb-1.5 flex items-center gap-1.5 font-mono uppercase tracking-widest">
                {trimmed.replace(/^####\s*/, '')}
              </h5>
            );
          }
          if (trimmed.startsWith('-') || trimmed.startsWith('*')) {
            const content = trimmed.replace(/^[-*]\s*/, '');
            return (
              <div key={idx} className="flex gap-2 items-start pl-2">
                <span className="text-[#4F8CFF] font-mono mt-0.5"><ChevronRight className="w-3 h-3" /></span>
                <span>{parseBoldText(content)}</span>
              </div>
            );
          }
          return <p key={idx}>{parseBoldText(trimmed)}</p>;
        })}
      </div>
    );
  };

  const parseBoldText = (text: string) => {
    const parts = text.split(/\*\*([\s\S]*?)\*\*/g);
    return parts.map((part, i) => {
      if (i % 2 === 1) {
        return <strong key={i} className="text-[#4F8CFF] font-bold font-mono">{part}</strong>;
      }
      return part;
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-140px)] items-stretch">
      
      {/* LEFT PANEL: Chat History & Context Binders */}
      <div className="lg:col-span-3 flex flex-col gap-5 h-full overflow-y-auto pr-1">
        
        {/* Core Node Selector */}
        <div className="glass-panel rounded-2xl p-5 border border-white/[0.06] shadow-xl space-y-4">
          <div className="flex items-center gap-2 border-b border-white/[0.05] pb-3">
            <Cpu className="w-4 h-4 text-[#7C5CFF]" />
            <h3 className="font-serif italic text-base text-white">
              Client Node Context
            </h3>
          </div>

          <div className="space-y-1.5">
            <label className="block text-[8px] font-mono text-white/40 uppercase tracking-widest font-extrabold">
              Active Focus establishment
            </label>
            <select
              value={selectedCafeId}
              onChange={e => setSelectedCafeId(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#0E1117]/80 border border-white/[0.06] focus:border-[#4F8CFF]/50 rounded-xl text-xs text-white/80 focus:outline-none transition-all duration-300 font-mono cursor-pointer"
            >
              <option value="">-- No Specific Business (General Market) --</option>
              {cafes.map(cafe => (
                <option key={cafe.id} value={cafe.id}>
                  {cafe.name} ({cafe.area})
                </option>
              ))}
            </select>
          </div>

          {selectedCafe && (
            <div className="bg-[#141922]/40 border border-white/[0.05] rounded-xl p-3.5 space-y-3.5 animate-fadeIn">
              <div className="flex justify-between items-center border-b border-white/[0.05] pb-2">
                <span className="text-[9px] font-mono text-white/40 uppercase font-bold">Metrics Cache</span>
                <span className="text-[8px] font-mono text-[#4F8CFF] font-bold uppercase bg-[#4F8CFF]/10 px-2 py-0.5 rounded border border-[#4F8CFF]/20">{selectedCafe.category}</span>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-[8px] font-mono text-white/40 uppercase block font-semibold">PRESENCE INDEX</span>
                  <span className="text-lg font-space font-extrabold text-[#4F8CFF] block mt-0.5">{selectedCafe.digitalPresenceScore}</span>
                </div>
                <div>
                  <span className="text-[8px] font-mono text-white/40 uppercase block font-semibold">GROWTH OPTION</span>
                  <span className="text-lg font-space font-extrabold text-[#7C5CFF] block mt-0.5">{selectedCafe.growthOpportunityScore}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 border-t border-white/[0.04] pt-2.5 text-[9px] font-mono text-white/50">
                <MapPin className="w-3.5 h-3.5 text-white/20" />
                <span className="truncate">{selectedCafe.area}, {selectedCafe.city}</span>
              </div>
            </div>
          )}
        </div>

        {/* History Thread List */}
        <div className="glass-panel rounded-2xl p-4 border border-white/[0.06] shadow-xl flex-1 flex flex-col min-h-[220px] overflow-hidden">
          <div className="flex items-center justify-between border-b border-white/[0.05] pb-3 mb-3">
            <span className="text-[9px] font-mono font-bold text-white/40 uppercase tracking-widest flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-[#4F8CFF]" />
              Analysis Threads
            </span>
            <button
              onClick={createNewConversation}
              className="p-1.5 bg-white/[0.03] border border-white/[0.06] hover:border-[#4F8CFF]/40 text-white hover:text-[#4F8CFF] rounded-lg transition-all cursor-pointer"
              title="New Conversation"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
            {conversations.map(conv => {
              const isActive = conv.id === activeConvId;
              return (
                <div
                  key={conv.id}
                  onClick={() => setActiveConvId(conv.id)}
                  className={`flex items-center justify-between p-2.5 rounded-xl border transition-all cursor-pointer group ${
                    isActive
                      ? 'bg-[#7C5CFF]/10 border-[#7C5CFF]/30 text-white'
                      : 'bg-transparent border-transparent hover:bg-white/[0.02] text-white/60 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Bot className={`w-3.5 h-3.5 flex-shrink-0 ${isActive ? 'text-[#7C5CFF]' : 'text-white/30'}`} />
                    <span className="text-[10px] font-mono truncate font-semibold">
                      {conv.title}
                    </span>
                  </div>
                  {conversations.length > 1 && (
                    <button
                      onClick={(e) => deleteConversation(conv.id, e)}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:bg-[#EF4444]/10 hover:text-[#EF4444] rounded text-white/40 transition-all cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* CENTER & RIGHT: Chat Console & Action bento cards */}
      <div className="lg:col-span-6 flex flex-col h-full glass-panel rounded-2xl border border-white/[0.06] shadow-2xl overflow-hidden">
        
        {/* ChatGPT Style Header */}
        <div className="p-4 border-b border-white/[0.06] bg-[#0E1117]/85 backdrop-blur-md flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Bot className="w-5 h-5 text-[#7C5CFF]" />
            <div>
              <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest font-extrabold block">GeoVision Core Suite</span>
              <span className="text-xs font-semibold text-white">Neural Consultant Console</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2 px-2.5 py-1 bg-[#32D583]/10 border border-[#32D583]/20 rounded-full text-[9px] font-mono text-[#32D583] font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-[#32D583] animate-pulse" />
            SECURE LLM SESSION
          </div>
        </div>

        {/* Chat History Box */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gradient-to-b from-[#0A0E17]/20 to-transparent">
          {messages.map((message) => {
            const isAsst = message.sender === 'assistant';
            return (
              <div
                key={message.id}
                className={`flex gap-4 max-w-[85%] ${isAsst ? 'mr-auto' : 'ml-auto flex-row-reverse'}`}
              >
                {/* Visual Avatar */}
                <div className={`p-2 rounded-xl flex-shrink-0 border h-9 w-9 flex items-center justify-center shadow-lg ${
                  isAsst
                    ? 'bg-[#7C5CFF]/15 border-[#7C5CFF]/25 text-[#7C5CFF]'
                    : 'bg-[#4F8CFF]/15 border-[#4F8CFF]/25 text-[#4F8CFF]'
                }`}>
                  {isAsst ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                </div>

                {/* Text Bubble */}
                <div className={`rounded-2xl p-5 border text-xs shadow-md leading-relaxed ${
                  isAsst
                    ? 'bg-[#0E1117]/70 border-white/[0.05] text-white/95'
                    : 'bg-[#4F8CFF]/10 border-[#4F8CFF]/20 text-white font-mono'
                }`}>
                  {isAsst ? (
                    message.text ? renderMarkdownText(message.text) : (
                      <div className="flex items-center gap-2 text-white/40 font-mono text-[10px]">
                        <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#7C5CFF]" />
                        Formulating spatial marketing heuristics...
                      </div>
                    )
                  ) : (
                    <p className="whitespace-pre-wrap">{message.text}</p>
                  )}
                  <span className="block text-[8px] font-mono text-white/20 mt-3 text-right uppercase font-bold tracking-widest">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </span>
                </div>
              </div>
            );
          })}
          
          {loading && (
            <div className="flex gap-4 max-w-[85%] mr-auto">
              <div className="p-2 rounded-xl flex-shrink-0 border h-9 w-9 flex items-center justify-center bg-[#7C5CFF]/15 border-[#7C5CFF]/25 text-[#7C5CFF]">
                <Bot className="w-4 h-4" />
              </div>
              <div className="rounded-2xl p-4.5 bg-[#0E1117]/70 border border-white/[0.05] text-xs shadow-md">
                <div className="flex items-center gap-3 text-white/40 font-mono text-[10px]">
                  <div className="flex gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#7C5CFF] animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-[#7C5CFF] animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-[#7C5CFF] animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                  Synthesizing campaign roadmap...
                </div>
              </div>
            </div>
          )}
          
          <div ref={chatEndRef} />
        </div>

        {/* Suggested Prompts Section */}
        {messages.length === 1 && (
          <div className="px-6 py-4 bg-white/[0.01] border-t border-white/[0.05] space-y-3">
            <p className="text-[8px] font-mono uppercase tracking-widest text-white/30 font-bold">Suggested Analytical Prompts</p>
            <div className="grid grid-cols-2 gap-3">
              {suggestedPrompts.map((item, idx) => {
                const ItemIcon = item.icon;
                return (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(item.prompt)}
                    className="p-3 text-left bg-[#141922]/20 hover:bg-[#4F8CFF]/5 border border-white/[0.05] hover:border-[#4F8CFF]/25 rounded-xl transition-all duration-300 cursor-pointer group flex items-start gap-2.5"
                  >
                    <div className="p-1.5 bg-white/[0.02] border border-white/[0.06] rounded-lg text-white/40 group-hover:text-[#4F8CFF] transition-all flex-shrink-0">
                      <ItemIcon className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <span className="block text-[10px] font-mono font-bold text-white group-hover:text-[#4F8CFF] transition-colors">{item.title}</span>
                      <span className="block text-[8px] text-white/40 truncate max-w-[150px] mt-0.5">{item.prompt}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Input Tray */}
        <div className="p-4 border-t border-white/[0.06] bg-[#0E1117]/85 backdrop-blur-md">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex gap-3"
          >
            <input
              type="text"
              disabled={loading}
              placeholder={selectedCafe ? `Request custom expansion advice for "${selectedCafe.name}"...` : "Run general spatial benchmarking or market analysis..."}
              value={inputMessage}
              onChange={e => setInputMessage(e.target.value)}
              className="flex-1 px-4.5 py-3 bg-[#050505] border border-white/[0.06] focus:border-[#4F8CFF]/50 rounded-xl text-xs text-white placeholder-white/20 focus:outline-none transition-all duration-300 font-mono"
            />
            
            <button
              type="submit"
              disabled={loading || !inputMessage.trim()}
              className="p-3.5 bg-gradient-to-r from-[#4F8CFF] to-[#7C5CFF] text-white hover:opacity-95 rounded-xl transition-all shadow-lg active:scale-95 disabled:opacity-40 cursor-pointer flex-shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>

      </div>

      {/* RIGHT PANEL: Strategic Action Bento Board */}
      <div className="lg:col-span-3 flex flex-col h-full glass-panel rounded-2xl border border-white/[0.06] shadow-xl overflow-hidden p-5">
        <div className="border-b border-white/[0.05] pb-3.5 mb-4">
          <h4 className="text-[10px] font-mono font-bold text-white/40 uppercase tracking-widest flex items-center gap-1.5">
            <Award className="w-3.5 h-3.5 text-[#32D583]" />
            Targeted Strategic Actions
          </h4>
          <p className="text-[8px] font-mono text-white/30 mt-0.5">Click any audit vector to compute direct action plans</p>
        </div>

        <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
          {actionCards.map(card => {
            const CardIcon = card.icon;
            return (
              <button
                key={card.id}
                onClick={() => handleSendMessage('', card.id)}
                disabled={loading}
                className="w-full flex items-start gap-3 p-3 text-left bg-[#141922]/20 hover:bg-[#4F8CFF]/10 hover:border-[#4F8CFF]/30 border border-white/[0.04] rounded-xl group transition-all duration-300 disabled:opacity-50 cursor-pointer"
              >
                <div className="p-2 bg-white/[0.02] border border-white/[0.06] text-white/40 group-hover:text-[#4F8CFF] group-hover:border-[#4F8CFF]/25 rounded-lg transition-all">
                  <CardIcon className="w-4 h-4" />
                </div>
                <div>
                  <h5 className="text-[10px] font-mono font-extrabold text-white group-hover:text-[#4F8CFF] transition-all">
                    {card.label}
                  </h5>
                  <p className="text-[8px] text-white/30 mt-0.5 font-sans leading-tight">
                    {card.desc}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

    </div>
  );
}
