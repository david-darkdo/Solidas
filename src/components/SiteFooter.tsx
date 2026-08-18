import { Link } from "@tanstack/react-router";
import { useAppSettings } from "@/lib/settings";
import { Mail, MapPin, Phone } from "lucide-react";

function FacebookBrandIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

function InstagramBrandIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
    </svg>
  );
}

function TikTokBrandIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <path
        d="M19.589 6.686a4.793 4.793 0 0 1-3.77-4.245V2h-3.445v13.672a2.896 2.896 0 0 1-5.201-1.743 2.895 2.895 0 0 1 2.312-2.834V7.633a6.347 6.347 0 0 0-5.115 6.223A6.34 6.34 0 0 0 10.709 20V9.378a8.16 8.16 0 0 0 4.772 1.524v-3.4a4.847 4.847 0 0 1-1.554-.816z"
        fill="#25F4EE"
        transform="translate(-0.8, -0.6)"
      />
      <path
        d="M19.589 6.686a4.793 4.793 0 0 1-3.77-4.245V2h-3.445v13.672a2.896 2.896 0 0 1-5.201-1.743 2.895 2.895 0 0 1 2.312-2.834V7.633a6.347 6.347 0 0 0-5.115 6.223A6.34 6.34 0 0 0 10.709 20V9.378a8.16 8.16 0 0 0 4.772 1.524v-3.4a4.847 4.847 0 0 1-1.554-.816z"
        fill="#FE2C55"
        transform="translate(0.8, 0.6)"
      />
      <path
        d="M19.589 6.686a4.793 4.793 0 0 1-3.77-4.245V2h-3.445v13.672a2.896 2.896 0 0 1-5.201-1.743 2.895 2.895 0 0 1 2.312-2.834V7.633a6.347 6.347 0 0 0-5.115 6.223A6.34 6.34 0 0 0 10.709 20V9.378a8.16 8.16 0 0 0 4.772 1.524v-3.4a4.847 4.847 0 0 1-1.554-.816z"
        fill="#FFFFFF"
      />
    </svg>
  );
}

function YouTubeBrandIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
    </svg>
  );
}

