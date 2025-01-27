import path  from "path";
import express  from "express";
import log1  from "log-less-fancy";
import minimist  from "minimist";
import routes  from "./src/routes.js";
import Index  from "./src/index/index.js";
import pjson  from "./package.json" assert { type: "json" };


const log = log1()

var argv = minimist(process.argv.slice(2), { alias: { p: "port" } });
if (argv._.length !== 1) {
  console.log("Usage: node tiny-tileserver.js [options] [rootDirectory]");
  console.log("");
  console.log("rootDirectory    Data directory containing .mbtiles");
  console.log("");
  console.log("Options:");
  console.log("   -p PORT --port PORT       Set the HTTP port [8000]");
  console.log("");
  console.log("A root directory is required.");
  process.exit(1);
}

const app = express();

app.use(function(req, res, next) {
  res.header("X-Powered-By", "Tiny-tileserver v" + pjson.version);
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Credentials", "true");
  res.header("Access-Control-Allow-Methods", "GET");
  res.header("Access-Control-Expose-Headers", "Content-Length");
  res.header(
    "Access-Control-Allow-Headers",
    "Accept, Authorization, Content-Type, X-Requested-With"
  );
  if (req.method === "OPTIONS") {
    return res.send(200);
  } else {
    return next();
  }
});

const port = argv.port || 8000;
const rootDirectory = path.resolve(argv._[0] || ".");
const staticDirs = ["static", rootDirectory];
const oneDay = 86400000;

const index = new Index(rootDirectory);
routes(app, index);

staticDirs.forEach(dir =>
  app.use(express.static(dir, { maxAge: oneDay, immutable: true }))
);

app.listen(port, () => {
  log.info("Server root directory " + rootDirectory);
  log.info("Server listening on port " + port);
});
