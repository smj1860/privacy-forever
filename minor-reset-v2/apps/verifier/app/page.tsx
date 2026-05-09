"use client";
import { useState, useEffect } from "react";

export default function VerifierStore() {
  const [status, setStatus] = useState<"idle" | "verifying" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleVerify = () => {
    setStatus("verifying");
    
    // 1. Send request to the Minor-Reset Extension
    window.postMessage({ 
      type: "MINOR_RESET_VERIFY_REQUEST",
      nonce: Math.random().toString(36).substring(7) // Security nonce
    }, "*");
  };

  useEffect(() => {
    // 2. Listen for the response from the Extension Bridge
    const handleResponse = (event: MessageEvent) => {
      if (event.data.type === "MINOR_RESET_VERIFY_RESPONSE") {
        if (event.data.verified) {
          setStatus("success");
        } else {
          setStatus("error");
          setErrorMsg(event.data.error || "Verification failed or rejected.");
        }
      }
    };

    window.addEventListener("message", handleResponse);
    return () => window.removeEventListener("message", handleResponse);
  }, []);

  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6">
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl">
        <h1 className="text-3xl font-black mb-2 italic">VINTAGE REPUTATION</h1>
        <p className="text-slate-400 mb-8 text-sm">Premium Spirits & Tobacco. 18+ Only.</p>

        {status === "idle" && (
          <button 
            onClick={handleVerify}
            className="w-full bg-white text-black font-bold py-4 rounded-full hover:bg-blue-500 hover:text-white transition-all duration-300"
          >
            Verify Age to Enter
          </button>
        )}

        {status === "verifying" && (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-blue-400 font-mono text-xs animate-pulse">AWAITING BIOMETRIC PROOF...</p>
          </div>
        )}

        {status === "success" && (
          <div className="text-center bg-green-500/10 border border-green-500 p-6 rounded-2xl">
            <p className="text-green-500 font-bold text-xl mb-2">ACCESS GRANTED</p>
            <p className="text-xs text-slate-400">Your biometric proof was validated locally. Welcome to the store.</p>
            <button className="mt-4 text-xs underline opacity-50 hover:opacity-100">Continue to Shop</button>
          </div>
        )}

        {status === "error" && (
          <div className="text-center">
            <p className="text-red-500 font-bold mb-2">ACCESS DENIED</p>
            <p className="text-xs text-slate-500 mb-4">{errorMsg}</p>
            <button onClick={() => setStatus("idle")} className="text-sm text-blue-400 hover:underline">Try Again</button>
          </div>
        )}
      </div>
      
      <p className="mt-10 text-[10px] text-slate-600 uppercase tracking-widest">
        Powered by Minor-Reset Protocol
      </p>
    </main>
  );
}
