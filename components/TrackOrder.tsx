"use client";

import { useState } from "react";
import { Search, PackageCheck } from "lucide-react";

export default function TrackOrder() {
  const [orderId, setOrderId] = useState("");
  const [orderStatus, setOrderStatus] = useState(null);

  const handleTrack = (e) => {
    e.preventDefault();
    if (!orderId.trim()) {
      alert("Please enter a valid Order ID");
      return;
    }
    // ডেমো লজিক: যেকোনো আইডি দিলে একটি স্ট্যাটাস দেখাবে
    setOrderStatus({
      id: orderId,
      status: "Processing",
      date: "September 16, 2026",
      items: "Savory Molasses Fresh Brown Sugar - 500 Gm",
      total: "290৳",
    });
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="bg-white border border-gray-200 rounded-lg p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-800 mb-2 text-center">Track Your Order</h1>
        <p className="text-sm text-gray-500 mb-6 text-center">
          Enter your order ID below to check your delivery status.
        </p>

        <form onSubmit={handleTrack} className="flex gap-3 mb-8">
          <input
            type="text"
            placeholder="e.g. EKO-1092"
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
            className="flex-1 border border-gray-300 rounded px-4 py-2.5 text-sm outline-none focus:border-green-600"
          />
          <button
            type="submit"
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2.5 rounded text-sm font-bold flex items-center gap-2 transition"
          >
            <Search className="w-4 h-4" /> Track
          </button>
        </form>

        {orderStatus && (
          <div className="border border-green-200 bg-green-50/50 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4 border-b pb-3">
              <PackageCheck className="w-8 h-8 text-green-600" />
              <div>
                <h3 className="font-bold text-gray-800">Order ID: {orderStatus.id}</h3>
                <p className="text-xs text-gray-500">Placed on {orderStatus.date}</p>
              </div>
            </div>

            <div className="space-y-2 text-sm text-gray-700">
              <p><span className="font-semibold">Status:</span> <span className="text-orange-600 font-bold">{orderStatus.status}</span></p>
              <p><span className="font-semibold">Items:</span> {orderStatus.items}</p>
              <p><span className="font-semibold">Total Amount:</span> {orderStatus.total}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
