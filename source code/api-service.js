//BACKEND LAYER
// Use the server that delivered the page in both local and hosted environments.
const API_BASE_URL = "/api";

// fetches saved websites from the API
async function fetchWebsites() {
    try {
        //using GET request 
        const response = await fetch(`${API_BASE_URL}/websites`);
        if (!response.ok) {
            throw new Error("Failed to fetch websites");
        }
        return await response.json();
    } catch (error) {
        console.error("Error fetching websites:", error);
        throw error;
    }
}

// fetches saved credentials from the API
async function fetchCredentials() {
    try {
        const response = await fetch(`${API_BASE_URL}/credentials`);
        if (!response.ok) {
            throw new Error("Failed to fetch credentials");
        }
        return await response.json();
    } catch (error) {
        console.error("Error fetching credentials:", error);
        throw error;
    }
}

//receives website information and creates a new website through the API
async function createWebsite(websiteData) {
    try {
        //parses URL and tests if it is valid
        const websiteUrl = new URL(websiteData.url);
        if (websiteUrl.protocol !== "http:" && websiteUrl.protocol !== "https:") {
            throw new Error("Website URL must begin with http:// or https://");
        }

        //using POST request to create a new website
        const response = await fetch(`${API_BASE_URL}/websites`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                name: websiteData.name.trim(),
                url: websiteUrl.href
            })
        });
        if (!response.ok) {
            throw new Error("Failed to create website");
        }
        return await response.json();
    } catch (error) {
        console.error("Error creating website:", error);
        throw error;
    }
}

//receives credential information and creates it through the API
async function createCredential(credentialData) {
    try {
        if (!credentialData || typeof credentialData !== "object") {
            throw new Error("Credential information is required");
        }
        if (credentialData.websiteId === undefined || credentialData.websiteId === null || credentialData.websiteId === "") {
            throw new Error("Website ID is required");
        }

        if (typeof credentialData.username !== "string" || !credentialData.username.trim()) {
            throw new Error("Username or email is required");
        }
        if (typeof credentialData.password !== "string" || !credentialData.password) {
            throw new Error("Password is required");
        }

        const username = credentialData.username.trim();
        const response = await fetch(`${API_BASE_URL}/credentials`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                websiteId: credentialData.websiteId,
                username,
                password: credentialData.password
            })
        });
        if (!response.ok) {
            throw new Error("Failed to save credentials");
        }
        return await response.json();
    } catch (error) {
        console.error("Error creating credentials:", error);
        throw error;
    }
}

const apiService = { fetchWebsites, fetchCredentials, createWebsite, createCredential };

if (typeof window !== "undefined") {
    window.apiService = apiService;
}

if (typeof module !== "undefined" && module.exports) {
    module.exports = apiService;
}
