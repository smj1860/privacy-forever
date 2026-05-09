export {}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "TRIGGER_BIOMETRIC_UNLOCK") {
    // Open the popup or a separate tab to handle the biometric scan
    // For this build, we will alert the user or open the extension UI
    chrome.windows.create({
      url: "popup.html",
      type: "popup",
      width: 400,
      height: 600
    });

    // In a real production environment, you would use a listener 
    // to wait for the popup to finish and then sendResponse.
    // For now, we return true to keep the message channel open.
    return true;
  }
});
