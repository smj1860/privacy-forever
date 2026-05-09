import { Storage } from "@plasmohq/storage"
import type { PlasmoCSConfig } from "plasmo"

// This tells Plasmo to run this script on all websites
export const config: PlasmoCSConfig = {
  matches: ["<all_urls>"]
}

const storage = new Storage()

// 1. Listen for the Web2 website's request
window.addEventListener("message", async (event) => {
  // Security check: ensure the message is from the website and not another extension
  if (event.data?.type === "MINOR_RESET_VERIFY_REQUEST") {
    console.log("Bridge: Received verification request from Web2 site");

    // 2. Forward the request to the Extension Background/Popup
    // This triggers the biometric prompt we built earlier
    chrome.runtime.sendMessage({ 
      action: "TRIGGER_BIOMETRIC_UNLOCK",
      nonce: event.data.nonce 
    }, (response) => {
      
      // 3. Send the secure result back to the Web2 website
      window.postMessage({
        type: "MINOR_RESET_VERIFY_RESPONSE",
        verified: response?.success || false,
        proof: response?.proof || null
      }, "*");
    });
  }
});
