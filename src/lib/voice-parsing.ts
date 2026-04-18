/**
 * Parse voice label to extract name and region separately
 * Example: "Ban Mai (Nữ miền Bắc)" => { name: "Ban Mai", region: "Nữ miền Bắc" }
 */
export function parseVoiceLabel(label: string): { name: string; region: string } {
  const match = label.match(/^([^(]+)\s*\(([^)]+)\)$/);
  if (match) {
    return {
      name: match[1].trim(),
      region: match[2].trim(),
    };
  }
  return {
    name: label,
    region: "",
  };
}
