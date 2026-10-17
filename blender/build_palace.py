"""Rana Kumbha Palace, Chittorgarh. Blender 4.5 scene, opens in 5.2.

One Blender unit is one metre. +Y is north, +Z is up.
The walled precinct is the plot's 400 by 250 feet.
The photographed rooms are not stretched: a door is the height of a person.
The Vijay Stambh follows Tod's survey: 37.19 m, faces 10.67 m to 5.33 m.
"""

import math
import bpy
import bmesh

bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene
scene.unit_settings.system = "METRIC"
scene.unit_settings.scale_length = 1.0
scene.unit_settings.length_unit = "METERS"
scene.render.resolution_x = 1600
scene.render.resolution_y = 900
scene.render.engine = "CYCLES"
scene.cycles.samples = 32
scene.cycles.device = "CPU"

W, D = 121.92, 76.20  # 400 ft by 250 ft

def stone(name, color, scale=6.0, strength=0.4, rough=0.8):
    mat = bpy.data.materials.new(name)
    mat.use_nodes = True
    nt = mat.node_tree
    bsdf = nt.nodes["Principled BSDF"]
    bsdf.inputs["Base Color"].default_value = (*color, 1.0)
    bsdf.inputs["Roughness"].default_value = rough
    noise = nt.nodes.new("ShaderNodeTexNoise")
    noise.inputs["Scale"].default_value = scale
    noise.inputs["Detail"].default_value = 6.0
    bump = nt.nodes.new("ShaderNodeBump")
    bump.inputs["Strength"].default_value = strength
    nt.links.new(noise.outputs["Fac"], bump.inputs["Height"])
    nt.links.new(bump.outputs["Normal"], bsdf.inputs["Normal"])
    return mat

PLASTER = stone("Plaster", (0.84, 0.73, 0.60), 10, 0.18, 0.72)
PINK = stone("PinkPlaster", (0.86, 0.62, 0.50), 8, 0.22, 0.7)
RUBBLE = stone("Rubble", (0.52, 0.42, 0.32), 3.2, 0.7, 0.92)
SAND = stone("RedSandstone", (0.70, 0.42, 0.28), 7, 0.45, 0.74)
MARBLE = stone("WhiteMarble", (0.92, 0.89, 0.83), 14, 0.12, 0.38)
MASONRY = stone("Masonry", (0.60, 0.50, 0.38), 5, 0.5, 0.84)
FLAG = stone("Flagstone", (0.68, 0.60, 0.48), 2.4, 0.55, 0.86)
LAWN = stone("Lawn", (0.30, 0.44, 0.20), 18, 0.15, 0.9)
DARK = stone("Opening", (0.04, 0.035, 0.03), 1, 0.0, 0.5)
WATER = stone("Water", (0.10, 0.24, 0.24), 2, 0.05, 0.12)
FRESCO = stone("Fresco", (0.55, 0.32, 0.22), 4, 0.1, 0.55)
CLOTH = stone("Cloth", (0.20, 0.32, 0.58), 2, 0.05, 0.8)

def collection(name):
    col = bpy.data.collections.new(name)
    scene.collection.children.link(col)
    return col

def put(obj, col):
    for parent in list(obj.users_collection):
        parent.objects.unlink(obj)
    col.objects.link(obj)
    return obj

def adopt(obj, parent):
    """Location is in the parent's space. It is not a world coordinate."""
    if parent is not None:
        obj.parent = parent
    return obj

def empty(name, col, loc, parent=None):
    obj = bpy.data.objects.new(name, None)
    obj.empty_display_type = "PLAIN_AXES"
    obj.empty_display_size = 2
    obj.location = loc
    col.objects.link(obj)
    adopt(obj, parent)
    return obj

def mesh_object(name, col, mesh, mat, loc, rot=(0, 0, 0), parent=None):
    obj = bpy.data.objects.new(name, mesh)
    obj.location = loc
    obj.rotation_euler = rot
    if mat and mat.name not in {slot.name for slot in mesh.materials}:
        obj.data.materials.append(mat)
    col.objects.link(obj)
    adopt(obj, parent)
    return obj

