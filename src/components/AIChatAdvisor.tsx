import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, 
  Send, 
  Sparkles, 
  ShieldCheck, 
  Clock, 
  RotateCcw, 
  X, 
  Maximize2, 
  Minimize2, 
  MessageSquare, 
  Zap, 
  Layers, 
  Building, 
  ChevronRight,
  PhoneCall,
  Trees,
  Compass,
  Mic,
  Languages,
  Database
} from 'lucide-react';
import { COMPANY_DETAILS } from '../data/properties';
import { LiveVoiceAdvisor } from './LiveVoiceAdvisor';
import { useAuth } from '../contexts/AuthContext';
import { logVoiceSessionToSupabase } from '../lib/supabase';

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
  modelUsed?: string;
}

interface AIChatAdvisorProps {
  isOpen?: boolean;
  onClose?: () => void;
  onOpenBooking?: (propertyName?: string) => void;
  onOpenAuth?: (mode?: 'signin' | 'signup') => void;
  isEmbedded?: boolean;
  initialTab?: 'text' | 'voice';
}

const SUGGESTED_PROMPTS = [
  {
    icon: Building,
    label: 'Nagpur Investment Potential (Hinglish/Eng)',
    prompt: 'Nagpur mein real estate invest karne ke kya benefits hain? Why is Nagpur property market booming right now compared to tier-1 metros?',
  },
  {
    icon: ShieldCheck,
    label: '100% Legal Safety & MahaRERA Trust',
    prompt: 'AS Realty property verification kaise karta hai? How do you guarantee 100% clear 7/12 land records, MahaRERA compliance, and title safety under Amit Shivpeth?',
  },
  {
    icon: Compass,
    label: 'NMRDA Sanctioned Plots (Besa & MIHAN)',
    prompt: 'Besa, MIHAN aur Hingna corridor mein best NMRDA & RL sanctioned plots kaunse hain? Please share current rates and layout approvals.',
  },
  {
    icon: Clock,
    label: 'AS Realty Bespoke VIP Services',
    prompt: 'AS Realty kaunsi bespoke services provide karta hai? Tell me about your complimentary VIP chauffeur site visits, 0% brokerage, and legal documentation.',
  },
  {
    icon: Trees,
    label: 'Farmland & Orange Orchards (Pench/Katol)',
    prompt: 'Pench, Katol aur Umred corridor mein agricultural farmland aur farmhouse plots ke details aur 7/12 revenue titles ke bare mein batayein.',
  },
];

