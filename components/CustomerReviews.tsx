import React from "react";

export default function CustomerReviews() {
  const reviews = [
    {
      name: "রাহিম আহমেদ",
      location: "ঢাকা",
      rating: 5,
      comment: "পণ্যটির কোয়ালিটি সত্যিই চমৎকার! যেমনটা ভেবেছিলাম, ঠিক তেমনই পেয়েছি। ধন্যবাদ!",
      date: "২ দিন আগে"
    },
    {
      name: "সাদিয়া ইসলাম",
      location: "চট্টগ্রাম",
      rating: 5,
      comment: "অরিজিনাল প্রোডাক্ট এবং ফাস্ট ডেলিভারি। সার্ভিস খুবই ভালো লেগেছে।",
      date: "সপ্তাহ খানেক আগে"
    },
    {
      name: "তানভীর হাসান",
      location: "সিলেট",
      rating: 4.5,
      comment: "দাম হিসেবে কোয়ালিটি দারুণ। সবাই নিতে পারেন, ঠকবেন না।",
      date: "চলতি মাস"
    }
  ];

  return (
    <section className="max-w-6xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <span className="text-xs font-bold text-amber-600 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
          Happy Customers 🌟
        </span>
        <h2 className="text-2xl font-bold text-slate-900 mt-2">আমাদের সন্তুষ্ট ক্রেতাদের মতামত</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {reviews.map((rev, idx) => (
          <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-1 text-amber-500 mb-3">
                {"★".repeat(Math.floor(rev.rating))}
                <span className="text-slate-400 text-xs ml-1 font-semibold">({rev.rating})</span>
              </div>
              <p className="text-slate-700 text-sm italic mb-4">"{rev.comment}"</p>
            </div>
            <div className="border-t border-slate-100 pt-3 flex justify-between items-center">
              <div>
                <h4 className="font-bold text-slate-900 text-sm">{rev.name}</h4>
                <p className="text-xs text-slate-500">{rev.location}</p>
              </div>
              <span className="text-[11px] text-slate-400">{rev.date}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
