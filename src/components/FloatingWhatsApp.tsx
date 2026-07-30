import { useAppSettings, waLink } from "@/lib/settings";
import { useState, useEffect, useRef } from "react";

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg 
      className={className} 
      viewBox="0 0 24 24" 
      fill="currentColor" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.003 5.37 5.378.002 12.038.002c3.223.001 6.253 1.257 8.532 3.538 2.279 2.279 3.532 5.309 3.53 8.533-.004 6.669-5.379 12.037-12.04 12.037-2.006-.001-3.978-.5-5.733-1.45L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.725 1.45 5.536 0 10.04-4.502 10.04-10.042.002-2.684-1.047-5.207-2.952-7.114C16.528 1.543 14.015.498 11.33.498c-5.539 0-10.043 4.503-10.046 10.043-.002 1.737.457 3.432 1.348 4.93L1.508 22.09l6.722-1.758c-1.52.83-2.013.91-1.583.822zM17.16 14.28c-.282-.142-1.67-.824-1.928-.918-.258-.094-.446-.142-.634.142-.188.282-.728.918-.892 1.107-.164.188-.328.212-.61.07-2.8-.14-3.79-1.12-4.52-1.75-.434-.378-.857-.866-1.112-1.3-.164-.282-.018-.435.122-.575.126-.126.282-.328.423-.493.142-.164.188-.282.282-.47.094-.188.047-.353-.024-.494-.07-.142-.634-1.527-.868-2.09-.23-.553-.48-.48-.657-.487-.168-.008-.363-.01-.557-.01-.195 0-.51.073-.777.363-.267.29-1.02.996-1.02 2.43 0 1.432 1.043 2.815 1.185 3.003.142.188 2.012 3.172 4.957 4.316.7.273 1.246.435 1.672.57.702.222 1.34.19 1.844.116.563-.083 1.67-.682 1.905-1.34.234-.658.234-1.22.164-1.34-.07-.116-.258-.188-.54-.33z"/>
    </svg>
  );
}

export function FloatingWhatsApp() {
  const { data: settings } = useAppSettings();
  const phone = settings?.support_whatsapp;
  
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const elementRef = useRef<HTMLAnchorElement>(null);

  // Load saved position or set defaults
  useEffect(() => {
    const saved = localStorage.getItem("whatsapp_position");
    if (saved) {
      try {
        setPosition(JSON.parse(saved));
      } catch {
        // ignore
      }
    }
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    // Only drag with left click
    if (e.button !== 0) return;
    setIsDragging(true);
    dragStart.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y
    };
    e.preventDefault();
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    const touch = e.touches[0];
    dragStart.current = {
      x: touch.clientX - position.x,
      y: touch.clientY - position.y
    };
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      
      let newX = e.clientX - dragStart.current.x;
      let newY = e.clientY - dragStart.current.y;
      
      setPosition({ x: newX, y: newY });
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDragging) return;
      const touch = e.touches[0];
      let newX = touch.clientX - dragStart.current.x;
      let newY = touch.clientY - dragStart.current.y;
      
      setPosition({ x: newX, y: newY });
    };

    const handleMouseUp = () => {
      if (isDragging) {
        setIsDragging(false);
        localStorage.setItem("whatsapp_position", JSON.stringify(position));
      }
    };

    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
      window.addEventListener("touchmove", handleTouchMove, { passive: true });
      window.addEventListener("touchend", handleMouseUp);
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleMouseUp);
    };
  }, [isDragging, position]);

  if (!phone) return null;

  return (
    <a
      ref={elementRef}
      href={isDragging ? undefined : waLink(phone, "Hi! I need help finding a product.")}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Ask Question on WhatsApp"
      style={{
        transform: `translate(${position.x}px, ${position.y}px)`,
        cursor: isDragging ? "grabbing" : "grab",
        touchAction: "none"
      }}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      className="fixed bottom-20 right-4 z-40 flex items-center gap-2 rounded-full bg-[#25D366] px-4 py-3 text-white shadow-lg ring-4 ring-[#25D366]/15 select-none hover:bg-[#20ba5a] transition-all"
    >
      <WhatsAppIcon className="h-5 w-5 shrink-0" />
      <span className="text-xs font-bold tracking-wide uppercase">Ask Question</span>
    </a>
  );
}
