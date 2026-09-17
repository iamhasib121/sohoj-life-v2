"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, User, ShoppingBag, PhoneCall } from "lucide-react";

export default function Header() {
  const [cartCount, setCartCount] = useState(1);
  const [cartTotal, setCartTotal] = useState(290);

  return (
    <header className="w-full bg-white shadow-sm sticky top-0 z-50">
      {/* Top Main Bar */}
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="bg-green-600 text-white p-2 rounded-lg font-bold text-xl">
            EKO
          </div>
          <span className="text-2xl font-bold text-gray-800 tracking-tight">
            EKO <span className="text-green-600">MART</span>
          </span>
        </Link>

        {/* Search Bar with Category Dropdown */}
        <div className="hidden md:flex flex-1 max-w-2xl items-center border-2 border-green-600 rounded-md overflow-hidden">
          <select className="bg-gray-100 text-gray-700 px-3 py-2 text-sm border-r outline-none cursor-pointer">
            <option>All Categories</option>
            <option>Organic Products</option>
            <option>Vegetables</option>
            <option>Fish and Meat</option>
          </select>
          <input
            type="text"
            placeholder="Search Products..."
            className="w-full px-4 py-2 text-sm outline-none"
          />
          <button className="bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 transition">
            <Search className="w-5 h-5" />
          </button>
        </div>

        {/* Right Actions (Account & Cart) */}
        <div className="flex items-center gap-6">
          <Link href="/account" className="flex items-center gap-2 text-gray-700 hover:text-green-600">
            <User className="w-6 h-6" />
          </Link>

          <Link href="/cart" className="flex items-center gap-2 text-gray-700 hover:text-green-600 relative">
            <div className="relative">
              <ShoppingBag className="w-6 h-6" />
              <span className="absolute -top-2 -right-2 bg-green-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                {cartCount}
              </span>
            </div>
            <span className="font-bold text-sm text-gray-800">{cartTotal}৳</span>
          </Link>
        </div>
      </div>

      {/* Navigation Bar */}
      <nav className="bg-green-700 text-white">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between text-sm font-medium">
          <div className="flex items-center space-x-6 overflow-x-auto py-2.5">
            <Link href="/" className="hover:text-green-200 whitespace-nowrap">Home</Link>
            <Link href="/shop" className="hover:text-green-200 whitespace-nowrap">Shop</Link>
            <Link href="/deals" className="hover:text-green-200 whitespace-nowrap">Deals & Offers</Link>
            <Link href="/new-arrivals" className="hover:text-green-200 whitespace-nowrap">New Arrival</Link>
            <Link href="/organic" className="hover:text-green-200 whitespace-nowrap">Organic Products</Link>
            <Link href="/vegetables" className="hover:text-green-200 whitespace-nowrap">Vegetables</Link>
            <Link href="/fish-meat" className="hover:text-green-200 whitespace-nowrap">Fish and Meat</Link>
            <Link href="/help" className="hover:text-green-200 whitespace-nowrap">Help & Support</Link>
          </div>

          <Link
            href="/track-order"
            className="hidden lg:block bg-green-900 hover:bg-green-800 text-white text-xs uppercase px-4 py-2 rounded font-semibold tracking-wider"
          >
            TRACK ORDER
          </Link>
        </div>
      </nav>
    </header>
  );
}
