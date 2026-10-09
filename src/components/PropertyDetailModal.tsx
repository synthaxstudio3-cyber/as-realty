import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  X,
  MapPin,
  Check,
  ShieldCheck,
  Calendar,
  BedDouble,
  Maximize2,
  Bath,
  Compass,
  Sparkles,
  Trees,
  ChevronLeft,
  ChevronRight,
  MessageCircle,
  Share2,
  ExternalLink,
} from 'lucide-react';
import { Property } from '../types';

interface PropertyDetailModalProps {
  property: Property | null;
  onClose: () => void;
  onBookNow: (property: Property) => void;
}

export const PropertyDetailModal: React.FC<PropertyDetailModalProps> = ({
  property,
  onClose,
  onBookNow,
}) => {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [copiedLink, setCopiedLink] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Lock background body scroll cleanly and compensate for scrollbar width
  useEffect(() => {
    if (!property) return;

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
  }, [property]);

  // Reset active image index and scroll position whenever a new property is viewed
  useEffect(() => {
    setActiveImageIndex(0);
    setCopiedLink(false);
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
  }, [property?.id]);

  // Close modal when Escape key is pressed
  useEffect(() => {
    if (!property) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [property, onClose]);

  // Extract all unique images
  const allImages = useMemo(() => {
    if (!property) return [];
    return [
      property.imageUrl || property.heroImage,
      ...(property.gallery || []),
    ]
      .filter((img): img is string => Boolean(img && typeof img === 'string' && img.trim().length > 0))
      .filter((val, idx, arr) => arr.indexOf(val) === idx);
  }, [property]);

  if (!property) return null;

  const bhkLower = (property.bhk || '').toLowerCase();
  const typeLower = (property.type || '').toLowerCase();
  const isFarm =
    bhkLower.includes('farm') ||
    bhkLower.includes('field') ||
    typeLower.includes('farm') ||
    typeLower.includes('field') ||
    typeLower.includes('agro') ||
    typeLower.includes('agri');
  const isPlot =
    !isFarm &&
    (bhkLower.includes('plot') || typeLower.includes('plot') || typeLower.includes('land'));

  const safeIndex =
    activeImageIndex >= 0 && activeImageIndex < allImages.length ? activeImageIndex : 0;
  const currentImage =
    allImages[safeIndex] ||
    property.imageUrl ||
    property.heroImage ||
    'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80';

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: property.name || property.title,
          text: `Check out ${property.name || property.title} in ${property.location}, Nagpur with AS Realty!`,
          url: window.location.href,
        });
        return;
      } catch (e) {
        // Fallback to clipboard
      }
    }
    navigator.clipboard?.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return (
    <div
      id="property-detail-modal-overlay"
      className="fixed inset-0 z-50 flex sm:items-center sm:justify-center bg-black/80 backdrop-blur-sm transition-opacity duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="property-detail-modal-title"
    >
      {/* Background backdrop click surface (desktop only) */}
      <div
        className="hidden sm:block absolute inset-0 bg-transparent"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Main Container - Fullscreen on mobile, centered modal card on tablet/desktop */}
      <div
        id="property-detail-modal-content"
        className="relative w-full h-full sm:h-auto sm:max-h-[92vh] sm:max-w-4xl flex flex-col bg-white sm:rounded-2xl sm:shadow-2xl sm:border sm:border-slate-200 text-slate-800 overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Gold Accent Bar */}
        <div className="h-1 sm:h-1.5 w-full bg-gradient-to-r from-[#9E7D3B] via-[#E5C378] to-[#9E7D3B] shrink-0" />

        {/* Unified Sticky Header Bar - Always accessible on mobile & desktop */}
        <header className="px-4 py-3 bg-white border-b border-slate-200 shrink-0 flex items-center justify-between gap-3 shadow-xs">
          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#002347] hover:text-[#C5A059] transition-colors cursor-pointer py-1 px-1 -ml-1 focus:outline-none"
            aria-label="Back to properties catalog"
          >
            <ChevronLeft className="w-5 h-5 text-[#C5A059]" />
            <span className="hidden xs:inline">Back to Catalog</span>
            <span className="xs:hidden">Back</span>
          </button>

          <span className="text-xs sm:text-sm font-serif-luxury font-bold text-[#002347] truncate max-w-[180px] sm:max-w-xs text-center">
            {property.name || property.title}
          </span>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleShare}
              className="p-2 text-slate-500 hover:text-[#002347] hover:bg-slate-100 rounded-full transition-colors cursor-pointer focus:outline-none"
              title="Share property"
              aria-label="Share property link"
            >
              <Share2 className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-600 hover:text-red-600 hover:bg-slate-100 rounded-full transition-colors cursor-pointer focus:outline-none"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </header>

        {copiedLink && (
          <div className="bg-emerald-600 text-white text-xs font-semibold py-1.5 px-4 text-center shrink-0 animate-fadeIn">
            ✓ Property link copied to clipboard!
          </div>
        )}

        {/* Unified Smooth Scroll Body - Natural inertial scrolling on mobile and desktop */}
        <div
          ref={scrollContainerRef}
          className="flex-1 overflow-y-auto overscroll-y-contain p-0 space-y-0"
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          {/* Top Hero Image Section */}
          <div className="relative bg-slate-950 aspect-[16/10] sm:aspect-[21/9] w-full overflow-hidden select-none">
            <img
              key={currentImage}
              src={currentImage}
              alt={property.name || property.title}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src =
                  'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80';
              }}
            />

            {/* Gradient Scrim */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none" />

            {/* Badges Overlay */}
            <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 pointer-events-none">
              <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-[#002347]/90 text-[#E6C687] border border-[#C5A059]/40 backdrop-blur-md shadow-md uppercase tracking-wider">
                {property.type}
              </span>

              {allImages.length > 1 && (
                <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-black/70 text-white backdrop-blur-md shadow-sm">
                  {safeIndex + 1} / {allImages.length} Photos
                </span>
              )}
            </div>

            {/* Arrow Nav buttons on photo (if multiple images) */}
            {allImages.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveImageIndex((prev) => (prev > 0 ? prev - 1 : allImages.length - 1));
                  }}
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 hover:bg-black/80 text-white backdrop-blur-md transition-all cursor-pointer focus:outline-none"
                  aria-label="Previous photo"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveImageIndex((prev) => (prev < allImages.length - 1 ? prev + 1 : 0));
                  }}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 hover:bg-black/80 text-white backdrop-blur-md transition-all cursor-pointer focus:outline-none"
                  aria-label="Next photo"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </>
            )}

            {/* Photo Bottom Caption */}
            <div className="absolute bottom-3 left-4 right-4 pointer-events-none text-white">
              <p className="text-xs text-[#E6C687] font-semibold flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" />
                {property.location}, Nagpur
              </p>
            </div>
          </div>

          {/* Thumbnails Strip */}
          {allImages.length > 1 && (
            <div className="px-4 py-2.5 bg-[#F8F9FA] border-b border-slate-200 flex gap-2 overflow-x-auto scrollbar-thin">
              {allImages.map((img, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setActiveImageIndex(index)}
                  className={`relative w-16 h-12 sm:w-20 sm:h-14 rounded-lg overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${
                    safeIndex === index
                      ? 'border-[#002347] ring-2 ring-[#C5A059] scale-105 shadow-sm'
                      : 'border-slate-300 opacity-70 hover:opacity-100'
                  }`}
                  aria-label={`View photo ${index + 1}`}
                >
                  <img
                    src={img}
                    alt={`Thumbnail ${index + 1}`}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src =
                        'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=400&q=80';
                    }}
                  />
                </button>
              ))}
            </div>
          )}

          {/* Detailed Property Content Container */}
          <div className="p-4 sm:p-8 space-y-6">
            {/* Header: Title, Location & Price */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-5 border-b border-slate-200">
              <div>
                <span className="inline-block px-3 py-0.5 rounded-md text-[11px] font-bold bg-[#C5A059]/15 text-[#002347] border border-[#C5A059]/30 uppercase tracking-wider mb-2">
                  {property.type} • Nagpur Prime
                </span>
                <h1
                  id="property-detail-modal-title"
                  className="text-2xl sm:text-3xl font-serif-luxury font-bold text-[#002347] leading-tight"
                >
                  {property.name || property.title}
                </h1>
                <p className="flex items-center gap-1.5 text-xs sm:text-sm text-slate-600 mt-1.5 font-medium">
                  <MapPin className="w-4 h-4 text-[#B8924B] shrink-0" />
                  <span>{property.location}, Nagpur, Maharashtra</span>
                </p>
              </div>

              <div className="sm:text-right shrink-0 bg-slate-50 sm:bg-transparent p-3 sm:p-0 rounded-xl border sm:border-0 border-slate-200">
                <span className="text-[10px] sm:text-xs text-slate-500 uppercase tracking-widest block font-medium">
                  Offered Price
                </span>
                <div className="text-2xl sm:text-3xl font-serif-luxury font-bold text-[#002347]">
                  {property.price}
                </div>
                {property.sqft && property.price_value > 0 && (
                  <span className="text-[11px] text-slate-500 font-medium">
                    ≈ ₹{Math.round(property.price_value / property.sqft).toLocaleString('en-IN')} / Sq. Ft.
                  </span>
                )}
              </div>
            </div>

            {/* Key Specs Matrix */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2.5">
                Key Specifications
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
                <div className="p-3 rounded-xl bg-[#F8F9FA] border border-slate-200 flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-[#002347] text-[#E6C687] shrink-0">
                    {isFarm ? (
                      <Trees className="w-4 h-4 text-emerald-400" />
                    ) : isPlot ? (
                      <Compass className="w-4 h-4 text-[#E6C687]" />
                    ) : (
                      <BedDouble className="w-4 h-4" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Config</p>
                    <p className="text-xs sm:text-sm font-bold text-[#002347] truncate">{property.bhk}</p>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-[#F8F9FA] border border-slate-200 flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-[#002347] text-[#E6C687] shrink-0">
                    <Maximize2 className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
                      {isFarm ? 'Land Extent' : isPlot ? 'Plot Area' : 'Super Area'}
                    </p>
                    <p className="text-xs sm:text-sm font-bold text-[#002347] truncate">
                      {isFarm
                        ? `${(property.sqft || 43560).toLocaleString('en-IN')} Sq. Ft.`
                        : `${(property.sqft || 1500).toLocaleString('en-IN')} Sq. Ft.`}
                    </p>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-[#F8F9FA] border border-slate-200 flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-[#002347] text-[#E6C687] shrink-0">
                    {isFarm || isPlot ? <ShieldCheck className="w-4 h-4 text-emerald-400" /> : <Bath className="w-4 h-4" />}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
                      {isFarm ? 'Land Title' : isPlot ? 'Sanction' : 'Baths'}
                    </p>
                    <p className="text-xs sm:text-sm font-bold text-[#002347] truncate">
                      {isFarm ? 'Clear 7/12 & 8A' : isPlot ? 'NMRDA / RL' : `${property.bathrooms || 2} Baths`}
                    </p>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-[#F8F9FA] border border-slate-200 flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-[#002347] text-[#E6C687] shrink-0">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Possession</p>
                    <p className="text-xs sm:text-sm font-bold text-emerald-600 truncate">
                      {property.possession || 'Ready Possession'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Legal Due Diligence & RERA Banner */}
            <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2.5 text-slate-800">
                <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0" />
                <div>
                  <span className="font-bold text-[#002347] block">
                    Institutional Due Diligence & Title Clear
                  </span>
                  <span className="text-slate-600 text-[11px]">
                    {property.reraId ? `MahaRERA: ${property.reraId}` : 'Verified Revenue Records & Freehold Title'}
                  </span>
                </div>
              </div>
              <span className="inline-block self-start sm:self-auto text-emerald-800 bg-white border border-emerald-300 px-3 py-1 rounded-full font-bold text-[11px] shadow-2xs">
                ✓ 100% Verified
              </span>
            </div>

            {/* Overview / Editorial Description */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#002347] mb-2 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-[#C5A059]" />
                Property Overview
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-line">
                {property.description ||
                  `${property.name} is an exceptional ${property.type} development strategically situated in the prestigious locale of ${property.location}, Nagpur. Engineered for refined modern living with generous natural illumination, private ventilation, and close proximity to premier metro stations, schools, and hospitals.`}
              </p>
            </div>

            {/* Features & Specifications */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#002347] mb-3">
                Key Features & Architectural Details
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {(
                  property.features || [
                    'Prime Nagpur Arterial Road Connectivity',
                    'Vastu-Compliant East-West Orientation',
                    'MahaRERA Registered Development',
                    '24/7 Gated Security & Perimeter CCTV',
                    'Dedicated Car Parking Space',
                  ]
                ).map((feat, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2.5 p-2.5 rounded-lg bg-[#F8F9FA] border border-slate-200 text-xs text-slate-700"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-[#C5A059] shrink-0" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Amenities & Facilities */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#002347] mb-3">
                Amenities & Facilities
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {(
                  property.amenities || [
                    'Reserved Covered Parking',
                    'High-Speed Elevators with Automatic Rescue Device',
                    'Landscaped Green Enclaves & Walking Paths',
                    'Continuous Power Backup for Common Areas',
                    'Adequate Borewell & Municipal Water Storage',
                  ]
                ).map((amen, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2.5 p-2.5 rounded-lg bg-[#F8F9FA] border border-slate-200 text-xs text-slate-700"
                  >
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{amen}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Direct Advisory Profile */}
            <div className="p-4 sm:p-5 rounded-xl bg-[#002347] text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="inline-block px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-[#C5A059] text-[#002347]">
                  Direct Founder Consultation
                </span>
                <h4 className="text-base sm:text-lg font-serif-luxury font-bold text-white">
                  Amit Shivpeth • AS Realty
                </h4>
                <p className="text-xs text-slate-300">
                  Providing transparent title verification, builder-direct pricing, and accompanied Nagpur site visits.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  onBookNow(property);
                }}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#C5A059] to-[#E6C687] text-[#002347] font-bold text-xs uppercase tracking-wider shrink-0 hover:from-[#B8924B] hover:to-[#D9B97A] transition-all shadow-md cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Calendar className="w-4 h-4 text-[#002347]" />
                <span>Schedule VIP Visit</span>
              </button>
            </div>
          </div>
        </div>

        {/* Sticky Bottom Action Bar - Compact & high-contrast, perfectly accessible on mobile */}
        <footer className="p-3 sm:p-4 bg-white/95 backdrop-blur-md border-t border-slate-200 shrink-0 flex items-center justify-between gap-3 shadow-lg">
          <div className="min-w-0">
            <span className="text-[10px] text-slate-500 uppercase tracking-widest block font-medium">
              Starting Price
            </span>
            <span className="text-lg sm:text-2xl font-serif-luxury font-bold text-[#002347] truncate block">
              {property.price}
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="hidden sm:inline-block px-4 py-2.5 rounded-xl border border-slate-300 hover:border-[#002347] text-slate-700 hover:text-[#002347] text-xs uppercase tracking-wider font-bold transition-colors cursor-pointer"
            >
              Close
            </button>

            <button
              id={`detail-book-now-${property.id}`}
              type="button"
              onClick={() => {
                onClose();
                onBookNow(property);
              }}
              className="flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl bg-gradient-to-r from-[#C5A059] via-[#D4AF37] to-[#E6C687] hover:from-[#B8924B] hover:to-[#D9B97A] text-[#002347] font-bold text-xs sm:text-sm uppercase tracking-wider shadow-md active:scale-95 transition-all cursor-pointer"
            >
              <Calendar className="w-4 h-4 text-[#002347]" />
              <span>Book Site Visit</span>
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
};
