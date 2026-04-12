"use client";

import React, { useState } from "react";
import EchoFreeCalculator from "./EchoFreeCalculator";   // ← NEW IMPORT

const ClinicalTabs: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"navigator" | "calculator">("navigator");

  // Navigator tab (unchanged)
  const [images, setImages] = useState<File[]>([]);
  const [analysisResult, setAnalysisResult] = useState("");
  const [selectedCalculator, setSelectedCalculator] = useState("");

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    setImages(files);
  };

  const handleAnalyze = () => {
    if (images.length === 0) return;
    setAnalysisResult("Analyzing with AI (MedGemma)...");
    setTimeout(() => {
      setSelectedCalculator("Vascular Calculator");
      setAnalysisResult("✅ Analysis complete\nDetected vascular study\nAuto-selected: Vascular Calculator");
    }, 1200);
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-6">
      {/* Tabs */}
      <div className="flex border-b border-zinc-700 mb-8">
        <button
          onClick={() => setActiveTab("navigator")}
          className={`px-8 py-4 text-xl font-medium transition-all ${
            activeTab === "navigator"
              ? "border-b-4 border-cyan-400 text-cyan-400"
              : "text-zinc-400 hover:text-zinc-200"
          }`}
        >
          📸 Navigator
        </button>
        <button
          onClick={() => setActiveTab("calculator")}
          className={`px-8 py-4 text-xl font-medium transition-all ${
            activeTab === "calculator"
              ? "border-b-4 border-cyan-400 text-cyan-400"
              : "text-zinc-400 hover:text-zinc-200"
          }`}
        >
          🫀 Echo Calculator
        </button>
      </div>

      {/* Navigator Tab (unchanged) */}
      {activeTab === "navigator" && (
        <div className="space-y-6">
          <div
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            className="border-4 border-dashed border-blue-400 rounded-3xl h-96 flex flex-col items-center justify-center bg-zinc-900 hover:bg-zinc-800 cursor-pointer"
          >
            {images.length > 0 ? (
              <p className="text-2xl font-semibold text-cyan-400">{images.length} image(s) ready</p>
            ) : (
              <div className="text-center">
                <div className="text-6xl mb-4">📤</div>
                <p className="text-2xl font-medium">Drag &amp; drop ultrasound images here</p>
              </div>
            )}
          </div>

          <button
            onClick={handleAnalyze}
            disabled={images.length === 0}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6 rounded-2xl text-2xl font-semibold"
          >
            Analyze with AI
          </button>

          {analysisResult && (
            <div className="bg-green-900/30 border border-green-400 p-6 rounded-3xl">
              <p className="whitespace-pre-line text-green-300">{analysisResult}</p>
              {selectedCalculator && <p className="mt-3 text-cyan-400">Auto-selected: {selectedCalculator}</p>}
            </div>
          )}
        </div>
      )}

      {/* CALCULATOR TAB — NOW YOUR FULL ECHO CALCULATOR */}
      {activeTab === "calculator" && <EchoFreeCalculator />}
    </div>
  );
};

export default ClinicalTabs;