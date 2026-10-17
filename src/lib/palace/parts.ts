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
    where: "South-west of the open courts",
    built: "Part of the original palace service",
    summary: "A long, low stable with a row of arches, off the residential court.",
    history:
      "The plot puts the elephant and horse stables south-west of the palace, not inside the zanana. The arches are the restored reading of that service range. The standing rooms on the east of the photographed court are the palace itself, not these stables.",
    min: [-30, 0, 30],
    max: [-10, 9, 42],
  },
  {
    id: "tripolia",
    title: "Tripolia Gate",
    where: "South gate of the enceinte",
    built: "15th-century fortified entrance",
    summary: "Three arches between two round bastions. The middle arch is the tallest.",
    history:
      "On the plot the Tripolia is the outer south gate, flanked by round towers, with the open courtyards and Suraj Pol beyond it. The carved torana over the centre arch is the same stepped ornament as on the victory tower’s door, cut down to the size of a gate. The real gate is ruined; the three-arch rhythm is what the jambs support.",
    min: [-8, 0.4, 42],
    max: [14, 12, 52],
  },
  {
    id: "suraj",
    title: "Suraj Pol",
    where: "South door of the palace block",
    built: "Sun gate of the palace",
    summary: "The palace’s own gate, with a carved lintel and a stepped ramp.",
    history:
      "Suraj Pol is the main gate of the house, on the south side of the palace block, between the open courtyards and the residential court. It is not the fort’s Ram Pol, and it is not the outer Tripolia. The ramp rises toward the threshold. The photographs of the south face — colonnade, dome, jharokhas — are the wall this gate serves.",
    min: [-4, 0, 15],
    max: [5, 8, 24],
  },
  {
    id: "shiva",
    title: "Shiva shrine",
    where: "South-west court",
    built: "Temple recorded with the palace",
    summary: "A shrine with a curving shikhara, set in the court south of the zanana.",
    history:
      "The plot shows a Shiva temple in the south-west court, separate from the palace domes. The shikhara is a temple spire. The carved courses use the same niche-and-figure relief as the victory tower, at the scale of a household shrine.",
    min: [-19, 0, 20],
    max: [-9, 16, 32],
  },
  {
    id: "stambh",
    title: "Vijay Stambh",
    where: "South-east of the palace, beyond the road",
    built: "1440–1448, ordered by Maharana Kumbha",
    summary: "Nine storeys, 37.19 m to the cupola. Face 10.67 m wide at the base, 5.33 m under the dome.",
    history:
      "Placed where the plot and the map both put it: south-east of the palace, not in the house. James Tod’s survey: 37.19 m to the cupola, faces 10.67 m at the base and 5.33 m under the dome, on a terrace 12.8 m square. Nine storeys, a portico on every face, red sandstone and white marble. The door faces the palace. Sutradhar Jaita and his sons Napa, Puja and Poma carved it. The figure at the foot is 1.7 m. The niche relief stands in for the named images.",
    min: [92, 0, 56],
    max: [110, 44, 74],
  },
  {
    id: "fateh",
    title: "Fateh Prakash",
    where: "East of the palace, across the road",
    built: "Later palace, now a museum",
    summary: "A rectangular palace east of the road, not part of Kumbha’s house.",
    history:
      "The plot shows Fateh Prakash across the road-separated ground east of the old palace. It is a later building, now the palace museum. It is drawn as a complete range with its own court so the old house and the later one are not confused.",
    min: [94, 0, -14],
    max: [122, 14, 10],
  },
  {
    id: "bandar",
    title: "Nau Lakha Bandar",
    where: "East road, south of Fateh Prakash",
    built: "Treasury of the fort",
    summary: "A lower, heavier block. The treasury, not a residence.",
    history:
      "Nau Lakha Bandar stands on the plot south of Fateh Prakash, on the same side of the road. It is the fort treasury. The mass is lower and plainer than the palace domes.",
    min: [96, 0, 16],
    max: [116, 8, 32],
  },
  {
    id: "kund",
    title: "Jauhar Kund",
    where: "South of the stables",
    built: "Reservoir in the fort",
    summary: "A still pool south of the service courts.",
    history:
      "The plot marks a kund south of the palace courts. It is drawn as water, not as another building. The jauhar chambers remembered on the west slope are not given rooms; their sites are not standing in a plan that can be trusted stone by stone.",
    min: [-14, 0, 54],
    max: [2, 2, 70],
  },
  {
    id: "facade",
    title: "West palace wall",
    where: "Outer west face of the house",
    built: "Kumbha’s palace, restored reading of the standing shell",
    summary: "Rubble base, plastered upper wall, three rows of jharokhas, chhatris on the roof.",
    history:
      "The long photographs of the palace show this wall: a heavy rubble plinth, pink plaster above, and balconies stacked in rows, with small domes and merlons along the skyline. A door at ground level has a short step. The precinct around it is the plot’s 400 by 250 feet. The photographed court and the dome were not stretched to fill that rectangle; a door stays the height of a person.",
    min: [-36, 0, -14],
    max: [-28, 16, 18],
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
