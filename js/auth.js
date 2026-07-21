const API_BASE = "https://www.buib-app.online";
const API_KEY = "KSL-CLIENT-2025-SECURE";

const LOGIN_PAGE = "login.html";
let sessionTimer = null;

function clearSession() {
    localStorage.removeItem("SESSION_TOKEN");

    localStorage.removeItem("SESSION_EXPIRES_AT");
    localStorage.removeItem("SESSION_EXPIRES_AT_SERVER");
    localStorage.removeItem("SESSION_DURATION_MINUTES"); // harmless for old browsers/users

    localStorage.removeItem("USER_PERMISSIONS");
    localStorage.removeItem("USER_ID");
}

function redirectToLogin(reason = "expired") {
    clearSession();

    const currentPath = encodeURIComponent(
        window.location.pathname + window.location.search
    );

    window.location.href = `${LOGIN_PAGE}?expired=true&reason=${reason}&next=${currentPath}`;
}

function getRemainingSessionMs() {
    const expiresAt = Number(localStorage.getItem("SESSION_EXPIRES_AT") || 0);
    return expiresAt - Date.now();
}

function enforceSession() {
    const token = localStorage.getItem("SESSION_TOKEN");
    const expiresAt = Number(localStorage.getItem("SESSION_EXPIRES_AT") || 0);

    if (!token || !expiresAt) {
        window.location.href = `${LOGIN_PAGE}?reason=no_session`;
        return false;
    }

    if (Date.now() >= expiresAt) {
        redirectToLogin("expired");
        return false;
    }

    return true;
}

function startSessionTimer() {
    if (!enforceSession()) return;

    const remainingMs = getRemainingSessionMs();

    if (sessionTimer) {
        clearTimeout(sessionTimer);
    }

    sessionTimer = setTimeout(() => {
        redirectToLogin("expired");
    }, remainingMs);
}


(function requireLogin() {
    startSessionTimer();
})();

async function apiFetch(path, options = {}) {
    if (!enforceSession()) {
        return new Promise(() => { });
    }

    const token = localStorage.getItem("SESSION_TOKEN");

    const headers = {
        "X-API-KEY": API_KEY,
        "X-SESSION-TOKEN": token || "",
        ...options.headers
    };

    if (options.body && typeof options.body !== "string") {
        headers["Content-Type"] = "application/json";
        options.body = JSON.stringify(options.body);
    }

    try {
        const response = await fetch(API_BASE + path, {
            ...options,
            headers
        });

        if (response.status === 401 || response.status === 403) {
            redirectToLogin("server_rejected");
            return new Promise(() => { });
        }

        const rawText = await response.text();

        let data;

        try {
            data = JSON.parse(rawText);
        } catch (e) {
            return {
                success: false,
                message: "Invalid JSON response",
                raw: rawText
            };
        }

        const msg = String(data?.message || data?.error || "").toLowerCase();

        if (
            data?.success === false &&
            (
                msg.includes("session required") ||
                msg.includes("session expired") ||
                msg.includes("invalid session") ||
                msg.includes("unauthorized")
            )
        ) {
            redirectToLogin("server_session_expired");
            return new Promise(() => { });
        }

        return data;

    } catch (networkError) {
        return {
            success: false,
            message: "Cannot connect to server."
        };
    }
}

window.logout = async function () {

    const token = localStorage.getItem("SESSION_TOKEN");

    if (token) {
        try {
            const resp = await fetch(API_BASE + "/api/v1/auth/logout", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-API-KEY": API_KEY,
                    "X-SESSION-TOKEN": token
                },
                body: JSON.stringify({})
            });


            const raw = await resp.text();

        } catch (e) {
            console.error("logout request failed:", e);
        }
    }

    clearSession();
    window.location.href = LOGIN_PAGE;
}