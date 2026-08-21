import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { AppShell } from "@/components/AppShell";
import { useAppSettings, waLink } from "@/lib/settings";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  ArrowRight,
  Facebook,
  Instagram,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Sparkles,
  Compass,
  Bookmark,
  ShieldCheck,
  Building2,
  Play,
  Pause,
  Volume2,
  VolumeX,
  ChevronLeft,
  ChevronRight,
  Tv,
  Film
} from "lucide-react";

export const Route = createFileRoute("/home")({
  head: () => ({
    meta: [
      { title: "SOLIDAS TILES AND MARBLE NIG. LIMITED — Architectural Showroom" },
      {
        name: "description",
        content:
          "SOLIDAS TILES AND MARBLE NIG. LIMITED is your trusted supplier of premium tiles, marble, granite, foreign security doors, wooden doors, PVC ceiling and architectural building materials in Abuja.",
      },
      { property: "og:title", content: "SOLIDAS — Premium Building Materials Showroom" },
      {
        property: "og:description",
        content: "Dealers & Suppliers of Tiles, Marble, Granite, Security Doors & Architectural Finishes.",
      },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  const { data: s } = useAppSettings();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [busy, setBusy] = useState(false);

  // Hero Videos State
  const [heroVideos, setHeroVideos] = useState<any[]>([]);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);

  // Showcase Video Slider State (Between Instant WA Quotes and Get in Touch)
  const [showcaseVideos, setShowcaseVideos] = useState<any[]>([]);
  const [currentShowcaseIndex, setCurrentShowcaseIndex] = useState(0);
  const [showcaseMuted, setShowcaseMuted] = useState(true);
  const [showcasePlaying, setShowcasePlaying] = useState(true);

  // Touch gesture state
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const minSwipeDistance = 50;

  useEffect(() => {
    const fetchVideos = async () => {
      const { data } = await supabase
        .from("hero_videos")
        .select("*")
        .eq("is_active", true)
        .order("order_index", { ascending: true });
      if (data && data.length > 0) {
        setHeroVideos(data);
      } else {
        setHeroVideos([
          { id: "1", url: "https://assets.mixkit.co/videos/preview/mixkit-modern-apartment-interior-design-39908-large.mp4" },
          { id: "2", url: "https://assets.mixkit.co/videos/preview/mixkit-architectural-model-design-details-39909-large.mp4" },
          { id: "3", url: "https://assets.mixkit.co/videos/preview/mixkit-spinning-architectural-plans-39910-large.mp4" }
        ]);
      }
    };
    void fetchVideos();
  }, []);

  useEffect(() => {
    const fetchShowcase = async () => {
      try {
        const { data } = await supabase
          .from("showcase_videos" as any)
          .select("*")
          .eq("is_active", true)
          .order("order_index", { ascending: true });

        if (data && data.length > 0) {
          setShowcaseVideos(data);
        } else {
          setShowcaseVideos([
            {
              id: "sc-1",
              url: "https://assets.mixkit.co/videos/preview/mixkit-interior-of-a-modern-apartment-39907-large.mp4",
              title: "Luxury Marble & Porcelain Floor Installation"
            },
            {
              id: "sc-2",
              url: "https://assets.mixkit.co/videos/preview/mixkit-modern-apartment-interior-design-39908-large.mp4",
              title: "Imported Security & Architectural Doors Showcase"
            },
            {
              id: "sc-3",
              url: "https://assets.mixkit.co/videos/preview/mixkit-architectural-model-design-details-39909-large.mp4",
              title: "Precision Granite & Wall Cladding Solutions"
            }
          ]);
        }
      } catch (err) {
        console.warn("Notice loading showcase videos:", err);
      }
    };
    void fetchShowcase();
  }, []);

  const handleShowcaseVideoEnded = () => {
    setCurrentShowcaseIndex((prev) => (prev + 1) % Math.max(1, showcaseVideos.length));
  };

  const handleVideoEnded = () => {
    setCurrentVideoIndex((prev) => (prev + 1) % heroVideos.length);
  };

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    if (isLeftSwipe) {
      setCurrentVideoIndex((prev) => (prev + 1) % heroVideos.length);
    } else if (isRightSwipe) {
      setCurrentVideoIndex((prev) => (prev - 1 + heroVideos.length) % heroVideos.length);
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetWa = s?.sales_whatsapp || "2348035186355";
    setBusy(true);
    try {
      const msg = `Hello SOLIDAS! My name is ${name}. Please contact me regarding building materials at ${phone}.`;
      window.open(waLink(targetWa, msg), "_blank", "noopener,noreferrer");
      toast.success("Opening WhatsApp Sales Inquiry…");
      setName("");
      setPhone("");
    } finally {
      setBusy(false);
    }
  };

  return (
    <AppShell>
      {/* Hero Architectural Banner */}
      <section
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        className="relative w-full h-[70vh] min-h-[500px] overflow-hidden bg-slate-950"
      >
        {heroVideos.length > 0 && (
          <div className="absolute inset-0 w-full h-full">
            <video
              key={heroVideos[currentVideoIndex]?.id || currentVideoIndex}
              autoPlay
              muted
              playsInline
              onEnded={handleVideoEnded}
              className="w-full h-full object-cover transition-all duration-700 opacity-75"
              src={heroVideos[currentVideoIndex]?.url}
              preload="auto"
            />
            {/* Architectural Dark Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-slate-950/20" />
          </div>
        )}

        {/* Content Overlays */}
        <div className="absolute inset-0 flex flex-col justify-end p-6 sm:p-14 text-white">
          <div className="max-w-3xl space-y-4">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.25em] backdrop-blur">
              <Sparkles className="h-3.5 w-3.5 text-[#1E82A6]" /> Architectural Materials Showroom
            </span>

            <h1 className="font-display text-4xl sm:text-6xl font-extrabold leading-none tracking-tight text-white uppercase">
              SOLIDAS
            </h1>
            <p className="font-display text-lg sm:text-2xl text-[#1E82A6] font-bold">
              SOLIDAS TILES AND MARBLE NIG. LIMITED
            </p>
            <p className="text-xs sm:text-sm text-gray-200 max-w-xl leading-relaxed">
              Dealers & Suppliers of General Building Materials: Premium Tiles, Marble, Granite, Crack Tiles, Foreign Security Doors, Wooden Doors, PVC Ceilings & General Contracts.
            </p>

            <div className="flex flex-wrap gap-3 pt-3">
              <Link
                to="/search"
                search={{ q: "" }}
                className="inline-flex items-center gap-2 rounded-lg bg-[#C0262D] px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-[#9A1B21] transition shadow-lg"
              >
                <Compass className="h-4 w-4" /> Explore Digital Showroom <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/collection"
                className="inline-flex items-center gap-2 rounded-lg border border-white/30 bg-white/10 backdrop-blur px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-white/20 transition"
              >
                <Bookmark className="h-4 w-4 text-[#1E82A6]" /> Project Collections
              </Link>
            </div>
          </div>

          {/* Carousel Navigation Indicators */}
          {heroVideos.length > 1 && (
            <div className="absolute bottom-6 right-6 sm:right-14 flex gap-2 z-10">
              {heroVideos.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentVideoIndex(i)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    currentVideoIndex === i ? "w-8 bg-[#1E82A6]" : "w-2 bg-white/40"
                  }`}
                  aria-label={`Slide ${i + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Trust & Company Highlights */}
      <section className="bg-white border-b border-border py-8">
        <div className="container-app grid gap-6 sm:grid-cols-3">
          <div className="flex items-start gap-4 p-4 rounded-xl border border-border bg-surface-2">
            <Building2 className="h-8 w-8 text-[#1E82A6] shrink-0" />
            <div>
              <h4 className="font-bold text-sm text-foreground">Direct Wholesale Supplier</h4>
              <p className="text-xs text-muted-foreground mt-1">Direct importer & dealer in premium architectural tiles, marble, and foreign doors.</p>
            </div>
          </div>
          <div className="flex items-start gap-4 p-4 rounded-xl border border-border bg-surface-2">
            <ShieldCheck className="h-8 w-8 text-[#C0262D] shrink-0" />
            <div>
              <h4 className="font-bold text-sm text-foreground">Verified RC: 1218629</h4>
              <p className="text-xs text-muted-foreground mt-1">Officially registered Nigerian company operating out of Dei Dei Building Materials Market, Abuja.</p>
            </div>
          </div>
          <div className="flex items-start gap-4 p-4 rounded-xl border border-border bg-surface-2">
            <MessageCircle className="h-8 w-8 text-[#1E82A6] shrink-0" />
            <div>
              <h4 className="font-bold text-sm text-foreground">Instant WhatsApp Quotes</h4>
              <p className="text-xs text-muted-foreground mt-1">Curate your project lookbook and receive formatted WhatsApp quotes instantly.</p>
            </div>
          </div>
        </div>
      </section>

      {/* SOLIDAS Showcase Video Slider (Continuous Showcase) */}
      {showcaseVideos.length > 0 && (
        <section className="bg-slate-950 text-white py-12 border-y border-slate-800 shadow-2xl relative overflow-hidden">
          {/* Ambient Background Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-[#1E82A6]/10 rounded-full blur-3xl pointer-events-none" />

          <div className="container-app space-y-6 relative z-10">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-white/10 pb-4">
              <div>
                <div className="flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-[0.25em] text-[#1E82A6]">
                  <Film className="h-3.5 w-3.5 text-[#C0262D]" /> Architectural Showcase Reel
                </div>
                <h3 className="font-display text-2xl sm:text-3xl font-extrabold text-white uppercase tracking-tight mt-1">
                  SOLIDAS Video Showcase
                </h3>
              </div>
              <p className="text-xs text-slate-400 max-w-md">
                Watch our latest product videos, showroom installations, imported doors, and premium marble craftsmanship.
              </p>
            </div>

            {/* Video Player Box */}
            <div className="relative w-full aspect-video max-h-[550px] rounded-2xl overflow-hidden bg-slate-900 border border-white/15 shadow-2xl group">
              <video
                key={showcaseVideos[currentShowcaseIndex]?.id || currentShowcaseIndex}
                autoPlay={showcasePlaying}
                muted={showcaseMuted}
                playsInline
                onEnded={handleShowcaseVideoEnded}
                className="w-full h-full object-cover transition-all duration-700"
                src={showcaseVideos[currentShowcaseIndex]?.url}
                preload="auto"
              />

              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-slate-950/30 pointer-events-none" />

              {/* Top Title Overlay Badge */}
              <div className="absolute top-4 left-4 sm:top-6 sm:left-6 flex items-center gap-2.5 z-10">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#C0262D] px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-white shadow-md">
                  <Tv className="h-3 w-3" /> Video #{currentShowcaseIndex + 1} of {showcaseVideos.length}
                </span>
                {showcaseVideos[currentShowcaseIndex]?.title && (
                  <span className="hidden sm:inline-block rounded-full bg-slate-900/80 border border-white/20 px-3.5 py-1 text-xs font-bold text-slate-200 backdrop-blur">
                    {showcaseVideos[currentShowcaseIndex].title}
                  </span>
                )}
              </div>

              {/* Center Play/Pause Button */}
              <button
                onClick={() => setShowcasePlaying((p) => !p)}
                className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20 backdrop-blur-2xs"
                aria-label={showcasePlaying ? "Pause Video" : "Play Video"}
              >
                <div className="rounded-full bg-slate-900/90 border border-white/30 p-4 text-white shadow-xl hover:scale-110 transition-transform">
                  {showcasePlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6 text-[#1E82A6] fill-[#1E82A6] ml-0.5" />}
                </div>
              </button>

              {/* Bottom Control Strip */}
              <div className="absolute bottom-4 left-4 right-4 sm:bottom-6 sm:left-6 sm:right-6 flex items-center justify-between z-10">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowcaseMuted((m) => !m)}
                    className="inline-flex items-center gap-1.5 rounded-full bg-slate-900/80 border border-white/20 px-3 py-1.5 text-xs font-bold text-white hover:bg-white/20 transition backdrop-blur"
                  >
                    {showcaseMuted ? <VolumeX className="h-4 w-4 text-[#C0262D]" /> : <Volume2 className="h-4 w-4 text-[#1E82A6]" />}
                    <span className="hidden sm:inline text-[10px]">{showcaseMuted ? "Unmute" : "Mute"}</span>
                  </button>
                </div>

                {/* Slider Dot Indicators */}
                <div className="flex items-center gap-1.5">
                  {showcaseVideos.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentShowcaseIndex(idx)}
                      className={`h-2 rounded-full transition-all duration-300 ${
                        currentShowcaseIndex === idx ? "w-6 bg-[#1E82A6]" : "w-2 bg-white/40 hover:bg-white/70"
                      }`}
                      aria-label={`Go to video ${idx + 1}`}
                    />
                  ))}
                </div>

                {/* Arrow Controls */}
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() =>
                      setCurrentShowcaseIndex(
                        (prev) => (prev - 1 + showcaseVideos.length) % showcaseVideos.length
                      )
                    }
                    className="p-2 rounded-full bg-slate-900/80 border border-white/20 text-white hover:bg-white/20 transition backdrop-blur"
                    aria-label="Previous Video"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() =>
                      setCurrentShowcaseIndex((prev) => (prev + 1) % showcaseVideos.length)
                    }
                    className="p-2 rounded-full bg-slate-900/80 border border-white/20 text-white hover:bg-white/20 transition backdrop-blur"
                    aria-label="Next Video"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Company / Contact Section */}
      <section className="container-app mt-12">
        <div className="text-center max-w-xl mx-auto mb-8 space-y-2">
          <h2 className="font-display text-xs uppercase tracking-[0.2em] font-bold text-[#1E82A6]">
            Get In Touch With SOLIDAS
          </h2>
          <h3 className="font-display text-3xl font-extrabold text-foreground">Visit Our Showrooms & Offices</h3>
          <p className="text-xs text-muted-foreground">
            Contact our building material specialists for samples, project quantities, or site delivery quotes.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2 pb-4">
          <div className="space-y-4">
            {s?.map_url ? (
              <a
                href={s.map_url}
                target="_blank"
                rel="noopener noreferrer"
                className="block rounded-xl border border-border bg-white p-5 shadow-xs space-y-3 hover:border-[#C0262D] transition group"
              >
                <div className="flex items-center gap-3">
                  <MapPin className="h-6 w-6 text-[#C0262D] shrink-0 group-hover:scale-110 transition-transform" />
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#C0262D]">Head Office (Click for Map)</span>
                    <div className="font-bold text-sm text-foreground group-hover:text-[#C0262D] transition">Plot 469, Solidas Plaza</div>
                    <p className="text-xs text-muted-foreground">Saburi District Opp Timber Shed Dei Dei Building Material Mkt. FCT - Abuja</p>
                  </div>
                </div>
              </a>
            ) : (
              <div className="rounded-xl border border-border bg-white p-5 shadow-xs space-y-3">
                <div className="flex items-center gap-3">
                  <MapPin className="h-6 w-6 text-[#C0262D] shrink-0" />
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#C0262D]">Head Office</span>
                    <div className="font-bold text-sm text-foreground">Plot 469, Solidas Plaza</div>
                    <p className="text-xs text-muted-foreground">Saburi District Opp Timber Shed Dei Dei Building Material Mkt. FCT - Abuja</p>
                  </div>
                </div>
              </div>
            )}

            {s?.map_url ? (
              <a
                href={s.map_url}
                target="_blank"
                rel="noopener noreferrer"
                className="block rounded-xl border border-border bg-white p-5 shadow-xs space-y-3 hover:border-[#1E82A6] transition group"
              >
                <div className="flex items-center gap-3">
                  <MapPin className="h-6 w-6 text-[#1E82A6] shrink-0 group-hover:scale-110 transition-transform" />
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#1E82A6]">Branch Office (Click for Map)</span>
                    <div className="font-bold text-sm text-foreground group-hover:text-[#1E82A6] transition">Shop 819 C2 Extension</div>
                    <p className="text-xs text-muted-foreground">Int'l Building Material Mkt Dei Dei, FCT Abuja</p>
                  </div>
                </div>
              </a>
            ) : (
              <div className="rounded-xl border border-border bg-white p-5 shadow-xs space-y-3">
                <div className="flex items-center gap-3">
                  <MapPin className="h-6 w-6 text-[#1E82A6] shrink-0" />
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#1E82A6]">Branch Office</span>
                    <div className="font-bold text-sm text-foreground">Shop 819 C2 Extension</div>
                    <p className="text-xs text-muted-foreground">Int'l Building Material Mkt Dei Dei, FCT Abuja</p>
                  </div>
                </div>
              </div>
            )}

            <div className="rounded-xl border border-border bg-white p-5 shadow-xs space-y-3">
              <div className="flex items-center gap-3">
                <Phone className="h-6 w-6 text-[#1E82A6] shrink-0" />
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#1E82A6]">Telephone Lines</span>
                  <div className="font-bold text-sm text-foreground">0803 518 6355 | 0815 149 5663 | 0904 032 7777</div>
                </div>
              </div>
            </div>

            {s?.company_email && (
              <div className="rounded-xl border border-border bg-white p-5 shadow-xs space-y-3">
                <div className="flex items-center gap-3">
                  <Mail className="h-6 w-6 text-[#1E82A6] shrink-0" />
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#1E82A6]">Email Inquiry</span>
                    <div className="font-bold text-sm text-foreground">{s.company_email}</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <form
            onSubmit={submit}
            className="rounded-xl border border-border bg-white p-6 shadow-sm flex flex-col justify-between"
          >
            <div>
              <h3 className="font-display text-xl font-bold text-foreground">Request Architectural Callback</h3>
              <p className="mt-1 text-xs text-muted-foreground">
                Enter your details to initiate a WhatsApp order or material consultation with SOLIDAS sales team.
              </p>
              <div className="mt-5 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-foreground mb-1">Your Full Name</label>
                  <input
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Chief Japhet / Engr. Musa"
                    className="w-full rounded-lg border border-border bg-surface-2 px-3.5 py-2.5 text-sm outline-none focus:border-[#1E82A6] focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-foreground mb-1">Phone / WhatsApp Number</label>
                  <input
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. 0803 123 4567"
                    className="w-full rounded-lg border border-border bg-surface-2 px-3.5 py-2.5 text-sm outline-none focus:border-[#1E82A6] focus:bg-white"
                  />
                </div>
              </div>
            </div>

            <div className="mt-6">
              <button
                disabled={busy}
                className="w-full rounded-lg bg-[#C0262D] px-5 py-3 text-sm font-bold text-white hover:bg-[#9A1B21] disabled:opacity-60 transition shadow-sm"
              >
                {busy ? "Connecting…" : "Send WhatsApp Request"}
              </button>
            </div>
          </form>
        </div>
      </section>
    </AppShell>
  );
}
