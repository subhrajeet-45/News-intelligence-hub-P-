/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Clock, Target, Play } from 'lucide-react';
import { Article } from '../types';

interface BreakingCarouselProps {
  articles: Article[];
  onSelectArticle: (article: Article) => void;
}

export default function BreakingCarousel({ articles, onSelectArticle }: BreakingCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  const carouselItems = articles.slice(0, 4);

  useEffect(() => {
    if (carouselItems.length <= 1) return;
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % carouselItems.length);
    }, 8000);
    return () => clearInterval(interval);
  }, [carouselItems.length]);

  if (carouselItems.length === 0) return null;

  const activeArticle = carouselItems[activeIndex];

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveIndex((prev) => (prev - 1 + carouselItems.length) % carouselItems.length);
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveIndex((prev) => (prev + 1) % carouselItems.length);
  };

  const formatTime = (isoString: string) => {
    const d = new Date(isoString);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div 
      id="breaking-carousel-container"
      onClick={() => onSelectArticle(activeArticle)}
      className="relative w-full h-[380px] sm:h-[420px] md:h-[480px] rounded-3xl overflow-hidden group cursor-pointer bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl transition-all duration-300"
    >
      {/* Background Image with Ambient Zooming Effect */}
      <div className="absolute inset-0 z-0">
        <img
          src={activeArticle.imageUrl}
          alt={activeArticle.title}
          className="w-full h-full object-cover opacity-80 dark:opacity-65 transition-transform duration-[8000ms] ease-out scale-105 group-hover:scale-100"
        />
        {/* Soft Linear Gradient Overlays to preserve absolute text legibility */}
        <div className="absolute inset-0 bg-linear-to-t from-slate-950 via-slate-900/60 to-slate-950/20" />
      </div>

      {/* Control Buttons */}
      <button
        onClick={handlePrev}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-2.5 rounded-full bg-black/30 hover:bg-black/65 border border-white/10 text-white opacity-0 group-hover:opacity-100 transition-all duration-200 cursor-pointer"
        aria-label="Previous Slide"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      <button
        onClick={handleNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-2.5 rounded-full bg-black/30 hover:bg-black/65 border border-white/10 text-white opacity-0 group-hover:opacity-100 transition-all duration-200 cursor-pointer"
        aria-label="Next Slide"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Slide Indicators */}
      <div className="absolute top-6 right-6 z-20 flex gap-1.5 bg-black/20 p-1.5 rounded-full backdrop-blur-xs">
        {carouselItems.map((_, idx) => (
          <button
            key={idx}
            onClick={(e) => {
              e.stopPropagation();
              setActiveIndex(idx);
            }}
            className={`h-2 rounded-full cursor-pointer transition-all duration-300 ${
              idx === activeIndex ? 'w-6 bg-teal-400' : 'w-2 bg-white/40 hover:bg-white/70'
            }`}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>

      {/* Content Section */}
      <div className="absolute inset-x-0 bottom-0 z-10 p-6 sm:p-10 flex flex-col justify-end h-full">
        
        {/* Indicators and Category Badges */}
        <div className="flex flex-wrap items-center gap-3 mb-3">
          <span className="bg-rose-600 text-white font-mono text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-md flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping shrink-0" />
            Breaking News
          </span>
          <span className="bg-teal-500/90 dark:bg-teal-500/20 backdrop-blur-xs border border-teal-500/20 text-white dark:text-teal-300 font-sans text-xs font-semibold px-3 py-1 rounded-full">
            {activeArticle.category}
          </span>
        </div>

        {/* Story Headline in Elegant Playfair Serif font */}
        <h2 className="text-xl sm:text-2xl md:text-3.5xl font-serif text-white font-bold leading-tight tracking-tight max-w-4xl hover:text-teal-300 dark:hover:text-teal-400 transition-colors duration-200 line-clamp-3 sm:line-clamp-2">
          {activeArticle.title}
        </h2>

        {/* Short AI Summary Brief */}
        <p className="text-slate-300 mt-3 text-xs sm:text-sm max-w-3xl font-sans line-clamp-2 leading-relaxed opacity-90 hidden sm:block">
          {activeArticle.summary}
        </p>

        {/* Metrics Footer info block */}
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-4 pt-4 border-t border-white/10 text-xs text-slate-400 font-sans">
          <span className="font-semibold text-slate-200">{activeArticle.source}</span>
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-teal-400" />
            <span>{formatTime(activeArticle.publishedAt)}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Target className="w-3.5 h-3.5 text-indigo-400" />
            <span>{activeArticle.readTime}</span>
          </div>
          <span className="text-[10px] bg-white/10 text-teal-300 px-2 py-0.5 rounded-sm font-mono uppercase tracking-wider ml-auto shrink-0 hidden md:block">
            AI-Synthesized Context
          </span>
        </div>

      </div>
    </div>
  );
}
