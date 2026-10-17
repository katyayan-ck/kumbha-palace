"""Vijay Stambh alone. One metre per unit. Door faces +Y.

37.2 m, nine storeys, face 10.67 m at the bottom and 5.33 m under the cupola.
Each niche carries the same small relief. They are not the named sculptures.
"""

import math
import bpy
import bmesh

bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene
scene.unit_settings.system = "METRIC"
scene.unit_settings.scale_length = 1.0
scene.unit_settings.length_unit = "METERS"
scene.render.engine = "CYCLES"
scene.cycles.samples = 24
scene.cycles.device = "CPU"
scene.render.resolution_x = 1080
scene.render.resolution_y = 1620

def stone(name, color, scale, strength, rough):
    mat = bpy.data.materials.new(name)
    mat.use_nodes = True
    nt = mat.node_tree
    bsdf = nt.nodes["Principled BSDF"]
    bsdf.inputs["Base Color"].default_value = (*color, 1)
    bsdf.inputs["Roughness"].default_value = rough
    noise = nt.nodes.new("ShaderNodeTexNoise")
    noise.inputs["Scale"].default_value = scale
    noise.inputs["Detail"].default_value = 8
    bump = nt.nodes.new("ShaderNodeBump")
    bump.inputs["Strength"].default_value = strength
    nt.links.new(noise.outputs["Fac"], bump.inputs["Height"])
    nt.links.new(bump.outputs["Normal"], bsdf.inputs["Normal"])
    return mat

SAND = stone("RedSandstone", (0.62, 0.32, 0.20), 18, 0.55, 0.72)
MARBLE = stone("WhiteMarble", (0.90, 0.87, 0.80), 22, 0.2, 0.35)
DARK = stone("Opening", (0.03, 0.025, 0.02), 2, 0, 0.4)
MASONRY = stone("Masonry", (0.45, 0.34, 0.24), 8, 0.6, 0.85)

def put(mesh, mat, name, loc, rot=(0, 0, 0)):
    obj = bpy.data.objects.new(name, mesh)
    obj.location = loc
    obj.rotation_euler = rot
    if mat and mat.name not in {slot.name for slot in mesh.materials}:
        mesh.materials.append(mat)
    scene.collection.objects.link(obj)
    return obj

def cube_mesh(sx, sy, sz, name="cube"):
    mesh = bpy.data.meshes.new(name)
    bm = bmesh.new()
    made = bmesh.ops.create_cube(bm, size=1.0)
    for v in made["verts"]:
        v.co.x *= sx
        v.co.y *= sy
        v.co.z *= sz
    bm.to_mesh(mesh)
    bm.free()
    return mesh

def add_box(bm, cx, cy, cz, sx, sy, sz):
    made = bmesh.ops.create_cube(bm, size=1.0)
    for v in made["verts"]:
        v.co.x = v.co.x * sx + cx
        v.co.y = v.co.y * sy + cy
        v.co.z = v.co.z * sz + cz

def arch_mesh(span, rise, thick, depth):
    mesh = bpy.data.meshes.new("arch")
    segs = 14
    bm = bmesh.new()
    outer, inner = [], []
    for i in range(segs + 1):
        a = math.pi * i / segs
        c, s = math.cos(a), math.sin(a)
        outer.append((span * c, rise * s))
        inner.append(((span - thick) * c, max(0.04, rise - thick) * s))
    n = segs + 1
    front, back = [], []
    for x, z in outer + inner:
        front.append(bm.verts.new((x, -depth / 2, z)))
    for x, z in outer + inner:
        back.append(bm.verts.new((x, depth / 2, z)))
    for i in range(segs):
        bm.faces.new((front[i], front[i + 1], front[n + i + 1], front[n + i]))
        bm.faces.new((back[i + 1], back[i], back[n + i], back[n + i + 1]))
        bm.faces.new((front[i], back[i], back[i + 1], front[i + 1]))
        bm.faces.new((front[n + i + 1], back[n + i + 1], back[n + i], front[n + i]))
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    bm.to_mesh(mesh)
    bm.free()
    return mesh

