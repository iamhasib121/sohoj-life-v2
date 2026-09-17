"use client";
import React, { useState } from "react";

export default function ProductGallery() {
  const images = [
    "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=60",
    "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=60",
    "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=500&auto=format&fit=crop&q=60"
  ];

  const [activeImg, setActiveImg] = useState(images[0]);
  const [isZoomed, setIsZoomed] = useState(false);

  return (
    <div className="flex flex-col gap-4 max-w-md mx-auto">
      {/* Main Big Image with Zoom Effect */}
      <div 
        className="relative h-80 rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 cursor-zoom-in shadow-sm"
        onMouseEnter={() => setIsZoomed(true)}
        onMouseLeave={() => setIsZoomed(false)}
      >
        <img 
          src={activeImg} 
          alt="Product" 
          className={`w-full h-full object-cover transition-transform duration-500 ${isZoomed ? "scale-125" : "scale-100"}`} 
        />
        <span className="absolute bottom-3 right-3 bg-black/60 text-white text-[10px] px-2.5 py-1 rounded-lg backdrop-blur-sm">
          🔍 হোভার করে জুম করুন
        </span>
      </div>

      {/* Thumbnails */}
      <div className="flex gap-3 justify-center">
        {images.map((img, idx) => (
          <button 
            key={idx} 
            onClick={() => setActiveImg(img)}
            className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition ${activeImg === img ? "border-amber-500 shadow-md scale-105" : "border-slate-200 opacity-70 hover:opacity-100"}`}
          >
            <img src={img} alt="Thumb" className="w-full h-full object-cover" />
          </button>
        ))}
      </div>
    </div>
  );
}
