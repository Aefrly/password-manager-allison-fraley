//import functions from api-service.js
const {
    fetchWebsites,
    fetchCredentials,
    createWebsite,
    createCredential
} = require("../source code/api-service.js");

describe("API service", () => {
    const originalFetch = global.fetch;

    //mock function to simulate fetch behavior
    beforeEach(() => {
        global.fetch = jest.fn();
    });

    //mock function to restore original fetch behavior after each test
    afterEach(() => {
        jest.restoreAllMocks();
        global.fetch = originalFetch;
    });

    //tests to fetch websites from API
    test("fetches websites from the API", async () => {
        const websites = [{ id: 1, name: "Example", url: "https://example.com/" }];
        global.fetch.mockResolvedValue({
            ok: true,
            json: jest.fn().mockResolvedValue(websites)
        });

        await expect(fetchWebsites()).resolves.toEqual(websites);
        expect(global.fetch).toHaveBeenCalledWith("/api/websites");
    });

    test("fetches credentials from the API", async () => {
        const credentials = [{
            id: 1,
            websiteId: 1,
            websiteName: "Example",
            username: "user@example.com",
            password: "secret"
        }];
        global.fetch.mockResolvedValue({
            ok: true,
            json: jest.fn().mockResolvedValue(credentials)
        });

        await expect(fetchCredentials()).resolves.toEqual(credentials);
        expect(global.fetch).toHaveBeenCalledWith("/api/credentials");
    });

    test("rejects unsuccessful credential fetch responses", async () => {
        jest.spyOn(console, "error").mockImplementation(() => {});
        global.fetch.mockResolvedValue({ ok: false });

        await expect(fetchCredentials()).rejects.toThrow("Failed to fetch credentials");
    });

    //tests to create a website through the API
    test("creates a website through the API", async () => {
        const savedWebsite = { id: 1, name: "Example", url: "https://example.com/" };
        global.fetch.mockResolvedValue({
            ok: true,
            json: jest.fn().mockResolvedValue(savedWebsite)
        });

        await expect(createWebsite({
            name: " Example ",
            url: "https://example.com"
        })).resolves.toEqual(savedWebsite);
        expect(global.fetch).toHaveBeenCalledWith("/api/websites", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                name: "Example",
                url: "https://example.com/"
            })
        });
    });

    test("creates credentials through the API", async () => {
        const savedCredential = { id: 1, websiteId: 1, username: "user@example.com" };
        global.fetch.mockResolvedValue({
            ok: true,
            json: jest.fn().mockResolvedValue(savedCredential)
        });

        await expect(createCredential({
            websiteId: 1,
            username: " user@example.com ",
            password: "secret"
        })).resolves.toEqual(savedCredential);
        expect(global.fetch).toHaveBeenCalledWith("/api/credentials", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                websiteId: 1,
                username: "user@example.com",
                password: "secret"
            })
        });
    });

    test("rejects unsuccessful credential API responses", async () => {
        jest.spyOn(console, "error").mockImplementation(() => {});
        global.fetch.mockResolvedValue({ ok: false });

        await expect(createCredential({
            websiteId: 1,
            username: "user@example.com",
            password: "secret"
        })).rejects.toThrow("Failed to save credentials");
    });

    test("rejects missing credential data without sending a request", async () => {
        jest.spyOn(console, "error").mockImplementation(() => {});

        await expect(createCredential({
            websiteId: 1,
            username: " ",
            password: "secret"
        })).rejects.toThrow("Username or email is required");
        expect(global.fetch).not.toHaveBeenCalled();
    });

    //tests to handle unsuccessful API responses
    test("rejects unsuccessful API responses", async () => {
        jest.spyOn(console, "error").mockImplementation(() => {});
        global.fetch.mockResolvedValue({ ok: false });

        await expect(fetchWebsites()).rejects.toThrow("Failed to fetch websites");
    });

    //tests to handle invalid URLs
    test("rejects non-web URLs without sending a request", async () => {
        await expect(
            createWebsite({ name: "Example", url: "javascript:alert(1)" })
        ).rejects.toThrow("Website URL must begin with http:// or https://");
        expect(global.fetch).not.toHaveBeenCalled();
    });
});
