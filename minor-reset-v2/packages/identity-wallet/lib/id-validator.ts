import { parse } from "aamva-parser";

export interface AgeToken {
  isOver18: boolean;
  isOver21: boolean;
  idExpiry: string;
  verifiedAt: string;
  tokenType: "PHYSICAL_ID_SCAN";
}

export const processBarcode = (rawStr: string): AgeToken => {
  const result = parse(rawStr);
  
  // Element IDs from AAMVA Standard: DBB = DOB, DBA = Expiry
  const dobStr = result.dateOfBirth; 
  const expiryStr = result.expirationDate;

  const today = new Date();
  const birthDate = new Date(dobStr);
  const expiryDate = new Date(expiryStr);

  // 1. Check if ID is expired
  if (expiryDate < today) {
    throw new Error("Physical ID has expired.");
  }

  // 2. Calculate Age
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  if (age < 18) {
    throw new Error("User is under 18.");
  }

  // 3. Return ONLY the token (No Name, No Address)
  return {
    isOver18: true,
    isOver21: age >= 21,
    idExpiry: expiryStr,
    verifiedAt: new Date().toISOString(),
    tokenType: "PHYSICAL_ID_SCAN"
  };
};