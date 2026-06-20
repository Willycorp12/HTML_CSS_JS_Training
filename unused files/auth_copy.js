// =========================
// Auth Config (same base you use in login.html)
// =========================
const API_BASE = "http://192.168.100.239";
const API_KEY  = "KSL-CLIENT-2025-SECURE";

// =========================
// Session Guard
// =========================
(function requireLogin(){
    const token = localStorage.getItem("SESSION_TOKEN");
    if(!token){
        // No session → go back to login
        window.location.href = "login.html";
        return;
    }
})();

async function apiFetch(path, options){
    options = options || {};
    options.method = options.method || "GET";

    const headers = options.headers || {};
    headers["X-API-KEY"] = API_KEY;
    headers["X-SESSION-TOKEN"] = localStorage.getItem("SESSION_TOKEN") || "";

    // Always set JSON if we are sending a body
    if(options.body !== undefined){
        headers["Content-Type"] = "application/json";
        if(typeof options.body !== "string"){
            options.body = JSON.stringify(options.body);
        }
    }

    options.headers = headers;

    const resp = await fetch(API_BASE + path, options);

    // If token expired/invalid, force re-login
    if(resp.status === 401 || resp.status === 403){
        localStorage.removeItem("SESSION_TOKEN");
        window.location.href = "login.html";
        return { success:false, message:"Session expired. Please login again." };
    }

    const raw = await resp.text();
    try { return JSON.parse(raw); }
    catch { return { success:false, message:"Server did not return JSON", raw: raw }; }
}
