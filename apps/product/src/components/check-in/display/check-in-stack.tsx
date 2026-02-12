"use client";

import type { PracticeCheckInsResponse } from "@daodao/api";
import CircleSvg from "@daodao/assets/images/dashboard/circle.svg";
import ClippedCircleSvg from "@daodao/assets/images/dashboard/clipped-circle.svg";
import HexagonSvg from "@daodao/assets/images/dashboard/hexagon.svg";
import SemiCircleSvg from "@daodao/assets/images/dashboard/semi-circle.svg";
import SpeechBubbleSvg from "@daodao/assets/images/dashboard/speech-bubble.svg";
import { Link } from "@daodao/i18n/navigation";
import { cn } from "@daodao/ui/lib/utils";
import { format, isValid, parse } from "date-fns";
import Matter from "matter-js";
import * as decomp from "poly-decomp-es";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  MOOD_OPTIONS,
  type MoodType as MoodTypeType,
  mapApiMoodToMoodType,
} from "@/constants/mood";
import type { IBodyPosition, ICheckInItem, ISvgGeometry } from "../types";

const { Engine, World, Bodies, Vertices, Runner, Body } = Matter;
Matter.Common.setDecomp(decomp);

/**
 * 從實際的 SVG DOM 元素中提取幾何數據
 */
const extractSvgGeometry = (svgElement: SVGSVGElement): ISvgGeometry | null => {
  if (!svgElement) return null;

  // 從 SVG 元素的 width/height 屬性或 viewBox 獲取尺寸
  const widthAttr = svgElement.getAttribute("width");
  const heightAttr = svgElement.getAttribute("height");
  const viewBoxAttr = svgElement.getAttribute("viewBox");

  let width = 0;
  let height = 0;

  if (widthAttr && heightAttr) {
    width = parseFloat(widthAttr);
    height = parseFloat(heightAttr);
  } else if (viewBoxAttr) {
    const viewBoxValues = viewBoxAttr.split(/\s+/);
    if (viewBoxValues.length >= 4) {
      width = parseFloat(viewBoxValues[2] ?? "0");
      height = parseFloat(viewBoxValues[3] ?? "0");
    }
  }

  // 檢查是否有 circle 元素
  const circleElement = svgElement.querySelector("circle");
  if (circleElement) {
    const r = parseFloat(circleElement.getAttribute("r") ?? "0");
    return {
      width,
      height,
      isCircle: true,
      radius: r,
    };
  }

  // 檢查是否有 path 元素
  const pathElement = svgElement.querySelector("path");
  if (pathElement) {
    const pathString = pathElement.getAttribute("d");
    if (pathString) {
      return {
        width,
        height,
        path: pathString,
        isCircle: false,
      };
    }
  }

  return null;
};

/**
 * 將 SVG path 元素轉換成 Matter.js 的頂點陣列
 * @param pathElement SVG path 元素
 * @param samples 採樣點數量
 * @returns Matter.js 頂點陣列
 */
const pathElementToVertices = (pathElement: SVGPathElement, samples: number): Matter.Vector[] => {
  const pathLength = pathElement.getTotalLength();
  const vertices: Matter.Vector[] = [];

  // 沿著路徑採樣點
  for (let i = 0; i < samples; i++) {
    const distance = (pathLength * i) / samples;
    const point = pathElement.getPointAtLength(distance);
    vertices.push({ x: point.x, y: point.y });
  }

  // 確保頂點是逆時針順序（Matter.js 的要求）
  const sortedVertices = Vertices.clockwiseSort(vertices);

  // 移除重複的頂點（如果起點和終點太接近）
  const cleanedVertices: Matter.Vector[] = [];

  for (let i = 0; i < sortedVertices.length; i++) {
    const current = sortedVertices[i];
    const next = sortedVertices[(i + 1) % sortedVertices.length];

    if (!current || !next) continue;

    const distance = Math.sqrt((current.x - next.x) ** 2 + (current.y - next.y) ** 2);

    // 如果距離太近，跳過這個點
    if (distance > VERTEX_DISTANCE_THRESHOLD) {
      cleanedVertices.push(current);
    }
  }

  // 確保至少有 3 個頂點（形成多邊形的最小要求）
  if (cleanedVertices.length < 3) {
    return sortedVertices;
  }

  return cleanedVertices;
};

