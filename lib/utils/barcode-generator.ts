// Simple auto-generate 13-digit barcode
export function generateBarcode(): string {
  // Start with store code (3 digits)
  const storeCode = '001';
  
  // Add timestamp (6 digits - last 6 of timestamp)
  const timestamp = Date.now().toString().slice(-6);
  
  // Add random number (4 digits)
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  
  const barcode = storeCode + timestamp + random;
  
  // Ensure it's exactly 13 digits
  return barcode.padEnd(13, '0').slice(0, 13);
}

// Validate barcode (just check length for now)
export function isValidBarcode(barcode: string): boolean {
  return barcode.length === 13 && /^\d+$/.test(barcode);
}