def cube(name, col, center, size, mat, rot=(0, 0, 0), parent=None):
    mesh = bpy.data.meshes.new(name)
    bm = bmesh.new()
    bmesh.ops.create_cube(bm, size=1.0)
    for v in bm.verts:
        v.co.x *= size[0]
        v.co.y *= size[1]
        v.co.z *= size[2]
    bm.to_mesh(mesh)
    bm.free()
    return mesh_object(name, col, mesh, mat, center, rot, parent)

def cylinder(name, col, center, radius, depth, mat, verts=12, parent=None):
    mesh = bpy.data.meshes.new(name)
    bm = bmesh.new()
    bmesh.ops.create_cone(bm, cap_ends=True, segments=verts, radius1=radius, radius2=radius, depth=depth)
    bm.to_mesh(mesh)
    bm.free()
    return mesh_object(name, col, mesh, mat, center, parent=parent)

def uv_dome(name, col, center, radius, mat, parent=None):
    mesh = bpy.data.meshes.new(name)
    bm = bmesh.new()
    bmesh.ops.create_uvsphere(bm, u_segments=16, v_segments=10, radius=radius)
    for v in bm.verts:
        if v.co.z < 0:
            v.co.z = 0
        v.co.z *= 0.78
    bm.to_mesh(mesh)
    bm.free()
    return mesh_object(name, col, mesh, mat, center, parent=parent)

def arch(name, col, center, span, rise, thick, depth, mat, rot=(0, 0, 0), parent=None):
    """Semicircular ring standing in the XZ plane, depth along Y."""
    segs = 12
    outer, inner = [], []
    for i in range(segs + 1):
        a = math.pi * i / segs
        c, s = math.cos(a), math.sin(a)
        outer.append((span * c, rise * s))
        inner.append(((span - thick) * c, max(0.05, rise - thick) * s))
    mesh = bpy.data.meshes.new(name)
    bm = bmesh.new()
    front, back = [], []
    for x, z in outer + inner:
        front.append(bm.verts.new((x, -depth / 2, z)))
    for x, z in outer + inner:
        back.append(bm.verts.new((x, depth / 2, z)))
    n = segs + 1
    for i in range(segs):
        bm.faces.new((front[i], front[i + 1], front[n + i + 1], front[n + i]))
        bm.faces.new((back[i + 1], back[i], back[n + i], back[n + i + 1]))
        bm.faces.new((front[i], back[i], back[i + 1], front[i + 1]))
        bm.faces.new((front[n + i + 1], back[n + i + 1], back[n + i], front[n + i]))
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    bm.to_mesh(mesh)
    bm.free()
    return mesh_object(name, col, mesh, mat, center, rot, parent)

def shared_cube_mesh(sx, sy, sz):
    mesh = bpy.data.meshes.new("shared")
    bm = bmesh.new()
    bmesh.ops.create_cube(bm, size=1.0)
    for v in bm.verts:
        v.co.x *= sx
        v.co.y *= sy
        v.co.z *= sz
    bm.to_mesh(mesh)
    bm.free()
    return mesh

def instance(name, col, mesh, mat, loc, rot=(0, 0, 0), parent=None):
    return mesh_object(name, col, mesh, mat, loc, rot, parent)

def relief_mesh():
    """A small four-sided boss. Shared by every frieze so the file stays light."""
    mesh = bpy.data.meshes.new("ReliefBoss")
    bm = bmesh.new()
    bmesh.ops.create_cone(bm, cap_ends=True, segments=4, radius1=0.14, radius2=0.0, depth=0.16)
    bm.to_mesh(mesh)
    bm.free()
    return mesh

def jharokha_mesh():
    """Projecting balcony: slab, brackets, posts, eave. One mesh, many copies."""
    mesh = bpy.data.meshes.new("Jharokha")
    bm = bmesh.new()

    def box(cx, cy, cz, sx, sy, sz):
        made = bmesh.ops.create_cube(bm, size=1.0)
        for v in made["verts"]:
            v.co.x = v.co.x * sx + cx
            v.co.y = v.co.y * sy + cy
            v.co.z = v.co.z * sz + cz

    box(0, 0, 0, 0.85, 1.7, 0.14)
    box(-0.55, 0, -0.22, 0.18, 0.32, 0.32)
    box(0.55, 0, -0.22, 0.18, 0.32, 0.32)
    box(0, 0, -0.22, 0.22, 0.55, 0.22)
    box(-0.62, 0, 0.55, 0.12, 0.12, 0.9)
    box(0.62, 0, 0.55, 0.12, 0.12, 0.9)
    box(0, 0, 1.08, 1.05, 1.95, 0.12)
    box(0, 0, 1.22, 0.7, 1.4, 0.1)
    bm.to_mesh(mesh)
    bm.free()
    return mesh

