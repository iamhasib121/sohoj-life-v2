"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { addDoc, collection, getDocs, serverTimestamp, setDoc, doc, getDoc } from "firebase/firestore";
import { ArrowRight, Check, ChevronRight, Heart, Minus, Plus, Search, ShoppingBag, Star, Truck, X } from "lucide-react";
import { db } from "./firebase";
import { STORE, whatsappUrl } from "./storeConfig";
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

const categories = ["All", "Men's Wear", "Women's Wear", "Kids' Wear", "Accessories"];
const banners = [
  { eyebrow: "NEW SEASON", title: "যা পছন্দ, এখন আরও সহজে", subtitle: "Quality lifestyle products, fair prices and friendly service." },
  { eyebrow: "SOHOJ DEALS", title: "আজকের পছন্দের পণ্যে বিশেষ অফার", subtitle: "কুপন ব্যবহার করুন এবং আপনার অর্ডার আরও সাশ্রয়ী করুন।" },
  { eyebrow: "FAST DELIVERY", title: "দ্রুত ডেলিভারি, নিশ্চিন্ত কেনাকাটা", subtitle: "ঢাকা ও সারা বাংলাদেশে delivery available." },
];

function money(value: number) {
  return `৳${Math.round(value).toLocaleString("en-BD")}`;
}

