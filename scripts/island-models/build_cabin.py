# 島嶼小木屋（completed 實踐建築）建模腳本
# 用法: blender -b -P build_cabin.py -- <output_dir>
# 產出: cabin.glb
# 風格護欄：低面數、圓潤、純色材質；底色取淺暖木色，
# engine 端會再朝實踐 theme_color lerp 0.45 染色
import bpy
import math
import sys

out_dir = sys.argv[sys.argv.index("--") + 1] if "--" in sys.argv else "."

def srgb_to_linear(c):
    return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4

def hex_rgba(h, alpha=1.0):
    h = h.lstrip("#")
    r, g, b = (int(h[i:i+2], 16) / 255 for i in (0, 2, 4))
    return (srgb_to_linear(r), srgb_to_linear(g), srgb_to_linear(b), alpha)

WALL = hex_rgba("#D9B48F")     # 淺暖木
ROOF = hex_rgba("#8A5A44")     # 深木
DOOR = hex_rgba("#6B4B36")
WINDOW = hex_rgba("#98ECFF")   # mascot.aqua
CHIMNEY = hex_rgba("#9FB5B8")  # gray.mid

def mat(name, rgba, rough=0.8):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    bsdf = m.node_tree.nodes["Principled BSDF"]
    bsdf.inputs["Base Color"].default_value = rgba
    bsdf.inputs["Roughness"].default_value = rough
    return m

M_WALL = mat("wall", WALL)
M_ROOF = mat("roof", ROOF)
M_DOOR = mat("door", DOOR)
M_WINDOW = mat("window", WINDOW, rough=0.3)
M_CHIMNEY = mat("chimney", CHIMNEY)

bpy.ops.object.select_all(action="SELECT")
bpy.ops.object.delete()

def add_box(name, size, loc, m):
    bpy.ops.mesh.primitive_cube_add(size=1, location=loc)
    o = bpy.context.object
    o.name = name
    o.scale = (size[0] / 2, size[1] / 2, size[2] / 2)
    o.data.materials.append(m)
    return o

# 牆身（正面朝 -Y）
add_box("wall_body", (2.0, 1.7, 1.15), (0, 0, 0.575), M_WALL)

# 屋頂：四角錐（旋轉 45° 對齊牆身）
bpy.ops.mesh.primitive_cone_add(vertices=4, radius1=1.72, radius2=0.06, depth=0.95,
                                location=(0, 0, 1.62), rotation=(0, 0, math.radians(45)))
roof = bpy.context.object
roof.name = "roof"
roof.data.materials.append(M_ROOF)

# 門（正面）＋門把
add_box("door", (0.45, 0.06, 0.72), (0.25, -0.87, 0.36), M_DOOR)
bpy.ops.mesh.primitive_uv_sphere_add(segments=12, ring_count=8, radius=0.035, location=(0.42, -0.905, 0.38))
knob = bpy.context.object
knob.name = "door_knob"
knob.data.materials.append(M_CHIMNEY)
bpy.ops.object.shade_smooth()

# 窗（正面另一側 + 側面）
add_box("window_front", (0.4, 0.06, 0.4), (-0.5, -0.87, 0.68), M_WINDOW)
add_box("window_side", (0.06, 0.5, 0.4), (1.02, 0.15, 0.68), M_WINDOW)

# 煙囪
bpy.ops.mesh.primitive_cylinder_add(vertices=10, radius=0.12, depth=0.6, location=(-0.55, 0.35, 1.85))
chimney = bpy.context.object
chimney.name = "chimney"
chimney.data.materials.append(M_CHIMNEY)

# 合併與匯出
bpy.ops.object.select_all(action="SELECT")
bpy.context.view_layer.objects.active = bpy.data.objects["wall_body"]
bpy.ops.object.join()
bpy.context.object.name = "Cabin"

glb_path = f"{out_dir}/cabin.glb"
bpy.ops.export_scene.gltf(filepath=glb_path, export_format="GLB", use_selection=True)
print(f"EXPORTED: {glb_path}")
