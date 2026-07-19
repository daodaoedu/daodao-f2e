/**
 * @daodao/features-island-engine
 * 3D 島嶼引擎——純 three.js、零 React 依賴（openspec change: island-3d）
 */

export {
  buildFallbackObject,
  createAssetLoader,
  type IAssetLoader,
  type IAssetLoaderOptions,
} from "./assets/loader";
export {
  FallbackShape,
  type FallbackShapeType,
  getManifestEntry,
  type IAssetManifestEntry,
  ISLAND_ASSET_MANIFEST,
  ISLAND_ASSETS,
  type IslandAssetKeyType,
} from "./assets/manifest";
export {
  CharacterController,
  computeWorldMove,
  createKeyboardMouseInput,
  createTouchInput,
  type ICharacterControllerOptions,
  type IControlInputState,
  type IInputSource,
} from "./controls";
export { computeThirdPersonCameraPose } from "./controls/character-controller";
export { IslandEngine, type IUpdatable } from "./core/engine";
export { AerialIntro, type IAerialIntroOptions } from "./core/intro";
export {
  createFpsSampler,
  degradeTier,
  detectInitialQuality,
  QUALITY_PROFILES,
  QualityTier,
  type QualityTierType,
} from "./core/quality";
export { createRandom, hashSeed } from "./core/random";
export {
  BuildingKind,
  type BuildingKindType,
  type IBuildingSpec,
  mapPracticeToBuilding,
} from "./entities";
export {
  createBuilding,
  createBuildings,
  createCampfireFlicker,
  findNearestBuilding,
  type IBuiltBuilding,
  INTERACT_RADIUS,
} from "./entities/buildings";
export { createCharacterAvatar, type ICharacterAvatar } from "./entities/character";
export {
  AMBIENT_CRITTER_COUNTS,
  computeBuildingPlacements,
  computeEcosystemLevel,
  computePlantPlacements,
  type IBuildingPlacement,
  type IPlantPlacement,
  PLANT_SPECIES_COUNT,
} from "./entities/layout";
export { createAmbientCritters, createPlantsGroup } from "./entities/plants";
export type { IGroundSampler } from "./physics";
export {
  createBvhGroundSampler,
  type IBvhGroundSampler,
  type IRadialCollider,
  installBvh,
  resolveRadialCollisions,
} from "./physics/ground";
export {
  generateTerrain,
  type IGenerateTerrainOptions,
  type ITerrainData,
  sampleTerrainHeight,
  terrainHeightAt,
} from "./terrain/generate";
export { buildTerrainMeshes, type ITerrainMeshes } from "./terrain/terrain";
export {
  getTerrainTheme,
  type ITerrainTheme,
  NEUTRAL_THEME,
  TERRAIN_THEMES,
} from "./terrain/themes";
export * from "./types";
