//BACKEND LAYER
const API_BASE_URL = "http://localhost:3000/api";

async function fetchWebsites() {
    try {
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

async function createWebsite(websiteData) {
    try {
        const websiteUrl = new URL(websiteData.url);
        if (websiteUrl.protocol !== "http:" && websiteUrl.protocol !== "https:") {
            throw new Error("Website URL must begin with http:// or https://");
        }

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

const apiService = { fetchWebsites, createWebsite };

if (typeof window !== "undefined") {
    window.apiService = apiService;
}

if (typeof module !== "undefined" && module.exports) {
    module.exports = apiService;
}
