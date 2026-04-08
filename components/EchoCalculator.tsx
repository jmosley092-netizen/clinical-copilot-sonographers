"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

export function EchoCalculator() {
  // === EXISTING CALCULATOR STATE ===
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

  // === NEW: Image + Thumbnail ===
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Load/save reports
  useEffect(() => {
    const saved = localStorage.getItem("echoReports");
    if (saved) setSavedReports(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem("echoReports", JSON.stringify(savedReports));
  }, [savedReports]);

  // Cleanup preview URL to prevent memory leaks
  useEffect(() => {
    return () => { if (imagePreview) URL.revokeObjectURL(imagePreview); };
  }, [imagePreview]);

  // === CALCULATIONS (unchanged) ===
  const getDiastologyGrade = () => {
    if (eaRatio < 0.8) return { grade: "Grade I", color: "text-emerald-400", desc: "Impaired relaxation" };
    if (eaRatio > 2) return { grade: "Grade III", color: "text-red-400", desc: "Restrictive filling" };
    return { grade: "Grade II", color: "text-yellow-400", desc: "Pseudonormal" };
  };

  const ava = (Math.PI * Math.pow(lvotDiameter / 2, 2) * lvotVti) / aorticVti;
  const eroA = (2 * Math.PI * Math.pow(pisaRadius, 2) * aliasingVelocity) / mrPeakVelocity;
  const diastology = getDiastologyGrade();

  // === DRAG & DROP + THUMBNAIL ===
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      setImage(file);
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    }
  };

  // === AI ANALYSIS (now ready to call backend) ===
  const analyzeWithAI = async () => {
    if (!image) {
      alert("Please drag in an ultrasound image first");
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("image", image);
    formData.append("study_uid", "TEMP-" + Date.now());
    formData.append("institution", institution);
    formData.append("measurements", JSON.stringify({
      eaRatio, eSeptal, lvotDiameter, lvotVti, aorticVti,
      pisaRadius, aliasingVelocity, mrPeakVelocity, tapse
    }));

    try {
      const res = await fetch("https://YOUR-DROPLET-IP:8000/analyze-echo", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      setFeedback(data);
    } catch (err) {
      alert("Backend not responding yet — we'll activate it in the next step!");
      console.error(err);
    }
    setLoading(false);
  };

  const saveReport = () => { /* unchanged — your original saveReport code */ };
  const resetAll = () => {
    setEaRatio(0.8); setESeptal(7);
    setLvotDiameter(2.0); setLvotVti(20); setAorticVti(100);
    setPisaRadius(0.9); setAliasingVelocity(40); setMrPeakVelocity(500);
    setTapse(18);
    setImage(null);
    setImagePreview(null);
    setFeedback(null);
  };

  return (
    <Card className="border-zinc-700 bg-zinc-900">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-emerald-400">
          <Calculator className="w-6 h-6" />
          Clinical CoPilot – Echo MVP++
        </CardTitle>
        <p className="text-xs text-zinc-500">AI-Assisted Feedback • Any ultrasound machine</p>
      </CardHeader>

      <CardContent className="space-y-8">
        {/* Institution field */}
        <div>
          <Label className="text-zinc-400">Institution (shows on all reports)</Label>
          <Input value={institution} onChange={e => setInstitution(e.target.value)} className="mt-1 bg-zinc-950 border-zinc-700" />
        </div>

        {/* Drag & Drop with THUMBNAIL */}
        <div
          onDrop={handleDrop}
          onDragOver={e => e.preventDefault()}
          className="border-2 border-dashed border-emerald-500 rounded-2xl p-6 text-center hover:bg-zinc-950 transition relative"
        >
          {imagePreview ? (
            <div className="space-y-3">
              <img src={imagePreview} alt="Ultrasound preview" className="max-h-64 mx-auto rounded-xl shadow-inner border border-zinc-700" />
              <p className="text-emerald-400 text-sm font-medium">✅ {image?.name} ready for AI</p>
            </div>
          ) : (
            <>
              <Upload className="mx-auto w-12 h-12 text-emerald-400" />
              <p className="mt-4 font-medium">Drag &amp; drop ultrasound image here</p>
              <p className="text-sm text-zinc-500">GE Logiq e95, Vscan Air, or any machine (JPEG/PNG/DICOM)</p>
            </>
          )}
        </div>

        {/* Your existing Tabs go here — unchanged (copy them from your previous version) */}

        <Separator className="bg-zinc-700" />

        <Button
          onClick={analyzeWithAI}
          disabled={loading || !image}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-lg py-6"
        >
          {loading ? "Analyzing with AI-Assisted Feedback..." : "Analyze Image with AI-Assisted Feedback"}
        </Button>

        {/* AI Results + Send to Navigator button — unchanged from last version */}

        {/* Your Save/Reset + Saved Reports section — unchanged */}

      </CardContent>
    </Card>
  );
}