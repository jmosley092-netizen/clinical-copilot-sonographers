'use client';

import { useState, useEffect } from 'react';

export default function EchoFreeCalculator() {
  const [inputs, setInputs] = useState({
    gender: '' as '' | 'male' | 'female',
    heightCm: '', heightIn: '', weightKg: '', weightLb: '', hr: '',
    ivsd: '', ivss: '', lvidd: '', lvids: '', lvpwd: '', lvpws: '', edv: '', esv: '',
    E: '', A: '', es: '', el: '', lavi: '', ivrt: '', sd: '', lars: '',
    vmax: '', mg: '', lvotd: '', lvotvti: '', avvti: '', plan: '',
    pht: '', mgrad: '', mvplan: '',
    trv: '', rap: '', rvotat: '',
    tapse: '', pr: '',
  });

  const [results, setResults] = useState<any>({});

  const v = (key: keyof typeof inputs) => {
    const val = inputs[key];
    return val === '' ? null : parseFloat(val as string);
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
      if (vmax) { if (vmax >= 4) scores.severe++; else if (vmax >= 3) scores.moderate++; else scores.mild++; }
      if (mg) { if (mg >= 40) scores.severe++; else if (mg >= 20) scores.moderate++; else scores.mild++; }
      if (ava) { if (ava <= 1) scores.severe++; else if (ava <= 1.5) scores.moderate++; else scores.mild++; }
      if (di) { if (di < 0.25) scores.severe++; else if (di < 0.5) scores.moderate++; else scores.mild++; }

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

    setResults({ patient: patientOut, lv: lvOut, dia: diaOut, av: avOut, ms: msOut });
  };


  useEffect(() => {
    calculateAll();
  }, [inputs]);

  // Dedicated update functions to prevent input fighting
  const updateHeightCm = (value: string) => {
    setInputs(prev => ({
      ...prev,
      heightCm: value,
      heightIn: value ? (parseFloat(value) / 2.54).toFixed(1) : ''
    }));
  };

  const updateHeightIn = (value: string) => {
    setInputs(prev => ({
      ...prev,
      heightIn: value,
      heightCm: value ? (parseFloat(value) * 2.54).toFixed(1) : ''
    }));
  };

  const updateWeightKg = (value: string) => {
    setInputs(prev => ({
      ...prev,
      weightKg: value,
      weightLb: value ? (parseFloat(value) * 2.20462).toFixed(1) : ''
    }));
  };

  const updateWeightLb = (value: string) => {
    setInputs(prev => ({
      ...prev,
      weightLb: value,
      weightKg: value ? (parseFloat(value) / 2.20462).toFixed(1) : ''
    }));
  };

  const update = (key: keyof typeof inputs, value: any) => {
    if (key === 'heightCm') return updateHeightCm(value);
    if (key === 'heightIn') return updateHeightIn(value);
    if (key === 'weightKg') return updateWeightKg(value);
    if (key === 'weightLb') return updateWeightLb(value);
    setInputs(prev => ({ ...prev, [key]: value }));
  };

  const resetCard = (fields: string[]) => {
    const newInputs = { ...inputs };
    fields.forEach(f => { newInputs[f as keyof typeof inputs] = ''; });
    setInputs(newInputs);
  };

  return (
    <div className="max-w-7xl mx-auto p-6 bg-[#0a0a0a] text-white">
      <h1 className="text-4xl font-bold mb-8 flex items-center gap-3">
        🫀 Free Echo Calculator <span className="text-cyan-400 text-xl font-normal">(manual entry • educational)</span>
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {/* Patient Card - already working */}
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
              <div><div className="text-xs text-cyan-400 mb-1">Height (cm)</div><input type="number" value={inputs.heightCm} onChange={e => update('heightCm', e.target.value)} className="w-full bg-zinc-900 border border-zinc-700 rounded-xl p-3" /></div>
              <div><div className="text-xs text-cyan-400 mb-1">Height (in)</div><input type="number" value={inputs.heightIn} onChange={e => update('heightIn', e.target.value)} className="w-full bg-zinc-900 border border-zinc-700 rounded-xl p-3" /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><div className="text-xs text-cyan-400 mb-1">Weight (kg)</div><input type="number" value={inputs.weightKg} onChange={e => update('weightKg', e.target.value)} className="w-full bg-zinc-900 border border-zinc-700 rounded-xl p-3" /></div>
              <div><div className="text-xs text-cyan-400 mb-1">Weight (lb)</div><input type="number" value={inputs.weightLb} onChange={e => update('weightLb', e.target.value)} className="w-full bg-zinc-900 border border-zinc-700 rounded-xl p-3" /></div>
            </div>
            <div><div className="text-xs text-cyan-400 mb-1">Heart Rate (bpm)</div><input type="number" value={inputs.hr} onChange={e => update('hr', e.target.value)} className="w-full bg-zinc-900 border border-zinc-700 rounded-xl p-3" /></div>
            {results.patient && <div className="bg-green-900/30 border border-green-400 p-4 rounded-2xl text-center font-semibold text-green-400">{results.patient}</div>}
          </div>
        </div>

        {/* LV Geometry & Function - already working */}
        <div className="bg-[#111827] border-2 border-cyan-400 rounded-3xl p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-cyan-300 text-xl">LV Geometry &amp; Function</h3>
            <button onClick={() => resetCard(['ivsd','ivss','lvidd','lvids','lvpwd','lvpws','edv','esv'])} className="px-4 py-1 text-xs bg-blue-600 hover:bg-blue-700 rounded-xl">Reset</button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><div className="text-xs text-cyan-400 mb-1">IVSd (cm)</div><input type="number" step="0.1" value={inputs.ivsd} onChange={e => update('ivsd', e.target.value)} className="w-full bg-zinc-900 border border-zinc-700 rounded-xl p-3" /></div>
            <div><div className="text-xs text-cyan-400 mb-1">IVSs (cm)</div><input type="number" step="0.1" value={inputs.ivss} onChange={e => update('ivss', e.target.value)} className="w-full bg-zinc-900 border border-zinc-700 rounded-xl p-3" /></div>
            <div><div className="text-xs text-cyan-400 mb-1">LVIDd (cm)</div><input type="number" step="0.1" value={inputs.lvidd} onChange={e => update('lvidd', e.target.value)} className="w-full bg-zinc-900 border border-zinc-700 rounded-xl p-3" /></div>
            <div><div className="text-xs text-cyan-400 mb-1">LVIDs (cm)</div><input type="number" step="0.1" value={inputs.lvids} onChange={e => update('lvids', e.target.value)} className="w-full bg-zinc-900 border border-zinc-700 rounded-xl p-3" /></div>
            <div><div className="text-xs text-cyan-400 mb-1">LVPWd (cm)</div><input type="number" step="0.1" value={inputs.lvpwd} onChange={e => update('lvpwd', e.target.value)} className="w-full bg-zinc-900 border border-zinc-700 rounded-xl p-3" /></div>
            <div><div className="text-xs text-cyan-400 mb-1">LVPWs (cm)</div><input type="number" step="0.1" value={inputs.lvpws} onChange={e => update('lvpws', e.target.value)} className="w-full bg-zinc-900 border border-zinc-700 rounded-xl p-3" /></div>
            <div><div className="text-xs text-cyan-400 mb-1">EDV (mL)</div><input type="number" value={inputs.edv} onChange={e => update('edv', e.target.value)} className="w-full bg-zinc-900 border border-zinc-700 rounded-xl p-3" /></div>
            <div><div className="text-xs text-cyan-400 mb-1">ESV (mL)</div><input type="number" value={inputs.esv} onChange={e => update('esv', e.target.value)} className="w-full bg-zinc-900 border border-zinc-700 rounded-xl p-3" /></div>
          </div>
          {results.lv && <div className="mt-6 bg-green-900/30 border border-green-400 p-5 rounded-2xl text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: results.lv }} />}
        </div>

        {/* Diastology Card - already working */}
        <div className="bg-[#111827] border-2 border-cyan-400 rounded-3xl p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-cyan-300 text-xl">Diastology</h3>
            <button onClick={() => resetCard(['E','A','es','el','lavi','ivrt','sd','lars'])} className="px-4 py-1 text-xs bg-blue-600 hover:bg-blue-700 rounded-xl">Reset</button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><div className="text-xs text-cyan-400 mb-1">E</div><input type="number" value={inputs.E} onChange={e => update('E', e.target.value)} className="w-full bg-zinc-900 border border-zinc-700 rounded-xl p-3" /></div>
            <div><div className="text-xs text-cyan-400 mb-1">A</div><input type="number" value={inputs.A} onChange={e => update('A', e.target.value)} className="w-full bg-zinc-900 border border-zinc-700 rounded-xl p-3" /></div>
            <div><div className="text-xs text-cyan-400 mb-1">e' septal</div><input type="number" value={inputs.es} onChange={e => update('es', e.target.value)} className="w-full bg-zinc-900 border border-zinc-700 rounded-xl p-3" /></div>
            <div><div className="text-xs text-cyan-400 mb-1">e' lateral</div><input type="number" value={inputs.el} onChange={e => update('el', e.target.value)} className="w-full bg-zinc-900 border border-zinc-700 rounded-xl p-3" /></div>
            <div><div className="text-xs text-cyan-400 mb-1">LAVI</div><input type="number" value={inputs.lavi} onChange={e => update('lavi', e.target.value)} className="w-full bg-zinc-900 border border-zinc-700 rounded-xl p-3" /></div>
            <div><div className="text-xs text-cyan-400 mb-1">IVRT</div><input type="number" value={inputs.ivrt} onChange={e => update('ivrt', e.target.value)} className="w-full bg-zinc-900 border border-zinc-700 rounded-xl p-3" /></div>
            <div><div className="text-xs text-cyan-400 mb-1">S/D</div><input type="number" value={inputs.sd} onChange={e => update('sd', e.target.value)} className="w-full bg-zinc-900 border border-zinc-700 rounded-xl p-3" /></div>
            <div><div className="text-xs text-cyan-400 mb-1">LARS</div><input type="number" value={inputs.lars} onChange={e => update('lars', e.target.value)} className="w-full bg-zinc-900 border border-zinc-700 rounded-xl p-3" /></div>
          </div>
          {results.dia && <div className="mt-6 bg-green-900/30 border border-green-400 p-5 rounded-2xl text-sm" dangerouslySetInnerHTML={{ __html: results.dia }} />}
        </div>

        {/* Aortic Stenosis Card - already working */}
        <div className="bg-[#111827] border-2 border-cyan-400 rounded-3xl p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-cyan-300 text-xl">Aortic Stenosis</h3>
            <button onClick={() => resetCard(['vmax','mg','lvotd','lvotvti','avvti','plan'])} className="px-4 py-1 text-xs bg-blue-600 hover:bg-blue-700 rounded-xl">Reset</button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><div className="text-xs text-cyan-400 mb-1">Vmax (m/s)</div><input type="number" step="0.1" value={inputs.vmax} onChange={e => update('vmax', e.target.value)} className="w-full bg-zinc-900 border border-zinc-700 rounded-xl p-3" /></div>
            <div><div className="text-xs text-cyan-400 mb-1">Mean Grad (mmHg)</div><input type="number" step="0.1" value={inputs.mg} onChange={e => update('mg', e.target.value)} className="w-full bg-zinc-900 border border-zinc-700 rounded-xl p-3" /></div>
            <div><div className="text-xs text-cyan-400 mb-1">LVOT (cm)</div><input type="number" step="0.1" value={inputs.lvotd} onChange={e => update('lvotd', e.target.value)} className="w-full bg-zinc-900 border border-zinc-700 rounded-xl p-3" /></div>
            <div><div className="text-xs text-cyan-400 mb-1">LVOT VTI (cm)</div><input type="number" step="0.1" value={inputs.lvotvti} onChange={e => update('lvotvti', e.target.value)} className="w-full bg-zinc-900 border border-zinc-700 rounded-xl p-3" /></div>
            <div><div className="text-xs text-cyan-400 mb-1">AV VTI (cm)</div><input type="number" step="0.1" value={inputs.avvti} onChange={e => update('avvti', e.target.value)} className="w-full bg-zinc-900 border border-zinc-700 rounded-xl p-3" /></div>
            <div><div className="text-xs text-cyan-400 mb-1">Planimetry (cm²)</div><input type="number" step="0.1" value={inputs.plan} onChange={e => update('plan', e.target.value)} className="w-full bg-zinc-900 border border-zinc-700 rounded-xl p-3" /></div>
          </div>
          {results.av && <div className="mt-6 bg-green-900/30 border border-green-400 p-5 rounded-2xl text-sm" dangerouslySetInnerHTML={{ __html: results.av }} />}
        </div>

        {/* Mitral Stenosis Card - already working */}
        <div className="bg-[#111827] border-2 border-cyan-400 rounded-3xl p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-cyan-300 text-xl">Mitral Stenosis</h3>
            <button onClick={() => resetCard(['pht','mgrad','mvplan'])} className="px-4 py-1 text-xs bg-blue-600 hover:bg-blue-700 rounded-xl">Reset</button>
          </div>
          <div className="grid grid-cols-1 gap-4">
            <div><div className="text-xs text-cyan-400 mb-1">PHT</div><input type="number" value={inputs.pht} onChange={e => update('pht', e.target.value)} className="w-full bg-zinc-900 border border-zinc-700 rounded-xl p-3" /></div>
            <div><div className="text-xs text-cyan-400 mb-1">Mean Grad</div><input type="number" value={inputs.mgrad} onChange={e => update('mgrad', e.target.value)} className="w-full bg-zinc-900 border border-zinc-700 rounded-xl p-3" /></div>
            <div><div className="text-xs text-cyan-400 mb-1">Planimetry (cm²)</div><input type="number" value={inputs.mvplan} onChange={e => update('mvplan', e.target.value)} className="w-full bg-zinc-900 border border-zinc-700 rounded-xl p-3" /></div>
          </div>
          {results.ms && <div className="mt-6 bg-green-900/30 border border-green-400 p-5 rounded-2xl text-sm" dangerouslySetInnerHTML={{ __html: results.ms }} />}
        </div>

        {/* PHTN (Pressures) Card - NEW */}
        <div className="bg-[#111827] border-2 border-cyan-400 rounded-3xl p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-cyan-300 text-xl">PHTN (Pressures)</h3>
            <button onClick={() => resetCard(['trv','rap','rvotat'])} className="px-4 py-1 text-xs bg-blue-600 hover:bg-blue-700 rounded-xl">Reset</button>
          </div>
          <div className="grid grid-cols-1 gap-4">
            <div><div className="text-xs text-cyan-400 mb-1">TR Vmax (m/s)</div><input type="number" step="0.1" value={inputs.trv} onChange={e => update('trv', e.target.value)} className="w-full bg-zinc-900 border border-zinc-700 rounded-xl p-3" /></div>
            <div><div className="text-xs text-cyan-400 mb-1">RAP (mmHg)</div><input type="number" value={inputs.rap} onChange={e => update('rap', e.target.value)} className="w-full bg-zinc-900 border border-zinc-700 rounded-xl p-3" /></div>
            <div><div className="text-xs text-cyan-400 mb-1">RVOT AT (ms)</div><input type="number" value={inputs.rvotat} onChange={e => update('rvotat', e.target.value)} className="w-full bg-zinc-900 border border-zinc-700 rounded-xl p-3" /></div>
          </div>
          {results.phtn1 && <div className="mt-6 bg-green-900/30 border border-green-400 p-5 rounded-2xl text-sm" dangerouslySetInnerHTML={{ __html: results.phtn1 }} />}
        </div>
      </div>
    </div>
  );
}