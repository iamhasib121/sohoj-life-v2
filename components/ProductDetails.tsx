"use client";

import { useState } from "react";
import Image from "next/image";
import { Minus, Plus, ShoppingBag, ShieldCheck, ZoomIn } from "lucide-react";

export default function ProductDetails() {
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState("500 Gm");

  // Sample Product Data
  const product = {
    title: "Savory Molasses Fresh Brown Sugar",
    originalPrice: 320,
    price: 290,
    discount: "11% OFF",
    sku: "product-9",
    categories: "Date molasses, Organic Products",
    description:
      "Soft brown sugar with molasses flavor for tea, baking, and desserts. Choose your preferred quantity and add fresh organic groceries directly to cart.",
    variants: ["250 Gm", "1KG", "500 Gm"],
    images: [
      "/images/brown-sugar.jpg", // আপনার পাবলিক ফোল্ডারের ইমেজ পাথ দিন
    ],
  };

  const decreaseQty = () => {
    if (quantity > 1) setQuantity(quantity - 1);
  };

  const increaseQty = () => {
    setQuantity(quantity + 1);
  };

  // WhatsApp Order Message Generator
  const handleWhatsAppOrder = () => {
    const phoneNumber = "8801700000000"; // আপনার হোয়াটসঅ্যাপ নাম্বার দিন
    const message = `Hello, I want to buy:\nProduct: ${product.title}\nVariant: ${selectedVariant}\nQuantity: ${quantity}\nTotal Price: ${product.price * quantity}৳`;
    const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="text-xs text-gray-500 mb-6 flex items-center gap-1">
        <span>Home</span> / <span>Organic Products</span> /{" "}
        <span className="text-gray-800 font-medium">{product.title}</span>
      </nav>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 bg-white p-6 rounded-lg border border-gray-100 shadow-sm">
        {/* Left Side: Product Image & Gallery */}
        <div className="relative border border-gray-200 rounded-lg p-4 flex items-center justify-center min-h-[400px]">
          <span className="absolute top-3 left-3 bg-green-600 text-white text-xs px-2 py-1 rounded font-bold">
            {product.discount}
          </span>
          <button className="absolute top-3 right-3 text-gray-400 hover:text-gray-700">
            <ZoomIn className="w-5 h-5" />
          </button>
          
          {/* Placeholder/Image */}
          <div className="w-full h-80 relative flex items-center justify-center bg-gray-50 rounded">
             <span className="text-gray-400 font-medium text-sm">[ Product Image Here ]</span>
          </div>
        </div>

        {/* Right Side: Product Info */}
        <div className="flex flex-col">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            {product.title}
          </h1>

          {/* Price */}
          <div className="flex items-center gap-3 mb-2">
            <span className="text-xl text-gray-400 line-through">
              {product.originalPrice}৳
            </span>
            <span className="text-2xl font-bold text-green-600">
              {product.price}৳
            </span>
          </div>

          {/* স্টক কাউন্টডাউন বা লিমিটেড স্টক অ্যালার্ট */}
          <div className="flex items-center gap-2 bg-rose-50 border border-rose-200 text-rose-700 px-3 py-2 rounded-xl text-xs font-semibold my-3 w-fit animate-pulse">
            <span>🔥</span>
            <span>সীমিত স্টক: মাত্র ৩টি পণ্য বাকি আছে! দ্রুত অর্ডার করুন।</span>
          </div>

          <p className="text-gray-600 text-sm mb-6 leading-relaxed">
            {product.description}
          </p>

          {/* Variant Selector */}
          <div className="mb-6">
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Quantity
            </label>
            <div className="flex items-center gap-2">
              {product.variants.map((variant) => (
                <button
                  key={variant}
                  onClick={() => setSelectedVariant(variant)}
                  className={`px-4 py-1.5 text-xs font-semibold rounded border transition ${
                    selectedVariant === variant
                      ? "bg-green-600 text-white border-green-600"
                      : "bg-gray-50 text-gray-700 border-gray-300 hover:border-green-600"
                  }`}
                >
                  {variant}
                </button>
              ))}
            </div>
          </div>

          {/* Quantity Counter & Buttons */}
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <div className="flex items-center border border-gray-300 rounded bg-gray-50">
              <button
                onClick={decreaseQty}
                className="px-3 py-2 text-gray-600 hover:bg-gray-200 transition"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="px-4 py-2 text-sm font-bold text-gray-800">
                {quantity}
              </span>
              <button
                onClick={increaseQty}
                className="px-3 py-2 text-gray-600 hover:bg-gray-200 transition"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <button className="bg-black hover:bg-gray-800 text-white text-sm font-bold px-6 py-2.5 rounded transition">
              Buy Now
            </button>

            <button className="bg-green-600 hover:bg-green-700 text-white text-sm font-bold px-6 py-2.5 rounded flex items-center gap-2 transition">
              <ShoppingBag className="w-4 h-4" /> Add to Cart
            </button>
          </div>

          {/* WhatsApp Button */}
          <button
            onClick={handleWhatsAppOrder}
            className="w-full bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 mb-6 transition"
          >
            WhatsApp
          </button>

          {/* SKU & Meta */}
          <div className="text-xs text-gray-500 space-y-1 mb-6 border-t pt-4">
            <p><span className="font-semibold text-gray-700">SKU:</span> {product.sku}</p>
            <p><span className="font-semibold text-gray-700">Categories:</span> {product.categories}</p>
          </div>

          {/* Guarantee Badge */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 flex items-center gap-4">
            <ShieldCheck className="w-10 h-10 text-green-600 flex-shrink-0" />
            <div>
              <h4 className="font-bold text-gray-800 text-sm">100% money back guarantee!</h4>
              <p className="text-xs text-gray-500">
                Shop with confidence — if you're not satisfied, we'll return your money with a hassle-free refund process.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
