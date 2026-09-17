```tsx
"use client";

import { FormEvent, useEffect, useState } from "react";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import {
  ArrowLeft,
  BarChart3,
  Box,
  Edit3,
  LogOut,
  Package,
  RefreshCw,
  Trash2,
  Truck,
} from "lucide-react";
import { auth, db } from "../firebase";
import { uploadDemoProducts } from "../seed";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Product {
  id: string;
  name: string;
  category?: string;
  price: number;
  oldPrice?: number;
  stock?: number;
  image: string;
  rating?: number;
  description?: string;
  featured?: boolean;
  bestSeller?: boolean;
  newArrival?: boolean;
}

interface Order {
  id: string;
  customerName?: string;
  phone?: string;
  address?: string;
  itemsSummary?: string;
  totalAmount?: number;
  status?: string;
  payment?: string;
}

const ADMIN_EMAIL = (process.env.NEXT_PUBLIC_ADMIN_EMAIL || "")
  .trim()
  .toLowerCase();

export default function AdminPage() {
  const router = useRouter();

  const [user, setUser] = useState<any>(null);

  const [loginEmail, setLoginEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loginError, setLoginError] = useState("");
  const [loading, setLoading] = useState(true);

  const [tab, setTab] = useState<"dashboard" | "products" | "orders">(
    "dashboard"
  );

  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);

  const [saving, setSaving] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: "",
    category: "Men's Wear",
    price: "",
    oldPrice: "",
    stock: "10",
    image: "",
    description: "",
    featured: false,
    bestSeller: false,
    newArrival: true,
  });

  // =========================
  // LOAD PRODUCTS + ORDERS
  // =========================

  const loadData = async () => {
    try {
      const [pSnap, oSnap] = await Promise.all([
        getDocs(collection(db, "products")),
        getDocs(collection(db, "orders")),
      ]);

      setProducts(
        pSnap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        })) as Product[]
      );

      setOrders(
        oSnap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        })) as Order[]
      );
    } catch (error) {
      console.error("Load data error:", error);
    }
  };

  // =========================
  // AUTH STATE
  // =========================

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (current) => {
      if (!current) {
        setUser(null);
        setLoading(false);
        return;
      }

      const email = (current.email || "").trim().toLowerCase();

      // Admin email check
      if (ADMIN_EMAIL && email !== ADMIN_EMAIL) {
        await signOut(auth);

        setUser(null);
        setLoginError("এই account-এর Admin access নেই।");
        setLoading(false);

        return;
      }

      setUser(current);

      try {
        await loadData();
      } catch (error) {
        console.error("Admin data loading error:", error);
      }

      setLoading(false);
    });

    return () => unsub();
  }, []);

  // =========================
  // LOGIN
  // =========================

  const login = async (e: FormEvent) => {
    e.preventDefault();

    setLoginError("");

    const email = loginEmail.trim().toLowerCase();

    // Basic validation
    if (!email) {
      setLoginError("Email address দিন।");
      return;
    }

    if (!password) {
      setLoginError("Password দিন।");
      return;
    }

    try {
      console.log("Attempting Firebase login:", email);

      const result = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      const loggedInEmail = (result.user.email || "")
        .trim()
        .toLowerCase();

      console.log("Firebase login successful:", {
        uid: result.user.uid,
        email: loggedInEmail,
      });

      // Admin permission check
      if (ADMIN_EMAIL && loggedInEmail !== ADMIN_EMAIL) {
        await signOut(auth);

        setLoginError("এই account-এর Admin access নেই।");
        return;
      }

      // Login successful
      setLoginError("");

    } catch (error: any) {
      console.error("Firebase Login Error:", {
        code: error?.code,
        message: error?.message,
      });

      switch (error?.code) {
        case "auth/invalid-credential":
          setLoginError(
            "Email অথবা Password ভুল। Firebase Authentication-এ account এবং password যাচাই করুন।"
          );
          break;

        case "auth/wrong-password":
          setLoginError("Password ভুল হয়েছে।");
          break;

        case "auth/user-not-found":
          setLoginError(
            "এই Email দিয়ে কোনো Firebase account পাওয়া যায়নি।"
          );
          break;

        case "auth/invalid-email":
          setLoginError("Email address সঠিক নয়।");
          break;

        case "auth/too-many-requests":
          setLoginError(
            "অনেকবার login চেষ্টা করা হয়েছে। কিছুক্ষণ পরে আবার চেষ্টা করুন।"
          );
          break;

        case "auth/user-disabled":
          setLoginError(
            "এই Firebase account-টি disabled করা হয়েছে।"
          );
          break;

        case "auth/network-request-failed":
          setLoginError(
            "Internet connection সমস্যা হয়েছে। আবার চেষ্টা করুন।"
          );
          break;

        case "auth/operation-not-allowed":
          setLoginError(
            "Firebase Console-এ Email/Password Authentication চালু নেই।"
          );
          break;

        default:
          setLoginError(
            error?.message || "Login failed। আবার চেষ্টা করুন।"
          );
      }
    }
  };

  // =========================
  // RESET PRODUCT FORM
  // =========================

  const resetForm = () => {
    setEditingId(null);

    setForm({
      name: "",
      category: "Men's Wear",
      price: "",
      oldPrice: "",
      stock: "10",
      image: "",
      description: "",
      featured: false,
      bestSeller: false,
      newArrival: true,
    });
  };

  // =========================
  // SAVE PRODUCT
  // =========================

  const saveProduct = async (e: FormEvent) => {
    e.preventDefault();

    if (!form.name.trim() || !form.image.trim() || !form.price) {
      alert("Name, image এবং price দিন।");
      return;
    }

    setSaving(true);

    try {
      const payload = {
        name: form.name.trim(),
        category: form.category,
        price: Number(form.price),
        oldPrice: form.oldPrice
          ? Number(form.oldPrice)
          : null,
        stock: Math.max(0, Number(form.stock || 0)),
        image: form.image.trim(),
        description: form.description.trim(),
        featured: form.featured,
        bestSeller: form.bestSeller,
        newArrival: form.newArrival,
        rating: 4.8,
        updatedAt: serverTimestamp(),
      };

      if (editingId) {
        await updateDoc(
          doc(db, "products", editingId),
          payload
        );
      } else {
        await addDoc(
          collection(db, "products"),
          {
            ...payload,
            createdAt: serverTimestamp(),
          }
        );
      }

      await loadData();
      resetForm();

    } catch (error: any) {
      console.error("Save product error:", error);

      alert(
        error?.message || "Product save failed"
      );
    } finally {
      setSaving(false);
    }
  };

  // =========================
  // EDIT PRODUCT
  // =========================

  const editProduct = (p: Product) => {
    setEditingId(p.id);

    setForm({
      name: p.name || "",
      category: p.category || "Men's Wear",
      price: String(p.price ?? ""),
      oldPrice: String(p.oldPrice ?? ""),
      stock: String(p.stock ?? 0),
      image: p.image || "",
      description: p.description || "",
      featured: !!p.featured,
      bestSeller: !!p.bestSeller,
      newArrival: !!p.newArrival,
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // =========================
  // DELETE PRODUCT
  // =========================

  const removeProduct = async (id: string) => {
    if (!confirm("Product delete করবেন?")) {
      return;
    }

    try {
      await deleteDoc(
        doc(db, "products", id)
      );

      await loadData();

    } catch (error: any) {
      console.error("Delete product error:", error);

      alert(
        error?.message || "Delete failed"
      );
    }
  };

  // =========================
  // UPDATE ORDER STATUS
  // =========================

  const updateStatus = async (
    order: Order,
    status: string
  ) => {
    try {
      await updateDoc(
        doc(db, "orders", order.id),
        {
          status,
          updatedAt: serverTimestamp(),
        }
      );

      await setDoc(
        doc(db, "orderTracking", order.id),
        {
          status,
          totalAmount: order.totalAmount || 0,
          itemsSummary:
            order.itemsSummary || "",
          updatedAt: serverTimestamp(),
        },
        {
          merge: true,
        }
      );

      await loadData();

    } catch (error: any) {
      console.error(
        "Status update error:",
        error
      );

      alert(
        error?.message ||
          "Status update failed"
      );
    }
  };

  // =========================
  // SEED PRODUCTS
  // =========================

  const seed = async () => {
    if (
      !confirm(
        "Demo products database-এ add করবেন?"
      )
    ) {
      return;
    }

    setSeeding(true);

    try {
      await uploadDemoProducts();

      await loadData();

      alert("Demo products added.");

    } catch (error: any) {
      console.error(
        "Seed products error:",
        error
      );

      alert(
        error?.message ||
          "Seed failed"
      );

    } finally {
      setSeeding(false);
    }
  };

  // =========================
  // LOADING
  // =========================

  if (loading) {
    return (
      <div className="min-h-screen grid place-items-center bg-slate-950 text-white">
        Loading admin...
      </div>
    );
  }

  // =========================
  // LOGIN SCREEN
  // =========================

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-950 grid place-items-center p-4">
        <form
          onSubmit={login}
          className="w-full max-w-md bg-white rounded-3xl p-7 shadow-2xl"
        >
          <h1 className="text-2xl font-black">
            Sohoj Life Admin
          </h1>

          <p className="text-sm text-slate-500 mt-1">
            Secure dashboard login
          </p>

          {loginError && (
            <div className="mt-4 p-3 rounded-xl bg-rose-50 text-rose-600 text-sm">
              {loginError}
            </div>
          )}

          <div className="mt-6 space-y-3">

            <input
              type="email"
              required
              value={loginEmail}
              onChange={(e) =>
                setLoginEmail(e.target.value)
              }
              placeholder="Admin email"
              autoComplete="email"
              className="w-full border rounded-xl px-4 py-3"
            />

            <input
              type="password"
              required
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              placeholder="Password"
              autoComplete="current-password"
              className="w-full border rounded-xl px-4 py-3"
            />

            <button
              type="submit"
              className="w-full bg-slate-950 text-white rounded-xl py-3 font-black"
            >
              Login
            </button>

            <button
              type="button"
              onClick={() => router.push("/")}
              className="w-full border rounded-xl py-3 font-bold"
            >
              Back to Store
            </button>

          </div>
        </form>
      </div>
    );
  }

  // =========================
  // DASHBOARD DATA
  // =========================

  const sales = orders.reduce(
    (sum, o) =>
      sum + Number(o.totalAmount || 0),
    0
  );

  const pending = orders.filter(
    (o) => o.status === "Pending"
  ).length;

  const lowStock = products.filter(
    (p) => Number(p.stock ?? 0) <= 3
  ).length;

  // =========================
  // ADMIN DASHBOARD
  // =========================

  return (
    <div className="min-h-screen bg-[#f6f7fb] text-slate-900">

      {/* HEADER */}

      <header className="sticky top-0 z-30 bg-slate-950 text-white">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">

          <div>
            <b className="text-xl">
              Sohoj{" "}
              <span className="text-amber-400">
                Life
              </span>
            </b>

            <p className="text-[10px] text-slate-400">
              Admin Dashboard
            </p>
          </div>

          <div className="flex items-center gap-2">

            <button
              onClick={() => router.push("/")}
              className="px-3 py-2 rounded-xl bg-white/10 text-sm"
            >
              <ArrowLeft className="inline w-4 h-4 mr-1" />
              Store
            </button>

            <button
              onClick={() => signOut(auth)}
              className="px-3 py-2 rounded-xl bg-rose-500 text-sm"
            >
              <LogOut className="inline w-4 h-4 mr-1" />
              Logout
            </button>

          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">

        {/* TABS */}

        <div className="flex gap-2 overflow-x-auto mb-6">

          {(
            [
              ["dashboard", "Dashboard"],
              ["products", "Products"],
              ["orders", "Orders"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`px-5 py-2.5 rounded-xl font-bold text-sm whitespace-nowrap ${
                tab === id
                  ? "bg-slate-950 text-amber-400"
                  : "bg-white border"
              }`}
            >
              {label}
            </button>
          ))}

        </div>

        {/* =========================
            DASHBOARD TAB
        ========================= */}

        {tab === "dashboard" && (
          <>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">

              {[
                ["Products", products.length, Box],
                ["Orders", orders.length, Package],
                [
                  "Sales",
                  `৳${sales.toLocaleString("en-BD")}`,
                  BarChart3,
                ],
                ["Low Stock", lowStock, Truck],
              ].map(
                ([label, value, Icon]: any) => (
                  <div
                    key={label}
                    className="bg-white rounded-2xl border p-5 shadow-sm"
                  >
                    <Icon className="w-5 h-5 text-amber-500" />

                    <p className="text-xs text-slate-500 mt-4">
                      {label}
                    </p>

                    <p className="text-2xl font-black mt-1">
                      {value}
                    </p>
                  </div>
                )
              )}

            </div>

            <div className="mt-6 bg-white border rounded-2xl p-6">

              <div className="flex items-center justify-between">

                <div>
                  <h2 className="font-black text-xl">
                    Quick Actions
                  </h2>

                  <p className="text-sm text-slate-500 mt-1">
                    Store manage করার shortcut
                  </p>
                </div>

                <button
                  onClick={loadData}
                  className="p-2 border rounded-xl"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>

              </div>

              <div className="grid sm:grid-cols-2 gap-3 mt-5">

                <button
                  onClick={() =>
                    setTab("products")
                  }
                  className="p-4 rounded-xl bg-slate-50 text-left font-bold"
                >
                  ➕ Add / Edit Products
                </button>

                <button
                  onClick={() =>
                    setTab("orders")
                  }
                  className="p-4 rounded-xl bg-slate-50 text-left font-bold"
                >
                  📦 Manage Orders ({pending} pending)
                </button>

                <button
                  disabled={seeding}
                  onClick={seed}
                  className="p-4 rounded-xl bg-amber-50 text-left font-bold disabled:opacity-50"
                >
                  {seeding
                    ? "Adding..."
                    : "🌱 Add 40 Demo Products"}
                </button>

                <Link
                  href="/"
                  className="p-4 rounded-xl bg-slate-50 font-bold"
                >
                  🏪 Open Store
                </Link>

              </div>
            </div>
          </>
        )}

        {/* =========================
            PRODUCTS TAB
        ========================= */}

        {tab === "products" && (
          <div className="grid lg:grid-cols-[380px_1fr] gap-6">

            <form
              onSubmit={saveProduct}
              className="bg-white border rounded-2xl p-5 h-fit space-y-3"
            >

              <div className="flex justify-between">

                <h2 className="font-black text-xl">
                  {editingId
                    ? "Edit Product"
                    : "Add Product"}
                </h2>

                {editingId && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="text-xs text-rose-500"
                  >
                    Cancel
                  </button>
                )}

              </div>

              {[
                ["name", "Product name", "text"],
                ["price", "Price", "number"],
                ["oldPrice", "Old price", "number"],
                ["stock", "Stock", "number"],
                ["image", "Image URL", "url"],
              ].map(
                ([key, label, type]) => (
                  <input
                    key={key}
                    required={key !== "oldPrice"}
                    type={type}
                    value={(form as any)[key]}
                    onChange={(e) =>
                      setForm((x) => ({
                        ...x,
                        [key]: e.target.value,
                      }))
                    }
                    placeholder={label}
                    className="w-full border rounded-xl px-3 py-2.5 text-sm"
                  />
                )
              )}

              <select
                value={form.category}
                onChange={(e) =>
                  setForm((x) => ({
                    ...x,
                    category: e.target.value,
                  }))
                }
                className="w-full border rounded-xl px-3 py-2.5 text-sm"
              >
                <option>Men's Wear</option>
                <option>Women's Wear</option>
                <option>Kids' Wear</option>
                <option>Accessories</option>
              </select>

              <textarea
                value={form.description}
                onChange={(e) =>
                  setForm((x) => ({
                    ...x,
                    description: e.target.value,
                  }))
                }
                rows={4}
                placeholder="Description"
                className="w-full border rounded-xl px-3 py-2.5 text-sm"
              />

              {[
                ["featured", "Featured"],
                ["bestSeller", "Best Seller"],
                ["newArrival", "New Arrival"],
              ].map(([key, label]) => (
                <label
                  key={key}
                  className="flex items-center gap-2 text-sm"
                >
                  <input
                    type="checkbox"
                    checked={(form as any)[key]}
                    onChange={(e) =>
                      setForm((x) => ({
                        ...x,
                        [key]: e.target.checked,
                      }))
                    }
                  />

                  {label}
                </label>
              ))}

              <button
                disabled={saving}
                className="w-full bg-slate-950 text-white py-3 rounded-xl font-black disabled:opacity-50"
              >
                {saving
                  ? "Saving..."
                  : editingId
                  ? "Update Product"
                  : "Save Product"}
              </button>

            </form>

            <div className="space-y-3">

              {products.map((p) => (
                <div
                  key={p.id}
                  className="bg-white border rounded-2xl p-4 flex gap-4 items-center"
                >

                  <img
                    src={p.image}
                    alt={p.name}
                    className="w-20 h-20 rounded-xl object-cover"
                  />

                  <div className="flex-1 min-w-0">

                    <h3 className="font-black truncate">
                      {p.name}
                    </h3>

                    <p className="text-xs text-slate-500 mt-1">
                      {p.category} · ৳{p.price} · Stock{" "}
                      {p.stock ?? 0}
                    </p>

                  </div>

                  <button
                    onClick={() =>
                      editProduct(p)
                    }
                    className="p-2 rounded-xl bg-slate-100"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() =>
                      removeProduct(p.id)
                    }
                    className="p-2 rounded-xl bg-rose-50 text-rose-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                </div>
              ))}

            </div>
          </div>
        )}

        {/* =========================
            ORDERS TAB
        ========================= */}

        {tab === "orders" && (
          <div className="space-y-3">

            {orders.length === 0 ? (
              <div className="bg-white border rounded-2xl p-10 text-center text-slate-500">
                No orders yet.
              </div>
            ) : (
              orders.map((o) => (
                <div
                  key={o.id}
                  className="bg-white border rounded-2xl p-5"
                >

                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">

                    <div>

                      <p className="font-mono text-xs text-slate-400">
                        #{o.id}
                      </p>

                      <h3 className="font-black mt-1">
                        {o.customerName || "Customer"}
                      </h3>

                      <p className="text-sm text-slate-500">
                        {o.phone} · {o.address}
                      </p>

                      <p className="text-xs text-slate-400 mt-2">
                        {o.itemsSummary || "Items"}
                      </p>

                    </div>

                    <div className="flex items-center gap-3">

                      <b className="text-amber-600">
                        ৳
                        {Number(
                          o.totalAmount || 0
                        ).toLocaleString("en-BD")}
                      </b>

                      <select
                        value={
                          o.status || "Pending"
                        }
                        onChange={(e) =>
                          updateStatus(
                            o,
                            e.target.value
                          )
                        }
                        className="border rounded-xl px-3 py-2 text-sm"
                      >
                        <option>
                          Pending
                        </option>

                        <option>
                          Processing
                        </option>

                        <option>
                          Shipped
                        </option>

                        <option>
                          Delivered
                        </option>

                        <option>
                          Cancelled
                        </option>
                      </select>

                    </div>

                  </div>

                </div>
              ))
            )}

          </div>
        )}

      </main>
    </div>
  );
}
```
