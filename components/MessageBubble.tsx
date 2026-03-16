"use client";

import { Sparkles, User, Terminal, Copy, Check } from "lucide-react";
import { ChatMessage } from "@/types";
import { cn } from "@/lib/utils";
import { SourceCitation } from "./SourceCitation";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

interface MessageBubbleProps {
  message: ChatMessage;
}

import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

export function MessageBubble({ message }: MessageBubbleProps) {
  const isBot = message.role === "bot";
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className={cn(
        "flex w-full mb-8 group",
        isBot ? "justify-start" : "justify-end"
      )}
    >
      <div className={cn(
        "flex max-w-[98%] sm:max-w-[85%] md:max-w-[80%] gap-2 md:gap-4 min-w-0",
        isBot ? "flex-row" : "flex-row-reverse"
      )}>
        {/* Avatar */}
        <div className={cn(
          "hidden xs:flex h-8 w-8 md:h-10 md:w-10 shrink-0 rounded-xl md:rounded-2xl items-center justify-center border shadow-sm transition-transform group-hover:scale-110",
          isBot 
            ? "bg-gradient-to-br from-primary/20 to-amber-500/10 border-primary/20 text-primary" 
            : "bg-muted border-border text-muted-foreground"
        )}>
          {isBot ? <Sparkles size={14} className="md:w-[18px] md:h-[18px]" /> : <User size={14} className="md:w-[18px] md:h-[18px]" />}
        </div>

        {/* Content Container */}
        <div className="flex flex-col gap-1 md:gap-3 min-w-0 flex-1">
          <div className={cn(
            "relative px-3 py-2.5 md:px-6 md:py-4 rounded-[1.25rem] md:rounded-[2rem] shadow-sm border transition-all overflow-hidden",
            isBot 
              ? "bg-card border-border text-foreground rounded-tl-none hover:shadow-md" 
              : "bg-primary text-primary-foreground border-primary rounded-tr-none shadow-primary/20 font-medium"
          )}>
            {/* Copy Button (Bot Only) */}
            {isBot && message.content && (
              <button 
                onClick={copyToClipboard}
                className="absolute top-3 right-3 p-1.5 rounded-lg bg-background/50 text-muted-foreground opacity-0 group-hover:opacity-100 transition-all hover:bg-muted"
                title="Copy response"
              >
                {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
              </button>
            )}

            <div className="prose prose-sm dark:prose-invert max-w-none break-words leading-relaxed overflow-x-hidden">
              {message.content ? (
                <ReactMarkdown
                  components={{
                    code({ node, inline, className, children, ...props }: any) {
                      const match = /language-(\w+)/.exec(className || "");
                      return !inline && match ? (
                        <div className="relative my-4 rounded-xl overflow-hidden border border-white/10 shadow-lg">
                          <div className="flex items-center justify-between px-4 py-2 bg-zinc-900 border-b border-white/5">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">{match[1]}</span>
                          </div>
                          <SyntaxHighlighter
                            style={oneDark}
                            language={match[1]}
                            PreTag="div"
                            customStyle={{
                              margin: 0,
                              padding: '1.25rem',
                              fontSize: '0.85rem',
                              background: '#09090b',
                            }}
                            {...props}
                          >
                            {String(children).replace(/\n$/, "")}
                          </SyntaxHighlighter>
                        </div>
                      ) : (
                        <code className={className} {...props}>
                          {children}
                        </code>
                      );
                    },
                    p: ({children}) => <p className="mb-4 last:mb-0">{children}</p>,
                    ul: ({children}) => <ul className="list-disc pl-4 mb-4">{children}</ul>,
                    ol: ({children}) => <ol className="list-decimal pl-4 mb-4">{children}</ol>,
                  }}
                >
                  {message.content}
                </ReactMarkdown>
              ) : (
                <div className="flex gap-1 items-center h-5">
                  <motion.div animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 1 }} className="w-1 h-1 bg-primary rounded-full" />
                  <motion.div animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-1 h-1 bg-primary rounded-full" />
                  <motion.div animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-1 h-1 bg-primary rounded-full" />
                </div>
              )}
            </div>
          </div>

          {/* Sources */}
          {isBot && message.sources && message.sources.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-1">
              {message.sources.map((source, i) => (
                <SourceCitation key={i} filePath={source} />
              ))}
            </div>
          )}

          {/* Timestamp */}
          <div className={cn(
            "text-[10px] uppercase tracking-widest font-bold opacity-30",
            isBot ? "text-left" : "text-right"
          )}>
            {message.timestamp?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
