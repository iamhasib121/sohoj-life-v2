"use client";

import { useState, useEffect } from "react";
import { Timer } from "lucide-react";

export default function FlashSaleTimer() {
  const [timeLeft, setTimeLeft] = useState({
    hours: 5,
    minutes: 32,
    seconds: 45,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return prev;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 my-6">
      <div className="bg-gradient-to-r from-red-600 to-orange-600 text-white p-4 rounded-lg flex flex-col md:flex-row items-center justify-between shadow-md">
        <div className="flex items-center gap-3 mb-3 md:mb-0">
          <Timer className="w-8 h-8 animate-pulse" />
          <div>
            <h3 className="font-bold text-lg">Flash Sale Today!</h3>
            <p className="text-xs text-red-100">Grab your organic products at a special discounted price.</p>
          </div>
        </div>

        {/* Countdown boxes */}
        <div className="flex items-center gap-2 font-bold text-sm">
          <div className="bg-white text-gray-800 px-3 py-1.5 rounded shadow">
            {String(timeLeft.hours).padStart(2, "0")} <span className="text-[10px] text-gray-500 block">Hours</span>
          </div>
          <span>:</span>
          <div className="bg-white text-gray-800 px-3 py-1.5 rounded shadow">
            {String(timeLeft.minutes).padStart(2, "0")} <span className="text-[10px] text-gray-500 block">Mins</span>
          </div>
          <span>:</span>
          <div className="bg-white text-gray-800 px-3 py-1.5 rounded shadow">
            {String(timeLeft.seconds).padStart(2, "0")} <span className="text-[10px] text-gray-500 block">Secs</span>
          </div>
        </div>
      </div>
    </div>
  );
}
