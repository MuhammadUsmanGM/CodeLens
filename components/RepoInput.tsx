"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Github, ArrowRight, Shield, Zap, Search } from "lucide-react";
import { cn } from "@/lib/utils";

interface RepoInputProps {
  onAnalyze: (url: string) => void;
  isAnalyzing: boolean;
}

export function RepoInput({ onAnalyze, isAnalyzing }: RepoInputProps) {
  const [url, setUrl] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim()) {
      onAnalyze(url.trim());
    }
  };

  return (
    <div className="flex flex-col items-center w-full max-w-3xl px-4 animate-in fade-in slide-in-from-bottom-6 duration-1000">
      {/* Logo Section */}
      <div className="relative mb-12 group">
        <div className="absolute inset-0 bg-primary/30 blur-[60px] rounded-full group-hover:bg-primary/40 transition-all duration-700" />
        <div className="relative p-1 bg-gradient-to-b from-white/10 to-transparent rounded-[2.5rem] border border-white/5 shadow-2xl">
          <Image
            src="/logo.webp"
            alt="RepoIQ Logo"
            width={140}
            height={140}
            className="rounded-[2.4rem] grayscale-[20%] group-hover:grayscale-0 transition-all duration-700 brightness-110"
            priority
          />
        </div>
      </div>

      {/* Heading Section */}
      <div className="text-center space-y-4 mb-12">
        <h1 className="text-6xl md:text-7xl font-display tracking-tight text-foreground">
          Neural <span className="text-primary bg-clip-text text-transparent bg-gradient-to-r from-primary to-amber-600">Codebase</span> Explorer
        </h1>
        <p className="text-muted-foreground text-lg md:text-xl max-w-xl mx-auto font-medium leading-relaxed opacity-80">
          Transform your repository into a conversational workspace. 
          Instant indexing, semantic search, and deep architectural insights.
        </p>
      </div>

      {/* Premium Input Form */}
      <div className="relative w-full max-w-2xl group mx-auto">
        <div className="absolute -inset-1 bg-gradient-to-r from-primary via-amber-500 to-primary rounded-2xl blur-lg opacity-10 group-focus-within:opacity-30 transition duration-1000 animate-pulse" />
        <form 
          onSubmit={handleSubmit}
          className="relative flex items-center bg-card/80 backdrop-blur-2xl border border-white/10 rounded-2xl p-2 shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)] focus-within:ring-1 focus-within:ring-primary/30 transition-all overflow-hidden"
        >
          <div className="pl-5 pr-3 text-muted-foreground/60">
            <Github size={22} className="group-hover:text-primary transition-colors" />
          </div>
          <input
            type="text"
            placeholder="Paste GitHub repository URL..."
            className="flex-1 bg-transparent border-none outline-none text-foreground py-4 text-lg placeholder:text-muted-foreground/40 font-medium"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            disabled={isAnalyzing}
          />
          <button
            type="submit"
            disabled={isAnalyzing || !url.trim()}
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-4 rounded-xl font-bold flex items-center gap-3 transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100 shadow-xl shadow-primary/10 group/btn overflow-hidden relative cursor-pointer disabled:cursor-not-allowed"
          >
            <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-700" />
            {isAnalyzing ? (
              <Zap className="animate-pulse" size={20} />
            ) : (
              <ArrowRight size={20} />
            )}
            <span className="relative z-10">Map Repository</span>
          </button>
        </form>
      </div>

      {/* Feature Pills */}
      <div className="flex flex-wrap justify-center gap-12 mt-20 opacity-60 hover:opacity-100 transition-opacity duration-500 underline-offset-8">
        {[
          { icon: Search, label: "Semantic RAG" },
          { icon: Shield, label: "Read-Only Access" },
          { icon: Zap, label: "Instant Sync" }
        ].map((feat, i) => (
          <div key={i} className="flex items-center gap-3 group">
            <feat.icon size={18} className="text-primary group-hover:scale-125 transition-transform" />
            <span className="text-xs font-bold uppercase tracking-[0.2em]">{feat.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