def frieze(name, col, mesh, mat, origin, along, up, count, step, parent=None):
    ox, oy, oz = origin
    ax, ay, az = along
    for i in range(count):
        instance(
            f"{name}_{i}",
            col,
            mesh,
            mat,
            (ox + ax * i * step, oy + ay * i * step, oz + az * i * step),
            parent=parent,
        )

# ---------------------------------------------------------------------------
PRE = collection("01_Precinct")
PAL = collection("02_Palace")
GATE = collection("03_Gates")
STB = collection("04_VijayStambh")
LAT = collection("05_Later")
FIG = collection("06_Figure")

note = bpy.data.texts.new("READ_ME")
note.write(
    "Metres. +Y is north.\n"
    "Precinct 121.92 m by 76.20 m (400 ft by 250 ft).\n"
    "Vijay Stambh 37.19 m, base face 10.67 m, top face 5.33 m.\n"
    "The blue figure is 1.7 m.\n"
    "Numpad 0, or the camera list: Approach, Court, Stambh, Plan.\n"
    "GTX 1650 Max-Q: stay in Material Preview. Cycles CUDA for one view only.\n"
)

# Ground and the west drop. The fort edge is the west wall.
ground = cube("Ground", PRE, (W / 2, D / 2, -0.2), (W + 40, D + 30, 0.4), LAWN)
cliff = cube("WestSlope", PRE, (-28, D / 2, -16), (48, D + 20, 1.2), LAWN, rot=(0, math.radians(32), 0))

def wall_run(name, x0, y0, x1, y1, z, height, thick, mat, merlons=True):
    dx, dy = x1 - x0, y1 - y0
    length = math.hypot(dx, dy) or 0.01
    ang = math.atan2(dy, dx)
    cx, cy = (x0 + x1) / 2, (y0 + y1) / 2
    cube(name, PRE, (cx, cy, z + height / 2), (length, thick, height), mat, rot=(0, 0, ang))
    if not merlons:
        return
    mesh = shared_cube_mesh(0.55, thick + 0.15, 0.7)
    count = max(2, int(length / 1.5))
    for i in range(0, count, 2):
        t = (i + 0.5) / count
        instance(f"{name}_merlon_{i}", PRE, mesh, mat, (x0 + dx * t, y0 + dy * t, z + height + 0.35), (0, 0, ang))

wall_run("WallWest", 0, 0, 0, D, 0, 9.5, 1.8, MASONRY)
wall_run("WallEast", W, 0, W, D, 0, 9.5, 1.8, MASONRY)
wall_run("WallNorth", 0, D, W, D, 0, 8.5, 1.6, MASONRY)
wall_run("WallSouthWest", 0, 0, 48, 0, 0, 8, 1.6, MASONRY)
wall_run("WallSouthEast", 72, 0, W, 0, 0, 8, 1.6, MASONRY)

# Open courts, garden, road.
cube("OpenCourt", PAL, (62, 20, 0.05), (36, 22, 0.1), FLAG)
cube("RoyalGarden", PAL, (96, 24, 0.06), (18, 16, 0.08), LAWN)
cube("EastRoad", LAT, (132, 40, 0.04), (8, 70, 0.08), MASONRY)

