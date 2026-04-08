"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Calculator, RotateCcw, Download, Save, Trash2, Upload, Send } from "lucide-react";

type SavedReport = {
  id: string;
  date: string;
  tab: string;
  inputs: any;
  results: string;
  institution: string;
};

export function EchoCalculator({ specialty = "Echocardiography" }: { specialty?: string }) {
  // Calculator states (your original ones)
  const [eaRatio, setEaRatio] = useState(0.8);
  const [eSeptal, setESeptal] = useState(7);
  const [lvotDiameter, setLvotDiameter] = useState(2.0);
  const [lvotVti, setLvotVti] = useState(20);
  const [aorticVti, setAorticVti] = useState(100);
  const [pisaRadius, setPisaRadius] = useState(0.9);
  const [aliasingVelocity, setAliasingVelocity] = useState(40);
  const [mrPeakVelocity, setMrPeakVelocity] = useState(500);
  const [tapse, setTapse] = useState(18);

  const [activeTab, setActiveTab] = useState("diastology");
  const [savedReports, setSavedReports] = useState<SavedReport[]>([]);
  const [institution, setInstitution] = useState("Your Hospital / School Name");

  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Your existing useEffects, calculations, handleDrop, analyzeWithAI, saveReport, resetAll go here (same as before)

  return (
    <Card className="border-zinc-700 bg-zinc-900">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-emerald-400">
          <Calculator className="w-6 h-6" />
          Clinical CoPilot – {specialty}
        </CardTitle>
        <p className="text-xs text-zinc-500">AI-Assisted Educational Feedback • Any ultrasound machine</p>
      </CardHeader>

      <CardContent className="space-y-8">
        {/* Institution field */}
        <div>
          <Label className="text-zinc-400">Institution (shows on all reports)</Label>
          <Input value={institution} onChange={e => setInstitution(e.target.value)} className="mt-1 bg-zinc-950 border-zinc-700" />
        </div>

        {/* Drag & Drop box */}
        <div onDrop={handleDrop} onDragOver={e => e.preventDefault()} className="border-2 border-dashed border-emerald-500 rounded-2xl p-6 text-center hover:bg-zinc-950 transition">
          {imagePreview ? (
            <div className="space-y-3">
              <img src={imagePreview} alt="preview" className="max-h-64 mx-auto rounded-xl border border-zinc-700" />
              <p className="text-emerald-400 text-sm">✅ {image?.name} ready for AI</p>
            </div>
          ) : (
            <>
              <Upload className="mx-auto w-12 h-12 text-emerald-400" />
              <p className="mt-4 font-medium">Drag &amp; drop ultrasound image here</p>
            </>
          )}
        </div>

        {/* Your original calculator tabs and fields would go here if you want them — for now the AI button is the main feature */}

        <Separator className="bg-zinc-700" />

        <Button onClick={analyzeWithAI} disabled={loading || !image} className="w-full bg-emerald-600 hover:bg-emerald-700 text-lg py-6">
          {loading ? "Analyzing with AI-Assisted Feedback..." : "Analyze Image with AI-Assisted Feedback"}
        </Button>

        {feedback && (
          <div className="bg-zinc-950 border border-emerald-700 p-6 rounded-3xl">
            <h3 className="font-semibold text-emerald-400 mb-4">AI-Assisted Analysis &amp; Feedback</h3>
            <pre className="whitespace-pre-wrap text-zinc-200 text-sm">{feedback.feedback}</pre>
          </div>
        )}
      </CardContent>
    </Card>
  );
}