import React, { useEffect, useState, useRef, useCallback } from 'react';
import { GripVertical, RotateCcw, Move } from 'lucide-react';

interface Position {
  x: number;
  y: number;
}

const STORAGE_KEY = 'as_realty_voice_agent_position';

export const MovableVoiceAgent: React.FC = () => {
  const [position, setPosition] = useState<Position>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (typeof parsed.x === 'number' && typeof parsed.y === 'number') {
          return parsed;
        }
      }
    } catch {
      // ignore JSON errors
    }
    return { x: 0, y: 0 };
  });

  const [isDragging, setIsDragging] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [agentFound, setAgentFound] = useState(false);
  const [widgetDimensions, setWidgetDimensions] = useState({ width: 220, height: 60 });

  const positionRef = useRef<Position>(position);
  positionRef.current = position;

  const dragStartRef = useRef<{
    pointerStartX: number;
    pointerStartY: number;
    initialPosX: number;
    initialPosY: number;
    hasMoved: boolean;
  }>({
    pointerStartX: 0,
    pointerStartY: 0,
    initialPosX: 0,
    initialPosY: 0,
    hasMoved: false,
  });

  const agentElementRef = useRef<HTMLElement | null>(null);

  // Apply transform to elevenlabs-convai custom element
  const applyTransform = useCallback((pos: Position, withTransition = false) => {
    const el = agentElementRef.current || (document.querySelector('elevenlabs-convai') as HTMLElement | null);
    if (!el) return;

    if (withTransition) {
      el.style.transition = 'transform 0.35s cubic-bezier(0.16, 1, 0.3, 1)';
    } else {
      el.style.transition = 'none';
    }
    el.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0)`;
  }, []);

  // Clamp position to ensure the widget stays well within screen boundaries
  const clampPosition = useCallback((newX: number, newY: number) => {
    const margin = 16;
    const wWidth = window.innerWidth;
    const wHeight = window.innerHeight;
    const elWidth = widgetDimensions.width || 220;
    const elHeight = widgetDimensions.height || 60;

    // By default, elevenlabs widget sits at bottom-right corner (approx right: 32px, bottom: 32px)
    // Moving left decreases X (negative), moving right increases X (positive)
    // Moving up decreases Y (negative), moving down increases Y (positive)
    const minX = -(wWidth - elWidth - margin * 2);
    const maxX = margin;
    const minY = -(wHeight - elHeight - margin * 2);
    const maxY = margin;

    return {
      x: Math.min(Math.max(newX, minX), maxX),
      y: Math.min(Math.max(newY, minY), maxY),
    };
  }, [widgetDimensions]);

  // Monitor for <elevenlabs-convai> element in the DOM
  useEffect(() => {
    const findAgent = () => {
      const el = document.querySelector('elevenlabs-convai') as HTMLElement | null;
      if (el) {
        agentElementRef.current = el;
        setAgentFound(true);

        // Apply initial restored position
        applyTransform(positionRef.current, false);

        // Inject helper styles into shadow DOM if accessible
        try {
          if (el.shadowRoot && !el.shadowRoot.querySelector('#movable-agent-styles')) {
            const style = document.createElement('style');
            style.id = 'movable-agent-styles';
            style.textContent = `
              .pointer-events-auto, button, .sheet {
                cursor: grab;
              }
              .pointer-events-auto:active, button:active {
                cursor: grabbing !important;
              }
              input, textarea {
                cursor: text !important;
              }
            `;
            el.shadowRoot.appendChild(style);
          }
        } catch {
          // Shadow DOM style injection fallback
        }

        // Measure widget bounds periodically
        const updateWidgetRect = () => {
          if (el.shadowRoot) {
            const sheet = el.shadowRoot.querySelector('.sheet') as HTMLElement | null;
            if (sheet && sheet.offsetParent !== null) {
              const rect = sheet.getBoundingClientRect();
              setWidgetDimensions({ width: rect.width || 400, height: rect.height || 550 });
              return;
            }
            const btn = (el.shadowRoot.querySelector('.pointer-events-auto') || el.shadowRoot.querySelector('button')) as HTMLElement | null;
            if (btn) {
              const rect = btn.getBoundingClientRect();
              setWidgetDimensions({ width: rect.width || 220, height: rect.height || 60 });
            }
          }
        };

        updateWidgetRect();
      }
    };

    findAgent();
    const interval = setInterval(findAgent, 800);
    return () => clearInterval(interval);
  }, [applyTransform]);

  // Sync transform when position changes
  useEffect(() => {
    applyTransform(position, isResetting);
  }, [position, isResetting, applyTransform]);

  // Handle pointer down (initiate dragging)
  const handlePointerDown = (clientX: number, clientY: number, target: EventTarget | null) => {
    // If user clicked inside an input, textarea, or close button inside chat, don't drag
    if (target instanceof HTMLElement) {
      const tagName = target.tagName.toLowerCase();
      if (tagName === 'input' || tagName === 'textarea' || tagName === 'select' || target.isContentEditable) {
        return false;
      }
    }

    dragStartRef.current = {
      pointerStartX: clientX,
      pointerStartY: clientY,
      initialPosX: positionRef.current.x,
      initialPosY: positionRef.current.y,
      hasMoved: false,
    };

    return true;
  };

  // Attach global pointer & touch listeners when dragging
  useEffect(() => {
    const handlePointerMove = (e: PointerEvent | MouseEvent | TouchEvent) => {
      const isTouch = 'touches' in e;
      const clientX = isTouch ? e.touches[0].clientX : (e as MouseEvent).clientX;
      const clientY = isTouch ? e.touches[0].clientY : (e as MouseEvent).clientY;

      const deltaX = clientX - dragStartRef.current.pointerStartX;
      const deltaY = clientY - dragStartRef.current.pointerStartY;

      // Threshold check: only initiate actual drag if moved >= 6px
      if (!dragStartRef.current.hasMoved && Math.hypot(deltaX, deltaY) >= 6) {
        dragStartRef.current.hasMoved = true;
        setIsDragging(true);

        const el = agentElementRef.current;
        if (el) {
          el.classList.add('is-dragging');
        }
      }

      if (dragStartRef.current.hasMoved) {
        if (e.cancelable && isTouch) {
          e.preventDefault();
        }

        const unconstrainedX = dragStartRef.current.initialPosX + deltaX;
        const unconstrainedY = dragStartRef.current.initialPosY + deltaY;
        const clamped = clampPosition(unconstrainedX, unconstrainedY);

        applyTransform(clamped, false);
        positionRef.current = clamped;
      }
    };

    const handlePointerUp = () => {
      const hadMoved = dragStartRef.current.hasMoved;

      if (hadMoved) {
        const finalPos = positionRef.current;
        setPosition(finalPos);
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(finalPos));
        } catch {
          // ignore storage errors
        }

        // Prevent the synthetic click that follows dragging
        const captureClick = (e: MouseEvent) => {
          e.stopPropagation();
          e.preventDefault();
          window.removeEventListener('click', captureClick, true);
        };
        window.addEventListener('click', captureClick, true);
        setTimeout(() => window.removeEventListener('click', captureClick, true), 200);
      }

      setIsDragging(false);
      dragStartRef.current.hasMoved = false;

      const el = agentElementRef.current;
      if (el) {
        el.classList.remove('is-dragging');
      }

      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('touchmove', handlePointerMove);
      window.removeEventListener('touchend', handlePointerUp);
    };

    // Attach listener to <elevenlabs-convai> element
    const el = agentElementRef.current || (document.querySelector('elevenlabs-convai') as HTMLElement | null);
    if (!el) return;

    const onAgentPointerDown = (e: PointerEvent) => {
      const started = handlePointerDown(e.clientX, e.clientY, e.target);
      if (started) {
        window.addEventListener('pointermove', handlePointerMove, { passive: false });
        window.addEventListener('pointerup', handlePointerUp);
      }
    };

    const onAgentTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        const started = handlePointerDown(e.touches[0].clientX, e.touches[0].clientY, e.target);
        if (started) {
          window.addEventListener('touchmove', handlePointerMove, { passive: false });
          window.addEventListener('touchend', handlePointerUp);
        }
      }
    };

    el.addEventListener('pointerdown', onAgentPointerDown as EventListener);
    el.addEventListener('touchstart', onAgentTouchStart as EventListener);

    return () => {
      el.removeEventListener('pointerdown', onAgentPointerDown as EventListener);
      el.removeEventListener('touchstart', onAgentTouchStart as EventListener);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('touchmove', handlePointerMove);
      window.removeEventListener('touchend', handlePointerUp);
    };
  }, [clampPosition, applyTransform]);

  // Handle window resizing
  useEffect(() => {
    const handleResize = () => {
      const clamped = clampPosition(positionRef.current.x, positionRef.current.y);
      if (clamped.x !== positionRef.current.x || clamped.y !== positionRef.current.y) {
        setPosition(clamped);
        applyTransform(clamped, true);
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(clamped));
        } catch {
          // ignore
        }
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [clampPosition, applyTransform]);

  // Reset to default bottom-right corner
  const handleReset = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setIsResetting(true);
    const origin = { x: 0, y: 0 };
    setPosition(origin);
    positionRef.current = origin;
    applyTransform(origin, true);

    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }

    setTimeout(() => {
      setIsResetting(false);
    }, 400);
  };

  // Dedicated Drag Handle Pointer Down
  const handleHandlePointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();

    dragStartRef.current = {
      pointerStartX: e.clientX,
      pointerStartY: e.clientY,
      initialPosX: positionRef.current.x,
      initialPosY: positionRef.current.y,
      hasMoved: false,
    };

    const handlePointerMove = (evt: PointerEvent) => {
      const deltaX = evt.clientX - dragStartRef.current.pointerStartX;
      const deltaY = evt.clientY - dragStartRef.current.pointerStartY;

      if (!dragStartRef.current.hasMoved && Math.hypot(deltaX, deltaY) >= 3) {
        dragStartRef.current.hasMoved = true;
        setIsDragging(true);
      }

      if (dragStartRef.current.hasMoved) {
        const unconstrainedX = dragStartRef.current.initialPosX + deltaX;
        const unconstrainedY = dragStartRef.current.initialPosY + deltaY;
        const clamped = clampPosition(unconstrainedX, unconstrainedY);
        applyTransform(clamped, false);
        positionRef.current = clamped;
      }
    };

    const handlePointerUp = () => {
      if (dragStartRef.current.hasMoved) {
        const finalPos = positionRef.current;
        setPosition(finalPos);
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(finalPos));
        } catch {
          // ignore
        }
      }
      setIsDragging(false);
      dragStartRef.current.hasMoved = false;

      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
  };

  const isMovedFromOrigin = Math.abs(position.x) > 10 || Math.abs(position.y) > 10;

  return (
    <>
      {/* Floating Drag Controller & Handle attached to ElevenLabs AI Agent */}
      <div
        id="voice-agent-movable-control"
        className="fixed z-[1001] pointer-events-auto select-none transition-opacity duration-200"
        style={{
          bottom: '100px',
          right: '32px',
          transform: `translate3d(${position.x}px, ${position.y}px, 0)`,
          willChange: 'transform',
          transition: isDragging ? 'none' : isResetting ? 'transform 0.35s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.2s' : 'transform 0.05s ease-out, opacity 0.2s',
          opacity: isHovered || isDragging || isMovedFromOrigin ? 1 : 0.85,
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div
          onPointerDown={handleHandlePointerDown}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium shadow-lg backdrop-blur-md transition-all duration-200 border ${
            isDragging
              ? 'bg-[#002347] text-white border-[#C5A059] shadow-[#C5A059]/30 ring-2 ring-[#C5A059]/50 cursor-grabbing scale-105'
              : 'bg-[#002347]/95 text-[#F8F9FA] border-[#C5A059]/40 hover:border-[#C5A059] hover:bg-[#001730] shadow-black/20 cursor-grab hover:shadow-xl'
          }`}
          title="Drag to reposition the AI Voice Agent anywhere on your screen"
        >
          {/* Grip Icon */}
          <div className="flex items-center text-[#C5A059] opacity-90">
            <GripVertical className="w-3.5 h-3.5" />
          </div>

          <Move className="w-3.5 h-3.5 text-slate-300 group-hover:text-white" />

          {/* Reset button if moved away from original position */}
          {isMovedFromOrigin && (
            <button
              type="button"
              onClick={handleReset}
              onPointerDown={(e) => e.stopPropagation()}
              className="ml-1 p-0.5 rounded-full hover:bg-white/20 text-slate-300 hover:text-[#C5A059] transition-colors"
              title="Reset AI voice agent back to default corner"
              aria-label="Reset AI Voice Agent Position"
            >
              <RotateCcw className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>
    </>
  );
};