# --- Zanana light court, from the in-complex photographs ---
court = empty("ZananaCourt", PAL, (28, 56, 0))
# Sunken floor. Walk around it is 1.15 m higher.
cube("CourtFloor", PAL, (28, 56, -0.45), (14, 12, 0.2), FLAG, parent=None)
cube("CourtWalk", PAL, (28, 56, 0.15), (20, 18, 0.3), FLAG, parent=None)
# Hollow the walk by covering only a ring: four slabs.
cube("WalkNorth", PAL, (28, 64.2, 0.55), (20, 2.2, 1.1), FLAG, parent=None)
cube("WalkSouth", PAL, (28, 47.8, 0.55), (20, 2.2, 1.1), FLAG, parent=None)
cube("WalkWest", PAL, (19.2, 56, 0.55), (2.2, 14, 1.1), FLAG, parent=None)
cube("WalkEast", PAL, (36.8, 56, 0.55), (2.2, 14, 1.1), FLAG, parent=None)

def court_wall(name, center, size, parent):
    cube(name, PAL, center, size, PLASTER, parent=parent)
    # rubble string, proud of the face
    band = (size[0] + 0.2, size[1] + 0.2, 0.7)
    cube(name + "_rubble", PAL, (center[0], center[1], 3.4), band, RUBBLE, parent=parent)

court_wall("CourtWallNorth", (28, 66.2, 4.0), (18, 1.1, 8), None)
court_wall("CourtWallSouth", (28, 45.8, 4.0), (18, 1.1, 8), None)
court_wall("CourtWallWest", (17.4, 56, 4.0), (1.1, 14, 8), None)
# East wall split by the seat door and the small window, both looking onto lawn.
cube("CourtWallEastLeft", PAL, (38.6, 50.2, 4.0), (1.1, 6.2, 8), PLASTER, parent=None)
cube("CourtWallEastRight", PAL, (38.6, 62.4, 4.0), (1.1, 5.4, 8), PLASTER, parent=None)
cube("CourtWallEastHead", PAL, (38.6, 56.2, 6.6), (1.1, 3.6, 2.8), PLASTER, parent=None)
cube("CourtRubbleEast", PAL, (38.9, 56, 3.4), (0.5, 14.4, 0.7), RUBBLE, parent=None)
cube("SeatDoor", PAL, (38.7, 54.4, 1.7), (0.4, 1.15, 2.15), DARK, parent=None)
cube("SeatSill", PAL, (39.15, 54.4, 0.72), (0.7, 1.35, 0.18), MASONRY, parent=None)
cube("SideWindow", PAL, (38.7, 58.6, 2.15), (0.35, 0.75, 1.15), DARK, parent=None)
cube("LawnBeyond", PAL, (46, 56, 0.04), (12, 16, 0.08), LAWN, parent=None)

def niche(name, loc, rot, parent):
    g = empty(name, PAL, loc, parent)
    cube(name + "_back", PAL, (0, 0, 0.7), (0.15, 0.55, 1.3), DARK, parent=g)
    cube(name + "_sill", PAL, (0.08, 0, 0.08), (0.2, 0.85, 0.12), MASONRY, parent=g)
    cube(name + "_l", PAL, (0.08, -0.38, 0.75), (0.16, 0.1, 1.4), MASONRY, parent=g)
    cube(name + "_r", PAL, (0.08, 0.38, 0.75), (0.16, 0.1, 1.4), MASONRY, parent=g)
    cube(name + "_p1", PAL, (0.1, 0, 1.5), (0.16, 0.85, 0.12), SAND, parent=g)
    cube(name + "_p2", PAL, (0.14, 0, 1.68), (0.14, 0.55, 0.1), SAND, parent=g)
    cube(name + "_p3", PAL, (0.18, 0, 1.84), (0.12, 0.28, 0.12), SAND, parent=g)
    g.rotation_euler = rot
    return g

niche("NicheN1", (24, 65.5, 1.15), (0, 0, math.pi), None)
niche("NicheN2", (32, 65.5, 1.15), (0, 0, math.pi), None)
niche("NicheS1", (24, 46.5, 1.15), (0, 0, 0), None)
niche("NicheW1", (18.1, 52, 1.15), (0, 0, math.pi / 2), None)
niche("NicheW2", (18.1, 60, 1.15), (0, 0, math.pi / 2), None)

# Painted dome chamber on the west side of the court.
room = empty("FrescoChamber", PAL, (12, 56, 0))
cube("FrescoWalls", PAL, (12, 56, 3.2), (8, 8, 6.4), PLASTER, parent=None)
cube("FrescoRoom", PAL, (12, 56, 2.4), (6.2, 6.2, 4.6), DARK, parent=None)
cylinder("FrescoSoffit", PAL, (12, 56, 6.5), 2.4, 0.12, FRESCO, verts=20, parent=None)
uv_dome("FrescoDome", PAL, (12, 56, 6.7), 3.1, PLASTER, parent=None)

