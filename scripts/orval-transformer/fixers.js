/* eslint-disable @typescript-eslint/no-require-imports */
const {
  buildReferenceGraph,
  createRecursiveReferenceAlt,
  detectCircularReferences,
  findReferenceLocation,
  replaceReference,
} = require('./references');
const { levenshteinDistance } = require('./utils');

/**
 * 修復循環引用
 * @param {object} spec - OpenAPI 規範
 * @returns {object} 修復後的規範
 */
const fixCircularReferences = (spec) => {
  console.log('🔧 檢測並修復所有循環引用...');

  const graph = buildReferenceGraph(spec.components.schemas);
  const cycles = detectCircularReferences(graph);

  if (cycles.length === 0) {
    console.log('✅ 未檢測到循環引用');
    return spec;
  }

  console.log(`🛑 檢測到 ${cycles.length} 個循環引用:`, cycles);

  const processedCycles = new Set();

  const updatedSchemas = cycles.reduce((currentSchemas, cycle, index) => {
    const cycleKey = cycle.sort().join('->');
    if (processedCycles.has(cycleKey)) {
      return currentSchemas;
    }
    processedCycles.add(cycleKey);

    console.log(`🔧 修復循環 ${index + 1}: ${cycle.join(' -> ')}`);

    // 找到最佳斷點
    const findBestBreakPoint = (cycleToProcess) => {
      // 優先選擇陣列項目作為斷點
      for (let i = 0; i < cycleToProcess.length - 1; i += 1) {
        const currentSchema = cycleToProcess[i];
        const nextSchema = cycleToProcess[i + 1];

        const arrayBreakPoint = findReferenceLocation(
          currentSchemas[currentSchema],
          nextSchema,
          currentSchema
        );

        if (arrayBreakPoint && arrayBreakPoint.isArray) {
          return arrayBreakPoint;
        }
      }

      // 如果沒有陣列引用，選擇最後一個引用作為斷點
      const lastSchema = cycleToProcess[cycleToProcess.length - 2];
      const targetSchema = cycleToProcess[cycleToProcess.length - 1];

      return findReferenceLocation(
        currentSchemas[lastSchema],
        targetSchema,
        lastSchema
      );
    };

    const breakPoint = findBestBreakPoint(cycle);

    if (breakPoint) {
      console.log(
        `✅ 在 ${breakPoint.schema}.${breakPoint.property} 處打破循環引用`
      );
      return createRecursiveReferenceAlt(currentSchemas, breakPoint);
    }

    return currentSchemas;
  }, spec.components.schemas);

  return {
    ...spec,
    components: {
      ...spec.components,
      schemas: updatedSchemas,
    },
  };
};

/**
 * 查找缺失的引用
 * @param {object} spec - OpenAPI 規範
 * @param {string} componentType - 組件類型 ('schemas' 或 'responses')
 * @returns {object} 缺失引用的分析結果
 */
const findMissingReferences = (spec, componentType) => {
  const referencedItems = new Set();
  const existing = new Set(Object.keys(spec.components[componentType] || {}));
  const missing = [];

  const extractRefs = (obj, path = []) => {
    if (typeof obj !== 'object' || obj === null) return;

    if (Array.isArray(obj)) {
      obj.forEach((item, index) => extractRefs(item, [...path, index]));
      return;
    }

    if (obj.$ref && typeof obj.$ref === 'string') {
      const refPattern = new RegExp(`#/components/${componentType}/(.+)$`);
      const refMatch = obj.$ref.match(refPattern);
      if (refMatch) {
        const itemName = refMatch[1];
        referencedItems.add(itemName);
        if (!existing.has(itemName)) {
          missing.push({
            ref: obj.$ref,
            name: itemName,
            path: path.join('.'),
            fullPath: path,
          });
        }
      }
    }

    Object.entries(obj).forEach(([key, value]) => {
      extractRefs(value, [...path, key]);
    });
  };

  extractRefs(spec);

  return {
    missing,
    existing: Array.from(existing),
    referenced: Array.from(referencedItems),
  };
};

