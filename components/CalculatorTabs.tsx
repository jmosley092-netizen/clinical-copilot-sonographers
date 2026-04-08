"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EchoCalculator } from "./EchoCalculator";

export function CalculatorTabs() {
  return (
    <Tabs defaultValue="echo" className="w-full">
      <TabsList className="grid grid-cols-4 bg-zinc-950 border border-zinc-700">
        <TabsTrigger value="echo">Echocardiography</TabsTrigger>
        <TabsTrigger value="obgyn">OB/GYN</TabsTrigger>
        <TabsTrigger value="vascular">Vascular</TabsTrigger>
        <TabsTrigger value="abdomen">Abdomen</TabsTrigger>
      </TabsList>

      <TabsContent value="echo" className="mt-6">
        <EchoCalculator specialty="Echocardiography" />
      </TabsContent>
      <TabsContent value="obgyn" className="mt-6">
        <EchoCalculator specialty="OB/GYN" />
      </TabsContent>
      <TabsContent value="vascular" className="mt-6">
        <EchoCalculator specialty="Vascular" />
      </TabsContent>
      <TabsContent value="abdomen" className="mt-6">
        <EchoCalculator specialty="Abdomen" />
      </TabsContent>
    </Tabs>
  );
}