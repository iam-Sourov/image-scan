"use client";

import { useState, useCallback } from "react";
import { useDropzone, type FileRejection } from "react-dropzone";
import { Upload, Link as LinkIcon, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

export function UploadZone({ onUpload, isProcessing }: { onUpload: (file: File | string) => void, isProcessing: boolean }) {
  const [url, setUrl] = useState("");

  const onDrop = useCallback((acceptedFiles: File[], fileRejections: FileRejection[]) => {
    if (fileRejections.length > 0) {
      const error = fileRejections[0].errors[0];
      if (error.code === "file-too-large") {
        toast.error("File is too large. Max size is 5MB.");
      } else if (error.code === "file-invalid-type") {
        toast.error("Invalid file type. Please upload JPEG, PNG, or WebP.");
      } else {
        toast.error(error.message);
      }
      return;
    }

    if (acceptedFiles.length > 0) {
      onUpload(acceptedFiles[0]);
      toast.success("Image uploaded successfully!");
    }
  }, [onUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/jpeg": [".jpeg", ".jpg"],
      "image/png": [".png"],
      "image/webp": [".webp"],
    },
    maxSize: 5 * 1024 * 1024, // 5MB
    disabled: isProcessing,
    multiple: false,
  });

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) {
      toast.error("Please enter a valid URL.");
      return;
    }
    onUpload(url);
    toast.success("URL submitted successfully!");
  };

  return (
    <div className="w-full max-w-2xl mx-auto backdrop-blur-md bg-white/10 dark:bg-black/20 border border-white/20 dark:border-white/10 shadow-2xl rounded-3xl p-6 relative overflow-hidden">
      <Tabs defaultValue="upload" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6 bg-slate-100 dark:bg-slate-900 rounded-xl p-1">
          <TabsTrigger value="upload" className="rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800">
            <Upload className="w-4 h-4 mr-2" />
            Upload File
          </TabsTrigger>
          <TabsTrigger value="url" className="rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800">
            <LinkIcon className="w-4 h-4 mr-2" />
            Paste URL
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
                className="flex flex-col items-center text-center space-y-4"
              >
                <div className="p-4 bg-indigo-100 dark:bg-indigo-900/30 rounded-full">
                  <ImageIcon className="w-8 h-8 text-indigo-500 dark:text-indigo-400" />
                </div>
                <div>
                  <p className="text-lg font-semibold text-slate-700 dark:text-slate-300">
                    {isDragActive ? "Drop the image here" : "Drag & drop your image"}
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                    or click to browse (JPEG, PNG, WebP up to 5MB)
                  </p>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </TabsContent>

        <TabsContent value="url">
          <form onSubmit={handleUrlSubmit} className="flex flex-col space-y-4 h-64 justify-center">
            <div className="flex flex-col space-y-2">
              <label htmlFor="url-input" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Image URL
              </label>
              <div className="flex space-x-2">
                <Input
                  id="url-input"
                  type="url"
                  placeholder="https://example.com/image.jpg"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="flex-1 rounded-xl bg-white/50 dark:bg-black/20"
                  disabled={isProcessing}
                />
                <Button type="submit" disabled={isProcessing} className="rounded-xl px-6 bg-indigo-600 hover:bg-indigo-700 text-white">
                  Analyze
                </Button>
              </div>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 text-center mt-4">
              Supported formats: JPEG, PNG, WebP
            </p>
          </form>
        </TabsContent>
      </Tabs>
    </div>
  );
}
