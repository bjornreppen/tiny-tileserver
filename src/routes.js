import { browse } from "./html.js";
import { getCompression } from "./fileformat/mbtiles/pbf/protobuf.js";

function routes(app, index) {
  app.get("*?", (req, res, next) => {
    index
      .get(decodeURIComponent(req.path), req.query, req.headers.host)
      .then(node => {
        if (!node) return next();
        if (node.canBrowse) browse(node, req.path);
        if (node.contentType === "empty")
          return res.status(204).send("No Content");
        if (!node.contentType) return next();
        res.setHeader("Content-Type", node.contentType);
        if (!node.buffer) return res.sendFile(node.physicalDir);

        const compression = getCompression(node.buffer);
        if (compression) res.setHeader("Content-Encoding", compression);
        res.send(node.buffer);
      })
      .catch(err => {
        throw err;
        next(err);
      });
  });
}

export default routes;
