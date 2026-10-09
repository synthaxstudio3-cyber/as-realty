import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  X,
  ArrowLeftRight,
  Check,
  Minus,
  Sparkles,
  MapPin,
  ShieldCheck,
  Calendar,
  Building,
  Plus,
  Trash2,
  Share2,
  ExternalLink,
  MessageCircle,
  Eye,
  SlidersHorizontal,
  IndianRupee,
  BedDouble,
  Maximize2,
  Printer,
  ChevronDown,
} from 'lucide-react';
import { Property } from '../types';

interface PropertyComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedProperties: Property[];
  allProperties: Property[];
  onAddProperty: (property: Property) => void;
  onRemoveProperty: (propertyId: string | number) => void;
  onReplaceProperty: (oldPropertyId: string | number, newProperty: Property) => void;
  onBookNow: (property: Property) => void;
  onViewDetails: (property: Property) => void;
}

// Calculate rough monthly EMI assuming 80% loan at 8.5% per annum for 20 years (240 months)
function calculateEstimatedEmi(priceValue: number): string {
  if (!priceValue || priceValue <= 0) return 'Custom Quote';
  const principal = priceValue * 0.8;
  const annualRate = 8.5;
  const monthlyRate = annualRate / 12 / 100;
  const tenureMonths = 240;
  const emi =
    (principal * monthlyRate * Math.pow(1 + monthlyRate, tenureMonths)) /
    (Math.pow(1 + monthlyRate, tenureMonths) - 1);

  if (emi >= 100000) {
    return `₹${(emi / 100000).toFixed(2)} Lakh / mo`;
  }
  return `₹${Math.round(emi).toLocaleString('en-IN')} / mo`;
}

// Calculate approximate price per sq.ft
function calculatePricePerSqft(priceValue: number, sqft?: number): string {
  if (!priceValue || !sqft || sqft <= 0) return 'Contact for details';
  const perSqft = Math.round(priceValue / sqft);
  return `₹${perSqft.toLocaleString('en-IN')} / sq.ft`;
}

