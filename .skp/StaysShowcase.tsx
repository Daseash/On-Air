"use client";

import React, { useState } from "react";
import { Skiper47, CarouselSlide } from "./Skiper47";
import { Skiper58 } from "./Skiper58";
import { Highlight, HighlightTab } from "./Highlight";
import { MagneticButton } from "./MagneticButton";
import { SlidersHorizontal, Sparkles } from "lucide-react";

const beachListings: CarouselSlide[] = [
  {
    src: "https://images.unsplash.com/photo-1552733407-5d5c46c3bb3b?auto=format&fit=crop&w=3840&q=90",
    alt: "Malibu Beachfront Villa",
    title: "Cozy Beachfront Cottage",
    location: "Malibu, United States",
    price: 1500,
    rating: 4.95,
  },
  {
    src: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=3840&q=90",
    alt: "Cancun Oceanfront",
    title: "Beachfront Paradise",
    location: "Cancun, Mexico",
    price: 2000,
    rating: 4.88,
  },
  {
    src: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=3840&q=90",
    alt: "Private Island Retreat",
    title: "Private Island Retreat",
    location: "Fiji, Fiji",
    price: 10000,
    rating: 5.0,
  },
  {
    src: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=3840&q=90",
    alt: "Bali Coastal Bungalow",
    title: "Beachfront Bungalow in Bali",
    location: "Bali, Indonesia",
    price: 1800,
    rating: 4.92,
  },
];

const mountainListings: CarouselSlide[] = [
  {
    src: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=3840&q=90",
    alt: "Aspen Mountain Chalet",
    title: "Mountain Retreat",
    location: "Aspen, United States",
    price: 1000,
    rating: 4.91,
  },
  {
    src: "https://images.unsplash.com/photo-1502784444187-359ac186c5bb?auto=format&fit=crop&w=3840&q=90",
    alt: "Banff Alpine Lodge",
    title: "Secluded Alpine Chalet",
    location: "Banff, Canada",
    price: 2400,
    rating: 4.98,
  },
  {
    src: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=3840&q=90",
    alt: "Swiss Alps View Villa",
    title: "Panoramic Alps Sanctuary",
    location: "Zermatt, Switzerland",
    price: 5200,
    rating: 4.99,
  },
  {
    src: "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=3840&q=90",
    alt: "Dolomites Mountain Lodge",
    title: "Dolomite Mountain Haven",
    location: "Cortina, Italy",
    price: 3100,
    rating: 4.96,
  },
];

export const StaysShowcase: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState("all");
  const [showNavMenu, setShowNavMenu] = useState(false);

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 font-sans pb-24">
      {/* Top Bar with Skiper 58 Trigger */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-neutral-200/80 px-6 py-4 flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <span className="text-rose-500 font-black text-2xl tracking-tighter">ON AIR</span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-rose-50 text-rose-600 font-bold border border-rose-200">
            Framer Motion
          </span>
        </div>

        <div className="flex items-center gap-3">
          <MagneticButton
            variant="outline"
            size="sm"
            onClick={() => setShowNavMenu(!showNavMenu)}
          >
            <Sparkles className="w-3.5 h-3.5 mr-1.5 text-rose-500" />
            {showNavMenu ? "Close Menu" : "Text Roll Menu (Skiper 58)"}
          </MagneticButton>

          <MagneticButton variant="accent" size="sm">
            Become a host
          </MagneticButton>
        </div>
      </header>

      {/* Skiper 58 Fullscreen Navigation Overlay */}
      {showNavMenu && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg relative">
            <button
              onClick={() => setShowNavMenu(false)}
              className="absolute -top-12 right-0 text-white hover:text-rose-400 text-sm font-semibold cursor-pointer"
            >
              ✕ Close
            </button>
            <Skiper58 onSelect={() => setShowNavMenu(false)} />
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="text-center py-12 px-4 max-w-3xl mx-auto">
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-neutral-900 mb-3">
          Find Your Next Escape
        </h1>
        <p className="text-neutral-500 text-base mb-8">
          Discover luxury coastal cottages, alpine chalets, and secluded villas in Ultra-HD 4K.
        </p>

        {/* Unlumen UI Highlight Category Filter */}
        <div className="flex justify-center items-center gap-3 mb-6 flex-wrap">
          <Highlight
            activeId={activeCategory}
            onChange={(tab) => setActiveCategory(tab.id)}
          />

          <MagneticButton variant="outline" size="sm" className="gap-1.5">
            <SlidersHorizontal className="w-3.5 h-3.5" />
            Filters
          </MagneticButton>
        </div>
      </section>

      {/* Skiper 47 Perspective Coverflow: Beachfront */}
      <Skiper47
        slides={beachListings}
        title="🏖️ Beachfront Escapes"
        subtitle="Sunny coastal cottages, ocean villas, and tropical paradises in 4K resolution."
        loop={true}
        showPagination={true}
        showNavigation={true}
      />

      {/* Skiper 47 Perspective Coverflow: Mountain Retreats */}
      <Skiper47
        slides={mountainListings}
        title="🌄 Amazing Views & Mountain Retreats"
        subtitle="Alpine chalets, secluded treehouses, and mountain lodges with panoramic views."
        loop={true}
        showPagination={true}
        showNavigation={true}
      />
    </div>
  );
};

export default StaysShowcase;
