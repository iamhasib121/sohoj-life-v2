"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  addDoc,
  collection,
  getDoc,
  getDocs,
  serverTimestamp,
  setDoc,
  doc,
} from "firebase/firestore";
import {
  ArrowRight,
  Check,
  ChevronRight,
  Heart,
  Minus,
  Plus,
  Search,
  ShoppingBag,
  Star,
  Truck,
  X,
  MessageCircle,
  ShieldCheck,
  RotateCcw,
  Sparkles,
  Menu,
  PackageCheck,
} from "lucide-react";

import { db } from "./firebase";
import { whatsappUrl } from "./storeConfig";
import { useCart } from "../src/context/CartContext";

interface Product {
  id: string;
  name: string;
  price: number;
  oldPrice?: number;
  image: string;
  images?: string[];
  category: string;
  rating?: number;
  stock?: number;
  description?: string;
  featured?: boolean;
  bestSeller?: boolean;
  newArrival?: boolean;
  colors?: string[];
  sizes?: string[];
}

const categories = [
  "All",
  "Men's Wear",
  "Women's Wear",
  "Kids' Wear",
  "Accessories",
];

const banners = [
  {
    eyebrow: "NEW SEASON",
    title: "যা পছন্দ, এখন আরও সহজে",
    subtitle:
      "Quality lifestyle products, fair prices and friendly service.",
  },
  {
    eyebrow: "SOHOJ DEALS",
    title: "আপনার পছন্দের পণ্যে বিশেষ অফার",
    subtitle:
      "সেরা দামে পছন্দের পণ্য কিনুন এবং উপভোগ করুন সহজ shopping experience.",
  },
  {
    eyebrow: "FAST DELIVERY",
    title: "দ্রুত ডেলিভারি, নিশ্চিন্ত কেনাকাটা",
    subtitle: "ঢাকা ও সারা বাংলাদেশে delivery available.",
  },
];

function money(value: number) {
  return `৳${Math.round(value).toLocaleString("en-BD")}`;
}

