import React from 'react';
import { Bot, Sparkles } from 'lucide-react';

interface FloatingWhatsAppProps {
  onOpenBooking?: () => void;
  onOpenAIAdvisor?: () => void;
}

export const FloatingWhatsApp: React.FC<FloatingWhatsAppProps> = ({ onOpenAIAdvisor }) => {
  if (!onOpenAIAdvisor) return null;

  return (
    <div className="fixed bottom-6 right-6 z-40">
      {/* Floating AI Concierge Button */}
      <button
        id="floating-ai-advisor-trigger"
        onClick={onOpenAIAdvisor}
        className="group relative flex items-center gap-2.5 px-4 py-3 rounded-full bg-gradient-to-r from-[#001730] via-[#002347] to-[#001730] text-[#E6C687] shadow-2xl border border-[#E6C687]/70 hover:border-[#E6C687] hover:scale-105 active:scale-95 transition-all cursor-pointer"
        title="Consult AS Realty AI Property Advisor"
        aria-label="Ask AI Concierge"
      >
        <div className="relative">
          <Bot className="w-5 h-5 text-[#E6C687] group-hover:rotate-12 transition-transform" />
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-[#E6C687] rounded-full animate-ping" />
        </div>
        <span className="text-xs font-semibold tracking-wider">
          Ask AI Concierge
        </span>
        <Sparkles className="w-3.5 h-3.5 text-[#C5A059]" />
      </button>
    </div>
  );
};

