/**
 * 裁剪 GLB 動畫剪輯：只保留指定名單（預設 Idle / Walking_A）
 * KayKit 角色帶 90+ 支動畫（~2.5MB），島嶼只用到兩支——裁剪後約 250KB
 *
 * 用法: node strip-animations.mjs <input.glb> <output.glb> [keep1,keep2,...]
 */
import { NodeIO } from "@gltf-transform/core";
import { KHRONOS_EXTENSIONS } from "@gltf-transform/extensions";
import { prune } from "@gltf-transform/functions";

const [input, output, keepArg] = process.argv.slice(2);
if (!input || !output) {
  console.error("用法: node strip-animations.mjs <input.glb> <output.glb> [keep1,keep2]");
  process.exit(1);
}
const keep = new Set((keepArg ?? "Idle,Walking_A").split(","));

const io = new NodeIO().registerExtensions(KHRONOS_EXTENSIONS);
const document = await io.read(input);

let removed = 0;
for (const animation of document.getRoot().listAnimations()) {
  if (keep.has(animation.getName())) continue;
  animation.dispose();
  removed++;
}
await document.transform(prune());
await io.write(output, document);
console.log(`stripped ${removed} clips, kept: ${[...keep].join(", ")}`);
