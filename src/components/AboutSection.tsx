import React from 'react';
import { Shield, Award, Users, CheckCircle2, Building, ArrowUpRight, Lock, Sparkles } from 'lucide-react';
import { COMPANY_DETAILS } from '../data/properties';

interface AboutSectionProps {
  onOpenBooking: () => void;
}

export const AboutSection: React.FC<AboutSectionProps> = ({ onOpenBooking }) => {
  const pillars = [
    {
      icon: Shield,
      title: 'Uncompromised Due Diligence',
      description: 'Every estate under our representation undergoes forensic legal scrutiny, title chain verification, and strict RERA compliance audits prior to presentation.',
    },
    {
      icon: Lock,
      title: 'Absolute Discretion & Privacy',
      description: 'Serving royalty, industry captains, and ultra-HNIs with non-disclosure agreements, private chauffeur site visits, and confidential negotiations.',
    },
    {
      icon: Building,
      title: 'Direct Developer Alliances',
      description: 'Privileged direct boardroom access with India’s foremost real estate developers, unlocking premier floor allotments and preferred investment tranches.',
    },
    {
      icon: Sparkles,
      title: 'White-Glove Advisory',
      description: 'End-to-end guidance spanning portfolio acquisition, tax structuring, bespoke interior liaisons, and long-term asset management.',
    },
  ];

  return (
    <section id="about-us-section" className="py-12 sm:py-20 md:py-24 bg-white relative overflow-hidden border-t border-b border-slate-200">
      {/* Subtle geometric grid background */}
      <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#002347_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#002347] border border-[#C5A059]/40 text-[10px] sm:text-xs text-[#E6C687] uppercase tracking-widest font-semibold mb-2 sm:mb-3">
            Heritage & Distinction
          </div>
          <h2 className="text-2xl sm:text-4xl md:text-5xl font-serif-luxury font-bold text-[#002347] tracking-tight">
            About <span className="text-[#C5A059]">{COMPANY_DETAILS.name}</span>
          </h2>
          <p className="mt-2 sm:mt-3 text-xs sm:text-base text-slate-600 font-light leading-relaxed">
            Founded and spearheaded by <strong className="text-[#002347] font-semibold">{COMPANY_DETAILS.founder}</strong>, AS Realty is established on the cornerstone principles of trust, bespoke personal attention, and architectural pedigree.
          </p>
        </div>

        {/* Founder Focus Block */}
        <div id="founder-section" className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 lg:gap-12 items-center mb-10 sm:mb-20">
          {/* Portrait & Prestige Card */}
          <div className="lg:col-span-5">
            <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-white shadow-xl group border-b-4 border-b-[#002347] max-w-md mx-auto">
              <div className="aspect-[4/5] relative overflow-hidden bg-slate-900">
                <img
                  src="https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1200&q=80"
                  alt="Amit Shivpeth - AS Realty"
                  className="w-full h-full object-cover object-top filter brightness-95 contrast-105 group-hover:scale-102 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                {/* Overlaid Founder Tag */}
                <div className="absolute bottom-3 left-3 right-3 sm:bottom-6 sm:left-6 sm:right-6 p-3 sm:p-4 rounded-xl bg-white/95 backdrop-blur-md border border-slate-200 text-center shadow-lg border-b-4 border-b-[#002347]">
                  <h3 className="text-lg sm:text-2xl font-serif-luxury font-bold text-[#002347]">
                    {COMPANY_DETAILS.founder}
                  </h3>
                  <p className="text-[10px] sm:text-xs uppercase tracking-widest text-[#B8924B] font-semibold mt-0.5">
                    {COMPANY_DETAILS.title}
                  </p>
                  <p className="text-[10px] sm:text-[11px] text-slate-500 mt-0.5 sm:mt-1">
                    AS Realty — Defining Elite Living
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Founder Manifesto & Narrative */}
          <div className="lg:col-span-7 space-y-4 sm:space-y-6">
            <div className="space-y-3 sm:space-y-4 text-slate-700 text-xs sm:text-base leading-relaxed">
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-[#002347] block">
                Leadership Perspective
              </span>
              <h3 className="text-xl sm:text-2xl md:text-3xl font-serif-luxury font-bold text-[#002347]">
                "A true luxury residence is not merely square footage; it is a legacy crafted for generations."
              </h3>
              <p>
                Under the direct stewardship of <strong className="text-[#002347]">Amit Shivpeth</strong>, AS Realty was conceived to bring world-class luxury real estate advisory, transparency, and absolute transactional discretion specifically to Nagpur.
              </p>
              <p>
                Rather than acting as high-volume listing aggregators, AS Realty operates as a private family office for property acquisitions in Nagpur. We limit our active portfolio to an exclusive roster of trophy assets across Nagpur’s premier enclaves—including Civil Lines, Ramdaspeth, Dharampeth, Byramji Town, and Seminary Hills.
              </p>
              <p>
                Every client consultation is conducted personally by Amit Shivpeth, guaranteeing direct accountability, local market intelligence, and white-glove execution at every milestone.
              </p>
            </div>

            {/* Credential Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3 pt-3 sm:pt-4 border-t border-slate-200">
              <div className="p-2.5 sm:p-3.5 rounded-xl bg-[#F8F9FA] border border-slate-200">
                <span className="text-lg sm:text-2xl font-serif-luxury font-bold text-[#002347] block">15+</span>
                <span className="text-[11px] sm:text-xs text-slate-600">Years Industry Standing</span>
              </div>
              <div className="p-2.5 sm:p-3.5 rounded-xl bg-[#F8F9FA] border border-slate-200">
                <span className="text-lg sm:text-2xl font-serif-luxury font-bold text-[#002347] block">100%</span>
                <span className="text-[11px] sm:text-xs text-slate-600">MahaRERA Verified</span>
              </div>
              <div className="p-2.5 sm:p-3.5 rounded-xl bg-[#F8F9FA] border border-slate-200 col-span-2 sm:col-span-1">
                <span className="text-lg sm:text-2xl font-serif-luxury font-bold text-[#002347] block">₹250+ Cr</span>
                <span className="text-[11px] sm:text-xs text-slate-600">Nagpur Portfolio Value</span>
              </div>
            </div>

            {/* Direct Founder Booking CTA */}
            <div className="pt-2">
              <button
                onClick={onOpenBooking}
                className="flex items-center gap-2 px-4 py-2.5 sm:px-6 sm:py-3.5 rounded-xl bg-gradient-to-r from-[#C5A059] to-[#E6C687] hover:from-[#B8924B] hover:to-[#D9B97A] text-[#002347] font-bold text-[11px] sm:text-xs uppercase tracking-wider shadow-lg shadow-[#C5A059]/20 transition-all cursor-pointer"
              >
                <span>Schedule Consultation with Amit Shivpeth</span>
                <ArrowUpRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#002347]" />
              </button>
            </div>
          </div>
        </div>

        {/* 4 Pillars of Trust Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          {pillars.map((pillar, idx) => {
            const Icon = pillar.icon;
            return (
              <div
                key={idx}
                className="p-4 sm:p-6 rounded-2xl bg-[#F8F9FA] border border-slate-200 border-b-4 border-b-[#002347] hover:border-b-[#C5A059] transition-all group shadow-sm hover:shadow-md"
              >
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-[#002347] text-[#E6C687] flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 transition-transform shadow-sm">
                  <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <h4 className="text-base sm:text-lg font-serif-luxury font-bold text-[#002347] mb-1.5 sm:mb-2 group-hover:text-[#C5A059] transition-colors">
                  {pillar.title}
                </h4>
                <p className="text-[11px] sm:text-xs text-slate-600 leading-relaxed">
                  {pillar.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
