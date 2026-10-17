"""Measured starter scene for Blender 4.5. One unit is one metre. +Y is north."""

import bpy

bpy.ops.wm.read_factory_settings(use_empty=True)

scene = bpy.context.scene
scene.unit_settings.system = "METRIC"
scene.unit_settings.scale_length = 1.0
scene.unit_settings.length_unit = "METERS"
try:
    scene.render.engine = "BLENDER_EEVEE_NEXT"
except TypeError:
    scene.render.engine = "BLENDER_EEVEE"

def material(name, color, rough=0.78):
    mat = bpy.data.materials.new(name)
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes.get("Principled BSDF")
    bsdf.inputs["Base Color"].default_value = (*color, 1)
    bsdf.inputs["Roughness"].default_value = rough
    return mat

SAND = material("Sandstone", (0.72, 0.48, 0.32))
MARBLE = material("Marble", (0.93, 0.90, 0.84), 0.45)
PLASTER = material("Plaster", (0.86, 0.75, 0.62))
FACADE = material("PinkPlaster", (0.89, 0.72, 0.60))
RUBBLE = material("Rubble", (0.55, 0.46, 0.36), 0.9)
MASONRY = material("Masonry", (0.62, 0.52, 0.40))
LAWN = material("Lawn", (0.28, 0.42, 0.22), 0.85)
WATER = material("Water", (0.12, 0.24, 0.24), 0.15)
DARK = material("Opening", (0.05, 0.04, 0.035), 0.6)
CLOTH = material("Figure", (0.43, 0.23, 0.16))

def collection(name):
    col = bpy.data.collections.new(name)
    scene.collection.children.link(col)
    return col

def put(obj, col):
    for parent in list(obj.users_collection):
        parent.objects.unlink(obj)
    col.objects.link(obj)

def cube(name, col, cx, cy, cz, sx, sy, sz, mat):
    bpy.ops.mesh.primitive_cube_add(size=1, location=(cx, cy, cz))
    obj = bpy.context.active_object
    obj.name = name
    obj.scale = (sx, sy, sz)
    bpy.ops.object.transform_apply(scale=True)
    obj.data.materials.append(mat)
    put(obj, col)
    return obj

def cyl(name, col, cx, cy, cz, radius, depth, mat, verts=12):
    bpy.ops.mesh.primitive_cylinder_add(vertices=verts, radius=radius, depth=depth, location=(cx, cy, cz))
    obj = bpy.context.active_object
    obj.name = name
    obj.data.materials.append(mat)
    put(obj, col)
    return obj

def sphere(name, col, cx, cy, cz, radius, mat):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=16, ring_count=10, radius=radius, location=(cx, cy, cz))
    obj = bpy.context.active_object
    obj.name = name
    obj.scale = (1, 1, 0.72)
    bpy.ops.object.transform_apply(scale=True)
    obj.data.materials.append(mat)
    put(obj, col)
    return obj

# three.js +Z was south. Blender +Y is north, so y = -threeZ.
def y_of(three_z):
    return -three_z

PRECINCT = collection("01_Precinct")
PALACE = collection("02_Palace")
GATES = collection("03_Gates")
STAMBH = collection("04_VijayStambh")
LATER = collection("05_LaterBuildings")
SCALE = collection("06_ScaleFigure")
GROUND = collection("00_Ground")

p_west, p_north_z = -44.0, -28.0
p_w, p_d = 121.92, 76.2  # 400 ft by 250 ft
p_east = p_west + p_w
p_south_z = p_north_z + p_d
mid_y = (y_of(p_north_z) + y_of(p_south_z)) / 2
mid_x = (p_west + p_east) / 2

cube("Ground", GROUND, mid_x, mid_y, -0.15, p_w + 80, p_d + 80, 0.3, LAWN)

cube("WallWest", PRECINCT, p_west, mid_y, 5.2, 1.8, p_d, 10.4, MASONRY)
cube("WallEast", PRECINCT, p_east, mid_y, 5.2, 1.8, p_d, 10.4, MASONRY)
cube("WallNorth", PRECINCT, mid_x, y_of(p_north_z), 4.6, p_w, 1.6, 9.2, MASONRY)
cube("WallSouthLeft", PRECINCT, (p_west + -8) / 2, y_of(p_south_z), 4.2, -8 - p_west, 1.6, 8.4, MASONRY)
cube("WallSouthRight", PRECINCT, (12 + p_east) / 2, y_of(p_south_z), 4.2, p_east - 12, 1.6, 8.4, MASONRY)

# Photographed rooms, human scale. Not stretched to fill the precinct.
cube("DomeBlock", PALACE, 8, y_of(5), 1.55 + 7.7, 14, 12.2, 15.4, PLASTER)
sphere("GreatDome", PALACE, 8, y_of(5), 1.55 + 15.4 + 2.2, 5.2, PLASTER)
cube("ZananaCourtFloor", PALACE, -6, y_of(0), 0.08, 12, 10, 0.16, MASONRY)
cube("Diwan", PALACE, 0, y_of(-22), 1.55 + 3.2, 18, 10.6, 6.4, PLASTER)
cube("WestFacade", PALACE, -32, y_of(2), 6.8, 3.4, 28, 13.6, FACADE)
cube("WestFacadeRubble", PALACE, -34, y_of(2), 2.7, 1.2, 28.4, 5.4, RUBBLE)

