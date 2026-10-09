import React, { useState } from 'react';
import {
  X,
  Building,
  MapPin,
  CheckCircle2,
  Send,
  MessageSquare,
  ShieldCheck,
  TrendingUp,
  Sparkles,
  Key,
  IndianRupee,
  Layers,
} from 'lucide-react';
import { COMPANY_DETAILS } from '../data/properties';
import { logLeadToSupabase } from '../lib/supabase';

interface SellPropertyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SellPropertyModal: React.FC<SellPropertyModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [ownerName, setOwnerName] = useState('');
  const [phone, setPhone] = useState('');
  const [propertyType, setPropertyType] = useState('Luxury Apartment / Penthouse');
  const [location, setLocation] = useState('Civil Lines');
  const [sizeAndBhk, setSizeAndBhk] = useState('');
  const [expectedPrice, setExpectedPrice] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Lock background body scroll and listen for Escape key
  React.useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      const originalPaddingRight = document.body.style.paddingRight;
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

      document.body.style.overflow = 'hidden';
      if (scrollbarWidth > 0) {
        document.body.style.paddingRight = `${scrollbarWidth}px`;
      }

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') onClose();
      };
      window.addEventListener('keydown', handleKeyDown);

      return () => {
        document.body.style.overflow = originalOverflow;
        document.body.style.paddingRight = originalPaddingRight;
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ownerName.trim() || !phone.trim()) return;

    setIsSubmitting(true);

    const listingPayload = {
      user_id: null,
      name: ownerName.trim(),
      phone: phone.trim(),
      email: '',
      property_name: `Seller Listing: ${propertyType} in ${location}`,
      message: `Property Type: ${propertyType} | Location: ${location} | Size: ${sizeAndBhk || 'Not specified'} | Asking Price: ${expectedPrice || 'Open to Valuation'} | Details: ${notes || 'None'}`,
      source: 'Sell Your Property Portal',
    };

    try {
      await logLeadToSupabase(listingPayload);
    } catch (err) {
      console.error('Error logging seller submission:', err);
    }

    setIsSubmitting(false);
    setIsSuccess(true);
  };

  const formattedWhatsAppUrl = `https://wa.me/${COMPANY_DETAILS.whatsappNumber}?text=${encodeURIComponent(
    `Hello Amit Shivpeth, I would like to list my property for sale with AS Realty.\n\n👤 Owner Name: ${ownerName.trim() || 'Owner'}\n📱 Phone: ${phone.trim()}\n🏢 Property Type: ${propertyType}\n📍 Location: ${location}, Nagpur\n📐 Size / Config: ${sizeAndBhk || 'N/A'}\n💰 Expected Asking Price: ${expectedPrice || 'Open to Valuation'}\n📝 Highlights: ${notes.trim() || 'Please arrange a private discussion.'}`
  )}`;

  return (
    <div
      id="sell-property-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-[#001730]/75 backdrop-blur-md overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        id="sell-property-modal-content"
        className="relative w-full max-w-2xl bg-white border border-slate-200 border-b-4 border-b-[#002347] rounded-2xl shadow-2xl overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Top Gold Accent */}
        <div className="h-1.5 bg-gradient-to-r from-[#9E7D3B] via-[#E5C378] to-[#9E7D3B]" />

        {/* Header */}
        <div className="p-6 sm:p-7 bg-[#002347] text-white relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#001730] border border-[#C5A059]/40 text-[#E6C687] text-xs font-bold uppercase tracking-wider mb-2.5">
            <Key className="w-3.5 h-3.5" />
            <span>Exclusive Nagpur Seller Mandate</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-serif-luxury font-bold text-white">
            List &amp; Sell Your Property with <span className="text-[#E6C687]">Amit Shivpeth</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1.5 leading-relaxed">
            Connect directly with verified High-Net-Worth buyers, get an institutional market valuation, and experience absolute transactional discretion across Nagpur.
          </p>
        </div>

        {/* Form Body or Success State */}
        <div className="p-6 sm:p-8">
          {isSuccess ? (
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-600 flex items-center justify-center mx-auto shadow-md">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-serif-luxury font-bold text-[#002347]">
                Listing Request Received!
              </h3>
              <p className="text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
                Thank you, <strong className="text-slate-900">{ownerName}</strong>. Founding director <strong className="text-[#002347]">Amit Shivpeth</strong> will personally review your property details in <strong>{location}</strong> and connect with you within 24 hours.
              </p>

              <div className="p-4 rounded-xl bg-[#F8F9FA] border border-slate-200 text-xs text-slate-600 max-w-md mx-auto space-y-1 text-left">
                <p><strong>Property:</strong> {propertyType}</p>
                <p><strong>Location:</strong> {location}, Nagpur</p>
                {expectedPrice && <p><strong>Asking:</strong> {expectedPrice}</p>}
                <p><strong>Contact:</strong> {phone}</p>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-3">
                <a
                  href={formattedWhatsAppUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider shadow-md transition-all cursor-pointer"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Send Details on WhatsApp Now</span>
                </a>
                <button
                  onClick={onClose}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#002347] hover:bg-[#001730] text-[#E6C687] font-bold text-xs uppercase tracking-wider shadow-md transition-all cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Owner Name */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={ownerName}
                    onChange={(e) => setOwnerName(e.target.value)}
                    placeholder="e.g. Dr. Rajesh Sharma"
                    className="w-full px-3.5 py-2.5 bg-[#F8F9FA] border border-slate-300 rounded-xl text-slate-800 text-xs sm:text-sm focus:outline-none focus:border-[#C5A059] focus:bg-white"
                  />
                </div>

                {/* Phone Number */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    WhatsApp / Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full px-3.5 py-2.5 bg-[#F8F9FA] border border-slate-300 rounded-xl text-slate-800 text-xs sm:text-sm focus:outline-none focus:border-[#C5A059] focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Property Type */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Property Typology *
                  </label>
                  <select
                    value={propertyType}
                    onChange={(e) => setPropertyType(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#F8F9FA] border border-slate-300 rounded-xl text-slate-800 text-xs sm:text-sm focus:outline-none focus:border-[#C5A059] focus:bg-white cursor-pointer"
                  >
                    <option value="Luxury Apartment / Penthouse">Luxury Apartment / Penthouse</option>
                    <option value="Independent Villa / Bungalow">Independent Villa / Bungalow</option>
                    <option value="Residential Sanctioned Plot">Residential Sanctioned Plot (NMRDA/NIT)</option>
                    <option value="Commercial Land / Plot">Commercial Land / Plot</option>
                    <option value="Agricultural Farmland / Field">Agricultural Farmland / Farmhouse</option>
                    <option value="Commercial Office / Retail Space">Commercial Office / Retail Space</option>
                  </select>
                </div>

                {/* Nagpur Location */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Nagpur Location / Locality *
                  </label>
                  <select
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#F8F9FA] border border-slate-300 rounded-xl text-slate-800 text-xs sm:text-sm focus:outline-none focus:border-[#C5A059] focus:bg-white cursor-pointer"
                  >
                    <option value="Civil Lines">Civil Lines</option>
                    <option value="Ramdaspeth">Ramdaspeth</option>
                    <option value="Dharampeth">Dharampeth</option>
                    <option value="Seminary Hills">Seminary Hills</option>
                    <option value="Laxmi Nagar">Laxmi Nagar</option>
                    <option value="Gandhi Nagar">Gandhi Nagar</option>
                    <option value="Manish Nagar">Manish Nagar</option>
                    <option value="MIHAN">MIHAN</option>
                    <option value="Wardha Road">Wardha Road</option>
                    <option value="Besa">Besa</option>
                    <option value="Beltarodi">Beltarodi</option>
                    <option value="Narendra Nagar">Narendra Nagar</option>
                    <option value="Chinch Bhawan">Chinch Bhawan</option>
                    <option value="Friends Colony">Friends Colony</option>
                    <option value="Wardhaman Nagar">Wardhaman Nagar</option>
                    <option value="Hingna Road">Hingna / Hingna Road</option>
                    <option value="Samruddhi Expressway">Samruddhi Expressway Corridor</option>
                    <option value="Other Nagpur Location">Other Nagpur Locality</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Configuration / Area */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Area / Built-up / Configuration
                  </label>
                  <input
                    type="text"
                    value={sizeAndBhk}
                    onChange={(e) => setSizeAndBhk(e.target.value)}
                    placeholder="e.g. 3 BHK (1,850 sq ft) or 2,400 sq ft Plot"
                    className="w-full px-3.5 py-2.5 bg-[#F8F9FA] border border-slate-300 rounded-xl text-slate-800 text-xs sm:text-sm focus:outline-none focus:border-[#C5A059] focus:bg-white"
                  />
                </div>

                {/* Expected Asking Price */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Expected Price / Budget
                  </label>
                  <input
                    type="text"
                    value={expectedPrice}
                    onChange={(e) => setExpectedPrice(e.target.value)}
                    placeholder="e.g. ₹1.25 Cr or Open to Valuation"
                    className="w-full px-3.5 py-2.5 bg-[#F8F9FA] border border-slate-300 rounded-xl text-slate-800 text-xs sm:text-sm focus:outline-none focus:border-[#C5A059] focus:bg-white"
                  />
                </div>
              </div>

              {/* Highlights / Notes */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Key Highlights / Title Details
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. MahaRERA approved, clear 7/12 extract, corner property, Italian marble flooring, 2 covered car parks..."
                  className="w-full px-3.5 py-2.5 bg-[#F8F9FA] border border-slate-300 rounded-xl text-slate-800 text-xs sm:text-sm focus:outline-none focus:border-[#C5A059] focus:bg-white resize-none"
                />
              </div>

              {/* Seller Trust Perks */}
              <div className="grid grid-cols-3 gap-2 py-2 text-center border-y border-slate-200">
                <div className="p-2">
                  <p className="text-[11px] font-bold text-[#002347]">0% Upfront Fee</p>
                  <p className="text-[10px] text-slate-500">Pay only on closing</p>
                </div>
                <div className="p-2 border-x border-slate-200">
                  <p className="text-[11px] font-bold text-[#002347]">HNI Buyers</p>
                  <p className="text-[10px] text-slate-500">Curated wealth network</p>
                </div>
                <div className="p-2">
                  <p className="text-[11px] font-bold text-[#002347]">100% Confidential</p>
                  <p className="text-[10px] text-slate-500">Discreet facilitation</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:flex-1 py-3.5 rounded-xl bg-gradient-to-r from-[#002347] to-[#001730] hover:from-[#001730] hover:to-[#002347] text-[#E6C687] font-bold text-xs uppercase tracking-wider shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4 text-[#E6C687]" />
                  <span>{isSubmitting ? 'Submitting...' : 'Submit Listing Mandate'}</span>
                </button>

                <a
                  href={formattedWhatsAppUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider shadow-md transition-all cursor-pointer"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>WhatsApp Directly</span>
                </a>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