async function hashPhone(phone: string) {
  const normalized = phone.replace(/\D/g, "");
  const bytes = new TextEncoder().encode(normalized);
  const hash = await crypto.subtle.digest("SHA-256", bytes);

  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export default function HomePage() {
  const {
    cartItems,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    itemCount,
    totalAmount,
    isCartOpen,
    setIsCartOpen,
  } = useCart();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const [category, setCategory] = useState("All");
  const [queryText, setQueryText] = useState("");
  const [sort, setSort] = useState("Featured");

  const [wishlist, setWishlist] = useState<string[]>([]);
  const [banner, setBanner] = useState(0);

  const [coupon, setCoupon] = useState("");
  const [discountRate, setDiscountRate] = useState(0);
  const [couponMessage, setCouponMessage] = useState("");

  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [trackOpen, setTrackOpen] = useState(false);

  const [trackId, setTrackId] = useState("");
  const [trackPhone, setTrackPhone] = useState("");
  const [trackedOrder, setTrackedOrder] = useState<any>(null);
  const [trackError, setTrackError] = useState("");

  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [payment, setPayment] = useState("Cash on Delivery");

  const [placingOrder, setPlacingOrder] = useState(false);
  const [successOrderId, setSuccessOrderId] = useState("");

  const [mobileMenu, setMobileMenu] = useState(false);

  /* -----------------------------
     LOAD PRODUCTS
  ----------------------------- */

  useEffect(() => {
    getDocs(collection(db, "products"))
      .then((snapshot) => {
        const list = snapshot.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        })) as Product[];

        setProducts(list);
      })
      .catch((error) => {
        console.error("Products loading error:", error);
      })
      .finally(() => {
        setLoading(false);
      });

    try {
      const saved = localStorage.getItem("sohoj_wishlist");

      if (saved) {
        setWishlist(JSON.parse(saved));
      }
    } catch {}
  }, []);

  /* -----------------------------
     HERO AUTO SLIDER
  ----------------------------- */

  useEffect(() => {
    const timer = setInterval(() => {
      setBanner((x) => (x + 1) % banners.length);
    }, 4500);

    return () => clearInterval(timer);
  }, []);

  /* -----------------------------
     FILTER PRODUCTS
  ----------------------------- */

  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        const categoryMatch =
          category === "All" || p.category === category;

        const searchMatch = `${p.name} ${p.category}`
          .toLowerCase()
          .includes(queryText.toLowerCase().trim());

        return categoryMatch && searchMatch;
      })
      .sort((a, b) => {
        if (sort === "Price: Low to High") {
          return a.price - b.price;
        }

        if (sort === "Price: High to Low") {
          return b.price - a.price;
        }

        if (sort === "Top Rated") {
          return (b.rating || 0) - (a.rating || 0);
        }

        return Number(b.featured) - Number(a.featured);
      });
  }, [products, category, queryText, sort]);

  const wishlistProducts = products.filter((p) =>
    wishlist.includes(p.id)
  );

  const discountAmount = Math.round(totalAmount * discountRate);
  const finalTotal = totalAmount - discountAmount;

  /* -----------------------------
     WISHLIST
  ----------------------------- */

  const toggleWishlist = (id: string) => {
    setWishlist((prev) => {
      const next = prev.includes(id)
        ? prev.filter((x) => x !== id)
        : [...prev, id];

      localStorage.setItem(
        "sohoj_wishlist",
        JSON.stringify(next)
      );

      return next;
    });
  };

  /* -----------------------------
     COUPON
  ----------------------------- */

  const applyCoupon = () => {
    const code = coupon.trim().toUpperCase();

    if (code === "EID10") {
      setDiscountRate(0.1);
      setCouponMessage("✓ ১০% discount applied");
    } else if (code === "SOHOJ20") {
      setDiscountRate(0.2);
      setCouponMessage("✓ ২০% discount applied");
    } else {
      setDiscountRate(0);
      setCouponMessage("✕ Coupon code সঠিক নয়");
    }
  };

  /* -----------------------------
     PLACE ORDER
  ----------------------------- */

  const placeOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!cartItems.length) return;

    if (
      !customerName.trim() ||
      !phone.trim() ||
      !address.trim()
    ) {
      alert("নাম, ফোন ও ঠিকানা দিন।");
      return;
    }

    setPlacingOrder(true);

    try {
      const phoneHash = await hashPhone(phone);

      const docRef = await addDoc(collection(db, "orders"), {
        customerName: customerName.trim(),
        phone: phone.trim(),
        address: address.trim(),
        payment,

        items: cartItems.map((x) => ({
          productId: x.id,
          name: x.title,
          price: x.price,
          quantity: x.quantity,
          variant: x.variant || "",
        })),

        itemsSummary: cartItems
          .map((x) => `${x.title} x${x.quantity}`)
          .join(", "),

        subtotal: totalAmount,
        discountAmount,
        totalAmount: finalTotal,
        status: "Pending",
        createdAt: serverTimestamp(),
      });

      /*
       IMPORTANT:
       phoneHash is now saved here so Track Order
       can verify the customer's phone number.
      */

      await setDoc(doc(db, "orderTracking", docRef.id), {
        status: "Pending",
        totalAmount: finalTotal,
        itemsSummary: cartItems
          .map((x) => `${x.title} x${x.quantity}`)
          .join(", "),
        phoneHash,
        createdAt: serverTimestamp(),
      });

      setSuccessOrderId(docRef.id);

      clearCart();

      setCoupon("");
      setDiscountRate(0);
      setCouponMessage("");

      setCustomerName("");
      setPhone("");
      setAddress("");
    } catch (error: any) {
      alert(
        error?.message ||
          "Order করতে সমস্যা হয়েছে।"
      );
    } finally {
      setPlacingOrder(false);
    }
  };

  /* -----------------------------
     TRACK ORDER
  ----------------------------- */

  const trackOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    setTrackError("");
    setTrackedOrder(null);

    if (!trackId.trim() || !trackPhone.trim()) {
      setTrackError(
        "Order ID এবং phone number দিন।"
      );
      return;
    }

    try {
      const snap = await getDoc(
        doc(db, "orderTracking", trackId.trim())
      );

      const phoneHash = await hashPhone(trackPhone);

      if (
        !snap.exists() ||
        snap.data().phoneHash !== phoneHash
      ) {
        setTrackError(
          "Order পাওয়া যায়নি। Order ID ও phone ঠিক আছে কি না দেখুন।"
        );
        return;
      }

      setTrackedOrder({
        id: snap.id,
        ...snap.data(),
      });
    } catch (error: any) {
      setTrackError(
        error?.message ||
          "Track করতে সমস্যা হয়েছে।"
      );
    }
  };

  /* -----------------------------
     PRODUCT CARD
  ----------------------------- */

  const ProductCard = ({
    p,
  }: {
    p: Product;
  }) => {
    const out = p.stock === 0;

    const off =
      p.oldPrice && p.oldPrice > p.price
        ? Math.round(
            (1 - p.price / p.oldPrice) * 100
          )
        : 0;

    return (
      <article className="group bg-white rounded-[24px] border border-slate-200/80 overflow-hidden shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
        <div className="relative aspect-[4/5] bg-slate-100 overflow-hidden">
          <Link href={`/product/${p.id}`}>
            <img
              src={p.image}
              alt={p.name}
              className="w-full h-full object-cover group-hover:scale-105 transition duration-700"
            />
          </Link>

          <div className="absolute inset-x-0 top-0 p-3 flex items-start justify-between pointer-events-none">
            <div>
              {(p.newArrival || off > 0) && (
                <span className="inline-flex bg-amber-400 text-slate-950 text-[10px] font-black px-2.5 py-1.5 rounded-full shadow-sm">
                  {off > 0
                    ? `${off}% OFF`
                    : "NEW"}
                </span>
              )}

              {p.bestSeller && !off && (
                <span className="inline-flex bg-slate-950 text-white text-[10px] font-black px-2.5 py-1.5 rounded-full">
                  BEST SELLER
                </span>
              )}
            </div>

            <button
              onClick={() =>
                toggleWishlist(p.id)
              }
              className="pointer-events-auto w-10 h-10 bg-white/95 backdrop-blur rounded-full flex items-center justify-center shadow-md hover:scale-105 transition"
              aria-label="Wishlist"
            >
              <Heart
                className={`w-4.5 h-4.5 ${
                  wishlist.includes(p.id)
                    ? "fill-rose-500 text-rose-500"
                    : "text-slate-700"
                }`}
              />
            </button>
          </div>

          {out && (
            <div className="absolute inset-0 bg-white/75 backdrop-blur-[2px] flex items-center justify-center">
              <span className="bg-slate-950 text-white px-4 py-2 rounded-full text-xs font-black">
                Out of Stock
              </span>
            </div>
          )}
        </div>

        <div className="p-4 md:p-5">
          <Link href={`/product/${p.id}`}>
            <h3 className="font-black text-sm md:text-[15px] leading-5 line-clamp-2 min-h-10 hover:text-amber-600 transition">
              {p.name}
            </h3>
          </Link>

          <div className="flex items-center gap-1.5 mt-2.5 text-xs">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />

            <b>
              {(p.rating || 4.8).toFixed(1)}
            </b>

            <span className="text-slate-400">
              · {p.category}
            </span>
          </div>

          <div className="mt-4 flex items-end justify-between gap-2">
            <div>
              <div className="text-xl md:text-2xl font-black tracking-tight">
                {money(p.price)}
              </div>

              {p.oldPrice && (
                <span className="text-xs text-slate-400 line-through">
                  {money(p.oldPrice)}
                </span>
              )}
            </div>

            <button
              disabled={out}
              onClick={() => {
                addToCart({
                  id: p.id,
                  title: p.name,
                  price: p.price,
                  image: p.image,
                  quantity: 1,
                  stock: p.stock,
                });

                setIsCartOpen(true);
              }}
              className="w-11 h-11 rounded-2xl bg-slate-950 text-white flex items-center justify-center hover:bg-amber-400 hover:text-slate-950 transition disabled:opacity-40 disabled:hover:bg-slate-950 disabled:hover:text-white"
              aria-label="Add to cart"
            >
              <ShoppingBag className="w-4.5 h-4.5" />
            </button>
          </div>
        </div>
      </article>
    );
  };

  return (
    <div className="min-h-screen bg-[#faf9f6] text-slate-900 pb-20 md:pb-0">

      {/* =========================================
          TOP BAR
      ========================================= */}

      <div className="bg-slate-950 text-slate-200 text-[11px] md:text-xs py-2.5 text-center">
        🚚 ঢাকা ৳80 · ঢাকার বাইরে ৳130 · Cash on Delivery available
      </div>

      {/* =========================================
          HEADER
      ========================================= */}

      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 lg:px-6 h-[72px] flex items-center gap-4">

          <Link
            href="/"
            className="shrink-0"
          >
            <div className="text-[23px] md:text-[26px] font-black tracking-tight">
              Sohoj{" "}
              <span className="text-amber-500">
                Life
              </span>
            </div>

            <div className="text-[9px] md:text-[10px] text-slate-500 -mt-1">
              সহজে কিনুন, নিশ্চিন্তে থাকুন
            </div>
          </Link>

          {/* DESKTOP SEARCH */}

          <div className="hidden md:flex flex-1 max-w-xl mx-auto relative">
            <Search className="absolute left-4 top-3.5 w-4 h-4 text-slate-400" />

            <input
              value={queryText}
              onChange={(e) =>
                setQueryText(e.target.value)
              }
              placeholder="আপনার পছন্দের পণ্য খুঁজুন..."
              className="w-full h-11 pl-11 pr-4 rounded-2xl bg-slate-100 border border-transparent focus:border-amber-400 focus:bg-white outline-none text-sm transition"
            />
          </div>

          <div className="ml-auto flex items-center gap-1.5 md:gap-2">

            <button
              onClick={() => setTrackOpen(true)}
              className="hidden lg:flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-bold hover:bg-slate-100 transition"
            >
              <PackageCheck className="w-4 h-4" />
              Track
            </button>

            <button
              onClick={() => {
                if (wishlistProducts.length) {
                  window.location.href = `/product/${wishlistProducts[0].id}`;
                }
              }}
              className="relative hidden sm:flex w-10 h-10 items-center justify-center rounded-xl hover:bg-slate-100 transition"
              aria-label="Wishlist"
            >
              <Heart className="w-5 h-5" />

              {wishlistProducts.length > 0 && (
                <span className="absolute -right-0.5 -top-0.5 min-w-4 h-4 px-1 rounded-full bg-rose-500 text-white text-[9px] flex items-center justify-center font-black">
                  {wishlistProducts.length}
                </span>
              )}
            </button>

            <button
              onClick={() =>
                setIsCartOpen(true)
              }
              className="relative flex items-center gap-2 bg-slate-950 text-white px-3 md:px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-amber-400 hover:text-slate-950 transition"
            >
              <ShoppingBag className="w-4 h-4" />

              <span className="hidden sm:inline">
                Cart
              </span>

              <span className="text-amber-400 font-black">
                {itemCount}
              </span>
            </button>

            <button
              onClick={() =>
                setMobileMenu(!mobileMenu)
              }
              className="md:hidden w-10 h-10 rounded-xl hover:bg-slate-100 flex items-center justify-center"
            >
              {mobileMenu ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* MOBILE SEARCH */}

        <div className="md:hidden px-4 pb-3">
          <div className="relative">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />

            <input
              value={queryText}
              onChange={(e) =>
                setQueryText(e.target.value)
              }
              placeholder="পণ্য খুঁজুন..."
              className="w-full h-10 pl-10 pr-4 rounded-xl bg-slate-100 outline-none text-sm"
            />
          </div>
        </div>

        {/* MOBILE MENU */}

        {mobileMenu && (
          <div className="md:hidden border-t border-slate-100 bg-white px-4 py-3">
            <button
              onClick={() => {
                setTrackOpen(true);
                setMobileMenu(false);
              }}
              className="w-full flex items-center gap-3 py-3 text-sm font-bold"
            >
              <Truck className="w-4 h-4" />
              Track Order
            </button>

            <Link
              href="/admin"
              onClick={() =>
                setMobileMenu(false)
              }
              className="block py-3 text-sm font-bold border-t"
            >
              Admin
            </Link>
          </div>
        )}
      </header>

      {/* =========================================
          HERO
      ========================================= */}

      <section className="relative overflow-hidden bg-slate-950 text-white">

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_15%,rgba(245,158,11,.20),transparent_32%),radial-gradient(circle_at_10%_90%,rgba(255,255,255,.05),transparent_30%)]" />

        <div className="absolute right-[-100px] top-[-100px] w-[350px] h-[350px] rounded-full border border-amber-400/10" />

        <div className="absolute right-[-40px] top-[-40px] w-[230px] h-[230px] rounded-full border border-amber-400/10" />

        <div className="max-w-7xl mx-auto px-4 lg:px-6 py-16 md:py-24 lg:py-28 relative">

          <div className="max-w-3xl">

            <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full border border-amber-400/30 bg-amber-400/10 text-amber-300 text-[10px] md:text-xs font-black tracking-[0.16em]">
              <Sparkles className="w-3.5 h-3.5" />
              {banners[banner].eyebrow}
            </div>

            <h1 className="mt-6 text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black leading-[1.02] tracking-tight max-w-3xl">
              {banners[banner].title}
            </h1>

            <p className="mt-6 text-slate-300 max-w-xl leading-7 text-sm md:text-base">
              {banners[banner].subtitle}
            </p>

            <div className="mt-8 flex flex-wrap gap-3">

              <a
                href="#shop"
                className="bg-amber-400 text-slate-950 px-6 py-3.5 rounded-2xl font-black inline-flex items-center gap-2 hover:bg-amber-300 transition shadow-lg shadow-amber-500/10"
              >
                Shop Now
                <ArrowRight className="w-4 h-4" />
              </a>

              <button
                onClick={() =>
                  setTrackOpen(true)
                }
                className="border border-white/15 bg-white/5 px-6 py-3.5 rounded-2xl font-bold hover:bg-white/10 transition"
              >
                Track Order
              </button>
            </div>

            <div className="mt-10 flex items-center gap-5 text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <Check className="w-4 h-4 text-amber-400" />
                Quality products
              </span>

              <span className="flex items-center gap-1.5">
                <Check className="w-4 h-4 text-amber-400" />
                COD available
              </span>
            </div>
          </div>

          {/* SLIDER DOTS */}

          <div className="absolute right-6 bottom-8 hidden md:flex gap-2">
            {banners.map((_, i) => (
              <button
                key={i}
                onClick={() => setBanner(i)}
                className={`h-1.5 rounded-full transition-all ${
                  i === banner
                    ? "w-10 bg-amber-400"
                    : "w-3 bg-white/30"
                }`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* =========================================
          TRUST FEATURES
      ========================================= */}

      <section className="max-w-7xl mx-auto px-4 lg:px-6 py-7 md:py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">

          {[
            [
              Truck,
              "দ্রুত Delivery",
              "ঢাকা ও সারাদেশে",
            ],
            [
              ShieldCheck,
              "নিরাপদ Checkout",
              "সহজ COD",
            ],
            [
              MessageCircle,
              "WhatsApp Support",
              "সরাসরি যোগাযোগ",
            ],
            [
              RotateCcw,
              "সহজ Return",
              "Friendly service",
            ],
          ].map(([Icon, title, subtitle]: any) => (
            <div
              key={title}
              className="bg-white border border-slate-200/80 rounded-2xl p-4 md:p-5 shadow-sm hover:shadow-md transition"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5" />
                </div>

                <div>
                  <div className="text-xs md:text-sm font-black">
                    {title}
                  </div>

                  <div className="text-[10px] md:text-xs text-slate-400 mt-1">
                    {subtitle}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* =========================================
          PRODUCTS
      ========================================= */}

      <section
        id="shop"
        className="max-w-7xl mx-auto px-4 lg:px-6 pb-16 md:pb-24"
      >

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">

          <div>
            <span className="text-amber-600 font-black text-[10px] uppercase tracking-[0.18em]">
              Our Collection
            </span>

            <h2 className="text-3xl md:text-4xl font-black mt-1 tracking-tight">
              জনপ্রিয় পণ্য
            </h2>

            <p className="text-sm text-slate-500 mt-2">
              আপনার পছন্দের lifestyle products এক জায়গায়
            </p>
          </div>

          <select
            value={sort}
            onChange={(e) =>
              setSort(e.target.value)
            }
            className="bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none font-semibold"
          >
            <option>Featured</option>
            <option>
              Price: Low to High
            </option>
            <option>
              Price: High to Low
            </option>
            <option>Top Rated</option>
          </select>
        </div>

        {/* CATEGORY */}

        <div className="flex gap-2 overflow-x-auto pb-3 mb-6 scrollbar-hide">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() =>
                setCategory(c)
              }
              className={`whitespace-nowrap px-4 py-2.5 rounded-xl text-xs md:text-sm font-black transition ${
                category === c
                  ? "bg-slate-950 text-amber-400 shadow-md"
                  : "bg-white border border-slate-200 text-slate-600 hover:border-slate-300"
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        {/* PRODUCTS */}

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {Array.from({
              length: 8,
            }).map((_, i) => (
              <div
                key={i}
                className="h-[380px] rounded-[24px] bg-slate-200 animate-pulse"
              />
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center text-slate-500">
            কোনো পণ্য পাওয়া যায়নি।
            <br />
            Admin থেকে product add করুন।
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {filteredProducts.map((p) => (
              <ProductCard
                key={p.id}
                p={p}
              />
            ))}
          </div>
        )}
      </section>

      {/* =========================================
          WHY SOHOJ
      ========================================= */}

      <section className="bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 lg:px-6 py-16 md:py-20">

          <div className="max-w-xl mb-8">
            <div className="text-amber-500 font-black text-xs tracking-[0.18em]">
              WHY SOHOJ LIFE
            </div>

            <h2 className="text-3xl md:text-4xl font-black mt-2">
              কেন আমাদের সাথে?
            </h2>

            <p className="text-slate-500 mt-3 text-sm leading-6">
              সহজ shopping, পরিষ্কার pricing এবং মানুষের মতো customer support—সব এক জায়গায়।
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-5">

            {[
              [
                Check,
                "ভালো পণ্য",
                "Curated products with clear pricing and useful everyday choices.",
              ],
              [
                ShoppingBag,
                "সহজ অর্ডার",
                "Cart, COD এবং WhatsApp support—সব এক জায়গায়।",
              ],
              [
                Heart,
                "মানুষের মতো সেবা",
                "প্রয়োজনে সরাসরি support এবং friendly shopping experience.",
              ],
            ].map(([Icon, title, text]: any) => (
              <div
                key={title}
                className="rounded-3xl bg-slate-50 border border-slate-100 p-6 md:p-7"
              >
                <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-700">
                  <Icon className="w-5 h-5" />
                </div>

                <h3 className="font-black text-lg mt-5">
                  {title}
                </h3>

                <p className="text-sm text-slate-500 mt-2 leading-6">
                  {text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================
          CUSTOMER REVIEWS
      ========================================= */}

      <section className="max-w-7xl mx-auto px-4 lg:px-6 py-16 md:py-20">

        <div className="mb-7">
          <span className="text-amber-600 font-black text-xs tracking-[0.18em]">
            CUSTOMER LOVE
          </span>

          <h2 className="text-3xl md:text-4xl font-black mt-2">
            কাস্টমারদের কথা
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-5">

          {[
            [
              "Rafi",
              "পণ্য হাতে পেয়েছি, packaging অনেক সুন্দর ছিল।",
              "5.0",
            ],
            [
              "Nusrat",
              "Order process খুব সহজ। আবারও নেব ইনশাআল্লাহ।",
              "4.9",
            ],
            [
              "Siam",
              "Price আর quality দুটোই ভালো লেগেছে।",
              "4.8",
            ],
          ].map(([name, text, rating]) => (
            <div
              key={name}
              className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm"
            >
              <div className="flex items-center gap-1 text-amber-400">
                {[1, 2, 3, 4, 5].map(
                  (i) => (
                    <Star
                      key={i}
                      className="w-4 h-4 fill-current"
                    />
                  )
                )}

                <span className="text-xs text-slate-400 ml-2">
                  {rating}
                </span>
              </div>

              <p className="text-slate-600 text-sm leading-7 mt-5">
                “{text}”
              </p>

              <p className="mt-5 font-black">
                — {name}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* =========================================
          FOOTER
      ========================================= */}

      <footer className="bg-slate-950 text-white">

        <div className="max-w-7xl mx-auto px-4 lg:px-6 py-14 grid md:grid-cols-4 gap-9">

          <div>
            <div className="text-2xl font-black">
              Sohoj{" "}
              <span className="text-amber-400">
                Life
              </span>
            </div>

            <p className="text-slate-400 text-sm mt-4 leading-7">
              সহজে কিনুন, নিশ্চিন্তে থাকুন।
              Quality lifestyle shopping made simple.
            </p>
          </div>

          <div>
            <h4 className="font-black mb-4">
              Shop
            </h4>

            {categories
              .slice(1)
              .map((c) => (
                <button
                  key={c}
                  onClick={() => {
                    setCategory(c);

                    document
                      .getElementById(
                        "shop"
                      )
                      ?.scrollIntoView({
                        behavior:
                          "smooth",
                      });
                  }}
                  className="block text-slate-400 hover:text-white text-sm py-1.5 transition"
                >
                  {c}
                </button>
              ))}
          </div>

          <div>
            <h4 className="font-black mb-4">
              Help
            </h4>

            <button
              onClick={() =>
                setTrackOpen(true)
              }
              className="block text-slate-400 hover:text-white text-sm py-1.5"
            >
              Track Order
            </button>

            <Link
              href="/admin"
              className="block text-slate-400 hover:text-white text-sm py-1.5"
            >
              Admin
            </Link>
          </div>

          <div>
            <h4 className="font-black mb-4">
              Need help?
            </h4>

            <a
              target="_blank"
              rel="noreferrer"
              href={whatsappUrl(
                "Hello Sohoj Life, I need help."
              )}
              className="inline-flex items-center gap-2 bg-emerald-500 text-white px-4 py-3 rounded-xl font-bold text-sm hover:bg-emerald-400 transition"
            >
              <MessageCircle className="w-4 h-4" />
              WhatsApp Support
            </a>
          </div>
        </div>

        <div className="border-t border-white/10 text-center text-xs text-slate-500 py-5">
          © {new Date().getFullYear()} Sohoj Life. All rights reserved.
        </div>
      </footer>

      {/* =========================================
          CART DRAWER
      ========================================= */}

      {isCartOpen && (
        <div className="fixed inset-0 z-50">

          <div
            onClick={() =>
              setIsCartOpen(false)
            }
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          <aside className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl flex flex-col">

            <div className="p-5 border-b flex items-center justify-between">
              <div>
                <h2 className="font-black text-xl">
                  Your Cart
                </h2>

                <p className="text-xs text-slate-500 mt-1">
                  {itemCount} items
                </p>
              </div>

              <button
                onClick={() =>
                  setIsCartOpen(false)
                }
                className="w-10 h-10 rounded-xl hover:bg-slate-100 flex items-center justify-center"
              >
                <X />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-3">

              {cartItems.length === 0 ? (
                <div className="text-center py-20 text-slate-400">
                  <ShoppingBag className="w-10 h-10 mx-auto mb-3 opacity-30" />

                  <p className="font-bold">
                    কার্ট খালি
                  </p>
                </div>
              ) : (
                cartItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex gap-3 border border-slate-200 rounded-2xl p-3"
                  >
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-20 h-20 object-cover rounded-xl"
                    />

                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm line-clamp-2">
                        {item.title}
                      </p>

                      <p className="text-amber-600 font-black mt-1">
                        {money(item.price)}
                      </p>

                      <div className="flex items-center gap-2 mt-2">

                        <button
                          onClick={() =>
                            updateQuantity(
                              item.id,
                              item.quantity - 1
                            )
                          }
                          className="w-7 h-7 rounded-lg border flex items-center justify-center"
                        >
                          <Minus className="w-3 h-3" />
                        </button>

                        <span className="text-sm font-bold">
                          {item.quantity}
                        </span>

                        <button
                          onClick={() =>
                            updateQuantity(
                              item.id,
                              item.quantity + 1
                            )
                          }
                          className="w-7 h-7 rounded-lg border flex items-center justify-center"
                        >
                          <Plus className="w-3 h-3" />
                        </button>

                        <button
                          onClick={() =>
                            removeFromCart(
                              item.id
                            )
                          }
                          className="ml-auto text-xs text-rose-500 font-bold"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {cartItems.length > 0 && (
              <div className="border-t p-5">

                <div className="flex gap-2">
                  <input
                    value={coupon}
                    onChange={(e) =>
                      setCoupon(e.target.value)
                    }
                    placeholder="Coupon code"
                    className="flex-1 border rounded-xl px-3 py-2.5 text-sm outline-none focus:border-amber-400"
                  />

                  <button
                    onClick={applyCoupon}
                    className="bg-slate-950 text-white px-4 rounded-xl font-bold text-sm"
                  >
                    Apply
                  </button>
                </div>

                {couponMessage && (
                  <p className="text-xs mt-2 text-amber-700">
                    {couponMessage}
                  </p>
                )}

                <div className="mt-4 space-y-2 text-sm">

                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <b>
                      {money(totalAmount)}
                    </b>
                  </div>

                  {discountAmount > 0 && (
                    <div className="flex justify-between text-emerald-600">
                      <span>
                        Discount
                      </span>
                      <b>
                        -{money(
                          discountAmount
                        )}
                      </b>
                    </div>
                  )}

                  <div className="border-t pt-3 flex justify-between text-lg">
                    <b>Total</b>
                    <b>
                      {money(finalTotal)}
                    </b>
                  </div>
                </div>

                <button
                  onClick={() =>
                    setCheckoutOpen(true)
                  }
                  className="mt-4 w-full bg-amber-400 text-slate-950 py-3.5 rounded-xl font-black hover:bg-amber-300 transition"
                >
                  Checkout
                </button>

                <button
                  onClick={clearCart}
                  className="w-full mt-2 text-xs text-slate-400"
                >
                  Clear cart
                </button>
              </div>
            )}
          </aside>
        </div>
      )}

      {/* =========================================
          CHECKOUT MODAL
      ========================================= */}

      {checkoutOpen && (
        <div className="fixed inset-0 z-[60] flex items-end md:items-center justify-center">

          <div
            onClick={() =>
              setCheckoutOpen(false)
            }
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          <div className="relative bg-white w-full md:max-w-lg md:rounded-3xl max-h-[92vh] overflow-y-auto p-6">

            <button
              onClick={() =>
                setCheckoutOpen(false)
              }
              className="absolute right-5 top-5 w-9 h-9 rounded-xl hover:bg-slate-100 flex items-center justify-center"
            >
              <X className="w-5 h-5" />
            </button>

            {successOrderId ? (
              <div className="py-10 text-center">

                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <Check className="w-8 h-8" />
                </div>

                <h2 className="text-2xl font-black mt-5">
                  অর্ডার সফল হয়েছে!
                </h2>

                <p className="text-sm text-slate-500 mt-2">
                  আপনার Order ID
                </p>

                <div className="mt-2 inline-block bg-slate-100 px-4 py-2 rounded-xl font-mono font-black text-sm break-all">
                  {successOrderId}
                </div>

                <p className="text-xs text-slate-500 mt-4">
                  এই ID ও phone number দিয়ে Track Order করতে পারবেন।
                </p>

                <button
                  onClick={() => {
                    setSuccessOrderId("");
                    setCheckoutOpen(false);
                    setIsCartOpen(false);
                  }}
                  className="mt-6 bg-slate-950 text-white px-6 py-3 rounded-xl font-bold"
                >
                  Continue Shopping
                </button>
              </div>
            ) : (
              <>
                <h2 className="text-2xl font-black">
                  Checkout
                </h2>

                <p className="text-sm text-slate-500 mt-1">
                  Delivery details দিন
                </p>

                <form
                  onSubmit={placeOrder}
                  className="mt-6 space-y-4"
                >

                  <input
                    value={customerName}
                    onChange={(e) =>
                      setCustomerName(
                        e.target.value
                      )
                    }
                    required
                    placeholder="আপনার নাম"
                    className="w-full border rounded-xl px-4 py-3 text-sm outline-none focus:border-amber-400"
                  />

                  <input
                    value={phone}
                    onChange={(e) =>
                      setPhone(e.target.value)
                    }
                    required
                    placeholder="মোবাইল নম্বর"
                    className="w-full border rounded-xl px-4 py-3 text-sm outline-none focus:border-amber-400"
                  />

                  <textarea
                    value={address}
                    onChange={(e) =>
                      setAddress(
                        e.target.value
                      )
                    }
                    required
                    rows={3}
                    placeholder="সম্পূর্ণ ঠিকানা"
                    className="w-full border rounded-xl px-4 py-3 text-sm outline-none focus:border-amber-400"
                  />

                  <div>
                    <p className="font-bold text-sm mb-2">
                      Payment
                    </p>

                    <label className="flex items-center gap-3 border rounded-xl p-3">
                      <input
                        type="radio"
                        checked={
                          payment ===
                          "Cash on Delivery"
                        }
                        onChange={() =>
                          setPayment(
                            "Cash on Delivery"
                          )
                        }
                      />

                      <span className="text-sm font-semibold">
                        Cash on Delivery
                      </span>
                    </label>
                  </div>

                  <div className="bg-slate-50 rounded-2xl p-4">

                    <div className="flex justify-between text-sm">
                      <span>Subtotal</span>
                      <b>
                        {money(
                          totalAmount
                        )}
                      </b>
                    </div>

                    {discountAmount > 0 && (
                      <div className="flex justify-between text-sm text-emerald-600 mt-2">
                        <span>
                          Discount
                        </span>

                        <b>
                          -{money(
                            discountAmount
                          )}
                        </b>
                      </div>
                    )}

                    <div className="border-t mt-3 pt-3 flex justify-between text-lg">
                      <b>Total</b>
                      <b>
                        {money(finalTotal)}
                      </b>
                    </div>
                  </div>

                  <button
                    disabled={placingOrder}
                    className="w-full bg-amber-400 text-slate-950 py-3.5 rounded-xl font-black disabled:opacity-50"
                  >
                    {placingOrder
                      ? "অর্ডার হচ্ছে..."
                      : `অর্ডার কনফার্ম · ${money(
                          finalTotal
                        )}`}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}

      {/* =========================================
          TRACKING MODAL
      ========================================= */}

      {trackOpen && (
        <div className="fixed inset-0 z-[60] flex items-end md:items-center justify-center">

          <div
            onClick={() =>
              setTrackOpen(false)
            }
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          <div className="relative bg-white w-full md:max-w-lg md:rounded-3xl p-6">

            <button
              onClick={() =>
                setTrackOpen(false)
              }
              className="absolute right-5 top-5 w-9 h-9 rounded-xl hover:bg-slate-100 flex items-center justify-center"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center">
              <Truck className="w-5 h-5" />
            </div>

            <h2 className="text-2xl font-black mt-5">
              Track Order
            </h2>

            <p className="text-sm text-slate-500 mt-1">
              Order ID + phone number দিন
            </p>

            <form
              onSubmit={trackOrder}
              className="mt-6 space-y-3"
            >

              <input
                value={trackId}
                onChange={(e) =>
                  setTrackId(e.target.value)
                }
                placeholder="Order ID"
                className="w-full border rounded-xl px-4 py-3 text-sm outline-none focus:border-amber-400"
              />

              <input
                value={trackPhone}
                onChange={(e) =>
                  setTrackPhone(
                    e.target.value
                  )
                }
                placeholder="Phone number"
                className="w-full border rounded-xl px-4 py-3 text-sm outline-none focus:border-amber-400"
              />

              <button className="w-full bg-slate-950 text-white py-3.5 rounded-xl font-black hover:bg-slate-800 transition">
                Track Order
              </button>
            </form>

            {trackError && (
              <p className="mt-4 text-sm text-rose-600 bg-rose-50 rounded-xl p-3">
                {trackError}
              </p>
            )}

            {trackedOrder && (
              <div className="mt-5 bg-slate-50 rounded-2xl p-5">

                <p className="font-mono text-xs text-slate-500 break-all">
                  #{trackedOrder.id}
                </p>

                <p className="font-black mt-2">
                  Status:{" "}
                  <span className="text-amber-600">
                    {trackedOrder.status}
                  </span>
                </p>

                <div className="mt-6 grid grid-cols-4 gap-1">

                  {[
                    "Pending",
                    "Processing",
                    "Shipped",
                    "Delivered",
                  ].map((s) => {

                    const steps = [
                      "Pending",
                      "Processing",
                      "Shipped",
                      "Delivered",
                    ];

                    const active =
                      steps.indexOf(
                        trackedOrder.status
                      ) >= steps.indexOf(s);

                    return (
                      <div
                        key={s}
                        className={`text-[10px] text-center ${
                          active
                            ? "text-emerald-600 font-bold"
                            : "text-slate-400"
                        }`}
                      >
                        <div className="flex justify-center mb-1">
                          <div
                            className={`w-3 h-3 rounded-full ${
                              active
                                ? "bg-emerald-500"
                                : "bg-slate-300"
                            }`}
                          />
                        </div>

                        {s}
                      </div>
                    );
                  })}
                </div>

                <div className="mt-6 pt-4 border-t flex justify-between text-sm">
                  <span>Total</span>

                  <b>
                    {money(
                      trackedOrder.totalAmount ||
                        0
                    )}
                  </b>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* =========================================
          MOBILE BOTTOM NAV
      ========================================= */}

      <div className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-xl border-t border-slate-200 px-4 py-2">

        <div className="grid grid-cols-4">

          <a
            href="#shop"
            className="flex flex-col items-center gap-1 py-1.5 text-slate-600"
          >
            <ShoppingBag className="w-5 h-5" />
            <span className="text-[9px] font-bold">
              Shop
            </span>
          </a>

          <button
            onClick={() => {
              if (wishlistProducts.length) {
                window.location.href = `/product/${wishlistProducts[0].id}`;
              }
            }}
            className="relative flex flex-col items-center gap-1 py-1.5 text-slate-600"
          >
            <Heart className="w-5 h-5" />

            {wishlistProducts.length > 0 && (
              <span className="absolute top-0 right-[calc(50%-14px)] min-w-4 h-4 rounded-full bg-rose-500 text-white text-[8px] flex items-center justify-center">
                {wishlistProducts.length}
              </span>
            )}

            <span className="text-[9px] font-bold">
              Wishlist
            </span>
          </button>

          <button
            onClick={() =>
              setTrackOpen(true)
            }
            className="flex flex-col items-center gap-1 py-1.5 text-slate-600"
          >
            <Truck className="w-5 h-5" />
            <span className="text-[9px] font-bold">
              Track
            </span>
          </button>

          <button
            onClick={() =>
              setIsCartOpen(true)
            }
            className="relative flex flex-col items-center gap-1 py-1.5 text-slate-950"
          >
            <ShoppingBag className="w-5 h-5" />

            {itemCount > 0 && (
              <span className="absolute top-0 right-[calc(50%-14px)] min-w-4 h-4 rounded-full bg-amber-400 text-slate-950 text-[8px] font-black flex items-center justify-center">
                {itemCount}
              </span>
            )}

            <span className="text-[9px] font-black">
              Cart
            </span>
          </button>

        </div>
      </div>
    </div>
  );
}
