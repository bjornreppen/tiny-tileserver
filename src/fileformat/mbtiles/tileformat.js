import log1 from "log-less-fancy";

const log = log1();

const formats = {
  pbf: {
    contentType: "application/x-protobuf",
    extension: "pbf"
  },
  png: { contentType: "image/png", extension: "png" },
  jpg: { contentType: "image/jpg", extension: "jpg" }
};

function getFormatSettings(formatstring) {
  const format = formats[formatstring];
  if (format) return format;
  log.warn(
    "Unknown mbtiles format specified in metadata table: " + formatstring
  );
  return {};
}

export default getFormatSettings;
