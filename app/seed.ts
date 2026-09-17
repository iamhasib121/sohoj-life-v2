import { db } from "./firebase";
import { collection, addDoc } from "firebase/firestore";

const demoProducts = [
  // ==================== MEN'S WEAR (10 Products) ====================
  {
    name: "Premium Cotton Panjabi - Royal Navy",
    price: 1850,
    category: "Men's Wear",
    image: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600&auto=format&fit=crop&q=80",
    rating: 4.8
  },
  {
    name: "Slim Fit Casual Denim Shirt",
    price: 1450,
    category: "Men's Wear",
    image: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&auto=format&fit=crop&q=80",
    rating: 4.6
  },
  {
    name: "Classic Polo T-Shirt - Forest Green",
    price: 750,
    category: "Men's Wear",
    image: "https://images.unsplash.com/photo-1586363104862-3a5e2ab60d99?w=600&auto=format&fit=crop&q=80",
    rating: 4.5
  },
  {
    name: "Formal Men's Blazer - Charcoal Gray",
    price: 4500,
    category: "Men's Wear",
    image: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=600&auto=format&fit=crop&q=80",
    rating: 4.9
  },
  {
    name: "Traditional Kabli Set - Olive Green",
    price: 2600,
    category: "Men's Wear",
    image: "https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?w=600&auto=format&fit=crop&q=80",
    rating: 4.7
  },
  {
    name: "Stretchable Chino Pants - Beige",
    price: 1350,
    category: "Men's Wear",
    image: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=600&auto=format&fit=crop&q=80",
    rating: 4.4
  },
  {
    name: "Casual Printed Hawaii Shirt",
    price: 990,
    category: "Men's Wear",
    image: "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=600&auto=format&fit=crop&q=80",
    rating: 4.3
  },
  {
    name: "Heavyweight Oversized Hoodie - Black",
    price: 1650,
    category: "Men's Wear",
    image: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=600&auto=format&fit=crop&q=80",
    rating: 4.8
  },
  {
    name: "Formal White Dress Shirt",
    price: 1200,
    category: "Men's Wear",
    image: "https://images.unsplash.com/photo-1620012253295-c15cc3e65df4?w=600&auto=format&fit=crop&q=80",
    rating: 4.7
  },
  {
    name: "Cotton Casual Shorts - Gray",
    price: 650,
    category: "Men's Wear",
    image: "https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=600&auto=format&fit=crop&q=80",
    rating: 4.2
  },

  // ==================== WOMEN'S WEAR (10 Products) ====================
  {
    name: "Exclusive Georgette Saree - Crimson Red",
    price: 3200,
    category: "Women's Wear",
    image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&auto=format&fit=crop&q=80",
    rating: 4.9
  },
  {
    name: "Designer Three-Piece Salwar Kameez",
    price: 2850,
    category: "Women's Wear",
    image: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=600&auto=format&fit=crop&q=80",
    rating: 4.8
  },
  {
    name: "Elegant Linen Kurti - Pastel Pink",
    price: 1250,
    category: "Women's Wear",
    image: "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=600&auto=format&fit=crop&q=80",
    rating: 4.6
  },
  {
    name: "Modern Floral Print Top",
    price: 890,
    category: "Women's Wear",
    image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&auto=format&fit=crop&q=80",
    rating: 4.5
  },
  {
    name: "Embroidered Silk Abaya - Emerald Green",
    price: 3500,
    category: "Women's Wear",
    image: "https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?w=600&auto=format&fit=crop&q=80",
    rating: 4.9
  },
  {
    name: "High-Waist Denim Jeans - Ice Blue",
    price: 1550,
    category: "Women's Wear",
    image: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=600&auto=format&fit=crop&q=80",
    rating: 4.4
  },
  {
    name: "Boho Style Summer Maxi Dress",
    price: 1950,
    category: "Women's Wear",
    image: "https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=600&auto=format&fit=crop&q=80",
    rating: 4.7
  },
  {
    name: "Knitted Winter Cardigan - Cream",
    price: 1800,
    category: "Women's Wear",
    image: "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=600&auto=format&fit=crop&q=80",
    rating: 4.6
  },
  {
    name: "Cotton Printed Hijab / Scarf",
    price: 450,
    category: "Women's Wear",
    image: "https://images.unsplash.com/photo-1609357605129-26f69add5d6e?w=600&auto=format&fit=crop&q=80",
    rating: 4.3
  },
  {
    name: "Casual Cotton T-Shirt - Lavender",
    price: 550,
    category: "Women's Wear",
    image: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600&auto=format&fit=crop&q=80",
    rating: 4.5
  },

  // ==================== KIDS' WEAR (10 Products) ====================
  {
    name: "Boys' Cotton Panjabi & Payjama Set",
    price: 1100,
    category: "Kids' Wear",
    image: "https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=600&auto=format&fit=crop&q=80",
    rating: 4.8
  },
  {
    name: "Girls' Party Frock - Princess Pink",
    price: 1450,
    category: "Kids' Wear",
    image: "https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?w=600&auto=format&fit=crop&q=80",
    rating: 4.9
  },
  {
    name: "Cute Cartoon Print T-Shirt & Shorts Set",
    price: 650,
    category: "Kids' Wear",
    image: "https://images.unsplash.com/photo-1503944583220-79d8926ad5e2?w=600&auto=format&fit=crop&q=80",
    rating: 4.6
  },
  {
    name: "Kids' Denim Jacket - Blue",
    price: 1250,
    category: "Kids' Wear",
    image: "https://images.unsplash.com/photo-1519457431-44ccd64a579b?w=600&auto=format&fit=crop&q=80",
    rating: 4.7
  },
  {
    name: "Toddler Soft Cotton Romper",
    price: 550,
    category: "Kids' Wear",
    image: "https://images.unsplash.com/photo-1522771930-78848d9293e8?w=600&auto=format&fit=crop&q=80",
    rating: 4.5
  },
  {
    name: "Girls' Floral Summer Top Set",
    price: 850,
    category: "Kids' Wear",
    image: "https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=600&auto=format&fit=crop&q=80",
    rating: 4.4
  },
  {
    name: "Boys' Polo Shirt - Sky Blue",
    price: 590,
    category: "Kids' Wear",
    image: "https://images.unsplash.com/photo-1471286174890-9c112ffca5b4?w=600&auto=format&fit=crop&q=80",
    rating: 4.3
  },
  {
    name: "Kids' Winter Hoodie - Mustard Yellow",
    price: 980,
    category: "Kids' Wear",
    image: "https://images.unsplash.com/photo-1514090458221-65bb69cf63e6?w=600&auto=format&fit=crop&q=80",
    rating: 4.7
  },
  {
    name: "Girls' Cotton Leggings Pair",
    price: 490,
    category: "Kids' Wear",
    image: "https://images.unsplash.com/photo-1502980426475-b83966705988?w=600&auto=format&fit=crop&q=80",
    rating: 4.2
  },
  {
    name: "Baby Unisex Sleepsuit 2-Pack",
    price: 790,
    category: "Kids' Wear",
    image: "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=600&auto=format&fit=crop&q=80",
    rating: 4.8
  },

  // ==================== ACCESSORIES (10 Products) ====================
  {
    name: "Genuine Leather Bifold Wallet - Tan",
    price: 1150,
    category: "Accessories",
    image: "https://images.unsplash.com/photo-1627123424574-724758594e93?w=600&auto=format&fit=crop&q=80",
    rating: 4.8
  },
  {
    name: "Classic Chronograph Men's Watch",
    price: 2950,
    category: "Accessories",
    image: "https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=600&auto=format&fit=crop&q=80",
    rating: 4.9
  },
  {
    name: "UV Protection Aviator Sunglasses",
    price: 850,
    category: "Accessories",
    image: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=600&auto=format&fit=crop&q=80",
    rating: 4.5
  },
  {
    name: "Women's Leather Tote Shoulder Bag",
    price: 2450,
    category: "Accessories",
    image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&auto=format&fit=crop&q=80",
    rating: 4.8
  },
  {
    name: "Unisex Travel Canvas Backpack",
    price: 1850,
    category: "Accessories",
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&auto=format&fit=crop&q=80",
    rating: 4.7
  },
  {
    name: "Genuine Formal Leather Belt - Black",
    price: 950,
    category: "Accessories",
    image: "https://images.unsplash.com/photo-1624222247344-550fb60583dc?w=600&auto=format&fit=crop&q=80",
    rating: 4.6
  },
  {
    name: "Stainless Steel Cufflinks & Tie Clip Set",
    price: 750,
    category: "Accessories",
    image: "https://images.unsplash.com/photo-1590736704728-f4730bb30770?w=600&auto=format&fit=crop&q=80",
    rating: 4.4
  },
  {
    name: "Minimalist Women's Bracelet Watch",
    price: 1950,
    category: "Accessories",
    image: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=600&auto=format&fit=crop&q=80",
    rating: 4.7
  },
  {
    name: "Casual Unisex Baseball Cap - Navy",
    price: 450,
    category: "Accessories",
    image: "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=600&auto=format&fit=crop&q=80",
    rating: 4.3
  },
  {
    name: "Waterproof Travel Organizer Pouch",
    price: 650,
    category: "Accessories",
    image: "https://images.unsplash.com/photo-1544816155-12df9643f363?w=600&auto=format&fit=crop&q=80",
    rating: 4.6
  }
];

export async function uploadDemoProducts() {
  console.log("Adding demo products to Firestore...");
  try {
    for (const prod of demoProducts) {
      await addDoc(collection(db, "products"), prod);
    }
    console.log("Successfully added 40 demo products!");
    alert("🎉 ৪০টি ডেমো প্রোডাক্ট সফলভাবে ডাটাবেজে যুক্ত হয়েছে!");
  } catch (error) {
    console.error("Error adding products: ", error);
    alert("❌ প্রোডাক্ট যোগ করার সময় ভুল হয়েছে!");
  }
}
