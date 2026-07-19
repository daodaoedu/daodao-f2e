/**
 * IslandEngine：純 three.js 核心（零 React 依賴）
 *
 * 邊界鐵律（design D1）：React 不碰場景物件；engine 不 render DOM
 * （唯一例外：行動裝置虛擬搖杆這類貼著 canvas 的輸入配件）；
 * 溝通僅 islandData 初始化 ＋ 事件 callback。
 *
 * 模組骨架：core / terrain / entities / controls / physics / assets。
 */

import {
  AmbientLight,
  Clock,
  Color,
  DirectionalLight,
  Fog,
  PerspectiveCamera,
  Raycaster,
  Scene,
  Vector2,
  WebGLRenderer,
} from "three";
import { createAssetLoader, type IAssetLoader } from "../assets/loader";
import { createKeyboardMouseInput, createTouchInput, type IInputSource } from "../controls";
import {
  CharacterController,
  computeThirdPersonCameraPose,
} from "../controls/character-controller";
import { createBuilding, createCampfireFlicker, findNearestBuilding } from "../entities/buildings";
import { createCharacterAvatar } from "../entities/character";
import {
  computeBuildingPlacements,
  computePlantPlacements,
  type IBuildingPlacement,
  type IPlantPlacement,
} from "../entities/layout";
import { createAmbientCritters, createPlantsGroup } from "../entities/plants";
import type { IRadialCollider } from "../physics/ground";
import { createBvhGroundSampler, type IBvhGroundSampler } from "../physics/ground";
import { generateTerrain, type ITerrainData } from "../terrain/generate";
import { buildTerrainMeshes, type ITerrainMeshes } from "../terrain/terrain";
import type { IIslandData, IIslandEngineOptions } from "../types";
import { AerialIntro } from "./intro";
import {
  createFpsSampler,
  detectInitialQuality,
  QUALITY_PROFILES,
  type QualityTierType,
} from "./quality";

/** 每幀更新的子系統介面（controls、entities 動畫等掛進 update loop） */
export interface IUpdatable {
  update(deltaSeconds: number, elapsedSeconds: number): void;
}

/** 點擊判定：位移小於此值才算 click/tap（px） */
const CLICK_MOVE_THRESHOLD = 8;

export class IslandEngine {
  readonly islandData: IIslandData;
  readonly terrainData: ITerrainData;

  private readonly container: HTMLElement;
  private readonly events: IIslandEngineOptions["events"];
  private readonly scene: Scene;
  private readonly camera: PerspectiveCamera;
  private renderer: WebGLRenderer;
  private readonly clock = new Clock();
  private readonly fpsSampler = createFpsSampler();
  private readonly updatables: IUpdatable[] = [];
  private readonly terrainMeshes: ITerrainMeshes;
  private readonly assetLoader: IAssetLoader;
  private readonly groundSampler: IBvhGroundSampler;
  private readonly buildingPlacements: IBuildingPlacement[];
  private readonly raycaster = new Raycaster();
  private readonly pointerNdc = new Vector2();
  private readonly clickables = new Map<import("three").Object3D, string>();
  private readonly colliders: IRadialCollider[] = [];
  private readonly campfires: import("three").PointLight[] = [];
  private intro: AerialIntro | null = null;
  private inputSource: IInputSource | null = null;
  private resizeObserver: ResizeObserver | null = null;
  private animationFrameId: number | null = null;
  private quality: QualityTierType;
  private disposed = false;
  private firstFrameRendered = false;
  private pointerDownAt: { x: number; y: number } | null = null;
  private readonly constructedAt = performance.now();
  private walkableAt: number | null = null;

