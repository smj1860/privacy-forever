import { Storage } from "@plasmohq/storage";

const storage = new Storage();

export const sealTokenWithBiometrics = async (tokenData: any) => {
  // 1. Trigger Hardware Biometrics (Registration)
  // This prompts the user for a Fingerprint/Face scan
  const credential = await navigator.credentials.create({
    publicKey: {
      challenge: crypto.getRandomValues(new Uint8Array(32)),
      rp: { name: "Minor-Reset", id: window.location.hostname },
      user: {
        id: crypto.getRandomValues(new Uint8Array(16)),
        name: "local-user",
        displayName: "Identity Owner"
      },
      pubKeyCredParams: [{ alg: -7, type: "public-key" }], // ES256
      authenticatorSelection: { userVerification: "required" },
      timeout: 60000
    }
  });

  if (!credential) throw new Error("Biometric setup failed.");

  // 2. Encryption (AES-GCM)
  // In production, we'd derive a key from the WebAuthn PRF extension, 
  // but for this build, we use a session-bound key for local sealing.
  const encoder = new TextEncoder();
  const data = encoder.encode(JSON.stringify(tokenData));
  const key = await window.crypto.subtle.generateKey(
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt", "decrypt"]
  );

  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const encrypted = await window.crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    data
  );

  // 3. Store the Public Key ID and the Encrypted Token
  await storage.set("age_token_sealed", {
    payload: Buffer.from(encrypted).toString('hex'),
    iv: Buffer.from(iv).toString('hex'),
    credentialId: (credential as any).id
  });

  return true;
};