# --- Dome pavilion: colonnade, open drum, great dome ---
pav = empty("DomePavilion", PAL, (62, 58, 0))
cube("PavilionBase", PAL, (0, 0, 3.1), (16, 13, 6.2), PLASTER, parent=pav)
cube("PavilionRubble", PAL, (0, -6.6, 2.4), (16.3, 0.5, 1.1), RUBBLE, parent=pav)
cube("PavilionDoor", PAL, (0, -6.55, 1.5), (1.3, 0.3, 2.4), DARK, parent=pav)
# South colonnade, the face in the photographs.
for i, x in enumerate((-6, -3, 0, 3, 6)):
    cylinder(f"Col_{i}", PAL, (x, -5.6, 7.6), 0.32, 3.2, MASONRY, parent=pav)
for i, x in enumerate((-4.5, -1.5, 1.5, 4.5)):
    arch(f"ColArch_{i}", PAL, (x, -5.6, 8.9), 1.35, 1.15, 0.22, 0.55, MASONRY, parent=pav)
cube("ColonnadeFloor", PAL, (0, -4.2, 6.25), (15, 3.2, 0.28), FLAG, parent=pav)
cylinder("Drum", PAL, (0, 0, 11.2), 5.4, 3.6, PLASTER, verts=20, parent=pav)
for i in range(8):
    a = math.tau * i / 8
    arch(
        f"DrumArch_{i}",
        PAL,
        (math.cos(a) * 5.15, math.sin(a) * 5.15, 10.6),
        0.85,
        0.9,
        0.18,
        0.4,
        DARK,
        rot=(0, 0, a + math.pi / 2),
        parent=pav,
    )
uv_dome("GreatDome", PAL, (0, 0, 13.0), 5.6, PLASTER, parent=pav)
for i in range(16):
    ang = math.tau * i / 16
    cube(
        f"DomeRib_{i}",
        PAL,
        (math.cos(ang) * 4.6, math.sin(ang) * 4.6, 14.3),
        (0.16, 0.55, 2.4),
        SAND,
        rot=(0.55, 0, ang),
        parent=pav,
    )
cylinder("Kalash", PAL, (0, 0, 17.2), 0.28, 1.1, SAND, parent=pav)
uv_dome("KalashTop", PAL, (0, 0, 17.9), 0.35, SAND, parent=pav)
for sx, sy in ((-6.5, -5), (6.5, -5), (-6.5, 5), (6.5, 5)):
    cylinder(f"ChhatriCol_{sx}_{sy}", PAL, (sx, sy, 6.8), 0.16, 1.6, MASONRY, parent=pav)
    uv_dome(f"Chhatri_{sx}_{sy}", PAL, (sx, sy, 7.7), 0.7, PLASTER, parent=pav)
pav.location = (62, 58, 0)

# Diwan along the north of the block.
cube("Diwan", PAL, (50, 70, 3.4), (28, 8, 6.8), PLASTER)
cube("DiwanRubble", PAL, (50, 66.2, 2.6), (28.4, 0.45, 0.8), RUBBLE)

# West exterior: rubble base, pink plaster, three rows of jharokhas.
fac = empty("WestFacade", PAL, (8, 56, 0))
cube("FacadeWall", PAL, (0, 0, 7), (3.2, 32, 14), PINK, parent=fac)
cube("FacadeRubble", PAL, (-1.7, 0, 2.6), (0.7, 32.4, 5.2), RUBBLE, parent=fac)
cube("FacadeDoor", PAL, (-1.7, 0, 1.4), (0.3, 1.3, 2.3), DARK, parent=fac)
boss = relief_mesh()
jhar = jharokha_mesh()
for row in (5.4, 8.4, 11.2):
    for i in range(8):
        zpos = -12 + i * 3.3
        if row < 6 and abs(zpos) < 1.2:
            continue
        instance(f"Jharokha_{row}_{i}", PAL, jhar, SAND, (-2.15, zpos, row), parent=fac)