# Jharokha rows on the west face (projects toward -X).
for row_z in (5.6, 8.5, 11.2):
    for i in range(7):
        bz = 2 - 9 + i * 3
        if row_z < 6.2 and abs(bz - 2) < 1.3:
            continue
        cube(f"Jharokha_{row_z}_{i}", PALACE, -34.4, y_of(bz), row_z, 0.7, 1.45, 0.9, SAND)

cube("SurajPol", GATES, 0, y_of(20), 2.4, 5.2, 1.6, 4.8, MASONRY)
cube("SurajOpening", GATES, 0, y_of(20), 1.8, 2.2, 1.7, 3.2, DARK)
cube("Tripolia", GATES, 2, y_of(46), 2.6, 8.4, 1.8, 5.2, MASONRY)
cube("TripoliaOpening", GATES, 2, y_of(46), 2.0, 2.4, 1.9, 3.6, DARK)
cyl("BastionWest", GATES, -6.5, y_of(48), 3.6, 3.3, 7.2, MASONRY)
cyl("BastionEast", GATES, 10.5, y_of(48), 3.6, 3.3, 7.2, MASONRY)
cube("Stables", PALACE, -20, y_of(36), 2.3, 18, 8, 4.6, MASONRY)

# Vijay Stambh. Tod / ASI: 37.19 m, faces 10.67 m to 5.33 m, terrace 12.8 m.
sx, sy = 100.0, y_of(64.0)
terrace = 1.5
cube("StambhTerrace", STAMBH, sx, sy, terrace / 2, 12.8, 12.8, terrace, MASONRY)
storeys = [5.2, 3.6, 3.6, 3.6, 3.6, 3.5, 3.5, 3.4, 3.3]
z0 = terrace
under = 33.7
for index, height in enumerate(storeys):
    mid = z0 + height / 2 - terrace
    t = min(1.0, max(0.0, mid / under))
    face = 10.67 + (5.33 - 10.67) * t
    skin = SAND if index % 2 == 0 else MARBLE
    cube(f"Storey_{index + 1}", STAMBH, sx, sy, z0 + height / 2, face, face, height, skin)
    cube(f"Cornice_{index + 1}", STAMBH, sx, sy, z0 + height - 0.14, face + 0.85, face + 0.85, 0.26, MASONRY)
    half = face / 2 + 0.55
    door = index == 0
    for fx, fy in ((0, 1), (0, -1), (1, 0), (-1, 0)):
        ow = 1.7 if door and fy == 1 else 0.95
        oh = 2.6 if door and fy == 1 else min(1.7, height * 0.48)
        oz = 1.7 if door else height * 0.48
        if fx == 0:
            cube(f"Opening_{index}_{fx}_{fy}", STAMBH, sx, sy + fy * (half), z0 + oz, ow, 0.2, oh, DARK)
        else:
            cube(f"Opening_{index}_{fx}_{fy}", STAMBH, sx + fx * (half), sy, z0 + oz, 0.2, ow, oh, DARK)
    z0 += height
sphere("StambhCupola", STAMBH, sx, sy, z0 + 1.2, 1.7, MARBLE)

cube("Person_1_7m", SCALE, sx - 8, sy + 8, 0.85, 0.45, 0.3, 1.7, CLOTH)

cube("FatehPrakash", LATER, 108, y_of(-2), 4.2, 26, 20, 8.4, PLASTER)
cube("NauLakhaBandar", LATER, 106, y_of(24), 3.1, 16, 11, 6.2, MASONRY)
cyl("JauharKund", LATER, -6, y_of(62), 0.08, 6.5, 0.16, WATER, verts=24)

sun = bpy.data.lights.new("Sun", type="SUN")
sun.energy = 4
sun_obj = bpy.data.objects.new("Sun", sun)
sun_obj.rotation_euler = (0.9, 0.2, 0.6)
scene.collection.objects.link(sun_obj)

bpy.ops.object.camera_add(location=(sx + 28, sy + 22, 16))
cam = bpy.context.active_object
cam.name = "Camera_Stambh"
direction = (sx - cam.location.x, sy - cam.location.y, 16 - cam.location.z)
import math
from mathutils import Vector
rot = Vector(direction).to_track_quat("-Z", "Y").to_euler()
cam.rotation_euler = rot
scene.camera = cam

blend_path = "/workspace/export/kumbha-palace.blend"
glb_path = "/workspace/export/kumbha-palace.glb"
bpy.ops.wm.save_as_mainfile(filepath=blend_path)
bpy.ops.export_scene.gltf(filepath=glb_path, export_format="GLB", export_apply=True)
print("WROTE", blend_path, glb_path)
