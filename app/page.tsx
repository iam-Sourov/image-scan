"use client";

import { useState, useEffect } from "react";
import { UploadZone } from "@/components/UploadZone";
import { ScanningAnimation } from "@/components/ScanningAnimation";
import { AnalysisDashboard, type DetectionResult } from "@/components/AnalysisDashboard";
import { HistorySidebar, type HistoryItem } from "@/components/HistorySidebar";
import { motion, AnimatePresence } from "framer-motion";
import { Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetDescription } from "@/components/ui/sheet";
import { Clock } from "lucide-react";

export default function Home() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentImageSrc, setCurrentImageSrc] = useState<string | null>(null);
  const [currentResult, setCurrentResult] = useState<DetectionResult | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    // Load history from localStorage on initial render
    const saved = localStorage.getItem("scanHistory");
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse history", e);
      }
    }
  }, []);

  const saveToHistory = (item: HistoryItem) => {
    const updatedHistory = [item, ...history].slice(0, 50); // Keep last 50
    setHistory(updatedHistory);
    localStorage.setItem("scanHistory", JSON.stringify(updatedHistory));
  };

  const handleUpload = async (fileOrUrl: File | string) => {
    setIsProcessing(true);
    setCurrentResult(null);

    let imageSrc = "";
    if (typeof fileOrUrl === "string") {
      imageSrc = fileOrUrl;
    } else {
      imageSrc = URL.createObjectURL(fileOrUrl);
    }
    setCurrentImageSrc(imageSrc);

    try {
      // Create FormData
      const formData = new FormData();
      if (typeof fileOrUrl === "string") {
        formData.append("url", fileOrUrl);
      } else {
        formData.append("file", fileOrUrl);
      }

      // Call API
      const res = await fetch("/api/detect", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        let errorMsg = "Detection failed";
        try {
          const errorData = await res.json();
          errorMsg = errorData.error || errorMsg;
        } catch { /* ignore parse error */ }
        throw new Error(errorMsg);
      }

      const result: DetectionResult = await res.json();
      setCurrentResult(result);

      // Save to history
      saveToHistory({
        id: crypto.randomUUID(),
        timestamp: Date.now(),
        imageSrc,
        result,
      });
    } catch (error: unknown) {
      console.error(error);
      const message = error instanceof Error ? error.message : "An unexpected error occurred during detection";
      toast.error(message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleHistorySelect = (item: HistoryItem) => {
    setCurrentImageSrc(item.imageSrc);
    setCurrentResult(item.result);
    setIsProcessing(false);
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem("scanHistory");
    toast.success("History cleared");
  };

  const resetState = () => {
    setCurrentImageSrc(null);
    setCurrentResult(null);
    setIsProcessing(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 font-sans selection:bg-indigo-500/30">
      <div className="flex-1 flex flex-col relative">

        {/* Header */}
        <header className="relative z-10 w-full max-w-7xl mx-auto p-4 sm:p-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center" onClick={resetState} style={{ cursor: 'pointer' }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold tracking-tight">AI Photo Checker</h1>
          </div>

          <div className="flex items-center gap-4">
            {history.length > 0 && (
              <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
                <SheetTrigger asChild>
                  <Button
                    variant="outline"
                    className="border-slate-200 dark:border-slate-800 bg-white dark:bg-black"
                  >
                    <Clock className="w-4 h-4 mr-2" />
                    History
                  </Button>
                </SheetTrigger>
                <SheetContent className="w-full sm:max-w-md p-0 border-l border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
                  <SheetHeader className="sr-only">
                    <SheetTitle>History Sidebar</SheetTitle>
                    <SheetDescription>View your recently checked photos</SheetDescription>
                  </SheetHeader>
                  <div className="h-full w-full overflow-hidden">
                    <HistorySidebar onSelect={handleHistorySelect} onClear={clearHistory} history={history} />
                  </div>
                </SheetContent>
              </Sheet>
            )}
            {currentResult && (
              <Button
                variant="default"
                className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full px-4 sm:px-6 shadow-md"
                onClick={resetState}
              >
                Check Another Photo
              </Button>
            )}
          </div>
        </header>

        {/* Hero & Content */}
        <main className="relative z-10 flex-1 w-full max-w-7xl mx-auto p-4 sm:p-6 pt-6 sm:pt-10 md:pt-20 flex flex-col items-center min-h-[500px]">
          <AnimatePresence mode="wait">
            {!currentImageSrc && !isProcessing && (
              <motion.div
                key="hero"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20, filter: "blur(10px)" }}
                transition={{ duration: 0.5 }}
                className="w-full text-center space-y-12"
              >
                <div className="space-y-4 md:space-y-6 max-w-3xl mx-auto px-2">
                  <h2 className="text-4xl sm:text-5xl md:text-7xl font-black tracking-tighter leading-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-500 dark:from-white dark:to-slate-500">
                    Is this photo real or AI? Let&apos;s find out.
                  </h2>
                  <p className="text-base sm:text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                    Just drop a picture below, and I&apos;ll take a close look at the details to see if it was snapped by a real camera or created by artificial intelligence.
                  </p>
                </div>

                <UploadZone onUpload={handleUpload} isProcessing={isProcessing} />
              </motion.div>
            )}

            {isProcessing && currentImageSrc && (
              <motion.div
                key="scanning"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                transition={{ duration: 0.5 }}
                className="w-full"
              >
                <div className="text-center mb-6 sm:mb-8 space-y-2 px-2">
                  <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Hmm, taking a look...</h2>
                  <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400">Analyzing the pixels and looking for clues...</p>
                </div>
                <ScanningAnimation imageSrc={currentImageSrc} />
              </motion.div>
            )}

            {!isProcessing && currentResult && currentImageSrc && (
              <motion.div
                key="result"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full"
              >
                <AnalysisDashboard result={currentResult} imageSrc={currentImageSrc} />
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}