/**
 * 查找最相似的響應
 * @param {string} targetName - 目標名稱
 * @param {string[]} existingResponses - 現有響應列表
 * @returns {string|null} 最相似的響應名稱
 */
const findSimilarResponse = (targetName, existingResponses) => {
  const target = targetName.toLowerCase();

  // 完全匹配
  const exactMatch = existingResponses.find(
    (name) => name.toLowerCase() === target
  );
  if (exactMatch) return exactMatch;

  // 部分匹配
  const partialMatch = existingResponses.find((name) => {
    const existing = name.toLowerCase();
    return (
      existing.includes(target) ||
      target.includes(existing.replace('error', ''))
    );
  });
  if (partialMatch) return partialMatch;

  // 相似度匹配
  const similarities = existingResponses
    .map((name) => ({
      name,
      distance: levenshteinDistance(target, name.toLowerCase()),
    }))
    .filter(({ distance }) => distance <= 3)
    .sort((a, b) => a.distance - b.distance);

  return similarities.length > 0 ? similarities[0].name : null;
};

/**
 * 修復響應引用
 * @param {object} spec - OpenAPI 規範
 * @returns {object} 修復後的規範
 */
const fixResponseReferences = (spec) => {
  console.log('🔧 檢查並修復缺失的 responses 引用...');

  const { missing, existing } = findMissingReferences(spec, 'responses');

  if (missing.length === 0) {
    console.log('✅ 所有 responses 引用都正確');
    return spec;
  }

  console.log(
    `🛑 發現 ${missing.length} 個缺失的 responses 引用:`,
    missing.map((m) => m.name)
  );

  return missing.reduce((currentSpec, missingRef) => {
    const { name, ref } = missingRef;
    const similarResponse = findSimilarResponse(name, existing);

    if (similarResponse) {
      console.log(`🔧 將 ${name} 映射到 ${similarResponse}`);
      return replaceReference(
        currentSpec,
        ref,
        `#/components/responses/${similarResponse}`
      );
    }
    console.log(`🔧 為 ${name} 創建基本 response 定義`);

    const newResponse = {
      description: `自動生成的 ${name} 響應（原本缺失）`,
      content: {
        'application/json': {
          schema: {
            $ref: '#/components/schemas/ErrorResponse',
          },
        },
      },
    };

    return {
      ...currentSpec,
      components: {
        ...currentSpec.components,
        responses: {
          ...currentSpec.components.responses,
          [name]: newResponse,
        },
      },
    };
  }, spec);
};

/**
 * 修復 Schema 引用
 * @param {object} spec - OpenAPI 規範
 * @returns {object} 修復後的規範
 */
const fixSchemaReferences = (spec) => {
  console.log('🔧 修復缺失的 schema 定義...');

  const { missing } = findMissingReferences(spec, 'schemas');
  const missingSchemaNames = missing.map((m) => m.name);

  if (missingSchemaNames.length === 0) {
    console.log('✅ 所有 schema 引用都正確');
    return spec;
  }

  console.log(
    `🛑 發現 ${missingSchemaNames.length} 個缺失的 schema 引用:`,
    missingSchemaNames
  );

  const newSchemas = missingSchemaNames.reduce(
    (acc, schemaName) => ({
      ...acc,
      [schemaName]: {
        type: 'object',
        description: `自動生成的 ${schemaName} schema（原本缺失）`,
        additionalProperties: true,
      },
    }),
    {}
  );

  console.log(`✅ 添加了 ${missingSchemaNames.length} 個缺失的 schema 定義`);

  return {
    ...spec,
    components: {
      ...spec.components,
      schemas: {
        ...spec.components.schemas,
        ...newSchemas,
      },
    },
  };
};

module.exports = {
  fixCircularReferences,
  findMissingReferences,
  findSimilarResponse,
  fixResponseReferences,
  fixSchemaReferences,
};
