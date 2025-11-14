const isObject = (obj: unknown): obj is Record<string, unknown> =>
  typeof obj === 'object' && obj !== null;

export const isMatch = (object: unknown, source: unknown): boolean => {
  // For primitives or strict equality
  if (object === source) return true;

  // Special cases for null or different types
  if (!isObject(object) || !isObject(source)) return false;

  // Arrays
  // Source [] matches any array
  if (Array.isArray(source)) {
    if (source.length === 0) {
      return Array.isArray(object);
    }
    if (!Array.isArray(object) || object.length < source.length) return false;
    // Only check if entries in source are matched in object, deep
    // Must check each source index against the corresponding object index
    return source.every((srcVal, i) => isMatch(object[i], srcVal));
  }

  // Empty object: matches any object (including arrays)
  if (
    Object.prototype.toString.call(source) === '[object Object]' &&
    Object.keys(source).length === 0
  ) {
    return isObject(object);
  }

  // Actual object source: each key in source must exist and match in object
  return Object.keys(source).every((key) => isMatch(object[key], source[key]));
};
