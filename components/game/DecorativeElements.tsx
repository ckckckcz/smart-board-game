'use client';

import { Coins, Star, Sparkles, BookOpen } from 'lucide-react';

const DecorativeElements = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Floating coins */}
      <div className="absolute top-20 left-10 animate-float opacity-60">
        <Coins className="w-8 h-8 text-accent" />
      </div>
      <div className="absolute top-40 right-20 animate-float opacity-50" style={{ animationDelay: '1s' }}>
        <Coins className="w-6 h-6 text-accent" />
      </div>

      {/* Stars */}
      <div className="absolute top-16 right-32 animate-bounce-soft opacity-70">
        <Star className="w-5 h-5 text-accent fill-accent" />
      </div>
      <div className="absolute bottom-32 left-20 animate-bounce-soft opacity-60" style={{ animationDelay: '0.5s' }}>
        <Star className="w-4 h-4 text-accent fill-accent" />
      </div>
      <div className="absolute top-1/3 left-1/4 animate-bounce-soft opacity-50" style={{ animationDelay: '1. 5s' }}>
        <Star className="w-3 h-3 text-accent fill-accent" />
      </div>

      {/* Sparkles */}
      <div className="absolute bottom-40 right-16 animate-pulse-slow opacity-60">
        <Sparkles className="w-6 h-6 text-secondary" />
      </div>
      <div className="absolute top-1/4 right-1/4 animate-pulse-slow opacity-40" style={{ animationDelay: '2s' }}>
        <Sparkles className="w-5 h-5 text-primary" />
      </div>

      {/* Books */}
      <div className="absolute bottom-24 left-1/4 animate-float opacity-50" style={{ animationDelay: '2.5s' }}>
        <BookOpen className="w-7 h-7 text-secondary" />
      </div>

      {/* Gradient orbs */}
      <div className="absolute -top-20 -left-20 w-64 h-64 rounded-full gradient-primary opacity-20 blur-3xl" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full gradient-primary opacity-15 blur-3xl" />
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-secondary/5 blur-3xl" />
    </div>
  );
};

export default DecorativeElements;