export const PropertyComparisonModal: React.FC<PropertyComparisonModalProps> = ({
  isOpen,
  onClose,
  selectedProperties,
  allProperties,
  onAddProperty,
  onRemoveProperty,
  onReplaceProperty,
  onBookNow,
  onViewDetails,
}) => {
  const [highlightDifferences, setHighlightDifferences] = useState(false);
  const [selectedAddId, setSelectedAddId] = useState<string>('');
  const [showShareNotification, setShowShareNotification] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Lock background body scroll cleanly
  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    const originalPaddingRight = document.body.style.paddingRight;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

    document.body.style.overflow = 'hidden';
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.paddingRight = originalPaddingRight;
    };
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Available properties to add (not yet in comparison)
  const availableToAdd = useMemo(() => {
    const selectedIds = new Set(selectedProperties.map((p) => String(p.id)));
    return allProperties.filter((p) => !selectedIds.has(String(p.id)));
  }, [allProperties, selectedProperties]);

  if (!isOpen) return null;

  // Handle WhatsApp Share of Comparison Summary
  const handleShareComparison = () => {
    const propertyNames = selectedProperties.map((p) => `${p.name || p.title} (${p.location}) - ${p.price}`).join('\n• ');
    const text = encodeURIComponent(
      `Hello Amit Shivpeth (AS Realty),\n\nI am comparing the following Nagpur properties on your website:\n• ${propertyNames}\n\nCould you share your expert recommendation and arrange a private site visit? Thank you!`
    );
    window.open(`https://wa.me/918788375434?text=${text}`, '_blank');
    setShowShareNotification(true);
    setTimeout(() => setShowShareNotification(false), 3000);
  };

  // Helper to check if a specific attribute differs across all selected properties
  const doesAttributeDiffer = (extractor: (p: Property) => any): boolean => {
    if (selectedProperties.length <= 1) return false;
    const firstVal = String(extractor(selectedProperties[0]) || '').trim().toLowerCase();
    return selectedProperties.some((p) => String(extractor(p) || '').trim().toLowerCase() !== firstVal);
  };

  // Pre-calculated differences for styling
  const diffMap = {
    price: doesAttributeDiffer((p) => p.price),
    bhk: doesAttributeDiffer((p) => p.bhk),
    location: doesAttributeDiffer((p) => p.location),
    type: doesAttributeDiffer((p) => p.type),
    sqft: doesAttributeDiffer((p) => p.sqft),
    bathrooms: doesAttributeDiffer((p) => p.bathrooms),
    possession: doesAttributeDiffer((p) => p.possession),
    rera: doesAttributeDiffer((p) => p.reraId),
  };

  // Amenity presence check
  const checkAmenity = (property: Property, keyword: string): boolean => {
    const allText = [
      ...(property.amenities || []),
      ...(property.features || []),
      property.description || '',
    ].join(' ').toLowerCase();
    return allText.includes(keyword.toLowerCase());
  };

  const amenitiesList = [
    { label: 'Grand Clubhouse', keyword: 'clubhouse' },
    { label: 'Swimming Pool & Splash Deck', keyword: 'pool' },
    { label: 'Gymnasium & Fitness Centre', keyword: 'gym' },
    { label: 'Yoga & Meditation Deck', keyword: 'yoga' },
    { label: "Children's Play Park", keyword: 'play' },
    { label: 'Senior Citizen Pergola / Sit-out', keyword: 'senior' },
    { label: 'Sports Turf / Cricket / Indoor Games', keyword: 'sport' },
    { label: '24/7 Security & CCTV Surveillance', keyword: 'security' },
    { label: 'EV Charging Station / Green Solar', keyword: 'charging' },
    { label: 'Covered Car Parking', keyword: 'parking' },
  ];

  return (
    <div
      id="property-comparison-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/85 backdrop-blur-md animate-fadeIn"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="relative w-full max-w-7xl max-h-[94vh] bg-[#F8F9FA] rounded-2xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden border-2 border-[#C5A059]/40"
        role="dialog"
        aria-modal="true"
        aria-labelledby="comparison-modal-title"
      >
        {/* ========================================================================= */}
        {/* MODAL HEADER                                                              */}
        {/* ========================================================================= */}
        <header className="px-4 sm:px-6 py-3.5 sm:py-4 bg-[#002347] text-white border-b-2 border-[#C5A059]/40 flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-[#C5A059] to-[#E6C687] flex items-center justify-center text-[#002347] shrink-0 shadow-md">
              <ArrowLeftRight className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-[#E6C687]">
                  AS Realty Luxury Advisory
                </span>
                <span className="hidden sm:inline text-xs text-slate-400">•</span>
                <span className="hidden sm:inline text-xs text-slate-300">
                  {selectedProperties.length} Properties Side-by-Side
                </span>
              </div>
              <h2
                id="comparison-modal-title"
                className="text-base sm:text-xl md:text-2xl font-serif-luxury font-bold text-white leading-tight"
              >
                Luxury Property Comparison Matrix
              </h2>
            </div>
          </div>

          {/* Top Actions: Highlight Differences, WhatsApp Consultation, Close */}
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap justify-between md:justify-end">
            {/* Highlight Differences Switch */}
            <button
              type="button"
              onClick={() => setHighlightDifferences(!highlightDifferences)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border cursor-pointer ${
                highlightDifferences
                  ? 'bg-[#C5A059] text-[#002347] border-[#C5A059] shadow-md shadow-[#C5A059]/30'
                  : 'bg-white/10 text-slate-200 border-white/20 hover:bg-white/15'
              }`}
              title="Highlight parameters that differ between selected properties"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Highlight Differences</span>
            </button>

            {/* Share / Consult on WhatsApp */}
            <button
              type="button"
              onClick={handleShareComparison}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition-all cursor-pointer"
              title="Ask Amit Shivpeth for comparison advice on WhatsApp"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Consult on WhatsApp</span>
              <span className="sm:hidden">Share</span>
            </button>

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              aria-label="Close comparison modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </header>

        {showShareNotification && (
          <div className="bg-emerald-600 text-white text-xs font-semibold py-1.5 px-4 text-center shrink-0">
            ✓ WhatsApp consultation window opened with your selected properties comparison!
          </div>
        )}

        {/* ========================================================================= */}
        {/* COMPARISON BODY WITH STICKY HEADERS & HORIZONTAL SCROLL                   */}
        {/* ========================================================================= */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-x-auto overflow-y-auto overscroll-contain p-3 sm:p-6 space-y-6"
        >
          {selectedProperties.length === 0 ? (
            <div className="py-20 text-center bg-white rounded-2xl border border-slate-200 p-8">
              <ArrowLeftRight className="w-12 h-12 text-[#C5A059] mx-auto mb-3 opacity-60" />
              <h3 className="text-xl font-serif-luxury font-bold text-[#002347] mb-2">
                No Properties Selected for Comparison
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto mb-6">
                Choose at least 2 properties from our curated Nagpur portfolio to evaluate side-by-side.
              </p>
              {allProperties.length >= 2 && (
                <button
                  type="button"
                  onClick={() => {
                    onAddProperty(allProperties[0]);
                    onAddProperty(allProperties[1]);
                  }}
                  className="px-5 py-2.5 rounded-xl bg-[#002347] text-[#E6C687] font-bold text-xs uppercase tracking-wider hover:bg-[#001730] transition-colors cursor-pointer"
                >
                  Compare Top 2 Featured Developments
                </button>
              )}
            </div>
          ) : (
            <div className="min-w-[650px] sm:min-w-[850px] space-y-6">
              {/* =================================================================== */}
              {/* ROW 1: PROPERTY SUMMARY CARDS & SLOT PICKERS                        */}
              {/* =================================================================== */}
              <div
                className="grid gap-3 sm:gap-4 items-stretch"
                style={{
                  gridTemplateColumns: `200px repeat(${selectedProperties.length + (selectedProperties.length < 4 ? 1 : 0)}, minmax(220px, 1fr))`,
                }}
              >
                {/* Column 0: Label Column Header */}
                <div className="p-4 rounded-2xl bg-white border border-slate-200 flex flex-col justify-between shadow-sm">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#C5A059] block mb-1">
                      Side-by-Side Matrix
                    </span>
                    <h3 className="text-sm sm:text-base font-serif-luxury font-bold text-[#002347]">
                      Comparing {selectedProperties.length} Luxury Developments
                    </h3>
                    <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                      Analyze carpet areas, price points, MahaRERA registrations, and world-class amenities.
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[10px] text-slate-400 font-medium">
                      Max 4 properties
                    </span>
                    <button
                      type="button"
                      onClick={() => window.print()}
                      className="inline-flex items-center gap-1 text-[11px] text-[#002347] font-semibold hover:text-[#C5A059] cursor-pointer"
                      title="Print comparison"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Print</span>
                    </button>
                  </div>
                </div>

                {/* Columns: Property Cards */}
                {selectedProperties.map((property) => (
                  <div
                    key={property.id}
                    className="relative p-3.5 sm:p-4 rounded-2xl bg-white border-2 border-slate-200 hover:border-[#C5A059] shadow-sm flex flex-col justify-between transition-all group"
                  >
                    {/* Remove cross */}
                    <button
                      type="button"
                      onClick={() => onRemoveProperty(property.id)}
                      className="absolute top-2 right-2 z-10 w-6 h-6 rounded-full bg-slate-900/70 hover:bg-red-600 text-white flex items-center justify-center transition-colors shadow-md cursor-pointer"
                      title="Remove from comparison"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>

                    {/* Image & Main Info */}
                    <div>
                      <div className="relative aspect-[16/10] rounded-xl overflow-hidden mb-3 bg-slate-900">
                        <img
                          src={property.imageUrl || property.heroImage}
                          alt={property.name || property.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src =
                              'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=400&q=80';
                          }}
                        />
                        <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#002347]/90 text-[#E6C687] border border-[#C5A059]/40 backdrop-blur-sm">
                          {property.bhk}
                        </span>
                      </div>

                      {/* Micro-location */}
                      <div className="flex items-center gap-1 text-[11px] font-semibold text-[#B8924B] mb-1">
                        <MapPin className="w-3 h-3 shrink-0" />
                        <span className="truncate">{property.location}, Nagpur</span>
                      </div>

                      <h4 className="text-sm sm:text-base font-serif-luxury font-bold text-[#002347] line-clamp-1 leading-snug">
                        {property.name || property.title}
                      </h4>

                      <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                        {property.type}
                      </p>

                      {/* Starting Price Banner */}
                      <div className="mt-2.5 p-2 rounded-xl bg-[#002347]/5 border border-[#002347]/10 flex items-baseline justify-between">
                        <span className="text-[10px] text-slate-500 uppercase font-semibold">Starting</span>
                        <span className="text-sm sm:text-base font-serif-luxury font-bold text-[#002347]">
                          {property.price}
                        </span>
                      </div>
                    </div>

                    {/* Property Swapper Dropdown & Quick Actions */}
                    <div className="mt-3 pt-3 border-t border-slate-100 space-y-2">
                      {/* Swapper Dropdown */}
                      <div className="relative">
                        <select
                          value={String(property.id)}
                          onChange={(e) => {
                            const found = allProperties.find((p) => String(p.id) === e.target.value);
                            if (found) onReplaceProperty(property.id, found);
                          }}
                          className="w-full pl-2 pr-6 py-1.5 text-[11px] font-semibold bg-[#F8F9FA] border border-slate-300 rounded-lg text-slate-700 hover:border-[#C5A059] focus:outline-none appearance-none cursor-pointer"
                        >
                          <option value={String(property.id)}>✓ {property.name || property.title}</option>
                          <optgroup label="Switch to another development:">
                            {allProperties
                              .filter((p) => String(p.id) !== String(property.id))
                              .map((p) => (
                                <option key={p.id} value={String(p.id)}>
                                  {p.name || p.title} ({p.location}) - {p.price}
                                </option>
                              ))}
                          </optgroup>
                        </select>
                        <ChevronDown className="w-3 h-3 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                      </div>

                      {/* Quick CTAs */}
                      <div className="grid grid-cols-2 gap-1.5">
                        <button
                          type="button"
                          onClick={() => onViewDetails(property)}
                          className="flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg bg-slate-100 hover:bg-[#002347] text-slate-700 hover:text-white text-[11px] font-bold border border-slate-200 transition-colors cursor-pointer"
                        >
                          <Eye className="w-3 h-3 text-[#B8924B]" />
                          <span>Details</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            onClose();
                            onBookNow(property);
                          }}
                          className="flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg bg-gradient-to-r from-[#C5A059] to-[#E6C687] text-[#002347] text-[11px] font-bold shadow-sm hover:from-[#B8924B] hover:to-[#D9B97A] transition-colors cursor-pointer"
                        >
                          <Calendar className="w-3 h-3 text-[#002347]" />
                          <span>Visit</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Column: Empty Slot to add another property (if < 4) */}
                {selectedProperties.length < 4 && (
                  <div className="p-4 rounded-2xl bg-white/70 border-2 border-dashed border-slate-300 hover:border-[#C5A059] flex flex-col items-center justify-center text-center p-6 space-y-3 transition-colors">
                    <div className="w-10 h-10 rounded-full bg-[#002347]/10 flex items-center justify-center text-[#002347]">
                      <Plus className="w-5 h-5 text-[#C5A059]" />
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-[#002347]">
                        Add Another Property
                      </h4>
                      <p className="text-[10px] text-slate-500 mt-0.5">
                        Compare up to 4 Nagpur projects
                      </p>
                    </div>

                    <div className="w-full relative mt-2">
                      <select
                        value={selectedAddId}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val) {
                            const found = allProperties.find((p) => String(p.id) === val);
                            if (found) {
                              onAddProperty(found);
                              setSelectedAddId('');
                            }
                          }
                        }}
                        className="w-full pl-2.5 pr-7 py-2 text-[11px] font-semibold bg-white border border-slate-300 rounded-xl text-slate-800 shadow-sm focus:outline-none focus:border-[#C5A059] appearance-none cursor-pointer"
                      >
                        <option value="">+ Select to compare...</option>
                        {availableToAdd.map((p) => (
                          <option key={p.id} value={String(p.id)}>
                            {p.name || p.title} ({p.location}) - {p.price}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>
                )}
              </div>

              {/* =================================================================== */}
              {/* SECTION 1: FINANCIAL & PRICING BENCHMARK                            */}
              {/* =================================================================== */}
              <div className="rounded-2xl bg-white border border-slate-200 overflow-hidden shadow-sm">
                <div className="px-4 py-2.5 bg-[#002347] text-white flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 text-[#E6C687]">
                    <IndianRupee className="w-3.5 h-3.5 text-[#C5A059]" />
                    <span>Pricing & Financial Benchmark</span>
                  </span>
                  <span className="text-[10px] text-slate-300 font-medium">Standard 8.5% Loan Benchmark</span>
                </div>

                <div className="divide-y divide-slate-100">
                  {/* Starting Price */}
                  <div
                    className={`grid items-center px-4 py-3 text-xs ${
                      highlightDifferences && diffMap.price ? 'bg-amber-50/70 font-semibold' : ''
                    }`}
                    style={{
                      gridTemplateColumns: `200px repeat(${selectedProperties.length + (selectedProperties.length < 4 ? 1 : 0)}, minmax(220px, 1fr))`,
                    }}
                  >
                    <span className="font-bold text-[#002347]">Starting Price</span>
                    {selectedProperties.map((p) => (
                      <div key={p.id} className="text-[#002347] font-serif-luxury font-bold text-sm">
                        {p.price}
                      </div>
                    ))}
                    {selectedProperties.length < 4 && <div className="text-slate-400 text-[11px]">—</div>}
                  </div>

                  {/* Approx Price Per Sq.Ft */}
                  <div
                    className="grid items-center px-4 py-3 text-xs"
                    style={{
                      gridTemplateColumns: `200px repeat(${selectedProperties.length + (selectedProperties.length < 4 ? 1 : 0)}, minmax(220px, 1fr))`,
                    }}
                  >
                    <span className="font-bold text-[#002347]">Est. Rate / Sq.Ft</span>
                    {selectedProperties.map((p) => (
                      <div key={p.id} className="text-slate-700 font-medium">
                        {calculatePricePerSqft(p.price_value, p.sqft)}
                      </div>
                    ))}
                    {selectedProperties.length < 4 && <div className="text-slate-400 text-[11px]">—</div>}
                  </div>

                  {/* Estimated EMI */}
                  <div
                    className="grid items-center px-4 py-3 text-xs bg-slate-50/50"
                    style={{
                      gridTemplateColumns: `200px repeat(${selectedProperties.length + (selectedProperties.length < 4 ? 1 : 0)}, minmax(220px, 1fr))`,
                    }}
                  >
                    <div>
                      <span className="font-bold text-[#002347] block">Est. Monthly EMI</span>
                      <span className="text-[10px] text-slate-500 font-normal">80% Loan • 20 Yrs • 8.5%</span>
                    </div>
                    {selectedProperties.map((p) => (
                      <div key={p.id} className="text-[#002347] font-semibold">
                        {calculateEstimatedEmi(p.price_value)}
                      </div>
                    ))}
                    {selectedProperties.length < 4 && <div className="text-slate-400 text-[11px]">—</div>}
                  </div>
                </div>
              </div>

              {/* =================================================================== */}
              {/* SECTION 2: ARCHITECTURAL SPECIFICATIONS & SPACE                      */}
              {/* =================================================================== */}
              <div className="rounded-2xl bg-white border border-slate-200 overflow-hidden shadow-sm">
                <div className="px-4 py-2.5 bg-[#002347] text-white flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 text-[#E6C687]">
                    <Building className="w-3.5 h-3.5 text-[#C5A059]" />
                    <span>Space, Layout & Architectural Typology</span>
                  </span>
                  <span className="text-[10px] text-slate-300 font-medium">Dimensions & Layouts</span>
                </div>

                <div className="divide-y divide-slate-100">
                  {/* Typology / BHK */}
                  <div
                    className={`grid items-center px-4 py-3 text-xs ${
                      highlightDifferences && diffMap.bhk ? 'bg-amber-50/70 font-semibold' : ''
                    }`}
                    style={{
                      gridTemplateColumns: `200px repeat(${selectedProperties.length + (selectedProperties.length < 4 ? 1 : 0)}, minmax(220px, 1fr))`,
                    }}
                  >
                    <span className="font-bold text-[#002347]">Configuration / BHK</span>
                    {selectedProperties.map((p) => (
                      <div key={p.id} className="font-bold text-[#002347]">
                        {p.bhk}
                      </div>
                    ))}
                    {selectedProperties.length < 4 && <div className="text-slate-400 text-[11px]">—</div>}
                  </div>

                  {/* Super Built-Up / Carpet Area */}
                  <div
                    className={`grid items-center px-4 py-3 text-xs ${
                      highlightDifferences && diffMap.sqft ? 'bg-amber-50/70 font-semibold' : ''
                    }`}
                    style={{
                      gridTemplateColumns: `200px repeat(${selectedProperties.length + (selectedProperties.length < 4 ? 1 : 0)}, minmax(220px, 1fr))`,
                    }}
                  >
                    <span className="font-bold text-[#002347]">Carpet / Built-Up Area</span>
                    {selectedProperties.map((p) => (
                      <div key={p.id} className="text-slate-700 font-medium">
                        {p.sqft ? `${p.sqft.toLocaleString('en-IN')} Sq.Ft.` : 'Spacious Layout'}
                      </div>
                    ))}
                    {selectedProperties.length < 4 && <div className="text-slate-400 text-[11px]">—</div>}
                  </div>

                  {/* Structure / Category */}
                  <div
                    className={`grid items-center px-4 py-3 text-xs ${
                      highlightDifferences && diffMap.type ? 'bg-amber-50/70 font-semibold' : ''
                    }`}
                    style={{
                      gridTemplateColumns: `200px repeat(${selectedProperties.length + (selectedProperties.length < 4 ? 1 : 0)}, minmax(220px, 1fr))`,
                    }}
                  >
                    <span className="font-bold text-[#002347]">Structure Type</span>
                    {selectedProperties.map((p) => (
                      <div key={p.id} className="text-slate-700 font-medium">
                        {p.type}
                      </div>
                    ))}
                    {selectedProperties.length < 4 && <div className="text-slate-400 text-[11px]">—</div>}
                  </div>

                  {/* Bathrooms & Balconies */}
                  <div
                    className={`grid items-center px-4 py-3 text-xs ${
                      highlightDifferences && diffMap.bathrooms ? 'bg-amber-50/70 font-semibold' : ''
                    }`}
                    style={{
                      gridTemplateColumns: `200px repeat(${selectedProperties.length + (selectedProperties.length < 4 ? 1 : 0)}, minmax(220px, 1fr))`,
                    }}
                  >
                    <span className="font-bold text-[#002347]">Bathrooms</span>
                    {selectedProperties.map((p) => (
                      <div key={p.id} className="text-slate-700">
                        {p.bathrooms ? `${p.bathrooms} Luxury Baths` : '2–3 Designed Baths'}
                      </div>
                    ))}
                    {selectedProperties.length < 4 && <div className="text-slate-400 text-[11px]">—</div>}
                  </div>

                  {/* Location & Micro-market */}
                  <div
                    className={`grid items-center px-4 py-3 text-xs ${
                      highlightDifferences && diffMap.location ? 'bg-amber-50/70 font-semibold' : ''
                    }`}
                    style={{
                      gridTemplateColumns: `200px repeat(${selectedProperties.length + (selectedProperties.length < 4 ? 1 : 0)}, minmax(220px, 1fr))`,
                    }}
                  >
                    <span className="font-bold text-[#002347]">Nagpur Corridor</span>
                    {selectedProperties.map((p) => (
                      <div key={p.id} className="text-[#002347] font-semibold flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-[#C5A059] shrink-0" />
                        <span>{p.location}</span>
                      </div>
                    ))}
                    {selectedProperties.length < 4 && <div className="text-slate-400 text-[11px]">—</div>}
                  </div>
                </div>
              </div>

              {/* =================================================================== */}
              {/* SECTION 3: LEGAL, MAHARERA & TIMELINE                                */}
              {/* =================================================================== */}
              <div className="rounded-2xl bg-white border border-slate-200 overflow-hidden shadow-sm">
                <div className="px-4 py-2.5 bg-[#002347] text-white flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 text-[#E6C687]">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#C5A059]" />
                    <span>MahaRERA Due Diligence & Possession Timeline</span>
                  </span>
                  <span className="text-[10px] text-slate-300 font-medium">Clear Title Guarantee</span>
                </div>

                <div className="divide-y divide-slate-100">
                  {/* Possession Timeline */}
                  <div
                    className={`grid items-center px-4 py-3 text-xs ${
                      highlightDifferences && diffMap.possession ? 'bg-amber-50/70 font-semibold' : ''
                    }`}
                    style={{
                      gridTemplateColumns: `200px repeat(${selectedProperties.length + (selectedProperties.length < 4 ? 1 : 0)}, minmax(220px, 1fr))`,
                    }}
                  >
                    <span className="font-bold text-[#002347]">Possession Timeline</span>
                    {selectedProperties.map((p) => (
                      <div key={p.id} className="text-emerald-700 font-semibold flex items-center gap-1">
                        <Calendar className="w-3 h-3 shrink-0" />
                        <span>{p.possession || 'Ready to Move / Verified'}</span>
                      </div>
                    ))}
                    {selectedProperties.length < 4 && <div className="text-slate-400 text-[11px]">—</div>}
                  </div>

                  {/* MahaRERA ID */}
                  <div
                    className="grid items-center px-4 py-3 text-xs"
                    style={{
                      gridTemplateColumns: `200px repeat(${selectedProperties.length + (selectedProperties.length < 4 ? 1 : 0)}, minmax(220px, 1fr))`,
                    }}
                  >
                    <span className="font-bold text-[#002347]">MahaRERA Registration</span>
                    {selectedProperties.map((p) => (
                      <div key={p.id} className="text-slate-800 font-mono text-[11px]">
                        {p.reraId || 'MahaRERA Verified'}
                      </div>
                    ))}
                    {selectedProperties.length < 4 && <div className="text-slate-400 text-[11px]">—</div>}
                  </div>

                  {/* Legal Clearance by AS Realty */}
                  <div
                    className="grid items-center px-4 py-3 text-xs bg-slate-50/50"
                    style={{
                      gridTemplateColumns: `200px repeat(${selectedProperties.length + (selectedProperties.length < 4 ? 1 : 0)}, minmax(220px, 1fr))`,
                    }}
                  >
                    <div>
                      <span className="font-bold text-[#002347] block">Title Verification</span>
                      <span className="text-[10px] text-slate-500 font-normal">7/12 & Encumbrance Check</span>
                    </div>
                    {selectedProperties.map((p) => (
                      <div key={p.id} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-semibold">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                        <span>100% Verified</span>
                      </div>
                    ))}
                    {selectedProperties.length < 4 && <div className="text-slate-400 text-[11px]">—</div>}
                  </div>
                </div>
              </div>

              {/* =================================================================== */}
              {/* SECTION 4: LUXURY AMENITIES MATRIX                                  */}
              {/* =================================================================== */}
              <div className="rounded-2xl bg-white border border-slate-200 overflow-hidden shadow-sm">
                <div className="px-4 py-2.5 bg-[#002347] text-white flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 text-[#E6C687]">
                    <Sparkles className="w-3.5 h-3.5 text-[#C5A059]" />
                    <span>Lifestyle & Clubhouse Amenities Matrix</span>
                  </span>
                  <span className="text-[10px] text-slate-300 font-medium">Direct Feature Comparison</span>
                </div>

                <div className="divide-y divide-slate-100">
                  {amenitiesList.map((amenity, idx) => {
                    const differs = doesAttributeDiffer((p) => checkAmenity(p, amenity.keyword));
                    return (
                      <div
                        key={idx}
                        className={`grid items-center px-4 py-2.5 text-xs ${
                          highlightDifferences && differs ? 'bg-amber-50/70' : idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/40'
                        }`}
                        style={{
                          gridTemplateColumns: `200px repeat(${selectedProperties.length + (selectedProperties.length < 4 ? 1 : 0)}, minmax(220px, 1fr))`,
                        }}
                      >
                        <span className="font-semibold text-slate-800">{amenity.label}</span>
                        {selectedProperties.map((p) => {
                          const hasAmenity = checkAmenity(p, amenity.keyword);
                          return (
                            <div key={p.id} className="flex items-center gap-1.5">
                              {hasAmenity ? (
                                <span className="inline-flex items-center gap-1 text-emerald-700 font-bold text-[11px]">
                                  <span className="w-4 h-4 rounded-full bg-emerald-100 flex items-center justify-center">
                                    <Check className="w-3 h-3 text-emerald-700 stroke-[3]" />
                                  </span>
                                  <span>Included</span>
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-slate-400 text-[11px]">
                                  <span className="w-4 h-4 rounded-full bg-slate-100 flex items-center justify-center">
                                    <Minus className="w-3 h-3 text-slate-400" />
                                  </span>
                                  <span>Standard</span>
                                </span>
                              )}
                            </div>
                          );
                        })}
                        {selectedProperties.length < 4 && <div className="text-slate-400 text-[11px]">—</div>}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* =================================================================== */}
              {/* SECTION 5: SIGNATURE HIGHLIGHTS & ARCHITECTURAL USPs                */}
              {/* =================================================================== */}
              <div className="rounded-2xl bg-white border border-slate-200 overflow-hidden shadow-sm">
                <div className="px-4 py-2.5 bg-[#002347] text-white flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 text-[#E6C687]">
                    <Check className="w-3.5 h-3.5 text-[#C5A059]" />
                    <span>Signature USPs & Builder Credentials</span>
                  </span>
                  <span className="text-[10px] text-slate-300 font-medium">Distinctive Strengths</span>
                </div>

                <div
                  className="grid items-start p-4 gap-4 text-xs"
                  style={{
                    gridTemplateColumns: `200px repeat(${selectedProperties.length + (selectedProperties.length < 4 ? 1 : 0)}, minmax(220px, 1fr))`,
                  }}
                >
                  <span className="font-bold text-[#002347]">Key Project Highlights</span>
                  {selectedProperties.map((p) => (
                    <div key={p.id} className="space-y-1.5">
                      {(p.features || []).slice(0, 3).map((feat, fIdx) => (
                        <div key={fIdx} className="flex items-start gap-1.5 text-[11px] text-slate-700">
                          <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                          <span className="leading-tight">{feat}</span>
                        </div>
                      ))}
                    </div>
                  ))}
                  {selectedProperties.length < 4 && <div className="text-slate-400 text-[11px]">—</div>}
                </div>
              </div>

              {/* =================================================================== */}
              {/* SECTION 6: AMIT SHIVPETH DIRECT EXPERT ASSESSMENT                   */}
              {/* =================================================================== */}
              <div className="rounded-2xl bg-gradient-to-r from-[#001730] to-[#002347] border border-[#C5A059]/40 text-white p-4 sm:p-5 shadow-lg">
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-2 h-2 rounded-full bg-[#C5A059] animate-pulse" />
                  <span className="text-xs font-bold uppercase tracking-wider text-[#E6C687]">
                    Amit Shivpeth's Investment & Advisory Verdict
                  </span>
                </div>

                <div
                  className="grid items-start gap-4 text-xs"
                  style={{
                    gridTemplateColumns: `200px repeat(${selectedProperties.length + (selectedProperties.length < 4 ? 1 : 0)}, minmax(220px, 1fr))`,
                  }}
                >
                  <div className="text-slate-300">
                    <span className="font-bold text-white block mb-1">AS Realty Recommendation</span>
                    <p className="text-[11px] text-slate-400">
                      Tailored guidance based on rental yields, capital appreciation, and family lifestyle.
                    </p>
                  </div>

                  {selectedProperties.map((p) => {
                    const isLeverage = String(p.id).includes('leverage');
                    const isOmShivam = String(p.name || '').includes('Shiv Kailasa');
                    const isHappy = String(p.name || '').includes('Happy Galaxy');

                    return (
                      <div key={p.id} className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-1.5">
                        <span className="inline-block px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-[#C5A059] text-[#002347]">
                          Best For
                        </span>
                        <p className="text-[11px] text-slate-200 leading-relaxed font-medium">
                          {isLeverage
                            ? 'High-rise modern lifestyle with 30+ resort amenities, 70% open spaces, and 5-min airport/metro connectivity off Wardha Road.'
                            : isOmShivam
                            ? 'Immediate ready possession opposite AIIMS & IIM with massive 1,403 sq.ft layout and proven rental demand.'
                            : isHappy
                            ? 'Low-density 11-storey community (only 86 families) with 1,650 sq.ft 3-balcony layouts in Chinch Bhawan.'
                            : `Prime ${p.location} corridor living with institutional-grade MahaRERA compliance and solid appreciation potential.`}
                        </p>
                        <button
                          type="button"
                          onClick={() => {
                            onClose();
                            onBookNow(p);
                          }}
                          className="mt-2 text-[10px] text-[#E6C687] hover:text-white font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <span>Schedule Visit for this property →</span>
                        </button>
                      </div>
                    );
                  })}
                  {selectedProperties.length < 4 && <div className="text-slate-400 text-[11px]">—</div>}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ========================================================================= */}
        {/* MODAL FOOTER                                                              */}
        {/* ========================================================================= */}
        <footer className="p-3 sm:p-4 bg-white border-t border-slate-200 shrink-0 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg">
          <div className="flex items-center gap-2 text-xs text-slate-600 text-center sm:text-left">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              All developments verified with MahaRERA records, approved sanctions & 7/12 land titles.
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-300 hover:border-[#002347] text-slate-700 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
            >
              Close
            </button>

            <button
              id="comparison-book-consultation-btn"
              type="button"
              onClick={handleShareComparison}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#C5A059] via-[#D4AF37] to-[#E6C687] hover:from-[#B8924B] hover:to-[#D9B97A] text-[#002347] font-bold text-xs uppercase tracking-wider shadow-md active:scale-95 transition-all cursor-pointer"
            >
              <MessageCircle className="w-4 h-4 text-[#002347]" />
              <span>Consult Amit Shivpeth on This Comparison</span>
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
};
