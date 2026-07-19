/**
 * physics 模組邊界（task 3.4 實作）
 *
 * 職責：three-mesh-bvh 貼地與碰撞（不上物理引擎，design D2）。
 * 過渡期可用 terrain/generate 的 sampleTerrainHeight 純函式貼地，
 * bvh 版負責建築/岩石等障礙物的擋牆。
 */

/** 地面取樣抽象：角色貼地與物件擺放共用 */
export interface IGroundSampler {
  heightAt(x: number, z: number): number;
}
