"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Calculator, RotateCcw, Download, Save, Trash2 } from "lucide-react";

type SavedReport = {
  id: string;
  date: string;
  tab: string;
  inputs: any;
  results: string;
};

export function EchoCalculator() {
  // Diastology
  const [eaRatio, setEaRatio] = useState(0.8);
  const [eSeptal, setESeptal] = useState(7);

  // AS
  const [lvotDiameter, setLvotDiameter] = useState(2.0);
  const [lvotVti, setLvotVti] = useState(20);
  const [aorticVti, setAorticVti] = useState(100);

  // MR
  const [pisaRadius, setPisaRadius] = useState(0.9);
  const [aliasingVelocity, setAliasingVelocity] = useState(40);
  const [mrPeakVelocity, setMrPeakVelocity] = useState(500);

  // RV
  const [tapse, setTapse] = useState(18);

  const [activeTab, setActiveTab] = useState("diastology");
  const [savedReports, setSavedReports] = useState<SavedReport[]>([]);

  // Load saved reports from browser storage
  useEffect(() => {
    const saved = localStorage.getItem("echoReports");
    if (saved) setSavedReports(JSON.parse(saved));
  }, []);

  // Save to localStorage whenever reports change
  useEffect(() => {
    localStorage.setItem("echoReports", JSON.stringify(savedReports));
  }, [savedReports]);

  const getDiastologyGrade = () => {
    if (eaRatio < 0.8) return { grade: "Grade I", color: "text-emerald-400", desc: "Impaired relaxation" };
    if (eaRatio > 2) return { grade: "Grade III", color: "text-red-400", desc: "Restrictive filling" };
    return { grade: "Grade II", color: "text-yellow-400", desc: "Pseudonormal" };
  };

  const ava = (Math.PI * Math.pow(lvotDiameter / 2, 2) * lvotVti) / aorticVti;
  const eroA = (2 * Math.PI * Math.pow(pisaRadius, 2) * aliasingVelocity) / mrPeakVelocity;
  const diastology = getDiastologyGrade();

  const saveReport = () => {
    const report: SavedReport = {
      id: Date.now().toString(),
      date: new Date().toLocaleString(),
      tab: activeTab,
      inputs: { eaRatio, eSeptal, lvotDiameter, lvotVti, aorticVti, pisaRadius, aliasingVelocity, mrPeakVelocity, tapse },
      results: activeTab === "diastology" ? diastology.grade : 
               activeTab === "as" ? `${ava.toFixed(2)} cm²` :
               activeTab === "mr" ? `${eroA.toFixed(2)} cm²` : 
               tapse >= 17 ? "Normal" : "Reduced",
    };
    setSavedReports([report, ...savedReports]);
    alert("✅ Report saved! Check 'My Saved Reports' below.");
  };

  const deleteReport = (id: string) => {
    setSavedReports(savedReports.filter(r => r.id !== id));
  };

  const resetAll = () => {
    setEaRatio(0.8); setESeptal(7);
    setLvotDiameter(2.0); setLvotVti(20); setAorticVti(100);
    setPisaRadius(0.9); setAliasingVelocity(40); setMrPeakVelocity(500);
    setTapse(18);
  };

  return (
    <Card className="border-zinc-700 bg-zinc-900">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-emerald-400">
          <Calculator className="w-6 h-6" />
          Echocardiography Calculator
        </CardTitle>
        <p className="text-xs text-zinc-500">Live calculations • Save reports • Educational only</p>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-4 bg-zinc-950 border border-zinc-700">
            <TabsTrigger value="diastology">Diastology</TabsTrigger>
            <TabsTrigger value="as">Aortic Stenosis</TabsTrigger>
            <TabsTrigger value="mr">Mitral Regurgitation</TabsTrigger>
            <TabsTrigger value="rv">RV Function</TabsTrigger>
          </TabsList>

          {/* Diastology Tab */}
          <TabsContent value="diastology" className="space-y-6 pt-4">
            <div className="grid grid-cols-2 gap-6">
              <div><Label>E/A ratio</Label><Input type="number" value={eaRatio} onChange={e => setEaRatio(Number(e.target.value))} className="mt-1" /></div>
              <div><Label>e&apos; septal (cm/s)</Label><Input type="number" value={eSeptal} onChange={e => setESeptal(Number(e.target.value))} className="mt-1" /></div>
            </div>
            <div className="bg-zinc-950 border border-zinc-700 p-4 rounded-2xl">
              <strong>2025 ASE Grade:</strong> <span className={diastology.color + " font-bold"}>{diastology.grade}</span>
              <p className="text-sm text-zinc-400">{diastology.desc}</p>
            </div>
          </TabsContent>

          {/* AS Tab */}
          <TabsContent value="as" className="space-y-6 pt-4">
            <div className="grid grid-cols-3 gap-4">
              <div><Label>LVOT diameter (cm)</Label><Input type="number" value={lvotDiameter} onChange={e => setLvotDiameter(Number(e.target.value))} className="mt-1" /></div>
              <div><Label>LVOT VTI (cm)</Label><Input type="number" value={lvotVti} onChange={e => setLvotVti(Number(e.target.value))} className="mt-1" /></div>
              <div><Label>Aortic VTI (cm)</Label><Input type="number" value={aorticVti} onChange={e => setAorticVti(Number(e.target.value))} className="mt-1" /></div>
            </div>
            <div className="bg-emerald-950 border border-emerald-700 p-4 rounded-2xl text-center">
              <div className="text-3xl font-bold text-emerald-400">{ava.toFixed(2)} cm²</div>
              <div className="text-sm text-zinc-400">Aortic Valve Area (AVA)</div>
            </div>
          </TabsContent>

          {/* MR Tab */}
          <TabsContent value="mr" className="space-y-6 pt-4">
            <div className="grid grid-cols-3 gap-4">
              <div><Label>PISA radius (cm)</Label><Input type="number" value={pisaRadius} onChange={e => setPisaRadius(Number(e.target.value))} className="mt-1" /></div>
              <div><Label>Aliasing vel (cm/s)</Label><Input type="number" value={aliasingVelocity} onChange={e => setAliasingVelocity(Number(e.target.value))} className="mt-1" /></div>
              <div><Label>MR peak vel (cm/s)</Label><Input type="number" value={mrPeakVelocity} onChange={e => setMrPeakVelocity(Number(e.target.value))} className="mt-1" /></div>
            </div>
            <div className="bg-emerald-950 border border-emerald-700 p-4 rounded-2xl text-center">
              <div className="text-3xl font-bold text-emerald-400">{eroA.toFixed(2)} cm²</div>
              <div className="text-sm text-zinc-400">PISA EROA</div>
            </div>
          </TabsContent>

          {/* RV Tab */}
          <TabsContent value="rv" className="space-y-6 pt-4">
            <div><Label>TAPSE (mm)</Label><Input type="number" value={tapse} onChange={e => setTapse(Number(e.target.value))} className="mt-1" /></div>
            <div className="bg-zinc-950 border border-zinc-700 p-4 rounded-2xl">
              <strong>RV Function:</strong> {tapse >= 17 ? <span className="text-emerald-400 font-bold">Normal</span> : <span className="text-yellow-400 font-bold">Reduced</span>}
            </div>
          </TabsContent>
        </Tabs>

        <Separator className="my-8 bg-zinc-700" />

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

        {/* Saved Reports Section */}
        {savedReports.length > 0 && (
          <div className="mt-10">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Download className="w-5 h-5" />
              My Saved Reports ({savedReports.length})
            </h3>
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {savedReports.map(report => (
                <div key={report.id} className="flex items-center justify-between bg-zinc-950 border border-zinc-700 p-4 rounded-2xl">
                  <div>
                    <div className="text-xs text-zinc-500">{report.date}</div>
                    <div className="font-medium">{report.tab.toUpperCase()} • {report.results}</div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => deleteReport(report.id)}>
                    <Trash2 className="w-4 h-4 text-red-400" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}