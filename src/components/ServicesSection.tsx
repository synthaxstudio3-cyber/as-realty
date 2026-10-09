import React from 'react';
import { Car, Briefcase, Globe2, Compass, ArrowRight, ShieldCheck, PhoneCall, Key } from 'lucide-react';
import { COMPANY_DETAILS } from '../data/properties';

interface ServicesSectionProps {
  onOpenBooking: () => void;
  onOpenSellProperty?: () => void;
}

export const ServicesSection: React.FC<ServicesSectionProps> = ({ onOpenBooking, onOpenSellProperty }) => {
  const services = [
    {
      icon: Car,
      tag: 'White Glove Hospitality',
      title: 'Chauffeur-Driven VIP Site Visits',
      description: 'Experience property viewings in complete comfort. We coordinate discreet luxury Mercedes/BMW transfers with private site escorts and dedicated property walkthroughs.',
    },
    {
      icon: Globe2,
      tag: 'Cross-Border Advisory',
      title: 'NRI & Global Investor Concierge',
      description: 'Seamless repatriation compliance, FEMA / RBI regulations, power-of-attorney execution, and end-to-end digital documentation for non-resident Indian investors.',
    },
    {
      icon: Briefcase,
      tag: 'Capital Management',
      title: 'HNI Real Estate Portfolio Advisory',
      description: 'Strategic asset rebalancing, rental yield optimization, capital gains structuring, and pre-launch anchor allotments directly with prime developers.',
    },
    {
      icon: Compass,
      tag: 'Bespoke Turnkey',
      title: 'Architectural & Interior Curation',
      description: 'Liaison with India and Milan’s premier interior architectural ateliers, high-end automated home tech integrators, and luxury landscape artists.',
    },
  ];

  return (
    <section id="services-section" className="py-10 sm:py-16 md:py-20 bg-[#F8F9FA] relative">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 sm:mb-12 gap-3 sm:gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5 sm:mb-2">
              <span className="w-6 sm:w-8 h-[2px] bg-[#C5A059]" />
              <span className="text-[10px] sm:text-xs uppercase tracking-widest text-[#002347] font-bold">
                Tailored Privileges
              </span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-serif-luxury font-bold text-[#002347] tracking-tight">
              Bespoke Client Services
            </h2>
            <p className="text-slate-600 text-xs sm:text-sm mt-1 max-w-xl">
              From your initial consultation with Amit Shivpeth to handing over the keys of your private estate.
            </p>
          </div>

          <button
            onClick={onOpenBooking}
            className="flex items-center gap-2 px-4 py-2.5 sm:px-5 sm:py-3 rounded-xl bg-white border border-slate-300 hover:border-[#002347] text-[11px] sm:text-xs uppercase tracking-wider text-[#002347] font-bold transition-all shadow-sm cursor-pointer self-start md:self-auto"
          >
            <span>Request Bespoke Service</span>
            <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#C5A059]" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-6">
          {services.map((srv, idx) => {
            const Icon = srv.icon;
            return (
              <div
                key={idx}
                className="p-4 sm:p-6 rounded-2xl bg-white border border-slate-200 border-b-4 border-b-[#002347] hover:border-b-[#C5A059] transition-all flex flex-col justify-between group shadow-sm hover:shadow-md"
              >
                <div>
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-[#002347] text-[#E6C687] flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-105 transition-transform shadow-sm">
                    <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-[#B8924B] block mb-1">
                    {srv.tag}
                  </span>
                  <h3 className="text-base sm:text-lg font-serif-luxury font-bold text-[#002347] mb-1.5 sm:mb-2">
                    {srv.title}
                  </h3>
                  <p className="text-[11px] sm:text-xs text-slate-600 leading-relaxed">
                    {srv.description}
                  </p>
                </div>

                <div className="pt-4 sm:pt-6 mt-3 sm:mt-4 border-t border-slate-100">
                  <button
                    onClick={onOpenBooking}
                    className="flex items-center gap-1.5 text-xs text-[#002347] font-bold hover:text-[#C5A059] transition-colors cursor-pointer"
                  >
                    <span>Inquire Details</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#C5A059]" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Seller Mandate Callout Banner */}
        <div className="mt-12 p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-[#001730] to-[#002347] border border-[#C5A059]/40 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="flex items-start sm:items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-[#C5A059] to-[#E6C687] text-[#002347] flex items-center justify-center font-bold text-xl shrink-0 shadow-md">
              <Key className="w-6 h-6 text-[#002347]" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#C5A059]/20 text-[#E6C687] text-[10px] font-bold uppercase tracking-wider mb-1">
                Owner &amp; Investor Desk
              </div>
              <h3 className="text-xl sm:text-2xl font-serif-luxury font-bold text-white">
                Looking to Sell Your Luxury Property in Nagpur?
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl leading-relaxed">
                List with Amit Shivpeth for discreet marketing, 0% upfront listing fee, verified HNI buyers, and institutional valuation across Civil Lines, Dharampeth, Manish Nagar, and MIHAN.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0 w-full md:w-auto">
            {onOpenSellProperty && (
              <button
                onClick={onOpenSellProperty}
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-gradient-to-r from-[#C5A059] to-[#E6C687] hover:brightness-110 text-[#002347] font-bold text-xs uppercase tracking-wider shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <Key className="w-4 h-4 text-[#002347]" />
                <span>List Your Property</span>
              </button>
            )}
            <a
              href={`https://wa.me/${COMPANY_DETAILS.whatsappNumber}?text=${encodeURIComponent(
                'Hello Amit Shivpeth, I am a property owner and would like to discuss selling my luxury property in Nagpur with AS Realty.'
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-5 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <span>WhatsApp Valuation</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};