frieze("FacadeFrieze", PAL, boss, SAND, (-1.85, -14, 4.3), (0, 1, 0), (0, 0, 0), 24, 1.15, fac)
frieze("FacadeFriezeHigh", PAL, boss, SAND, (-1.85, -14, 12.6), (0, 1, 0), (0, 0, 0), 24, 1.15, fac)
for sy in (-10, 0, 10):
    uv_dome(f"RoofChhatri_{sy}", PAL, (0, sy, 14.2), 1.1, PLASTER, parent=fac)
fac.location = (8, 56, 0)

# Stables, south-west, arches toward the court.
stab = empty("Stables", PAL, (22, 16, 0))
cube("StableBlock", PAL, (0, 0, 2.3), (22, 8, 4.6), MASONRY, parent=stab)
for i, x in enumerate((-7, -2.5, 2.5, 7)):
    arch(f"StableArch_{i}", PAL, (x, 4.1, 0.2), 1.3, 1.7, 0.28, 0.6, DARK, parent=stab)
stab.location = (22, 16, 0)

# Shiva shrine in the south-west court. A shikhara, not a palace dome.
shiva = empty("ShivaShrine", PAL, (18, 36, 0))
cube("ShivaBody", PAL, (0, 0, 2.2), (7, 7, 4.4), SAND, parent=shiva)
for i in range(6):
    w = 5.2 - i * 0.7
    cube(f"Shikhara_{i}", PAL, (0, -0.4, 4.6 + i * 1.15), (w, w, 1.15), SAND, parent=shiva)
shiva.location = (18, 36, 0)

# --- Gates ---
suraj = empty("SurajPol", GATE, (58, 36, 0))
cube("SurajJambL", GATE, (-1.7, 0, 2.3), (0.7, 1.6, 4.6), MASONRY, parent=suraj)
cube("SurajJambR", GATE, (1.7, 0, 2.3), (0.7, 1.6, 4.6), MASONRY, parent=suraj)
arch("SurajArch", GATE, (0, 0, 0.15), 1.55, 3.3, 0.32, 1.5, MASONRY, parent=suraj)
cube("SurajTorana", GATE, (0, 0.2, 4.5), (3.4, 0.4, 0.45), SAND, parent=suraj)
for i in range(4):
    cube(f"SurajStep_{i}", GATE, (0, -2.2 - i * 0.7, 0.18 + i * 0.16), (4.4, 0.7, 0.36 + i * 0.32), MASONRY, parent=suraj)
suraj.location = (58, 36, 0)

trip = empty("Tripolia", GATE, (60, 2.2, 0))
cube("TripoliaWall", GATE, (0, 0.55, 3.3), (14, 1.4, 6.6), MASONRY, parent=trip)
for i, x in enumerate((-3.2, 0, 3.2)):
    span = 1.15 if i != 1 else 1.45
    rise = 2.5 if i != 1 else 3.15
    arch(f"TripoliaArch_{i}", GATE, (x, -0.35, 0.15), span, rise, 0.28, 0.7, SAND, parent=trip)
    arch(f"TripoliaOuter_{i}", GATE, (x, -0.55, 0.05), span + 0.45, rise + 0.4, 0.18, 0.35, MASONRY, parent=trip)
cube("TripoliaTorana", GATE, (0, -0.2, 4.55), (11.5, 0.45, 0.35), SAND, parent=trip)
cube("TripoliaTorana2", GATE, (0, -0.28, 5.05), (8.2, 0.35, 0.22), SAND, parent=trip)
cube("TripoliaTorana3", GATE, (0, -0.32, 5.4), (4.4, 0.28, 0.18), SAND, parent=trip)
frieze("GateFrieze", GATE, boss, SAND, (-5.2, -0.95, 4.15), (1, 0, 0), (0, 0, 0), 18, 0.6, trip)
cylinder("BastionWest", GATE, (-9.2, 1.2, 3.8), 3.2, 7.6, MASONRY, verts=16, parent=trip)
cylinder("BastionEast", GATE, (9.2, 1.2, 3.8), 3.2, 7.6, MASONRY, verts=16, parent=trip)
for bastion_x in (-9.2, 9.2):
    frieze(f"BastionBand_{bastion_x}", GATE, boss, SAND, (bastion_x - 1.4, -1.6, 5.2), (0.35, 0.2, 0), (0, 0, 0), 8, 1, trip)
