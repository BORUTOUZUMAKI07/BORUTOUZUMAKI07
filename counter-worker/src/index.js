const ALLOWED_ORIGINS = [
  "https://github.com",
  "https://raw.githubusercontent.com",
];

function corsHeaders(origin) {
  return {
    "Access-Control-Allow-Origin": ALLOWED_ORIGINS.includes(origin) ? origin : "*",
    "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
    "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
    "Content-Type": "image/svg+xml; charset=utf-8",
  };
}

function svgBadge(count) {
  const label = "PROFILE VIEWS";
  const value = String(count);
  const labelWidth = 138;
  const valueWidth = Math.max(70, value.length * 14 + 28);
  const width = labelWidth + valueWidth;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="28" role="img" aria-label="${label}: ${value}">
  <defs>
    <linearGradient id="bg" x1="0" x2="1">
      <stop offset="0%" stop-color="#07131a"/>
      <stop offset="100%" stop-color="#0b1d26"/>
    </linearGradient>
    <filter id="glow" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="1.5" result="blur"/>
      <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  </defs>
  <rect width="${width}" height="28" rx="5" fill="url(#bg)" stroke="#00F7FF" stroke-width="1"/>
  <path d="M${labelWidth} 0v28" stroke="#00F7FF" stroke-opacity=".45"/>
  <text x="69" y="18" text-anchor="middle" font-family="Arial,Helvetica,sans-serif" font-size="11" font-weight="700" fill="#00F7FF" filter="url(#glow)">${label}</text>
  <text x="${labelWidth + valueWidth / 2}" y="19" text-anchor="middle" font-family="Arial,Helvetica,sans-serif" font-size="13" font-weight="700" fill="#ffffff">${value}</text>
</svg>`;
}

export class ProfileCounter {
  constructor(state) {
    this.state = state;
  }

  async fetch(request) {
    const url = new URL(request.url);
    const origin = request.headers.get("Origin") || "";

    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: {
          ...corsHeaders(origin),
          "Access-Control-Allow-Headers": "Content-Type",
        },
      });
    }

    if (request.method !== "GET" && request.method !== "HEAD") {
      return new Response("Method Not Allowed", { status: 405 });
    }

    if (url.pathname !== "/profile/BORUTOUZUMAKI07.svg") {
      return new Response("Not Found", { status: 404 });
    }

    let count = await this.state.storage.get("count");
    if (typeof count !== "number") count = 0;

    count += 1;
    await this.state.storage.put("count", count);

    return new Response(request.method === "HEAD" ? null : svgBadge(count), {
      status: 200,
      headers: corsHeaders(origin),
    });
  }
}

export default {
  async fetch(request, env) {
    const id = env.PROFILE_COUNTER.idFromName("BORUTOUZUMAKI07");
    const stub = env.PROFILE_COUNTER.get(id);
    return stub.fetch(request);
  },
};
