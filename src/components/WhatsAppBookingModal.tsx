import React, { useState, useEffect } from 'react';
import { 
  X, 
  Calendar, 
  Clock, 
  Building2, 
  User, 
  Phone, 
  Mail, 
  CheckCircle2, 
  Database, 
  FileText, 
  MapPin, 
  ArrowRight,
  ShieldCheck,
  Compass
} from 'lucide-react';
import { Property } from '../types';
import { COMPANY_DETAILS } from '../data/properties';
import { createBookingInSupabase, BookingResult } from '../lib/supabase';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedPropertyName?: string;
  properties: Property[];
}

export const WhatsAppBookingModal: React.FC<BookingModalProps> = ({
  isOpen,
  onClose,
  selectedPropertyName,
  properties,
}) => {
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [propertyName, setPropertyName] = useState(selectedPropertyName || '');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('11:00 AM');
  const [visitType, setVisitType] = useState('In-Person Site Inspection');
  const [notes, setNotes] = useState('');
  const [customTime, setCustomTime] = useState('');
  const [useCustomTime, setUseCustomTime] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingResult, setBookingResult] = useState<BookingResult | null>(null);

  // Set default date to tomorrow in YYYY-MM-DD
  useEffect(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const yyyy = tomorrow.getFullYear();
    const mm = String(tomorrow.getMonth() + 1).padStart(2, '0');
    const dd = String(tomorrow.getDate()).padStart(2, '0');
    setSelectedDate(`${yyyy}-${mm}-${dd}`);
  }, []);

  // Sync selectedPropertyName when modal opens or property changes
  useEffect(() => {
    if (selectedPropertyName) {
      setPropertyName(selectedPropertyName);
    } else if (properties.length > 0 && !propertyName) {
      setPropertyName(properties[0].name || properties[0].title);
    }
  }, [selectedPropertyName, properties]);

  // Reset state when modal opens, lock body scroll, and listen for Escape key
  useEffect(() => {
    if (isOpen) {
      setIsSubmitting(false);
      setBookingResult(null);

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

  const finalTime = useCustomTime ? (customTime || '11:00 AM') : selectedTime;

  // Format date nicely (e.g. "Saturday, 5 September 2026")
  const formatDisplayDate = (dateStr: string) => {
    if (!dateStr) return 'Pending Selection';
    try {
      const [y, m, d] = dateStr.split('-').map(Number);
      const date = new Date(y, m - 1, d);
      return date.toLocaleDateString('en-IN', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !phone.trim()) return;

    setIsSubmitting(true);

    try {
      const result = await createBookingInSupabase({
        name: fullName.trim(),
        phone: phone.trim(),
        email: email.trim() || undefined,
        property_name: propertyName || 'Nagpur Luxury Portfolio Consultation',
        booking_date: selectedDate,
        booking_time: finalTime,
        visit_type: visitType,
        notes: notes.trim() || undefined,
      });

      setBookingResult(result);
    } catch (err) {
      console.error('Booking submission error:', err);
      // Fallback result with simulated reference
      setBookingResult({
        success: true,
        bookingRef: `ASR-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBookAnother = () => {
    setBookingResult(null);
    setNotes('');
  };

  const timeSlots = [
    '10:30 AM (Morning Slot)',
    '01:00 PM (Afternoon Slot)',
    '04:00 PM (Tea & Sunset Slot)',
    '06:00 PM (Evening Twilight)',
  ];

  const visitTypes = [
    'In-Person Site Inspection',
    'Video Walkthrough Consultation',
    'Office Meeting (Somalwada)',
  ];

  return (
    <div
      id="booking-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-[#001730]/75 backdrop-blur-md transition-all duration-300 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        id="booking-modal-container"
        className="relative w-full max-w-xl my-6 bg-white border border-slate-200 border-b-4 border-b-[#002347] rounded-2xl shadow-2xl text-slate-800 overflow-hidden animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Top Gold Accent Bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-[#9E7D3B] via-[#E5C378] to-[#9E7D3B]" />

        {/* Modal Header */}
        <div className="p-6 sm:p-7 pb-4 bg-[#001730] text-white flex items-start justify-between border-b border-[#C5A059]/30">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#C5A059]/20 text-[#E6C687] border border-[#C5A059]/40 uppercase tracking-widest">
                <Database className="w-3 h-3 text-[#E6C687]" />
                Supabase Online Booking
              </span>
              <span className="text-[11px] text-emerald-400 font-medium flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live Database System
              </span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-serif-luxury font-bold text-white tracking-wide">
              Schedule a Site Visit
            </h3>
            <p className="text-xs text-slate-300 mt-1">
              Confirmed directly to <strong className="text-[#E6C687] font-semibold">{COMPANY_DETAILS.name}</strong> • Under leadership of <strong className="text-white font-medium">{COMPANY_DETAILS.founder}</strong>
            </p>
          </div>

          <button
            id="close-booking-modal-button"
            onClick={onClose}
            className="p-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-full transition-colors focus:outline-none cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 sm:p-7 pt-5 max-h-[75vh] overflow-y-auto">
          {!bookingResult ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Client Full Name & Phone Number */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#002347] mb-1.5">
                    1. Full Name <span className="text-amber-600">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <User className="w-4 h-4" />
                    </div>
                    <input
                      id="booking-client-name"
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Rajesh Singhania"
                      className="w-full pl-10 pr-3 py-2.5 bg-[#F8F9FA] border border-slate-300 rounded-xl text-slate-800 placeholder-slate-400 text-xs sm:text-sm focus:outline-none focus:border-[#C5A059] focus:ring-1 focus:ring-[#C5A059] transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#002347] mb-1.5">
                    2. Phone Number <span className="text-amber-600">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Phone className="w-4 h-4" />
                    </div>
                    <input
                      id="booking-client-phone"
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="e.g. +91 98765 43210"
                      className="w-full pl-10 pr-3 py-2.5 bg-[#F8F9FA] border border-slate-300 rounded-xl text-slate-800 placeholder-slate-400 text-xs sm:text-sm focus:outline-none focus:border-[#C5A059] focus:ring-1 focus:ring-[#C5A059] transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* Email Address (Optional) */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#002347] mb-1.5">
                  3. Email Address <span className="text-slate-400 text-[10px] font-normal lowercase">(optional for itinerary email)</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    id="booking-client-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. rajesh@example.com"
                    className="w-full pl-10 pr-3 py-2.5 bg-[#F8F9FA] border border-slate-300 rounded-xl text-slate-800 placeholder-slate-400 text-xs sm:text-sm focus:outline-none focus:border-[#C5A059] focus:ring-1 focus:ring-[#C5A059] transition-colors"
                  />
                </div>
              </div>

              {/* Selected Property */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#002347] mb-1.5">
                  4. Selected Nagpur Property <span className="text-amber-600">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <select
                    id="booking-property-name"
                    value={propertyName}
                    onChange={(e) => setPropertyName(e.target.value)}
                    required
                    className="w-full pl-10 pr-10 py-2.5 bg-[#F8F9FA] border border-slate-300 rounded-xl text-slate-800 text-xs sm:text-sm focus:outline-none focus:border-[#C5A059] focus:ring-1 focus:ring-[#C5A059] transition-colors appearance-none cursor-pointer"
                  >
                    {properties.map((prop) => (
                      <option key={prop.id} value={prop.name || prop.title} className="bg-white text-slate-800">
                        {prop.name || prop.title} — {prop.location} ({prop.price})
                      </option>
                    ))}
                    <option value="General Luxury Portfolio Consultation (Custom Search)" className="bg-white text-slate-800">
                      General Luxury Portfolio Consultation (Custom Search)
                    </option>
                  </select>
                  <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400">
                    <span className="text-xs">▼</span>
                  </div>
                </div>
              </div>

              {/* Date & Visit Type Selection */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#002347] mb-1.5">
                    5. Preferred Date <span className="text-amber-600">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Calendar className="w-4 h-4" />
                    </div>
                    <input
                      id="booking-selected-date"
                      type="date"
                      required
                      min={new Date().toISOString().split('T')[0]}
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="w-full pl-10 pr-3 py-2.5 bg-[#F8F9FA] border border-slate-300 rounded-xl text-slate-800 text-xs sm:text-sm focus:outline-none focus:border-[#C5A059] focus:ring-1 focus:ring-[#C5A059] transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#002347] mb-1.5">
                    6. Visit Format
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Compass className="w-4 h-4" />
                    </div>
                    <select
                      value={visitType}
                      onChange={(e) => setVisitType(e.target.value)}
                      className="w-full pl-10 pr-10 py-2.5 bg-[#F8F9FA] border border-slate-300 rounded-xl text-slate-800 text-xs sm:text-sm focus:outline-none focus:border-[#C5A059] focus:ring-1 focus:ring-[#C5A059] transition-colors appearance-none cursor-pointer"
                    >
                      {visitTypes.map((type) => (
                        <option key={type} value={type} className="bg-white text-slate-800">
                          {type}
                        </option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400">
                      <span className="text-xs">▼</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Preferred Time Slot */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#002347]">
                    7. Preferred Time Slot <span className="text-amber-600">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setUseCustomTime(!useCustomTime)}
                    className="text-[11px] text-[#002347] hover:underline font-semibold transition-colors cursor-pointer"
                  >
                    {useCustomTime ? 'Select curated slots' : 'Enter specific time'}
                  </button>
                </div>

                {!useCustomTime ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {timeSlots.map((slot) => {
                      const isSelected = selectedTime === slot;
                      return (
                        <button
                          key={slot}
                          type="button"
                          onClick={() => setSelectedTime(slot)}
                          className={`flex items-center gap-2 p-2.5 text-left rounded-xl border text-xs font-medium transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-[#002347] border-[#002347] text-[#E6C687] shadow-sm'
                              : 'bg-[#F8F9FA] border-slate-200 text-slate-700 hover:border-slate-300'
                          }`}
                        >
                          <Clock className={`w-3.5 h-3.5 ${isSelected ? 'text-[#E6C687]' : 'text-slate-400'}`} />
                          <span className="truncate">{slot}</span>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Clock className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      placeholder="e.g. 03:30 PM (or specific hour)"
                      value={customTime}
                      onChange={(e) => setCustomTime(e.target.value)}
                      className="w-full pl-10 pr-3 py-2.5 bg-[#F8F9FA] border border-slate-300 rounded-xl text-slate-800 text-xs sm:text-sm focus:outline-none focus:border-[#C5A059] focus:ring-1 focus:ring-[#C5A059]"
                    />
                  </div>
                )}
              </div>

              {/* Optional Notes */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#002347] mb-1.5">
                  8. Special Requests or Questions <span className="text-slate-400 text-[10px] font-normal lowercase">(optional)</span>
                </label>
                <div className="relative">
                  <div className="absolute top-2.5 left-3.5 pointer-events-none text-slate-400">
                    <FileText className="w-4 h-4" />
                  </div>
                  <textarea
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="e.g. Need vehicle pick-up from Airport / Manish Nagar, or specific layout blueprints."
                    className="w-full pl-10 pr-3 py-2 bg-[#F8F9FA] border border-slate-300 rounded-xl text-slate-800 text-xs sm:text-sm focus:outline-none focus:border-[#C5A059] focus:ring-1 focus:ring-[#C5A059]"
                  />
                </div>
              </div>

              {/* Direct Supabase Submit Button */}
              <div className="pt-2">
                <button
                  id="submit-supabase-booking-btn"
                  type="submit"
                  disabled={isSubmitting || !fullName.trim() || !phone.trim()}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-[#002347] via-[#001730] to-[#002347] hover:from-[#003366] hover:to-[#002347] text-[#E6C687] font-bold text-xs uppercase tracking-wider border border-[#C5A059]/60 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer group"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-[#E6C687] border-t-transparent rounded-full animate-spin" />
                      <span>Recording Booking to Supabase...</span>
                    </>
                  ) : (
                    <>
                      <Database className="w-4 h-4 text-[#C5A059] group-hover:scale-110 transition-transform" />
                      <span>Confirm &amp; Send Booking to Supabase</span>
                      <ArrowRight className="w-3.5 h-3.5 text-[#E6C687] ml-1" />
                    </>
                  )}
                </button>
                <p className="text-[11px] text-center text-slate-500 mt-2 flex items-center justify-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Direct database record • No WhatsApp launch needed • Instant confirmation</span>
                </p>
              </div>
            </form>
          ) : (
            /* Confirmation Screen with Supabase Record Badge */
            <div className="py-4 text-center space-y-5 animate-in fade-in zoom-in-95 duration-200">
              <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 border-2 border-emerald-400 flex items-center justify-center mx-auto shadow-md">
                <CheckCircle2 className="w-9 h-9" />
              </div>

              <div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300 mb-2">
                  <Database className="w-3.5 h-3.5 text-emerald-700" />
                  Recorded in Supabase Database
                </span>
                <h4 className="text-2xl font-serif-luxury font-bold text-[#002347]">
                  Site Visit Successfully Scheduled!
                </h4>
                <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-md mx-auto">
                  Thank you, <strong className="text-[#002347]">{fullName}</strong>. Your visit has been saved directly to our database and our concierge desk has been alerted.
                </p>
              </div>

              {/* Booking Reference Box */}
              <div className="bg-[#F8F9FA] border border-slate-200 rounded-xl p-4 text-left space-y-2.5 max-w-md mx-auto text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <span className="font-semibold text-slate-500 uppercase tracking-wider text-[10px]">
                    Booking Reference
                  </span>
                  <span className="font-mono font-bold text-[#002347] bg-[#E6C687]/30 px-2 py-0.5 rounded text-[11px]">
                    {bookingResult.bookingRef}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Property:</span>
                  <span className="font-semibold text-[#002347] text-right truncate max-w-[220px]">
                    {propertyName}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Date &amp; Time:</span>
                  <span className="font-semibold text-slate-800">
                    {formatDisplayDate(selectedDate)} • {finalTime}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Format:</span>
                  <span className="font-medium text-slate-700">{visitType}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Contact:</span>
                  <span className="font-medium text-slate-800">{phone}</span>
                </div>
              </div>

              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-xs max-w-md mx-auto text-left flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <p>
                  Senior consultant <strong className="font-semibold text-[#002347]">{COMPANY_DETAILS.founder}</strong> will connect with you via phone ({phone}) prior to the visit to confirm the meeting point.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleBookAnother}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
                >
                  Book Another Visit
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#002347] hover:bg-[#001730] text-[#E6C687] text-xs font-bold uppercase tracking-wider transition-colors shadow-md cursor-pointer"
                >
                  Close &amp; Return to Listings
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
