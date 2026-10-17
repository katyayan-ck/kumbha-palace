# Open this on the MSI laptop

Windows 11, i7, GTX 1650 Max-Q, 4 GB GDDR6, DirectX 12. This card has no ray-tracing cores. In Blender use CUDA, not OptiX. In Unreal use software lighting, not hardware ray tracing.

The file is in metres. +Y is north. The brown block by the tower is a person, 1.7 m. The walled palace is 400 by 250 feet. The tower is 37.19 m.

## Blender

1. Install the notebook driver for the GTX 1650 from NVIDIA. Restart.
2. Install Blender 4.5 LTS from https://www.blender.org/download/
3. Windows Settings, System, Display, Graphics. Add blender.exe and set it to High performance so the GTX is used, not the Intel chip.
4. In Blender: Edit, Preferences, System, Cycles Render Devices, CUDA. Tick the GTX 1650. Leave Intel unticked.
5. Stay in Material Preview while modeling. A Cycles render of the whole palace will fill 4 GB.

## Unreal

Import `kumbha-palace.glb` at scale 100. Scalability Medium or Low. Software Lumen only. Path tracer off. Hardware ray tracing is not available on this GPU.