trip.location = (60, 2.2, 0)

# --- Vijay Stambh, surveyed, one carved face repeated on four sides ---
# 37.19 m. Faces taper from 10.67 m to 5.33 m. Nine storeys.
# Each bay is a balcony, two columns, an arch, a niche and a standing figure.
# The figures are silhouettes. They are not the named sculptures of the real tower.
sx, sy = 168.0, 8.0
stambh = empty("VijayStambh", STB, (sx, sy, 0))
cube("StambhPad", STB, (0, 0, -0.08), (28, 28, 0.16), LAWN, parent=stambh)
cube("Terrace", STB, (0, 0, 0.7), (12.8, 12.8, 1.4), MASONRY, parent=stambh)
cube("TerraceStep", STB, (0, 0, 0.15), (14.2, 14.2, 0.3), MASONRY, parent=stambh)
storeys = [5.2, 3.6, 3.6, 3.6, 3.6, 3.5, 3.5, 3.4, 3.3]
z0 = 1.5
for index, height in enumerate(storeys):
    mid = z0 + height / 2 - 1.5
    t = min(1.0, max(0.0, mid / 33.7))
    face = 10.67 + (5.33 - 10.67) * t
    skin = SAND if index % 2 == 0 else MARBLE
    cube(f"Storey_{index + 1}", STB, (0, 0, z0 + height / 2), (face, face, height * 0.92), skin, parent=stambh)
    cube(f"Cornice_{index + 1}", STB, (0, 0, z0 + height - 0.1), (face + 0.85, face + 0.85, 0.22), MASONRY, parent=stambh)
    half = face / 2
    inset = 0.22
    for cx in (-1, 1):
        for cy in (-1, 1):
            cube(
                f"Pilaster_{index + 1}_{cx}_{cy}",
                STB,
                (cx * (half - inset), cy * (half - inset), z0 + height / 2),
                (0.42, 0.42, height),
                MASONRY,
                parent=stambh,
            )
    bay_w = face * 0.42
    for fx, fy, rot in ((0, 1, 0), (0, -1, math.pi), (1, 0, -math.pi / 2), (-1, 0, math.pi / 2)):
        ox, oy = fx * (half + 0.15), fy * (half + 0.15)
        wide = (bay_w, 0.85, 0.14) if fx == 0 else (0.85, bay_w, 0.14)
        cube(f"Balcony_{index + 1}_{fx}_{fy}", STB, (ox, oy, z0 + height * 0.22), wide, SAND, parent=stambh)
        across = bay_w * 0.32
        for side in (-1, 1):
            px = ox + (side * across if fx == 0 else 0)
            py = oy + (side * across if fy == 0 else 0)
            cylinder(f"Col_{index + 1}_{fx}_{fy}_{side}", STB, (px, py, z0 + height * 0.22 + height * 0.28), 0.09, height * 0.5, MASONRY, verts=8, parent=stambh)
        arch(
            f"BayArch_{index + 1}_{fx}_{fy}",
            STB,
            (ox, oy, z0 + height * 0.28),
            bay_w * 0.28,
            height * 0.42,
            0.1,
            0.28,
            SAND,
            rot=(0, 0, rot),
            parent=stambh,
        )
        niche_d = (0.2, 0.08, height * 0.55) if fx == 0 else (0.08, 0.2, height * 0.55)
        cube(f"Niche_{index + 1}_{fx}_{fy}", STB, (fx * (half - 0.02), fy * (half - 0.02), z0 + height * 0.55), niche_d, DARK, parent=stambh)
        fig_h = min(1.35, height * 0.42)
        fz = z0 + height * 0.34
        cylinder(f"Figure_{index + 1}_{fx}_{fy}", STB, (fx * (half + 0.05), fy * (half + 0.05), fz + fig_h * 0.35), 0.11, fig_h * 0.7, SAND, verts=8, parent=stambh)
        uv_dome(f"FigureHead_{index + 1}_{fx}_{fy}", STB, (fx * (half + 0.05), fy * (half + 0.05), fz + fig_h * 0.78), 0.1, SAND, parent=stambh)
        dentil_n = 6
        for d in range(dentil_n):
            u = -0.5 + (d + 0.5) / dentil_n
            dx = ox + (u * face * 0.7 if fx == 0 else fx * 0.15)
            dy = oy + (u * face * 0.7 if fy == 0 else fy * 0.15)
            if fx != 0:
                dx = fx * (half + 0.42)
                dy = oy + u * face * 0.7
            else:
                dx = ox + u * face * 0.7
                dy = fy * (half + 0.42)
            cube(f"Dentil_{index + 1}_{fx}_{fy}_{d}", STB, (dx, dy, z0 + height - 0.28), (0.14, 0.14, 0.16), SAND, parent=stambh)
    z0 += height
