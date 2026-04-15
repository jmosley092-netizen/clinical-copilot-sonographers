"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calculator } from "lucide-react";

export default function EchoFreeCalculator() {
  const [inputs, setInputs] = useState({
    gender: "", heightCm: "", heightIn: "", weightKg: "", weightLb: "", hr: "",
    ivsd: "", ivss: "", lvidd: "", lvids: "", lvpwd: "", lvpws: "", edv: "", esv: "",
    E: "", A: "", es: "", el: "", lavi: "", ivrt: "", sd: "", lars: "",
    vmax: "", mg: "", lvotd: "", lvotvti: "", avvti: "", plan: "",
    pht: "", mgrad: "", mvplan: "",
    trv: "", rap: "", rvotat: "",
    tapse: "", pr: "",
    // LFLG AS
    baselineAVA: "", baselineMG: "", baselineSVi: "", baselineLVEF: "",
    dseAVA: "", dseMG: "", dseVmax: "", deltaSVPercent: "",
    // Abbott MitraClip MR
    vcWidth: "", eroA: "", regurgVol: "", regurgFraction: "", jetAreaLA: "",
    pisaRadius: "", aliasingVel: "", mrVTI: "", mvaPlanimetry: "", meanPGForward: "",
    mvMorphology: "", jetOrigin: "", pvFlowReversal: ""
  });

  const [results, setResults] = useState({
    patient: "", lv: "", dia: "", av: "", ms: "", phtn1: "", phtn2: "", hemo: "", lflg: "", mr: ""
  });

  // === FIXED BIDIRECTIONAL UNIT CONVERSION ===
  const updateHeightCm = (value: string) => {
    setInputs(prev => ({
      ...prev,
      heightCm: value,
      heightIn: value ? (parseFloat(value) / 2.54).toFixed(1) : ""
    }));
  };

  const updateHeightIn = (value: string) => {
    setInputs(prev => ({
      ...prev,
      heightIn: value,
      heightCm: value ? (parseFloat(value) * 2.54).toFixed(1) : ""
    }));
  };

  const updateWeightKg = (value: string) => {
    setInputs(prev => ({
      ...prev,
      weightKg: value,
      weightLb: value ? (parseFloat(value) * 2.20462).toFixed(1) : ""
    }));
  };

  const updateWeightLb = (value: string) => {
    setInputs(prev => ({
      ...prev,
      weightLb: value,
      weightKg: value ? (parseFloat(value) / 2.20462).toFixed(1) : ""
    }));
  };

  const update = (key: string, value: string) => {
    setInputs(prev => ({ ...prev, [key]: value }));
  };

  const resetCard = (fields: string[]) => {
    const newInputs = { ...inputs };
    fields.forEach(f => { newInputs[f as keyof typeof inputs] = ""; });
    setInputs(newInputs);
  };

  const v = (key: string) => {
    const val = inputs[key as keyof typeof inputs];
    return val ? parseFloat(val) : null;
  };

  const calculateBSA = (cm: number | null, kg: number | null) => {
    if (!cm || !kg) return null;
    return Math.sqrt((cm * kg) / 3600);
  };

  const calculateAll = () => {
    const bsa = calculateBSA(v('heightCm'), v('weightKg'));
    const gender = inputs.gender;

    // Patient
    const patientOut = bsa ? `BSA: ${bsa.toFixed(2)} m²` : '';

    // LV Geometry & Function
    const ivsd = v('ivsd'), lvidd = v('lvidd'), lvids = v('lvids'), lvpwd = v('lvpwd');
    const edv = v('edv'), esv = v('esv');
    let ef = null, fs = null, rwt = null, mass = null, lvmi = null;
    let geometry = '', severity = '';
    if (lvidd) {
      ef = edv && esv ? ((edv - esv) / edv) * 100 : null;
      fs = lvids ? ((lvidd - lvids) / lvidd) * 100 : null;
      rwt = lvpwd ? (2 * lvpwd) / lvidd : null;
      mass = ivsd && lvpwd ? 0.8 * 1.04 * Math.pow((ivsd + lvidd + lvpwd), 3) - Math.pow(lvidd, 3) + 0.6 : null;
      lvmi = mass && bsa ? mass / bsa : null;
      const normal = gender === 'female' ? 95 : 115;
      if (lvmi && rwt !== null) {
        geometry = lvmi < normal ? (rwt > 0.42 ? 'Concentric Remodeling' : 'Normal Geometry') : (rwt > 0.42 ? 'Concentric Hypertrophy' : 'Eccentric Hypertrophy');
        severity = gender === 'male' ? (lvmi < 116 ? 'Normal' : lvmi < 131 ? 'Mild LVH' : lvmi < 148 ? 'Moderate LVH' : 'Severe LVH') : (lvmi < 96 ? 'Normal' : lvmi < 109 ? 'Mild LVH' : lvmi < 122 ? 'Moderate LVH' : 'Severe LVH');
      }
    }
    const lvOut = `EF: ${ef?.toFixed(1) || '-'} %<br>FS: ${fs?.toFixed(1) || '-'} %<br>RWT: ${rwt?.toFixed(2) || '-'}<br>LVMI: ${lvmi?.toFixed(1) || '-'} g/m²<br><b>${geometry}</b><br><b>${severity}</b>`;

    // Diastology
    const E = v('E'), A = v('A'), es = v('es'), el = v('el'), lavi = v('lavi');
    let diaOut = '';
    if (E && A && es && el) {
      const eavg = (es + el) / 2;
      const ratio = E / A;
      const grade = ratio < 0.8 ? 'Grade I' : ratio <= 2 ? 'Grade II' : 'Grade III';
      const laSize = lavi && lavi < 34 ? 'Normal' : lavi && lavi < 42 ? 'Mild' : lavi && lavi < 48 ? 'Moderate' : 'Severe';
      const lap = grade === 'Grade I' ? 'Normal LAP' : grade === 'Grade II' ? 'Mildly to moderately elevated LAP' : 'Markedly elevated LAP';
      diaOut = `${grade}<br>LA Size: ${laSize}<br>LA Pressure: ${lap}<br><br>E/A: ${ratio.toFixed(2)}<br>E/e' septal: ${(E/es).toFixed(1)}<br>E/e' lateral: ${(E/el).toFixed(1)}<br>E/e' avg: ${(E/eavg).toFixed(1)}`;
    }

    // Aortic Stenosis
    const vmax = v('vmax'), mg = v('mg'), lvotd = v('lvotd'), lvotvti = v('lvotvti'), avvti = v('avvti');
    let avOut = '';
    if (vmax || mg) {
      const ava = lvotd && lvotvti && avvti ? (3.14 * Math.pow(lvotd / 2, 2) * lvotvti) / avvti : null;
      const di = lvotvti && avvti ? lvotvti / avvti : null;
      const v_sev = vmax && vmax >= 4 ? 'Severe' : vmax && vmax >= 3 ? 'Moderate' : 'Mild';
      const g_sev = mg && mg >= 40 ? 'Severe' : mg && mg >= 20 ? 'Moderate' : 'Mild';
      const a_sev = ava && ava <= 1 ? 'Severe' : ava && ava <= 1.5 ? 'Moderate' : 'Mild';
      const di_sev = di && di < 0.25 ? 'Severe' : di && di < 0.5 ? 'Moderate' : 'Mild';
      let scores = { mild: 0, moderate: 0, severe: 0 };
      if (vmax) { if (vmax >= 4) scores.severe++; else if (vmax >= 3) scores.moderate++; else scores.mild++; }
      if (mg) { if (mg >= 40) scores.severe++; else if (mg >= 20) scores.moderate++; else scores.mild++; }
      if (ava) { if (ava <= 1) scores.severe++; else if (ava <= 1.5) scores.moderate++; else scores.mild++; }
      if (di) { if (di < 0.25) scores.severe++; else if (di < 0.5) scores.moderate++; else scores.mild++; }
      let final = 'Indeterminate';
      if (scores.severe >= 2) final = 'Severe AS';
      else if (scores.moderate >= 2) final = 'Moderate AS';
      else if (scores.mild >= 2) final = 'Mild AS';
      avOut = `Vmax: ${vmax?.toFixed(2) || '-'} m/s (${v_sev})<br>Mean Gradient: ${mg?.toFixed(1) || '-'} mmHg (${g_sev})<br>AVA: ${ava?.toFixed(2) || '-'} cm² (${a_sev})<br>DVI: ${di?.toFixed(2) || '-'} (${di_sev})<br><b>Final Severity: ${final}</b>`;
    }

    // Hemodynamics
    const lvotd_h = v('lvotd'), lvotvti_h = v('lvotvti'), hr = v('hr');
    let hemoOut = '';
    if (lvotd_h && lvotvti_h) {
      const sv = 3.14 * Math.pow(lvotd_h / 2, 2) * lvotvti_h;
      const svi = bsa ? sv / bsa : null;
      const co = hr ? (sv * hr) / 1000 : null;
      hemoOut = `SV: ${sv.toFixed(1)} mL<br>SVI: ${svi?.toFixed(1) || '-'} mL/m²<br>CO: ${co?.toFixed(2) || '-'} L/min`;
    }

    // Mitral Stenosis
    const pht = v('pht'), mgrad = v('mgrad'), mvplan = v('mvplan');
    let msOut = '';
    if (pht || mgrad || mvplan) {
      const mva = pht ? 220 / pht : mvplan || 0;
      let sev = 'Mild';
      if (mva <= 1.0 || (mgrad && mgrad > 10)) sev = 'Severe';
      else if (mva < 1.5 || (mgrad && mgrad >= 5)) sev = 'Moderate';
      msOut = `MVA: ${mva.toFixed(2)} cm²<br><b>${sev} MS</b>`;
    }

    // PHTN Pressures
    const trv = v('trv'), rap = v('rap'), at = v('rvotat');
    let phtn1Out = '';
    if (trv || at) {
      const rvsp = trv && rap ? 4 * Math.pow(trv, 2) + rap : null;
      const mpap = at ? 79 - 0.45 * at : null;
      let sev = '';
      if (rvsp) sev = rvsp < 35 ? 'Normal' : rvsp < 45 ? 'Mild PH' : rvsp < 60 ? 'Moderate PH' : 'Severe PH';
      else if (mpap) sev = mpap < 20 ? 'Normal' : mpap < 25 ? 'Borderline' : mpap < 35 ? 'Mild PH' : mpap < 45 ? 'Moderate PH' : 'Severe PH';
      phtn1Out = `RVSP: ${rvsp?.toFixed(1) || '-'} mmHg<br>mPAP: ${mpap?.toFixed(1) || '-'} mmHg<br><b>${sev}</b>`;
    }

    // PHTN Confidence
    let score = 0;
    if (trv && trv >= 2.8) score++;
    if (v('tapse') && v('tapse')! < 1.7) score++;
    if (v('pr') && v('pr')! > 2.2) score++;
    const conf = score >= 2 ? 'High probability PH' : score === 1 ? 'Intermediate' : 'Low';
    const phtn2Out = `Score: ${score}/3<br><b>${conf}</b>`;

    // LFLG AS (reworked with contractile reserve)
    const baselineAVA = v('baselineAVA'), baselineMG = v('baselineMG'), baselineSVi = v('baselineSVi'), baselineLVEF = v('baselineLVEF');
    const dseAVA = v('dseAVA'), dseMG = v('dseMG'), dseVmax = v('dseVmax'), deltaSVPercent = v('deltaSVPercent');
    let lflgOut = '';
    if (baselineAVA && baselineMG && baselineSVi !== null && baselineLVEF !== null) {
      const isLowFlow = baselineSVi <= 35;
      const isLowGradient = baselineMG < 40;
      const isSevereAVA = baselineAVA <= 1.0;
      const isReducedEF = baselineLVEF < 50;
      if (isLowFlow && isLowGradient && isSevereAVA) {
        const type = isReducedEF ? "Classical LFLG AS" : "Paradoxical LFLG AS";
        let contractileReserve = "Unknown";
        let classification = "Indeterminate";
        if (deltaSVPercent !== null) contractileReserve = deltaSVPercent >= 20 ? "Present (≥20% ↑ SV)" : "Absent (<20% ↑ SV)";
        if (dseAVA !== null && dseMG !== null && dseVmax !== null) {
          if (dseAVA <= 1.0 && (dseMG >= 40 || dseVmax >= 4)) classification = "True Severe AS";
          else if (dseAVA > 1.0) classification = "Pseudo-Severe AS";
        }
        lflgOut = `<b>${type}</b><br>Contractile Reserve: <b>${contractileReserve}</b><br>DSE Classification: <b>${classification}</b><br><br>Baseline: AVA ${baselineAVA} cm² | MG ${baselineMG} mmHg | SVi ${baselineSVi} mL/m² | LVEF ${baselineLVEF} %<br>DSE: AVA ${dseAVA || '-'} cm² | MG ${dseMG || '-'} mmHg | Vmax ${dseVmax || '-'} m/s`;
      }
    }

    // Abbott MitraClip Mitral Regurgitation
    const vcWidth = v('vcWidth'), eroA = v('eroA'), regurgVol = v('regurgVol'), regurgFraction = v('regurgFraction'), jetAreaLA = v('jetAreaLA');
    const pisaRadius = v('pisaRadius'), aliasingVel = v('aliasingVel'), mrVTI = v('mrVTI'), mvaPlanimetry = v('mvaPlanimetry'), meanPGForward = v('meanPGForward');
    let mrOut = '';
    let calculatedEROA = null;
    if (pisaRadius && aliasingVel && mrVTI) {
      calculatedEROA = (2 * Math.PI * Math.pow(pisaRadius, 2) * aliasingVel) / mrVTI;
    }
    const finalEROA = eroA || calculatedEROA;
    if (finalEROA || vcWidth || regurgVol || regurgFraction) {
      let severity = 'Mild';
      if (finalEROA && finalEROA >= 0.4 || regurgVol && regurgVol >= 60 || regurgFraction && regurgFraction >= 50) severity = 'Severe';
      else if (finalEROA && finalEROA >= 0.2 || regurgVol && regurgVol >= 30 || regurgFraction && regurgFraction >= 30) severity = 'Moderate';
      mrOut = `<b>Mitral Regurgitation (Abbott MitraClip Screening)</b><br><br>Vena Contracta: ${vcWidth?.toFixed(2) || '-'} cm<br>EROA: ${finalEROA ? finalEROA.toFixed(2) : '-'} cm² ${calculatedEROA ? '(PISA calc)' : ''}<br>Regurgitant Volume: ${regurgVol?.toFixed(1) || '-'} mL<br>Regurgitant Fraction: ${regurgFraction?.toFixed(1) || '-'} %<br>Jet Area / LA Area: ${jetAreaLA?.toFixed(1) || '-'} %<br>Forward Mean PG: ${meanPGForward?.toFixed(1) || '-'} mmHg<br>MVA Planimetry: ${mvaPlanimetry?.toFixed(2) || '-'} cm²<br><b>${severity} MR</b>`;
    }

    setResults({ patient: patientOut, lv: lvOut, dia: diaOut, av: avOut, ms: msOut, phtn1: phtn1Out, phtn2: phtn2Out, hemo: hemoOut, lflg: lflgOut, mr: mrOut });
  };

  useEffect(() => { calculateAll(); }, [inputs]);

  return (
    <Card className="border-zinc-700 bg-zinc-900">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-emerald-400">
          <Calculator className="w-6 h-6" />
          Echo Calculator
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 p-6">
          {/* Patient Card - fixed conversion */}
          <div className="bg-[#111827] border-2 border-cyan-400 rounded-3xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-cyan-300 text-xl">Patient</h3>
              <button onClick={() => resetCard(['gender','heightCm','heightIn','weightKg','weightLb','hr'])} className="px-4 py-1 text-xs bg-blue-600 hover:bg-blue-700 rounded-xl">Reset</button>
            </div>
            <div className="space-y-4">
              <select value={inputs.gender} onChange={e => update('gender', e.target.value)} className="w-full bg-zinc-900 border border-zinc-700 rounded-xl p-3 text-white">
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
              <div className="grid grid-cols-2 gap-3">
                <div><div className="text-xs text-cyan-400 mb-1">Height (cm)</div><input type="number" inputMode="decimal" value={inputs.heightCm} onChange={e => updateHeightCm(e.target.value)} className="w-full bg-zinc-900 border border-zinc-700 rounded-xl p-3" /></div>
                <div><div className="text-xs text-cyan-400 mb-1">Height (in)</div><input type="number" inputMode="decimal" value={inputs.heightIn} onChange={e => updateHeightIn(e.target.value)} className="w-full bg-zinc-900 border border-zinc-700 rounded-xl p-3" /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><div className="text-xs text-cyan-400 mb-1">Weight (kg)</div><input type="number" inputMode="decimal" value={inputs.weightKg} onChange={e => updateWeightKg(e.target.value)} className="w-full bg-zinc-900 border border-zinc-700 rounded-xl p-3" /></div>
                <div><div className="text-xs text-cyan-400 mb-1">Weight (lb)</div><input type="number" inputMode="decimal" value={inputs.weightLb} onChange={e => updateWeightLb(e.target.value)} className="w-full bg-zinc-900 border border-zinc-700 rounded-xl p-3" /></div>
              </div>
              <div><div className="text-xs text-cyan-400 mb-1">Heart Rate (bpm)</div><input type="number" inputMode="decimal" value={inputs.hr} onChange={e => update('hr', e.target.value)} className="w-full bg-zinc-900 border border-zinc-700 rounded-xl p-3" /></div>
              {results.patient && <div className="bg-green-900/30 border border-green-400 p-4 rounded-2xl text-center font-semibold text-green-400">{results.patient}</div>}
            </div>
          </div>

          {/* LV Geometry & Function */}
          <div className="bg-[#111827] border-2 border-cyan-400 rounded-3xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-cyan-300 text-xl">LV Geometry &amp; Function</h3>
              <button onClick={() => resetCard(['ivsd','ivss','lvidd','lvids','lvpwd','lvpws','edv','esv'])} className="px-4 py-1 text-xs bg-blue-600 hover:bg-blue-700 rounded-xl">Reset</button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><div className="text-xs text-cyan-400 mb-1">IVSd (cm)</div><input type="number" step="0.1" inputMode="decimal" value={inputs.ivsd} onChange={e => update('ivsd', e.target.value)} className="w-full bg-zinc-900 border border-zinc-700 rounded-xl p-3" /></div>
              <div><div className="text-xs text-cyan-400 mb-1">IVSs (cm)</div><input type="number" step="0.1" inputMode="decimal" value={inputs.ivss} onChange={e => update('ivss', e.target.value)} className="w-full bg-zinc-900 border border-zinc-700 rounded-xl p-3" /></div>
              <div><div className="text-xs text-cyan-400 mb-1">LVIDd (cm)</div><input type="number" step="0.1" inputMode="decimal" value={inputs.lvidd} onChange={e => update('lvidd', e.target.value)} className="w-full bg-zinc-900 border border-zinc-700 rounded-xl p-3" /></div>
              <div><div className="text-xs text-cyan-400 mb-1">LVIDs (cm)</div><input type="number" step="0.1" inputMode="decimal" value={inputs.lvids} onChange={e => update('lvids', e.target.value)} className="w-full bg-zinc-900 border border-zinc-700 rounded-xl p-3" /></div>
              <div><div className="text-xs text-cyan-400 mb-1">LVPWd (cm)</div><input type="number" step="0.1" inputMode="decimal" value={inputs.lvpwd} onChange={e => update('lvpwd', e.target.value)} className="w-full bg-zinc-900 border border-zinc-700 rounded-xl p-3" /></div>
              <div><div className="text-xs text-cyan-400 mb-1">LVPWs (cm)</div><input type="number" step="0.1" inputMode="decimal" value={inputs.lvpws} onChange={e => update('lvpws', e.target.value)} className="w-full bg-zinc-900 border border-zinc-700 rounded-xl p-3" /></div>
              <div><div className="text-xs text-cyan-400 mb-1">EDV (mL)</div><input type="number" inputMode="decimal" value={inputs.edv} onChange={e => update('edv', e.target.value)} className="w-full bg-zinc-900 border border-zinc-700 rounded-xl p-3" /></div>
              <div><div className="text-xs text-cyan-400 mb-1">ESV (mL)</div><input type="number" inputMode="decimal" value={inputs.esv} onChange={e => update('esv', e.target.value)} className="w-full bg-zinc-900 border border-zinc-700 rounded-xl p-3" /></div>
            </div>
            {results.lv && <div className="mt-6 bg-green-900/30 border border-green-400 p-5 rounded-2xl text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: results.lv }} />}
          </div>

          {/* Diastology */}
          <div className="bg-[#111827] border-2 border-cyan-400 rounded-3xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-cyan-300 text-xl">Diastology</h3>
              <button onClick={() => resetCard(['E','A','es','el','lavi','ivrt','sd','lars'])} className="px-4 py-1 text-xs bg-blue-600 hover:bg-blue-700 rounded-xl">Reset</button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><div className="text-xs text-cyan-400 mb-1">E (cm/s)</div><input type="number" inputMode="decimal" value={inputs.E} onChange={e => update('E', e.target.value)} className="w-full bg-zinc-900 border border-zinc-700 rounded-xl p-3" /></div>
              <div><div className="text-xs text-cyan-400 mb-1">A (cm/s)</div><input type="number" inputMode="decimal" value={inputs.A} onChange={e => update('A', e.target.value)} className="w-full bg-zinc-900 border border-zinc-700 rounded-xl p-3" /></div>
              <div><div className="text-xs text-cyan-400 mb-1">e' septal (cm/s)</div><input type="number" inputMode="decimal" value={inputs.es} onChange={e => update('es', e.target.value)} className="w-full bg-zinc-900 border border-zinc-700 rounded-xl p-3" /></div>
              <div><div className="text-xs text-cyan-400 mb-1">e' lateral (cm/s)</div><input type="number" inputMode="decimal" value={inputs.el} onChange={e => update('el', e.target.value)} className="w-full bg-zinc-900 border border-zinc-700 rounded-xl p-3" /></div>
              <div><div className="text-xs text-cyan-400 mb-1">Left Atrial Volume Index (mL/m²)</div><input type="number" inputMode="decimal" value={inputs.lavi} onChange={e => update('lavi', e.target.value)} className="w-full bg-zinc-900 border border-zinc-700 rounded-xl p-3" /></div>
              <div><div className="text-xs text-cyan-400 mb-1">Isovolumic Relaxation Time (ms)</div><input type="number" inputMode="decimal" value={inputs.ivrt} onChange={e => update('ivrt', e.target.value)} className="w-full bg-zinc-900 border border-zinc-700 rounded-xl p-3" /></div>
              <div><div className="text-xs text-cyan-400 mb-1">S/D</div><input type="number" inputMode="decimal" value={inputs.sd} onChange={e => update('sd', e.target.value)} className="w-full bg-zinc-900 border border-zinc-700 rounded-xl p-3" /></div>
              <div><div className="text-xs text-cyan-400 mb-1">Left Atrial Reservoir Strain (%)</div><input type="number" inputMode="decimal" value={inputs.lars} onChange={e => update('lars', e.target.value)} className="w-full bg-zinc-900 border border-zinc-700 rounded-xl p-3" /></div>
            </div>
            {results.dia && <div className="mt-6 bg-green-900/30 border border-green-400 p-5 rounded-2xl text-sm" dangerouslySetInnerHTML={{ __html: results.dia }} />}
          </div>

          {/* Aortic Stenosis */}
          <div className="bg-[#111827] border-2 border-cyan-400 rounded-3xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-cyan-300 text-xl">Aortic Stenosis</h3>
              <button onClick={() => resetCard(['vmax','mg','lvotd','lvotvti','avvti','plan'])} className="px-4 py-1 text-xs bg-blue-600 hover:bg-blue-700 rounded-xl">Reset</button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><div className="text-xs text-cyan-400 mb-1">Vmax (m/s)</div><input type="number" step="0.1" inputMode="decimal" value={inputs.vmax} onChange={e => update('vmax', e.target.value)} className="w-full bg-zinc-900 border border-zinc-700 rounded-xl p-3" /></div>
              <div><div className="text-xs text-cyan-400 mb-1">Mean Grad (mmHg)</div><input type="number" step="0.1" inputMode="decimal" value={inputs.mg} onChange={e => update('mg', e.target.value)} className="w-full bg-zinc-900 border border-zinc-700 rounded-xl p-3" /></div>
              <div><div className="text-xs text-cyan-400 mb-1">LVOT (cm)</div><input type="number" step="0.1" inputMode="decimal" value={inputs.lvotd} onChange={e => update('lvotd', e.target.value)} className="w-full bg-zinc-900 border border-zinc-700 rounded-xl p-3" /></div>
              <div><div className="text-xs text-cyan-400 mb-1">LVOT VTI (cm)</div><input type="number" step="0.1" inputMode="decimal" value={inputs.lvotvti} onChange={e => update('lvotvti', e.target.value)} className="w-full bg-zinc-900 border border-zinc-700 rounded-xl p-3" /></div>
              <div><div className="text-xs text-cyan-400 mb-1">AV VTI (cm)</div><input type="number" step="0.1" inputMode="decimal" value={inputs.avvti} onChange={e => update('avvti', e.target.value)} className="w-full bg-zinc-900 border border-zinc-700 rounded-xl p-3" /></div>
              <div><div className="text-xs text-cyan-400 mb-1">Planimetry (cm²)</div><input type="number" step="0.1" inputMode="decimal" value={inputs.plan} onChange={e => update('plan', e.target.value)} className="w-full bg-zinc-900 border border-zinc-700 rounded-xl p-3" /></div>
            </div>
            {results.av && <div className="mt-6 bg-green-900/30 border border-green-400 p-5 rounded-2xl text-sm" dangerouslySetInnerHTML={{ __html: results.av }} />}
          </div>

          {/* Hemodynamics */}
          <div className="bg-[#111827] border-2 border-cyan-400 rounded-3xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-cyan-300 text-xl">Hemodynamics</h3>
              <button onClick={() => resetCard(['lvotd','lvotvti'])} className="px-4 py-1 text-xs bg-blue-600 hover:bg-blue-700 rounded-xl">Reset</button>
            </div>
            <div className="grid grid-cols-1 gap-4">
              <div><div className="text-xs text-cyan-400 mb-1">LVOT (cm)</div><input type="number" step="0.1" inputMode="decimal" value={inputs.lvotd} onChange={e => update('lvotd', e.target.value)} className="w-full bg-zinc-900 border border-zinc-700 rounded-xl p-3" /></div>
              <div><div className="text-xs text-cyan-400 mb-1">LVOT VTI (cm)</div><input type="number" step="0.1" inputMode="decimal" value={inputs.lvotvti} onChange={e => update('lvotvti', e.target.value)} className="w-full bg-zinc-900 border border-zinc-700 rounded-xl p-3" /></div>
            </div>
            {results.hemo && <div className="mt-6 bg-green-900/30 border border-green-400 p-5 rounded-2xl text-sm" dangerouslySetInnerHTML={{ __html: results.hemo }} />}
          </div>

          {/* LFLG AS */}
          <div className="bg-[#111827] border-2 border-cyan-400 rounded-3xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-cyan-300 text-xl">Low-Flow Low-Gradient AS</h3>
              <button onClick={() => resetCard(['baselineAVA','baselineMG','baselineSVi','baselineLVEF','dseAVA','dseMG','dseVmax','deltaSVPercent'])} className="px-4 py-1 text-xs bg-blue-600 hover:bg-blue-700 rounded-xl">Reset</button>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><div className="text-xs text-cyan-400 mb-1">Baseline AVA (cm²)</div><input type="number" step="0.1" inputMode="decimal" value={inputs.baselineAVA} onChange={e => update('baselineAVA', e.target.value)} className="w-full bg-zinc-900 border border-zinc-700 rounded-xl p-3" /></div>
              <div><div className="text-xs text-cyan-400 mb-1">Baseline MG (mmHg)</div><input type="number" step="0.1" inputMode="decimal" value={inputs.baselineMG} onChange={e => update('baselineMG', e.target.value)} className="w-full bg-zinc-900 border border-zinc-700 rounded-xl p-3" /></div>
              <div><div className="text-xs text-cyan-400 mb-1">Baseline SVi (mL/m²)</div><input type="number" step="0.1" inputMode="decimal" value={inputs.baselineSVi} onChange={e => update('baselineSVi', e.target.value)} className="w-full bg-zinc-900 border border-zinc-700 rounded-xl p-3" /></div>
              <div><div className="text-xs text-cyan-400 mb-1">Baseline LVEF (%)</div><input type="number" inputMode="decimal" value={inputs.baselineLVEF} onChange={e => update('baselineLVEF', e.target.value)} className="w-full bg-zinc-900 border border-zinc-700 rounded-xl p-3" /></div>
              <div><div className="text-xs text-cyan-400 mb-1">DSE AVA (cm²)</div><input type="number" step="0.1" inputMode="decimal" value={inputs.dseAVA} onChange={e => update('dseAVA', e.target.value)} className="w-full bg-zinc-900 border border-zinc-700 rounded-xl p-3" /></div>
              <div><div className="text-xs text-cyan-400 mb-1">DSE MG (mmHg)</div><input type="number" step="0.1" inputMode="decimal" value={inputs.dseMG} onChange={e => update('dseMG', e.target.value)} className="w-full bg-zinc-900 border border-zinc-700 rounded-xl p-3" /></div>
              <div><div className="text-xs text-cyan-400 mb-1">DSE Vmax (m/s)</div><input type="number" step="0.1" inputMode="decimal" value={inputs.dseVmax} onChange={e => update('dseVmax', e.target.value)} className="w-full bg-zinc-900 border border-zinc-700 rounded-xl p-3" /></div>
              <div><div className="text-xs text-cyan-400 mb-1">ΔSV (% increase)</div><input type="number" step="0.1" inputMode="decimal" value={inputs.deltaSVPercent} onChange={e => update('deltaSVPercent', e.target.value)} className="w-full bg-zinc-900 border border-zinc-700 rounded-xl p-3" /></div>
            </div>
            {results.lflg && <div className="mt-6 bg-green-900/30 border border-green-400 p-5 rounded-2xl text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: results.lflg }} />}
          </div>

          {/* Mitral Stenosis */}
          <div className="bg-[#111827] border-2 border-cyan-400 rounded-3xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-cyan-300 text-xl">Mitral Stenosis</h3>
              <button onClick={() => resetCard(['pht','mgrad','mvplan'])} className="px-4 py-1 text-xs bg-blue-600 hover:bg-blue-700 rounded-xl">Reset</button>
            </div>
            <div className="grid grid-cols-1 gap-4">
              <div><div className="text-xs text-cyan-400 mb-1">PHT (ms)</div><input type="number" inputMode="decimal" value={inputs.pht} onChange={e => update('pht', e.target.value)} className="w-full bg-zinc-900 border border-zinc-700 rounded-xl p-3" /></div>
              <div><div className="text-xs text-cyan-400 mb-1">Mean Grad (mmHg)</div><input type="number" inputMode="decimal" value={inputs.mgrad} onChange={e => update('mgrad', e.target.value)} className="w-full bg-zinc-900 border border-zinc-700 rounded-xl p-3" /></div>
              <div><div className="text-xs text-cyan-400 mb-1">Planimetry (cm²)</div><input type="number" step="0.1" inputMode="decimal" value={inputs.mvplan} onChange={e => update('mvplan', e.target.value)} className="w-full bg-zinc-900 border border-zinc-700 rounded-xl p-3" /></div>
            </div>
            {results.ms && <div className="mt-6 bg-green-900/30 border border-green-400 p-5 rounded-2xl text-sm" dangerouslySetInnerHTML={{ __html: results.ms }} />}
          </div>

          {/* PHTN Pressures */}
          <div className="bg-[#111827] border-2 border-cyan-400 rounded-3xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-cyan-300 text-xl">PHTN (Pressures)</h3>
              <button onClick={() => resetCard(['trv','rap','rvotat'])} className="px-4 py-1 text-xs bg-blue-600 hover:bg-blue-700 rounded-xl">Reset</button>
            </div>
            <div className="grid grid-cols-1 gap-4">
              <div><div className="text-xs text-cyan-400 mb-1">TR Vmax (m/s)</div><input type="number" step="0.1" inputMode="decimal" value={inputs.trv} onChange={e => update('trv', e.target.value)} className="w-full bg-zinc-900 border border-zinc-700 rounded-xl p-3" /></div>
              <div><div className="text-xs text-cyan-400 mb-1">RAP (mmHg)</div><input type="number" inputMode="decimal" value={inputs.rap} onChange={e => update('rap', e.target.value)} className="w-full bg-zinc-900 border border-zinc-700 rounded-xl p-3" /></div>
              <div><div className="text-xs text-cyan-400 mb-1">RVOT AT (ms)</div><input type="number" inputMode="decimal" value={inputs.rvotat} onChange={e => update('rvotat', e.target.value)} className="w-full bg-zinc-900 border border-zinc-700 rounded-xl p-3" /></div>
            </div>
            {results.phtn1 && <div className="mt-6 bg-green-900/30 border border-green-400 p-5 rounded-2xl text-sm" dangerouslySetInnerHTML={{ __html: results.phtn1 }} />}
          </div>

          {/* PHTN Confidence */}
          <div className="bg-[#111827] border-2 border-cyan-400 rounded-3xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-cyan-300 text-xl">PHTN (Confidence)</h3>
              <button onClick={() => resetCard(['tapse','pr'])} className="px-4 py-1 text-xs bg-blue-600 hover:bg-blue-700 rounded-xl">Reset</button>
            </div>
            <div className="grid grid-cols-1 gap-4">
              <div><div className="text-xs text-cyan-400 mb-1">TAPSE (cm)</div><input type="number" step="0.1" inputMode="decimal" value={inputs.tapse} onChange={e => update('tapse', e.target.value)} className="w-full bg-zinc-900 border border-zinc-700 rounded-xl p-3" /></div>
              <div><div className="text-xs text-cyan-400 mb-1">PR EDV (m/s)</div><input type="number" step="0.1" inputMode="decimal" value={inputs.pr} onChange={e => update('pr', e.target.value)} className="w-full bg-zinc-900 border border-zinc-700 rounded-xl p-3" /></div>
            </div>
            {results.phtn2 && <div className="mt-6 bg-green-900/30 border border-green-400 p-5 rounded-2xl text-sm" dangerouslySetInnerHTML={{ __html: results.phtn2 }} />}
          </div>

          {/* Abbott MitraClip Mitral Regurgitation */}
          <div className="bg-[#111827] border-2 border-cyan-400 rounded-3xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-cyan-300 text-xl">Mitral Regurgitation (Abbott MitraClip Screening)</h3>
              <button onClick={() => resetCard(['vcWidth','eroA','regurgVol','regurgFraction','jetAreaLA','pisaRadius','aliasingVel','mrVTI','mvaPlanimetry','meanPGForward','mvMorphology','jetOrigin','pvFlowReversal'])} className="px-4 py-1 text-xs bg-blue-600 hover:bg-blue-700 rounded-xl">Reset</button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><div className="text-xs text-cyan-400 mb-1">Jet Origin</div>
                <select value={inputs.jetOrigin} onChange={e => update('jetOrigin', e.target.value)} className="w-full bg-zinc-900 border border-zinc-700 rounded-xl p-3 text-white">
                  <option value="">Select</option>
                  <option value="A1P1">A1/P1</option>
                  <option value="A2P2">A2/P2</option>
                  <option value="A3P3">A3/P3</option>
                </select>
              </div>
              <div><div className="text-xs text-cyan-400 mb-1">MV Morphology</div>
                <select value={inputs.mvMorphology} onChange={e => update('mvMorphology', e.target.value)} className="w-full bg-zinc-900 border border-zinc-700 rounded-xl p-3 text-white">
                  <option value="">Select</option>
                  <option value="primary">Primary / Degenerative</option>
                  <option value="secondary">Secondary / Functional</option>
                  <option value="flail">Flail Leaflet</option>
                  <option value="prolapse">Prolapse</option>
                </select>
              </div>
              <div><div className="text-xs text-cyan-400 mb-1">Vena Contracta (cm)</div><input type="number" step="0.1" inputMode="decimal" value={inputs.vcWidth} onChange={e => update('vcWidth', e.target.value)} className="w-full bg-zinc-900 border border-zinc-700 rounded-xl p-3" /></div>
              <div><div className="text-xs text-cyan-400 mb-1">PISA Radius (cm)</div><input type="number" step="0.1" inputMode="decimal" value={inputs.pisaRadius} onChange={e => update('pisaRadius', e.target.value)} className="w-full bg-zinc-900 border border-zinc-700 rounded-xl p-3" /></div>
              <div><div className="text-xs text-cyan-400 mb-1">Aliasing Velocity (cm/s)</div><input type="number" step="0.1" inputMode="decimal" value={inputs.aliasingVel} onChange={e => update('aliasingVel', e.target.value)} className="w-full bg-zinc-900 border border-zinc-700 rounded-xl p-3" /></div>
              <div><div className="text-xs text-cyan-400 mb-1">MR VTI (cm)</div><input type="number" step="0.1" inputMode="decimal" value={inputs.mrVTI} onChange={e => update('mrVTI', e.target.value)} className="w-full bg-zinc-900 border border-zinc-700 rounded-xl p-3" /></div>
              <div><div className="text-xs text-cyan-400 mb-1">MVA Planimetry (cm²)</div><input type="number" step="0.1" inputMode="decimal" value={inputs.mvaPlanimetry} onChange={e => update('mvaPlanimetry', e.target.value)} className="w-full bg-zinc-900 border border-zinc-700 rounded-xl p-3" /></div>
              <div><div className="text-xs text-cyan-400 mb-1">Forward Mean PG (mmHg)</div><input type="number" step="0.1" inputMode="decimal" value={inputs.meanPGForward} onChange={e => update('meanPGForward', e.target.value)} className="w-full bg-zinc-900 border border-zinc-700 rounded-xl p-3" /></div>
            </div>
            {results.mr && <div className="mt-6 bg-green-900/30 border border-green-400 p-5 rounded-2xl text-sm" dangerouslySetInnerHTML={{ __html: results.mr }} />}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}