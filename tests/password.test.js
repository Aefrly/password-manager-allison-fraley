const { fetchWebsites, createWebsite } = require("../source code/api-service.js");

describe("website API service", () => {
    const originalFetch = global.fetch;

    beforeEach(() => {
        global.fetch = jest.fn();
    });

    afterEach(() => {
        jest.restoreAllMocks();
        global.fetch = originalFetch;
    });

    test("fetches websites from the API", async () => {
        const websites = [{ id: 1, name: "Example", url: "https://example.com/" }];
        global.fetch.mockResolvedValue({
            ok: true,
            json: jest.fn().mockResolvedValue(websites)
        });

        await expect(fetchWebsites()).resolves.toEqual(websites);
        expect(global.fetch).toHaveBeenCalledWith("http://localhost:3000/api/websites");
    });

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
        expect(global.fetch).toHaveBeenCalledWith("http://localhost:3000/api/websites", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                name: "Example",
                url: "https://example.com/"
            })
        });
    });

    test("rejects unsuccessful API responses", async () => {
        jest.spyOn(console, "error").mockImplementation(() => {});
        global.fetch.mockResolvedValue({ ok: false });

        await expect(fetchWebsites()).rejects.toThrow("Failed to fetch websites");
    });

    test("rejects non-web URLs without sending a request", async () => {
        await expect(
            createWebsite({ name: "Example", url: "javascript:alert(1)" })
        ).rejects.toThrow("Website URL must begin with http:// or https://");
        expect(global.fetch).not.toHaveBeenCalled();
    });
});
