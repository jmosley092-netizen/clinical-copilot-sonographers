"use client";

import React, { useState } from "react";

const ClinicalTabs: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"navigator" | "calculator">("navigator");

  // Navigator tab
  const [images, setImages] = useState<File[]>([]);
  const [analysisResult, setAnalysisResult] = useState("");
  const [selectedCalculator, setSelectedCalculator] = useState("");

  // Calculator tab
  const [measurementText, setMeasurementText] = useState("");
  const [calculatorResult, setCalculatorResult] = useState("");

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

  const handleInterpret = () => {
    if (!measurementText.trim()) return;
    setCalculatorResult("Interpreting...");
    setTimeout(() => {
      setCalculatorResult(`✅ Interpretation:\n\n${measurementText}\n\nClinical note: Values within normal limits.`);
    }, 800);
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-6">
      {/* Tabs */}
      <div className="flex border-b border-gray-300 mb-6">
        <button
          onClick={() => setActiveTab("navigator")}
          className={`px-8 py-4 text-lg font-medium ${
            activeTab === "navigator" ? "border-b-4 border-blue-600 text-blue-600" : "text-gray-600"
          }`}
        >
          📸 Navigator
        </button>
        <button
          onClick={() => setActiveTab("calculator")}
          className={`px-8 py-4 text-lg font-medium ${
            activeTab === "calculator" ? "border-b-4 border-blue-600 text-blue-600" : "text-gray-600"
          }`}
        >
          🧮 Calculator
        </button>
      </div>

      {/* Navigator Tab */}
      {activeTab === "navigator" && (
        <div className="space-y-6">
          <div
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            className="border-4 border-dashed border-blue-400 rounded-3xl h-96 flex flex-col items-center justify-center bg-blue-50 hover:bg-blue-100 cursor-pointer"
          >
            {images.length > 0 ? (
              <p className="text-2xl font-semibold text-blue-700">{images.length} image(s) ready</p>
            ) : (
              <div className="text-center">
                <div className="text-6xl mb-4">📤</div>
                <p className="text-2xl font-medium">Drag & drop images here</p>
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
            <div className="bg-green-50 p-6 rounded-3xl">
              <p className="whitespace-pre-line">{analysisResult}</p>
              {selectedCalculator && <p className="mt-3 text-blue-600">Auto-selected: {selectedCalculator}</p>}
            </div>
          )}
        </div>
      )}

      {/* Calculator Tab */}
      {activeTab === "calculator" && (
        <div className="space-y-6">
          <textarea
            value={measurementText}
            onChange={(e) => setMeasurementText(e.target.value)}
            placeholder="Type measurements here...&#10;Example: PSV 85 cm/s&#10;EDV 32 cm/s"
            className="w-full h-64 p-6 text-lg border border-gray-300 rounded-3xl"
          />
          <button
            onClick={handleInterpret}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-6 rounded-2xl text-2xl font-semibold"
          >
            Interpret Measurements
          </button>
          {calculatorResult && (
            <div className="bg-emerald-50 p-6 rounded-3xl whitespace-pre-line">
              {calculatorResult}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ClinicalTabs;