/* eslint-disable @typescript-eslint/no-require-imports */
const { createSimplifiedSchema } = require('./schema');
const { setPath } = require('./utils');

/**
 * 提取物件中的所有引用
 * @param {*} obj - 要分析的物件
 * @param {Set} visited - 已訪問的物件 (避免無限遞歸)
 * @returns {string[]} 引用列表
 */
const extractReferences = (obj, visited = new Set()) => {
  if (typeof obj !== 'object' || obj === null || visited.has(obj)) {
    return [];
  }

  visited.add(obj);

  if (Array.isArray(obj)) {
    return obj.flatMap((item) => extractReferences(item, visited));
  }

  // 檢查 $ref
  const directRefs =
    obj.$ref && typeof obj.$ref === 'string'
      ? (() => {
          const refMatch = obj.$ref.match(/#\/components\/schemas\/(.+)$/);
          return refMatch ? [refMatch[1]] : [];
        })()
      : [];

  // 遞歸檢查所有屬性
  const nestedRefs = Object.values(obj).flatMap((value) =>
    extractReferences(value, visited)
  );

  return [...directRefs, ...nestedRefs];
};

/**
 * 建立引用圖
 * @param {object} schemas - 所有 schemas
 * @returns {Map} 引用圖
 */
const buildReferenceGraph = (schemas) => {
  const graph = new Map();

  // 初始化所有節點
  Object.keys(schemas).forEach((schemaName) => {
    graph.set(schemaName, new Set());
  });

  // 建立引用關係
  Object.entries(schemas).forEach(([schemaName, schema]) => {
    const references = extractReferences(schema);
    const validReferences = references.filter((ref) => schemas[ref]);

    validReferences.forEach((ref) => {
      if (graph.has(schemaName)) {
        graph.get(schemaName).add(ref);
      }
    });
  });

  return graph;
};

/**
 * 使用 DFS 檢測循環引用
 * @param {Map} graph - 引用圖
 * @returns {string[][]} 循環列表
 */
const detectCircularReferences = (graph) => {
  const visited = new Set();
  const recursionStack = new Set();
  const cycles = [];

  const dfs = (node, path = []) => {
    if (recursionStack.has(node)) {
      // 找到循環
      const cycleStart = path.indexOf(node);
      const cycle = path.slice(cycleStart).concat([node]);
      cycles.push(cycle);
      return true;
    }

    if (visited.has(node)) {
      return false;
    }

    visited.add(node);
    recursionStack.add(node);

    const neighbors = graph.get(node) || new Set();
    neighbors.forEach((neighbor) => {
      dfs(neighbor, [...path, node]);
    });

    recursionStack.delete(node);
    return false;
  };

  // 檢查所有節點
  Array.from(graph.keys()).forEach((node) => {
    if (!visited.has(node)) {
      dfs(node);
    }
  });

  return cycles;
};

/**
 * 查找引用位置
 * @param {object} schema - 要搜索的 schema
 * @param {string} targetSchema - 目標 schema 名稱
 * @param {string} schemaName - 當前 schema 名稱
 * @returns {object|null} 引用信息
 */
const findReferenceLocation = (schema, targetSchema, schemaName) => {
  const searchInObject = (obj, path = []) => {
    if (typeof obj !== 'object' || obj === null) return null;

    if (Array.isArray(obj)) {
      for (let i = 0; i < obj.length; i += 1) {
        const result = searchInObject(obj[i], [...path, i]);
        if (result) return result;
      }
      return null;
    }

    // 檢查陣列項目引用
    if (obj.type === 'array' && obj.items && obj.items.$ref) {
      const refMatch = obj.items.$ref.match(/#\/components\/schemas\/(.+)$/);
      if (refMatch && refMatch[1] === targetSchema) {
        return {
          schema: schemaName,
          property: path.join('.'),
          targetSchema,
          isArray: true,
        };
      }
    }

    // 檢查直接引用
    if (obj.$ref) {
      const refMatch = obj.$ref.match(/#\/components\/schemas\/(.+)$/);
      if (refMatch && refMatch[1] === targetSchema) {
        return {
          schema: schemaName,
          property: path.join('.'),
          targetSchema,
          isArray: false,
        };
      }
    }

    // 遞歸搜尋
    const entries = Object.entries(obj);
    for (let i = 0; i < entries.length; i += 1) {
      const [key, value] = entries[i];
      const result = searchInObject(value, [...path, key]);
      if (result) return result;
    }

    return null;
  };

  return searchInObject(schema);
};

/**
 * 創建遞迴引用的替代方案
 * @param {object} schemas - 所有 schemas
 * @param {object} breakPoint - 斷點信息
 * @returns {object} 更新後的 schemas
 */
const createRecursiveReferenceAlt = (schemas, breakPoint) => {
  const { schema: schemaName, property, targetSchema } = breakPoint;
  const schema = schemas[schemaName];

  if (!schema) return schemas;

  const targetSchemaObj = schemas[targetSchema];
  const simplifiedSchema = createSimplifiedSchema(
    targetSchemaObj,
    targetSchema
  );

  // 使用不可變的方式更新
  return {
    ...schemas,
    [schemaName]: setPath(schema, property, simplifiedSchema),
  };
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

module.exports = {
  extractReferences,
  buildReferenceGraph,
  detectCircularReferences,
  findReferenceLocation,
  createRecursiveReferenceAlt,
  replaceReference,
};
