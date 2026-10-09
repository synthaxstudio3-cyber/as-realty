import React, { useState, useMemo } from 'react';
import { Property, FilterState } from './types';
import { PROPERTIES } from './data/properties';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { PropertyGrid } from './components/PropertyGrid';
import { AboutSection } from './components/AboutSection';
import { ServicesSection } from './components/ServicesSection';
import { ReviewsSection } from './components/ReviewsSection';
import { DueDiligenceSection } from './components/DueDiligenceSection';
import { ContactSection } from './components/ContactSection';
import { Footer } from './components/Footer';
import { WhatsAppBookingModal } from './components/WhatsAppBookingModal';
import { PropertyDetailModal } from './components/PropertyDetailModal';
import { SellPropertyModal } from './components/SellPropertyModal';
import { MovableVoiceAgent } from './components/MovableVoiceAgent';
import { ComparisonTray } from './components/ComparisonTray';
import { PropertyComparisonModal } from './components/PropertyComparisonModal';

export default function App() {
  const [properties] = useState<Property[]>(PROPERTIES);
  const [filters, setFilters] = useState<FilterState>({
    priceRange: 'all',
    location: 'all',
    typology: 'all',
    searchQuery: '',
  });

  // Modal states
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [isSellPropertyOpen, setIsSellPropertyOpen] = useState(false);
  const [selectedBookingPropertyName, setSelectedBookingPropertyName] = useState<string>('');
  const [detailProperty, setDetailProperty] = useState<Property | null>(null);

  // Property Side-by-Side Comparison state
  const [selectedComparisonIds, setSelectedComparisonIds] = useState<(string | number)[]>([]);
  const [isComparisonModalOpen, setIsComparisonModalOpen] = useState(false);

  const selectedComparisonProperties = useMemo(() => {
    return properties.filter((p) =>
      selectedComparisonIds.some((id) => String(id) === String(p.id))
    );
  }, [properties, selectedComparisonIds]);

  const handleToggleCompare = (property: Property) => {
    setSelectedComparisonIds((prev) => {
      const exists = prev.some((id) => String(id) === String(property.id));
      if (exists) {
        return prev.filter((id) => String(id) !== String(property.id));
      }
      if (prev.length >= 4) {
        // Limit to 4 max - replace the oldest or alert
        return [...prev.slice(1), property.id];
      }
      return [...prev, property.id];
    });
  };

  const handleAddComparisonProperty = (property: Property) => {
    setSelectedComparisonIds((prev) => {
      if (prev.some((id) => String(id) === String(property.id))) return prev;
      if (prev.length >= 4) return [...prev.slice(1), property.id];
      return [...prev, property.id];
    });
  };

  const handleRemoveComparisonProperty = (propertyId: string | number) => {
    setSelectedComparisonIds((prev) =>
      prev.filter((id) => String(id) !== String(propertyId))
    );
  };

  const handleReplaceComparisonProperty = (
    oldPropertyId: string | number,
    newProperty: Property
  ) => {
    setSelectedComparisonIds((prev) =>
      prev.map((id) => (String(id) === String(oldPropertyId) ? newProperty.id : id))
    );
  };

  const handleClearComparison = () => {
    setSelectedComparisonIds([]);
  };

  const handleOpenComparisonModal = () => {
    // If no properties are selected yet, smartly pre-select the top 2 luxury options so the comparison view is rich right away
    if (selectedComparisonIds.length === 0 && properties.length >= 2) {
      setSelectedComparisonIds([properties[0].id, properties[1].id]);
    }
    setIsComparisonModalOpen(true);
  };

  const handleFilterChange = (newFilters: Partial<FilterState>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const handleSearchSubmit = () => {
    const el = document.getElementById('featured-properties-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleScrollToSection = (sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleOpenBooking = (propertyOrName?: Property | string) => {
    if (typeof propertyOrName === 'string') {
      setSelectedBookingPropertyName(propertyOrName);
    } else if (propertyOrName && typeof propertyOrName === 'object') {
      setSelectedBookingPropertyName(propertyOrName.name || propertyOrName.title);
    } else {
      setSelectedBookingPropertyName('');
    }
    setIsBookingOpen(true);
  };

  const handleCloseBooking = () => {
    setIsBookingOpen(false);
  };

  const handleViewDetails = (property: Property) => {
    setDetailProperty(property);
  };

  const handleCloseDetails = () => {
    setDetailProperty(null);
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#0F172A] selection:bg-[#C5A059] selection:text-white">
      {/* Navigation Bar */}
      <Navbar
        onOpenBooking={() => handleOpenBooking()}
        onScrollToSection={handleScrollToSection}
        onOpenSellProperty={() => setIsSellPropertyOpen(true)}
        onOpenComparisonModal={handleOpenComparisonModal}
        comparisonCount={selectedComparisonIds.length}
      />

      {/* Main Content Area */}
      <main>
        {/* Hero Section */}
        <Hero
          filters={filters}
          onFilterChange={handleFilterChange}
          onSearchSubmit={handleSearchSubmit}
          onOpenBooking={() => handleOpenBooking()}
          onOpenSellProperty={() => setIsSellPropertyOpen(true)}
        />

        {/* Featured Properties Grid with Interactive Filters & Comparison */}
        <PropertyGrid
          properties={properties}
          filters={filters}
          onFilterChange={handleFilterChange}
          onBookNow={(prop) => handleOpenBooking(prop)}
          onViewDetails={handleViewDetails}
          selectedComparisonIds={selectedComparisonIds}
          onToggleCompare={handleToggleCompare}
          onOpenComparisonModal={handleOpenComparisonModal}
        />

        {/* About AS Realty & Amit Shivpeth */}
        <AboutSection onOpenBooking={() => handleOpenBooking()} />

        {/* Bespoke Client Services & VIP Privileges */}
        <ServicesSection 
          onOpenBooking={() => handleOpenBooking()} 
          onOpenSellProperty={() => setIsSellPropertyOpen(true)}
        />

        {/* Verified Indian Client Reviews & [Add Review] Section */}
        <ReviewsSection onOpenBooking={() => handleOpenBooking()} />

        {/* Institutional-Grade Due Diligence & Investment Advisory */}
        <DueDiligenceSection 
          onOpenBooking={() => handleOpenBooking()} 
        />

        {/* Contact Us & Direct Inquiry Section */}
        <ContactSection onOpenBooking={() => handleOpenBooking()} />
      </main>

      {/* Site Footer */}
      <Footer
        onScrollToSection={handleScrollToSection}
        onOpenBooking={() => handleOpenBooking()}
        onOpenSellProperty={() => setIsSellPropertyOpen(true)}
      />

      {/* Interactive Floating Comparison Tray */}
      <ComparisonTray
        selectedProperties={selectedComparisonProperties}
        onRemoveProperty={handleRemoveComparisonProperty}
        onClearAll={handleClearComparison}
        onOpenComparisonModal={handleOpenComparisonModal}
      />

      {/* Side-by-Side Property Comparison Matrix Modal */}
      <PropertyComparisonModal
        isOpen={isComparisonModalOpen}
        onClose={() => setIsComparisonModalOpen(false)}
        selectedProperties={selectedComparisonProperties}
        allProperties={properties}
        onAddProperty={handleAddComparisonProperty}
        onRemoveProperty={handleRemoveComparisonProperty}
        onReplaceProperty={handleReplaceComparisonProperty}
        onBookNow={(prop) => handleOpenBooking(prop)}
        onViewDetails={handleViewDetails}
      />

      {/* Interactive Supabase Site Visit Booking Modal */}
      <WhatsAppBookingModal
        isOpen={isBookingOpen}
        onClose={handleCloseBooking}
        selectedPropertyName={selectedBookingPropertyName}
        properties={properties}
      />

      {/* Sell Your Property Modal (List with Amit Shivpeth) */}
      <SellPropertyModal
        isOpen={isSellPropertyOpen}
        onClose={() => setIsSellPropertyOpen(false)}
      />

      {/* Property Deep Dive & Gallery Modal */}
      <PropertyDetailModal
        property={detailProperty}
        onClose={handleCloseDetails}
        onBookNow={(prop) => handleOpenBooking(prop)}
        isCompared={detailProperty ? selectedComparisonIds.some((id) => String(id) === String(detailProperty.id)) : false}
        onToggleCompare={handleToggleCompare}
        onOpenComparisonModal={handleOpenComparisonModal}
      />

      {/* Movable Controller for AI Voice Agent */}
      <MovableVoiceAgent />
    </div>
  );
}
