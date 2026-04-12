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

    const patientOut = bsa ? `BSA: ${bsa.toFixed(2)} m²` : '';

    // LV (full logic from your original HTML)
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

    setResults({ patient: patientOut, lv: lvOut });
  };

  // Auto-calculate
  useEffect(() => {
    calculateAll();
  }, [inputs]);

  // ====================== BIDIRECTIONAL UNIT CONVERSION ======================
  const updateHeightCm = (value: string) => {
    setInputs(prev => {
      const num = parseFloat(value);
      return {
        ...prev,
        heightCm: value,
        heightIn: !isNaN(num) ? (num / 2.54).toFixed(1) : '',
      };
    });
  };

  const updateHeightIn = (value: string) => {
    setInputs(prev => {
      const num = parseFloat(value);
      return {
        ...prev,
        heightIn: value,
        heightCm: !isNaN(num) ? (num * 2.54).toFixed(1) : '',
      };
    });
  };

  const updateWeightKg = (value: string) => {
    setInputs(prev => {
      const num = parseFloat(value);
      return {
        ...prev,
        weightKg: value,
        weightLb: !isNaN(num) ? (num * 2.20462).toFixed(1) : '',
      };
    });
  };

  const updateWeightLb = (value: string) => {
    setInputs(prev => {
      const num = parseFloat(value);
      return {
        ...prev,
        weightLb: value,
        weightKg: !isNaN(num) ? (num / 2.20462).toFixed(1) : '',
      };
    });
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
        {/* Patient Card with full bidirectional conversion */}
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
              <div>
                <div className="text-xs text-cyan-400 mb-1">Height (cm)</div>
                <input type="number" value={inputs.heightCm} onChange={e => update('heightCm', e.target.value)} className="w-full bg-zinc-900 border border-zinc-700 rounded-xl p-3" />
              </div>
              <div>
                <div className="text-xs text-cyan-400 mb-1">Height (in)</div>
                <input type="number" value={inputs.heightIn} onChange={e => update('heightIn', e.target.value)} className="w-full bg-zinc-900 border border-zinc-700 rounded-xl p-3" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="text-xs text-cyan-400 mb-1">Weight (kg)</div>
                <input type="number" value={inputs.weightKg} onChange={e => update('weightKg', e.target.value)} className="w-full bg-zinc-900 border border-zinc-700 rounded-xl p-3" />
              </div>
              <div>
                <div className="text-xs text-cyan-400 mb-1">Weight (lb)</div>
                <input type="number" value={inputs.weightLb} onChange={e => update('weightLb', e.target.value)} className="w-full bg-zinc-900 border border-zinc-700 rounded-xl p-3" />
              </div>
            </div>

            <div>
              <div className="text-xs text-cyan-400 mb-1">Heart Rate (bpm)</div>
              <input type="number" value={inputs.hr} onChange={e => update('hr', e.target.value)} className="w-full bg-zinc-900 border border-zinc-700 rounded-xl p-3" />
            </div>

            {results.patient && <div className="bg-green-900/30 border border-green-400 p-4 rounded-2xl text-center font-semibold text-green-400">{results.patient}</div>}
          </div>
        </div>

        {/* LV Geometry & Function (unchanged - already working) */}
        <div className="bg-[#111827] border-2 border-cyan-400 rounded-3xl p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-cyan-300 text-xl">LV Geometry &amp; Function</h3>
            <button onClick={() => resetCard(['ivsd','ivss','lvidd','lvids','lvpwd','lvpws','edv','esv'])} className="px-4 py-1 text-xs bg-blue-600 hover:bg-blue-700 rounded-xl">Reset</button>
          </div>
          {/* ... same LV inputs as before ... */}
        </div>

        {/* All other cards remain the same as your last working version */}
      </div>
    </div>
  );
}