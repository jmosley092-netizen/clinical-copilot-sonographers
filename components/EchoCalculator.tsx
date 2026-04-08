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
  // === EXISTING CALCULATOR STATE (unchanged) ===
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

  // === NEW CoPilot STATE ===
  const [image, setImage] = useState<File | null>(null);
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

  // === CALCULATIONS (unchanged) ===
  const getDiastologyGrade = () => {
    if (eaRatio < 0.8) return { grade: "Grade I", color: "text-emerald-400", desc: "Impaired relaxation" };
    if (eaRatio > 2) return { grade: "Grade III", color: "text-red-400", desc: "Restrictive filling" };
    return { grade: "Grade II", color: "text-yellow-400", desc: "Pseudonormal" };
  };

  const ava = (Math.PI * Math.pow(lvotDiameter / 2, 2) * lvotVti) / aorticVti;
  const eroA = (2 * Math.PI * Math.pow(pisaRadius, 2) * aliasingVelocity) / mrPeakVelocity;
  const diastology = getDiastologyGrade();

  // === DRAG & DROP ===
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) setImage(file);
  };

  // === AI ANALYSIS ===
  const analyzeWithAI = async () => {
    if (!image) {
      alert("Please drag in an ultrasound image first (from Logiq e95 or any machine)");
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("image", image);
    formData.append("study_uid", "TEMP-" + Date.now()); // Orthanc will handle real UID later
    formData.append("institution", institution);
    formData.append("measurements", JSON.stringify({
      eaRatio, eSeptal,
      lvotDiameter, lvotVti, aorticVti,
      pisaRadius, aliasingVelocity, mrPeakVelocity,
      tapse,
      // Add more as we expand
    }));

    try {
      const res = await fetch("https://45.55.59.17:8000/analyze-echo", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      setFeedback(data);
    } catch (err) {
      alert("Could not reach backend yet — make sure your DigitalOcean droplet is running and replace YOUR-DROPLET-IP");
      console.error(err);
    }
    setLoading(false);
  };

  const saveReport = () => {
    const report: SavedReport = {
      id: Date.now().toString(),
      date: new Date().toLocaleString(),
      tab: activeTab,
      institution,
      inputs: { eaRatio, eSeptal, lvotDiameter, lvotVti, aorticVti, pisaRadius, aliasingVelocity, mrPeakVelocity, tapse },
      results: activeTab === "diastology" ? diastology.grade : 
               activeTab === "as" ? `${ava.toFixed(2)} cm²` :
               activeTab === "mr" ? `${eroA.toFixed(2)} cm²` : 
               tapse >= 17 ? "Normal" : "Reduced",
    };
    setSavedReports([report, ...savedReports]);
    alert("✅ Report saved! (includes institution name)");
  };

  const resetAll = () => {
    setEaRatio(0.8); setESeptal(7);
    setLvotDiameter(2.0); setLvotVti(20); setAorticVti(100);
    setPisaRadius(0.9); setAliasingVelocity(40); setMrPeakVelocity(500);
    setTapse(18);
    setImage(null);
    setFeedback(null);
  };

  return (
    <Card className="border-zinc-700 bg-zinc-900">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-emerald-400">
          <Calculator className="w-6 h-6" />
          Clinical CoPilot – Echo MVP++
        </CardTitle>
        <p className="text-xs text-zinc-500">AI-Assisted Feedback • Any ultrasound machine • Educational only</p>
      </CardHeader>

      <CardContent className="space-y-8">
        {/* Institution */}
        <div>
          <Label className="text-zinc-400">Institution (shows on all reports)</Label>
          <Input
            value={institution}
            onChange={(e) => setInstitution(e.target.value)}
            className="mt-1 bg-zinc-950 border-zinc-700"
          />
        </div>

        {/* Drag & Drop — works with Logiq e95 images right now */}
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          className="border-2 border-dashed border-emerald-500 rounded-2xl p-10 text-center hover:bg-zinc-950 transition"
        >
          {image ? (
            <p className="text-emerald-400 font-medium">✅ {image.name} ready for AI analysis</p>
          ) : (
            <>
              <Upload className="mx-auto w-12 h-12 text-emerald-400" />
              <p className="mt-4 font-medium">Drag &amp; drop ultrasound image or clip here</p>
              <p className="text-sm text-zinc-500">Works with GE Logiq e95, Vscan Air, or any machine (JPEG / PNG / DICOM)</p>
            </>
          )}
        </div>

        {/* Existing Tabs — unchanged */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-4 bg-zinc-950 border border-zinc-700">
            <TabsTrigger value="diastology">Diastology</TabsTrigger>
            <TabsTrigger value="as">Aortic Stenosis</TabsTrigger>
            <TabsTrigger value="mr">Mitral Regurgitation</TabsTrigger>
            <TabsTrigger value="rv">RV Function</TabsTrigger>
          </TabsList>

          {/* All your original tab content stays exactly the same */}
          <TabsContent value="diastology" className="space-y-6 pt-4"> ... (your original diastology tab) </TabsContent>
          <TabsContent value="as" className="space-y-6 pt-4"> ... (your original AS tab) </TabsContent>
          <TabsContent value="mr" className="space-y-6 pt-4"> ... (your original MR tab) </TabsContent>
          <TabsContent value="rv" className="space-y-6 pt-4"> ... (your original RV tab) </TabsContent>
        </Tabs>

        <Separator className="bg-zinc-700" />

        {/* AI Button */}
        <Button
          onClick={analyzeWithAI}
          disabled={loading || !image}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-lg py-6"
        >
          {loading ? "Analyzing with AI-Assisted Feedback..." : "Analyze Image with AI-Assisted Feedback"}
        </Button>

        {/* AI Results */}
        {feedback && (
          <div className="bg-zinc-950 border border-emerald-700 p-6 rounded-3xl">
            <h3 className="font-semibold text-emerald-400 mb-4">AI-Assisted Analysis &amp; Feedback</h3>
            <pre className="whitespace-pre-wrap text-zinc-200 text-sm">{feedback.feedback}</pre>

            <h4 className="font-semibold mt-8 mb-3">Calculated Values (ASE Guidelines)</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              {Object.entries(feedback.calculations || {}).map(([key, val]: any) => (
                <div key={key} className="bg-zinc-900 p-3 rounded-2xl">
                  <span className="capitalize">{key.replace(/_/g, " ")}:</span>{" "}
                  <span className="font-mono text-emerald-400">{val.value} {val.unit || ""}</span>
                </div>
              ))}
            </div>

            <Button
              onClick={() => window.open(feedback.navigator_url, "_blank")}
              className="mt-6 w-full border border-emerald-600 text-emerald-400 hover:bg-emerald-950"
            >
              <Send className="w-4 h-4 mr-2" />
              Send Report to Clinical Navigator
            </Button>
          </div>
        )}

        {/* Existing action buttons */}
        <div className="flex gap-3">
          <Button onClick={saveReport} className="flex-1 bg-emerald-600 hover:bg-emerald-700">
            <Save className="w-4 h-4 mr-2" />
            Save Report
          </Button>
          <Button onClick={resetAll} variant="outline" className="flex-1">
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset All
          </Button>
        </div>

        {/* Saved Reports — unchanged */}
        {savedReports.length > 0 && (
          <div className="mt-10">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Download className="w-5 h-5" />
              My Saved Reports ({savedReports.length})
            </h3>
            {/* ... your existing saved reports list ... */}
          </div>
        )}
      </CardContent>
    </Card>
  );
}