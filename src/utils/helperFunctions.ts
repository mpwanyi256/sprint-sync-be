export const formatPemKey = (keyContent: string, keyType: string): string => {
  // Remove any existing PEM headers/footers and whitespace
  const cleanKey = keyContent
    .replace(/-----BEGIN.*?-----/g, '')
    .replace(/-----END.*?-----/g, '')
    .replace(/\s+/g, '');

  // Split into 64-character chunks and add newlines
  const chunks: string[] = [];
  for (let i = 0; i < cleanKey.length; i += 64) {
    chunks.push(cleanKey.slice(i, i + 64));
  }

  // Format as proper PEM
  return `-----BEGIN ${keyType}-----\n${chunks.join('\n')}\n-----END ${keyType}-----`;
};
