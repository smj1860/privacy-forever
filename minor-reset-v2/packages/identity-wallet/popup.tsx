import { useState, useEffect } from "react";
import { Storage } from "@plasmohq/storage";
import { Html5QrcodeScanner } from "html5-qrcode";
import { processBarcode, type AgeToken } from "./lib/id-validator";
import "~style.css";

function IndexPopup() {
  const [token, setToken] = useState<AgeToken | null>(null);
  const [error, setError] = useState("");
  const storage = new Storage();

  useEffect(() => {
    storage.get<AgeToken>("age_token").then(setToken);
  }, []);

  const startScanner = () => {
    const scanner = new Html5QrcodeScanner("reader", { 
      fps: 10, 
      qrbox: { width: 250, height: 150 },
      formatsToSupport: [0] // 0 is PDF417
    }, false);

    scanner.render(async (text) => {
      try {
        const newToken = processBarcode(text);
        await storage.set("age_token", newToken);
        setToken(newToken);
        scanner.clear();
      } catch (err: any) {
        setError(err.message);
      }
    }, (err) => {});
  };

  return (
    <div className="w-80 p-4 bg-slate-900 text-white min-h-[400px]">
      <h1 className="text-xl font-bold border-b border-slate-700 pb-2 mb-4">Minor-Reset</h1>

      {!token ? (
        <div className="space-y-4 text-center">
          <p className="text-sm text-slate-400">No active age token found.</p>
          <div id="reader" className="overflow-hidden rounded-lg bg-black"></div>
          <button 
            onClick={startScanner}
            className="w-full bg-blue-600 hover:bg-blue-500 py-2 rounded-lg font-semibold transition"
          >
            Scan Back of ID
          </button>
          {error && <p className="text-red-400 text-xs">{error}</p>}
        </div>
      ) : (
        <div className="bg-slate-800 p-4 rounded-xl border border-green-500/50">
          <div className="flex justify-between items-center mb-4">
            <span className="text-green-400 font-bold uppercase text-xs tracking-widest">Verified</span>
            <span className="text-[10px] text-slate-500">Local Proof</span>
          </div>
          <div className="text-center mb-4">
            <p className="text-3xl font-bold">18+</p>
            <p className="text-xs text-slate-400">Status: Access Allowed</p>
          </div>
          <div className="text-[10px] space-y-1 text-slate-500 border-t border-slate-700 pt-3">
            <p>ID Expiry: {token.idExpiry}</p>
            <p>Token Issued: {new Date(token.verifiedAt).toLocaleDateString()}</p>
          </div>
          <button 
            onClick={() => { storage.remove("age_token"); setToken(null); }}
            className="mt-6 w-full text-xs text-slate-500 hover:text-white underline"
          >
            Revoke & Wipe Token
          </button>
        </div>
      )}
    </div>
  );
}

export default IndexPopup;