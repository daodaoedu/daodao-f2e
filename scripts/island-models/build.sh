#!/usr/bin/env bash
# island-3d 正式素材產線（tasks 5.1/5.2）
# 產出 packages/assets/models/island/*.glb（檔名對齊 engine manifest）
# 來源：Kenney CC0 素材包（貼圖內嵌）＋ Blender bpy 腳本建模（角色、小木屋）
# 需求：curl、unzip、npx、blender（brew install --cask blender）
set -euo pipefail
cd "$(dirname "$0")"

REPO_ROOT=$(cd ../.. && pwd)
OUT="$REPO_ROOT/packages/assets/models/island"
CACHE="${KENNEY_CACHE:-${TMPDIR:-/tmp}/kenney-cache}"
BLENDER_BIN="${BLENDER_BIN:-$(command -v blender || echo /Applications/Blender.app/Contents/MacOS/Blender)}"
mkdir -p "$OUT" "$CACHE"

# 1. 下載 Kenney 包（CC0；URL 若失效請至 kenney.nl/assets 重新取得）
download() {
  local name=$1 url=$2
  if [ ! -d "$CACHE/$name" ]; then
    echo "下載 $name..."
    curl -sL -A "Mozilla/5.0" -o "$CACHE/$name.zip" "$url"
    mkdir -p "$CACHE/$name" && unzip -qo "$CACHE/$name.zip" -d "$CACHE/$name"
  fi
}
download survival "https://kenney.nl/media/pages/assets/survival-kit/4065a8185b-1712149243/kenney_survival-kit.zip"
download pirate "https://kenney.nl/media/pages/assets/pirate-kit/e6d4bb1525-1771333093/kenney_pirate-kit.zip"
download nature "https://kenney.nl/media/pages/assets/nature-kit/37ac38a37b-1677698939/kenney_nature-kit.zip"
download cube-pets "https://kenney.nl/media/pages/assets/cube-pets/44e58e945f-1774520254/kenney_cube-pets_1.0.zip"

# 2. Kenney 模型 → manifest 檔名（gltf-transform copy 內嵌外部貼圖）
#    格式：pack:來源檔名:輸出檔名（nature 包的模型目錄叫 "GLTF format"）
KENNEY_MODELS=(
  "survival:tent-canvas:tent"
  "survival:campfire-pit:campfire-lit"
  "survival:campfire-pit:campfire-out"
  "survival:patch-grass:grass-patch"
  "survival:grass-large:grass-tuft"
  "pirate:palm-detailed-bend:palm-tree"
  "pirate:palm-straight:palm-tree-straight"
  "pirate:rocks-sand-a:rock"
  "pirate:chest:chest"
  "pirate:barrel:barrel"
  "pirate:crate:crate"
  "pirate:flag-pennant:flag"
  "pirate:structure-platform-dock:dock"
  "pirate:boat-row-small:boat"
  "nature:flower_purpleA:flower-a"
  "nature:flower_redA:flower-b"
  "nature:flower_yellowA:flower-c"
  "nature:mushroom_red:mushroom"
  "nature:plant_bush:bush"
  "nature:tree_default:tree"
  "nature:tree_fat:tree-oak"
  "nature:log:log"
  "cube-pets:animal-bunny:animal-bunny"
  "cube-pets:animal-bee:animal-bee"
  "cube-pets:animal-chick:animal-chick"
  "cube-pets:animal-crab:animal-crab"
  "cube-pets:animal-deer:animal-deer"
  "cube-pets:animal-fish:animal-fish"
  "cube-pets:animal-fox:animal-fox"
  "cube-pets:animal-parrot:animal-parrot"
)
WORK=$(mktemp -d)
for entry in "${KENNEY_MODELS[@]}"; do
  IFS=':' read -r pack src dst <<< "$entry"
  MODELS_DIR="GLB format"
  if [ "$pack" = "nature" ]; then MODELS_DIR="GLTF format"; fi
  npx --yes @gltf-transform/cli copy "$CACHE/$pack/Models/$MODELS_DIR/$src.glb" "$WORK/$dst.glb"
done

# 3a. 角色：KayKit Adventurers 五隻（CC0，rigged）→ 五人格分身＋通用旅人替身
#     動畫裁剪到只剩 Idle/Walking_A（原檔 90+ 支剪輯 2.5MB → ~250KB）
#     品牌吉祥物定案後換回自建（build_character.py 保留）
KAYKIT_BASE="https://raw.githubusercontent.com/KayKit-Game-Assets/KayKit-Character-Pack-Adventures-1.0/main/addons/kaykit_character_pack_adventures/Characters/gltf"
# 人格對映：D 探探→Mage、A 動動→Barbarian、O 構構→Knight、L 跨跨→Rogue、
# C 連連→Rogue_Hooded；通用旅人（未測驗/未登入）→Rogue_Hooded 斗篷旅人
KAYKIT_CHARACTERS=(
  "Mage:mage_texture:character-role-d"
  "Barbarian:barbarian_texture:character-role-a"
  "Knight:knight_texture:character-role-o"
  "Rogue:rogue_texture:character-role-l"
  "Rogue_Hooded:rogue_texture:character-role-c"
  "Rogue_Hooded:rogue_texture:character-traveler"
)
for entry in "${KAYKIT_CHARACTERS[@]}"; do
  IFS=':' read -r src tex dst <<< "$entry"
  if [ ! -f "$CACHE/$src.glb" ]; then
    echo "下載 KayKit $src..."
    curl -sL "$KAYKIT_BASE/$src.glb" -o "$CACHE/$src.glb"
  fi
  if [ ! -f "$CACHE/$tex.png" ]; then
    curl -sL "$KAYKIT_BASE/$tex.png" -o "$CACHE/$tex.png"
  fi
  cp "$CACHE/$src.glb" "$CACHE/$tex.png" "$WORK/"
  # copy 內嵌外部貼圖 → 裁剪動畫
  npx --yes @gltf-transform/cli copy "$WORK/$src.glb" "$WORK/$dst.embedded.glb"
  node "$(dirname "$0")/strip-animations.mjs" "$WORK/$dst.embedded.glb" "$WORK/$dst.glb"
  rm "$WORK/$dst.embedded.glb"
done
rm -f "$WORK"/Mage.glb "$WORK"/Barbarian.glb "$WORK"/Knight.glb "$WORK"/Rogue.glb "$WORK"/Rogue_Hooded.glb "$WORK"/*_texture.png

# 3b. Blender 建模：小木屋
"$BLENDER_BIN" -b -P build_cabin.py -- "$WORK" >/dev/null

# 4. 全部 Draco 壓縮進 OUT
for glb in "$WORK"/*.glb; do
  name=$(basename "$glb")
  npx --yes @gltf-transform/cli optimize "$glb" "$OUT/$name" \
    --compress draco --join false --flatten false 2>/dev/null
done
rm -rf "$WORK"

echo "--- 產出 ---"
ls -la "$OUT"/*.glb | awk '{printf "%8d  %s\n", $5, $NF}'
TOTAL=$(du -ck "$OUT"/*.glb | tail -1 | cut -f1)
echo "總量: ${TOTAL}KB（預算 3MB）"
