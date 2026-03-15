"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Database, Trash2, Home } from "lucide-react";
import { ChatWindow } from "@/components/ChatWindow";
import { ThemeToggle } from "@/components/ThemeToggle";
import { RepoInfo } from "@/types";
import { Toaster, toast } from "sonner";

export default function ChatPage() {
  const params = useParams();
  const router = useRouter();
  const repoId = decodeURIComponent(params.repoId as string);
  
  const [repoInfo, setRepoInfo] = useState<RepoInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRepoInfo = async () => {
      try {
        const res = await fetch(`/api/repo/${encodeURIComponent(repoId)}`);
        if (!res.ok) {
          if (res.status === 404) {
            toast.error("Repository not indexed");
            router.push("/");
            return;
          }
          throw new Error("Failed to fetch repo info");
        }
        const data = await res.json();
        setRepoInfo(data);
      } catch (error) {
        // Failed to fetch repo info — handled by loading state
      } finally {
        setIsLoading(false);
      }
    };

    fetchRepoInfo();
  }, [repoId, router]);

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this indexed repository?")) return;
    
    try {
      await fetch(`/api/repo/${encodeURIComponent(repoId)}`, { method: "DELETE" });
      toast.success("Repository data cleared");
      router.push("/");
    } catch (error) {
      toast.error("Failed to delete repository");
    }
  };

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <Database className="animate-bounce text-primary" size={40} />
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-background">
      <Toaster 
        position="top-center" 
        visibleToasts={3} 
        expand={false} 
        duration={7000} 
        theme="system"
        closeButton
        richColors
      />
      
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-border bg-background/50 backdrop-blur-md z-10">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.push("/")}
            className="p-2 hover:bg-muted rounded-lg transition-colors text-muted-foreground hover:text-foreground"
          >
            <Home size={20} />
          </button>
          <div className="h-4 w-px bg-border mx-1" />
          <div className="flex flex-col">
            <h1 className="text-sm font-bold uppercase tracking-widest text-foreground truncate max-w-[200px] md:max-w-[400px]">
              {repoId}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          <button 
            onClick={handleDelete}
            className="p-2 hover:bg-destructive/10 hover:text-destructive rounded-lg transition-colors text-muted-foreground"
            title="Delete Index"
          >
            <Trash2 size={20} />
          </button>
        </div>
      </header>

      {/* Main Layout Container */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar - Context Explorer */}
        <aside className="hidden lg:flex w-72 border-r border-border flex-col bg-card/30">
          <div className="p-6 border-b border-border">
            <h2 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-4">Neural Context</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Status</span>
                <span className="flex items-center gap-1.5 text-xs font-bold text-green-500 uppercase tracking-tighter">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                  Live
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Indexed Chunks</span>
                <span className="text-xs font-mono font-bold">{repoInfo?.chunkCount || 0}</span>
              </div>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
            <h2 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-4">Source Map</h2>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs text-muted-foreground italic">
                <Database size={12} />
                Indexing complete. AI has full access to repository logic.
              </div>
              {/* Optional: Add a file list here in the future */}
            </div>
          </div>
        </aside>

        {/* Chat Area */}
        <main className="flex-1 relative bg-background/50">
          <ChatWindow repoId={repoId} />
        </main>
      </div>
    </div>
  );
}
