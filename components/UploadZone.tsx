"use client";

import { useState, useCallback } from "react";
import { useDropzone, type FileRejection } from "react-dropzone";
import { Upload, Image as ImageIcon, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

const EXAMPLE_IMAGES = [
  {
    id: 1,
    url: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=1000&auto=format&fit=crop",
    label: "Portrait",
  },
  {
    id: 2,
    url: "https://i.pinimg.com/736x/64/c2/87/64c287907fbcec316902033dc8678978.jpg",
    label: "Digital Art",
  },
  {
    id: 3,
    url: "https://images.unsplash.com/photo-1543852786-1cf6624b9987?q=80&w=1000&auto=format&fit=crop",
    label: "Cat",
  }
];

export function UploadZone({ onUpload, isProcessing }: { onUpload: (file: File | string) => void, isProcessing: boolean }) {

  const onDrop = useCallback((acceptedFiles: File[], fileRejections: FileRejection[]) => {
    if (fileRejections.length > 0) {
      const error = fileRejections[0].errors[0];
      if (error.code === "file-too-large") {
        toast.error("File is too large. Max size is 20MB.");
      } else if (error.code === "file-invalid-type") {
        toast.error("Invalid file type. Please upload JPEG, PNG, or WebP.");
      } else {
        toast.error(error.message);
      }
      return;
    }

    if (acceptedFiles.length > 0) {
      onUpload(acceptedFiles[0]);
      toast.success("Got your photo! Let's take a look.");
    }
  }, [onUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/jpeg": [".jpeg", ".jpg"],
      "image/png": [".png"],
      "image/webp": [".webp"],
    },
    maxSize: 20 * 1024 * 1024, // 20MB
    disabled: isProcessing,
    multiple: false,
  });

  return (
    <div className="w-full max-w-2xl mx-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl rounded-2xl sm:rounded-3xl p-4 sm:p-6 relative overflow-hidden">
      <Tabs defaultValue="upload" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6 bg-slate-100 dark:bg-slate-900 rounded-xl p-1">
          <TabsTrigger value="upload" className="rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800">
            <Upload className="w-4 h-4 mr-2" />
            Upload File
          </TabsTrigger>
          <TabsTrigger value="examples" className="rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800">
            <Sparkles className="w-4 h-4 mr-2" />
            Try Examples
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upload">
          <div
            {...getRootProps()}
            className={`
              relative flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-2xl cursor-pointer transition-all duration-300 ease-in-out
              ${isDragActive ? "border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/20" : "border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-500 hover:bg-slate-50/50 dark:hover:bg-slate-900/50"}
              ${isProcessing ? "opacity-50 cursor-not-allowed pointer-events-none" : ""}
            `}
          >
            <input {...getInputProps()} />
            <AnimatePresence>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center text-center space-y-3 sm:space-y-4 px-2"
              >
                <div className="p-4 bg-indigo-100 dark:bg-indigo-900/30 rounded-full">
                  <ImageIcon className="w-8 h-8 text-indigo-500 dark:text-indigo-400" />
                </div>
                <div>
                  <p className="text-base sm:text-lg font-semibold text-slate-700 dark:text-slate-300">
                    {isDragActive ? "Drop the photo here" : "Drag & drop your photo right here"}
                  </p>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                    or click to choose one (JPEG, PNG, WebP up to 20MB)
                  </p>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </TabsContent>

        <TabsContent value="examples">
          <div className="flex flex-col h-64 justify-center">
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300 text-center mb-6">
              Don&apos;t have a photo? Try checking one of these examples:
            </p>
            <div className="grid grid-cols-3 gap-3 sm:gap-6 px-2 sm:px-6">
              {EXAMPLE_IMAGES.map((img) => (
                <button
                  key={img.id}
                  onClick={() => onUpload(img.url)}
                  disabled={isProcessing}
                  className="relative group rounded-xl overflow-hidden aspect-square border-2 border-transparent hover:border-indigo-500 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-indigo-500/30 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-lg"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img.url} alt={img.label} className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3">
                    <span className="text-white text-xs sm:text-sm font-semibold truncate">{img.label}</span>
                    <span className="text-indigo-200 text-[10px] sm:text-xs">Click to test</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div >
  );
}
