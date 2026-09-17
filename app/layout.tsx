import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
// CartProvider ইমপোর্ট করুন
import { CartProvider } from "../src/context/CartContext";
const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Sohoj Life",
  description: "E-commerce platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {/* CartProvider দিয়ে children কে Wrap করুন */}
        <CartProvider>
          {children}
        </CartProvider>
      </body>
    </html>
  );
}
