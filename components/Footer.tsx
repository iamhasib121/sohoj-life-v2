"use client";

import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-[#0b7300] text-white pt-12 pb-6 mt-12">
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">

        {/* Brand Info */}
        <div>
          <h2 className="text-2xl font-extrabold tracking-wider mb-3">
            EKOMART
          </h2>

          <p className="text-sm text-green-100 leading-relaxed mb-6">
            Your trusted online grocery store for fresh and quality daily
            essentials. We deliver premium grocery products at affordable
            prices with fast and reliable delivery service.
          </p>

          <div className="flex items-center gap-3">

            {/* Facebook */}
            <Link
              href="#"
              className="bg-white/10 hover:bg-white/20 p-2 rounded-full transition"
              aria-label="Facebook"
            >
              <svg
                className="w-4 h-4 fill-current"
                viewBox="0 0 24 24"
              >
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
            </Link>

            {/* Twitter / X */}
            <Link
              href="#"
              className="bg-white/10 hover:bg-white/20 p-2 rounded-full transition"
              aria-label="Twitter"
            >
              <svg
                className="w-4 h-4 fill-current"
                viewBox="0 0 24 24"
              >
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </Link>

            {/* YouTube */}
            <Link
              href="#"
              className="bg-white/10 hover:bg-white/20 p-2 rounded-full transition"
              aria-label="Youtube"
            >
              <svg
                className="w-4 h-4 fill-current"
                viewBox="0 0 24 24"
              >
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
              </svg>
            </Link>

            {/* Instagram */}
            <Link
              href="#"
              className="bg-white/10 hover:bg-white/20 p-2 rounded-full transition"
              aria-label="Instagram"
            >
              <svg
                className="w-4 h-4 fill-current"
                viewBox="0 0 24 24"
              >
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.644-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0 0" />
              </svg>
            </Link>

          </div>
        </div>

        {/* Shop Links */}
        <div>
          <h3 className="text-lg font-bold mb-4 border-b border-green-600 pb-2 inline-block">
            Shop Links
          </h3>

          <ul className="space-y-2 text-sm text-green-100">
            <li>
              <Link href="/" className="hover:underline">
                Home
              </Link>
            </li>

            <li>
              <Link href="/shop" className="hover:underline">
                Shop
              </Link>
            </li>

            <li>
              <Link href="/deals" className="hover:underline">
                Deals & Offers
              </Link>
            </li>

            <li>
              <Link href="/organic" className="hover:underline">
                Organic Products
              </Link>
            </li>
          </ul>
        </div>

        {/* Customer Service */}
        <div>
          <h3 className="text-lg font-bold mb-4 border-b border-green-600 pb-2 inline-block">
            Customer Service
          </h3>

          <ul className="space-y-2 text-sm text-green-100">
            <li>
              <Link href="/contact" className="hover:underline">
                Contact Us
              </Link>
            </li>

            <li>
              <Link href="/return-policy" className="hover:underline">
                Return Policy
              </Link>
            </li>

            <li>
              <Link href="/track-order" className="hover:underline">
                Track Order
              </Link>
            </li>

            <li>
              <Link href="/shipping-policy" className="hover:underline">
                Shipping Policy
              </Link>
            </li>
          </ul>
        </div>

        {/* Information */}
        <div>
          <h3 className="text-lg font-bold mb-4 border-b border-green-600 pb-2 inline-block">
            Information
          </h3>

          <ul className="space-y-2 text-sm text-green-100">
            <li>
              <Link href="/about" className="hover:underline">
                About Us
              </Link>
            </li>

            <li>
              <Link href="/privacy-policy" className="hover:underline">
                Privacy Policy
              </Link>
            </li>

            <li>
              <Link href="/terms" className="hover:underline">
                Terms & Conditions
              </Link>
            </li>

            <li>
              <Link href="/return-policy" className="hover:underline">
                Return Policy
              </Link>
            </li>
          </ul>
        </div>

      </div>

      {/* Payment Gateway Logos & Copyright */}
      <div className="border-t border-green-800 pt-6 max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-green-200">

        <div className="flex items-center gap-2 flex-wrap">
          <span>Pay With</span>

          <div className="bg-white px-3 py-1.5 rounded flex items-center gap-2 text-gray-800 font-semibold text-[10px]">
            <span className="text-blue-800">VISA</span>
            <span className="text-red-600">MasterCard</span>
            <span className="text-pink-600">bKash</span>
            <span className="text-orange-600">Nagad</span>
            <span className="text-green-700">SSLCommerz</span>
          </div>
        </div>

        <p>
          © 2026 EkoMart. All Rights Reserved.
        </p>

      </div>
    </footer>
  );
}
