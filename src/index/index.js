import { load, navigate, getTypeFromFileExt } from "../fileformat/index.js";

class Index {
  constructor(rootDir) {
    this.rootDir = rootDir;
  }

  async get(path, query, hostname) {
    const segments = this.parsePath(path);

    const cursor = {
      physicalDir: this.rootDir,
      fileRelPath: "",
      hostname: hostname,
      pathSegments: segments,
      type: "directory",
      query: query
    };
    let browseFiles = false;
    if (segments[segments.length - 1] === "") {
      // Trailing slash => list files rather than show index.html
      cursor.pathSegments.pop();
      browseFiles = true;
    }

    while (cursor.pathSegments.length > 0) {
      await navigate(cursor);
      if (cursor.final) break;
      if (cursor.notfound) return null;
    }
    cursor.browseFiles = browseFiles;
    await this.load(cursor);
    return cursor;
  }

  parsePath(relativePath) {
    if (!relativePath) return [];
    const parts = relativePath.split("/");
    while (parts.length > 0 && parts[0] == "") parts.shift();
    return parts;
  }

  async load(cursor) {
    await load(cursor);
  }
}

export default Index;
