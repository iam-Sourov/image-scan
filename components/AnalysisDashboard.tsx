"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RadialBarChart, RadialBar, ResponsiveContainer, PolarAngleAxis } from "recharts";
import { CheckCircle2, AlertTriangle, ShieldCheck, ShieldAlert } from "lucide-react";
import Image from "next/image";

export interface DetectionResult {
  verdict: "Likely Authentic" | "Likely AI";
  score: number;
  metadata: {
    resolution: string;
    format: string;
    size: string;
  };
  artifacts: {
    name: string;
    status: "Pass" | "Fail" | "Warning";
  }[];
}

interface AnalysisDashboardProps {
  result: DetectionResult;
  imageSrc: string;
}

export function AnalysisDashboard({ result, imageSrc }: AnalysisDashboardProps) {
  const isAuthentic = result.verdict === "Likely Authentic";

  const chartData = [
    {
      name: "Score",
      value: result.score,
      fill: isAuthentic ? "var(--color-authentic)" : "var(--color-ai)",
    },
  ];

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Left Col: Image Preview + Verdict */}
        <div className="flex-1 space-y-6">
          <Card className="overflow-hidden border-slate-200 dark:border-slate-800 shadow-md bg-white dark:bg-slate-950 p-2 sm:p-0">
            <div className="relative aspect-video w-full bg-slate-100 dark:bg-slate-900 flex items-center justify-center">
              {/* Image preview */}
              <Image
                src={imageSrc}
                alt="Analyzed image"
                fill
                className="object-contain"
                unoptimized={imageSrc.startsWith("blob:")}
              />
              <div className="absolute top-4 right-4">
                <Badge
                  variant={isAuthentic ? "default" : "destructive"}
                  className={`text-sm px-4 py-1.5 shadow-lg flex items-center gap-2 ${isAuthentic
                    ? "bg-emerald-500 hover:bg-emerald-600 text-white"
                    : "bg-rose-500 hover:bg-rose-600 text-white"
                    }`}
                >
                  {isAuthentic ? <ShieldCheck className="w-4 h-4" /> : <ShieldAlert className="w-4 h-4" />}
                  {result.verdict}
                </Badge>
              </div>
            </div>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold tracking-tight">Here&apos;s what I found!</CardTitle>
              <CardDescription>I&apos;ve finished looking closely at your photo.</CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Right Col: Score Gauge & Breakdown */}
        <div className="flex-1 space-y-6">
          <Card className="border-slate-200 dark:border-slate-800 shadow-md bg-white dark:bg-slate-950">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Chances it&apos;s a real photo</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center relative">
              <div
                className="h-64 w-full"
                style={
                  {
                    "--color-authentic": "#10b981",
                    "--color-ai": "#f43f5e",
                  } as React.CSSProperties
                }
              >
                <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                  <RadialBarChart
                    cx="50%"
                    cy="60%"
                    innerRadius="70%"
                    outerRadius="100%"
                    barSize={24}
                    data={chartData}
                    startAngle={180}
                    endAngle={0}
                  >
                    <PolarAngleAxis
                      type="number"
                      domain={[0, 100]}
                      angleAxisId={0}
                      tick={false}
                    />
                    <RadialBar
                      background={{ fill: "rgba(100, 116, 139, 0.2)" }}
                      dataKey="value"
                      cornerRadius={12}
                    />
                  </RadialBarChart>
                </ResponsiveContainer>
              </div>

              <div className="absolute top-[60%] left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                <span
                  className={`text-5xl font-black tabular-nums tracking-tighter ${isAuthentic ? "text-emerald-500" : "text-rose-500"
                    }`}
                >
                  {result.score}%
                </span>
                <span className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1 uppercase tracking-wider">
                  Certainty
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 dark:border-slate-800 shadow-md bg-white dark:bg-slate-950">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">The clues I noticed</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {result.artifacts.map((artifact, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      {artifact.name}
                    </span>
                    <Badge
                      variant="outline"
                      className={`
                        flex items-center gap-1 text-xs
                        ${artifact.status === "Pass"
                          ? "border-emerald-500 text-emerald-600 dark:text-emerald-400"
                          : artifact.status === "Warning"
                            ? "border-amber-500 text-amber-600 dark:text-amber-400"
                            : "border-rose-500 text-rose-600 dark:text-rose-400"
                        }
                      `}
                    >
                      {artifact.status === "Pass" && <CheckCircle2 className="w-3 h-3" />}
                      {artifact.status === "Warning" && <AlertTriangle className="w-3 h-3" />}
                      {artifact.status === "Fail" && <AlertTriangle className="w-3 h-3" />}
                      {artifact.status}
                    </Badge>
                  </div>
                ))}
              </div>

              <div className="pt-4 mt-4 border-t border-slate-200 dark:border-slate-700 grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-4 text-center">
                <div className="flex flex-col items-center p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                  <span className="text-xs text-slate-500 mb-1">Format</span>
                  <span className="text-xs font-semibold">{result.metadata.format}</span>
                </div>
                <div className="flex flex-col items-center p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                  <span className="text-xs text-slate-500 mb-1">Size</span>
                  <span className="text-xs font-semibold">{result.metadata.size}</span>
                </div>
                <div className="flex flex-col items-center p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                  <span className="text-xs text-slate-500 mb-1">Resolution</span>
                  <span className="text-xs font-semibold break-all">{result.metadata.resolution}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
