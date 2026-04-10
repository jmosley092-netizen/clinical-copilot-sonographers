"use client";

import React, { useState } from 'react';

const ClinicalTabs: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'navigator' | 'calculator'>('navigator');

  // Navigator tab state
  const [images, setImages] = useState<File[]>([]);
  const [analysisResult, setAnalysisResult] = useState<string>('');
  const [selectedCalculator, setSelectedCalculator] = useState<string>('');

  // Calculator tab state
  const [measurementText, setMeasurementText] = useState<string>('');
  const [calculatorResult, setCalculatorResult] = useState<string>('');

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    setImages(files);
  };

  const handleAnalyze = async () => {
    if (images.length === 0) return;
    setAnalysisResult('Analyzing images with AI... (using local MedGemma)');
    // Simulate AI analysis (we'll hook this to your real backend next)
    setTimeout(() => {
      setSelectedCalculator('Vascular Calculator');
      setAnalysisResult('✅ AI Analysis Complete\n\nDetected: Vascular ultrasound study\nAuto-selected calculator: Vascular\nMeasurements extracted: PSV 85 cm/s, EDV 32 cm/s');
    }, 1200);
  };

  const handleInterpret = () => {
    if (!measurementText.trim()) return;
    setCalculatorResult('Interpreting measurements...');
    setTimeout(() => {
      setCalculatorResult(`✅ Interpretation:\n\n${measurementText}\n\nClinical note: Values appear within normal range. Correlate with patient history.`);
    }, 800);
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-6">
      {/* Tab Buttons */}
      <div className="flex border-b border-gray-300 mb-6">
        <button
          onClick={() => setActiveTab('navigator')}
          className={`px-8 py-4 text-lg font-medium transition-all ${
            activeTab === 'navigator'
              ? 'border-b-4 border-blue-600 text-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          📸 Navigator
        </button>
        <button
          onClick={() => setActiveTab('calculator')}
          className={`px-8 py-4 text-lg font-medium transition-all ${
            activeTab === 'calculator'
              ? 'border-b-4 border-blue-600 text-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          🧮 Calculator
        </button>
      </div>

      {/* Navigator Tab */}
      {activeTab === 'navigator' && (
        <div className="space-y-6">
          <div
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            className="border-4 border-dashed border-blue-400 rounded-3xl h-96 flex flex-col items-center justify-center bg-blue-50 hover:bg-blue-100 transition-colors cursor-pointer"
          >
            {images.length > 0 ? (
              <div className="text-center">
                <p className="text-2xl font-semibold text-blue-700">{images.length} image(s) ready</p>
                <p className="text-sm text-gray-500 mt-2">Drop more or click Analyze</p>
              </div>
            ) : (
              <div className="text-center">
                <div className="text-6xl mb-4">📤</div>
                <p className="text-2xl font-medium text-gray-700">Drag &amp; drop DICOM / images here</p>
                <p className="text-gray-500 mt-2">or click to browse</p>
              </div>
            )}
          </div>

          <button
            onClick={handleAnalyze}
            disabled={images.length === 0}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-6 rounded-2xl text-2xl font-semibold transition-all"
          >
            Analyze with AI
          </button>

          {analysisResult && (
            <div className="bg-green-50 border border-green-200 p-6 rounded-3xl">
              <p className="whitespace-pre-line text-gray-800">{analysisResult}</p>
              {selectedCalculator && (
                <p className="mt-4 text-sm font-medium text-blue-600">
                  Auto-selected: <span className="font-semibold">{selectedCalculator}</span>
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Calculator Tab */}
      {activeTab === 'calculator' && (
        <div className="space-y-6">
          <textarea
            value={measurementText}
            onChange={(e) => setMeasurementText(e.target.value)}
            placeholder="Type measurements here...&#10;Example:&#10;PSV 85 cm/s&#10;EDV 32 cm/s&#10;RI 0.62"
            className="w-full h-64 p-6 text-lg border border-gray-300 rounded-3xl focus:outline-none focus:border-blue-500 font-mono"
          />
          
          <button
            onClick={handleInterpret}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-6 rounded-3xl text-2xl font-semibold transition-all"
          >
            Interpret Measurements
          </button>

          {calculatorResult && (
            <div className="bg-emerald-50 border border-emerald-200 p-6 rounded-3xl whitespace-pre-line">
              {calculatorResult}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ClinicalTabs;