"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calculator } from "lucide-react";
import ClinicalTabs from "./ClinicalTabs";   // ← New tabs component

export function EchoCalculator({ specialty = "Echocardiography" }: { specialty?: string }) {
  return (
    <Card className="border-zinc-700 bg-zinc-900">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-emerald-400">
          <Calculator className="w-6 h-6" />
          Clinical CoPilot – {specialty}
        </CardTitle>
      </CardHeader>

      <CardContent className="p-0">
        {/* This is the new tabbed interface we just built */}
        <ClinicalTabs />
      </CardContent>
    </Card>
  );
}