export function SiteFooter() {
  const { data: s } = useAppSettings();
  const mapUrl = s?.map_url || null;

  return (
    <footer className="mt-16 border-t border-border bg-white text-foreground">
      <div className="container-app grid gap-8 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-3">
          <div className="flex items-center gap-2.5">
            <img src="/logo.png" alt="SOLIDAS Logo" className="h-8 w-auto object-contain" />
            <div className="font-display text-lg font-bold tracking-tight text-[#1E82A6]">
              SOLIDAS
            </div>
          </div>
          <p className="text-xs font-semibold text-[#C0262D]">
            SOLIDAS TILES AND MARBLE NIG. LIMITED
          </p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Dealers & Suppliers of General Building Materials Such As Tiles & Marble, Granite, Crack Tiles, Foreign Security Doors, Wooden Doors, PVC Ceiling & General Contracts.
          </p>
          <p className="text-[11px] font-mono text-muted-foreground/70">
            RC Registration: 1218629
          </p>
        </div>

        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-[#1E82A6]">Showroom Discovery</div>
          <ul className="mt-4 space-y-2.5 text-sm">
            <li><Link to="/home" className="text-muted-foreground hover:text-[#1E82A6] transition">Showroom Home</Link></li>
            <li><Link to="/search" search={{ q: "" }} className="text-muted-foreground hover:text-[#1E82A6] transition">Material Catalog & Search</Link></li>
            <li><Link to="/collection" className="text-muted-foreground hover:text-[#1E82A6] transition">Project Collection Workspace</Link></li>
            <li><Link to="/contact" className="text-muted-foreground hover:text-[#1E82A6] transition">Contact & Head Office</Link></li>
          </ul>
        </div>

        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-[#1E82A6]">Offices & Contacts</div>
          <ul className="mt-4 space-y-3 text-xs text-muted-foreground">
            <li className="flex items-start gap-2">
              <MapPin className="mt-0.5 h-4 w-4 text-[#C0262D] shrink-0" />
              <div>
                <strong className="block text-foreground font-semibold">Head Office:</strong>
                {mapUrl ? (
                  <a
                    href={mapUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-[#1E82A6] hover:underline transition"
                  >
                    Plot 469, Solidas Plaza, Saburi District Opp Timber Shed Dei Dei Building Material Mkt. FCT - Abuja
                  </a>
                ) : (
                  <span>Plot 469, Solidas Plaza, Saburi District Opp Timber Shed Dei Dei Building Material Mkt. FCT - Abuja</span>
                )}
              </div>
            </li>
            <li className="flex items-start gap-2">
              <MapPin className="mt-0.5 h-4 w-4 text-[#1E82A6] shrink-0" />
              <div>
                <strong className="block text-foreground font-semibold">Branch Office:</strong>
                {mapUrl ? (
                  <a
                    href={mapUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-[#1E82A6] hover:underline transition"
                  >
                    Shop 819 C2 Extension Int'l Building Material Mkt Dei Dei, FCT Abuja
                  </a>
                ) : (
                  <span>Shop 819 C2 Extension Int'l Building Material Mkt Dei Dei, FCT Abuja</span>
                )}
              </div>
            </li>
            <li className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-[#1E82A6] shrink-0" />
              <span>Tel: 0803 518 6355 | 0815 149 5663 | 0904 032 7777</span>
            </li>
            {s?.company_email && (
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-[#1E82A6] shrink-0" />
                <a href={`mailto:${s.company_email}`} className="hover:text-[#1E82A6]">{s.company_email}</a>
              </li>
            )}
          </ul>
        </div>

        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-[#1E82A6]">Connect & Inquiries</div>
          <p className="mt-4 text-xs text-muted-foreground leading-relaxed">
            Need custom quotes, bulk orders, or architectural samples? Speak directly with our sales team via WhatsApp.
          </p>
          <div className="mt-4">
            <a
              href={`https://wa.me/${(s?.sales_whatsapp || "2348035186355").replace(/[^\d]/g, "")}?text=${encodeURIComponent("Hello SOLIDAS, I would like to inquire about building materials.")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg bg-[#C0262D] px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-[#9A1B21]"
            >
              <Phone className="h-4 w-4" />
              <span>WhatsApp Sales Consultation</span>
            </a>
          </div>
          
          {/* Official 4 Social Platforms — Beautified Official Brand Icons */}
          <ul className="mt-6 flex flex-wrap items-center gap-3">
            <li>
              <a
                href={s?.facebook_url || "https://facebook.com"}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="grid h-10 w-10 place-items-center rounded-full bg-[#1877F2] text-white shadow-md transition-all duration-200 ease-out hover:-translate-y-0.5 hover:scale-110 hover:shadow-lg motion-reduce:hover:translate-y-0 motion-reduce:hover:scale-100"
              >
                <FacebookBrandIcon className="h-5 w-5 fill-white" />
              </a>
            </li>
            <li>
              <a
                href={s?.instagram_url || "https://instagram.com"}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-tr from-[#fdf497] via-[#fd5949] to-[#d6249f] text-white shadow-md transition-all duration-200 ease-out hover:-translate-y-0.5 hover:scale-110 hover:shadow-lg motion-reduce:hover:translate-y-0 motion-reduce:hover:scale-100"
              >
                <InstagramBrandIcon className="h-5 w-5 fill-white" />
              </a>
            </li>
            <li>
              <a
                href={s?.tiktok_url || "https://tiktok.com"}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="TikTok"
                className="grid h-10 w-10 place-items-center rounded-full bg-black text-white shadow-md ring-1 ring-white/20 transition-all duration-200 ease-out hover:-translate-y-0.5 hover:scale-110 hover:shadow-lg motion-reduce:hover:translate-y-0 motion-reduce:hover:scale-100"
              >
                <TikTokBrandIcon className="h-5 w-5 fill-white" />
              </a>
            </li>
            <li>
              <a
                href={s?.youtube_url || "https://youtube.com"}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="YouTube"
                className="grid h-10 w-10 place-items-center rounded-full bg-[#FF0000] text-white shadow-md transition-all duration-200 ease-out hover:-translate-y-0.5 hover:scale-110 hover:shadow-lg motion-reduce:hover:translate-y-0 motion-reduce:hover:scale-100"
              >
                <YouTubeBrandIcon className="h-5 w-5 fill-white" />
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-border py-4 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} SOLIDAS TILES AND MARBLE NIG. LIMITED. All rights reserved.
      </div>
    </footer>
  );
}