def figure_mesh():
    mesh = bpy.data.meshes.new("ReliefFigure")
    bm = bmesh.new()
    add_box(bm, 0, 0, 0.62, 0.32, 0.1, 0.62)
    add_box(bm, -0.1, 0, 0.18, 0.09, 0.08, 0.36)
    add_box(bm, 0.1, 0, 0.18, 0.09, 0.08, 0.36)
    add_box(bm, -0.22, 0, 0.72, 0.08, 0.08, 0.4)
    add_box(bm, 0.22, 0, 0.72, 0.08, 0.08, 0.4)
    bm.to_mesh(mesh)
    bm.free()
    return mesh

def head_mesh():
    mesh = bpy.data.meshes.new("Head")
    bm = bmesh.new()
    bmesh.ops.create_uvsphere(bm, u_segments=8, v_segments=6, radius=0.13)
    bm.to_mesh(mesh)
    bm.free()
    return mesh

def shell_mesh(face, height):
    mesh = bpy.data.meshes.new("storey")
    bm = bmesh.new()
    add_box(bm, 0, 0, height / 2, face - 0.4, face - 0.4, height * 0.9)
    half = face / 2 - 0.2
    for x, y in ((half, half), (half, -half), (-half, half), (-half, -half)):
        add_box(bm, x, y, height / 2, 0.58, 0.58, height)
    add_box(bm, 0, 0, height - 0.11, face + 0.9, face + 0.9, 0.22)
    add_box(bm, 0, 0, 0.08, face + 0.4, face + 0.4, 0.16)
    count = 14
    for i in range(count):
        t = -face / 2 + (i + 0.5) * face / count
        add_box(bm, t, face / 2 + 0.32, height - 0.42, 0.12, 0.18, 0.22)
        add_box(bm, t, -(face / 2 + 0.32), height - 0.42, 0.12, 0.18, 0.22)
        add_box(bm, face / 2 + 0.32, t, height - 0.42, 0.18, 0.12, 0.22)
        add_box(bm, -(face / 2 + 0.32), t, height - 0.42, 0.18, 0.12, 0.22)
    reach = face / 2 + 0.7
    add_box(bm, 0, reach, 0.55, 2.4, 0.85, 0.14)
    add_box(bm, 0, -reach, 0.55, 2.4, 0.85, 0.14)
    add_box(bm, reach, 0, 0.55, 0.85, 2.4, 0.14)
    add_box(bm, -reach, 0, 0.55, 0.85, 2.4, 0.14)
    # brackets under the north balcony, the face the camera sees
    for x in (-0.7, 0.7):
        add_box(bm, x, reach, 0.28, 0.22, 0.45, 0.32)
    bm.to_mesh(mesh)
    bm.free()
    return mesh

FIG = figure_mesh()
HEAD = head_mesh()
ARCH = arch_mesh(0.7, 1.15, 0.16, 0.32)
DOOR = arch_mesh(1.2, 2.2, 0.2, 0.4)
HOLE = cube_mesh(0.9, 0.16, 1.55, "hole")
HOLE_DOOR = cube_mesh(1.55, 0.2, 2.5, "holeDoor")

put(cube_mesh(14.4, 14.4, 1.5, "plinth"), MASONRY, "Plinth", (0, 0, 0.75))
for i in range(3):
    put(
        cube_mesh(15.5 - i * 0.8, 1.4, 0.22 + i * 0.22, f"step{i}"),
        MASONRY,
        f"Step_{i}",
        (0, 8.2 + i * 0.7, 0.14 + i * 0.2),
    )