async function hashPhone(phone: string) {
  const normalized = phone.replace(/\D/g, "");
  const bytes = new TextEncoder().encode(normalized);
  const hash = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(hash)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

export default function HomePage() {
  const { cartItems, addToCart, updateQuantity, removeFromCart, clearCart, itemCount, totalAmount, isCartOpen, setIsCartOpen } = useCart();
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

  useEffect(() => {
    getDocs(collection(db, "products")).then((snapshot) => {
      setProducts(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })) as Product[]);
    }).catch(console.error).finally(() => setLoading(false));

    try {
      const saved = localStorage.getItem("sohoj_wishlist");
      if (saved) setWishlist(JSON.parse(saved));
    } catch {}
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setBanner((x) => (x + 1) % banners.length), 4500);
    return () => clearInterval(timer);
  }, []);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const categoryMatch = category === "All" || p.category === category;
      const searchMatch = `${p.name} ${p.category}`.toLowerCase().includes(queryText.toLowerCase().trim());
      return categoryMatch && searchMatch;
    }).sort((a, b) => {
      if (sort === "Price: Low to High") return a.price - b.price;
      if (sort === "Price: High to Low") return b.price - a.price;
      if (sort === "Top Rated") return (b.rating || 0) - (a.rating || 0);
      return Number(b.featured) - Number(a.featured);
    });
  }, [products, category, queryText, sort]);

  const wishlistProducts = products.filter((p) => wishlist.includes(p.id));
  const discountAmount = Math.round(totalAmount * discountRate);
  const finalTotal = totalAmount - discountAmount;

  const toggleWishlist = (id: string) => {
    setWishlist((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      localStorage.setItem("sohoj_wishlist", JSON.stringify(next));
      return next;
    });
  };

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

  const placeOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cartItems.length) return;
    if (!customerName.trim() || !phone.trim() || !address.trim()) return alert("নাম, ফোন ও ঠিকানা দিন।");
    setPlacingOrder(true);
    try {
      const phoneHash = await hashPhone(phone);
      const docRef = await addDoc(collection(db, "orders"), {
        customerName: customerName.trim(),
        phone: phone.trim(),
        address: address.trim(),
        payment,
        items: cartItems.map((x) => ({ productId: x.id, name: x.title, price: x.price, quantity: x.quantity, variant: x.variant || "" })),
        itemsSummary: cartItems.map((x) => `${x.title} x${x.quantity}`).join(", "),
        subtotal: totalAmount,
        discountAmount,
        totalAmount: finalTotal,
        status: "Pending",
        createdAt: serverTimestamp(),
      });
      await setDoc(doc(db, "orderTracking", docRef.id), {
        status: "Pending",
        totalAmount: finalTotal,
        itemsSummary: cartItems.map((x) => `${x.title} x${x.quantity}`).join(", "),
        createdAt: serverTimestamp(),
      });
      setSuccessOrderId(docRef.id);
      clearCart();
      setCoupon("");
      setDiscountRate(0);
      setCustomerName("");
      setPhone("");
      setAddress("");
    } catch (error: any) {
      alert(error?.message || "Order করতে সমস্যা হয়েছে।");
    } finally {
      setPlacingOrder(false);
    }
  };

  const trackOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setTrackError("");
    setTrackedOrder(null);
    if (!trackId.trim() || !trackPhone.trim()) return setTrackError("Order ID এবং phone number দিন।");
    try {
      const snap = await getDoc(doc(db, "orderTracking", trackId.trim()));
      const phoneHash = await hashPhone(trackPhone);
      if (!snap.exists() || snap.data().phoneHash !== phoneHash) {
        return setTrackError("Order পাওয়া যায়নি। Order ID ও phone ঠিক আছে কি না দেখুন।");
      }
      setTrackedOrder({ id: snap.id, ...snap.data() });
    } catch (error: any) {
      setTrackError(error?.message || "Track করতে সমস্যা হয়েছে।");
    }
  };

  return (
    <div className="min-h-screen bg-[#faf9f6] text-slate-900">
      <div className="bg-slate-950 text-slate-200 text-xs py-2 text-center">🚚 ঢাকা ৳80 · ঢাকার বাইরে ৳130 · Cash on Delivery available</div>
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/95 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 lg:px-6 h-16 flex items-center gap-4">
          <Link href="/" className="shrink-0">
            <div className="text-2xl font-black tracking-tight">Sohoj <span className="text-amber-500">Life</span></div>
            <div className="text-[10px] text-slate-500 -mt-1">সহজে কিনুন, নিশ্চিন্তে থাকুন</div>
          </Link>
          <div className="hidden md:flex flex-1 max-w-xl mx-auto relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
            <input value={queryText} onChange={(e) => setQueryText(e.target.value)} placeholder="পণ্য খুঁজুন..." className="w-full h-10 pl-10 pr-4 rounded-xl bg-slate-100 border border-transparent focus:border-amber-400 focus:bg-white outline-none text-sm" />
          </div>
          <div className="ml-auto flex items-center gap-2">
            <button onClick={() => setTrackOpen(true)} className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm hover:bg-slate-100"><Truck className="w-4 h-4" /> Track</button>
            <button onClick={() => setCheckoutOpen(false)} className="relative p-2.5 rounded-xl hover:bg-slate-100" aria-label="Wishlist"><Heart className="w-5 h-5" /></button>
            <button onClick={() => setIsCartOpen(true)} className="relative flex items-center gap-2 bg-slate-950 text-white px-3.5 py-2.5 rounded-xl text-sm font-bold"><ShoppingBag className="w-4 h-4" /> Cart <span className="text-amber-400">{itemCount}</span></button>
          </div>
        </div>
        <div className="md:hidden px-4 pb-3 relative"><Search className="absolute left-7 top-2.5 w-4 h-4 text-slate-400" /><input value={queryText} onChange={(e) => setQueryText(e.target.value)} placeholder="পণ্য খুঁজুন..." className="w-full h-10 pl-10 rounded-xl bg-slate-100 text-sm outline-none" /></div>
      </header>

      <section className="relative overflow-hidden bg-slate-950 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(245,158,11,.22),transparent_35%)]" />
        <div className="max-w-7xl mx-auto px-4 lg:px-6 py-16 md:py-24 relative">
          <div className="max-w-2xl">
            <span className="inline-flex px-3 py-1 rounded-full border border-amber-400/30 bg-amber-400/10 text-amber-300 text-xs font-bold tracking-wider">{banners[banner].eyebrow}</span>
            <h1 className="mt-5 text-4xl md:text-6xl font-black leading-[1.05]">{banners[banner].title}</h1>
            <p className="mt-5 text-slate-300 max-w-xl leading-7">{banners[banner].subtitle}</p>
            <div className="mt-8 flex flex-wrap gap-3"><a href="#shop" className="bg-amber-400 text-slate-950 px-6 py-3 rounded-xl font-black inline-flex items-center gap-2">Shop Now <ArrowRight className="w-4 h-4" /></a><button onClick={() => setTrackOpen(true)} className="border border-white/20 px-6 py-3 rounded-xl font-bold">Track Order</button></div>
          </div>
          <div className="absolute right-6 bottom-8 hidden lg:flex gap-2">{banners.map((_, i) => <button key={i} onClick={() => setBanner(i)} className={`h-1.5 rounded-full transition-all ${i === banner ? "w-10 bg-amber-400" : "w-3 bg-white/30"}`} />)}</div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 lg:px-6 py-8 grid grid-cols-2 md:grid-cols-4 gap-3">
        {["🚚 দ্রুত Delivery", "🔒 নিরাপদ Checkout", "💬 WhatsApp Support", "↩️ সহজ Return"].map((x) => <div key={x} className="bg-white border border-slate-200 rounded-2xl p-4 text-sm font-bold text-center shadow-sm">{x}</div>)}
      </section>

      <section id="shop" className="max-w-7xl mx-auto px-4 lg:px-6 pb-16">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6"><div><span className="text-amber-600 font-bold text-xs uppercase tracking-widest">Our Collection</span><h2 className="text-3xl font-black mt-1">জনপ্রিয় পণ্য</h2></div><select value={sort} onChange={(e) => setSort(e.target.value)} className="bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none"><option>Featured</option><option>Price: Low to High</option><option>Price: High to Low</option><option>Top Rated</option></select></div>
        <div className="flex gap-2 overflow-x-auto pb-3 mb-6">{categories.map((c) => <button key={c} onClick={() => setCategory(c)} className={`whitespace-nowrap px-4 py-2.5 rounded-xl text-sm font-bold ${category === c ? "bg-slate-950 text-amber-400" : "bg-white border border-slate-200 text-slate-600"}`}>{c}</button>)}</div>
        {loading ? <div className="grid grid-cols-2 md:grid-cols-4 gap-4">{Array.from({ length: 8 }).map((_, i) => <div key={i} className="h-80 rounded-2xl bg-slate-200 animate-pulse" />)}</div> : filteredProducts.length === 0 ? <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-500">কোনো পণ্য পাওয়া যায়নি। Admin থেকে product add করুন।</div> : <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">{filteredProducts.map((p) => { const out = p.stock === 0; const off = p.oldPrice && p.oldPrice > p.price ? Math.round((1 - p.price / p.oldPrice) * 100) : 0; return <article key={p.id} className="group bg-white rounded-2xl border border-slate-200 overflow-hidden hover:-translate-y-1 hover:shadow-xl transition-all"><div className="relative aspect-[4/5] bg-slate-100 overflow-hidden"><Link href={`/product/${p.id}`}><img src={p.image} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" /></Link>{(p.newArrival || off) && <span className="absolute left-3 top-3 bg-amber-400 text-slate-950 text-[10px] font-black px-2 py-1 rounded-lg">{off ? `${off}% OFF` : "NEW"}</span>}<button onClick={() => toggleWishlist(p.id)} className="absolute right-3 top-3 w-9 h-9 bg-white/90 backdrop-blur rounded-full flex items-center justify-center shadow-sm">{wishlist.includes(p.id) ? <Heart className="w-4 h-4 fill-rose-500 text-rose-500" /> : <Heart className="w-4 h-4" />}</button>{out && <div className="absolute inset-0 bg-white/70 flex items-center justify-center font-black">Out of Stock</div>}</div><div className="p-4"><Link href={`/product/${p.id}`}><h3 className="font-bold text-sm leading-5 line-clamp-2 min-h-10 hover:text-amber-600">{p.name}</h3></Link><div className="flex items-center gap-1 mt-2 text-xs"><Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" /><b>{(p.rating || 4.8).toFixed(1)}</b><span className="text-slate-400">· {p.category}</span></div><div className="mt-3 flex items-end justify-between gap-2"><div><span className="text-xl font-black">{money(p.price)}</span>{p.oldPrice && <span className="ml-2 text-xs text-slate-400 line-through">{money(p.oldPrice)}</span>}</div><button disabled={out} onClick={() => { addToCart({ id: p.id, title: p.name, price: p.price, image: p.image, quantity: 1, stock: p.stock }); setIsCartOpen(true); }} className="p-2.5 rounded-xl bg-slate-950 text-white disabled:opacity-40"><ShoppingBag className="w-4 h-4" /></button></div></div></article>; })}</div>}
      </section>

      <section className="bg-white border-y border-slate-200"><div className="max-w-7xl mx-auto px-4 lg:px-6 py-14 grid md:grid-cols-3 gap-6"><div><div className="text-amber-500 font-black text-sm">WHY SOHOJ LIFE</div><h2 className="text-3xl font-black mt-2">কেন আমাদের সাথে?</h2></div>{[["✓","ভালো পণ্য","Curated products with clear pricing."],["⚡","সহজ অর্ডার","Cart, COD and WhatsApp—সব এক জায়গায়."],["♥","মানুষের মতো সেবা","প্রয়োজনে সরাসরি support." ]].map(([icon,title,text]) => <div key={title} className="rounded-2xl bg-slate-50 p-6"><div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700 font-black">{icon}</div><h3 className="font-black mt-4">{title}</h3><p className="text-sm text-slate-500 mt-2">{text}</p></div>)}</div></section>

      <section className="max-w-7xl mx-auto px-4 lg:px-6 py-14"><div className="flex items-center justify-between mb-5"><div><span className="text-amber-600 font-bold text-xs">CUSTOMER LOVE</span><h2 className="text-3xl font-black">কাস্টমারদের কথা</h2></div></div><div className="grid md:grid-cols-3 gap-4">{[["Rafi","পণ্য হাতে পেয়েছি, packaging অনেক সুন্দর ছিল।","5.0"],["Nusrat","Order process খুব সহজ। আবারও নেব ইনশাআল্লাহ।","4.9"],["Siam","Price আর quality দুটোই ভালো লেগেছে।","4.8"]].map(([n,t,r]) => <div key={n} className="bg-white border border-slate-200 rounded-2xl p-6"><div className="flex text-amber-400 mb-3">★★★★★ <span className="text-xs text-slate-400 ml-2">{r}</span></div><p className="text-slate-600 text-sm leading-6">“{t}”</p><p className="mt-4 font-black">— {n}</p></div>)}</div></section>

      <footer className="bg-slate-950 text-white"><div className="max-w-7xl mx-auto px-4 lg:px-6 py-12 grid md:grid-cols-4 gap-8"><div><div className="text-2xl font-black">Sohoj <span className="text-amber-400">Life</span></div><p className="text-slate-400 text-sm mt-3 leading-6">সহজে কিনুন, নিশ্চিন্তে থাকুন। Quality lifestyle shopping made simple.</p></div><div><h4 className="font-black mb-3">Shop</h4>{categories.slice(1).map((c) => <button key={c} onClick={() => { setCategory(c); document.getElementById("shop")?.scrollIntoView({ behavior: "smooth" }); }} className="block text-slate-400 hover:text-white text-sm py-1">{c}</button>)}</div><div><h4 className="font-black mb-3">Help</h4><button onClick={() => setTrackOpen(true)} className="block text-slate-400 hover:text-white text-sm py-1">Track Order</button><Link href="/admin" className="block text-slate-400 hover:text-white text-sm py-1">Admin</Link></div><div><h4 className="font-black mb-3">Need help?</h4><a target="_blank" rel="noreferrer" href={whatsappUrl("Hello Sohoj Life, I need help.")} className="inline-flex items-center gap-2 bg-emerald-500 text-white px-4 py-2.5 rounded-xl font-bold text-sm">WhatsApp Support</a></div></div><div className="border-t border-white/10 text-center text-xs text-slate-500 py-5">© {new Date().getFullYear()} Sohoj Life. All rights reserved.</div></footer>

      {/* Cart Drawer */}
      {isCartOpen && <div className="fixed inset-0 z-50"><div onClick={() => setIsCartOpen(false)} className="absolute inset-0 bg-black/50" /><aside className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl flex flex-col"><div className="p-5 border-b flex items-center justify-between"><div><h2 className="font-black text-xl">Your Cart</h2><p className="text-xs text-slate-500">{itemCount} items</p></div><button onClick={() => setIsCartOpen(false)}><X /></button></div><div className="flex-1 overflow-y-auto p-5 space-y-3">{cartItems.length === 0 ? <div className="text-center py-16 text-slate-400">কার্ট খালি 🛒</div> : cartItems.map((item) => <div key={item.id} className="flex gap-3 border border-slate-200 rounded-2xl p-3"><img src={item.image} alt={item.title} className="w-20 h-20 object-cover rounded-xl" /><div className="flex-1"><p className="font-bold text-sm line-clamp-2">{item.title}</p><p className="text-amber-600 font-black mt-1">{money(item.price)}</p><div className="flex items-center gap-2 mt-2"><button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="w-7 h-7 rounded-lg border"><Minus className="w-3 h-3 mx-auto" /></button><span className="text-sm font-bold">{item.quantity}</span><button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="w-7 h-7 rounded-lg border"><Plus className="w-3 h-3 mx-auto" /></button><button onClick={() => removeFromCart(item.id)} className="ml-auto text-xs text-rose-500">Remove</button></div></div></div>)}</div>{cartItems.length > 0 && <div className="border-t p-5"><div className="flex gap-2"><input value={coupon} onChange={(e) => setCoupon(e.target.value)} placeholder="Coupon code" className="flex-1 border rounded-xl px-3 py-2.5 text-sm outline-none" /><button onClick={applyCoupon} className="bg-slate-950 text-white px-4 rounded-xl font-bold text-sm">Apply</button></div>{couponMessage && <p className="text-xs mt-2 text-amber-700">{couponMessage}</p>}<div className="mt-4 space-y-2 text-sm"><div className="flex justify-between"><span>Subtotal</span><b>{money(totalAmount)}</b></div>{discountAmount > 0 && <div className="flex justify-between text-emerald-600"><span>Discount</span><b>-{money(discountAmount)}</b></div>}<div className="border-t pt-3 flex justify-between text-lg"><b>Total</b><b>{money(finalTotal)}</b></div></div><button onClick={() => setCheckoutOpen(true)} className="mt-4 w-full bg-amber-400 text-slate-950 py-3 rounded-xl font-black">Checkout</button><button onClick={clearCart} className="w-full mt-2 text-xs text-slate-400">Clear cart</button></div>}</aside></div>}

      {/* Checkout */}
      {checkoutOpen && <div className="fixed inset-0 z-[60] flex items-end md:items-center justify-center"><div onClick={() => setCheckoutOpen(false)} className="absolute inset-0 bg-black/60" /><div className="relative bg-white w-full md:max-w-lg md:rounded-3xl max-h-[92vh] overflow-y-auto p-6"><button onClick={() => setCheckoutOpen(false)} className="absolute right-5 top-5"><X /></button>{successOrderId ? <div className="py-10 text-center"><div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto"><Check className="w-8 h-8" /></div><h2 className="text-2xl font-black mt-5">অর্ডার সফল হয়েছে!</h2><p className="text-sm text-slate-500 mt-2">আপনার Order ID</p><div className="mt-2 inline-block bg-slate-100 px-4 py-2 rounded-xl font-mono font-black">{successOrderId}</div><p className="text-xs text-slate-500 mt-4">এই ID ও phone number দিয়ে Track Order করতে পারবেন।</p><button onClick={() => { setSuccessOrderId(""); setCheckoutOpen(false); setIsCartOpen(false); }} className="mt-6 bg-slate-950 text-white px-6 py-3 rounded-xl font-bold">Continue Shopping</button></div> : <><h2 className="text-2xl font-black">Checkout</h2><p className="text-sm text-slate-500 mt-1">Delivery details দিন</p><form onSubmit={placeOrder} className="mt-6 space-y-4"><input value={customerName} onChange={(e) => setCustomerName(e.target.value)} required placeholder="আপনার নাম" className="w-full border rounded-xl px-4 py-3 text-sm outline-none focus:border-amber-400" /><input value={phone} onChange={(e) => setPhone(e.target.value)} required placeholder="মোবাইল নম্বর" className="w-full border rounded-xl px-4 py-3 text-sm outline-none focus:border-amber-400" /><textarea value={address} onChange={(e) => setAddress(e.target.value)} required rows={3} placeholder="সম্পূর্ণ ঠিকানা" className="w-full border rounded-xl px-4 py-3 text-sm outline-none focus:border-amber-400" /><div><p className="font-bold text-sm mb-2">Payment</p><label className="flex items-center gap-2 border rounded-xl p-3"><input type="radio" checked={payment === "Cash on Delivery"} onChange={() => setPayment("Cash on Delivery")} /> Cash on Delivery</label></div><div className="bg-slate-50 rounded-2xl p-4"><div className="flex justify-between text-sm"><span>Total</span><b>{money(finalTotal)}</b></div></div><button disabled={placingOrder} className="w-full bg-amber-400 text-slate-950 py-3.5 rounded-xl font-black disabled:opacity-50">{placingOrder ? "অর্ডার হচ্ছে..." : `অর্ডার কনফার্ম · ${money(finalTotal)}`}</button></form></>}</div></div>}

      {/* Tracking */}
      {trackOpen && <div className="fixed inset-0 z-[60] flex items-end md:items-center justify-center"><div onClick={() => setTrackOpen(false)} className="absolute inset-0 bg-black/60" /><div className="relative bg-white w-full md:max-w-lg md:rounded-3xl p-6"><button onClick={() => setTrackOpen(false)} className="absolute right-5 top-5"><X /></button><h2 className="text-2xl font-black">Track Order</h2><p className="text-sm text-slate-500 mt-1">Order ID + phone number দিন</p><form onSubmit={trackOrder} className="mt-6 space-y-3"><input value={trackId} onChange={(e) => setTrackId(e.target.value)} placeholder="Order ID" className="w-full border rounded-xl px-4 py-3 text-sm" /><input value={trackPhone} onChange={(e) => setTrackPhone(e.target.value)} placeholder="Phone number" className="w-full border rounded-xl px-4 py-3 text-sm" /><button className="w-full bg-slate-950 text-white py-3 rounded-xl font-black">Track</button></form>{trackError && <p className="mt-4 text-sm text-rose-600">{trackError}</p>}{trackedOrder && <div className="mt-5 bg-slate-50 rounded-2xl p-4"><p className="font-mono text-xs text-slate-500">#{trackedOrder.id}</p><p className="font-black mt-1">Status: <span className="text-amber-600">{trackedOrder.status}</span></p><div className="mt-4 grid grid-cols-4 gap-1 text-[10px] text-center">{["Pending","Processing","Shipped","Delivered"].map((s) => <div key={s} className={`${["Pending","Processing","Shipped","Delivered"].indexOf(trackedOrder.status) >= ["Pending","Processing","Shipped","Delivered"].indexOf(s) ? "text-emerald-600 font-bold" : "text-slate-400"}`}>●<br />{s}</div>)}</div></div>}</div></div>}

      {/* Wishlist mini panel */}
      {wishlistProducts.length > 0 && <button onClick={() => { const first = wishlistProducts[0]; window.location.href = `/product/${first.id}`; }} className="fixed bottom-5 left-5 z-30 hidden md:flex items-center gap-2 bg-white border shadow-lg rounded-full px-4 py-3 text-sm font-bold"><Heart className="w-4 h-4 fill-rose-500 text-rose-500" /> Wishlist ({wishlistProducts.length})</button>}
    </div>
  );
}
