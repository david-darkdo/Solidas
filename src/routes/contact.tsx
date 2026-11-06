import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { useAppSettings } from "@/lib/settings";
import { Building2, Mail, Phone, Clock, MessageSquare, MapPin } from "lucide-react";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact Us — SOLIDAS TILES AND MARBLE NIG. LIMITED" },
      {
        name: "description",
        content:
          "Contact SOLIDAS TILES AND MARBLE NIG. LIMITED in Dei Dei, Abuja. Phone: 08035186355, 08151495663, 09040327777.",
      },
      { property: "og:title", content: "Contact Us — SOLIDAS TILES AND MARBLE NIG. LIMITED" },
      { property: "og:description", content: "Visit our Abuja showroom in Dei Dei Building Material Market or contact us for nationwide delivery." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://solidas.com.ng/contact" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:title", content: "Contact Us — SOLIDAS TILES AND MARBLE NIG. LIMITED" },
      { name: "twitter:description", content: "Visit our Abuja showroom in Dei Dei Building Material Market or contact us for nationwide delivery." },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  const { data: settings } = useAppSettings();

  const phoneNumbers = [
    { label: "Sales & Inquiries", number: "08035186355" },
    { label: "Customer Care", number: "08151495663" },
    { label: "WhatsApp & Order Desk", number: "09040327777" },
  ];

  return (
    <AppShell>
      <div className="container-app py-8 max-w-4xl space-y-8">
        <div>
          <h1 className="font-display text-xs uppercase tracking-[0.2em] font-bold text-[#1E82A6]">
            Get In Touch
          </h1>
          <p className="mt-1 font-display text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            Contact SOLIDAS Showroom
          </p>
          <p className="mt-2 text-sm text-muted-foreground max-w-xl">
            Visit our Abuja headquarters or reach out directly to our sales and technical consultants for product pricing, stock availability, and site delivery arrangements.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Physical Showroom Address */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-4">
            <div className="h-10 w-10 rounded-xl bg-[#1E82A6]/10 flex items-center justify-center text-[#1E82A6]">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-display text-lg font-bold text-foreground">Main Showroom & Warehouse</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {settings?.company_address || "Plot 469, Solidas Plaza, Saburi District Opp Timber Shed Dei Dei Building Material Mkt. FCT - Abuja"}
              </p>
            </div>

            {settings?.map_url && (
              <a
                href={settings.map_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#1E82A6] hover:underline"
              >
                <MapPin className="h-3.5 w-3.5" />
                View on Google Maps
              </a>
            )}
          </div>

          {/* Contact Channels */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-4">
            <div className="h-10 w-10 rounded-xl bg-[#1E82A6]/10 flex items-center justify-center text-[#1E82A6]">
              <Phone className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-display text-lg font-bold text-foreground">Direct Lines & WhatsApp</h2>
              <ul className="mt-3 space-y-2.5">
                {phoneNumbers.map((p) => (
                  <li key={p.number} className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">{p.label}:</span>
                    <a
                      href={`tel:${p.number}`}
                      className="font-mono font-bold text-[#1E82A6] hover:underline"
                    >
                      {p.number}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {settings?.company_email && (
              <div className="pt-2 border-t border-border flex items-center gap-2 text-xs text-muted-foreground">
                <Mail className="h-3.5 w-3.5 text-[#1E82A6]" />
                <a href={`mailto:${settings.company_email}`} className="hover:underline">
                  {settings.company_email}
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Operating Hours */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm flex items-start gap-4">
          <div className="h-10 w-10 rounded-xl bg-[#1E82A6]/10 flex items-center justify-center text-[#1E82A6] shrink-0">
            <Clock className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-display text-base font-bold text-foreground">Showroom Hours</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Monday – Saturday: 8:00 AM – 6:00 PM (West Africa Time)
              <br />
              Sunday: Closed (WhatsApp inquiries monitored periodically)
            </p>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