// SVG 配置：順序為綠、藍、紅、黃、橘
const SVG_CONFIGS = [
  { name: "circle", Component: CircleSvg },
  { name: "hexagon", Component: HexagonSvg },
  { name: "semi-circle", Component: SemiCircleSvg },
  { name: "speech-bubble", Component: SpeechBubbleSvg },
  { name: "clipped-circle", Component: ClippedCircleSvg },
] as const;

const CONTAINER_WIDTH = 448;
const MIN_CONTAINER_HEIGHT = 300;
const WALL_THICKNESS = 20;
const WALL_OFFSET = 10;
const LAYER_SPACING = 1.2;
const PATH_SAMPLES = 50;
const VERTEX_DISTANCE_THRESHOLD = 0.1;

// 角度限制（-20度到20度，轉換為弧度）
const MIN_ANGLE = (-20 * Math.PI) / 180; // -20度
const MAX_ANGLE = (20 * Math.PI) / 180; // 20度
const MAX_ANGULAR_VELOCITY = 0.1; // 最大角速度，防止快速旋轉

// 物理屬性常數
const PHYSICS_CONFIG = {
  gravity: { x: 0, y: -0.1 },
  friction: 1,
  frictionAir: 0,
  frictionStatic: 1,
  density: 0.0001,
  restitution: 0.0001,
  positionIterations: 10,
  velocityIterations: 4,
  timeScale: 3,
} as const;

/**
 * 創建物理引擎的邊界牆
 */
const createWalls = (containerWidth: number, containerHeight: number) => {
  const wallOptions = {
    isStatic: true,
    render: { visible: false },
  };

  const bottomWall = Bodies.rectangle(
    containerWidth / 2,
    containerHeight - WALL_OFFSET,
    containerWidth,
    WALL_THICKNESS,
    wallOptions
  );

  const leftWall = Bodies.rectangle(
    0,
    containerHeight / 2,
    WALL_THICKNESS,
    containerHeight * 2,
    wallOptions
  );

  const rightWall = Bodies.rectangle(
    containerWidth,
    containerHeight / 2,
    WALL_THICKNESS,
    containerHeight * 2,
    wallOptions
  );

  const topWall = Bodies.rectangle(
    containerWidth / 2,
    -WALL_OFFSET,
    containerWidth,
    WALL_THICKNESS,
    wallOptions
  );

  return { bottomWall, leftWall, rightWall, topWall };
};

/**
 * 限制角度在指定範圍內
 */
const clampAngle = (angle: number): number => {
  // 將角度正規化到 -π 到 π 範圍
  let normalizedAngle = angle;
  while (normalizedAngle > Math.PI) normalizedAngle -= 2 * Math.PI;
  while (normalizedAngle < -Math.PI) normalizedAngle += 2 * Math.PI;

  // 限制在 MIN_ANGLE 和 MAX_ANGLE 之間
  return Math.max(MIN_ANGLE, Math.min(MAX_ANGLE, normalizedAngle));
};

/**
 * 從 body 位置提取安全的位置數據
 */
const extractBodyPosition = (body: Matter.Body): IBodyPosition => ({
  id: body.id,
  x: Number.isFinite(body.position.x) ? body.position.x : 0,
  y: Number.isFinite(body.position.y) ? body.position.y : 0,
  angle: Number.isFinite(body.angle) ? body.angle : 0,
});

/**
 * 創建圓形物體
 */
const createCircleBody = (x: number, y: number, radius: number): Matter.Body => {
  return Bodies.circle(x, y, radius, {
    friction: PHYSICS_CONFIG.friction,
    frictionAir: PHYSICS_CONFIG.frictionAir,
    frictionStatic: PHYSICS_CONFIG.frictionStatic,
    density: PHYSICS_CONFIG.density,
    restitution: PHYSICS_CONFIG.restitution,
  });
};

/**
 * 從 path 創建多邊形物體
 */
const createPathBody = (x: number, y: number, pathElement: SVGPathElement): Matter.Body | null => {
  const vertices = pathElementToVertices(pathElement, PATH_SAMPLES);
  const sortedVertices = Vertices.clockwiseSort(vertices);

  const bodiesFromVertices = Bodies.fromVertices(x, y, [sortedVertices], {
    friction: PHYSICS_CONFIG.friction,
    frictionAir: PHYSICS_CONFIG.frictionAir,
    frictionStatic: PHYSICS_CONFIG.frictionStatic,
    density: PHYSICS_CONFIG.density,
    restitution: PHYSICS_CONFIG.restitution,
  });

  return Array.isArray(bodiesFromVertices) ? bodiesFromVertices[0] : bodiesFromVertices;
};

