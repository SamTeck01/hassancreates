// Local stand-ins for Cloudinary and Resend, used ONLY by the Playwright suite
// (via CLOUDINARY_API_BASE / RESEND_BASE_URL). Records every request so tests
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
    // Fake Behance project pages
    if (req.method === "GET" && req.url.startsWith("/gallery/111/")) {
      const CDN = "https://mir-s3-cdn-cf.behance.net/project_modules";
      res.writeHead(200, { "content-type": "text/html" });
      return res.end(`<!doctype html><html><head><title>Stance Branding on Behance</title>
<meta property="og:title" content="Stance Branding on Behance">
<meta property="og:description" content="Identity &amp; packaging for Stance.">
<meta property="og:image" content="https://mir-s3-cdn-cf.behance.net/projects/404/abc.png">
</head><body><img src="${CDN}/max_808/aaa.png"><img src="${CDN}/1400/aaa.png"><img src="${CDN}/disp/bbb.jpg"><img src="${CDN}/1400/bbb.jpg">
<script>window.d={"project":{"published_on":1767225600,"tags":[{"title":"Branding"},{"title":"Packaging"}]},"m":"https:\\/\\/mir-s3-cdn-cf.behance.net\\/project_modules\\/fs\\/ccc.webp"}</script></body></html>`);
    }
    if (req.method === "GET" && req.url.startsWith("/gallery/")) { res.writeHead(404); return res.end("not found"); }
    if (req.method === "POST" && req.url === "/__reset") { requests = []; return json(200, { ok: true }); }

    const text = body.toString("latin1");
    if (req.method === "POST" && /^\/v1_1\/[^/]+\/image\/upload$/.test(req.url)) {
      const field = (n) => (text.match(new RegExp(`name="${n}"\\r\\n\\r\\n([^\\r]*)`)) || [])[1];
      requests.push({
        service: "cloudinary", url: req.url,
        preset: field("upload_preset"), folder: field("folder"),
        hasFile: /name="file"; filename=/.test(text), bytes: body.length,
      });
      const n = requests.filter((r) => r.service === "cloudinary").length;
      return json(200, { secure_url: `${UPLOADED_URL}?e2e=${n}` }); // unique per upload
    }
    if (req.method === "POST" && req.url === "/emails") {
      requests.push({ service: "resend", auth: req.headers.authorization, payload: JSON.parse(body.toString("utf8")) });
      return json(200, { id: "e2e-email-id" });
    }
    json(404, { error: "mock: unknown route " + req.url });
  });
}).listen(PORT, () => console.log(`mock services on ${PORT}`));
