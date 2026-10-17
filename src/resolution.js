// Export sampling is a physical choice, never a screen-size or memory fallback.
export const MIB = 1024 * 1024;
export const DEFAULT_DETAIL = 0.2;

export function gridCounts(cols, rows) {
  if (!Number.isSafeInteger(cols) || !Number.isSafeInteger(rows) || cols < 2 || rows < 2) {
    throw Error('Invalid image grid.');
  }
  const samples = cols * rows;
  const boundary = 2 * (cols - 1) + 2 * (rows - 1);
  const vertices = samples + boundary + 1;
  const triangles = 2 * (cols - 1) * (rows - 1) + 3 * boundary;
  if (!Number.isSafeInteger(triangles) || vertices > 0xffffffff || triangles * 3 > 0xffffffff) {
    throw Error('The requested grid is too large to represent. Choose smaller dimensions or a different spacing; quality has not been changed.');
  }
  return { samples, boundary, vertices, triangles };
}

export function planSampling(width, height, detail) {
  if (![width, height, detail].every(Number.isFinite) || width <= 0 || height <= 0 || detail <= 0) {
    throw Error('Choose positive, finite panel dimensions and mesh spacing.');
  }
  // Round only floating-point noise near an integer, never remove a real interval.
  const intervals = length => {
    const count = length / detail;
    return Math.max(1, Math.abs(count - Math.round(count)) < 1e-9 ? Math.round(count) : Math.ceil(count));
  };
  const cols = intervals(width) + 1, rows = intervals(height) + 1;
  const counts = gridCounts(cols, rows);
  return { width, height, detail, cols, rows, spacingX: width / (cols - 1), spacingY: height / (rows - 1), ...counts };
}

export function memoryBudget(deviceMemory) {
  // A conservative working budget, not a measurement of currently free RAM.
  return (Number.isFinite(deviceMemory) && deviceMemory > 0 ? Math.min(768, deviceMemory * 96) : 768) * MIB;
}

export function exportEstimate(panel, format, sourcePixels = 0) {
  if (!['stl', '3mf'].includes(format)) throw Error('Unsupported export format.');
  const counts = gridCounts(panel.cols, panel.rows);
  const stlBytes = 84 + counts.triangles * 50;
  // 3MF uses six decimal places (one nanometre) and chunked stored ZIP entries.
  // Allow ample space per XML element, ZIP records and metadata.
  const outputBytes = format === 'stl' ? stlBytes : counts.vertices * 80 + counts.triangles * 72 + 4096;
  const meshBytes = counts.vertices * 12 + counts.triangles * 12;
  const samplingBytes = counts.samples * 12; // canvas, RGBA and Float32 tones
  const workingBytes = meshBytes + samplingBytes + sourcePixels * 8 + outputBytes * 2 + 32 * MIB;
  return { ...counts, stlBytes, outputBytes, workingBytes };
}

export function assertExportBudget(panel, format, budget, sourcePixels = 0) {
  const estimate = exportEstimate(panel, format, sourcePixels);
  if (!Number.isFinite(budget) || budget <= 0 || estimate.workingBytes > budget || estimate.outputBytes >= 0xffffffff) {
    throw Error(`This ${format.toUpperCase()} needs an estimated ${Math.ceil(estimate.workingBytes / MIB)} MiB of working memory; this browser's export budget is ${Math.floor(budget / MIB)} MiB. The requested ${panel.cols} × ${panel.rows} samples have not been reduced. Try a device with more memory, a smaller panel, or deliberately select a wider spacing.`);
  }
  return estimate;
}

export function previewSize(width, height, ratio, dpr = 1) {
  if (![width, height, ratio, dpr].every(Number.isFinite) || Math.min(width, height, ratio, dpr) <= 0) {
    throw Error('The preview area is not ready.');
  }
  const cssWidth = Math.min(width, height * ratio), cssHeight = cssWidth / ratio;
  return { cssWidth, cssHeight, width: Math.max(1, Math.ceil(cssWidth * dpr)), height: Math.max(1, Math.ceil(cssHeight * dpr)) };
}
