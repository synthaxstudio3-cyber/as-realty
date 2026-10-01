import React from 'react';
import { Building, Shield, Award, Calendar, ArrowRight, Sparkles } from 'lucide-react';
import { FilterState } from '../types';
import { COMPANY_DETAILS } from '../data/properties';

interface HeroProps {
  filters?: FilterState;
  onFilterChange?: (newFilters: Partial<FilterState>) => void;
  onSearchSubmit?: () => void;
  onOpenBooking: () => void;
}

export const Hero: React.FC<HeroProps> = ({
  onOpenBooking,
}) => {
  return (
    <section id="hero-section" className="relative pt-32 pb-20 md:pt-40 md:pb-32 overflow-hidden">
      {/* Background Architectural Luxury Image & Scrim */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=2000&q=85"
          alt="Luxury Architecture AS Realty"
          className="w-full h-full object-cover object-center scale-105 filter brightness-[0.38] contrast-[1.08]"
        />
        {/* Deep Editorial Navy and Gold Ambient Vignette */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#002347] via-[#002347]/90 to-[#002347]/75" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#002347] via-transparent to-[#002347]/65" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Prestige Pill */}
        <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-[#001730]/90 border border-[#C5A059]/50 backdrop-blur-md mb-6 shadow-lg">
          <Sparkles className="w-3.5 h-3.5 text-[#E6C687]" />
          <span className="text-xs uppercase tracking-widest text-[#E6C687] font-semibold">
            Nagpur Premier Real Estate Advisory
          </span>
          <span className="w-1 h-1 rounded-full bg-[#C5A059]" />
          <span className="text-xs text-slate-200 font-medium">Amit Shivpeth</span>
        </div>

        {/* High-Impact Headline */}
        <div className="max-w-3xl">
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-serif-luxury font-bold text-white tracking-tight leading-[1.08]">
            Defining Elite Living in <span className="italic font-normal text-transparent bg-clip-text bg-gradient-to-r from-[#E6C687] via-[#D4AF37] to-[#C5A059]">Nagpur</span>
          </h1>

          <p className="mt-5 text-base sm:text-lg md:text-xl text-slate-200 font-light leading-relaxed max-w-2xl">
            Curating Nagpur’s most prestigious architectural marvels, sky penthouses, and bespoke private estates across Civil Lines, Ramdaspeth, and Dharampeth.
          </p>
        </div>

        {/* Primary Action Buttons */}
        <div className="mt-8 flex flex-wrap items-center gap-4">
          <button
            id="hero-schedule-visit-btn"
            onClick={onOpenBooking}
            className="flex items-center gap-2.5 px-7 py-4 rounded-xl bg-gradient-to-r from-[#C5A059] via-[#D4AF37] to-[#E6C687] hover:from-[#B8924B] hover:to-[#D9B97A] text-[#002347] font-bold text-sm tracking-wider uppercase shadow-xl shadow-[#C5A059]/25 transition-all transform active:scale-95 cursor-pointer"
          >
            <Calendar className="w-4 h-4 text-[#002347]" />
            <span>Schedule VIP Site Visit</span>
          </button>

          <a
            href="#featured-properties-section"
            className="flex items-center gap-2 px-6 py-4 rounded-xl bg-[#001730]/85 hover:bg-[#001730] border border-[#C5A059]/40 text-white font-medium text-sm tracking-wider transition-all"
          >
            <span>Explore Nagpur Portfolio</span>
            <ArrowRight className="w-4 h-4 text-[#E6C687]" />
          </a>

          <a
            href="#due-diligence-section"
            className="flex items-center gap-2 px-6 py-4 rounded-xl bg-[#001730]/90 hover:bg-[#002347] border border-[#E6C687]/60 text-[#E6C687] font-semibold text-sm tracking-wider shadow-lg transition-all cursor-pointer group"
          >
            <Shield className="w-4 h-4 text-[#E6C687] group-hover:scale-110 transition-transform" />
            <span>Legal Due Diligence</span>
          </a>
        </div>

        {/* High-Status Trust Metrics Bar */}
        <div className="mt-14 grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 pt-8 border-t border-white/15 text-slate-200">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#001730] border border-[#C5A059]/40 text-[#E6C687] shrink-0">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <p className="text-lg sm:text-xl font-serif-luxury font-bold text-white">100% MahaRERA</p>
              <p className="text-xs text-slate-300">Nagpur Verified Title Records</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#001730] border border-[#C5A059]/40 text-[#E6C687] shrink-0">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <p className="text-lg sm:text-xl font-serif-luxury font-bold text-white">₹250+ Cr</p>
              <p className="text-xs text-slate-300">Curated Nagpur Prime Portfolio</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#001730] border border-[#C5A059]/40 text-[#E6C687] shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <p className="text-lg sm:text-xl font-serif-luxury font-bold text-white">Nagpur Exclusive</p>
              <p className="text-xs text-slate-300">Bespoke HNI Advisory Desk</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#001730] border border-[#C5A059]/40 text-[#E6C687] shrink-0">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <p className="text-lg sm:text-xl font-serif-luxury font-bold text-white">Direct Scheduling</p>
              <p className="text-xs text-slate-300">VIP Nagpur Site Visits</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
