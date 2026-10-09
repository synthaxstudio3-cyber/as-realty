import React, { useState, useEffect } from 'react';
import { Menu, X, Building, ChevronRight, Instagram, Sparkles, Key } from 'lucide-react';

interface NavbarProps {
  onOpenBooking: (propertyName?: string) => void;
  onScrollToSection: (sectionId: string) => void;
  onOpenSellProperty?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenBooking,
  onScrollToSection,
  onOpenSellProperty,
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Featured Residences', id: 'featured-properties-section' },
    { name: 'Due Diligence', id: 'due-diligence-section' },
    { name: 'About AS Realty', id: 'about-us-section' },
    { name: 'Founder Profile', id: 'founder-section' },
    { name: 'Private Services', id: 'services-section' },
    { name: 'Contact & Offices', id: 'contact-section' },
  ];

  const handleNavClick = (id: string) => {
    setMobileMenuOpen(false);
    onScrollToSection(id);
  };

  return (
    <header
      id="main-navigation-header"
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        isScrolled
          ? 'bg-[#002347]/95 backdrop-blur-md border-b border-[#C5A059]/30 py-3 shadow-lg shadow-[#002347]/30'
          : 'bg-[#002347] py-4 border-b border-[#001730]'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Brand Logo */}
        <div
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="flex items-center gap-3 cursor-pointer group select-none"
        >
          {/* Custom Gold Monogram Crest */}
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-lg bg-[#001730] border border-[#C5A059]/70 flex items-center justify-center shadow-md group-hover:border-[#E6C687] transition-all">
            <span className="font-cinzel text-lg sm:text-xl font-bold tracking-tighter text-[#E6C687]">
              AS
            </span>
          </div>

          <div>
            <span className="font-cinzel text-xl sm:text-2xl font-bold tracking-widest text-white flex items-center gap-1.5">
              AS <span className="text-[#C5A059]">REALTY</span>
            </span>
            <span className="block text-[10px] text-slate-300 uppercase tracking-wider font-sans">
              Amit Shivpeth
            </span>
          </div>
        </div>

        {/* Action Group: Instagram, Phone & Schedule Button */}
        <div className="hidden sm:flex items-center gap-3">
          {onOpenSellProperty && (
            <button
              id="nav-sell-property-btn"
              onClick={onOpenSellProperty}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#001730] border border-[#C5A059]/50 hover:border-[#E6C687] text-[#E6C687] hover:text-white text-xs font-semibold shadow-sm transition-all cursor-pointer group"
              title="List & Sell your luxury property in Nagpur with Amit Shivpeth"
            >
              <Key className="w-3.5 h-3.5 text-[#C5A059] group-hover:scale-110 transition-transform" />
              <span>Sell Property</span>
            </button>
          )}

          <a
            id="nav-instagram-button"
            href="https://www.instagram.com/as_realty_official/?hl=en"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#001730] border border-[#C5A059]/40 hover:border-[#E6C687] text-xs font-semibold text-slate-200 hover:text-[#E6C687] transition-all group"
            title="Follow us on Instagram @as_realty_official"
          >
            <Instagram className="w-3.5 h-3.5 text-[#E6C687] group-hover:scale-110 transition-transform" />
            <span className="hidden md:inline">Follow us</span>
          </a>

          <button
            id="nav-contact-us-button"
            onClick={() => onOpenBooking()}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-[#C5A059] via-[#D4AF37] to-[#E6C687] hover:from-[#B8924B] hover:to-[#D9B97A] text-[#002347] font-bold text-xs uppercase tracking-wider shadow-md shadow-[#C5A059]/20 transition-all transform active:scale-95 cursor-pointer"
          >
            <Building className="w-3.5 h-3.5 text-[#002347]" />
            <span>Schedule Meeting</span>
          </button>
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex sm:hidden items-center gap-2">
          <button
            onClick={() => onOpenBooking()}
            className="px-3 py-1.5 rounded-lg bg-[#C5A059] text-[#002347] font-bold text-[11px] uppercase tracking-wider"
          >
            Book Visit
          </button>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg bg-[#001730] border border-white/15 text-slate-200 hover:text-white focus:outline-none"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#002347] border-b border-[#C5A059]/30 px-6 py-6 space-y-4 backdrop-blur-xl animate-fadeIn">
          <div className="flex flex-col gap-3">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => handleNavClick(link.id)}
                className="flex items-center justify-between text-left py-2.5 text-sm uppercase tracking-wider text-slate-200 hover:text-[#E6C687] border-b border-white/10"
              >
                <span>{link.name}</span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>
            ))}
          </div>

          <div className="pt-2 space-y-3">
            {onOpenSellProperty && (
              <button
                id="mobile-nav-sell-property-btn"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenSellProperty();
                }}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-lg bg-[#001730] border border-[#C5A059]/60 text-[#E6C687] font-bold text-sm shadow-md cursor-pointer"
              >
                <Key className="w-4 h-4 text-[#C5A059]" />
                <span>Sell Your Property (List with AS Realty)</span>
              </button>
            )}

            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenBooking();
              }}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-lg bg-gradient-to-r from-[#C5A059] to-[#E6C687] text-[#002347] font-bold text-sm shadow-md"
            >
              <Building className="w-4 h-4" />
              <span>Schedule Site Visit</span>
            </button>

            <a
              id="mobile-nav-instagram-button"
              href="https://www.instagram.com/as_realty_official/?hl=en"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 py-3 rounded-lg bg-gradient-to-r from-[#833ab4]/25 via-[#fd1d1d]/25 to-[#fcb045]/25 border border-[#E6C687]/40 text-white font-medium text-sm"
            >
              <Instagram className="w-4 h-4 text-[#E6C687]" />
              <span>Follow us on Instagram (@as_realty_official)</span>
            </a>
          </div>
        </div>
      )}
    </header>
  );
};
