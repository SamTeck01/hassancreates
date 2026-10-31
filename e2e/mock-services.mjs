// Local stand-in for Cloudinary, used ONLY by the Playwright suite
// (via CLOUDINARY_API_BASE). Records every request so tests
// can assert exactly what the app sent. GET /__requests returns them.
import http from "node:http";

const PORT = Number(process.env.MOCK_PORT || 3124);
// A real, existing Cloudinary image of Hassan's, so uploaded previews render.
const UPLOADED_URL = "https://res.cloudinary.com/dcltjbjol/image/upload/v1783895189/hassancreates/sh8wucxbi4aevbco1vil.png";
let requests = [];

http.createServer((req, res) => {
  const chunks = [];
  req.on("data", (c) => chunks.push(c));
  req.on("end", () => {
    const body = Buffer.concat(chunks);
    const json = (code, obj) => { res.writeHead(code, { "content-type": "application/json" }); res.end(JSON.stringify(obj)); };
    if (req.method === "GET" && req.url === "/__requests") return json(200, requests);
    if (req.method === "POST" && req.url === "/__reset") { requests = []; return json(200, { ok: true }); }

    const text = body.toString("latin1");
    if (req.method === "POST" && /^\/v1_1\/[^/]+\/image\/upload$/.test(req.url)) {
      const field = (n) => (text.match(new RegExp(`name="${n}"\\r\\n\\r\\n([^\\r]*)`)) || [])[1];
      requests.push({
        service: "cloudinary", url: req.url,
        preset: field("upload_preset"), folder: field("folder"),
        hasFile: /name="file"; filename=/.test(text), bytes: body.length,
      });
      return json(200, { secure_url: UPLOADED_URL });
    }
    json(404, { error: "mock: unknown route " + req.url });
  });
}).listen(PORT, () => console.log(`mock services on ${PORT}`));
