import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useAppSettings, waLink } from "@/lib/settings";
import { toast } from "sonner";
import { Facebook, Instagram, Mail, MapPin, MessageCircle, Phone, Building2 } from "lucide-react";
import { AppShell } from "@/components/AppShell";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact Us — SOLIDAS TILES AND MARBLE NIG. LIMITED" },
      { name: "description", content: "Contact SOLIDAS TILES AND MARBLE NIG. LIMITED in Dei Dei, Abuja. Phone: 08035186355, 08151495663, 09040327777." },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  const { data: s } = useAppSettings();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      const targetWa = s?.sales_whatsapp || "2348035186355";
      const msg = `Hello SOLIDAS! My name is ${name}. Please contact me regarding building materials at ${phone}.`;
      window.open(waLink(targetWa, msg), "_blank", "noopener,noreferrer");
      toast.success("Opening WhatsApp Sales Inquiry…");
      setName(""); setPhone("");
    } catch {
      toast.error("Couldn't open WhatsApp");
    } finally {
      setBusy(false);
    }
  };

  return (
    <AppShell>
      <div className="container-app py-10 space-y-8">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#1E82A6]">Corporate Contacts</span>
          <h1 className="font-display text-3xl font-extrabold text-foreground mt-1">SOLIDAS TILES AND MARBLE NIG. LIMITED</h1>
          <p className="mt-1 text-xs text-muted-foreground">Dealers & Suppliers of General Building Materials. Visit our Head Office or Branch Office in Abuja.</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-4">
            {s?.map_url ? (
              <a
                href={s.map_url}
                target="_blank"
                rel="noopener noreferrer"
                className="block rounded-xl border border-border bg-white p-5 shadow-xs hover:border-[#C0262D] transition group"
              >
                <div className="flex items-start gap-3">
                  <MapPin className="h-6 w-6 text-[#C0262D] shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#C0262D]">Head Office (Click for Map)</span>
                    <div className="font-bold text-sm text-foreground group-hover:text-[#C0262D] transition">Plot 469, Solidas Plaza</div>
                    <p className="text-xs text-muted-foreground mt-0.5">Saburi District Opp Timber Shed Dei Dei Building Material Mkt. FCT - Abuja</p>
                  </div>
                </div>
              </a>
            ) : (
              <div className="rounded-xl border border-border bg-white p-5 shadow-xs space-y-3">
                <div className="flex items-start gap-3">
                  <MapPin className="h-6 w-6 text-[#C0262D] shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#C0262D]">Head Office</span>
                    <div className="font-bold text-sm text-foreground">Plot 469, Solidas Plaza</div>
                    <p className="text-xs text-muted-foreground mt-0.5">Saburi District Opp Timber Shed Dei Dei Building Material Mkt. FCT - Abuja</p>
                  </div>
                </div>
              </div>
            )}

            {s?.map_url ? (
              <a
                href={s.map_url}
                target="_blank"
                rel="noopener noreferrer"
                className="block rounded-xl border border-border bg-white p-5 shadow-xs hover:border-[#1E82A6] transition group"
              >
                <div className="flex items-start gap-3">
                  <Building2 className="h-6 w-6 text-[#1E82A6] shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#1E82A6]">Branch Office (Click for Map)</span>
                    <div className="font-bold text-sm text-foreground group-hover:text-[#1E82A6] transition">Shop 819 C2 Extension</div>
                    <p className="text-xs text-muted-foreground mt-0.5">Int'l Building Material Mkt Dei Dei, FCT Abuja</p>
                  </div>
                </div>
              </a>
            ) : (
              <div className="rounded-xl border border-border bg-white p-5 shadow-xs space-y-3">
                <div className="flex items-start gap-3">
                  <Building2 className="h-6 w-6 text-[#1E82A6] shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#1E82A6]">Branch Office</span>
                    <div className="font-bold text-sm text-foreground">Shop 819 C2 Extension</div>
                    <p className="text-xs text-muted-foreground mt-0.5">Int'l Building Material Mkt Dei Dei, FCT Abuja</p>
                  </div>
                </div>
              </div>
            )}

            <div className="rounded-xl border border-border bg-white p-5 shadow-xs space-y-3">
              <div className="flex items-start gap-3">
                <Phone className="h-6 w-6 text-[#1E82A6] shrink-0 mt-0.5" />
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#1E82A6]">Official Telephone Lines</span>
                  <div className="font-bold text-sm text-foreground">0803 518 6355</div>
                  <div className="font-bold text-sm text-foreground">0815 149 5663</div>
                  <div className="font-bold text-sm text-foreground">0904 032 7777</div>
                </div>
              </div>
            </div>

            {s?.company_email && (
              <a href={`mailto:${s.company_email}`} className="flex items-center gap-3 rounded-xl border border-border bg-white p-5 shadow-xs hover:border-[#1E82A6] transition">
                <Mail className="h-6 w-6 text-[#1E82A6] shrink-0" />
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#1E82A6]">Email Address</span>
                  <div className="font-bold text-sm text-foreground">{s.company_email}</div>
                </div>
              </a>
            )}

            <div className="flex flex-wrap gap-3 pt-2">
              <a
                href={s?.facebook_url || "https://facebook.com"}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="grid h-10 w-10 place-items-center rounded-full bg-[#1877F2] text-white shadow-md transition-all duration-200 ease-out hover:-translate-y-0.5 hover:scale-110 hover:shadow-lg motion-reduce:hover:translate-y-0 motion-reduce:hover:scale-100"
              >
                <svg className="h-5 w-5 fill-white" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </a>
              <a
                href={s?.instagram_url || "https://instagram.com"}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-tr from-[#fdf497] via-[#fd5949] to-[#d6249f] text-white shadow-md transition-all duration-200 ease-out hover:-translate-y-0.5 hover:scale-110 hover:shadow-lg motion-reduce:hover:translate-y-0 motion-reduce:hover:scale-100"
              >
                <svg className="h-5 w-5 fill-white" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </a>
              <a
                href={s?.tiktok_url || "https://tiktok.com"}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="TikTok"
                className="grid h-10 w-10 place-items-center rounded-full bg-black text-white shadow-md ring-1 ring-white/20 transition-all duration-200 ease-out hover:-translate-y-0.5 hover:scale-110 hover:shadow-lg motion-reduce:hover:translate-y-0 motion-reduce:hover:scale-100"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none">
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
              </a>
              <a
                href={s?.youtube_url || "https://youtube.com"}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="YouTube"
                className="grid h-10 w-10 place-items-center rounded-full bg-[#FF0000] text-white shadow-md transition-all duration-200 ease-out hover:-translate-y-0.5 hover:scale-110 hover:shadow-lg motion-reduce:hover:translate-y-0 motion-reduce:hover:scale-100"
              >
                <svg className="h-5 w-5 fill-white" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </a>
            </div>
          </div>

          <form onSubmit={submit} className="rounded-xl border border-border bg-white p-6 shadow-sm flex flex-col justify-between">
            <div>
              <h2 className="font-display text-xl font-bold text-foreground">Direct Sales Inquiry</h2>
              <p className="mt-1 text-xs text-muted-foreground">Request a call back or building material price consultation via WhatsApp.</p>
              <div className="mt-5 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-foreground mb-1">Your Name</label>
                  <input required value={name} onChange={(e) => setName(e.target.value)} placeholder="Full Name / Company" className="w-full rounded-lg border border-border bg-surface-2 px-3.5 py-2.5 text-sm text-foreground outline-none focus:border-[#1E82A6] focus:bg-white" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-foreground mb-1">Phone Number</label>
                  <input required value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone Number" className="w-full rounded-lg border border-border bg-surface-2 px-3.5 py-2.5 text-sm text-foreground outline-none focus:border-[#1E82A6] focus:bg-white" />
                </div>
              </div>
            </div>

            <div className="mt-6">
              <button disabled={busy} className="w-full rounded-lg bg-[#C0262D] px-5 py-3 text-sm font-bold text-white hover:bg-[#9A1B21] disabled:opacity-60 transition shadow-sm">
                {busy ? "Sending…" : "Connect With Sales Representative"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </AppShell>
  );
}
