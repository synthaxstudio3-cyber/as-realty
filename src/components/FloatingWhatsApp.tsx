import React, { useState, useEffect } from 'react';
import { MessageSquare, Calendar, Sparkles, X, ChevronUp, Key } from 'lucide-react';
import { COMPANY_DETAILS } from '../data/properties';

interface FloatingWhatsAppProps {
  onOpenBooking?: () => void;
  onOpenSellProperty?: () => void;
}

export const FloatingWhatsApp: React.FC<FloatingWhatsAppProps> = ({
  onOpenBooking,
  onOpenSellProperty,
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    // Entrance animation trigger once page finishes loading
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 600);

    return () => clearTimeout(timer);
  }, []);

  const defaultWhatsAppUrl = `https://wa.me/${COMPANY_DETAILS.whatsappNumber}?text=${encodeURIComponent(
    'Hello Amit Shivpeth, I would like to inquire about premier luxury properties in Nagpur with AS Realty.'
  )}`;

  return (
    <div
      id="floating-whatsapp-container"
      className={`fixed bottom-6 left-6 z-40 transition-all duration-700 ease-out transform ${
        isLoaded
          ? 'opacity-100 translate-y-0 scale-100 pointer-events-auto'
          : 'opacity-0 translate-y-8 scale-95 pointer-events-none'
      }`}
    >
      {/* Quick Action Popover Card */}
      {isMenuOpen && (
        <div
          id="floating-whatsapp-popover"
          className="absolute bottom-16 left-0 w-72 rounded-2xl bg-gradient-to-b from-[#001730] to-[#002347] border border-[#C5A059]/40 shadow-2xl p-4 text-white mb-2 animate-in fade-in slide-in-from-bottom-3 duration-200"
        >
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#C5A059]/20">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400">
                <MessageSquare className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold tracking-wide text-white">AS Realty Direct Concierge</p>
                <p className="text-[10px] text-emerald-400 font-medium flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Amit Shivpeth Online
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsMenuOpen(false)}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              title="Close menu"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed mb-3">
            Connect directly with Nagpur’s luxury property specialist for private viewings and verified titles.
          </p>

          <div className="space-y-2">
            <a
              id="floating-direct-wa-btn"
              href={defaultWhatsAppUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setIsMenuOpen(false)}
              className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-all shadow-md group cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-emerald-100 group-hover:scale-110 transition-transform" />
                <span>Chat on WhatsApp</span>
              </span>
              <span className="text-[10px] text-emerald-200 uppercase font-bold">Direct</span>
            </a>

            {onOpenBooking && (
              <button
                id="floating-book-visit-btn"
                onClick={() => {
                  setIsMenuOpen(false);
                  onOpenBooking();
                }}
                className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-[#001730] hover:bg-[#002347] border border-[#C5A059]/40 text-[#E6C687] font-semibold text-xs transition-all shadow-sm cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[#C5A059]" />
                  <span>Book VIP Site Visit</span>
                </span>
                <span className="text-[10px] text-[#C5A059] uppercase font-bold">Chauffeur</span>
              </button>
            )}

            {onOpenSellProperty && (
              <button
                id="floating-sell-property-btn"
                onClick={() => {
                  setIsMenuOpen(false);
                  onOpenSellProperty();
                }}
                className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-[#001224] hover:bg-[#001f3f] border border-[#E6C687]/40 text-[#E6C687] hover:text-white font-semibold text-xs transition-all shadow-sm cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <Key className="w-4 h-4 text-[#C5A059]" />
                  <span>Sell Your Property</span>
                </span>
                <span className="text-[10px] text-[#E6C687] uppercase font-bold">List</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Main Floating Trigger Button */}
      <div className="relative group">
        {/* Subtle Ambient Pulse Glow for gentle attention */}
        <span className="absolute -inset-1 rounded-full bg-gradient-to-r from-emerald-500/30 via-[#C5A059]/30 to-emerald-500/30 blur-sm opacity-60 group-hover:opacity-100 transition duration-500 animate-pulse" />

        <div className="relative flex items-center">
          {/* Main WhatsApp Direct Consultation Pill Button */}
          <a
            id="floating-whatsapp-trigger"
            href={defaultWhatsAppUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2.5 pl-4 pr-3.5 py-3 rounded-full bg-gradient-to-r from-[#001730] via-[#002347] to-[#001730] text-[#E6C687] shadow-2xl border border-[#E6C687]/70 hover:border-[#E6C687] hover:scale-105 active:scale-95 transition-all cursor-pointer"
            title="Chat with Amit Shivpeth on WhatsApp (+91 87883 75434)"
            aria-label="Chat on WhatsApp"
          >
            {/* Green WhatsApp / Live Status Indicator */}
            <div className="relative flex items-center justify-center">
              <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-white shadow-md group-hover:scale-110 transition-transform">
                <MessageSquare className="w-4 h-4 fill-white" />
              </div>
              <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400" />
              </span>
            </div>

            <div className="flex flex-col text-left">
              <span className="text-xs font-bold tracking-wide text-white group-hover:text-[#E6C687] transition-colors">
                Chat on WhatsApp
              </span>
              <span className="text-[10px] text-slate-300 font-normal">
                Amit Shivpeth • <span className="text-emerald-400 font-semibold">Online</span>
              </span>
            </div>

            <span className="ml-1 px-1.5 py-0.5 rounded text-[9px] uppercase font-bold bg-[#C5A059]/25 text-[#E6C687] border border-[#C5A059]/40">
              VIP
            </span>
          </a>

          {/* Quick Options Chevron Toggle */}
          <button
            id="floating-whatsapp-options-toggle"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsMenuOpen((prev) => !prev);
            }}
            className="ml-1 p-2 rounded-full bg-[#001730] hover:bg-[#002347] border border-[#E6C687]/50 text-[#E6C687] hover:text-white transition-all shadow-lg cursor-pointer"
            title="More contact and visit options"
            aria-label="More contact options"
          >
            <ChevronUp className={`w-3.5 h-3.5 transition-transform duration-200 ${isMenuOpen ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>
    </div>
  );
};
