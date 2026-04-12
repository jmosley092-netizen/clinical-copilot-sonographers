"use client";

import React, { useState } from "react";
import EchoFreeCalculator from "./EchoFreeCalculator";   // ← This line is critical

const ClinicalTabs: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"navigator" | "calculator">("navigator");

  // Navigator tab (kept simple for now)
  const [images, setImages] = useState<File[]>([]);

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    setImages(files);
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-6">
      {/* Tabs */}
      <div className="flex border-b border-zinc-700 mb-8">
        <button
          onClick={() => setActiveTab("navigator")}
          className={`px-8 py-4 text-xl font-medium transition-all ${
            activeTab === "navigator" ? "border-b-4 border-cyan-400 text-cyan-400" : "text-zinc-400 hover:text-zinc-200"
          }`}
        >
          📸 Navigator
        </button>
        <button
          onClick={() => setActiveTab("calculator")}
          className={`px-8 py-4 text-xl font-medium transition-all ${
            activeTab === "calculator" ? "border-b-4 border-cyan-400 text-cyan-400" : "text-zinc-400 hover:text-zinc-200"
          }`}
        >
          🫀 Echo Calculator
        </button>
      </div>

      {/* Navigator Tab */}
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
        </div>
      )}

      {/* CALCULATOR TAB — THIS IS WHAT WE WANT TO SEE */}
      {activeTab === "calculator" && <EchoFreeCalculator />}
    </div>
  );
};

export default ClinicalTabs;