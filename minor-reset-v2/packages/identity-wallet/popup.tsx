import { useState } from "react";
import { Storage } from "@plasmohq/storage";
import { Html5QrcodeScanner } from "html5-qrcode";
import { processBarcode } from "./lib/id-validator";
import { sealTokenWithBiometrics } from "./lib/biometrics";
import "~style.css";

function IndexPopup() {
  const [step, setStep] = useState<"IDLE" | "SCANNING" | "BIOMETRIC" | "SUCCESS">("IDLE");
  const [error, setError] = useState("");
  const storage = new Storage();

  const startScan = () => {
    setStep("SCANNING");
    const scanner = new Html5QrcodeScanner("reader", { 
      fps: 10, 
      formatsToSupport: [0] // PDF417
    }, false);

    scanner.render(async (text) => {
      try {
        const ageProof = processBarcode(text); // Logic from previous file
        scanner.clear();
        setStep("BIOMETRIC");
        
        // Lock the proof to this specific device/person
        await sealTokenWithBiometrics(ageProof);
        setStep("SUCCESS");
      } catch (err: any) {
        setError(err.message);
        setStep("IDLE");
      }
    }, () => {});
  };

  return (
    <div className="w-80 p-6 bg-slate-950 text-white font-sans">
      <h1 className="text-xl font-black italic tracking-tighter mb-4">MINOR-RESET <span className="text-blue-500">v2</span></h1>

      {step === "IDLE" && (
        <div className="space-y-4">
          <p className="text-sm text-slate-400">Scan your physical ID to generate a private age proof.</p>
          <button onClick={startScan} className="w-full bg-blue-600 py-3 rounded-xl font-bold">Start Verification</button>
        </div>
      )}

      {step === "SCANNING" && (
        <div className="space-y-2">
          <p className="text-xs text-center text-blue-400 animate-pulse">Scanning Back of ID...</p>
          <div id="reader" className="rounded-lg overflow-hidden border-2 border-blue-500"></div>
        </div>
      )}

      {step === "BIOMETRIC" && (
        <div className="text-center space-y-4 py-10">
          <div className="animate-bounce text-4xl">☝️</div>
          <p className="font-bold">Confirm Identity</p>
          <p className="text-xs text-slate-400 text-center">Use TouchID or FaceID to lock this token to your device.</p>
        </div>
      )}

      {step === "SUCCESS" && (
        <div className="bg-green-500/10 border border-green-500 p-4 rounded-xl text-center">
          <p className="text-green-500 font-bold mb-2">Verified & Sealed</p>
          <p className="text-[10px] text-slate-400">Your age proof is now encrypted and locked to your biometrics. No personal data was saved.</p>
        </div>
      )}

      {error && <p className="mt-4 text-red-500 text-xs text-center">{error}</p>}
    </div>
  );
}

export default IndexPopup;
