"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Clock, ShieldCheck, ShieldAlert, ImageIcon, Trash2 } from "lucide-react";
import Image from "next/image";
import type { DetectionResult } from "./AnalysisDashboard";

export interface HistoryItem {
  id: string;
  timestamp: number;
  imageSrc: string;
  result: DetectionResult;
}

interface HistorySidebarProps {
  onSelect: (item: HistoryItem) => void;
  onClear: () => void;
  history: HistoryItem[];
}

export function HistorySidebar({ onSelect, onClear, history }: HistorySidebarProps) {
  if (history.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-6 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
          <Clock className="w-8 h-8 text-slate-300 dark:text-slate-600" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">No History Yet</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Scanned images will appear here
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col pt-6">
      <div className="px-6 pb-4 flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Recent Scans
        </h2>
        <button
          onClick={onClear}
          className="text-xs flex items-center gap-1.5 px-3 py-1.5 rounded-md text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
          title="Clear history"
        >
          <Trash2 className="w-3.5 h-3.5" />
          Clear
        </button>
      </div>
      <ScrollArea className="flex-1 px-4 pb-6">
        <div className="space-y-3">
          {history.map((item) => {
            const isAuthentic = item.result.verdict === "Likely Authentic";
            const date = new Date(item.timestamp).toLocaleDateString();
            const time = new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

            return (
              <div
                key={item.id}
                onClick={() => onSelect(item)}
                className="group p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/50 cursor-pointer transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-700 flex gap-4 items-center"
              >
                <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0">
                  {item.imageSrc.startsWith("http") || item.imageSrc.startsWith("data:") || item.imageSrc.startsWith("blob:") ? (
                    <Image src={item.imageSrc} alt="Thumbnail" fill className="object-cover w-full h-full" unoptimized />
                  ) : (
                    <ImageIcon className="w-6 h-6 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-slate-300" />
                  )}
                  <div className={`absolute bottom-0 left-0 right-0 h-1.5 ${isAuthentic ? "bg-emerald-500" : "bg-rose-500"}`} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge
                      variant="outline"
                      className={`text-[10px] items-center gap-1 font-semibold px-1.5 py-0 border-0 ${isAuthentic
                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400"
                        : "bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:text-rose-400"
                        }`}
                    >
                      {isAuthentic ? <ShieldCheck className="w-3 h-3" /> : <ShieldAlert className="w-3 h-3" />}
                      {item.result.score}%
                    </Badge>
                  </div>
                  <div className="flex items-center text-xs text-slate-500 dark:text-slate-400">
                    <span className="truncate">{date} • {time}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}
