import { Stethoscope } from "lucide-react";

export function CoPilotHeader() {
  return (
    <header className="border-b border-zinc-800 bg-zinc-950 px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Stethoscope className="w-8 h-8 text-emerald-400" />
        <div>
          <span className="text-2xl font-bold tracking-tight">Clinical CoPilot</span>
          <span className="text-emerald-400 text-sm block -mt-1">for Sonographers</span>
        </div>
        <span className="text-xs px-2 py-0.5 bg-emerald-900 text-emerald-300 rounded-full">by CloudSono.AI</span>
      </div>
      <div className="text-sm text-zinc-400">
        Educational Tool • Not for diagnostic use
      </div>
    </header>
  );
}