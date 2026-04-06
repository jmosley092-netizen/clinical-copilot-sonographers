import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EchoCalculator } from "./EchoCalculator";

export function CalculatorTabs() {
  return (
    <Tabs defaultValue="echo" className="w-full max-w-5xl mx-auto">
      <TabsList className="grid w-full grid-cols-4 bg-zinc-900 border border-zinc-700">
        <TabsTrigger value="echo" className="data-[state=active]:bg-emerald-900">
          Echocardiography
        </TabsTrigger>
        <TabsTrigger value="ob" disabled>
          OB/GYN (soon)
        </TabsTrigger>
        <TabsTrigger value="vascular" disabled>
          Vascular (soon)
        </TabsTrigger>
        <TabsTrigger value="abdomen" disabled>
          Abdomen (soon)
        </TabsTrigger>
      </TabsList>

      <TabsContent value="echo" className="mt-6">
        <EchoCalculator />
      </TabsContent>
    </Tabs>
  );
}