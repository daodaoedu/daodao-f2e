/**
 * 深度複製物件
 * @param {*} obj - 要複製的物件
 * @returns {*} 深度複製後的物件
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

/**
 * 替換引用
 * @param {*} obj - 要處理的物件
 * @param {string} oldRef - 舊引用
 * @param {string} newRef - 新引用
 * @returns {*} 更新後的物件
 */
const replaceReference = (obj, oldRef, newRef) => {
  if (typeof obj !== 'object' || obj === null) return obj;

  if (Array.isArray(obj)) {
    return obj.map((item) => replaceReference(item, oldRef, newRef));
  }

  return Object.entries(obj).reduce((acc, [key, value]) => {
    if (key === '$ref' && value === oldRef) {
      return { ...acc, [key]: newRef };
    }
    if (typeof value === 'object') {
      return { ...acc, [key]: replaceReference(value, oldRef, newRef) };
    }
    return { ...acc, [key]: value };
  }, {});
};

module.exports = { deepClone, levenshteinDistance, replaceReference };