export const AIChatAdvisor: React.FC<AIChatAdvisorProps> = ({
  isOpen = true,
  onClose,
  onOpenBooking,
  onOpenAuth,
  isEmbedded = false,
  initialTab = 'voice',
}) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'text' | 'voice'>(initialTab);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'initial-welcome',
      role: 'model',
      text: `Namaste & Welcome. Main **AS Realty ka Senior Luxury Property Advisor** hoon, under the direct leadership of founding director **Amit Shivpeth**.

Aap mujhse **Hinglish (Hindi + English)** ya English mein consult kar sakte hain. Main aapki guidance ke liye taiyar hoon:
• **High-ROI Investment in Nagpur**: Samruddhi Mahamarg, MIHAN SEZ aur Metro expansion ke saath capital appreciation insights.
• **Curated Portfolio**: Luxury penthouses in Civil Lines & Dharampeth, NMRDA sanctioned plots in Besa & MIHAN, aur Pench farmland estates.
• **100% Legal Title Due Diligence**: 30-year statutory title search, 7/12 & 8A land revenue vetting aur complete MahaRERA compliance.
• **White-Glove VIP Services**: Private chauffeur site visits, preferred banking, aur 0% brokerage on primary developer inventory.

Aap upar **"Live Voice Advisor (Hinglish)"** tab se real-time voice mein bhi directly baat kar sakte hain! Aap aaj kis property ya corridor ke baare mein jaanna chahenge?`,
      timestamp: new Date(),
    },
  ]);

  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [modelSpeed, setModelSpeed] = useState<'general' | 'complex' | 'fast'>('general');
  const [isExpanded, setIsExpanded] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputMessage).trim();
    if (!query || isLoading) return;

    const userMessageId = `user-${Date.now()}`;
    const newUserMessage: ChatMessage = {
      id: userMessageId,
      role: 'user',
      text: query,
      timestamp: new Date(),
    };

    // Update conversation thread
    setMessages((prev) => [...prev, newUserMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Build conversation history for multi-turn chat
      const historyPayload = messages.map((m) => ({
        role: m.role,
        text: m.text,
      }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          history: historyPayload,
          modelSpeed: modelSpeed,
        }),
      });

      if (!res.ok) {
        throw new Error(`Server responded with status: ${res.status}`);
      }

      const data = await res.json();
      const modelReply = data.reply || 'Thank you for your inquiry. Our senior concierge will assist you promptly.';

      setMessages((prev) => [
        ...prev,
        {
          id: `model-${Date.now()}`,
          role: 'model',
          text: modelReply,
          timestamp: new Date(),
          modelUsed: data.modelUsed,
        },
      ]);

      // Log text chat interaction to Supabase asynchronously
      logVoiceSessionToSupabase({
        user_id: user?.id || null,
        user_email: user?.email || null,
        user_name: user?.fullName || 'Client',
        query_text: query,
        response_text: modelReply,
        voice_engine: 'text-chat',
      });
    } catch (err) {
      console.error('Error communicating with AI advisor:', err);
      setMessages((prev) => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          role: 'model',
          text: `At **AS Realty**, your trust and investment security come first.

Under the guidance of **Amit Shivpeth**, we personally scrutinize every project with a 30-year title verification, strict MahaRERA approval, and zero hidden costs.

To receive an immediate personalized consultation and schedule a VIP chauffeur site visit, please reach out directly:
• **WhatsApp / Call**: **${COMPANY_DETAILS.phoneDisplay}**
• **Email**: **${COMPANY_DETAILS.email}**
• **Instagram**: **@asrealty.official**`,
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        role: 'model',
        text: `Welcome back. I am your **AS Realty Luxury Property Advisor**. How may I guide you on Nagpur's finest residential developments, plots, or farmland investments today?`,
        timestamp: new Date(),
      },
    ]);
  };

  // Quick formatted text renderer
  const renderFormattedText = (text: string) => {
    const lines = text.split('\n');
    return (
      <div className="space-y-2 text-xs sm:text-sm leading-relaxed">
        {lines.map((line, idx) => {
          if (!line.trim()) {
            return <div key={idx} className="h-1" />;
          }

          // Bullet points
          if (line.startsWith('• ') || line.startsWith('- ') || line.startsWith('* ')) {
            const clean = line.replace(/^[•\-*]\s+/, '');
            return (
              <div key={idx} className="flex items-start gap-2 pl-1">
                <span className="text-[#C5A059] font-bold shrink-0 mt-0.5">•</span>
                <span>{renderInlineMarkdown(clean)}</span>
              </div>
            );
          }

          // Numbered items (1. 2. etc.)
          if (/^\d+\.\s+/.test(line)) {
            const match = line.match(/^(\d+\.)\s+(.*)/);
            if (match) {
              return (
                <div key={idx} className="flex items-start gap-2 pl-1">
                  <span className="text-[#002347] font-bold text-[11px] px-1.5 py-0.5 bg-slate-100 rounded shrink-0">
                    {match[1]}
                  </span>
                  <span>{renderInlineMarkdown(match[2])}</span>
                </div>
              );
            }
          }

          return <p key={idx}>{renderInlineMarkdown(line)}</p>;
        })}
      </div>
    );
  };

  // Helper for bold formatting
  const renderInlineMarkdown = (line: string) => {
    const parts = line.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={i} className="font-semibold text-[#002347]">
            {part.slice(2, -2)}
          </strong>
        );
      }
      return part;
    });
  };

  if (!isOpen && !isEmbedded) return null;

  return (
    <div
      id="as-realty-ai-advisor"
      className={`flex flex-col bg-white border border-slate-200/90 shadow-2xl transition-all duration-300 overflow-hidden ${
        isEmbedded
          ? 'w-full rounded-2xl border-slate-300'
          : `fixed z-50 bottom-24 right-4 sm:right-6 ${
              isExpanded
                ? 'w-[calc(100vw-32px)] sm:w-[650px] h-[calc(100vh-140px)] max-h-[750px] rounded-2xl'
                : 'w-[calc(100vw-32px)] sm:w-[460px] h-[600px] max-h-[85vh] rounded-2xl'
            }`
      }`}
    >
      {/* Header */}
      <div className="px-4 py-3 bg-gradient-to-r from-[#002347] via-[#001730] to-[#002347] text-white flex items-center justify-between border-b border-[#C5A059]/30 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#002347] to-[#001224] border border-[#C5A059] flex items-center justify-center text-[#E6C687] shadow-inner">
              <Bot className="w-5 h-5 text-[#E6C687]" />
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-[#002347]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="text-sm font-bold tracking-wide text-white">AS Realty AI Advisor</h3>
              <span className="px-1.5 py-0.2 text-[9px] uppercase font-bold rounded bg-[#C5A059]/20 text-[#E6C687] border border-[#C5A059]/40">
                Hinglish + Eng
              </span>
            </div>
            <p className="text-[10px] text-slate-300 font-medium">
              Directed by <span className="text-[#E6C687]">Amit Shivpeth</span> • 100% Verified
            </p>
          </div>
        </div>

        {/* Top Controls */}
        <div className="flex items-center gap-1">
          {activeTab === 'text' && (
            <button
              onClick={handleResetChat}
              title="Reset conversation"
              className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}

          {!isEmbedded && (
            <>
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                title={isExpanded ? 'Collapse' : 'Expand'}
                className="hidden sm:block p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
              </button>
              {onClose && (
                <button
                  onClick={onClose}
                  title="Close AI Advisor"
                  className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Mode Switcher Tabs (AI Voice Advisor [Default] vs Text Chat) */}
      <div className="px-3 py-1.5 bg-[#001730] border-b border-[#C5A059]/20 flex items-center justify-between gap-2 shrink-0">
        <div className="flex items-center gap-1.5 w-full">
          <button
            onClick={() => setActiveTab('voice')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'voice'
                ? 'bg-gradient-to-r from-[#C5A059] to-[#E6C687] text-[#002347] shadow-sm font-bold ring-1 ring-[#FFF5DC]/50'
                : 'text-slate-300 hover:text-white hover:bg-white/5 border border-transparent'
            }`}
          >
            <Mic className={`w-3.5 h-3.5 ${activeTab === 'voice' ? 'text-[#002347] animate-pulse' : 'text-[#E6C687]'}`} />
            <span>AI Voice (Default)</span>
            <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider ${
              activeTab === 'voice' ? 'bg-[#002347] text-[#E6C687]' : 'bg-[#C5A059]/20 text-[#E6C687]'
            }`}>
              Hinglish
            </span>
          </button>

          <button
            onClick={() => setActiveTab('text')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'text'
                ? 'bg-[#002347] border border-[#C5A059]/50 text-[#E6C687] shadow-sm font-bold'
                : 'text-slate-300 hover:text-white hover:bg-white/5 border border-transparent'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5 text-[#E6C687]" />
            <span>Switch to Text Chat</span>
          </button>
        </div>
      </div>

      {/* Conditionally Render Voice Room or Chat Room */}
      {activeTab === 'voice' ? (
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 bg-[#001224]">
          <LiveVoiceAdvisor
            onOpenBooking={onOpenBooking}
            onSwitchToChat={() => setActiveTab('text')}
            onOpenAuth={onOpenAuth}
            isCompact={!isExpanded && !isEmbedded}
          />
        </div>
      ) : (
        <>
          {/* Model & Trust Selector Bar */}
          <div className="px-4 py-2 bg-[#F8F9FA] border-b border-slate-200 flex items-center justify-between text-xs text-slate-600 shrink-0">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Speed:</span>
              <div className="inline-flex rounded-lg p-0.5 bg-slate-200/80 border border-slate-300">
                <button
                  onClick={() => setModelSpeed('general')}
                  className={`px-2 py-0.5 rounded text-[11px] font-medium transition-all ${
                    modelSpeed === 'general'
                      ? 'bg-[#002347] text-[#E6C687] shadow-sm font-semibold'
                      : 'text-slate-600 hover:text-[#002347]'
                  }`}
                  title="gemini-3.5-flash for balanced property consultation"
                >
                  General
                </button>
                <button
                  onClick={() => setModelSpeed('complex')}
                  className={`px-2 py-0.5 rounded text-[11px] font-medium transition-all ${
                    modelSpeed === 'complex'
                      ? 'bg-[#002347] text-[#E6C687] shadow-sm font-semibold'
                      : 'text-slate-600 hover:text-[#002347]'
                  }`}
                  title="gemini-3.1-pro-preview for complex investment analysis"
                >
                  Deep
                </button>
                <button
                  onClick={() => setModelSpeed('fast')}
                  className={`px-2 py-0.5 rounded text-[11px] font-medium transition-all ${
                    modelSpeed === 'fast'
                      ? 'bg-[#002347] text-[#E6C687] shadow-sm font-semibold'
                      : 'text-slate-600 hover:text-[#002347]'
                  }`}
                  title="gemini-3.1-flash-lite for instant rapid answers"
                >
                  Fast
                </button>
              </div>
            </div>

            <div className="hidden sm:flex items-center gap-1 text-[11px] text-emerald-700 font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>MahaRERA &amp; 7/12 Scrutinized</span>
            </div>
          </div>

      {/* Scrollable Message Thread */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id}
              className={`flex items-start gap-2.5 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
            >
              {!isUser && (
                <div className="w-8 h-8 rounded-lg bg-[#002347] border border-[#C5A059] flex items-center justify-center text-[#E6C687] shrink-0 mt-0.5 shadow-sm">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs sm:text-sm shadow-sm transition-all ${
                  isUser
                    ? 'bg-[#002347] text-white rounded-tr-none'
                    : 'bg-white border border-slate-200/90 text-slate-800 rounded-tl-none'
                }`}
              >
                {!isUser ? (
                  renderFormattedText(msg.text)
                ) : (
                  <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                )}

                <div
                  className={`mt-2 flex items-center justify-between gap-2 text-[10px] ${
                    isUser ? 'text-slate-300' : 'text-slate-400'
                  }`}
                >
                  <span>
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  {!isUser && msg.modelUsed && (
                    <span className="font-mono text-[9px] px-1 py-0.2 rounded bg-slate-100 text-slate-500">
                      {msg.modelUsed}
                    </span>
                  )}
                </div>

                {/* Contextual Action Buttons in Model Response */}
                {!isUser && msg.id !== 'initial-welcome' && (
                  <div className="mt-3 pt-2.5 border-t border-slate-100 flex flex-wrap items-center gap-2">
                    <a
                      href={`https://wa.me/${COMPANY_DETAILS.whatsappNumber}?text=${encodeURIComponent(
                        'Hello Amit Shivpeth, I was speaking with your AI Advisor regarding Nagpur properties and would like to connect directly.'
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-[11px] shadow-sm transition-all"
                    >
                      <MessageSquare className="w-3 h-3" />
                      <span>Schedule on WhatsApp</span>
                    </a>

                    {onOpenBooking && (
                      <button
                        onClick={() => onOpenBooking()}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#002347] hover:bg-[#001730] text-[#E6C687] font-semibold text-[11px] shadow-sm transition-all cursor-pointer"
                      >
                        <PhoneCall className="w-3 h-3" />
                        <span>Book VIP Site Visit</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex items-start gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#002347] border border-[#C5A059] flex items-center justify-center text-[#E6C687] shrink-0 shadow-sm animate-pulse">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-none px-4 py-3 shadow-sm">
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <span className="w-2 h-2 rounded-full bg-[#C5A059] animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 rounded-full bg-[#002347] animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 rounded-full bg-[#C5A059] animate-bounce" style={{ animationDelay: '300ms' }} />
                <span className="ml-2 font-medium text-[11px] text-slate-600">
                  AS Realty Advisor analyzing Nagpur market data...
                </span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Prompt Chips (Scrollable horizontally) */}
      <div className="px-3 py-2 bg-slate-100/80 border-t border-slate-200 overflow-x-auto shrink-0 flex items-center gap-2 no-scrollbar">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 whitespace-nowrap flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-[#C5A059]" />
          Topics:
        </span>
        {SUGGESTED_PROMPTS.map((item, idx) => {
          const Icon = item.icon;
          return (
            <button
              key={idx}
              onClick={() => handleSendMessage(item.prompt)}
              disabled={isLoading}
              className="px-2.5 py-1 rounded-lg bg-white border border-slate-300 hover:border-[#C5A059] text-[11px] font-medium text-slate-700 hover:text-[#002347] whitespace-nowrap transition-all shadow-2xs hover:shadow-xs flex items-center gap-1.5 shrink-0 cursor-pointer disabled:opacity-50"
            >
              <Icon className="w-3 h-3 text-[#C5A059]" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="p-3 bg-white border-t border-slate-200 flex items-center gap-2 shrink-0"
      >
        <input
          ref={inputRef}
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder="Ask about properties, legal titles, VIP site visits, or services..."
          disabled={isLoading}
          className="flex-1 px-3.5 py-2.5 bg-[#F8F9FA] border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:border-[#C5A059] focus:bg-white transition-all placeholder:text-slate-400"
        />
        <button
          type="submit"
          disabled={isLoading || !inputMessage.trim()}
          className="h-[42px] px-4 rounded-xl bg-[#002347] hover:bg-[#001730] text-[#E6C687] font-bold text-xs uppercase tracking-wider shadow-sm hover:shadow transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 shrink-0 cursor-pointer"
        >
          <Send className="w-4 h-4" />
          <span className="hidden sm:inline">Send</span>
        </button>
      </form>
      </>
      )}
    </div>
  );
};
