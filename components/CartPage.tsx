"use client";

import { useState } from "react";
import Link from "next/link";
import { X, Trash2, ArrowRight } from "lucide-react";

export default function CartPage() {
  const [quantity, setQuantity] = useState(1);
  const [coupon, setCoupon] = useState("");
  const [discount, setDiscount] = useState(0);

  const productPrice = 290;
  const subtotal = productPrice * quantity;
  const total = subtotal - discount;

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    if (coupon.toLowerCase() === "discount10") {
      setDiscount(50);
      alert("Coupon applied successfully!");
    } else {
      alert("Invalid coupon code!");
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Page Title */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Cart</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left & Center: Cart Table */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b bg-gray-50 text-xs uppercase text-gray-500 font-semibold">
                    <th className="p-4">Product</th>
                    <th className="p-4">Price</th>
                    <th className="p-4">Quantity</th>
                    <th className="p-4">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 text-sm">
                  <tr>
                    <td className="p-4 flex items-center gap-4">
                      <button className="text-gray-400 hover:text-red-600 transition">
                        <X className="w-4 h-4" />
                      </button>
                      <div className="w-12 h-12 bg-gray-100 rounded border flex items-center justify-center text-xs text-gray-400">
                        [Img]
                      </div>
                      <span className="font-medium text-gray-800">
                        Savory Molasses Fresh Brown Sugar - 500 Gm
                      </span>
                    </td>
                    <td className="p-4 text-gray-600">{productPrice}৳</td>
                    <td className="p-4">
                      <input
                        type="number"
                        min="1"
                        value={quantity}
                        onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-16 border rounded px-2 py-1 text-center outline-none"
                      />
                    </td>
                    <td className="p-4 font-bold text-gray-800">{subtotal}৳</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Coupon Section */}
          <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              placeholder="Coupon code"
              value={coupon}
              onChange={(e) => setCoupon(e.target.value)}
              className="flex-1 border border-gray-300 rounded px-4 py-2 text-sm outline-none focus:border-green-600"
            />
            <button
              onClick={handleApplyCoupon}
              className="border border-green-600 text-green-600 hover:bg-green-600 hover:text-white px-6 py-2 rounded text-sm font-bold transition"
            >
              Apply coupon
            </button>
          </div>
        </div>

        {/* Right Side: Cart Totals */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">
              Cart Totals
            </h3>
            
            <div className="space-y-3 text-sm mb-6">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span className="font-semibold text-gray-800">{subtotal}৳</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount</span>
                  <span>-{discount}৳</span>
                </div>
              )}
              <div className="border-t pt-3 flex justify-between text-base font-bold text-gray-800">
                <span>Total</span>
                <span className="text-green-600">{total}৳</span>
              </div>
            </div>

            <Link
              href="/checkout"
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded text-center block transition shadow-md"
            >
              PROCEED TO CHECKOUT
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
