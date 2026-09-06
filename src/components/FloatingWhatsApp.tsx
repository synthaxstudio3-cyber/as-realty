import React from 'react';
import { Mic, Sparkles } from 'lucide-react';

interface FloatingWhatsAppProps {
  onOpenBooking?: () => void;
  onOpenAIAdvisor?: () => void;
}

export const FloatingWhatsApp: React.FC<FloatingWhatsAppProps> = ({ onOpenAIAdvisor }) => {
  if (!onOpenAIAdvisor) return null;

  return (
    <div className="fixed bottom-6 right-6 z-40">
      {/* Floating AI Voice Advisor Button */}
      <button
        id="floating-ai-advisor-trigger"
        onClick={onOpenAIAdvisor}
        className="group relative flex items-center gap-2.5 px-4 py-3 rounded-full bg-gradient-to-r from-[#001730] via-[#002347] to-[#001730] text-[#E6C687] shadow-2xl border border-[#E6C687]/70 hover:border-[#E6C687] hover:scale-105 active:scale-95 transition-all cursor-pointer"
        title="Consult AS Realty AI Voice Advisor in Hinglish"
        aria-label="Ask AI Voice Advisor"
      >
        <div className="relative">
          <Mic className="w-5 h-5 text-[#E6C687] group-hover:scale-110 transition-transform animate-pulse" />
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-400 rounded-full animate-ping" />
        </div>
        <span className="text-xs font-semibold tracking-wider">
          AI Voice Advisor
        </span>
        <span className="px-1.5 py-0.5 rounded text-[9px] uppercase font-bold bg-[#C5A059]/30 text-[#E6C687] border border-[#C5A059]/50">
          Hinglish Voice
        </span>
      </button>
    </div>
  );
};

