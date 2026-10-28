"use client";

import { motion } from "framer-motion";
import { ChevronLeftIcon, ChevronRightIcon, StarIcon } from "lucide-react";
import React, { useRef } from "react";
import {
  Autoplay,
  EffectCoverflow,
  Navigation,
  Pagination,
} from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import type { Swiper as SwiperType } from "swiper";

import "swiper/css";
import "swiper/css/effect-coverflow";
import "swiper/css/pagination";
import "swiper/css/navigation";

import { cn } from "./utils";

export interface CarouselSlide {
  src: string;
  alt: string;
  title?: string;
  location?: string;
  price?: number;
  rating?: number;
}

export interface Skiper47Props {
  slides?: CarouselSlide[];
  title?: string;
  subtitle?: string;
  showPagination?: boolean;
  showNavigation?: boolean;
  loop?: boolean;
  autoplay?: boolean;
  spaceBetween?: number;
  className?: string;
}

const defaultBeachSlides: CarouselSlide[] = [
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
    alt: "Cancun Ocean Paradise",
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
  {
    src: "https://images.unsplash.com/photo-1506929562872-bb421503ef21?auto=format&fit=crop&w=3840&q=90",
    alt: "Santorini Cliffside Villa",
    title: "Cycladic Cliffside Villa",
    location: "Santorini, Greece",
    price: 3200,
    rating: 4.97,
  },
  {
    src: "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?auto=format&fit=crop&w=3840&q=90",
    alt: "Maldives Overwater Bungalow",
    title: "Overwater Ocean Villa",
    location: "Malé, Maldives",
    price: 4500,
    rating: 4.99,
  },
];

export const Skiper47: React.FC<Skiper47Props> = ({
  slides = defaultBeachSlides,
  title = "🏖️ Beachfront Escapes",
  subtitle = "Sunny coastal cottages, ocean villas, and tropical paradises in 4K resolution.",
  showPagination = true,
  showNavigation = true,
  loop = true,
  autoplay = false,
  spaceBetween = 36,
  className,
}) => {
  return (
    <section className={cn("w-full py-8", className)}>
      {(title || subtitle) && (
        <div className="mb-6 px-4 max-w-5xl mx-auto text-left">
          {title && <h2 className="text-2xl font-bold tracking-tight text-neutral-900">{title}</h2>}
          {subtitle && <p className="text-sm text-neutral-500 mt-1">{subtitle}</p>}
        </div>
      )}

      <div className="flex w-full items-center justify-center overflow-hidden">
        <Carousel_001
          images={slides}
          showPagination={showPagination}
          showNavigation={showNavigation}
          loop={loop}
          autoplay={autoplay}
          spaceBetween={spaceBetween}
        />
      </div>
    </section>
  );
};

export const Carousel_001: React.FC<{
  images: CarouselSlide[];
  className?: string;
  showPagination?: boolean;
  showNavigation?: boolean;
  loop?: boolean;
  autoplay?: boolean;
  spaceBetween?: number;
}> = ({
  images,
  className,
  showPagination = true,
  showNavigation = true,
  loop = true,
  autoplay = false,
  spaceBetween = 36,
}) => {
  const swiperRef = useRef<SwiperType | null>(null);

  return (
    <motion.div
      initial={{ opacity: 0, translateY: 20 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{
        duration: 0.35,
        delay: 0.2,
      }}
      className={cn("w-full max-w-3xl relative px-4", className)}
    >
      <Swiper
        onSwiper={(swiper) => (swiperRef.current = swiper)}
        spaceBetween={spaceBetween}
        autoplay={
          autoplay
            ? {
                delay: 2500,
                disableOnInteraction: false,
              }
            : false
        }
        effect="coverflow"
        grabCursor={true}
        centeredSlides={true}
        loop={loop && images.length >= 4}
        slidesPerView={2.43}
        coverflowEffect={{
          rotate: 0,
          slideShadows: false,
          stretch: 0,
          depth: 100,
          modifier: 2.5,
        }}
        pagination={
          showPagination
            ? {
                clickable: true,
                dynamicBullets: false,
              }
            : false
        }
        navigation={false}
        modules={[EffectCoverflow, Autoplay, Pagination, Navigation]}
        className="w-full !pb-12"
      >
        {images.map((image, index) => (
          <SwiperSlide
            key={index}
            className="!h-[340px] w-full rounded-2xl overflow-hidden shadow-lg border border-neutral-200/80 bg-white transition-all duration-300"
          >
            <div className="relative h-[240px] w-full overflow-hidden bg-neutral-100 group">
              <img
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                src={image.src}
                alt={image.alt}
                loading="lazy"
              />
              <span className="absolute top-3 left-3 rounded-full bg-white/90 backdrop-blur-md px-2.5 py-1 text-xs font-semibold text-neutral-800 shadow-sm">
                4K UHD
              </span>
            </div>
            <div className="p-3.5 flex flex-col justify-between h-[100px]">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-neutral-900 text-sm truncate">
                  {image.location || image.alt}
                </span>
                {image.rating && (
                  <span className="flex items-center gap-1 text-xs font-medium text-neutral-700">
                    <StarIcon className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    {image.rating.toFixed(2)}
                  </span>
                )}
              </div>
              <p className="text-xs text-neutral-500 truncate">{image.title || image.alt}</p>
              <p className="text-sm font-bold text-neutral-900">
                ₹{image.price ? image.price.toLocaleString("en-IN") : "1,500"}{" "}
                <span className="text-xs font-normal text-neutral-500">/ night</span>
              </p>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {showNavigation && (
        <>
          <button
            type="button"
            aria-label="Previous Slide"
            onClick={() => swiperRef.current?.slidePrev()}
            className="absolute left-0 top-[40%] -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/95 shadow-md border border-neutral-200 flex items-center justify-center text-neutral-700 hover:scale-110 active:scale-95 transition-all cursor-pointer"
          >
            <ChevronLeftIcon className="w-5 h-5" />
          </button>
          <button
            type="button"
            aria-label="Next Slide"
            onClick={() => swiperRef.current?.slideNext()}
            className="absolute right-0 top-[40%] -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/95 shadow-md border border-neutral-200 flex items-center justify-center text-neutral-700 hover:scale-110 active:scale-95 transition-all cursor-pointer"
          >
            <ChevronRightIcon className="w-5 h-5" />
          </button>
        </>
      )}
    </motion.div>
  );
};

export default Skiper47;
