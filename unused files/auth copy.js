const API_BASE = "https://www.buib-app.online";
const API_KEY = "KSL-CLIENT-2025-SECURE";

const LOGIN_PAGE = "login.html";
let sessionTimer = null;

function clearSession() {
    localStorage.removeItem("SESSION_TOKEN");
    localStorage.removeItem("SESSION_EXPIRES_AT");
    localStorage.removeItem("SESSION_DURATION_MINUTES");
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

        try {
            return JSON.parse(rawText);
        } catch (e) {
            return {
                success: false,
                message: "Invalid JSON response",
                raw: rawText
            };
        }

    } catch (networkError) {
        return {
            success: false,
            message: "Cannot connect to server."
        };
    }
}

function logout() {
    clearSession();
    window.location.href = LOGIN_PAGE;
}