import { listTables, getColumns, listRows, read } from "./sqliteReader.js";

const columnsCache = {};

async function getColumns2(cursor) {
  const table = cursor.pathSegments[0];
  const key = cursor.physicalDir + ":" + table;
  let value = columnsCache[key];
  if (value) return value;
  value = await getColumns(cursor.physicalDir, table);
  columnsCache[key] = value;
  return value;
}

class SqliteHandler {
  async load(cursor) {
    const segments = cursor.pathSegments;
    if (!cursor.browseFiles && segments.length == 0) return;
    switch (segments.length) {
      case 0:
        cursor.files = await listTables(cursor.physicalDir);
        cursor.canBrowse = true;
        break;
      case 1:
        cursor.files = await listRows(
          cursor.physicalDir,
          segments[0],
          await getColumns2(cursor)
        );
        cursor.canBrowse = true;
        break;
      case 2:
        const buffer = await read(
          cursor.physicalDir,
          segments[0],
          segments.slice(1),
          await getColumns2(cursor)
        );
        if (!buffer) return null;
        cursor.contentType = "application/json";
        cursor.buffer = buffer;
        break;
    }
  }
}

export default SqliteHandler;
