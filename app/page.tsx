"use client";

import { useState, useEffect } from "react";
import { UploadZone } from "@/components/UploadZone";
import { ScanningAnimation } from "@/components/ScanningAnimation";
import { AnalysisDashboard, type DetectionResult } from "@/components/AnalysisDashboard";
import { HistorySidebar, type HistoryItem } from "@/components/HistorySidebar";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

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
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 overflow-hidden font-sans selection:bg-indigo-500/30">
      {/* Sidebar Overlay (Mobile) */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col relative overflow-y-auto">
        {/* Decorative Background Gradients */}
        <div className="absolute top-0 inset-x-0 h-[500px] overflow-hidden pointer-events-none fade-out opacity-40 dark:opacity-20 z-0">
          <div className="absolute top-[-200px] left-[-200px] w-[600px] h-[600px] bg-indigo-500 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[100px] opacity-70 animate-blob" />
          <div className="absolute top-[-100px] right-[-200px] w-[500px] h-[500px] bg-emerald-500 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[100px] opacity-70 animate-blob animation-delay-2000" />
        </div>

        {/* Header */}
        <header className="relative z-10 w-full max-w-7xl mx-auto p-6 flex items-center justify-between">
          <div className="flex items-center gap-2" onClick={resetState} style={{ cursor: 'pointer' }}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-emerald-400 flex items-center justify-center shadow-lg">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold tracking-tight">AI Image Authenticator</h1>
          </div>

          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              className="md:hidden border-slate-200 dark:border-slate-800"
              onClick={() => setIsSidebarOpen(true)}
            >
              History
            </Button>
            {currentResult && (
              <Button
                variant="default"
                className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full px-6 shadow-indigo-500/25 shadow-lg"
                onClick={resetState}
              >
                Scan Another
              </Button>
            )}
          </div>
        </header>

        {/* Hero & Content */}
        <main className="relative z-10 flex-1 w-full max-w-7xl mx-auto p-6 pt-10 md:pt-20 flex flex-col items-center min-h-[500px]">
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
                <div className="space-y-6 max-w-3xl mx-auto">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-200/50 dark:bg-slate-800/50 text-slate-800 dark:text-slate-200 font-medium text-sm border border-slate-300/50 dark:border-slate-700/50 shadow-sm backdrop-blur-md">
                    <Sparkles className="w-4 h-4 text-emerald-500" />
                    Powered by advanced forensics AI
                  </div>
                  <h2 className="text-5xl md:text-7xl font-black tracking-tighter leading-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-500 dark:from-white dark:to-slate-500">
                    Detect AI-Generated Images with Precision.
                  </h2>
                  <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                    Upload any image to verify its authenticity. We analyze pixel noise, edge discrepancies, and compression artifacts to uncover deepfakes instantly.
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
                <div className="text-center mb-8 space-y-2">
                  <h2 className="text-3xl font-bold tracking-tight">Analyzing Image...</h2>
                  <p className="text-slate-500 dark:text-slate-400">Please wait while our models run forensics</p>
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

      {/* History Sidebar */}
      <motion.aside
        className={`fixed inset-y-0 right-0 z-50 w-80 bg-white/80 dark:bg-black/40 backdrop-blur-2xl border-l border-slate-200 dark:border-slate-800/50 shadow-[-20px_0_40px_-15px_rgba(0,0,0,0.1)] transition-transform duration-300 md:relative md:translate-x-0 ${isSidebarOpen ? "translate-x-0" : "translate-x-full"
          }`}
      >
        <div className="h-full w-full">
          <HistorySidebar onSelect={handleHistorySelect} onClear={clearHistory} history={history} />
        </div>
      </motion.aside>
    </div>
  );
}