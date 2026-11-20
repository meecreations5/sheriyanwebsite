// Normalize Firestore SDK values before crossing Next.js Server -> Client boundaries.
// Firestore Timestamp, DocumentReference, GeoPoint, Bytes and Date are not plain props.
// Preserve editable content but return only JSON-compatible primitives, arrays and objects.
export function toPlainClientData(value) {
  const visiting = new WeakSet();
  function normalize(item) {
    if (item == null || ['string', 'number', 'boolean'].includes(typeof item)) return item;
    if (typeof item === 'bigint') return String(item);
    if (typeof item === 'undefined') return null;
    if (typeof item !== 'object') return null;
    if (visiting.has(item)) throw new TypeError('Cyclic CMS data cannot be passed to the client');
    visiting.add(item);
    try {
      if (item instanceof Date) return item.toISOString();
      // Firebase Timestamp: convert before calling its toJSON() method.
      if (typeof item.toDate === 'function' && typeof item.seconds === 'number') {
        const date = item.toDate();
        return date instanceof Date ? date.toISOString() : normalize(date);
      }
      // Firebase document references have SDK internals and must not be sent to browsers.
      if (typeof item.path === 'string' && item.firestore && typeof item.id === 'string') return item.path;
      // Firestore GeoPoint: flatten its public coordinates.
      if (typeof item.latitude === 'number' && typeof item.longitude === 'number') {
        return { latitude: item.latitude, longitude: item.longitude };
      }
      if (item instanceof Uint8Array) return Array.from(item);
      if (Array.isArray(item)) return item.map(normalize);
      if (item instanceof Map) return Object.fromEntries([...item].map(([key,val]) => [String(key),normalize(val)]));
      if (item instanceof Set) return [...item].map(normalize);
      // Other SDK value objects can provide JSON equivalents; recurse to remove nested classes.
      if (typeof item.toJSON === 'function') {
        const json = item.toJSON();
        if (json !== item) return normalize(json);
      }
      return Object.fromEntries(Object.entries(item).map(([key,val]) => [key,normalize(val)]));
    } finally { visiting.delete(item); }
  }
  return normalize(value);
}
