# Changelog

## 2026-10-18 — Architectural Blender model

- Rebuilt `export/kumbha-palace.blend` from the plot and the photographs, in metres. 372 objects. Opens in Blender 5.2.
- Precinct is 400 by 250 feet. Zanana court is sunken, with a rubble band, a seat door and a side window onto lawn, and stepped niches. The dome sits on a colonnade and an open drum. The west wall has three rows of jharokhas. Suraj Pol, the Tripolia and its bastions, the stables, and a shikhara are in the places the plot gives them.
- The Vijay Stambh is the surveyed tower: 37.19 m, faces 10.67 m to 5.33 m, nine storeys, a portico on each face, sandstone and marble. A 1.7 m figure stands at the foot.
- Cameras: Cam_Approach, Cam_Dome, Cam_Court, Cam_Stambh, Cam_Plan. Notes are in the text block READ_ME inside the file.
- The named images on the tower are not separate sculptures. Those are cut in Sculpt Mode, one storey at a time, on the laptop.

## 2026-10-18 — Blender file for the laptop

- Added a Blender 4.5 scene and a glTF, in metres, for an RTX 3050 4 GB laptop. Unreal is not run from this preview.
- The walled palace is 400 by 250 feet. The Vijay Stambh is the surveyed tower. A 1.7 m figure stands at its foot.
- How to open it, and the Unreal settings that fit 4 GB, are in export/OPEN-IN-BLENDER.md.

## 2026-10-17 — Precinct and the west wall

- The walled palace is now the plot’s 400 by 250 feet (121.9 by 76.2 metres). The photographed rooms were not enlarged: a doorway is still the height of a person.
- Fateh Prakash, Nau Lakha Bandar, and the Vijay Stambh stand outside that wall, to the east and south-east, as the plot draws them.
- The west face is the long wall in the photographs: rubble plinth, pink plaster, three rows of jharokhas, a ground door, merlons, and three chhatris. The balconies are instanced, so the view does not stall.
- Two carved niches flank the Tripolia.

## 2026-10-17 — Plot

- Gates, stables, the Shiva shrine, and the Vijay Stambh moved to the places on the plot. Suraj Pol is the south door of the palace. The Tripolia, with two round bastions, is the outer south gate. The stables sit south-west. The tower stands south-east, still at 37.19 m.
- Added, as masses only: the open courts between the two gates, the royal garden, the east road, Fateh Prakash, Nau Lakha Bandar, Jauhar Kund, the Meerabai and Kumbha Shyam temple, and the west fort wall.
- The photographed rooms were not moved. The dome on its colonnade, the sunken zanana court, and the cliff curtains stay as the pictures show them.
- The download link is gone. Wire toggles a wireframe of the model.
- Rooms named twice on the plot, and the offices with no standing walls, were not invented as extra buildings.

## 2026-10-17 — Vijay Stambh to the measured tower

- The victory tower is no longer a stack of equal boxes. It follows the surveyed column: 37.19 m to the cupola, faces 10.67 m at the base and 5.33 m under the dome, on a terrace 12.8 m square.
- Nine storeys. Each face has an opening and a two-column portico. Courses alternate red sandstone and white marble. The ground floor, facing the palace, is a carved entrance with a stepped torana.
- A standing figure at the foot is 1.7 m, so the height can be judged.
- The Tripolia gate carries the same carved torana, reduced to the scale of a palace door.
- The real tower is about 450 m south-east of the palace. It is drawn at true size beside the house so both can be read. The named images of the gods stay in the relief; cutting each one as its own mesh would stop the view.
- Unreal Engine 5 would be the right file for a path-traced, walkable tower on a Windows machine. This preview is the browser model, so the tower is built in it, not in Unreal.

## 2026-10-17 — Carving, and grass kept off the walls

- The hillside no longer cuts through the palace. The grass starts at the fort edge and runs down the slope; the lawn outside the zanana sits beyond the stone, not inside it.
- Vijay Stambh and the Shiva shrine carry a carved sandstone relief: niche frames and standing figures, read by the light as raised stone. Each storey of the tower has a projecting balcony, as on the real stambh.
- Jharokhas gained a carved eave. Four more balconies sit on the south face of the great dome block.
- The valley town sits at the foot of that slope again.
- This is still a live view, not a path-traced film. A full ray-traced pass of every sculpture would freeze the picture, the way the last shadow pass did. The figures are in the stone’s relief.

## 2026-10-17 — The view moves again

- The palace was stalling because every mouse move tested the whole model, and every stone cast a soft shadow. Hover now uses one invisible box per room, and only the large walls cast a simple shadow.
- Drawing is capped to a single pixel per screen pixel so the preview stays responsive.
- Three neem trees and three visitors stand in the main court, so the flagstones have a human scale.

## 2026-10-16 — Rooms you can read

- Hover a part of the palace to see its name, place, and date. Click to pin the longer history.
- Parts: Suraj Pol, Tripolia, main court, Diwan-i-Am, northern apartments, zanana light court, painted dome chamber, great dome and colonnade, Kanwar Pada, stables, Shiva shrine, south bastion, cliff curtains, Vijay Stambh.
- Added the Vijay Stambh north-east of the house: nine storeys, about 37 m, separate from the palace.
- Added the household Shiva shrine, with a shikhara rather than a palace dome.
- Added canopied balconies on the court face of the great dome and on the diwan, the feature the old accounts single out.
- Aerial view shifted so the stambh and the court read together.
- Google’s photographic tour could not be opened (the page needs a signed-in map viewer). The plan follows the published layout and the satellite footprint at 24.8918 N, 74.6439 E, plus the in-complex photographs.

## 2026-10-16 — Light court and cliff

- Zanana well: flagstones, rubble string, dressed frames, lawn through the seat doorway and the side window.
- Cliff curtains seated on the hillside, town on the valley floor, dome kept in the same view.
