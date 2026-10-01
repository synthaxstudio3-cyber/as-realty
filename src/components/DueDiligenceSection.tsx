import React, { useState } from 'react';
import {
  ShieldCheck,
  Award,
  TrendingUp,
  FileCheck2,
  CalendarCheck,
  MessageSquare,
  Calculator,
  ChevronRight,
  ExternalLink,
  MapPin,
  CheckCircle,
  Clock,
  Sparkles,
  Landmark,
} from 'lucide-react';
import { COMPANY_DETAILS } from '../data/properties';

interface DueDiligenceSectionProps {
  onOpenBooking: (propertyName?: string) => void;
  onOpenAuth?: (mode?: 'signin' | 'signup') => void;
}

export const DueDiligenceSection: React.FC<DueDiligenceSectionProps> = ({
  onOpenBooking,
}) => {
  // Interactive EMI / Investment Estimator
  const [loanAmount, setLoanAmount] = useState<number>(75); // Lakhs
  const [interestRate, setInterestRate] = useState<number>(8.5); // %
  const [tenureYears, setTenureYears] = useState<number>(20); // Years

  // Calculate monthly EMI
  const calculateEMI = () => {
    const principal = loanAmount * 100000;
    const monthlyRate = interestRate / 12 / 100;
    const totalMonths = tenureYears * 12;
    if (monthlyRate === 0) return Math.round(principal / totalMonths);
    const emi =
      (principal * monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) /
      (Math.pow(1 + monthlyRate, totalMonths) - 1);
    return Math.round(emi);
  };

  const monthlyEMI = calculateEMI();
  const totalPayment = monthlyEMI * tenureYears * 12;
  const totalInterest = Math.max(0, totalPayment - loanAmount * 100000);

  const dueDiligenceChecklist = [
    {
      title: '30-Year Search Report & Title Verification',
      desc: 'All properties vetted by senior High Court advocates for clear, marketable title chain with zero encumbrance.',
      badge: 'Legal Clearance',
    },
    {
      title: '7/12 Extracts & 8A Mutation Certification',
      desc: 'Authentic revenue records, Ferfar (mutation) entries, and ownership validation for plots, townships, and farmland.',
      badge: 'Revenue Verified',
    },
    {
      title: 'MahaRERA & NMRDA / NIT Sanction Validation',
      desc: 'Strict verification of MahaRERA project registration, completion schedules, and municipal town planning approvals.',
      badge: 'MahaRERA Compliant',
    },
    {
      title: 'Zero Brokerage on Primary Developer Inventory',
      desc: 'Direct developer mandate pricing with 100% transparent fee structure and direct executive negotiation.',
      badge: '0% Brokerage',
    },
  ];

  return (
    <section
      id="due-diligence-section"
      className="py-20 bg-gradient-to-b from-[#001730] via-[#002347] to-[#001730] text-white relative overflow-hidden"
    >
      {/* Background Decorative Pattern */}
      <div className="absolute inset-0 opacity-5 pointer-events-none bg-[radial-gradient(#C5A059_1px,transparent_1px)] [background-size:24px_24px]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#C5A059]/20 border border-[#C5A059]/40 text-[#E6C687] text-xs font-bold uppercase tracking-widest mb-4">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Integrity &amp; Legal Precision</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif-luxury font-bold text-white tracking-tight leading-tight">
            Institutional-Grade <span className="text-[#E6C687]">Due Diligence</span> &amp; Advisory
          </h2>

          <p className="mt-4 text-base sm:text-lg text-slate-300 font-light leading-relaxed">
            Every transaction represented by <strong className="text-white font-semibold">Amit Shivpeth</strong> is backed by meticulous legal audits, sanctioned layouts, and genuine market intelligence across Nagpur’s elite residential and investment corridors.
          </p>
        </div>

        {/* 2-Column Content: Left Due Diligence Pillars, Right Luxury Investment & EMI Estimator */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Due Diligence Pillars (7 Cols) */}
          <div className="lg:col-span-7 space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {dueDiligenceChecklist.map((item, index) => (
                <div
                  key={index}
                  className="p-5 rounded-2xl bg-[#001224]/80 border border-[#C5A059]/30 backdrop-blur-sm hover:border-[#E6C687]/60 transition-all group flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="p-2 rounded-xl bg-[#002347] text-[#E6C687] border border-[#C5A059]/40 group-hover:scale-105 transition-transform">
                        <FileCheck2 className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#C5A059]/20 text-[#E6C687] border border-[#C5A059]/40">
                        {item.badge}
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-white group-hover:text-[#E6C687] transition-colors leading-snug">
                      {item.title}
                    </h3>
                    <p className="mt-2 text-xs text-slate-300 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Direct White-Glove Guarantee Banner */}
            <div className="p-6 rounded-2xl bg-gradient-to-r from-[#001730] to-[#0a1f38] border border-[#C5A059]/40 flex flex-col sm:flex-row items-center justify-between gap-5">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-[#C5A059] to-[#E6C687] text-[#002347] flex items-center justify-center font-bold text-lg shrink-0 shadow-lg">
                  AS
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Direct Guidance with Amit Shivpeth</h4>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Speak directly regarding 7/12 land titles, MahaRERA sanctions, or off-market penthouses.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0 w-full sm:w-auto">
                <a
                  href={`https://wa.me/${COMPANY_DETAILS.whatsappNumber}?text=${encodeURIComponent(
                    'Hello Amit Shivpeth, I would like to schedule a private advisory consultation for Nagpur luxury properties.'
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider shadow transition-all cursor-pointer"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>WhatsApp Concierge</span>
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

          {/* Right Column: Mortgage & Investment Calculator (5 Cols) */}
          <div className="lg:col-span-5 bg-[#001224]/90 rounded-2xl border border-[#C5A059]/40 p-6 sm:p-7 shadow-2xl backdrop-blur-md">
            <div className="flex items-center justify-between pb-4 mb-5 border-b border-[#C5A059]/25">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-[#002347] text-[#E6C687] border border-[#C5A059]/40">
                  <Calculator className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Nagpur Property EMI Calculator</h3>
                  <p className="text-xs text-slate-400">SBI, HDFC, ICICI Premier Banking Rates</p>
                </div>
              </div>
              <Landmark className="w-5 h-5 text-[#C5A059]" />
            </div>

            <div className="space-y-5">
              {/* Loan Amount Slider */}
              <div>
                <div className="flex justify-between text-xs font-semibold mb-2">
                  <span className="text-slate-300">Investment Loan Amount:</span>
                  <span className="text-[#E6C687] font-bold text-sm">₹ {loanAmount} Lakhs</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="500"
                  step="5"
                  value={loanAmount}
                  onChange={(e) => setLoanAmount(Number(e.target.value))}
                  className="w-full h-2 bg-[#002347] rounded-lg appearance-none cursor-pointer accent-[#C5A059]"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                  <span>₹20 L</span>
                  <span>₹2.5 Cr</span>
                  <span>₹5 Cr+</span>
                </div>
              </div>

              {/* Interest Rate Slider */}
              <div>
                <div className="flex justify-between text-xs font-semibold mb-2">
                  <span className="text-slate-300">Interest Rate (p.a.):</span>
                  <span className="text-[#E6C687] font-bold text-sm">{interestRate}%</span>
                </div>
                <input
                  type="range"
                  min="7.5"
                  max="12.0"
                  step="0.1"
                  value={interestRate}
                  onChange={(e) => setInterestRate(Number(e.target.value))}
                  className="w-full h-2 bg-[#002347] rounded-lg appearance-none cursor-pointer accent-[#C5A059]"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                  <span>7.5% (Prime)</span>
                  <span>8.5% (Avg)</span>
                  <span>12.0%</span>
                </div>
              </div>

              {/* Loan Tenure Slider */}
              <div>
                <div className="flex justify-between text-xs font-semibold mb-2">
                  <span className="text-slate-300">Tenure (Years):</span>
                  <span className="text-[#E6C687] font-bold text-sm">{tenureYears} Years</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="30"
                  step="1"
                  value={tenureYears}
                  onChange={(e) => setTenureYears(Number(e.target.value))}
                  className="w-full h-2 bg-[#002347] rounded-lg appearance-none cursor-pointer accent-[#C5A059]"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                  <span>5 Years</span>
                  <span>15 Years</span>
                  <span>30 Years</span>
                </div>
              </div>

              {/* Results Breakdown */}
              <div className="p-4 rounded-xl bg-[#001730] border border-[#C5A059]/30 mt-6 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-white/10">
                  <span className="text-xs text-slate-300">Estimated Monthly EMI:</span>
                  <span className="text-lg font-bold text-[#E6C687]">
                    ₹ {monthlyEMI.toLocaleString('en-IN')}
                    <span className="text-[10px] font-normal text-slate-400"> /mo</span>
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Principal Amount:</span>
                  <span className="text-white font-medium">₹ {(loanAmount * 100000).toLocaleString('en-IN')}</span>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Estimated Total Interest:</span>
                  <span className="text-white font-medium">₹ {totalInterest.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => onOpenBooking()}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-[#C5A059] to-[#E6C687] text-[#002347] font-bold text-xs uppercase tracking-wider hover:brightness-110 transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
                >
                  <CalendarCheck className="w-4 h-4" />
                  <span>Request Pre-Approved Bank Structure</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
