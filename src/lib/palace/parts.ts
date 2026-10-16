export type PartInfo = {
  id: string;
  title: string;
  where: string;
  built: string;
  summary: string;
  history: string;
  min: [number, number, number];
  max: [number, number, number];
};

/** World boxes in metres. Smaller boxes win when they overlap. */
export const PARTS: PartInfo[] = [
  {
    id: "fresco",
    title: "Painted dome chamber",
    where: "Inner room, west of the zanana well",
    built: "Standing fabric, mid-15th century; plaster and pigment repaired in this reading",
    summary: "Look up: a circular frescoed soffit, octagonal frame, and a ring of clerestory light.",
    history:
      "The photographs taken inside the complex show this ceiling from below: a damaged circular painting on the dome soffit, corbels, and a wall niche, with red pigment still on the plaster. Later metal grilles are left out. The chamber is a restored room of the palace, not a separate monument.",
    min: [-11, 1.2, -12.4],
    max: [-4.6, 12, -6.8],
  },
  {
    id: "zanana",
    title: "Zanana light court",
    where: "West side of the palace",
    built: "Kumbha’s palace, c. 1433–1468, on older footings",
    summary: "Sunken flagstone well. Thick rubble courses, dressed openings, and a seat looking onto grass.",
    history:
      "This is the court in the in-complex photographs: large irregular flagstones, a heavy rubble string between pale ashlar, temple-headed niches, and a dressed doorway where a person can sit with the lawn beyond. A smaller window beside it also opens to grass. Royal women lived in the zanana ranges around such wells. The model restores the shell; the real court is ruined and open to the sky.",
    min: [-13.2, 0, -7.6],
    max: [1.2, 16.5, 6.2],
  },
  {
    id: "dome",
    title: "Great dome and colonnade",
    where: "East side of the main court",
    built: "Maharana Kumbha, 15th century",
    summary: "The dome sits on an open drum of arches, directly over a colonnade. Not a blank block.",
    history:
      "From the high photographs the crown is one mass: a large weathered dome, smaller chhatris, and an upper storey of openings carried on columns. The palace is plastered stone and unequal sandstone, famous for its canopied balconies. Satellite views put this domed block on the east side of the big courtyard. Here it is shown complete, not as the broken shell.",
    min: [0.6, 1, -2.2],
    max: [16.4, 32, 14.5],
  },
  {
    id: "court",
    title: "Main courtyard",
    where: "Centre of the palace",
    built: "Laid out with the 15th-century rebuild",
    summary: "The open rectangle between the diwan, the dome block, and the zanana.",
    history:
      "Suraj Pol and the Tripolia open into this court. On the satellite image it is the large bare rectangle at the heart of the ruins, with the long northern hall, the eastern domed range, and the tighter western rooms around it. The whole palace sits on a raised rectangular basement, about eighty to a hundred metres across, just inside the fort from Ram Pol.",
    min: [-8, 0, -13],
    max: [16, 2.4, 16],
  },
  {
    id: "diwan",
    title: "Diwan-i-Am",
    where: "North range, facing the court",
    built: "15th-century audience hall",
    summary: "A long colonnade where the Maharana met petitioners.",
    history:
      "The hall of public audience stands on the north side of the courtyard. Pillars carry a flat sandstone front; the masonry of the range sits behind them. It is a working court, not a temple mandapa. The northern apartments continue behind it.",
    min: [-11, 0.4, -28.5],
    max: [11, 12, -13.2],
  },
  {
    id: "north",
    title: "Northern apartments",
    where: "Behind the diwan",
    built: "15th century, much ruined",
    summary: "Private rooms north of the audience hall.",
    history:
      "Beyond the diwan the plan breaks into smaller chambers. These are read here as the private northern apartments of the palace, restored only in mass and a single chhatri. They are not the towers of Victory, which stand further north-east, outside the house.",
    min: [-16, 0, -40],
    max: [16, 12, -28.6],
  },
  {
    id: "kanwar",
    title: "Kanwar Pada ka Mahal",
    where: "South-west range",
    built: "15th century, quarters associated with the heir",
    summary: "A domed block for the Kanwar, the heir, opening toward the court.",
    history:
      "Kanwar Pada ka Mahal is named in every old account of the palace as the heir’s house, reached after Suraj Pol and the Tripolia, together with the zanana. It is placed on the western side of the complex. Meerabai later lived in this palace; Panna Dhai’s rooms are remembered in the southern part, near the service courts.",
    min: [-24.5, 0.4, 10],
    max: [-11.5, 18, 24],
  },
  {
    id: "stables",
    title: "Horse and elephant stables",
    where: "East of the court, low range",
    built: "Part of the original palace service",
    summary: "A long, low stable with a row of arches.",
    history:
      "Kumbha’s palace included stables for horses and elephants, set beside the residential courts rather than inside them. The satellite footprint shows lower ruined rooms along the east and south. The arches here are the restored reading of that service range.",
    min: [17.5, 0, -5],
    max: [30.5, 9, 16.5],
  },
  {
    id: "tripolia",
    title: "Tripolia Gate",
    where: "East entry into the court",
    built: "Palace gate, 15th century",
    summary: "Three arches. The middle one is the tallest.",
    history:
      "After Suraj Pol, the Tripolia — the triple gate — lets you into the courtyard. It is the ceremonial door of the house, with a chhatri above the parapet. The real gate is ruined; the three-arch rhythm is what the accounts and the remaining jambs support.",
    min: [30.2, 0.4, -6],
    max: [36.2, 10, 4.2],
  },
  {
    id: "suraj",
    title: "Suraj Pol",
    where: "Outer east gate",
    built: "Sun gate of the palace",
    summary: "The first palace gate, facing the morning sun, with a stepped ramp.",
    history:
      "Entry to the palace is through Suraj Pol, the Sun Gate, which leads on into the courtyard. It faces east, toward the open ground inside the fort and the road that continues toward the Vijay Stambh. A short ramp rises to the threshold. It is the palace’s own gate, not Ram Pol of the fort.",
    min: [36.4, 0, -5.5],
    max: [44.5, 8, 3.5],
  },
  {
    id: "shiva",
    title: "Shiva shrine",
    where: "Inside the palace zone, north-west of the diwan",
    built: "Temple recorded with the palace",
    summary: "A small shrine with a curving shikhara, not a palace dome.",
    history:
      "The old descriptions place a temple of Shiva within the palace, near the stables and the residential courts. It is a shrine for the household, modest beside the Vijay Stambh. The shikhara is the temple’s own spire; the palace domes nearby are hemispherical and sit on drums.",
    min: [-20.2, 0, -21],
    max: [-11.2, 16, -12],
  },
  {
    id: "stambh",
    title: "Vijay Stambh",
    where: "North-east of the palace, inside the fort",
    built: "1440–1448, ordered by Maharana Kumbha",
    summary: "Nine storeys, about 37 metres, a tower of victory and not part of the house.",
    history:
      "The Vijay Stambh stands apart from the palace, to the north-east, where the satellite view shows a tower on the fort road. Kumbha raised it after his campaigns. It is nine storeys of carved sandstone, tapering, with a small dome at the top. The palace gate looks toward it. The carving here is only the mass and the storey count — the real tower is covered in sculpture.",
    min: [46, 0, -58],
    max: [60, 44, -38],
  },
  {
    id: "bastion",
    title: "South bastion",
    where: "South-east corner of the enceinte",
    built: "Fort wall and palace terrace",
    summary: "A round bastion and a square domed tower on the south edge.",
    history:
      "The palace basement is wrapped by a crenellated wall. At the south-east corner a round bastion and a square tower with its own dome watch the terrace. Panna Dhai and Meerabai are both associated with the southern side of this complex; their exact rooms are not standing, so they are not given a false plan.",
    min: [20, 0, 18],
    max: [36, 18, 33],
  },
  {
    id: "rampart",
    title: "Western cliff and curtains",
    where: "Fort edge, above the town",
    built: "Hill fort, walls following the slope",
    summary: "Zigzag curtains step down the green hillside. The town sits on the valley floor.",
    history:
      "Chittorgarh stands on a hill about 180 metres above the Berach plain. From the rampart the palace dome is beside you and the white town is far below. The curtains are not a straight wall: they zigzag down the slope, the way the video along the cliff shows them. In this model that drop is the far side of the court, so the dome, the fall, and the town can be seen together.",
    min: [-70, -70, 32],
    max: [40, 14, 150],
  },
];

export function findPart(x: number, y: number, z: number): PartInfo | null {
  let best: PartInfo | null = null;
  let volume = Infinity;
  for (const part of PARTS) {
    const [x0, y0, z0] = part.min;
    const [x1, y1, z1] = part.max;
    if (x < x0 || x > x1 || y < y0 || y > y1 || z < z0 || z > z1) continue;
    const next = (x1 - x0) * (y1 - y0) * (z1 - z0);
    if (next < volume) {
      volume = next;
      best = part;
    }
  }
  return best;
}
