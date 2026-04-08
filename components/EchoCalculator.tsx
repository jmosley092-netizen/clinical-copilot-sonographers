"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Calculator, RotateCcw, Save, Upload, Send } from "lucide-react";

type SavedReport = {
  id: string;
  date: string;
  tab: string;
  inputs: any;
  results: string;
  institution: string;
};

export function EchoCalculator({ specialty = "Echocardiography" }: { specialty?: string }) {
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

  useEffect(() => {
    const saved = localStorage.getItem("echoReports");
    if (saved) setSavedReports(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem("echoReports", JSON.stringify(savedReports));
  }, [savedReports]);

  useEffect(() => {
    return () => { if (imagePreview) URL.revokeObjectURL(imagePreview); };
  }, [imagePreview]);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

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
      const res = await fetch("http://45.55.59.17:8000/analyze-echo", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      setFeedback(data);
    } catch (err) {
      alert("Backend error – make sure the droplet terminal is still open and running 'python main.py'");
    }
    setLoading(false);
  };

  const saveReport = () => {
    alert("✅ Report saved!");
  };

  const resetAll = () => {
    setImage(null);
    setImagePreview(null);
    setFeedback(null);
  };

  return (
    <Card className="border-zinc-700 bg-zinc-900">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-emerald-400">
          <Calculator className="w-6 h-6" />
          Clinical CoPilot – {specialty}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-8">
        <div>
          <Label className="text-zinc-400">Institution</Label>
          <Input value={institution} onChange={e => setInstitution(e.target.value)} className="mt-1 bg-zinc-950 border-zinc-700" />
        </div>

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