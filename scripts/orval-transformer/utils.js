/**
 * 深度克隆物件 (避免變異原始數據)
 * @param {*} obj - 要克隆的物件
 * @returns {*} 深度克隆後的物件
 */
const deepClone = (obj) => {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj.getTime());
  if (obj instanceof Array) return obj.map((item) => deepClone(item));
  if (typeof obj === 'object') {
    return Object.keys(obj).reduce(
      (acc, key) => ({
        ...acc,
        [key]: deepClone(obj[key]),
      }),
      {}
    );
  }
  return obj;
};

/**
 * 安全的物件路徑設置
 * @param {object} obj - 目標物件
 * @param {string} path - 路徑字符串
 * @param {*} value - 要設置的值
 * @returns {object} 新的物件
 */
const setPath = (obj, path, value) => {
  if (!obj || typeof obj !== 'object') return obj;

  const keys = path.split('.').filter(Boolean);
  if (keys.length === 0) return obj;

  const [head, ...rest] = keys;

  if (rest.length === 0) {
    return { ...obj, [head]: value };
  }

  return {
    ...obj,
    [head]: setPath(obj[head] || {}, rest.join('.'), value),
  };
};

/**
 * 計算編輯距離
 * @param {string} str1 - 第一個字符串
 * @param {string} str2 - 第二個字符串
 * @returns {number} 編輯距離
 */
const levenshteinDistance = (str1, str2) => {
  const memoize = new Map();

  const calculateDistance = (i, j) => {
    const key = `${i},${j}`;
    if (memoize.has(key)) return memoize.get(key);

    if (i === 0) return j;
    if (j === 0) return i;

    const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
    const result = Math.min(
      calculateDistance(i - 1, j) + 1, // deletion
      calculateDistance(i, j - 1) + 1, // insertion
      calculateDistance(i - 1, j - 1) + cost // substitution
    );

    memoize.set(key, result);
    return result;
  };

  return calculateDistance(str1.length, str2.length);
};

module.exports = { deepClone, setPath, levenshteinDistance };
