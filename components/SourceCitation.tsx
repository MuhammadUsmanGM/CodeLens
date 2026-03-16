"use client";

import React from "react";
import { Copy, ExternalLink, FileCode } from "lucide-react";
import { cn } from "@/lib/utils";

interface SourceCitationProps {
  filePath: string;
  onClick?: () => void;
}

export function SourceCitation({ filePath, onClick }: SourceCitationProps) {
  return (
    <div 
      className="group flex items-center gap-2 px-2 md:px-3 py-1 md:py-1.5 bg-muted/40 hover:bg-muted/60 border border-border rounded-lg transition-all cursor-pointer max-w-full sm:max-w-[280px]"
      onClick={onClick}
    >
      <FileCode size={12} className="text-primary shrink-0 md:w-3.5 md:h-3.5" />
      <span className="text-[10px] md:text-xs font-medium truncate text-muted-foreground group-hover:text-foreground">
        {filePath}
      </span>
      <ExternalLink size={10} className="hidden md:block opacity-0 group-hover:opacity-100 text-muted-foreground transition-opacity" />
    </div>
  );
}