z0 = 1.5
heights = [5.2, 3.6, 3.6, 3.6, 3.6, 3.5, 3.5, 3.4, 3.3]
for index, height in enumerate(heights):
    mid = z0 + height / 2 - 1.5
    face = 10.67 + (5.33 - 10.67) * min(1.0, mid / 33.3)
    skin = SAND if index % 2 == 0 else MARBLE
    put(shell_mesh(face, height), skin, f"Storey_{index + 1}", (0, 0, z0))
    reach = face / 2 + 0.55
    for fx, fy, rot in ((0, 1, 0), (0, -1, math.pi), (1, 0, math.pi / 2), (-1, 0, -math.pi / 2)):
        door = index == 0 and fy == 1
        put(DOOR if door else ARCH, SAND, f"Arch_{index}_{fx}_{fy}", (fx * reach, fy * reach, z0 + 0.7), (0, 0, rot))
        put(
            HOLE_DOOR if door else HOLE,
            DARK,
            f"Hole_{index}_{fx}_{fy}",
            (fx * (face / 2 - 0.05), fy * (face / 2 - 0.05), z0 + (1.9 if door else 1.45)),
            (0, 0, rot),
        )
        put(FIG, MARBLE if skin == SAND else SAND, f"Figure_{index}_{fx}_{fy}", (fx * (face / 2 + 0.05), fy * (face / 2 + 0.05), z0 + 1.15), (0, 0, rot))
        put(HEAD, MARBLE if skin == SAND else SAND, f"Head_{index}_{fx}_{fy}", (fx * (face / 2 + 0.1), fy * (face / 2 + 0.1), z0 + 2.15), (0, 0, rot))
    z0 += height

# Cupola
cup = bpy.data.meshes.new("cupola")
bm = bmesh.new()
bmesh.ops.create_uvsphere(bm, u_segments=16, v_segments=10, radius=1.7)
for v in bm.verts:
    if v.co.z < 0:
        v.co.z = 0
    v.co.z *= 0.85
bm.to_mesh(cup)
bm.free()
put(cube_mesh(4.2, 4.2, 1.1, "crown"), MARBLE, "Crown", (0, 0, z0 + 0.55))
put(cup, MARBLE, "Cupola", (0, 0, z0 + 1.1))
put(cube_mesh(0.35, 0.35, 1.3, "kalash"), SAND, "Kalash", (0, 0, z0 + 2.7))

put(cube_mesh(0.45, 0.28, 1.7, "person"), stone("Cloth", (0.2, 0.32, 0.55), 2, 0.05, 0.8), "Person_1_7m", (6.2, 8.5, 0.85))

world = bpy.data.worlds.new("Sky")
scene.world = world
world.use_nodes = True
bg = world.node_tree.nodes["Background"]
bg.inputs["Color"].default_value = (0.64, 0.76, 0.90, 1)
bg.inputs["Strength"].default_value = 0.85
sun = bpy.data.lights.new("Sun", "SUN")
sun.energy = 5
sun_obj = bpy.data.objects.new("Sun", sun)
sun_obj.rotation_euler = (math.radians(52), 0.2, math.radians(-28))
scene.collection.objects.link(sun_obj)

bpy.ops.object.camera_add(location=(14, -18, 11))
cam = bpy.context.active_object
cam.name = "Cam_Stambh"
cam.data.lens = 42
cam.data.clip_end = 200
from mathutils import Vector
cam.rotation_euler = Vector((-14, 18, 16 - 11)).to_track_quat("-Z", "Y").to_euler()
scene.camera = cam

note = bpy.data.texts.new("READ_ME")
note.write("Vijay Stambh only.\n37.2 m. Press Home, then the ` key, then Camera.\nThe blue block is 1.7 m.\n")

path = "/workspace/export/vijay-stambh.blend"
bpy.ops.wm.save_as_mainfile(filepath=path)
print("HEIGHT", round(z0 + 2.7, 2), "OBJECTS", len(bpy.data.objects))
print("WROTE", path)
