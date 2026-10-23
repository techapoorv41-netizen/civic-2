import React from "react";
import { MapPin } from "lucide-react";

const IssueMap = ({ location }) => {
  if (!location || !location.lat || !location.lng) {
    return (
      <div className="w-full h-52 bg-govLight rounded-2xl flex flex-col items-center justify-center text-govText/70 text-xs border border-slate-200">
        <MapPin size={24} className="mb-1 text-govSlate" />
        <span>Location map preview unavailable</span>
      </div>
    );
  }

  const mapUrl = `https://maps.google.com/maps?q=${location.lat},${location.lng}&z=15&output=embed`;

  return (
    <div className="w-full h-52 rounded-2xl overflow-hidden border border-slate-200 shadow-inner relative group">
      <iframe
        title="Issue Location Map"
        src={mapUrl}
        className="w-full h-full border-0 grayscale hover:grayscale-0 transition-all duration-300"
        loading="lazy"
      />
      <div className="absolute bottom-2 left-2 bg-govNavy/90 text-white text-[10px] px-2 py-1 rounded-lg backdrop-blur-sm flex items-center gap-1 font-mono">
        <MapPin size={12} className="text-govOrange" />
        {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
      </div>
    </div>
  );
};

export default IssueMap;