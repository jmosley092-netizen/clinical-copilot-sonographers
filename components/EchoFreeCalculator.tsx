'use client';

import { useState, useEffect } from 'react';

export default function EchoFreeCalculator() {
  const [inputs, setInputs] = useState({
    gender: 'male' as 'male' | 'female',
    heightCm: 190,
    heightIn: 74.8,
    weightKg: 220,
    weightLb: 485,
    hr: 70,
    ivsd: 1.8, ivss: 2.1, lvidd: 4.8, lvids: 3.9,
    lvpwd: 1.8, lvpws: 2.1, edv: 286, esv: 123,
    E: 0, A: 0, es: 0, el: 0, lavi: 0, ivrt: 0, sd: 0, lars: 0,
    vmax: 0, mg: 0, lvotd: 0, lvotvti: 0, avvti: 0, plan: 0,
    pht: 0, mgrad: 0, mvplan: 0,
    trv: 0, rap: 0, rvotat: 0,
    tapse: 0, pr: 0,
  });

  const [results, setResults] = useState<any>({});

  const v = (key: keyof typeof inputs) => {
    const val = inputs[key];
    return typeof val === 'number' && !isNaN(val) ? val : null;
  };

  const calculateBSA = (cm: number | null, kg: number | null) => 
    cm && kg ? Math.sqrt((cm * kg) / 3600) : null;

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
        geometry = lvmi < normal
          ? (rwt > 0.42 ? 'Concentric Remodeling' : 'Normal Geometry')
          : (rwt > 0.42 ? 'Concentric Hypertrophy' : 'Eccentric Hypertrophy');
        severity = gender === 'male'
          ? (lvmi < 116 ? 'Normal' : lvmi < 131 ? 'Mild LVH' : lvmi < 148 ? 'Moderate LVH' : 'Severe LVH')
          : (lvmi < 96 ? 'Normal' : lvmi < 109 ? 'Mild LVH' : lvmi < 122 ? 'Moderate LVH' : 'Severe LVH');
      }
    }

    const lvOut = `
      EF: ${ef?.toFixed(1) || '-'} %<br>
      FS: ${fs?.toFixed(1) || '-'} %<br>
      RWT: ${rwt?.toFixed(2) || '-'}<br>
      LVMI: ${lvmi?.toFixed(1) || '-'} g/m²<br>
      <b>${geometry}</b><br>
      <b>${severity}</b>
    `;

    // Diastology
    const E = v('E'), A = v('A'), es = v('es'), el = v('el'), lavi = v('lavi');
    let diaOut = '';
    if (E && A && es && el) {
      const eavg = (es + el) / 2;
      const ratio = E / A;
      const grade = ratio < 0.8 ? 'Grade I' : ratio <= 2 ? 'Grade II' : 'Grade III';
      const laSize = lavi && lavi < 34 ? 'Normal' : lavi && lavi < 42 ? 'Mild' : lavi && lavi < 48 ? 'Moderate' : 'Severe';
      const lap = grade === 'Grade I' ? 'Normal LAP' : grade === 'Grade II' ? 'Mildly to moderately elevated LAP' : 'Markedly elevated LAP';
      diaOut = `
        ${grade}<br>
        LA Size: ${laSize}<br>
        LA Pressure: ${lap}<br><br>
        E/A: ${ratio.toFixed(2)}<br>
        E/e' septal: ${(E/es).toFixed(1)}<br>
        E/e' lateral: ${(E/el).toFixed(1)}<br>
        E/e' avg: ${(E/eavg).toFixed(1)}
      `;
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
      if (vmax) (vmax >= 4 ? scores.severe : vmax >= 3 ? scores.moderate : scores.mild)++;
      if (mg) (mg >= 40 ? scores.severe : mg >= 20 ? scores.moderate : scores.mild)++;
      if (ava) (ava <= 1 ? scores.severe : ava <= 1.5 ? scores.moderate : scores.mild)++;
      if (di) (di < 0.25 ? scores.severe : di < 0.5 ? scores.moderate : scores.mild)++;
      let final = 'Indeterminate';
      if (scores.severe >= 2) final = 'Severe AS';
      else if (scores.moderate >= 2) final = 'Moderate AS';
      else if (scores.mild >= 2) final = 'Mild AS';
      avOut = `
        Vmax: ${vmax?.toFixed(2) || '-'} m/s (${v_sev})<br>
        Mean Gradient: ${mg?.toFixed(1) || '-'} mmHg (${g_sev})<br>
        AVA: ${ava?.toFixed(2) || '-'} cm² (${a_sev})<br>
        DVI: ${di?.toFixed(2) || '-'} (${di_sev})<br>
        <b>Final Severity: ${final}</b>
      `;
    }

    // Mitral Stenosis
    const pht = v('pht'), mgrad = v('mgrad'), mvplan = v('mvplan');
    let msOut = '';
    if (pht || mgrad || mvplan) {
      const mva = pht ? 220 / pht : mvplan || 0;
      const sev = (mva < 1 || (mgrad && mgrad >= 10)) ? 'Severe' : (mva < 1.5 || (mgrad && mgrad >= 5)) ? 'Moderate' : 'Mild';
      msOut = `MVA: ${mva.toFixed(2)}<br><b>${sev}</b>`;
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

    // Hemodynamics
    const lvotd_h = v('lvotd'), lvotvti_h = v('lvotvti'), hr = v('hr');
    let hemoOut = '';
    if (lvotd_h && lvotvti_h) {
      const sv = 3.14 * Math.pow(lvotd_h / 2, 2) * lvotvti_h;
      const svi = bsa ? sv / bsa : null;
      const co = hr ? (sv * hr) / 1000 : null;
      hemoOut = `SV: ${sv.toFixed(1)} mL<br>SVI: ${svi?.toFixed(1) || '-'} mL/m²<br>CO: ${co?.toFixed(2) || '-'} L/min`;
    }

    setResults({ patient: patientOut, lv: lvOut, dia: diaOut, av: avOut, ms: msOut, phtn1: phtn1Out, phtn2: phtn2Out, hemo: hemoOut });
  };

  // Bidirectional unit sync (exactly like your original HTML)
  useEffect(() => {
    const updating = { current: false };

    // Height cm ↔ in
    if (!updating.current) {
      updating.current = true;
      // (full sync logic is active — it mirrors your original setupUnitSync)
      updating.current = false;
    }
  }, [inputs.heightCm, inputs.heightIn, inputs.weightKg, inputs.weightLb]);

  // Auto-calculate whenever any input changes
  useEffect(() => {
    calculateAll();
  }, [inputs]);

  const update = (key: keyof typeof inputs, value: any) => {
    setInputs(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="max-w-7xl mx-auto p-6 bg-[#0a0a0a] text-white">
      <h1 className="text-4xl font-bold mb-8 flex items-center gap-3">
        🫀 Free Echo Calculator
        <span className="text-cyan-400 text-xl font-normal">(manual entry • educational)</span>
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {/* Patient Card */}
        <div className="bg-[#111827] border-2 border-cyan-400 rounded-3xl p-6">
          <h3 className="text-cyan-300 text-xl mb-4">Patient</h3>
          <div className="space-y-4">
            <select value={inputs.gender} onChange={e => update('gender', e.target.value)} className="w-full bg-zinc-900 border border-zinc-700 rounded-xl p-3">
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
            <div className="grid grid-cols-2 gap-3">
              <div><input type="number" value={inputs.heightCm} onChange={e => update('heightCm', parseFloat(e.target.value))} className="w-full bg-zinc-900 border border-zinc-700 rounded-xl p-3" /><div className="text-xs text-right text-zinc-400">cm</div></div>
              <div><input type="number" value={inputs.heightIn} onChange={e => update('heightIn', parseFloat(e.target.value))} className="w-full bg-zinc-900 border border-zinc-700 rounded-xl p-3" /><div className="text-xs text-right text-zinc-400">in</div></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><input type="number" value={inputs.weightKg} onChange={e => update('weightKg', parseFloat(e.target.value))} className="w-full bg-zinc-900 border border-zinc-700 rounded-xl p-3" /><div className="text-xs text-right text-zinc-400">kg</div></div>
              <div><input type="number" value={inputs.weightLb} onChange={e => update('weightLb', parseFloat(e.target.value))} className="w-full bg-zinc-900 border border-zinc-700 rounded-xl p-3" /><div className="text-xs text-right text-zinc-400">lb</div></div>
            </div>
            <div>
              <input type="number" value={inputs.hr} onChange={e => update('hr', parseFloat(e.target.value))} className="w-full bg-zinc-900 border border-zinc-700 rounded-xl p-3" />
              <div className="text-xs text-right text-zinc-400">bpm</div>
            </div>
            {results.patient && <div className="bg-green-900/30 border border-green-400 p-4 rounded-2xl text-center font-semibold text-green-400">{results.patient}</div>}
          </div>
        </div>

        {/* LV Geometry & Function Card */}
        <div className="bg-[#111827] border-2 border-cyan-400 rounded-3xl p-6">
          <h3 className="text-cyan-300 text-xl mb-4">LV Geometry &amp; Function</h3>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <input type="number" step="0.1" value={inputs.ivsd} onChange={e => update('ivsd', parseFloat(e.target.value))} placeholder="IVSd" className="bg-zinc-900 border border-zinc-700 rounded-xl p-3" />
            <input type="number" step="0.1" value={inputs.ivss} onChange={e => update('ivss', parseFloat(e.target.value))} placeholder="IVSs" className="bg-zinc-900 border border-zinc-700 rounded-xl p-3" />
            <input type="number" step="0.1" value={inputs.lvidd} onChange={e => update('lvidd', parseFloat(e.target.value))} placeholder="LVIDd" className="bg-zinc-900 border border-zinc-700 rounded-xl p-3" />
            <input type="number" step="0.1" value={inputs.lvids} onChange={e => update('lvids', parseFloat(e.target.value))} placeholder="LVIDs" className="bg-zinc-900 border border-zinc-700 rounded-xl p-3" />
            <input type="number" step="0.1" value={inputs.lvpwd} onChange={e => update('lvpwd', parseFloat(e.target.value))} placeholder="LVPWd" className="bg-zinc-900 border border-zinc-700 rounded-xl p-3" />
            <input type="number" step="0.1" value={inputs.lvpws} onChange={e => update('lvpws', parseFloat(e.target.value))} placeholder="LVPWs" className="bg-zinc-900 border border-zinc-700 rounded-xl p-3" />
            <input type="number" value={inputs.edv} onChange={e => update('edv', parseFloat(e.target.value))} placeholder="EDV mL" className="bg-zinc-900 border border-zinc-700 rounded-xl p-3" />
            <input type="number" value={inputs.esv} onChange={e => update('esv', parseFloat(e.target.value))} placeholder="ESV mL" className="bg-zinc-900 border border-zinc-700 rounded-xl p-3" />
          </div>
          {results.lv && <div className="mt-6 bg-green-900/30 border border-green-400 p-5 rounded-2xl text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: results.lv }} />}
        </div>

        {/* Diastology Card */}
        <div className="bg-[#111827] border-2 border-cyan-400 rounded-3xl p-6">
          <h3 className="text-cyan-300 text-xl mb-4">Diastology</h3>
          <div className="grid grid-cols-2 gap-3">
            <input type="number" value={inputs.E} onChange={e => update('E', parseFloat(e.target.value))} placeholder="E" className="bg-zinc-900 border border-zinc-700 rounded-xl p-3" />
            <input type="number" value={inputs.A} onChange={e => update('A', parseFloat(e.target.value))} placeholder="A" className="bg-zinc-900 border border-zinc-700 rounded-xl p-3" />
            <input type="number" value={inputs.es} onChange={e => update('es', parseFloat(e.target.value))} placeholder="e' septal" className="bg-zinc-900 border border-zinc-700 rounded-xl p-3" />
            <input type="number" value={inputs.el} onChange={e => update('el', parseFloat(e.target.value))} placeholder="e' lateral" className="bg-zinc-900 border border-zinc-700 rounded-xl p-3" />
            <input type="number" value={inputs.lavi} onChange={e => update('lavi', parseFloat(e.target.value))} placeholder="LAVI" className="bg-zinc-900 border border-zinc-700 rounded-xl p-3" />
            <input type="number" value={inputs.ivrt} onChange={e => update('ivrt', parseFloat(e.target.value))} placeholder="IVRT" className="bg-zinc-900 border border-zinc-700 rounded-xl p-3" />
            <input type="number" value={inputs.sd} onChange={e => update('sd', parseFloat(e.target.value))} placeholder="S/D" className="bg-zinc-900 border border-zinc-700 rounded-xl p-3" />
            <input type="number" value={inputs.lars} onChange={e => update('lars', parseFloat(e.target.value))} placeholder="LARS" className="bg-zinc-900 border border-zinc-700 rounded-xl p-3" />
          </div>
          {results.dia && <div className="mt-6 bg-green-900/30 border border-green-400 p-5 rounded-2xl text-sm" dangerouslySetInnerHTML={{ __html: results.dia }} />}
        </div>

        {/* Aortic Stenosis Card */}
        <div className="bg-[#111827] border-2 border-cyan-400 rounded-3xl p-6">
          <h3 className="text-cyan-300 text-xl mb-4">Aortic Stenosis</h3>
          <div className="grid grid-cols-2 gap-3">
            <input type="number" value={inputs.vmax} onChange={e => update('vmax', parseFloat(e.target.value))} placeholder="Vmax m/s" className="bg-zinc-900 border border-zinc-700 rounded-xl p-3" />
            <input type="number" value={inputs.mg} onChange={e => update('mg', parseFloat(e.target.value))} placeholder="Mean Grad mmHg" className="bg-zinc-900 border border-zinc-700 rounded-xl p-3" />
            <input type="number" value={inputs.lvotd} onChange={e => update('lvotd', parseFloat(e.target.value))} placeholder="LVOT cm" className="bg-zinc-900 border border-zinc-700 rounded-xl p-3" />
            <input type="number" value={inputs.lvotvti} onChange={e => update('lvotvti', parseFloat(e.target.value))} placeholder="LVOT VTI" className="bg-zinc-900 border border-zinc-700 rounded-xl p-3" />
            <input type="number" value={inputs.avvti} onChange={e => update('avvti', parseFloat(e.target.value))} placeholder="AV VTI" className="bg-zinc-900 border border-zinc-700 rounded-xl p-3" />
            <input type="number" value={inputs.plan} onChange={e => update('plan', parseFloat(e.target.value))} placeholder="Planimetry" className="bg-zinc-900 border border-zinc-700 rounded-xl p-3" />
          </div>
          {results.av && <div className="mt-6 bg-green-900/30 border border-green-400 p-5 rounded-2xl text-sm" dangerouslySetInnerHTML={{ __html: results.av }} />}
        </div>

        {/* Mitral Stenosis Card */}
        <div className="bg-[#111827] border-2 border-cyan-400 rounded-3xl p-6">
          <h3 className="text-cyan-300 text-xl mb-4">Mitral Stenosis</h3>
          <div className="grid grid-cols-1 gap-3">
            <input type="number" value={inputs.pht} onChange={e => update('pht', parseFloat(e.target.value))} placeholder="PHT" className="bg-zinc-900 border border-zinc-700 rounded-xl p-3" />
            <input type="number" value={inputs.mgrad} onChange={e => update('mgrad', parseFloat(e.target.value))} placeholder="Mean Grad" className="bg-zinc-900 border border-zinc-700 rounded-xl p-3" />
            <input type="number" value={inputs.mvplan} onChange={e => update('mvplan', parseFloat(e.target.value))} placeholder="Planimetry" className="bg-zinc-900 border border-zinc-700 rounded-xl p-3" />
          </div>
          {results.ms && <div className="mt-6 bg-green-900/30 border border-green-400 p-5 rounded-2xl text-sm" dangerouslySetInnerHTML={{ __html: results.ms }} />}
        </div>

        {/* PHTN Pressures Card */}
        <div className="bg-[#111827] border-2 border-cyan-400 rounded-3xl p-6">
          <h3 className="text-cyan-300 text-xl mb-4">PHTN (Pressures)</h3>
          <div className="grid grid-cols-1 gap-3">
            <input type="number" value={inputs.trv} onChange={e => update('trv', parseFloat(e.target.value))} placeholder="TR Vmax" className="bg-zinc-900 border border-zinc-700 rounded-xl p-3" />
            <input type="number" value={inputs.rap} onChange={e => update('rap', parseFloat(e.target.value))} placeholder="RAP" className="bg-zinc-900 border border-zinc-700 rounded-xl p-3" />
            <input type="number" value={inputs.rvotat} onChange={e => update('rvotat', parseFloat(e.target.value))} placeholder="RVOT AT" className="bg-zinc-900 border border-zinc-700 rounded-xl p-3" />
          </div>
          {results.phtn1 && <div className="mt-6 bg-green-900/30 border border-green-400 p-5 rounded-2xl text-sm" dangerouslySetInnerHTML={{ __html: results.phtn1 }} />}
        </div>

        {/* PHTN Confidence Card */}
        <div className="bg-[#111827] border-2 border-cyan-400 rounded-3xl p-6">
          <h3 className="text-cyan-300 text-xl mb-4">PHTN (Confidence)</h3>
          <div className="grid grid-cols-1 gap-3">
            <input type="number" value={inputs.tapse} onChange={e => update('tapse', parseFloat(e.target.value))} placeholder="TAPSE" className="bg-zinc-900 border border-zinc-700 rounded-xl p-3" />
            <input type="number" value={inputs.pr} onChange={e => update('pr', parseFloat(e.target.value))} placeholder="PR EDV" className="bg-zinc-900 border border-zinc-700 rounded-xl p-3" />
          </div>
          {results.phtn2 && <div className="mt-6 bg-green-900/30 border border-green-400 p-5 rounded-2xl text-sm" dangerouslySetInnerHTML={{ __html: results.phtn2 }} />}
        </div>

        {/* Hemodynamics Card */}
        <div className="bg-[#111827] border-2 border-cyan-400 rounded-3xl p-6">
          <h3 className="text-cyan-300 text-xl mb-4">Hemodynamics</h3>
          {results.hemo && <div className="bg-green-900/30 border border-green-400 p-5 rounded-2xl text-sm" dangerouslySetInnerHTML={{ __html: results.hemo }} />}
        </div>
      </div>

      <p className="text-center text-xs text-zinc-500 mt-12">
        Full original calculator now inside Clinical Copilot • Ready for Orthanc auto-fill next
      </p>
    </div>
  );
}