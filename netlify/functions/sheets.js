// GESTRPNOOK — proxy Netlify -> Google Apps Script
const APPS_SCRIPT_URL = process.env.APPS_SCRIPT_URL || "";

exports.handler = async (event) => {
  const cors = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json",
  };
  if (event.httpMethod === "OPTIONS") return { statusCode: 204, headers: cors, body: "" };

  const params = event.queryStringParameters || {};
  if (params.action === "ping") {
    return { statusCode: 200, headers: cors, body: JSON.stringify({ ok: true, hasUrl: !!APPS_SCRIPT_URL }) };
  }
  if (!APPS_SCRIPT_URL) {
    return { statusCode: 500, headers: cors, body: JSON.stringify({ error: "Falta APPS_SCRIPT_URL" }) };
  }

  const qs = event.rawQuery && event.rawQuery.length ? event.rawQuery : new URLSearchParams(params).toString();
  const url = APPS_SCRIPT_URL + (qs ? (APPS_SCRIPT_URL.includes("?") ? "&" : "?") + qs : "");
  try {
    const opts = { method: event.httpMethod, redirect: "follow" };
    if (event.httpMethod === "POST" && event.body) {
      opts.headers = { "Content-Type": "application/json" };
      opts.body = event.body;
    }
    const resp = await fetch(url, opts);
    const text = await resp.text();
    return { statusCode: 200, headers: cors, body: text };
  } catch (e) {
    return { statusCode: 502, headers: cors, body: JSON.stringify({ error: String(e) }) };
  }
};
