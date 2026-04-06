import { CalculatorTabs } from "@/components/CalculatorTabs";

export default function Home() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-white">
          Welcome to Clinical CoPilot
        </h1>
        <p className="text-zinc-400 mt-2 max-w-md mx-auto">
          Educational ultrasound calculators • Built for sonography students &amp; educators
        </p>
      </div>
      <CalculatorTabs />
    </div>
  );
}