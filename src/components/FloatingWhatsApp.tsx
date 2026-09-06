import React, { useState } from 'react';
import { MessageSquare, X, Calendar, ArrowRight, Instagram, Bot, Sparkles } from 'lucide-react';
import { COMPANY_DETAILS } from '../data/properties';

interface FloatingWhatsAppProps {
  onOpenBooking: () => void;
  onOpenAIAdvisor?: () => void;
}

export const FloatingWhatsApp: React.FC<FloatingWhatsAppProps> = ({ onOpenBooking, onOpenAIAdvisor }) => {
  const [isOpen, setIsOpen] = useState(false);

  const directWhatsAppUrl = `https://wa.me/${COMPANY_DETAILS.whatsappNumber}?text=${encodeURIComponent('Hello AS Realty, I am interested in inquiring about your luxury real estate portfolio.')}`;

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-2.5">
      {/* Floating Popup Card */}
      {isOpen && (
        <div className="mb-2 w-80 p-4 rounded-2xl bg-white border border-slate-200 border-b-4 border-b-[#002347] shadow-2xl text-slate-800 animate-fadeIn">
          <div className="flex items-start justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-[#002347] text-[#E6C687] border border-[#C5A059]/40 flex items-center justify-center font-bold text-sm">
                AS
              </div>
              <div>
                <h4 className="text-sm font-serif-luxury font-bold text-[#002347]">
                  AS Realty Concierge
                </h4>
                <p className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Online & Active
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-slate-700 p-1 rounded-md cursor-pointer"
              aria-label="Close WhatsApp card"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-xs text-slate-600 my-3 leading-relaxed">
            Welcome to <strong className="text-[#002347]">AS Realty</strong>. Connect directly with our team under the leadership of <strong className="text-[#002347]">Amit Shivpeth</strong>.
          </p>

          <div className="space-y-2">
            {onOpenAIAdvisor && (
              <button
                onClick={() => {
                  setIsOpen(false);
                  onOpenAIAdvisor();
                }}
                className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-[#001730] to-[#002347] hover:from-[#002347] hover:to-[#001730] text-[#E6C687] border border-[#E6C687]/50 font-bold text-xs uppercase tracking-wider shadow-sm transition-all cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <Bot className="w-4 h-4 text-[#E6C687]" />
                  Ask AI Property Advisor
                </span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}

            <button
              onClick={() => {
                setIsOpen(false);
                onOpenBooking();
              }}
              className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-[#002347] hover:bg-[#001730] text-[#E6C687] border border-[#C5A059]/40 font-bold text-xs uppercase tracking-wider shadow-sm transition-all cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#C5A059]" />
                Schedule VIP Site Visit
              </span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            <a
              href={directWhatsAppUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-sm"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Direct Chat on WhatsApp</span>
            </a>

            <a
              id="floating-instagram-link"
              href="https://www.instagram.com/asrealty.official?igsi=MXhteGNhM3Y0YjBmcg=="
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-1.5 pt-1 text-[11px] font-semibold text-slate-500 hover:text-[#B8924B] transition-colors"
            >
              <Instagram className="w-3.5 h-3.5 text-[#B8924B]" />
              <span>Follow us: @asrealty.official</span>
            </a>
          </div>
        </div>
      )}

      {/* Floating Buttons Group */}
      <div className="flex items-center gap-2">
        {onOpenAIAdvisor && (
          <button
            id="floating-ai-advisor-trigger"
            onClick={onOpenAIAdvisor}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-full bg-gradient-to-r from-[#001730] via-[#002347] to-[#001730] text-[#E6C687] shadow-xl border border-[#E6C687]/60 hover:scale-105 active:scale-95 transition-all cursor-pointer group"
            title="Ask AI Property Advisor (Powered by Gemini)"
          >
            <Bot className="w-4 h-4 text-[#E6C687] group-hover:rotate-12 transition-transform" />
            <span className="text-xs font-semibold tracking-wide hidden sm:inline">
              Ask AI Advisor
            </span>
          </button>
        )}

        {/* Main Floating Trigger Button */}
        <button
          id="floating-whatsapp-trigger"
          onClick={() => setIsOpen(!isOpen)}
          className="group relative flex items-center gap-2.5 px-4 py-3 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-xl border border-emerald-400/40 hover:scale-105 active:scale-95 transition-all cursor-pointer"
          aria-label="Open WhatsApp options"
        >
          <div className="relative">
            <MessageSquare className="w-5 h-5 fill-white" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#C5A059] rounded-full border-2 border-[#002347] animate-ping" />
          </div>
          <span className="text-xs font-semibold tracking-wide hidden sm:inline">
            Chat on WhatsApp
          </span>
        </button>
      </div>
    </div>
  );
};

