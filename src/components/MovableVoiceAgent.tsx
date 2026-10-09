import React, { useEffect, useRef } from 'react';

/**
 * MovableVoiceAgent attaches pointer event handlers to the container div
 * wrapping the <elevenlabs-convai> widget.
 * 
 * - Drag anywhere on the widget using mouse or touch.
 * - Minimum 6px drag threshold preserves normal trusted clicks/taps to start a call.
 * - Never captures pointer before movement threshold to preserve native click gesture
 *   and microphone/call permissions.
 * - When dragged (>6px), subsequent click is suppressed so a call is not started by accident.
 * - Viewport bounds clamping prevents dragging off-screen.
 * - No extra UI, buttons, icons, handles, labels, or overlays.
 */
export const MovableVoiceAgent: React.FC = () => {
  const posRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  useEffect(() => {
    const wrapper = document.getElementById('convai-draggable-wrapper');
    if (!wrapper) return;

    // Viewport clamping calculation
    const clampPosition = (newX: number, newY: number) => {
      const margin = 8;
      const wWidth = window.innerWidth;
      const wHeight = window.innerHeight;

      let widgetW = 220;
      let widgetH = 64;
      const rightPad = 32;
      const bottomPad = 32;

      const convai = wrapper.querySelector('elevenlabs-convai');
      if (convai && convai.shadowRoot) {
        const box =
          convai.shadowRoot.querySelector('.overlay > *') ||
          convai.shadowRoot.querySelector('button');
        if (box) {
          const rect = box.getBoundingClientRect();
          if (rect.width > 0 && rect.height > 0) {
            widgetW = rect.width;
            widgetH = rect.height;
          }
        }
      }

      // Bounds relative to default bottom-right placement
      const minX = margin - (wWidth - rightPad - widgetW);
      const maxX = rightPad - margin;
      const minY = margin - (wHeight - bottomPad - widgetH);
      const maxY = bottomPad - margin;

      return {
        x: Math.min(Math.max(newX, minX), maxX),
        y: Math.min(Math.max(newY, minY), maxY),
      };
    };

    const updateTransform = (x: number, y: number) => {
      wrapper.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    };

    let isTracking = false;
    let hasDragged = false;
    let startX = 0;
    let startY = 0;
    let startPosX = 0;
    let startPosY = 0;
    let activePointerId: number | null = null;

    const onPointerDown = (e: PointerEvent) => {
      // Only respond to main button (left click or touch)
      if (e.button !== 0) return;

      const convai = wrapper.querySelector('elevenlabs-convai');
      if (!convai) return;

      const path = (e.composedPath ? e.composedPath() : []) as EventTarget[];
      const isOnWidget =
        path.includes(convai) ||
        (e.target instanceof Node && convai.contains(e.target));

      if (!isOnWidget) return;

      // Allow typing without dragging if user touches an input or textarea
      const firstTarget = path[0] as HTMLElement | undefined;
      if (
        firstTarget &&
        (firstTarget.tagName === 'INPUT' ||
          firstTarget.tagName === 'TEXTAREA' ||
          firstTarget.isContentEditable)
      ) {
        return;
      }

      isTracking = true;
      hasDragged = false;
      startX = e.clientX;
      startY = e.clientY;
      startPosX = posRef.current.x;
      startPosY = posRef.current.y;
      activePointerId = e.pointerId;

      // NOTE: We do NOT call setPointerCapture here.
      // Calling setPointerCapture on pointerdown redirects pointerup away from
      // the widget's "Start a call" button and prevents the browser from firing
      // the trusted native click event needed to initiate the call and request
      // microphone permissions.
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!isTracking) return;
      if (activePointerId !== null && e.pointerId !== activePointerId) return;

      const dx = e.clientX - startX;
      const dy = e.clientY - startY;

      // Only treat as drag after moving more than 6px
      if (!hasDragged && Math.hypot(dx, dy) > 6) {
        hasDragged = true;
      }

      if (hasDragged) {
        if (e.cancelable) {
          e.preventDefault();
        }

        const clamped = clampPosition(startPosX + dx, startPosY + dy);
        posRef.current = clamped;
        updateTransform(clamped.x, clamped.y);
      }
    };

    const onPointerUp = (e: PointerEvent) => {
      if (!isTracking) return;
      if (activePointerId !== null && e.pointerId !== activePointerId) return;

      isTracking = false;
      activePointerId = null;

      if (hasDragged) {
        // Suppress subsequent click so the call does not start by accident after dragging
        if (e.cancelable) {
          e.preventDefault();
        }
        e.stopPropagation();

        const suppressClick = (clickEvent: MouseEvent) => {
          clickEvent.stopPropagation();
          clickEvent.stopImmediatePropagation();
          clickEvent.preventDefault();
        };

        window.addEventListener('click', suppressClick, { capture: true, once: true });
        setTimeout(() => {
          window.removeEventListener('click', suppressClick, { capture: true });
        }, 300);
      }
      // If NOT dragged (normal click/tap <= 6px):
      // We do not suppress click or prevent default, so the native click cleanly
      // fires on the "Start a call" button, seamlessly launching the call.
    };

    // Attach pointer event handlers to the container div
    wrapper.addEventListener('pointerdown', onPointerDown);
    wrapper.addEventListener('pointermove', onPointerMove);
    wrapper.addEventListener('pointerup', onPointerUp);
    wrapper.addEventListener('pointercancel', onPointerUp);

    // Also attach move & up to window during drag so fast movements outside bounds aren't lost
    window.addEventListener('pointermove', onPointerMove, { passive: false });
    window.addEventListener('pointerup', onPointerUp);

    const onResize = () => {
      const clamped = clampPosition(posRef.current.x, posRef.current.y);
      if (clamped.x !== posRef.current.x || clamped.y !== posRef.current.y) {
        posRef.current = clamped;
        updateTransform(clamped.x, clamped.y);
      }
    };
    window.addEventListener('resize', onResize);

    return () => {
      wrapper.removeEventListener('pointerdown', onPointerDown);
      wrapper.removeEventListener('pointermove', onPointerMove);
      wrapper.removeEventListener('pointerup', onPointerUp);
      wrapper.removeEventListener('pointercancel', onPointerUp);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  return null;
};
