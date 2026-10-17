# Open this on the MSI laptop

Windows 11, i7, RTX 3050 4 GB. Blender is the tool that fits. Unreal can show the walk later, at medium settings. A headset does not fit this card.

The file is in metres. +Y is north. The brown block by the tower is a person, 1.7 m. The walled palace is 400 by 250 feet. The tower is 37.19 m, faces 10.67 m at the base and 5.33 m under the cupola.

## Blender

1. Install Blender 4.5 LTS or newer from https://www.blender.org/download/
2. Download `kumbha-palace.blend` from this folder (the green Code button on the repo, or the raw file).
3. Open it. Middle mouse orbits. Numpad 7 is the plan. Numpad 1 is an elevation.
4. The outliner is split into collections: Precinct, Palace, Gates, VijayStambh, LaterBuildings, ScaleFigure.
5. Edit, Preferences, System, Cycles Render Devices, OptiX. Leave the viewport on Material Preview. A Cycles render of the whole palace will fill 4 GB.
6. To cut a figure, select one storey, go to Sculpt Mode, and work that piece only. Do not multires the whole precinct.

## Unreal, after the stone is further along

1. Install Unreal Engine 5.4 or 5.5 from the Epic Launcher. Skip a path-tracing template.
2. Blank project.
3. Import `kumbha-palace.glb`. Set the uniform scale to 100. The file is metres. Unreal is centimetres.
4. Scalability Medium. Lumen on, software ray tracing if the hardware mode runs out of memory. Path tracer off. Nanite only on the tower meshes.
5. If the viewport says it is out of video memory, open the console with the tilde key and run `r.Streaming.PoolSize 1500`.

This is the measured mass, not the finished carving. The figures still have to be sculpted on the laptop.
