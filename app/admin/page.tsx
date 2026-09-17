"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import Link from "next/link";

import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";

import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  type User,
} from "firebase/auth";

import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  LogOut,
  Plus,
  Trash2,
  Edit3,
  Save,
  X,
  RefreshCw,
  AlertCircle,
  Loader2,
} from "lucide-react";

import { auth, db } from "@/lib/firebase";

// =====================================================
// ADMIN EMAILS
// .env.local:
// NEXT_PUBLIC_ADMIN_EMAILS=shefatkhn@gmail.com,iamhasib121@gmail.com
// =====================================================

const ADMIN_EMAILS = (
  process.env.NEXT_PUBLIC_ADMIN_EMAILS || ""
)
  .split(",")
  .map((email) => email.trim().toLowerCase())
  .filter(Boolean);

type Tab = "dashboard" | "products" | "orders";

type Product = {
  id: string;
  name: string;
  price: number;
  image?: string;
  category?: string;
  description?: string;
  stock?: number;
  createdAt?: any;
};

type Order = {
  id: string;
  customerName?: string;
  customerEmail?: string;
  phone?: string;
  address?: string;
  total?: number;
  totalAmount?: number;
  status?: string;
  payment?: string;
  items?: any[];
  createdAt?: any;
};

type ProductForm = {
  name: string;
  price: string;
  image: string;
  category: string;
  description: string;
  stock: string;
};

const emptyProduct: ProductForm = {
  name: "",
  price: "",
  image: "",
  category: "",
  description: "",
  stock: "0",
};

function getFirebaseErrorMessage(error: any) {
  const code = error?.code || "";

  switch (code) {
    case "auth/invalid-credential":
      return "Email অথবা password ভুল। Firebase Authentication-এ এই account এবং password ঠিক আছে কিনা যাচাই করুন।";

    case "auth/wrong-password":
      return "Password ভুল। আবার চেষ্টা করুন।";

    case "auth/user-not-found":
      return "এই email দিয়ে কোনো Firebase account পাওয়া যায়নি।";

    case "auth/invalid-email":
      return "Email address সঠিক নয়।";

    case "auth/too-many-requests":
      return "অনেকবার login চেষ্টা করা হয়েছে। কিছুক্ষণ পরে আবার চেষ্টা করুন।";

    case "auth/user-disabled":
      return "এই Firebase account disabled করা হয়েছে।";

    case "auth/network-request-failed":
      return "Network সমস্যা হয়েছে। Internet connection চেক করুন।";

    case "auth/operation-not-allowed":
      return "Firebase Authentication-এ Email/Password sign-in enabled নেই।";

    default:
      return error?.message || "Login failed। আবার চেষ্টা করুন।";
  }
}

