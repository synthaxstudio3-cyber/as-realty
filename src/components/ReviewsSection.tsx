import React, { useState, useEffect } from 'react';
import { Star, CheckCircle, PlusCircle, ThumbsUp, ShieldCheck, Sparkles, MessageSquare, X, Filter } from 'lucide-react';
import { Review } from '../types';
import { INITIAL_REVIEWS } from '../data/reviews';

const STORAGE_KEY = 'as_realty_client_reviews';

interface ReviewsSectionProps {
  onOpenBooking: () => void;
}

export const ReviewsSection: React.FC<ReviewsSectionProps> = ({ onOpenBooking }) => {
  const [reviews, setReviews] = useState<Review[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // fallback to initial
    }
    return INITIAL_REVIEWS;
  });

  const [activeCategory, setActiveCategory] = useState<'all' | 'farmhouse' | 'residence' | 'plot'>('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [votedReviews, setVotedReviews] = useState<Record<string, boolean>>({});
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    location: '',
    propertyPurchased: '',
    category: 'residence' as 'farmhouse' | 'residence' | 'plot',
    rating: 5,
    title: '',
    comment: '',
    verifiedConfirm: true,
  });
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(reviews));
    } catch {
      // silent
    }
  }, [reviews]);

  const handleHelpfulClick = (id: string) => {
    if (votedReviews[id]) return;
    setVotedReviews((prev) => ({ ...prev, [id]: true }));
    setReviews((prev) =>
      prev.map((r) => (r.id === id ? { ...r, helpfulCount: r.helpfulCount + 1 } : r))
    );
  };

  const handleRatingSelect = (score: number) => {
    setFormData((prev) => ({ ...prev, rating: score }));
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!formData.name.trim()) errors.name = 'Please provide your full name.';
    if (!formData.role.trim()) errors.role = 'Please specify your profession or designation.';
    if (!formData.location.trim()) errors.location = 'Please enter your locality or city.';
    if (!formData.propertyPurchased.trim()) errors.propertyPurchased = 'Please specify the property type or project.';
    if (!formData.title.trim()) errors.title = 'Please enter a review headline.';
    if (!formData.comment.trim() || formData.comment.trim().length < 20) {
      errors.comment = 'Review feedback must be at least 20 characters.';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const newReview: Review = {
      id: `user-rev-${Date.now()}`,
      name: formData.name.trim(),
      role: formData.role.trim(),
      location: formData.location.trim(),
      propertyPurchased: formData.propertyPurchased.trim(),
      category: formData.category,
      rating: formData.rating,
      date: 'Just now',
      title: formData.title.trim(),
      comment: formData.comment.trim(),
      verifiedBuyer: formData.verifiedConfirm,
      helpfulCount: 0,
      isUserAdded: true,
    };

    setReviews([newReview, ...reviews]);
    setShowAddForm(false);
    setToastMessage('Thank you! Your verified client review has been published.');
    setTimeout(() => setToastMessage(null), 5000);

    // Reset form
    setFormData({
      name: '',
      role: '',
      location: '',
      propertyPurchased: '',
      category: 'residence',
      rating: 5,
      title: '',
      comment: '',
      verifiedConfirm: true,
    });
    setFormErrors({});
  };

  const filteredReviews = reviews.filter((r) => {
    if (activeCategory === 'all') return true;
    return r.category === activeCategory;
  });

  return (
    <section id="reviews-section" className="py-10 sm:py-16 md:py-20 bg-[#001730] text-white relative overflow-hidden border-t border-[#C5A059]/30">
      {/* Decorative ambient background accents */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#C5A059]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-10 w-96 h-96 bg-[#002347]/80 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 relative z-10">
        {/* Toast Notification */}
        {toastMessage && (
          <div className="fixed top-24 right-6 z-50 bg-[#002347] border border-[#C5A059] text-white px-4 py-2.5 sm:px-5 sm:py-3.5 rounded-xl shadow-2xl flex items-center gap-3 animate-fade-in text-xs sm:text-sm">
            <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400 shrink-0" />
            <span className="font-medium">{toastMessage}</span>
            <button
              onClick={() => setToastMessage(null)}
              className="ml-2 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Section Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 sm:gap-6 mb-6 sm:mb-12">
          <div>
            <div className="flex items-center gap-2 text-[#E6C687] text-[10px] sm:text-xs font-semibold tracking-widest uppercase mb-1.5 sm:mb-2">
              <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#C5A059]" />
              <span>Institutional Trust & Testimonials</span>
            </div>
            <h2 className="font-cinzel text-2xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white">
              Client Experiences <span className="text-[#C5A059]">& Reviews</span>
            </h2>
            <p className="mt-2 sm:mt-3 text-slate-300 text-xs sm:text-base max-w-2xl font-sans">
              Authentic perspectives from industrial leaders, surgeons, business promoters, and NRIs who completed landmark farmhouse and residence acquisitions with Amit Shivpeth.
            </p>
          </div>

          {/* Action: Open Add Review Form */}
          <div className="flex flex-wrap items-center gap-3 self-start lg:self-auto">
            <button
              onClick={() => setShowAddForm((prev) => !prev)}
              className="inline-flex items-center gap-2 px-4 py-2.5 sm:px-5 sm:py-3 rounded-xl bg-gradient-to-r from-[#C5A059] to-[#E6C687] hover:from-[#d8b368] hover:to-[#f2d89f] text-[#001730] font-bold text-xs sm:text-sm tracking-wide shadow-lg shadow-[#C5A059]/20 transition-all cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0"
              id="add-review-btn"
            >
              <PlusCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#001730]" />
              <span>{showAddForm ? 'Close Review Form' : 'Add Review'}</span>
            </button>
          </div>
        </div>

        {/* Aggregate Credibility Metrics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4 p-3 sm:p-5 rounded-xl sm:rounded-2xl bg-[#002347]/90 border border-[#C5A059]/30 mb-6 sm:mb-10 shadow-xl backdrop-blur-sm">
          <div className="text-center sm:text-left sm:border-r border-white/10 sm:pr-4">
            <div className="flex items-center justify-center sm:justify-start gap-1 text-amber-400 mb-0.5 sm:mb-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              ))}
            </div>
            <div className="text-lg sm:text-2xl font-bold font-cinzel text-white">4.98 / 5.0</div>
            <div className="text-[11px] sm:text-xs text-slate-300 mt-0.5">Average Client Rating</div>
          </div>

          <div className="text-center sm:text-left sm:border-r border-white/10 sm:px-4">
            <div className="text-lg sm:text-2xl font-bold font-cinzel text-[#E6C687]">180+</div>
            <div className="text-[11px] sm:text-xs text-slate-300 mt-0.5">High-Value Transactions</div>
            <div className="text-[10px] text-emerald-400 font-medium">Nagpur & Vidarbha</div>
          </div>

          <div className="text-center sm:text-left sm:border-r border-white/10 sm:px-4">
            <div className="text-lg sm:text-2xl font-bold font-cinzel text-[#E6C687]">100%</div>
            <div className="text-[11px] sm:text-xs text-slate-300 mt-0.5">Clear 30-Year Title Record</div>
            <div className="text-[10px] text-emerald-400 font-medium">Zero Legal Disputes</div>
          </div>

          <div className="text-center sm:text-left sm:pl-4">
            <div className="text-lg sm:text-2xl font-bold font-cinzel text-[#E6C687]">₹250+ Cr</div>
            <div className="text-[11px] sm:text-xs text-slate-300 mt-0.5">Transacted Value Curated</div>
            <div className="text-[10px] text-slate-300">Confidential Discretion</div>
          </div>
        </div>

        {/* Expandable [Add Review] Section Form */}
        {showAddForm && (
          <div className="mb-6 sm:mb-12 p-4 sm:p-8 rounded-xl sm:rounded-2xl bg-[#002347] border-2 border-[#C5A059] shadow-2xl relative animate-fadeIn">
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#001730] border border-[#C5A059] flex items-center justify-center text-[#E6C687]">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-cinzel text-lg sm:text-xl font-bold text-white">
                    Submit Your Client Review
                  </h3>
                  <p className="text-xs text-slate-300">
                    Share your experience working with Amit Shivpeth & AS Realty in Nagpur
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAddForm(false)}
                className="p-2 rounded-lg bg-[#001730] text-slate-400 hover:text-white transition-colors"
                title="Cancel"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitReview} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {/* Full Name */}
                <div>
                  <label className="block text-xs font-semibold text-slate-200 mb-1.5 uppercase tracking-wider">
                    Full Name <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Dr. Rajesh Kulkarni"
                    className="w-full px-4 py-2.5 rounded-xl bg-[#001730] border border-white/15 focus:border-[#C5A059] text-white text-sm focus:outline-none transition-colors"
                  />
                  {formErrors.name && (
                    <p className="text-xs text-rose-400 mt-1">{formErrors.name}</p>
                  )}
                </div>

                {/* Profession / Role */}
                <div>
                  <label className="block text-xs font-semibold text-slate-200 mb-1.5 uppercase tracking-wider">
                    Profession / Designation <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    placeholder="e.g. Managing Director / Surgeon"
                    className="w-full px-4 py-2.5 rounded-xl bg-[#001730] border border-white/15 focus:border-[#C5A059] text-white text-sm focus:outline-none transition-colors"
                  />
                  {formErrors.role && (
                    <p className="text-xs text-rose-400 mt-1">{formErrors.role}</p>
                  )}
                </div>

                {/* City / Locality */}
                <div>
                  <label className="block text-xs font-semibold text-slate-200 mb-1.5 uppercase tracking-wider">
                    Location in Nagpur / City <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="e.g. Ramdaspeth, Nagpur"
                    className="w-full px-4 py-2.5 rounded-xl bg-[#001730] border border-white/15 focus:border-[#C5A059] text-white text-sm focus:outline-none transition-colors"
                  />
                  {formErrors.location && (
                    <p className="text-xs text-rose-400 mt-1">{formErrors.location}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {/* Property Type / Acquired */}
                <div>
                  <label className="block text-xs font-semibold text-slate-200 mb-1.5 uppercase tracking-wider">
                    Property Acquired / Inquired <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.propertyPurchased}
                    onChange={(e) => setFormData({ ...formData, propertyPurchased: e.target.value })}
                    placeholder="e.g. 5-Acre Katol Road Farmhouse"
                    className="w-full px-4 py-2.5 rounded-xl bg-[#001730] border border-white/15 focus:border-[#C5A059] text-white text-sm focus:outline-none transition-colors"
                  />
                  {formErrors.propertyPurchased && (
                    <p className="text-xs text-rose-400 mt-1">{formErrors.propertyPurchased}</p>
                  )}
                </div>

                {/* Category Selection */}
                <div>
                  <label className="block text-xs font-semibold text-slate-200 mb-1.5 uppercase tracking-wider">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        category: e.target.value as 'farmhouse' | 'residence' | 'plot',
                      })
                    }
                    className="w-full px-4 py-2.5 rounded-xl bg-[#001730] border border-white/15 focus:border-[#C5A059] text-white text-sm focus:outline-none transition-colors"
                  >
                    <option value="farmhouse">Farmhouse & Farmland Estate</option>
                    <option value="residence">Luxury Penthouse & Residence</option>
                    <option value="plot">Sanctioned Villa Plot / Land</option>
                  </select>
                </div>

                {/* Interactive Star Rating */}
                <div>
                  <label className="block text-xs font-semibold text-slate-200 mb-1.5 uppercase tracking-wider">
                    Your Rating ({formData.rating} of 5 Stars)
                  </label>
                  <div className="flex items-center gap-2 py-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => handleRatingSelect(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(null)}
                        className="cursor-pointer transition-transform hover:scale-125 focus:outline-none"
                      >
                        <Star
                          className={`w-6 h-6 ${
                            (hoverRating !== null ? star <= hoverRating : star <= formData.rating)
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-slate-600'
                          }`}
                        />
                      </button>
                    ))}
                    <span className="text-xs text-[#E6C687] font-semibold ml-2">
                      {formData.rating === 5 ? 'Exceptional (5/5)' : `${formData.rating} Stars`}
                    </span>
                  </div>
                </div>
              </div>

              {/* Review Headline */}
              <div>
                <label className="block text-xs font-semibold text-slate-200 mb-1.5 uppercase tracking-wider">
                  Review Headline <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Uncompromising legal diligence and seamless registry"
                  className="w-full px-4 py-2.5 rounded-xl bg-[#001730] border border-white/15 focus:border-[#C5A059] text-white text-sm focus:outline-none transition-colors"
                />
                {formErrors.title && (
                  <p className="text-xs text-rose-400 mt-1">{formErrors.title}</p>
                )}
              </div>

              {/* Review Comment Textarea */}
              <div>
                <label className="block text-xs font-semibold text-slate-200 mb-1.5 uppercase tracking-wider">
                  Your Detailed Experience <span className="text-rose-400">*</span>
                </label>
                <textarea
                  rows={4}
                  value={formData.comment}
                  onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                  placeholder="Share details regarding Amit Shivpeth's paperwork verification, negotiations, site tours, and transaction experience..."
                  className="w-full px-4 py-3 rounded-xl bg-[#001730] border border-white/15 focus:border-[#C5A059] text-white text-sm focus:outline-none transition-colors resize-y"
                />
                {formErrors.comment && (
                  <p className="text-xs text-rose-400 mt-1">{formErrors.comment}</p>
                )}
              </div>

              {/* Verification Declaration Checkbox */}
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="confirm-authentic"
                  checked={formData.verifiedConfirm}
                  onChange={(e) => setFormData({ ...formData, verifiedConfirm: e.target.checked })}
                  className="w-4 h-4 rounded text-[#C5A059] focus:ring-[#C5A059] accent-[#C5A059] bg-[#001730] border-white/20 cursor-pointer"
                />
                <label htmlFor="confirm-authentic" className="text-xs text-slate-300 cursor-pointer">
                  I certify that this review reflects a genuine property acquisition or advisory interaction with AS Realty in Nagpur.
                </label>
              </div>

              {/* Form Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-5 py-2.5 rounded-xl bg-transparent hover:bg-white/5 text-slate-300 text-sm font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#C5A059] to-[#E6C687] hover:from-[#d8b368] hover:to-[#f2d89f] text-[#001730] font-bold text-sm tracking-wide shadow-md transition-all cursor-pointer"
                >
                  Publish Review
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Filter Categories */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8 pb-4 border-b border-white/10">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider mr-2 flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-[#C5A059]" />
              Filter by:
            </span>
            <button
              onClick={() => setActiveCategory('all')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeCategory === 'all'
                  ? 'bg-[#C5A059] text-[#001730] shadow-sm'
                  : 'bg-[#002347] text-slate-300 hover:text-white border border-white/10'
              }`}
            >
              All Reviews ({reviews.length})
            </button>
            <button
              onClick={() => setActiveCategory('farmhouse')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeCategory === 'farmhouse'
                  ? 'bg-[#C5A059] text-[#001730] shadow-sm'
                  : 'bg-[#002347] text-slate-300 hover:text-white border border-white/10'
              }`}
            >
              Farmhouses & Farmlands
            </button>
            <button
              onClick={() => setActiveCategory('residence')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeCategory === 'residence'
                  ? 'bg-[#C5A059] text-[#001730] shadow-sm'
                  : 'bg-[#002347] text-slate-300 hover:text-white border border-white/10'
              }`}
            >
              Penthouses & Residences
            </button>
            <button
              onClick={() => setActiveCategory('plot')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeCategory === 'plot'
                  ? 'bg-[#C5A059] text-[#001730] shadow-sm'
                  : 'bg-[#002347] text-slate-300 hover:text-white border border-white/10'
              }`}
            >
              Villa Plots & Land
            </button>
          </div>

          <div className="text-xs text-slate-400">
            Showing <span className="text-[#E6C687] font-semibold">{filteredReviews.length}</span> verified Indian client reviews
          </div>
        </div>

        {/* Reviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-6">
          {filteredReviews.map((review) => {
            const initials = review.name
              .split(' ')
              .map((w) => w[0])
              .filter((c) => c && c.match(/[A-Z]/i))
              .slice(0, 2)
              .join('')
              .toUpperCase() || 'AS';

            return (
              <div
                key={review.id}
                className="rounded-xl sm:rounded-2xl bg-[#002347]/95 border border-[#C5A059]/25 hover:border-[#C5A059]/70 p-4 sm:p-6 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 shadow-lg hover:shadow-2xl hover:shadow-[#001730]/50 relative group"
              >
                {review.isUserAdded && (
                  <div className="absolute top-4 right-4">
                    <span className="text-[10px] font-bold tracking-wider uppercase text-emerald-400 bg-emerald-950/80 border border-emerald-500/40 px-2 py-0.5 rounded-full">
                      Recently Added
                    </span>
                  </div>
                )}

                <div>
                  {/* Rating Stars & Date */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < review.rating
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-slate-600'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-[11px] text-slate-400 font-sans">
                      {review.date}
                    </span>
                  </div>

                  {/* Review Title */}
                  <h4 className="font-cinzel text-base font-bold text-white mb-2 leading-snug group-hover:text-[#E6C687] transition-colors">
                    "{review.title}"
                  </h4>

                  {/* Property Tag */}
                  <div className="mb-3 text-[11px] text-[#C5A059] font-medium flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#C5A059]" />
                    <span>{review.propertyPurchased}</span>
                  </div>

                  {/* Review Content */}
                  <p className="text-slate-300 text-xs sm:text-sm font-sans leading-relaxed line-clamp-5">
                    {review.comment}
                  </p>
                </div>

                {/* Author Info & Verified Badge */}
                <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Author Avatar with initials */}
                    <div className="w-10 h-10 rounded-full bg-[#001730] border border-[#C5A059]/60 flex items-center justify-center text-[#E6C687] font-cinzel font-bold text-xs shrink-0 shadow-inner">
                      {initials}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-white text-xs truncate">
                          {review.name}
                        </span>
                        {review.verifiedBuyer && (
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" title="Verified Estate Buyer" />
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400 truncate">
                        {review.role}
                      </div>
                      <div className="text-[10px] text-slate-400 truncate">
                        {review.location}
                      </div>
                    </div>
                  </div>

                  {/* Helpful Button */}
                  <button
                    onClick={() => handleHelpfulClick(review.id)}
                    disabled={votedReviews[review.id]}
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs transition-colors cursor-pointer shrink-0 ${
                      votedReviews[review.id]
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/30'
                        : 'bg-[#001730] text-slate-400 hover:text-white border border-white/10 hover:border-white/20'
                    }`}
                    title="Mark review as helpful"
                  >
                    <ThumbsUp className="w-3 h-3" />
                    <span>{review.helpfulCount}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Call to Action */}
        <div className="mt-14 p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-[#002347] via-[#001f3f] to-[#002347] border border-[#C5A059]/40 text-center flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="text-center sm:text-left">
            <h3 className="font-cinzel text-lg sm:text-xl font-bold text-white">
              Experience the AS Realty Standard in Nagpur
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
              Connect with Amit Shivpeth for confidential advisory, off-market farmhouses, and bespoke site tours across Nagpur's most coveted corridors.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={onOpenBooking}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#C5A059] to-[#E6C687] hover:from-[#d8b368] hover:to-[#f2d89f] text-[#001730] font-bold text-xs sm:text-sm tracking-wide shadow-md transition-all cursor-pointer"
            >
              Schedule Private Consultation
            </button>
            <button
              onClick={() => {
                setShowAddForm(true);
                window.scrollTo({
                  top: (document.getElementById('reviews-section')?.offsetTop || 0) + 150,
                  behavior: 'smooth',
                });
              }}
              className="px-4 py-2.5 rounded-xl bg-[#001730] border border-[#C5A059]/60 hover:border-[#E6C687] text-[#E6C687] hover:text-white font-semibold text-xs sm:text-sm transition-all cursor-pointer"
            >
              Add Review
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
