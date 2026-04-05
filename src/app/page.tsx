"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ShoppingCart, Flame, Star, Clock } from "lucide-react";

export default function HomePage() {
  const categories = [
    { name: "Asian Cuisine", active: true },
    { name: "American Cuisine", active: false },
    { name: "European Cuisine", active: false },
    { name: "Vegetarian/Vegan", active: false },
    { name: "Healthy Food", active: false },
    { name: "Fast Food", active: false },
    { name: "Beverages", active: false },
  ];

  const popularItems = [
    {
      id: 1,
      name: "American Style Burger",
      price: 27000,
      oldPrice: 32000,
      rating: 4.8,
      time: "15-20 min",
      image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=800",
    },
    {
      id: 2,
      name: "Chicken Kebab Skewers",
      price: 25000,
      oldPrice: 28000,
      rating: 4.7,
      time: "20-25 min",
      image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&q=80&w=800",
    },
    {
      id: 3,
      name: "Pasta Tomato Basil",
      price: 32000,
      oldPrice: 35000,
      rating: 4.9,
      time: "10-15 min",
      image: "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?auto=format&fit=crop&q=80&w=800",
    },
    {
      id: 4,
      name: "Grilled Herb Lobster",
      price: 45000,
      oldPrice: 50000,
      rating: 4.9,
      time: "30-40 min",
      image: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&q=80&w=800",
    },
    {
      id: 5,
      name: "Curry Yellow Rice",
      price: 22000,
      oldPrice: 25000,
      rating: 4.6,
      time: "10-20 min",
      image: "https://images.unsplash.com/photo-1631515243349-e0cb4c1133c9?auto=format&fit=crop&q=80&w=800",
    },
    {
      id: 6,
      name: "Spicy Roasted Chicken",
      price: 38000,
      oldPrice: 42000,
      rating: 4.8,
      time: "25-30 min",
      image: "https://images.unsplash.com/photo-1598514982205-f36b96d1e8d4?auto=format&fit=crop&q=80&w=800",
    },
  ];

  return (
    <main className="w-full max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-8 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Top Categories</h1>
          <p className="text-muted-foreground mt-1 text-sm font-medium">This is the top picked foods for you</p>
        </div>
        <div className="flex items-center gap-4 text-sm font-bold text-muted-foreground">
          <button className="hover:text-primary transition-colors flex items-center gap-1">
            <Flame className="h-4 w-4" /> Filter
          </button>
          <button className="hover:text-primary transition-colors">Sort</button>
        </div>
      </div>

      {/* Categories Bar */}
      <div className="flex overflow-x-auto pb-4 gap-3 no-scrollbar mb-6">
        {categories.map((cat) => (
          <button
            key={cat.name}
            className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-bold transition-all duration-300 border ${
              cat.active
                ? "bg-white border-muted text-foreground shadow-sm"
                : "bg-transparent border-transparent text-muted-foreground hover:bg-muted/50 hover:text-foreground"
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {popularItems.map((item) => (
          <Card key={item.id} className="group cursor-pointer hover:shadow-md transition-all duration-300 border-transparent bg-muted/30">
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-t-2xl">
              <img
                src={item.image}
                alt={item.name}
                className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg flex items-center gap-1 text-xs font-bold shadow-sm">
                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                {item.rating}
              </div>
              <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg flex items-center gap-1 text-xs font-bold shadow-sm text-muted-foreground">
                <Clock className="h-3 w-3" />
                {item.time}
              </div>
            </div>
            <CardContent className="p-5 flex flex-col gap-2">
              <h3 className="font-extrabold text-[16px] text-foreground line-clamp-1">{item.name}</h3>
              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center gap-2">
                  <span className="text-xl font-black text-foreground">Rp {(item.price / 1000)}k</span>
                  <span className="text-sm font-semibold text-muted-foreground line-through">Rp {(item.oldPrice / 1000)}k</span>
                </div>
                {/* Use Link to drive them to dashboard/order flow to complete auth if needed */}
                <Link href="/order">
                  <Button className="rounded-xl font-bold shadow-sm px-4 bg-primary hover:bg-primary/90 text-white">
                    Order Me
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Banner / Secondary Section */}
      <div className="mt-16 bg-muted/40 rounded-3xl p-8 md:p-12 border border-border/50 text-center space-y-6">
        <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-full mb-2 text-primary">
          <ShoppingCart className="h-6 w-6" />
        </div>
        <h2 className="text-3xl font-extrabold tracking-tight max-w-2xl mx-auto">
          Crave something else? Explore all canteens and dynamic menus.
        </h2>
        <p className="text-muted-foreground font-medium max-w-xl mx-auto">
          Discover a wide variety of meals prepared fresh across the campus right now. Seamless ordering, fast delivery.
        </p>
        <div className="pt-4">
          <Link href="/order">
            <Button size="lg" className="rounded-xl text-lg font-bold shadow-lg shadow-primary/20 px-8 h-14">
              Browse Full Menu
            </Button>
          </Link>
        </div>
      </div>
    </main>
  );
}