export default function AdminPage() {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  const [loginEmail, setLoginEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState("");

  const [tab, setTab] = useState<Tab>("dashboard");

  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);

  const [dataLoading, setDataLoading] = useState(true);

  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [productForm, setProductForm] =
    useState<ProductForm>(emptyProduct);

  const [productSaving, setProductSaving] = useState(false);
  const [productError, setProductError] = useState("");

  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // =====================================================
  // Firebase Auth listener
  // =====================================================

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      async (currentUser) => {
        if (!currentUser) {
          setUser(null);
          setAuthLoading(false);
          return;
        }

        const currentEmail = (currentUser.email || "")
          .trim()
          .toLowerCase();

        if (
          ADMIN_EMAILS.length > 0 &&
          !ADMIN_EMAILS.includes(currentEmail)
        ) {
          await signOut(auth);

          setUser(null);
          setLoginError(
            "এই account-এর Admin access নেই।"
          );

          setAuthLoading(false);
          return;
        }

        setUser(currentUser);
        setAuthLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // =====================================================
  // Products listener
  // =====================================================

  useEffect(() => {
    if (!user) return;

    const productsQuery = query(
      collection(db, "products"),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(
      productsQuery,
      (snapshot) => {
        const data: Product[] = snapshot.docs.map((item) => ({
          id: item.id,
          ...(item.data() as Omit<Product, "id">),
        }));

        setProducts(data);
        setDataLoading(false);
      },
      (error) => {
        console.error("Products listener error:", error);
        setDataLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  // =====================================================
  // Orders listener
  // =====================================================

  useEffect(() => {
    if (!user) return;

    const ordersQuery = query(
      collection(db, "orders"),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(
      ordersQuery,
      (snapshot) => {
        const data: Order[] = snapshot.docs.map((item) => ({
          id: item.id,
          ...(item.data() as Omit<Order, "id">),
        }));

        setOrders(data);
      },
      (error) => {
        console.error("Orders listener error:", error);
      }
    );

    return () => unsubscribe();
  }, [user]);

  // =====================================================
  // Login
  // =====================================================

  const login = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setLoginError("");

    const email = loginEmail.trim().toLowerCase();

    if (!email) {
      setLoginError("Email দিন।");
      return;
    }

    if (!password) {
      setLoginError("Password দিন।");
      return;
    }

    setLoginLoading(true);

    try {
      const result = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      const authenticatedEmail = (
        result.user.email || ""
      )
        .trim()
        .toLowerCase();

      if (
        ADMIN_EMAILS.length > 0 &&
        !ADMIN_EMAILS.includes(authenticatedEmail)
      ) {
        await signOut(auth);

        setLoginError(
          "Login হয়েছে, কিন্তু এই account-এর Admin access নেই।"
        );

        return;
      }
    } catch (error: any) {
      console.error("Login error:", error);
      setLoginError(getFirebaseErrorMessage(error));
    } finally {
      setLoginLoading(false);
    }
  };

  // =====================================================
  // Logout
  // =====================================================

  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  // =====================================================
  // Open add product form
  // =====================================================

  const openAddProduct = () => {
    setEditingProduct(null);
    setProductForm(emptyProduct);
    setProductError("");
    setShowProductForm(true);
  };

  // =====================================================
  // Open edit product form
  // =====================================================

  const openEditProduct = (product: Product) => {
    setEditingProduct(product);

    setProductForm({
      name: product.name || "",
      price: String(product.price ?? ""),
      image: product.image || "",
      category: product.category || "",
      description: product.description || "",
      stock: String(product.stock ?? 0),
    });

    setProductError("");
    setShowProductForm(true);
  };

  // =====================================================
  // Save product
  // =====================================================

  const saveProduct = async (
    e: FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    setProductError("");

    const name = productForm.name.trim();
    const price = Number(productForm.price);
    const stock = Number(productForm.stock);

    if (!name) {
      setProductError("Product name দিন।");
      return;
    }

    if (
      !productForm.price ||
      Number.isNaN(price) ||
      price < 0
    ) {
      setProductError("Valid price দিন।");
      return;
    }

    if (
      productForm.stock === "" ||
      Number.isNaN(stock) ||
      stock < 0
    ) {
      setProductError("Valid stock দিন।");
      return;
    }

    setProductSaving(true);

    try {
      const productData = {
        name,
        price,
        image: productForm.image.trim(),
        category: productForm.category.trim(),
        description: productForm.description.trim(),
        stock,
      };

      if (editingProduct) {
        await updateDoc(
          doc(db, "products", editingProduct.id),
          productData
        );
      } else {
        await addDoc(collection(db, "products"), {
          ...productData,
          createdAt: serverTimestamp(),
        });
      }

      setShowProductForm(false);
      setEditingProduct(null);
      setProductForm(emptyProduct);
    } catch (error: any) {
      console.error("Save product error:", error);

      setProductError(
        error?.message || "Product save করা যায়নি।"
      );
    } finally {
      setProductSaving(false);
    }
  };

  // =====================================================
  // Delete product
  // =====================================================

  const deleteProduct = async (product: Product) => {
    const confirmed = window.confirm(
      `"${product.name}" delete করতে চান?`
    );

    if (!confirmed) return;

    setActionLoading(product.id);

    try {
      await deleteDoc(
        doc(db, "products", product.id)
      );
    } catch (error) {
      console.error("Delete product error:", error);
      alert("Product delete করা যায়নি।");
    } finally {
      setActionLoading(null);
    }
  };

  // =====================================================
  // Update order status
  // =====================================================

  const updateOrderStatus = async (
    orderId: string,
    status: string
  ) => {
    setActionLoading(orderId);

    try {
      // Update main order
      await updateDoc(
        doc(db, "orders", orderId),
        {
          status,
          updatedAt: serverTimestamp(),
        }
      );

      // Update customer tracking
      await updateDoc(
        doc(db, "orderTracking", orderId),
        {
          status,
          updatedAt: serverTimestamp(),
        }
      );
    } catch (error) {
      console.error(
        "Order status update error:",
        error
      );

      alert("Order status update করা যায়নি।");
    } finally {
      setActionLoading(null);
    }
  };

  // =====================================================
  // Dashboard stats
  // =====================================================

  const stats = useMemo(() => {
    const totalProducts = products.length;

    const totalOrders = orders.length;

    const pendingOrders = orders.filter(
      (order) =>
        (order.status || "pending").toLowerCase() ===
        "pending"
    ).length;

    const totalSales = orders.reduce(
      (sum, order) =>
        sum +
        Number(
          order.totalAmount ??
            order.total ??
            0
        ),
      0
    );

    return {
      totalProducts,
      totalOrders,
      pendingOrders,
      totalSales,
    };
  }, [products, orders]);

  // =====================================================
  // Format date
  // =====================================================

  const formatDate = (value: any) => {
    if (!value) return "—";

    try {
      if (
        typeof value?.toDate === "function"
      ) {
        return value
          .toDate()
          .toLocaleString("en-BD");
      }

      return new Date(value).toLocaleString("en-BD");
    } catch {
      return "—";
    }
  };

  // =====================================================
  // Loading screen
  // =====================================================

  if (authLoading) {
    return (
      <main className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="flex items-center gap-3 text-slate-700 font-semibold">
          <Loader2 className="w-6 h-6 animate-spin" />
          Loading admin...
        </div>
      </main>
    );
  }

  // =====================================================
  // Login screen
  // =====================================================

  if (!user) {
    return (
      <main className="min-h-screen bg-slate-100 flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-3xl shadow-xl border border-slate-200 p-7">

            <div className="text-center mb-7">
              <div className="w-16 h-16 rounded-2xl bg-slate-950 text-amber-400 flex items-center justify-center mx-auto mb-4">
                <LayoutDashboard className="w-8 h-8" />
              </div>

              <h1 className="text-2xl font-black text-slate-950">
                Admin Login
              </h1>

              <p className="text-sm text-slate-500 mt-2">
                Sohoj Life Admin Dashboard
              </p>
            </div>

            {loginError && (
              <div className="mb-5 rounded-2xl bg-red-50 border border-red-200 text-red-700 px-4 py-3 flex gap-3 text-sm">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            <form
              onSubmit={login}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Email
                </label>

                <input
                  type="email"
                  value={loginEmail}
                  onChange={(e) =>
                    setLoginEmail(e.target.value)
                  }
                  placeholder="admin@example.com"
                  autoComplete="email"
                  className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:ring-2 focus:ring-slate-950"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Password
                </label>

                <input
                  type="password"
                  value={password}
                  onChange={(e) =>
                    setPassword(e.target.value)
                  }
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:ring-2 focus:ring-slate-950"
                />
              </div>

              <button
                type="submit"
                disabled={loginLoading}
                className="w-full bg-slate-950 text-white rounded-2xl py-3.5 font-bold flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {loginLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Logging in...
                  </>
                ) : (
                  "Login"
                )}
              </button>
            </form>

            <Link
              href="/"
              className="mt-5 inline-flex w-full items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-950"
            >
              ← Back to Home
            </Link>

            {ADMIN_EMAILS.length > 0 && (
              <p className="text-xs text-slate-400 text-center mt-5">
                Admin accounts: {ADMIN_EMAILS.join(", ")}
              </p>
            )}
          </div>
        </div>
      </main>
    );
  }

  // =====================================================
  // Admin Dashboard
  // =====================================================

  return (
    <main className="min-h-screen bg-slate-100 text-slate-900">

      {/* Header */}
      <header className="bg-slate-950 text-white sticky top-0 z-40 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-4">

          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center">
              <LayoutDashboard className="w-6 h-6" />
            </div>

            <div>
              <h1 className="font-black text-lg">
                Sohoj Life Admin
              </h1>

              <p className="text-xs text-slate-400">
                {user.email}
              </p>
            </div>
          </div>

          <button
            onClick={logout}
            className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 flex items-center gap-2 font-bold text-sm"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-7">

        {/* Tabs */}
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
                  : "bg-white border border-slate-200 text-slate-700"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Dashboard */}
        {tab === "dashboard" && (
          <section>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

              <div className="bg-white rounded-2xl border border-slate-200 p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-500">
                      Products
                    </p>

                    <p className="text-3xl font-black mt-1">
                      {stats.totalProducts}
                    </p>
                  </div>

                  <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Package className="w-6 h-6" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-500">
                      Orders
                    </p>

                    <p className="text-3xl font-black mt-1">
                      {stats.totalOrders}
                    </p>
                  </div>

                  <div className="w-12 h-12 rounded-xl bg-green-50 text-green-600 flex items-center justify-center">
                    <ShoppingBag className="w-6 h-6" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-500">
                      Pending
                    </p>

                    <p className="text-3xl font-black mt-1">
                      {stats.pendingOrders}
                    </p>
                  </div>

                  <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                    <RefreshCw className="w-6 h-6" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-500">
                      Total Sales
                    </p>

                    <p className="text-3xl font-black mt-1">
                      ৳
                      {stats.totalSales.toLocaleString(
                        "en-BD"
                      )}
                    </p>
                  </div>

                  <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                    <span className="font-black text-xl">
                      ৳
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 bg-white border border-slate-200 rounded-2xl p-6">
              <h2 className="text-xl font-black mb-2">
                Welcome to Admin Dashboard
              </h2>

              <p className="text-slate-500">
                এখান থেকে Products এবং Orders manage করতে পারবেন।
              </p>
            </div>
          </section>
        )}

        {/* Products */}
        {tab === "products" && (
          <section>

            <div className="flex items-center justify-between gap-4 mb-5">
              <div>
                <h2 className="text-2xl font-black">
                  Products
                </h2>

                <p className="text-sm text-slate-500 mt-1">
                  আপনার products manage করুন।
                </p>
              </div>

              <button
                onClick={openAddProduct}
                className="bg-slate-950 text-white px-4 py-3 rounded-xl font-bold flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Add Product
              </button>
            </div>

            {dataLoading ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-10 flex justify-center">
                <Loader2 className="w-7 h-7 animate-spin" />
              </div>
            ) : products.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center">

                <Package className="w-10 h-10 mx-auto text-slate-300 mb-3" />

                <p className="font-bold text-slate-700">
                  কোনো product পাওয়া যায়নি।
                </p>

                <p className="text-sm text-slate-400 mt-1">
                  Add Product button থেকে প্রথম product যোগ করুন।
                </p>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">

                <div className="overflow-x-auto">
                  <table className="w-full min-w-[800px]">

                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>

                        <th className="text-left px-5 py-4 text-sm font-black">
                          Product
                        </th>

                        <th className="text-left px-5 py-4 text-sm font-black">
                          Category
                        </th>

                        <th className="text-left px-5 py-4 text-sm font-black">
                          Price
                        </th>

                        <th className="text-left px-5 py-4 text-sm font-black">
                          Stock
                        </th>

                        <th className="text-right px-5 py-4 text-sm font-black">
                          Actions
                        </th>

                      </tr>
                    </thead>

                    <tbody>

                      {products.map((product) => (
                        <tr
                          key={product.id}
                          className="border-b border-slate-100 last:border-b-0"
                        >

                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">

                              {product.image ? (
                                <img
                                  src={product.image}
                                  alt={product.name}
                                  className="w-12 h-12 rounded-xl object-cover border"
                                />
                              ) : (
                                <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center">
                                  <Package className="w-5 h-5 text-slate-400" />
                                </div>
                              )}

                              <div>
                                <p className="font-bold">
                                  {product.name}
                                </p>

                                {product.description && (
                                  <p className="text-xs text-slate-400 max-w-xs truncate">
                                    {product.description}
                                  </p>
                                )}
                              </div>

                            </div>
                          </td>

                          <td className="px-5 py-4 text-sm text-slate-600">
                            {product.category || "—"}
                          </td>

                          <td className="px-5 py-4 font-bold">
                            ৳
                            {Number(
                              product.price || 0
                            ).toLocaleString("en-BD")}
                          </td>

                          <td className="px-5 py-4">

                            <span
                              className={`inline-flex px-3 py-1 rounded-full text-xs font-bold ${
                                Number(product.stock || 0) > 0
                                  ? "bg-green-50 text-green-700"
                                  : "bg-red-50 text-red-700"
                              }`}
                            >
                              {product.stock ?? 0}
                            </span>

                          </td>

                          <td className="px-5 py-4">

                            <div className="flex justify-end gap-2">

                              <button
                                onClick={() =>
                                  openEditProduct(product)
                                }
                                className="p-2.5 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100"
                                title="Edit"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>

                              <button
                                onClick={() =>
                                  deleteProduct(product)
                                }
                                disabled={
                                  actionLoading === product.id
                                }
                                className="p-2.5 rounded-xl bg-red-50 text-red-700 hover:bg-red-100 disabled:opacity-50"
                                title="Delete"
                              >
                                {actionLoading === product.id ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <Trash2 className="w-4 h-4" />
                                )}
                              </button>

                            </div>

                          </td>

                        </tr>
                      ))}

                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </section>
        )}

        {/* Orders */}
        {tab === "orders" && (
          <section>

            <div className="mb-5">
              <h2 className="text-2xl font-black">
                Orders
              </h2>

              <p className="text-sm text-slate-500 mt-1">
                Customer orders এবং status manage করুন।
              </p>
            </div>

            {orders.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center">

                <ShoppingBag className="w-10 h-10 mx-auto text-slate-300 mb-3" />

                <p className="font-bold text-slate-700">
                  কোনো order পাওয়া যায়নি।
                </p>

              </div>
            ) : (
              <div className="space-y-4">

                {orders.map((order) => {
                  const currentStatus =
                    order.status || "pending";

                  const orderTotal =
                    order.totalAmount ??
                    order.total ??
                    0;

                  return (
                    <div
                      key={order.id}
                      className="bg-white rounded-2xl border border-slate-200 p-5"
                    >

                      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-5">

                        <div>

                          <div className="flex flex-wrap items-center gap-3">

                            <h3 className="font-black text-lg">
                              Order #{order.id.slice(0, 8)}
                            </h3>

                            <span
                              className={`px-3 py-1 rounded-full text-xs font-bold ${
                                currentStatus === "pending"
                                  ? "bg-amber-50 text-amber-700"
                                  : currentStatus === "confirmed"
                                  ? "bg-blue-50 text-blue-700"
                                  : currentStatus === "processing"
                                  ? "bg-indigo-50 text-indigo-700"
                                  : currentStatus === "shipped"
                                  ? "bg-purple-50 text-purple-700"
                                  : currentStatus === "delivered"
                                  ? "bg-green-50 text-green-700"
                                  : currentStatus === "cancelled"
                                  ? "bg-red-50 text-red-700"
                                  : "bg-slate-100 text-slate-700"
                              }`}
                            >
                              {currentStatus}
                            </span>

                          </div>

                          <div className="mt-4 space-y-1 text-sm text-slate-600">

                            {order.customerName && (
                              <p>
                                <strong>Name:</strong>{" "}
                                {order.customerName}
                              </p>
                            )}

                            {order.customerEmail && (
                              <p>
                                <strong>Email:</strong>{" "}
                                {order.customerEmail}
                              </p>
                            )}

                            {order.phone && (
                              <p>
                                <strong>Phone:</strong>{" "}
                                {order.phone}
                              </p>
                            )}

                            {order.address && (
                              <p>
                                <strong>Address:</strong>{" "}
                                {order.address}
                              </p>
                            )}

                            {order.payment && (
                              <p>
                                <strong>Payment:</strong>{" "}
                                {order.payment}
                              </p>
                            )}

                            <p>
                              <strong>Date:</strong>{" "}
                              {formatDate(
                                order.createdAt
                              )}
                            </p>

                          </div>
                        </div>

                        <div className="lg:text-right">

                          <p className="text-sm text-slate-500">
                            Total
                          </p>

                          <p className="text-2xl font-black">
                            ৳
                            {Number(
                              orderTotal
                            ).toLocaleString("en-BD")}
                          </p>

                          <select
                            value={currentStatus}
                            onChange={(e) =>
                              updateOrderStatus(
                                order.id,
                                e.target.value
                              )
                            }
                            disabled={
                              actionLoading === order.id
                            }
                            className="mt-3 border border-slate-300 rounded-xl px-3 py-2 text-sm font-semibold outline-none"
                          >

                            <option value="pending">
                              Pending
                            </option>

                            <option value="confirmed">
                              Confirmed
                            </option>

                            <option value="processing">
                              Processing
                            </option>

                            <option value="shipped">
                              Shipped
                            </option>

                            <option value="delivered">
                              Delivered
                            </option>

                            <option value="cancelled">
                              Cancelled
                            </option>

                          </select>

                        </div>

                      </div>

                      {Array.isArray(order.items) &&
                        order.items.length > 0 && (
                          <div className="mt-5 pt-5 border-t border-slate-100">

                            <h4 className="font-bold mb-3">
                              Items
                            </h4>

                            <div className="space-y-2">

                              {order.items.map(
                                (
                                  item: any,
                                  index: number
                                ) => (
                                  <div
                                    key={`${order.id}-${index}`}
                                    className="flex items-center justify-between bg-slate-50 rounded-xl px-4 py-3 text-sm"
                                  >

                                    <div>

                                      <p className="font-semibold">
                                        {item.name ||
                                          item.title ||
                                          "Product"}
                                      </p>

                                      <p className="text-xs text-slate-500">
                                        Qty:{" "}
                                        {item.quantity ||
                                          item.qty ||
                                          1}
                                      </p>

                                    </div>

                                    <p className="font-bold">
                                      ৳
                                      {Number(
                                        item.price || 0
                                      ).toLocaleString(
                                        "en-BD"
                                      )}
                                    </p>

                                  </div>
                                )
                              )}

                            </div>
                          </div>
                        )}

                    </div>
                  );
                })}

              </div>
            )}

          </section>
        )}

      </div>

      {/* Product Modal */}
      {showProductForm && (
        <div className="fixed inset-0 z-50 bg-black/50 p-4 flex items-center justify-center">

          <div className="bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl">

            <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">

              <div>

                <h2 className="text-xl font-black">
                  {editingProduct
                    ? "Edit Product"
                    : "Add Product"}
                </h2>

                <p className="text-xs text-slate-500 mt-1">
                  Product information দিন।
                </p>

              </div>

              <button
                onClick={() => {
                  setShowProductForm(false);
                  setEditingProduct(null);
                  setProductError("");
                }}
                className="p-2 rounded-xl hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>

            </div>

            <form
              onSubmit={saveProduct}
              className="p-6 space-y-5"
            >

              {productError && (
                <div className="rounded-2xl bg-red-50 border border-red-200 text-red-700 px-4 py-3 flex gap-3 text-sm">

                  <AlertCircle className="w-5 h-5 shrink-0" />

                  <span>{productError}</span>

                </div>
              )}

              <div>

                <label className="block text-sm font-bold mb-2">
                  Product Name *
                </label>

                <input
                  value={productForm.name}
                  onChange={(e) =>
                    setProductForm((prev) => ({
                      ...prev,
                      name: e.target.value,
                    }))
                  }
                  placeholder="Product name"
                  className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:ring-2 focus:ring-slate-950"
                />

              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                <div>

                  <label className="block text-sm font-bold mb-2">
                    Price *
                  </label>

                  <input
                    type="number"
                    min="0"
                    value={productForm.price}
                    onChange={(e) =>
                      setProductForm((prev) => ({
                        ...prev,
                        price: e.target.value,
                      }))
                    }
                    placeholder="0"
                    className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:ring-2 focus:ring-slate-950"
                  />

                </div>

                <div>

                  <label className="block text-sm font-bold mb-2">
                    Stock
                  </label>

                  <input
                    type="number"
                    min="0"
                    value={productForm.stock}
                    onChange={(e) =>
                      setProductForm((prev) => ({
                        ...prev,
                        stock: e.target.value,
                      }))
                    }
                    placeholder="0"
                    className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:ring-2 focus:ring-slate-950"
                  />

                </div>

              </div>

              <div>

                <label className="block text-sm font-bold mb-2">
                  Category
                </label>

                <input
                  value={productForm.category}
                  onChange={(e) =>
                    setProductForm((prev) => ({
                      ...prev,
                      category: e.target.value,
                    }))
                  }
                  placeholder="Category"
                  className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:ring-2 focus:ring-slate-950"
                />

              </div>

              <div>

                <label className="block text-sm font-bold mb-2">
                  Image URL
                </label>

                <input
                  type="url"
                  value={productForm.image}
                  onChange={(e) =>
                    setProductForm((prev) => ({
                      ...prev,
                      image: e.target.value,
                    }))
                  }
                  placeholder="https://..."
                  className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:ring-2 focus:ring-slate-950"
                />

              </div>

              <div>

                <label className="block text-sm font-bold mb-2">
                  Description
                </label>

                <textarea
                  value={productForm.description}
                  onChange={(e) =>
                    setProductForm((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  placeholder="Product description"
                  rows={4}
                  className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:ring-2 focus:ring-slate-950 resize-none"
                />

              </div>

              <div className="flex justify-end gap-3 pt-2">

                <button
                  type="button"
                  onClick={() => {
                    setShowProductForm(false);
                    setEditingProduct(null);
                    setProductError("");
                  }}
                  className="px-5 py-3 rounded-xl border border-slate-300 font-bold"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={productSaving}
                  className="px-5 py-3 rounded-xl bg-slate-950 text-white font-bold flex items-center gap-2 disabled:opacity-60"
                >

                  {productSaving ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      {editingProduct
                        ? "Update Product"
                        : "Save Product"}
                    </>
                  )}

                </button>

              </div>

            </form>
          </div>
        </div>
      )}
    </main>
  );
}
