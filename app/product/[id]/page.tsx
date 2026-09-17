"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { doc, getDoc } from "firebase/firestore";
import { ArrowLeft, Heart, Minus, Plus, ShoppingBag, Star, Truck, ShieldCheck } from "lucide-react";
import { db } from "../../firebase";
import { STORE, whatsappUrl } from "../../storeConfig";
import { useCart } from "../../../src/context/CartContext";

interface Product { id: string; name: string; price: number; oldPrice?: number; image: string; images?: string[]; category?: string; rating?: number; stock?: number; description?: string; colors?: string[]; sizes?: string[]; sku?: string; }

export default function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { addToCart, setIsCartOpen, itemCount } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [selectedImage, setSelectedImage] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getDoc(doc(db, "products", id)).then((snap) => {
      if (!snap.exists()) return setError("Product not found");
      const data = { id: snap.id, ...snap.data() } as Product;
      setProduct(data);
      setSelectedImage(data.image);
      setSelectedColor(data.colors?.[0] || "");
      setSelectedSize(data.sizes?.[0] || "");
    }).catch(() => setError("Product load করতে সমস্যা হয়েছে")).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="min-h-screen grid place-items-center text-slate-500">Loading product...</div>;
  if (error || !product) return <div className="min-h-screen grid place-items-center"><div className="text-center"><p className="font-bold text-xl">{error || "Product not found"}</p><Link href="/" className="inline-block mt-4 bg-slate-950 text-white px-5 py-3 rounded-xl">Back to Store</Link></div></div>;

  const gallery = [product.image, ...(product.images || [])].filter(Boolean).filter((x, i, a) => a.indexOf(x) === i);
  const out = product.stock === 0;
  const off = product.oldPrice && product.oldPrice > product.price ? Math.round((1 - product.price / product.oldPrice) * 100) : 0;
  const message = `Hello Sohoj Life, I want to order:\nProduct: ${product.name}\nProduct ID: ${product.id}\nQuantity: ${quantity}${selectedColor ? `\nColor: ${selectedColor}` : ""}${selectedSize ? `\nSize: ${selectedSize}` : ""}\nTotal: ৳${(product.price * quantity).toLocaleString("en-BD")}`;

  return <div className="min-h-screen bg-[#faf9f6] text-slate-900"><header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b"><div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between"><Link href="/" className="flex items-center gap-2 font-bold"><ArrowLeft className="w-4 h-4" /> Sohoj Life</Link><button onClick={() => setIsCartOpen(true)} className="bg-slate-950 text-white rounded-xl px-4 py-2 text-sm font-bold"><ShoppingBag className="inline w-4 h-4 mr-2" />Cart {itemCount}</button></div></header><main className="max-w-7xl mx-auto px-4 py-8"><div className="text-xs text-slate-500 mb-5">Home / {product.category || "Product"} / {product.name}</div><div className="grid lg:grid-cols-2 gap-10 bg-white border rounded-3xl p-5 md:p-8"><div><div className="aspect-square bg-slate-50 rounded-2xl overflow-hidden"><img src={selectedImage} alt={product.name} className="w-full h-full object-contain" /></div><div className="flex gap-3 mt-3 overflow-x-auto">{gallery.map((img) => <button key={img} onClick={() => setSelectedImage(img)} className={`w-20 h-20 rounded-xl border p-1 shrink-0 ${selectedImage === img ? "border-amber-500" : "border-slate-200"}`}><img src={img} alt="" className="w-full h-full object-cover rounded-lg" /></button>)}</div></div><div className="py-2"><div className="flex gap-2 mb-3">{off > 0 && <span className="bg-rose-100 text-rose-700 px-2 py-1 rounded-lg text-xs font-black">{off}% OFF</span>}<span className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded-lg text-xs font-black">{out ? "Out of Stock" : "In Stock"}</span></div><h1 className="text-3xl md:text-4xl font-black leading-tight">{product.name}</h1><div className="flex items-center gap-2 mt-3"><div className="flex text-amber-400">★★★★★</div><span className="text-sm text-slate-500">{(product.rating || 4.8).toFixed(1)} / 5</span></div><div className="mt-6 flex items-end gap-3"><span className="text-4xl font-black text-amber-600">৳{product.price.toLocaleString("en-BD")}</span>{product.oldPrice && <span className="text-lg text-slate-400 line-through">৳{product.oldPrice.toLocaleString("en-BD")}</span>}</div>{product.description && <p className="mt-5 text-slate-600 leading-7">{product.description}</p>}{product.colors?.length ? <div className="mt-6"><p className="font-bold text-sm mb-2">Color {selectedColor && `· ${selectedColor}`}</p><div className="flex gap-2 flex-wrap">{product.colors.map((c) => <button key={c} onClick={() => setSelectedColor(c)} className={`px-4 py-2 rounded-xl border text-sm ${selectedColor === c ? "border-amber-500 bg-amber-50" : "border-slate-200"}`}>{c}</button>)}</div></div> : null}{product.sizes?.length ? <div className="mt-5"><p className="font-bold text-sm mb-2">Size</p><div className="flex gap-2 flex-wrap">{product.sizes.map((s) => <button key={s} onClick={() => setSelectedSize(s)} className={`px-4 py-2 rounded-xl border text-sm ${selectedSize === s ? "border-amber-500 bg-amber-50" : "border-slate-200"}`}>{s}</button>)}</div></div> : null}<div className="mt-7 flex flex-wrap gap-3"><div className="flex items-center border rounded-xl"><button disabled={quantity <= 1} onClick={() => setQuantity((q) => Math.max(1, q - 1))} className="p-3"><Minus className="w-4 h-4" /></button><span className="w-10 text-center font-black">{quantity}</span><button disabled={!!product.stock && quantity >= product.stock} onClick={() => setQuantity((q) => q + 1)} className="p-3"><Plus className="w-4 h-4" /></button></div><button disabled={out} onClick={() => { addToCart({ id: product.id, title: product.name, price: product.price, image: product.image, quantity, stock: product.stock, color: selectedColor, variant: selectedSize }); setIsCartOpen(true); }} className="flex-1 min-w-44 bg-slate-950 text-white rounded-xl px-5 py-3 font-black disabled:opacity-40"><ShoppingBag className="inline w-4 h-4 mr-2" />Add to Cart</button></div><a target="_blank" rel="noreferrer" href={whatsappUrl(message)} className="mt-3 w-full block text-center bg-emerald-500 text-white py-3 rounded-xl font-black">Order on WhatsApp</a><div className="grid grid-cols-3 gap-2 mt-6"><div className="bg-slate-50 rounded-xl p-3 text-center"><Truck className="w-5 h-5 mx-auto" /><span className="text-[10px] block mt-1">Fast Delivery</span></div><div className="bg-slate-50 rounded-xl p-3 text-center"><ShieldCheck className="w-5 h-5 mx-auto" /><span className="text-[10px] block mt-1">Secure Order</span></div><div className="bg-slate-50 rounded-xl p-3 text-center"><Heart className="w-5 h-5 mx-auto" /><span className="text-[10px] block mt-1">Wishlist</span></div></div>{product.sku && <p className="mt-5 text-xs text-slate-400">SKU: {product.sku}</p>}</div></div></main></div>;
}
