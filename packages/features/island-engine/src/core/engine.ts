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
  ACESFilmicToneMapping,
  Clock,
  Color,
  DirectionalLight,
  DoubleSide,
  Fog,
  Group,
  HemisphereLight,
  Mesh,
  MeshBasicMaterial,
  type Object3D,
  PCFSoftShadowMap,
  PerspectiveCamera,
  Raycaster,
  RingGeometry,
  Scene,
  Vector2,
  Vector3,
  WebGLRenderer,
} from "three";
import { createAssetLoader, type IAssetLoader } from "../assets/loader";
import {
  advanceBoatPose,
  createKeyboardMouseInput,
  createTouchInput,
  didBoatReachDock,
  type IBoatPose,
  type IControlInputState,
  type IInputSource,
} from "../controls";
import {
  CharacterController,
  computeThirdPersonCameraPose,
} from "../controls/character-controller";
import { createBuilding, createCampfireFlicker, findNearestBuilding } from "../entities/buildings";
import { createCentralHub } from "../entities/central-hub";
import { createCharacterAvatar } from "../entities/character";
import { createEnvironmentInstances } from "../entities/environment";
import { createGrassCarpet } from "../entities/grass";
import {
  computeBuildingPlacements,
  computeEmptyCampPlacement,
  computeEnvironmentPlacements,
  computeGrassPlacements,
  computePlantPlacements,
  EnvironmentKind,
  type IBuildingPlacement,
  type IPlantPlacement,
} from "../entities/layout";
import { createAmbientCritters, createPlantsGroup } from "../entities/plants";
import {
  computeRoutePlacements,
  createDestinationIsland,
  createRouteHarbor,
  createRoutesGroup,
  findNearestDestination,
  type IRoutePlacement,
  ROUTE_ARRIVAL_START_Z,
  ROUTE_BOAT_START_X,
  ROUTE_BOAT_START_Z,
  ROUTE_DOCKING_RADIUS,
} from "../entities/routes";
import type { IRadialCollider } from "../physics/ground";
import { createBvhGroundSampler, type IBvhGroundSampler } from "../physics/ground";
import {
  flattenTerrainAround,
  generateTerrain,
  type ITerrainData,
  sampleTerrainHeight,
} from "../terrain/generate";
import { buildTerrainMeshes, type ITerrainMeshes } from "../terrain/terrain";
import type { IIslandData, IIslandDestination, IIslandEngineOptions } from "../types";
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
  private routeGroup: Group | null = null;
  private routeHarbor: Group | null = null;
  private routePlacements: IRoutePlacement[] = [];
  private routeClickables: Group[] = [];
  private routeGeneration = 0;
  private characterRoot: Object3D | null = null;
  private characterController: CharacterController | null = null;
  private aboard = false;
  private sailing: {
    harbor: Group;
    boat: Object3D;
    phase: "manual" | "docking" | "inbound";
    placement: IRoutePlacement | null;
    pose: IBoatPose;
    phaseStartPose: IBoatPose;
    baseBoatY: number;
    elapsed: number;
    duration: number;
    resolve: (identifier: string | null) => void;
  } | null = null;
  private sailingInput: Pick<IControlInputState, "moveX" | "moveZ"> = {
    moveX: 0,
    moveZ: 0,
  };
  private intro: AerialIntro | null = null;
  private emptyCampPlacement: IBuildingPlacement | null = null;
  private inputSource: IInputSource | null = null;
  private resizeObserver: ResizeObserver | null = null;
  private animationFrameId: number | null = null;
  private quality: QualityTierType;
  private disposed = false;
  private firstFrameRendered = false;
  private pointerDownAt: {
    x: number;
    y: number;
    pointerId: number;
    maxDistance: number;
    introWasPlaying: boolean;
  } | null = null;
  private readonly constructedAt = performance.now();
  private walkableAt: number | null = null;
  private readonly selectionMarker: Mesh<RingGeometry, MeshBasicMaterial>;
  private readonly moveTargetMarker: Mesh<RingGeometry, MeshBasicMaterial>;
  private selectedPracticeId: string | null = null;
  private prefersReducedMotion = false;

  constructor(options: IIslandEngineOptions) {
    this.container = options.container;
    this.islandData = options.islandData;
    this.events = options.events;
    this.quality =
      !options.quality || options.quality === "auto" ? detectInitialQuality() : options.quality;

    const seed = options.seed ?? options.islandData.profile.id;
    this.terrainData = generateTerrain(seed, options.islandData.personaType);
    const theme = this.terrainData.theme;

    // Renderer（spike 視覺定案：PCFSoft 陰影＋ACES 色調映射）
    // WebGL context 建立失敗會 throw，由 React 殼捕捉走 2D fallback（task 4.4）
    const profile = QUALITY_PROFILES[this.quality];
    this.renderer = new WebGLRenderer({ antialias: profile.antialias });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, profile.pixelRatioCap));
    this.renderer.shadowMap.enabled = profile.shadows;
    this.renderer.shadowMap.type = PCFSoftShadowMap;
    this.renderer.toneMapping = ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;
    this.container.appendChild(this.renderer.domElement);

    // Scene 與光照（hemisphere 天光＋暖色太陽，spike 參數）
    this.scene = new Scene();
    this.scene.background = new Color(theme.sky);
    this.scene.fog = new Fog(
      new Color(theme.fog),
      theme.islandRadius * 1.8,
      theme.islandRadius * 4.5
    );
    this.prefersReducedMotion =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    this.selectionMarker = new Mesh(
      new RingGeometry(1.55, 1.84, 48),
      new MeshBasicMaterial({
        color: "#16B9B3",
        transparent: true,
        opacity: 0.78,
        side: DoubleSide,
        depthWrite: false,
      })
    );
    this.selectionMarker.name = "practice-selection-marker";
    this.selectionMarker.rotation.x = -Math.PI / 2;
    this.selectionMarker.renderOrder = 2;
    this.selectionMarker.visible = false;
    this.scene.add(this.selectionMarker);
    this.moveTargetMarker = new Mesh(
      new RingGeometry(0.28, 0.48, 36),
      new MeshBasicMaterial({
        color: "#FF9F1C",
        transparent: true,
        opacity: 0.9,
        side: DoubleSide,
        depthWrite: false,
      })
    );
    this.moveTargetMarker.name = "move-target-marker";
    this.moveTargetMarker.rotation.x = -Math.PI / 2;
    this.moveTargetMarker.renderOrder = 3;
    this.moveTargetMarker.visible = false;
    this.scene.add(this.moveTargetMarker);

    const sun = new DirectionalLight("#FFE8C0", 2.6);
    sun.position.set(8, 14, 6);
    sun.castShadow = profile.shadows;
    sun.shadow.mapSize.set(2048, 2048);
    // 消除 shadow acne（球面/地形的同心圓條紋）
    sun.shadow.bias = -0.0004;
    sun.shadow.normalBias = 0.6;
    const shadowRange = theme.islandRadius * 1.35;
    sun.shadow.camera.left = -shadowRange;
    sun.shadow.camera.right = shadowRange;
    sun.shadow.camera.top = shadowRange;
    sun.shadow.camera.bottom = -shadowRange;
    this.scene.add(sun);
    this.scene.add(new HemisphereLight("#BFE8FF", "#F2D9A8", 0.9));

    // 相機：初始環視視角；角色載入後由 CharacterController 接管跟隨
    this.camera = new PerspectiveCamera(55, 1, 0.1, Math.max(200, theme.islandRadius * 6));
    this.camera.position.set(
      0,
      this.terrainData.theme.islandRadius * 1.1,
      this.terrainData.size * 0.72
    );
    this.camera.lookAt(0, 0, 0);

    // 佈局（deterministic）→ 整地（建築不陷坡）→ 再建 mesh 與 BVH
    this.assetLoader = createAssetLoader({ baseUrl: options.assetBaseUrl });
    this.buildingPlacements = computeBuildingPlacements(
      this.terrainData,
      this.islandData.practices
    );
    if (this.buildingPlacements.length === 0) {
      this.emptyCampPlacement = computeEmptyCampPlacement(this.terrainData);
    }
    const flattenSpots = [...this.buildingPlacements, this.emptyCampPlacement].filter(
      (spot): spot is IBuildingPlacement => spot !== null
    );
    flattenTerrainAround(this.terrainData, flattenSpots);
    for (const placement of flattenSpots) {
      placement.y = sampleTerrainHeight(this.terrainData, placement.x, placement.z);
    }

    // 地形與貼地取樣（three-mesh-bvh）
    this.terrainMeshes = buildTerrainMeshes(this.terrainData);
    this.scene.add(this.terrainMeshes.group);
    this.groundSampler = createBvhGroundSampler(this.terrainMeshes.terrain);
    this.raycaster.firstHitOnly = true;
    void this.setDestinations(options.destinations ?? []);

    // 浪圈呼吸（spike 視覺定案）
    const foam = this.terrainMeshes.foam;
    this.updatables.push({
      update: (_delta, elapsed) => {
        const material = foam.material as import("three").MeshBasicMaterial;
        material.opacity = 0.25 + Math.sin(elapsed * 1.1) * 0.12;
        const breathe = 1 + Math.sin(elapsed * 1.1) * 0.012;
        foam.scale.set(breathe, breathe, 1);
      },
    });

    // 點擊互動物件或地面移動（滑鼠與觸控共用 pointer 事件）
    this.renderer.domElement.addEventListener("pointerdown", this.onPointerDown);
    this.renderer.domElement.addEventListener("pointerup", this.onPointerUp);
    window.addEventListener("pointermove", this.onPointerMove);
    this.renderer.domElement.addEventListener("pointercancel", this.onPointerCancel);

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
    this.initEnvironment();
  }

  /** 可走動耗時（ms）：從 engine 建構到操控可用；尚未可走動回傳 null */
  getTimeToWalkable(): number | null {
    return this.walkableAt === null ? null : this.walkableAt - this.constructedAt;
  }

  /** 跳過環島空拍 intro（React 殼的跳過按鈕也走這裡） */
  skipIntro(): void {
    this.intro?.skip();
  }

  /** 標記一棟實踐建築；傳入 null 時只解除選取，不改變鏡頭。 */
  selectPractice(practiceId: string | null): void {
    if (!practiceId) {
      this.selectionMarker.visible = false;
      this.selectedPracticeId = null;
      return;
    }

    const placement = this.buildingPlacements.find((item) => item.practiceId === practiceId);
    if (!placement) return;

    const practice = this.islandData.practices.find((item) => item.id === practiceId);
    this.selectionMarker.material.color.set(practice?.themeColor ?? "#16B9B3");
    this.selectionMarker.position.set(placement.x, placement.y + 0.08, placement.z);
    this.selectionMarker.scale.setScalar(1);
    this.selectionMarker.visible = true;
    this.selectedPracticeId = practiceId;
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

  /** 更新島岸航線；供夥伴清單在 engine 建立後非同步載入 */
  async setDestinations(destinations: readonly IIslandDestination[]): Promise<void> {
    if (this.sailing || this.aboard) return;
    const generation = ++this.routeGeneration;
    const placements = computeRoutePlacements(this.terrainData, destinations);
    const firstPlacement = placements[0];
    let harbor: Group | null = null;
    let destinationsGroups: Group[] = [];
    if (firstPlacement) {
      [harbor, destinationsGroups] = await Promise.all([
        createRouteHarbor(this.assetLoader, firstPlacement),
        Promise.all(
          placements.map((placement) => createDestinationIsland(this.assetLoader, placement))
        ),
      ]);
      harbor.add(...destinationsGroups);
    }
    const nextGroup = createRoutesGroup(harbor ? [harbor] : []);

    if (this.disposed || generation !== this.routeGeneration) {
      this.disposeObject(nextGroup);
      return;
    }

    if (this.routeGroup) {
      this.scene.remove(this.routeGroup);
      if (this.routeHarbor) this.clickables.delete(this.routeHarbor);
      for (const clickable of this.routeClickables) this.clickables.delete(clickable);
      this.disposeObject(this.routeGroup);
    }

    this.routePlacements = placements;
    this.routeHarbor = harbor;
    this.routeClickables = destinationsGroups;
    this.routeGroup = nextGroup;

    if (harbor) this.clickables.set(harbor, "route-harbor");
    for (const [index, destination] of destinationsGroups.entries()) {
      const placement = placements[index];
      if (!placement) continue;
      this.clickables.set(destination, placement.identifier);
    }

    this.scene.add(nextGroup);
  }

  /** 角色在碼頭互動後實際登上共用船隻。 */
  boardBoat(): boolean {
    if (this.aboard) return true;
    const boat = this.routeHarbor?.getObjectByName("route-boat");
    if (!boat || !this.characterRoot) return false;

    this.characterController?.cancelMoveTarget();
    this.selectionMarker.visible = false;
    this.selectedPracticeId = null;
    this.intro?.skip();
    boat.add(this.characterRoot);
    this.characterRoot.position.set(0, 0.34, 0);
    this.characterRoot.rotation.set(0, 0, 0);
    this.characterRoot.visible = true;
    this.aboard = true;
    return true;
  }

  isAboard(): boolean {
    return this.aboard;
  }

  /** 取消航行並返回目前島嶼岸邊，避免角色卡在船上。 */
  disembarkBoat(): boolean {
    if (!this.aboard || !this.characterRoot) return false;

    const sailing = this.sailing;
    const boat = this.routeHarbor?.getObjectByName("route-boat");
    const placement = this.routePlacements[0];
    this.sailing = null;
    this.sailingInput = { moveX: 0, moveZ: 0 };

    if (boat) {
      boat.position.x = ROUTE_BOAT_START_X;
      boat.position.z = ROUTE_BOAT_START_Z;
      boat.rotation.set(0, 0, 0);
      if (sailing) boat.position.y = sailing.baseBoatY;
    }

    this.scene.add(this.characterRoot);
    if (placement) {
      this.characterController?.teleport(placement.interactX, placement.interactZ);
    }
    this.characterRoot.visible = true;
    this.aboard = false;
    sailing?.resolve(null);
    return true;
  }

  /** 從共用碼頭自由出海；回傳玩家實際靠港的目的島 identifier。 */
  sailFreely(): Promise<string | null> {
    if (this.sailing) return Promise.resolve(null);
    const harbor = this.routeHarbor;
    const boat = harbor?.getObjectByName("route-boat");
    if (this.routePlacements.length === 0 || !harbor || !boat || !this.aboard) {
      return Promise.resolve(null);
    }

    this.selectionMarker.visible = false;
    this.selectedPracticeId = null;
    this.intro?.skip();
    boat.position.x = ROUTE_BOAT_START_X;
    boat.position.z = ROUTE_BOAT_START_Z;
    boat.rotation.set(0, 0, 0);
    for (const destination of this.routeClickables) destination.visible = true;
    const pose = { x: ROUTE_BOAT_START_X, z: ROUTE_BOAT_START_Z, heading: 0 };

    return new Promise((resolve) => {
      this.sailing = {
        harbor,
        boat,
        phase: "manual",
        placement: null,
        pose,
        phaseStartPose: pose,
        baseBoatY: boat.position.y,
        elapsed: 0,
        duration: 0,
        resolve,
      };
    });
  }

  /** 從海上駛入來源島對應的碼頭，抵達後角色在岸邊下船 */
  arriveFrom(identifier: string): Promise<void> {
    if (this.sailing) return Promise.resolve();
    const placement = this.routePlacements.find((route) => route.identifier === identifier);
    const harbor = this.routeHarbor;
    const boat = harbor?.getObjectByName("route-boat");
    if (!placement || !harbor || !boat) return Promise.resolve();

    this.intro?.skip();
    boat.position.x = ROUTE_BOAT_START_X;
    boat.position.z = ROUTE_ARRIVAL_START_Z;
    boat.rotation.set(0, 0, 0);
    if (this.characterRoot) this.characterRoot.visible = false;
    this.aboard = true;
    const pose = { x: ROUTE_BOAT_START_X, z: ROUTE_ARRIVAL_START_Z, heading: 0 };

    return new Promise<void>((resolve) => {
      this.sailing = {
        harbor,
        boat,
        phase: "inbound",
        placement,
        pose,
        phaseStartPose: pose,
        baseBoatY: boat.position.y,
        elapsed: 0,
        duration: 1.8,
        resolve: () => resolve(),
      };
    });
  }

  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    if (this.animationFrameId !== null) cancelAnimationFrame(this.animationFrameId);
    this.renderer.domElement.removeEventListener("pointerdown", this.onPointerDown);
    this.renderer.domElement.removeEventListener("pointerup", this.onPointerUp);
    window.removeEventListener("pointermove", this.onPointerMove);
    this.renderer.domElement.removeEventListener("pointercancel", this.onPointerCancel);
    window.removeEventListener("keydown", this.onSkipIntroInput);
    this.renderer.domElement.removeEventListener("pointerdown", this.onSkipIntroInput);
    this.inputSource?.dispose();
    this.resizeObserver?.disconnect();
    this.resizeObserver = null;
    this.groundSampler.dispose();
    this.assetLoader.dispose();
    this.scene.traverse((object) => this.disposeObjectMaterial(object));
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
    void createPlantsGroup(this.assetLoader, plantPlacements, terrainData.theme).then((group) => {
      if (this.disposed) {
        this.disposeObject(group);
        return;
      }
      this.scene.add(group);
    });

    void createAmbientCritters(this.assetLoader, islandData.recentCheckinCount, terrainData).then(
      (critters) => {
        if (this.disposed) {
          this.disposeObject(critters.group);
          return;
        }
        this.scene.add(critters.group);
        this.updatables.push(critters.updatable);
      }
    );
    void createCentralHub(this.assetLoader, terrainData).then((hub) => {
      if (this.disposed) {
        this.disposeObject(hub.group);
        return;
      }
      this.scene.add(hub.group);
      this.colliders.push(...hub.colliders);
      this.campfires.push(hub.campfireLight);
      if (hub.ownerTarget) this.clickables.set(hub.ownerTarget, "owner-profile");
    });
    this.updatables.push(createCampfireFlicker(this.campfires));

    // 草皮地毯（spike 視覺定案：patch-grass InstancedMesh，1 draw call）
    void this.assetLoader.load("grass-patch").then((model) => {
      if (this.disposed) return;
      const carpet = createGrassCarpet(
        model,
        computeGrassPlacements(terrainData),
        terrainData.theme
      );
      if (carpet) this.scene.add(carpet);
    });
  }

  /**
   * 角色與操控（tasks 3.4/3.5）：最優先載入——可走動時間以此為準（task 3.8）
   */
  private async initCharacter(): Promise<void> {
    const avatar = await createCharacterAvatar(this.assetLoader, this.islandData.personaType);
    if (this.disposed) {
      this.disposeObject(avatar.root);
      return;
    }
    this.characterRoot = avatar.root;
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
      controlsEnabled: () =>
        this.sailing === null && !this.aboard && this.selectedPracticeId === null,
      onInputFrame: (input) => {
        this.sailingInput = { moveX: input.moveX, moveZ: input.moveZ };
      },
      onMoveSpeed: (speed) => avatar.setMoveSpeed(speed),
      onMoveTargetChange: (target) => {
        if (!target) {
          this.moveTargetMarker.visible = false;
          return;
        }
        this.moveTargetMarker.position.set(
          target.x,
          this.groundSampler.heightAt(target.x, target.z) + 0.06,
          target.z
        );
        this.moveTargetMarker.scale.setScalar(0.72);
        this.moveTargetMarker.material.opacity = 0.95;
        this.moveTargetMarker.visible = true;
      },
      onInteract: (x, z) => {
        const destination = findNearestDestination(this.routePlacements, x, z);
        if (destination) {
          this.events?.onObjectClick?.({ kind: "harbor" });
          return;
        }
        const practiceId = findNearestBuilding(this.buildingPlacements, x, z);
        if (practiceId) this.events?.onObjectClick?.({ kind: "practice", practiceId });
      },
    });
    this.characterController = controller;
    this.updatables.push(controller);

    this.walkableAt = performance.now();
    this.events?.onWalkable?.();
  }

  /**
   * 建築逐棟 lazy load（tasks 3.6/3.8）：每棟載完立即進場，不互相等待
   */
  private initBuildingsProgressive(): void {
    // 空島狀態（spec）：一頂帳篷＋熄滅營火，不可點擊；CTA 由 React 殼依 viewerRelation 顯示
    if (this.emptyCampPlacement) {
      void createBuilding(this.assetLoader, this.emptyCampPlacement).then((building) => {
        if (this.disposed) {
          this.disposeObject(building.container);
          return;
        }
        this.scene.add(building.container);
        this.colliders.push(building.collider);
      });
      return;
    }

    for (const placement of this.buildingPlacements) {
      void createBuilding(this.assetLoader, placement).then((building) => {
        if (this.disposed) {
          this.disposeObject(building.container);
          return;
        }
        this.scene.add(building.container);
        this.clickables.set(building.container, building.practiceId);
        this.colliders.push(building.collider);
        if (building.campfire) this.campfires.push(building.campfire);
      });
    }
  }

  /**
   * 環境裝飾（棕櫚樹/岩石）：依主題密度、島種子 deterministic 散佈，避開營地
   */
  private initEnvironment(): void {
    const avoid = this.emptyCampPlacement
      ? [...this.buildingPlacements, this.emptyCampPlacement]
      : this.buildingPlacements;
    const placements = computeEnvironmentPlacements(this.terrainData, avoid);
    const group = new Group();
    group.name = "island-environment";
    this.scene.add(group);

    // 棕櫚搖曳（spike 視覺定案）
    const palms: { object: Object3D; phase: number }[] = [];
    this.updatables.push({
      update: (_delta, elapsed) => {
        for (const palm of palms) {
          palm.object.rotation.z = Math.sin(elapsed * 0.9 + palm.phase) * 0.025;
        }
      },
    });

    const isPalm = (kind: string): boolean =>
      kind === EnvironmentKind.palmTree || kind === EnvironmentKind.palmTreeStraight;

    for (const kind of new Set(placements.map((placement) => placement.kind))) {
      void this.assetLoader.load(kind).then((model) => {
        if (this.disposed) return;
        const kindPlacements = placements.filter((placement) => placement.kind === kind);
        if (!isPalm(kind)) {
          const instances = createEnvironmentInstances(model, kindPlacements, kind);
          if (instances) group.add(instances);
          if (kind === EnvironmentKind.tree || kind === EnvironmentKind.treeOak) {
            for (const placement of kindPlacements) {
              this.colliders.push({ x: placement.x, z: placement.z, radius: 0.6 });
            }
          }
          return;
        }

        for (const placement of kindPlacements) {
          const instance = model.clone();
          instance.position.set(placement.x, placement.y, placement.z);
          instance.rotation.y = placement.rotationY;
          instance.scale.multiplyScalar(placement.scale);
          group.add(instance);
          this.colliders.push({ x: placement.x, z: placement.z, radius: 0.55 });
          palms.push({ object: instance, phase: placement.x });
        }
      });
    }
  }

  private onIntroComplete = (): void => {
    window.removeEventListener("keydown", this.onSkipIntroInput);
    this.renderer.domElement.removeEventListener("pointerdown", this.onSkipIntroInput);
    this.events?.onIntroEnd?.();
  };

  private onSkipIntroInput = (): void => {
    this.intro?.skip();
  };

  private onPointerDown = (event: PointerEvent): void => {
    if (!event.isPrimary || event.button !== 0) {
      this.pointerDownAt = null;
      return;
    }
    this.pointerDownAt = {
      x: event.clientX,
      y: event.clientY,
      pointerId: event.pointerId,
      maxDistance: 0,
      introWasPlaying: this.intro !== null && !this.intro.isDone(),
    };
  };

  private onPointerMove = (event: PointerEvent): void => {
    const downAt = this.pointerDownAt;
    if (!downAt || downAt.pointerId !== event.pointerId) return;
    downAt.maxDistance = Math.max(
      downAt.maxDistance,
      Math.hypot(event.clientX - downAt.x, event.clientY - downAt.y)
    );
  };

  private onPointerCancel = (event: PointerEvent): void => {
    if (this.pointerDownAt?.pointerId === event.pointerId) this.pointerDownAt = null;
  };

  private onPointerUp = (event: PointerEvent): void => {
    const downAt = this.pointerDownAt;
    if (!downAt || downAt.pointerId !== event.pointerId) return;
    this.pointerDownAt = null;
    const finalDistance = Math.hypot(event.clientX - downAt.x, event.clientY - downAt.y);
    if (Math.max(downAt.maxDistance, finalDistance) > CLICK_MOVE_THRESHOLD) return;
    if (downAt.introWasPlaying) return;
    const rect = this.renderer.domElement.getBoundingClientRect();
    this.pointerNdc.set(
      ((event.clientX - rect.left) / rect.width) * 2 - 1,
      -((event.clientY - rect.top) / rect.height) * 2 + 1
    );
    this.raycaster.setFromCamera(this.pointerNdc, this.camera);
    if (this.clickables.size > 0) {
      const targets = Array.from(this.clickables.keys());
      const hit = this.raycaster.intersectObjects(targets, true)[0];

      // 從命中的子 mesh 往上找掛著互動資料的容器。
      let current: import("three").Object3D | null = hit?.object ?? null;
      while (current) {
        const practiceId = current.userData.practiceId as string | undefined;
        if (practiceId) {
          this.events?.onObjectClick?.({ kind: "practice", practiceId });
          return;
        }
        const destinationIdentifier = current.userData.destinationIdentifier as string | undefined;
        if (destinationIdentifier) {
          this.events?.onObjectClick?.({
            kind: "destination",
            identifier: destinationIdentifier,
          });
          return;
        }
        if (current.userData.isRouteHarbor === true) {
          this.events?.onObjectClick?.({ kind: "harbor" });
          return;
        }
        if (current.userData.isOwnerProfile === true) {
          this.events?.onObjectClick?.({ kind: "owner" });
          return;
        }
        current = current.parent;
      }
    }

    if (event.pointerType !== "mouse") return;
    const terrainHit = this.raycaster.intersectObject(this.terrainMeshes.terrain, false)[0];
    if (terrainHit) this.characterController?.moveTo(terrainHit.point.x, terrainHit.point.z);
  };

  private disposeObject(object: Object3D): void {
    object.traverse((child) => this.disposeObjectMaterial(child));
  }

  private disposeObjectMaterial(object: Object3D): void {
    const mesh = object as {
      geometry?: { dispose(): void };
      material?: unknown;
      isSprite?: boolean;
    };
    // Sprite 共用一份 module-scoped 的靜態 BufferGeometry，dispose 會連帶破壞
    // 其他所有 Sprite（例如目的地島嶼文字標籤）的渲染，故略過。
    if (!mesh.isSprite) mesh.geometry?.dispose();
    const material = mesh.material;
    if (Array.isArray(material)) {
      for (const item of material) {
        (item as { map?: { dispose(): void } }).map?.dispose();
        (item as { dispose(): void }).dispose();
      }
    } else if (material) {
      (material as { map?: { dispose(): void } }).map?.dispose();
      (material as { dispose(): void }).dispose();
    }
  }

  private handleResize(): void {
    const width = this.container.clientWidth || 1;
    const height = this.container.clientHeight || 1;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  private updateSailing(deltaSeconds: number): void {
    const sailing = this.sailing;
    if (!sailing) return;

    sailing.elapsed += deltaSeconds;
    if (sailing.phase === "manual") {
      const previousPose = sailing.pose;
      const dockXs = this.routePlacements.map((placement) => placement.dockX);
      const dockZs = this.routePlacements.map((placement) => placement.dockZ);
      const nextPose = advanceBoatPose(previousPose, this.sailingInput, deltaSeconds, {
        minX: Math.min(-40, ...dockXs) - 8,
        maxX: Math.max(40, ...dockXs) + 8,
        minZ: Math.min(-48, ...dockZs) - 8,
        maxZ: Math.max(48, ...dockZs) + 8,
      });
      sailing.pose = nextPose;
      const reachedPlacement = this.routePlacements.find((placement) =>
        didBoatReachDock(previousPose, nextPose, {
          x: placement.dockX,
          z: placement.dockZ,
          radius: ROUTE_DOCKING_RADIUS,
        })
      );
      if (reachedPlacement) {
        sailing.placement = reachedPlacement;
        sailing.phase = "docking";
        sailing.phaseStartPose = nextPose;
        sailing.elapsed = 0;
        sailing.duration = 0.75;
      }
    } else {
      const progress = Math.min(1, sailing.elapsed / sailing.duration);
      const eased = 1 - (1 - progress) ** 3;
      if (sailing.phase === "docking") {
        const placement = sailing.placement;
        if (!placement) return;
        sailing.pose = {
          x: sailing.phaseStartPose.x + (placement.dockX - sailing.phaseStartPose.x) * eased,
          z: sailing.phaseStartPose.z + (placement.dockZ - sailing.phaseStartPose.z) * eased,
          heading:
            sailing.phaseStartPose.heading +
            (placement.destinationRotationY - sailing.phaseStartPose.heading) * eased,
        };
      } else {
        sailing.pose = {
          x: ROUTE_BOAT_START_X,
          z: ROUTE_ARRIVAL_START_Z - (ROUTE_ARRIVAL_START_Z - ROUTE_BOAT_START_Z) * eased,
          heading: 0,
        };
      }
    }

    sailing.boat.position.x = sailing.pose.x;
    sailing.boat.position.z = sailing.pose.z;
    sailing.boat.rotation.y = sailing.pose.heading;
    sailing.boat.rotation.z = Math.sin(sailing.elapsed * 7) * 0.035;
    sailing.boat.position.y = sailing.baseBoatY + Math.sin(sailing.elapsed * 6) * 0.04;
    this.sailingInput = { moveX: 0, moveZ: 0 };

    const target = sailing.boat.getWorldPosition(new Vector3());
    const desiredCamera = sailing.harbor.localToWorld(
      new Vector3(
        sailing.pose.x - Math.sin(sailing.pose.heading) * 7.5,
        5.8,
        sailing.pose.z - Math.cos(sailing.pose.heading) * 7.5
      )
    );
    this.camera.position.lerp(desiredCamera, Math.min(1, deltaSeconds * 5));
    this.camera.lookAt(target.x, target.y + 0.8, target.z);

    const phaseComplete = sailing.phase !== "manual" && sailing.elapsed >= sailing.duration;
    if (phaseComplete) {
      const resolve = sailing.resolve;
      if (sailing.phase === "inbound") {
        const placement = sailing.placement;
        if (!placement) return;
        if (this.characterRoot) this.scene.add(this.characterRoot);
        this.characterController?.teleport(placement.interactX, placement.interactZ);
        if (this.characterRoot) this.characterRoot.visible = true;
        this.aboard = false;
      }
      const dockedIdentifier =
        sailing.phase === "docking" ? (sailing.placement?.identifier ?? null) : null;
      this.sailing = null;
      resolve(dockedIdentifier);
    }
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
    this.updateSailing(delta);
    this.updatePracticeSelection(elapsed);
    this.updateMoveTargetMarker(elapsed);
    this.renderer.render(this.scene, this.camera);
    if (!this.firstFrameRendered) {
      this.firstFrameRendered = true;
      this.events?.onReady?.();
    }
  };

  private updatePracticeSelection(elapsedSeconds: number): void {
    if (this.sailing) return;

    if (this.selectionMarker.visible && !this.prefersReducedMotion) {
      const pulse = 1 + Math.sin(elapsedSeconds * 3.2) * 0.08;
      this.selectionMarker.scale.setScalar(pulse);
      this.selectionMarker.material.opacity = 0.7 + Math.sin(elapsedSeconds * 3.2) * 0.12;
    }
  }

  private updateMoveTargetMarker(elapsedSeconds: number): void {
    if (!this.moveTargetMarker.visible || this.prefersReducedMotion) return;
    const phase = elapsedSeconds * 7;
    const pulse = 0.82 + ((Math.sin(phase) + 1) / 2) * 0.32;
    this.moveTargetMarker.scale.setScalar(pulse);
    this.moveTargetMarker.material.opacity = 0.62 + Math.sin(phase) * 0.22;
  }
}
