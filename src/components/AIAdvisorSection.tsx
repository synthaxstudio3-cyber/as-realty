import React from 'react';
import { 
  Bot, 
  Sparkles, 
  ShieldCheck, 
  Award, 
  CalendarCheck, 
  CheckCircle2, 
  ArrowRight,
  PhoneCall,
  MessageSquare,
  TrendingUp,
  Landmark
} from 'lucide-react';
import { AIChatAdvisor } from './AIChatAdvisor';
import { COMPANY_DETAILS } from '../data/properties';

interface AIAdvisorSectionProps {
  onOpenBooking: (propertyName?: string) => void;
}

export const AIAdvisorSection: React.FC<AIAdvisorSectionProps> = ({ onOpenBooking }) => {
  return (
    <section id="ai-advisor-section" className="py-20 bg-gradient-to-b from-[#001730] via-[#002347] to-[#001730] text-white relative overflow-hidden">
      {/* Background Decorative Pattern */}
      <div className="absolute inset-0 opacity-5 pointer-events-none bg-[radial-gradient(#C5A059_1px,transparent_1px)] [background-size:24px_24px]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#C5A059]/20 border border-[#C5A059]/40 text-[#E6C687] text-xs font-bold uppercase tracking-widest mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Luxury Real Estate Advisor</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif-luxury font-bold text-white tracking-tight leading-tight">
            Consult the AS Realty <span className="text-[#E6C687]">AI Property Concierge</span>
          </h2>

          <p className="mt-4 text-base sm:text-lg text-slate-300 font-light leading-relaxed">
            Gain immediate clarity on Nagpur’s fastest-growing corridors, discover our white-glove services, 
            and learn how Amit Shivpeth guarantees 100% legal title safety for your generational investments.
          </p>
        </div>

        {/* Grid Container: Left Trust Columns, Right Live Multi-Turn Chatbot */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Trust Pillars & Value Proposition (5 Cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Trust Pillar 1 */}
            <div className="p-6 rounded-2xl bg-[#001224]/80 border border-[#C5A059]/30 backdrop-blur-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2.5 rounded-xl bg-[#002347] text-[#E6C687] border border-[#C5A059]/40">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">100% Legal Due Diligence</h3>
                  <p className="text-xs text-[#E6C687]">Zero Encumbrance Guarantee</p>
                </div>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Every property in our curated portfolio undergoes 30-year parent deed scrutiny, MahaRERA verification, NMRDA/RL approvals, and comprehensive 7/12 &amp; 8A land revenue vetting before presentation.
              </p>
            </div>

            {/* Trust Pillar 2 */}
            <div className="p-6 rounded-2xl bg-[#001224]/80 border border-[#C5A059]/30 backdrop-blur-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2.5 rounded-xl bg-[#002347] text-[#E6C687] border border-[#C5A059]/40">
                  <Award className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">White-Glove VIP Services</h3>
                  <p className="text-xs text-[#E6C687]">End-to-End Client Advocacy</p>
                </div>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                From complimentary private chauffeur pickups for site visits to tailored financial structures and NRI remote registrations, we handle every detail with executive finesse.
              </p>
            </div>

            {/* Trust Pillar 3 */}
            <div className="p-6 rounded-2xl bg-[#001224]/80 border border-[#C5A059]/30 backdrop-blur-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2.5 rounded-xl bg-[#002347] text-[#E6C687] border border-[#C5A059]/40">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Why Nagpur Right Now?</h3>
                  <p className="text-xs text-[#E6C687]">High Capital Appreciation</p>
                </div>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                With the Samruddhi Mahamarg, MIHAN SEZ aerospace/tech expansions, AIIMS, and Metro Phase II, Nagpur offers superior capital appreciation and rental yield compared to saturated metros.
              </p>
            </div>

            {/* Direct Connect Card */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-[#001730] to-[#0a1f38] border border-[#C5A059]/50 text-center">
              <h4 className="text-sm font-bold text-white mb-1">Prefer Speaking Directly with Amit Shivpeth?</h4>
              <p className="text-xs text-slate-300 mb-4">
                Schedule a confidential 1-on-1 portfolio review or private site inspection.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <a
                  href={`https://wa.me/${COMPANY_DETAILS.whatsappNumber}?text=${encodeURIComponent(
                    'Hello Amit Shivpeth, I would like to arrange a direct consultation regarding premier Nagpur properties.'
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider shadow transition-all"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Chat on WhatsApp</span>
                </a>
                <button
                  onClick={() => onOpenBooking()}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#E6C687] hover:bg-[#C5A059] text-[#002347] font-bold text-xs uppercase tracking-wider shadow transition-all cursor-pointer"
                >
                  <CalendarCheck className="w-4 h-4" />
                  <span>Book VIP Visit</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Embedded Gemini Multi-Turn Chatbot (7 Cols) */}
          <div className="lg:col-span-7">
            <div className="rounded-2xl overflow-hidden shadow-2xl border border-[#C5A059]/40 bg-white">
              <AIChatAdvisor 
                isEmbedded={true}
                onOpenBooking={onOpenBooking}
              />
            </div>
            <div className="mt-3 flex items-center justify-between px-2 text-[11px] text-slate-400">
              <span className="flex items-center gap-1.5">
                <Bot className="w-3.5 h-3.5 text-[#E6C687]" />
                <span>Powered by Gemini 3.5 Flash &amp; 3.1 Pro Preview</span>
              </span>
              <span>Confidential &amp; Verified Real Estate Intelligence</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