  constructor(options: IIslandEngineOptions) {
    this.container = options.container;
    this.islandData = options.islandData;
    this.events = options.events;
    this.quality =
      !options.quality || options.quality === "auto" ? detectInitialQuality() : options.quality;

    const seed = options.seed ?? options.islandData.profile.id;
    this.terrainData = generateTerrain(seed, options.islandData.personaType);
    const theme = this.terrainData.theme;

    // Renderer：WebGL context 建立失敗會 throw，由 React 殼捕捉走 2D fallback（task 4.4）
    const profile = QUALITY_PROFILES[this.quality];
    this.renderer = new WebGLRenderer({ antialias: profile.antialias });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, profile.pixelRatioCap));
    this.renderer.shadowMap.enabled = profile.shadows;
    this.container.appendChild(this.renderer.domElement);

    // Scene 與光照
    this.scene = new Scene();
    this.scene.background = new Color(theme.sky);
    this.scene.fog = new Fog(new Color(theme.fog), 40, 90);

    const sun = new DirectionalLight("#FFF7E6", 2.4);
    sun.position.set(18, 30, 12);
    sun.castShadow = profile.shadows;
    this.scene.add(sun);
    this.scene.add(new AmbientLight(theme.sky, 0.9));

    // 相機：初始環視視角；角色載入後由 CharacterController 接管跟隨
    this.camera = new PerspectiveCamera(55, 1, 0.1, 200);
    this.camera.position.set(
      0,
      this.terrainData.theme.islandRadius * 1.1,
      this.terrainData.size * 0.72
    );
    this.camera.lookAt(0, 0, 0);

    // 地形與貼地取樣（three-mesh-bvh）
    this.terrainMeshes = buildTerrainMeshes(this.terrainData);
    this.scene.add(this.terrainMeshes.group);
    this.groundSampler = createBvhGroundSampler(this.terrainMeshes.terrain);

    // 資產與實踐建築佈局（deterministic）
    this.assetLoader = createAssetLoader({ baseUrl: options.assetBaseUrl });
    this.buildingPlacements = computeBuildingPlacements(
      this.terrainData,
      this.islandData.practices
    );

    // 點擊建築（滑鼠與觸控共用 pointer 事件）
    this.renderer.domElement.addEventListener("pointerdown", this.onPointerDown);
    this.renderer.domElement.addEventListener("pointerup", this.onPointerUp);

    // 環島空拍 intro（task 3.8）：intro 擁有相機直到結束/跳過；同時吸收資產載入等待
    const spawnGround = this.groundSampler.heightAt(0, 0);
    this.intro = new AerialIntro({
      camera: this.camera,
      islandRadius: theme.islandRadius,
      endPose: computeThirdPersonCameraPose(0, 0, spawnGround),
      onComplete: () => this.onIntroComplete(),
    });
    window.addEventListener("keydown", this.onSkipIntroInput);
    this.renderer.domElement.addEventListener("pointerdown", this.onSkipIntroInput);

    // 尺寸與 render loop
    this.handleResize();
    this.resizeObserver = new ResizeObserver(() => this.handleResize());
    this.resizeObserver.observe(this.container);
    this.animationFrameId = requestAnimationFrame(this.tick);

    // 資產分批 lazy load（task 3.8）：植栽/生態同步先進，角色優先、建築逐棟進場
    this.initAmbient();
    void this.initCharacter();
    this.initBuildingsProgressive();
  }

  /** 可走動耗時（ms）：從 engine 建構到操控可用；尚未可走動回傳 null */
  getTimeToWalkable(): number | null {
    return this.walkableAt === null ? null : this.walkableAt - this.constructedAt;
  }

  /** 跳過環島空拍 intro（React 殼的跳過按鈕也走這裡） */
  skipIntro(): void {
    this.intro?.skip();
  }

  /** 目前品質分級 */
  getQuality(): QualityTierType {
    return this.quality;
  }

  /** 視窗內平均 fps；樣本不足回傳 null（供自動降級判斷，task 4.4） */
  getAverageFps(): number | null {
    return this.fpsSampler.average();
  }

  /** 切換品質分級（陰影/pixel ratio 即時生效；antialias 需重建 renderer，先不處理） */
  setQuality(tier: QualityTierType): void {
    if (tier === this.quality) return;
    this.quality = tier;
    const profile = QUALITY_PROFILES[tier];
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, profile.pixelRatioCap));
    this.renderer.shadowMap.enabled = profile.shadows;
    this.fpsSampler.reset();
  }

  /** 掛載每幀更新的子系統（controls、entities 動畫） */
  addUpdatable(updatable: IUpdatable): void {
    this.updatables.push(updatable);
  }

  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    if (this.animationFrameId !== null) cancelAnimationFrame(this.animationFrameId);
    this.renderer.domElement.removeEventListener("pointerdown", this.onPointerDown);
    this.renderer.domElement.removeEventListener("pointerup", this.onPointerUp);
    window.removeEventListener("keydown", this.onSkipIntroInput);
    this.renderer.domElement.removeEventListener("pointerdown", this.onSkipIntroInput);
    this.inputSource?.dispose();
    this.resizeObserver?.disconnect();
    this.resizeObserver = null;
    this.groundSampler.dispose();
    this.assetLoader.dispose();
    this.scene.traverse((object) => {
      const mesh = object as { geometry?: { dispose(): void }; material?: unknown };
      mesh.geometry?.dispose();
      const material = mesh.material;
      if (Array.isArray(material)) {
        for (const item of material) (item as { dispose(): void }).dispose();
      } else if (material) {
        (material as { dispose(): void }).dispose();
      }
    });
    this.renderer.dispose();
    this.renderer.domElement.remove();
  }

  /**
   * 植栽與生態（task 3.7）：純幾何、不等資產，同步進場
   */
  private initAmbient(): void {
    const { islandData, terrainData } = this;

    const plantPlacements: IPlantPlacement[] = [];
    for (const placement of this.buildingPlacements) {
      const practice = islandData.practices.find((item) => item.id === placement.practiceId);
      if (!practice) continue;
      plantPlacements.push(...computePlantPlacements(terrainData, placement, practice.checkinIds));
    }
    this.scene.add(createPlantsGroup(plantPlacements, terrainData.theme));

    const critters = createAmbientCritters(
      islandData.recentCheckinCount,
      terrainData.theme.islandRadius,
      terrainData.theme
    );
    this.scene.add(critters.group);
    this.updatables.push(critters.updatable);
    this.updatables.push(createCampfireFlicker(this.campfires));
  }

  /**
   * 角色與操控（tasks 3.4/3.5）：最優先載入——可走動時間以此為準（task 3.8）
   */
  private async initCharacter(): Promise<void> {
    const avatar = await createCharacterAvatar(this.assetLoader, this.islandData.personaType);
    if (this.disposed) return;
    this.scene.add(avatar.root);
    this.updatables.push(avatar);

    const isCoarsePointer =
      typeof window.matchMedia === "function" && window.matchMedia("(pointer: coarse)").matches;
    this.inputSource = isCoarsePointer
      ? createTouchInput(this.container, this.renderer.domElement)
      : createKeyboardMouseInput(this.renderer.domElement);

    const controller = new CharacterController({
      avatar: avatar.root,
      camera: this.camera,
      input: this.inputSource,
      ground: this.groundSampler,
      colliders: this.colliders,
      cameraEnabled: () => this.intro === null || this.intro.isDone(),
      onMoveSpeed: (speed) => avatar.setMoveSpeed(speed),
      onInteract: (x, z) => {
        const practiceId = findNearestBuilding(this.buildingPlacements, x, z);
        if (practiceId) this.events?.onObjectClick?.({ kind: "practice", practiceId });
      },
    });
    this.updatables.push(controller);

    this.walkableAt = performance.now();
    this.events?.onWalkable?.();
  }

  /**
   * 建築逐棟 lazy load（tasks 3.6/3.8）：每棟載完立即進場，不互相等待
   */
  private initBuildingsProgressive(): void {
    for (const placement of this.buildingPlacements) {
      void createBuilding(this.assetLoader, placement).then((building) => {
        if (this.disposed) return;
        this.scene.add(building.container);
        this.clickables.set(building.container, building.practiceId);
        this.colliders.push(building.collider);
        if (building.campfire) this.campfires.push(building.campfire);
      });
    }
  }

  private onIntroComplete = (): void => {
    window.removeEventListener("keydown", this.onSkipIntroInput);
    this.renderer.domElement.removeEventListener("pointerdown", this.onSkipIntroInput);
  };

  private onSkipIntroInput = (): void => {
    this.intro?.skip();
  };

  private onPointerDown = (event: PointerEvent): void => {
    this.pointerDownAt = { x: event.clientX, y: event.clientY };
  };

  private onPointerUp = (event: PointerEvent): void => {
    const downAt = this.pointerDownAt;
    this.pointerDownAt = null;
    if (!downAt) return;
    if (Math.hypot(event.clientX - downAt.x, event.clientY - downAt.y) > CLICK_MOVE_THRESHOLD)
      return;
    if (this.clickables.size === 0) return;

    const rect = this.renderer.domElement.getBoundingClientRect();
    this.pointerNdc.set(
      ((event.clientX - rect.left) / rect.width) * 2 - 1,
      -((event.clientY - rect.top) / rect.height) * 2 + 1
    );
    this.raycaster.setFromCamera(this.pointerNdc, this.camera);
    const targets = Array.from(this.clickables.keys());
    const hit = this.raycaster.intersectObjects(targets, true)[0];
    if (!hit) return;

    // 從命中的子 mesh 往上找掛著 practiceId 的建築容器
    let current: import("three").Object3D | null = hit.object;
    while (current) {
      const practiceId = current.userData.practiceId as string | undefined;
      if (practiceId) {
        this.events?.onObjectClick?.({ kind: "practice", practiceId });
        return;
      }
      current = current.parent;
    }
  };

  private handleResize(): void {
    const width = this.container.clientWidth || 1;
    const height = this.container.clientHeight || 1;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  private tick = (): void => {
    if (this.disposed) return;
    this.animationFrameId = requestAnimationFrame(this.tick);
    const delta = this.clock.getDelta();
    const elapsed = this.clock.elapsedTime;
    this.fpsSampler.push(delta);
    if (this.intro && !this.intro.isDone()) this.intro.update(delta, elapsed);
    for (const updatable of this.updatables) {
      updatable.update(delta, elapsed);
    }
    this.renderer.render(this.scene, this.camera);
    if (!this.firstFrameRendered) {
      this.firstFrameRendered = true;
      this.events?.onReady?.();
    }
  };
}
