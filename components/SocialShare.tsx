"use client";
import React from "react";

export default function SocialShare() {
  const shareOnFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`, '_blank');
  };

  const shareOnWhatsApp = () => {
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent("এই চমৎকার পণ্যটি দেখে নিন: " + window.location.href)}`, '_blank');
  };

  return (
    <div className="flex items-center gap-2 my-4">
      <span className="text-xs text-slate-500 font-medium">শেয়ার করুন:</span>
      <button onClick={shareOnFacebook} className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1.5 rounded-lg font-medium transition shadow-sm">
        Facebook
      </button>
      <button onClick={shareOnWhatsApp} className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs px-3 py-1.5 rounded-lg font-medium transition shadow-sm">
        WhatsApp
      </button>
    </div>
  );
}
