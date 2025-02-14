import { readTile, listFiles } from "./mbtileReader.js";
import { toGeoJson } from "./pbf/protobuf.js";
import { decodePbf } from "./pbf/pbf_dump.js";
import tilejson from "./tilejson.js";
import mbtilesFormats from "./mbtilesFormats.js";
import render from "./pbf/pbf_render.js";

class Index {
  list(cursor, level, fileext, items) {
    const files = items.map(item => {
      const f1 = Object.values(item)[0].toString();
      const r = {
        filesize: item.size,
        name: f1
      };
      switch (fileext) {
        case "pbf":
          r.alternateFormats = {
            geojson: f1 + "?format=geojson",
            pbfjson: f1 + "?format=pbfjson",
            png:
              f1 +
              "?format=png&border=rgba(128,128,128,0.2)&size=768&font=8px%20Tahoma&fontColor=rgba(0,0,0,0.3)&stroke=rgba(0,0,0,0.4)&antialias=none"
          };
          break;
      }
      return r;
    });
    cursor.canBrowse = true;
    cursor.files = files;
  }

  async load(cursor) {
    const segments = cursor.pathSegments;
    if ("tilejson" in cursor.query) return tilejson(cursor);
    if (!cursor.browseFiles && segments.length == 0) return;
    const path = cursor.physicalDir;
    const format = await mbtilesFormats.getContentDescription(
      cursor.physicalDir
    );
    switch (segments.length) {
      case 0:
      case 1:
      case 2:
        const raw = await listFiles(path, segments);
        await this.list(
          cursor,
          ["zoom", "column", "row"][segments.length],
          ["", "", format.extension][segments.length],
          raw
        );
        break;
      case 3:
        const buffer = await readTile(path, ...segments);
        if (!buffer) {
          cursor.contentType = "empty";
          return;
        }
        const [z, x, y] = segments;
        const response = this.makeFormat(buffer, cursor.query, format, z, x, y);
        cursor.contentType = response.contentType;
        cursor.buffer = response.buffer;
    }
  }

  makeFormat(buffer, query, format, z, x, y) {
    switch (query.format) {
      case "pbfjson":
        return {
          contentType: "application/json",
          buffer: decodePbf(buffer)
        };
      case "json":
        return {
          contentType: "application/json",
          buffer: toGeoJson(x, y, z, buffer)
        };
      case "geojson":
        return {
          contentType: "application/json",
          buffer: toGeoJson(x, y, z, buffer)
        };
      case "png":
        return {
          contentType: "image/png",
          buffer: render(decodePbf(buffer), query)
        };
      default:
        if (!format) throw new Error("Unknown format: " + query.format);
        return {
          contentType: format.contentType,
          buffer: buffer
        };
    }
  }
}

export default Index;
