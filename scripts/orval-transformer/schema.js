/**
 * 限制 schema 遞歸深度
 * @param {object} schema - 原始 schema
 * @param {number} maxDepth - 最大深度
 * @param {number} currentDepth - 當前深度
 * @param {string[]} visitedRefs - 已訪問的引用
 * @returns {object} 限制深度後的 schema
 */
const limitSchemaDepth = (
  schema,
  maxDepth = 2,
  currentDepth = 0,
  visitedRefs = []
) => {
  if (currentDepth > maxDepth) {
    return {
      type: 'object',
      description: `簡化的物件（原深度: ${currentDepth}）`,
      additionalProperties: true,
    };
  }

  if (typeof schema !== 'object' || schema === null) {
    return schema;
  }

  if (Array.isArray(schema)) {
    return schema.map((item) =>
      limitSchemaDepth(item, maxDepth, currentDepth + 1, visitedRefs)
    );
  }

  // 處理 $ref
  if (schema.$ref) {
    const refMatch = schema.$ref.match(/#\/components\/schemas\/(.+)$/);
    if (refMatch) {
      const refName = refMatch[1];

      // 檢查循環引用
      if (visitedRefs.includes(refName)) {
        return {
          type: 'object',
          description: `打破循環引用（原引用: ${refName}）`,
          additionalProperties: true,
        };
      }

      // 檢查深度限制
      if (currentDepth >= maxDepth - 1) {
        return {
          type: 'object',
          description: `簡化的引用（原引用: ${refName}）`,
          additionalProperties: true,
        };
      }
    }

    return schema; // 保持引用
  }

  // 處理物件的各個屬性
  const processSchemaProperty = (key, value) => {
    const newVisitedRefs = [...visitedRefs];

    switch (key) {
      case 'properties':
        if (typeof value === 'object' && value !== null) {
          return Object.entries(value).reduce(
            (acc, [propKey, propValue]) => ({
              ...acc,
              [propKey]: limitSchemaDepth(
                propValue,
                maxDepth,
                currentDepth + 1,
                [...newVisitedRefs, propKey]
              ),
            }),
            {}
          );
        }
        return value;

      case 'items':
        return limitSchemaDepth(value, maxDepth, currentDepth + 1, [
          ...newVisitedRefs,
          'items',
        ]);

      case 'allOf':
      case 'oneOf':
      case 'anyOf':
        if (Array.isArray(value)) {
          return value.map((item, index) =>
            limitSchemaDepth(item, maxDepth, currentDepth + 1, [
              ...newVisitedRefs,
              `${key}[${index}]`,
            ])
          );
        }
        return value;

      default:
        if (typeof value === 'object' && value !== null) {
          return limitSchemaDepth(value, maxDepth, currentDepth + 1, [
            ...newVisitedRefs,
            key,
          ]);
        }
        return value;
    }
  };

  return Object.entries(schema).reduce(
    (acc, [key, value]) => ({
      ...acc,
      [key]: processSchemaProperty(key, value),
    }),
    {}
  );
};

/**
 * 創建簡化的 schema
 * @param {object} originalSchema - 原始 schema
 * @param {string} schemaName - schema 名稱
 * @returns {object} 簡化後的 schema
 */
const createSimplifiedSchema = (originalSchema, schemaName) => {
  if (!originalSchema || typeof originalSchema !== 'object') {
    return {
      type: 'object',
      description: `遞迴引用到 ${schemaName}（已簡化）`,
      additionalProperties: true,
    };
  }

  const simplified = {
    type: originalSchema.type || 'object',
    description: `遞迴引用到 ${schemaName}（已簡化以避免循環引用）`,
  };

  // 保留基本屬性的純函數處理
  const filterBasicProperties = (properties) => {
    if (!properties || typeof properties !== 'object') return {};

    return Object.entries(properties)
      .filter(
        ([, prop]) =>
          prop && typeof prop === 'object' && !prop.$ref && !prop.items
      )
      .reduce((acc, [key, prop]) => {
        if (['string', 'number', 'integer', 'boolean'].includes(prop.type)) {
          return { ...acc, [key]: { ...prop } };
        }
        if (prop.type === 'object' && !prop.properties) {
          return {
            ...acc,
            [key]: {
              type: 'object',
              description: prop.description || `${key} 物件`,
              additionalProperties: true,
            },
          };
        }
        return acc;
      }, {});
  };

  const basicProperties = filterBasicProperties(originalSchema.properties);

  if (Object.keys(basicProperties).length > 0) {
    simplified.properties = basicProperties;
  } else {
    simplified.additionalProperties = true;
  }

  return simplified;
};

module.exports = { limitSchemaDepth, createSimplifiedSchema };
