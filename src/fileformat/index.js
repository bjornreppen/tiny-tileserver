import MbTilesHandler from "./mbtiles/index.js";
import SqliteHandler from "./sqlite/index.js";
import FileHandler from "./file.js";
import DirectoryHandler from "./directory.js";

class MissingHandler {
  load(cursor) {}
  navigate(cursor) {
    cursor.final = true;
  }
}

const formats = {
  file: new FileHandler(),
  directory: new DirectoryHandler(),
  mbtiles: new MbTilesHandler(),
  sqlite: new SqliteHandler()
};

function getHandler(type) {
  const handler = formats[type];
  if (!handler) return new MissingHandler();
  return handler;
}

async function load(cursor, fragment) {
  const handler = getHandler(cursor.type);
  return await handler.load(cursor, fragment);
}

async function navigate(cursor) {
  const handler = getHandler(cursor.type);
  return await handler.navigate(cursor);
}

function getTypeFromFileExt(ext) {
  if (formats[ext]) return ext;
  return "file";
}

export { load, navigate, getTypeFromFileExt };
