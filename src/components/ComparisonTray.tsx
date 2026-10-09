import React from 'react';
import { ArrowLeftRight, X, Plus, Sparkles, Trash2 } from 'lucide-react';
import { Property } from '../types';

interface ComparisonTrayProps {
  selectedProperties: Property[];
  onRemoveProperty: (propertyId: string | number) => void;
  onClearAll: () => void;
  onOpenComparisonModal: () => void;
  maxProperties?: number;
}

export const ComparisonTray: React.FC<ComparisonTrayProps> = ({
  selectedProperties,
  onRemoveProperty,
  onClearAll,
  onOpenComparisonModal,
  maxProperties = 4,
}) => {
  if (selectedProperties.length === 0) return null;

  return (
    <div
      id="property-comparison-floating-tray"
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 w-[95%] max-w-4xl animate-slideUp"
    >
      <div className="bg-[#002347]/95 backdrop-blur-md text-white rounded-2xl p-3 sm:p-4 border-2 border-[#C5A059]/60 shadow-2xl shadow-black/40 flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Left: Summary & Selected Property Chips */}
        <div className="flex items-center gap-2.5 sm:gap-4 overflow-x-auto w-full sm:w-auto py-1 max-w-full">
          <div className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 rounded-lg bg-[#C5A059]/20 border border-[#C5A059]/50 flex items-center justify-center text-[#E6C687]">
              <ArrowLeftRight className="w-4 h-4" />
            </div>
            <div className="hidden md:block">
              <span className="text-[10px] uppercase font-bold tracking-wider text-[#E6C687] block">
                Side-by-Side Compare
              </span>
              <span className="text-xs font-semibold text-slate-200">
                {selectedProperties.length} of {maxProperties} Selected
              </span>
            </div>
          </div>

          {/* Chips */}
          <div className="flex items-center gap-2">
            {selectedProperties.map((prop) => (
              <div
                key={prop.id}
                className="group relative flex items-center gap-2 bg-[#001730] border border-[#C5A059]/40 hover:border-[#C5A059] px-2 sm:px-2.5 py-1.5 rounded-xl shrink-0 transition-all"
              >
                <img
                  src={prop.imageUrl || prop.heroImage}
                  alt={prop.name || prop.title}
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg object-cover border border-white/20 shrink-0"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src =
                      'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=100&q=80';
                  }}
                />
                <div className="max-w-[90px] sm:max-w-[130px] min-w-0">
                  <p className="text-[11px] font-bold text-white truncate leading-tight">
                    {prop.name || prop.title}
                  </p>
                  <p className="text-[9px] text-[#E6C687] truncate">
                    {prop.price}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveProperty(prop.id);
                  }}
                  className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                  title="Remove from comparison"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}

            {/* Empty slot indicators up to 4 */}
            {Array.from({ length: Math.max(0, Math.min(2, maxProperties - selectedProperties.length)) }).map((_, idx) => (
              <div
                key={`empty-slot-${idx}`}
                className="hidden lg:flex items-center gap-1.5 border border-dashed border-white/25 px-3 py-2 rounded-xl text-[10px] text-slate-400 shrink-0 select-none"
              >
                <Plus className="w-3 h-3 text-[#C5A059]" />
                <span>Add property</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-white/10">
          <button
            type="button"
            onClick={onClearAll}
            className="flex items-center gap-1 px-2.5 py-2 rounded-xl text-[11px] text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            title="Clear all selected properties"
          >
            <Trash2 className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden sm:inline">Clear</span>
          </button>

          <button
            id="open-comparison-matrix-btn"
            type="button"
            onClick={onOpenComparisonModal}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 sm:px-6 py-2 sm:py-2.5 rounded-xl bg-gradient-to-r from-[#C5A059] via-[#D4AF37] to-[#E6C687] hover:from-[#B8924B] hover:to-[#D9B97A] text-[#002347] font-bold text-xs uppercase tracking-wider shadow-lg shadow-[#C5A059]/25 hover:shadow-[#C5A059]/40 active:scale-95 transition-all cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#002347]" />
            <span>
              Compare {selectedProperties.length} {selectedProperties.length === 1 ? 'Option' : 'Options'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