uv_dome("Cupola", STB, (0, 0, z0 + 0.2), 1.55, MARBLE, parent=stambh)
cylinder("Finial", STB, (0, 0, z0 + 1.7), 0.16, 0.9, SAND, parent=stambh)
stambh.location = (sx, sy, 0)

# Figure, 1.7 m, at the foot of the tower.
cube("Person_1_7m", FIG, (sx - 8, sy + 6, 0.85), (0.45, 0.28, 1.7), CLOTH)

# Later buildings, east of the road. Not part of Kumbha's house.
cube("FatehPrakash", LAT, (152, 55, 4.2), (26, 20, 8.4), PLASTER)
uv_dome("FatehDome", LAT, (152, 62, 8.5), 3.0, PLASTER)
cube("NauLakhaBandar", LAT, (154, 32, 3.1), (16, 11, 6.2), MASONRY)
cylinder("JauharKund", LAT, (36, -12, 0.08), 6.5, 0.16, WATER, verts=24)
cube("KumbhaShyam", LAT, (150, 18, 2.4), (8, 8, 4.8), SAND)
for i in range(5):
    w = 6 - i * 0.8
    cube(f"ShyamSpire_{i}", LAT, (150, 17.4, 5.0 + i), (w, w, 1.0), SAND)

sun = bpy.data.lights.new("Sun", type="SUN")
sun.energy = 4.5
sun.angle = math.radians(2)
sun_obj = bpy.data.objects.new("Sun", sun)
sun_obj.rotation_euler = (math.radians(48), math.radians(8), math.radians(35))
scene.collection.objects.link(sun_obj)

world = bpy.data.worlds.new("Sky")
scene.world = world
world.use_nodes = True
background = world.node_tree.nodes["Background"]
background.inputs["Color"].default_value = (0.62, 0.74, 0.88, 1)
background.inputs["Strength"].default_value = 0.9

def camera(name, loc, target, lens=38):
    bpy.ops.object.camera_add(location=loc)
    cam = bpy.context.active_object
    cam.name = name
    cam.data.lens = lens
    cam.data.clip_end = 800
    direction = (target[0] - loc[0], target[1] - loc[1], target[2] - loc[2])
    from mathutils import Vector
    cam.rotation_euler = Vector(direction).to_track_quat("-Z", "Y").to_euler()
    put(cam, scene.collection)
    return cam

approach = camera("Cam_Approach", (60, -28, 8), (60, 40, 8), 32)
camera("Cam_Court", (28, 56, 6), (38, 56, 2), 28)
camera("Cam_Dome", (62, 28, 7), (62, 58, 12), 32)
camera("Cam_Stambh", (sx + 22, sy + 26, 8), (sx, sy, 16), 35)
camera("Cam_StambhClose", (sx + 16, sy + 14, 7), (sx, sy, 14), 55)
camera("Cam_Plan", (W / 2, D / 2, 160), (W / 2, D / 2, 0), 28)
scene.camera = approach

blend_path = "/workspace/export/kumbha-palace.blend"
glb_path = "/workspace/export/kumbha-palace.glb"
bpy.ops.wm.save_as_mainfile(filepath=blend_path)
bpy.ops.export_scene.gltf(filepath=glb_path, export_format="GLB", export_apply=True)
print("OBJECTS", len(bpy.data.objects))
print("WROTE", blend_path)
