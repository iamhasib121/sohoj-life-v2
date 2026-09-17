"use client";
import React, { useState } from "react";

export default function OrderTrackingModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [phone, setPhone] = useState("");
  const [statusResult, setStatusResult] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone) return;
    // ডেমো স্ট্যাটাস চেক (ফায়ারবেস কানেক্ট থাকলে সরাসরি ডেটাবেস থেকে আনতে পারবেন)
    if (phone === "01700000000") {
      setStatusResult("আপনার অর্ডারটি বর্তমানে 'Pending' অবস্থায় রয়েছে এবং খুব শীঘ্রই ডেলিভারির জন্য পাঠানো হবে।");
    } else {
      setStatusResult("এই নম্বরে কোনো চলমান অর্ডার পাওয়া যায়নি। সঠিক নম্বর দিয়ে আবার চেষ্টা করুন।");
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl relative text-slate-900">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 font-bold">✕</button>
        
        <h3 className="text-lg font-bold mb-1">📦 অর্ডার ট্র্যাক করুন</h3>
        <p className="text-xs text-slate-500 mb-5">আপনার অর্ডার কোন অবস্থায় আছে জানতে মোবাইল নম্বর লিখুন।</p>

        <form onSubmit={handleTrack} className="space-y-3">
          <input 
            type="text" 
            placeholder="আপনার ফোন নম্বর (যেমন: 01700000000)" 
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
            required
          />
          <button type="submit" className="w-full bg-slate-900 text-white font-bold py-2.5 rounded-xl text-xs hover:bg-slate-800 transition">
            স্ট্যাটাস চেক করুন
          </button>
        </form>

        {statusResult && (
          <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 font-medium">
            {statusResult}
          </div>
        )}
      </div>
    </div>
  );
}
