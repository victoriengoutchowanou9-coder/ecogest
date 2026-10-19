"use client";

import React from "react";
import { MapPin, Navigation, ExternalLink } from "lucide-react";
import { useSubscriptionStore } from "@/lib/subscription-store";

interface SchoolMapProps {
  lat?: number;
  lng?: number;
  zoom?: number;
  className?: string;
}

export const SchoolMap: React.FC<SchoolMapProps> = ({
  lat = 6.3582,
  lng = 2.3985,
  zoom = 15,
  className,
}) => {
  const { activeSchool } = useSubscriptionStore();
  // Free OpenStreetMap embed URL (no secret key needed)
  const osmUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${lng - 0.01}%2C${lat - 0.007}%2C${lng + 0.01}%2C${lat + 0.007}&layer=mapnik&marker=${lat}%2C${lng}`;
  const fullOsmLink = `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=${zoom}/${lat}/${lng}`;

  return (
    <div className="space-y-2">
      <div className="relative w-full h-72 md:h-96 rounded-2xl overflow-hidden border border-slate-200 shadow-sm bg-slate-100">
        <iframe
          title="Localisation de l'établissement"
          width="100%"
          height="100%"
          frameBorder="0"
          scrolling="no"
          marginHeight={0}
          marginWidth={0}
          src={osmUrl}
          className="w-full h-full filter saturate-90"
        />

        {/* Overlay Card */}
        <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm p-3 rounded-xl border border-slate-200 shadow-md max-w-xs">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-school-50 text-school-primary">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900 leading-tight">
                {activeSchool.shortName || activeSchool.name}
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">{activeSchool.address}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center text-xs text-slate-500 px-1">
        <span>Cartographie libre OpenStreetMap</span>
        <a
          href={fullOsmLink}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-school-accent hover:underline font-medium"
        >
          <span>Agrandir la carte</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </div>
  );
};
