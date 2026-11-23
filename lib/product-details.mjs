// Optional product-copy fields. Used by both CMS writes and public rendering.
// Blank rows are discarded so they never create empty headings on the website.
const shortText = (value, max) => String(value ?? '').trim().slice(0, max).trim();

function entries(value) {
  if (!Array.isArray(value)) return [];
  return value.slice(0, 12).filter(row => row && typeof row === 'object' && !Array.isArray(row))
    .map(row => ({
      garment: shortText(row.garment, 140),
      description: shortText(row.description, 2500),
    }))
    .filter(row => row.garment || row.description);
}

export function normalizeProductDetails(value) {
  const input = value && typeof value === 'object' && !Array.isArray(value) ? value : {};
  const occasions = Array.isArray(input.occasions) ? input.occasions.slice(0, 30) : [];
  return {
    fabric: entries(input.fabric),
    design: entries(input.design),
    embroidery: shortText(input.embroidery, 5000),
    occasions: [...new Set(occasions.map(value => shortText(value, 160)).filter(Boolean))].slice(0, 20),
  };
}
