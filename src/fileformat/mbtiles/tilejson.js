import { readMetadata } from "./mbtileReader.js";

const template = {
  bounds: [0, 0, 180, 85.051129],
  minzoom: 0,
  maxzoom: 12,
  version: "1.1",
  attribution: "Artsdatabanken",
  tilejson: "2.0.0",
  tiles: ["http://abc/AO.mbtiles/{z}/{x}/{y}"],
  vector_layers: [
    {
      id: "AO",
      description: "description"
    }
  ]
};

async function tilejson(cursor) {
  const meta = await readMetadata(cursor.physicalDir);
  const tj = JSON.parse(JSON.stringify(template));
  tj.minzoom = parseInt(meta.minzoom);
  tj.maxzoom = parseInt(meta.maxzoom);
  tj.tiles = [`https://${cursor.hostname}${cursor.fileRelPath}/{z}/{x}/{y}`];
  tj.vector_layers = [
    { id: cursor.name.replace(".mbtiles", ""), description: "-" }
  ];
  tj.bounds = meta.bounds.split(",").map(b => parseFloat(b));
  cursor.buffer = tj;
  cursor.contentType = "application/json";
}

export default tilejson;