const MOOD_MAP = Object.fromEntries(
  MOOD_OPTIONS.map((option) => [option.id, option.emoji])
) as Record<MoodTypeType, React.FC<React.SVGProps<SVGSVGElement>>>;

/**
 * 將 API 的 checkinDate 格式轉換為顯示格式
 * 從 "2024-01-20" 轉換為 "2024.01.20"
 */
const formatCheckInDate = (checkinDate: string): string => {
  const date = parse(checkinDate, "yyyy-MM-dd", new Date());
  if (!isValid(date)) {
    return checkinDate.replace(/-/g, ".");
  }
  return format(date, "yyyy.MM.dd");
};

interface ICheckInStackProps {
  practiceId: string;
  checkInsData?: PracticeCheckInsResponse;
}

export const CheckInStack = ({ practiceId, checkInsData }: ICheckInStackProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRefsRef = useRef<(SVGSVGElement | null)[]>([]);
  const bodiesRef = useRef<Matter.Body[]>([]);
  const [positions, setPositions] = useState<IBodyPosition[]>([]);
  const [containerHeight, setContainerHeight] = useState(MIN_CONTAINER_HEIGHT);
  const animationFrameRef = useRef<number | undefined>(undefined);
  const [svgGeometries, setSvgGeometries] = useState<(ISvgGeometry | null)[]>([]);

  // 將 API 資料轉換為 ICheckInItem[] 格式
  const items: ICheckInItem[] = useMemo(() => {
    if (!checkInsData?.data) {
      return [];
    }

    return checkInsData.data
      .map((checkIn) => {
        const moodType = mapApiMoodToMoodType(checkIn.mood);
        // 如果沒有心情類型，跳過這個打卡記錄
        if (!moodType) {
          return null;
        }

        return {
          id: String(checkIn.id),
          date: formatCheckInDate(checkIn.checkinDate),
          mood: moodType,
          content: checkIn.note || "",
        };
      })
      .filter((item): item is ICheckInItem => item !== null);
  }, [checkInsData]);

  const count = items.length;

  /**
   * 獲取 SVG 組件配置
   */
  const getSvgConfig = useCallback((index: number) => SVG_CONFIGS[index % SVG_CONFIGS.length], []);

  const getSvgRef = useCallback(
    (index: number) => svgRefsRef.current[index % SVG_CONFIGS.length],
    []
  );

  // 從實際渲染的 SVG 元素中提取幾何數據
  useEffect(() => {
    if (count === 0) return;

    let currentFrameId: number | undefined;
    let isCancelled = false;

    // 檢查所有 SVG refs 是否已準備好
    const checkAndExtractGeometries = () => {
      if (isCancelled) return;

      // 確保所有需要的 SVG refs 都已經存在
      const allRefsReady = SVG_CONFIGS.every((_, i) => svgRefsRef.current[i] != null);
      if (!allRefsReady) {
        // 如果還沒準備好，稍後再試
        currentFrameId = requestAnimationFrame(checkAndExtractGeometries);
        return;
      }

      const geometries: (ISvgGeometry | null)[] = [];

      for (let i = 0; i < count; i++) {
        const svgElement = getSvgRef(i);
        const geometry = svgElement ? extractSvgGeometry(svgElement) : null;
        geometries.push(geometry);
      }

      // 只有在所有幾何數據都準備好時才更新
      const allReady = geometries.every((g) => g !== null);
      if (allReady && !isCancelled) {
        setSvgGeometries(geometries);
      }
    };

    currentFrameId = requestAnimationFrame(checkAndExtractGeometries);

    return () => {
      isCancelled = true;
      if (currentFrameId) cancelAnimationFrame(currentFrameId);
    };
  }, [count, getSvgRef]);

  useEffect(() => {
    if (!containerRef.current) return;

    // 等待所有 SVG 幾何數據準備好
    const isGeometriesReady =
      svgGeometries.length === count && svgGeometries.every((g) => g !== null);
    if (!isGeometriesReady) {
      return;
    }

    // 初始化容器高度
    const initialHeight = Math.max(MIN_CONTAINER_HEIGHT, count * MIN_CONTAINER_HEIGHT);
    setContainerHeight(initialHeight);

    // 創建並配置物理引擎
    const engine = Engine.create();
    engine.gravity.x = PHYSICS_CONFIG.gravity.x;
    engine.gravity.y = PHYSICS_CONFIG.gravity.y;
    engine.timing.timeScale = PHYSICS_CONFIG.timeScale;
    engine.positionIterations = PHYSICS_CONFIG.positionIterations;
    engine.velocityIterations = PHYSICS_CONFIG.velocityIterations;

    // 創建邊界牆
    const { bottomWall, leftWall, rightWall, topWall } = createWalls(
      CONTAINER_WIDTH,
      initialHeight
    );
    World.add(engine.world, [bottomWall, leftWall, rightWall, topWall]);

    // 創建 SVG 物體
    const bodies: Matter.Body[] = [];
    const padding = 20;
    let currentY = 0;

    for (let i = 0; i < count; i++) {
      const geometry = svgGeometries[i];
      if (!geometry) continue;

      const { width, height, isCircle, radius, path } = geometry;
      currentY += height * LAYER_SPACING;

      // 計算 x 位置：偶數索引在左側，奇數索引在右側
      const minX = width / 2 + padding;
      const maxX = CONTAINER_WIDTH - width / 2 - padding;
      const isLeft = i % 2 === 0;
      const x = isLeft ? minX : maxX;

      let body: Matter.Body | null = null;

      // 創建圓形物體
      if (isCircle && radius) {
        body = createCircleBody(x, currentY, radius);
      } else if (path) {
        // 從實際的 SVG 元素中獲取 path 元素
        const svgElement = getSvgRef(i);
        const pathElement = svgElement?.querySelector("path");
        if (pathElement) {
          body = createPathBody(x, currentY, pathElement);
        }
      }

      if (!body) continue;

      // 初始化物體狀態
      Body.setPosition(body, { x, y: currentY });
      Body.setVelocity(body, { x: 0, y: 0 });
      Body.setAngle(body, 0);
      // 限制角速度，防止快速旋轉
      Body.setAngularVelocity(body, 0);
      bodies.push(body);
    }

    bodiesRef.current = bodies;
    World.add(engine.world, bodies);

    // 初始化位置
    const initialPositions = bodies.map(extractBodyPosition);
    setPositions(initialPositions);

    // 更新位置和容器高度
    let currentContainerHeight = initialHeight;

    const updatePositions = () => {
      // 限制所有物體的角度在 -20度 到 20度 之間
      bodies.forEach((body) => {
        // 限制角度
        const clampedAngle = clampAngle(body.angle);
        if (Math.abs(body.angle - clampedAngle) > 0.001) {
          Body.setAngle(body, clampedAngle);
        }

        // 限制角速度，防止快速旋轉
        const currentAngularVelocity = body.angularVelocity ?? 0;
        if (Math.abs(currentAngularVelocity) > MAX_ANGULAR_VELOCITY) {
          const clampedVelocity =
            currentAngularVelocity > 0 ? MAX_ANGULAR_VELOCITY : -MAX_ANGULAR_VELOCITY;
          Body.setAngularVelocity(body, clampedVelocity);
        }

        // 如果角度已經達到邊界，停止旋轉
        if (
          (clampedAngle <= MIN_ANGLE && currentAngularVelocity < 0) ||
          (clampedAngle >= MAX_ANGLE && currentAngularVelocity > 0)
        ) {
          Body.setAngularVelocity(body, 0);
        }
      });

      const newPositions = bodies.map(extractBodyPosition);
      setPositions(newPositions);

      // 計算所有物體的最大高度
      const maxY = bodies.reduce((max, body, index) => {
        const geometry = svgGeometries[index];
        if (!geometry) return max;
        const y = body.position.y + geometry.height / 2;
        return Math.max(max, y);
      }, 0);

      const newHeight = Math.max(MIN_CONTAINER_HEIGHT, maxY + 8);
      if (newHeight !== currentContainerHeight) {
        currentContainerHeight = newHeight;
        setContainerHeight(newHeight);

        // 更新邊界位置
        Body.setPosition(bottomWall, {
          x: CONTAINER_WIDTH / 2,
          y: newHeight - WALL_OFFSET,
        });
        Body.setPosition(topWall, {
          x: CONTAINER_WIDTH / 2,
          y: -WALL_OFFSET,
        });
        Body.setPosition(leftWall, { x: 0, y: newHeight / 2 });
        Body.setPosition(rightWall, {
          x: CONTAINER_WIDTH,
          y: newHeight / 2,
        });
      }

      animationFrameRef.current = requestAnimationFrame(updatePositions);
    };

    // 運行物理引擎
    const runnerInstance = Runner.create();
    Runner.run(runnerInstance, engine);

    // 開始更新位置
    animationFrameRef.current = requestAnimationFrame(updatePositions);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      Runner.stop(runnerInstance);
      World.clear(engine.world, false);
      Engine.clear(engine);
    };
  }, [count, svgGeometries, getSvgRef]);

  /**
   * 處理 SVG ref 的回調
   */
  const handleSvgRef = (index: number) => (el: SVGSVGElement | null) => {
    if (el) svgRefsRef.current[index] = el;
  };

  /**
   * 生成 clip-path CSS 值
   */
  const getClipPath = (geometry: ISvgGeometry | null, index: number): string => {
    if (!geometry) return "";

    if (geometry.isCircle && geometry.radius) {
      // 對於圓形，使用 circle() 函數
      const radiusPercent = (geometry.radius / Math.max(geometry.width, geometry.height)) * 100;
      return `circle(${radiusPercent}% at 50% 50%)`;
    }

    if (geometry.path) {
      // 對於 path，使用 path() 函數
      // 需要將 path 的座標系統轉換為百分比
      // 這裡我們使用 SVG clipPath 的方式更可靠
      return `url(#clip-path-${index})`;
    }

    return "";
  };

  // 如果沒有資料（載入完成後），不顯示任何內容
  if (count === 0) {
    return null;
  }

  return (
    <div
      ref={containerRef}
      className="relative"
      style={{ width: CONTAINER_WIDTH, height: containerHeight }}
    >
      {/* 隱藏的 SVG 區域，用於提取幾何數據 */}
      <div className="absolute opacity-0 pointer-events-none invisible h-px overflow-hidden">
        {SVG_CONFIGS.map(({ name, Component }, i) => (
          <Component key={name} ref={handleSvgRef(i)} />
        ))}
      </div>

      {/* SVG clipPath 定義 */}
      <svg width="0" height="0" className="absolute" aria-hidden="true">
        <defs>
          {positions.map((position, i) => {
            const geometry = svgGeometries[i];
            if (!geometry || !geometry.path) return null;

            return (
              <clipPath key={position.id} id={`clip-path-${i}`}>
                <path d={geometry.path} />
              </clipPath>
            );
          })}
        </defs>
      </svg>

      {/* 渲染物理物體 */}
      {positions.map((position, i) => {
        const config = getSvgConfig(i);
        if (!config) return null;
        const { Component } = config;

        const geometry = svgGeometries[i];
        if (!geometry) return null;
        const { width, height } = geometry;
        const x = Number.isFinite(position.x) ? position.x : 0;
        const y = Number.isFinite(position.y) ? position.y : 0;
        const angle = Number.isFinite(position.angle) ? position.angle : 0;
        const w = Number.isFinite(width) ? width : 0;
        const h = Number.isFinite(height) ? height : 0;
        const id = position.id;

        const left = x - w / 2 - WALL_THICKNESS;
        const top = y - h / 2;

        // 如果計算結果無效，不渲染
        if (!Number.isFinite(left) || !Number.isFinite(top)) {
          return null;
        }

        const clipPath = getClipPath(geometry, i);
        const item = items[i];

        if (!item) return null;

        const { mood, date, content } = item;
        const Emoji = (MOOD_MAP[mood as MoodTypeType] ?? MOOD_OPTIONS[0]?.emoji) as React.FC<
          React.SVGProps<SVGSVGElement>
        >;

        return (
          <Link
            key={id}
            href={`/practices/${practiceId}/check-ins/${item.id}`}
            className="absolute cursor-pointer hover:shadow-2xl"
            style={{
              width: w,
              height: h,
              left,
              top,
              transform: `rotate(${angle}rad) ${i % 5 === 3 ? "translateY(20px)" : ""}`,
              transformOrigin: "center center",
              clipPath: clipPath || undefined,
            }}
          >
            <Component className="w-full h-full" />
            <div
              className={cn(
                "absolute top-0 left-0 w-full h-full flex flex-col items-center justify-center gap-2",
                i % 5 === 3 && "pb-11"
              )}
            >
              <Emoji className="size-6" />
              <div className="text-xs text-bg-dark">{date}</div>
              <div className="max-w-40 text-bg-dark line-clamp-2">{content}</div>
            </div>
          </Link>
        );
      })}
    </div>
  );
};
