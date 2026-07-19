import type { IControlInputState } from "./index";

export const BOAT_FORWARD_SPEED = 6.2;
export const BOAT_REVERSE_SPEED = 2.8;
export const BOAT_TURN_SPEED = 1.65;

export interface IBoatPose {
  x: number;
  z: number;
  heading: number;
}

export interface IBoatNavigationBounds {
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
}

export interface IBoatDockTarget {
  x: number;
  z: number;
  radius: number;
}

const clamp = (value: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, value));

/**
 * 航道內的 arcade 操船：前後控制推進、左右控制船頭。
 * 船頭可 360 度轉向；航行目的地由實際靠近哪一座島決定。
 */
export const advanceBoatPose = (
  pose: IBoatPose,
  input: Pick<IControlInputState, "moveX" | "moveZ">,
  deltaSeconds: number,
  bounds: IBoatNavigationBounds
): IBoatPose => {
  const throttle = clamp(-input.moveZ, -1, 1);
  const steering = clamp(input.moveX, -1, 1);
  const turnFactor = 0.35 + Math.abs(throttle) * 0.65;
  const rawHeading = pose.heading + steering * BOAT_TURN_SPEED * turnFactor * deltaSeconds;
  const heading = Math.atan2(Math.sin(rawHeading), Math.cos(rawHeading));

  const speed = throttle >= 0 ? BOAT_FORWARD_SPEED : BOAT_REVERSE_SPEED;
  const distance = throttle * speed * deltaSeconds;

  return {
    x: clamp(pose.x + Math.sin(heading) * distance, bounds.minX, bounds.maxX),
    z: clamp(pose.z + Math.cos(heading) * distance, bounds.minZ, bounds.maxZ),
    heading,
  };
};

const pointToSegmentDistanceSquared = (
  pointX: number,
  pointZ: number,
  start: IBoatPose,
  end: IBoatPose
): number => {
  const segmentX = end.x - start.x;
  const segmentZ = end.z - start.z;
  const lengthSquared = segmentX * segmentX + segmentZ * segmentZ;
  if (lengthSquared < 1e-8) {
    return (pointX - start.x) ** 2 + (pointZ - start.z) ** 2;
  }

  const projection = clamp(
    ((pointX - start.x) * segmentX + (pointZ - start.z) * segmentZ) / lengthSquared,
    0,
    1
  );
  const nearestX = start.x + segmentX * projection;
  const nearestZ = start.z + segmentZ * projection;
  return (pointX - nearestX) ** 2 + (pointZ - nearestZ) ** 2;
};

/** 用線段判定避免低幀率時單幀跨過碼頭卻沒有觸發靠港。 */
export const didBoatReachDock = (
  previousPose: IBoatPose,
  nextPose: IBoatPose,
  target: IBoatDockTarget
): boolean =>
  pointToSegmentDistanceSquared(target.x, target.z, previousPose, nextPose) <=
  target.radius * target.radius;
