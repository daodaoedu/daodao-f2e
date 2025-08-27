/* eslint-disable @typescript-eslint/no-require-imports */
const {
  fixResponseReferences,
  fixSchemaReferences,
  fixCircularReferences,
} = require('./fixers');
const { limitSchemaDepth } = require('./schema');
const { deepClone } = require('./utils');

/**
 * 限制遞歸深度
 * @param {object} spec - OpenAPI 規範
 * @returns {object} 限制深度後的規範
 */
const limitRecursionDepth = (spec) => {
  console.log('🔧 限制 schema 遞歸深度...');

  const limitedSchemas = Object.entries(spec.components.schemas).reduce(
    (acc, [schemaName, schema]) => ({
      ...acc,
      [schemaName]: limitSchemaDepth(schema, 5, 0, [schemaName]),
    }),
    {}
  );

  console.log('✅ 已限制所有 schema 的遞歸深度');

  return {
    ...spec,
    components: {
      ...spec.components,
      schemas: limitedSchemas,
    },
  };
};

/**
 * 函數式風格的 Orval transformer
 * 使用函數組合和不可變數據處理
 * @param {object} openApiSpec - OpenAPI 規範
 * @returns {object} 轉換後的規範
 */
const transformer = (openApiSpec) => {
  console.log('🔧 開始修復 OpenAPI 規範中的循環引用和缺失定義...');

  // 深拷貝規範以保持不可變性
  const initialSpec = deepClone(openApiSpec);

  // 確保必要的結構存在
  const normalizedSpec = {
    ...initialSpec,
    components: {
      ...initialSpec.components,
      schemas: initialSpec.components?.schemas || {},
      responses: initialSpec.components?.responses || {},
    },
  };

  // 函數組合：依序執行所有修復步驟
  const transformationPipeline = [
    fixResponseReferences,
    fixSchemaReferences,
    fixCircularReferences,
    limitRecursionDepth,
  ];

  const result = transformationPipeline.reduce(
    (spec, transformFn) => transformFn(spec),
    normalizedSpec
  );

  console.log('✅ 已完成所有修復，應該能避免 Maximum call stack size exceeded');
  return result;
};

module.exports = transformer;
