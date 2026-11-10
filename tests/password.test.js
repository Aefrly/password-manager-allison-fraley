const assert = require("node:assert/strict");
const test = require("node:test");
const { fetchWebsites, createWebsite } = require("../source code/api-service.js");

test("fetches websites from the API", async () => {
    const originalFetch = global.fetch;
    const websites = [{ id: 1, name: "Example", url: "https://example.com/" }];
    let requestUrl;

    global.fetch = async (url) => {
        requestUrl = url;
        return { ok: true, json: async () => websites };
    };

    try {
        assert.deepEqual(await fetchWebsites(), websites);
        assert.equal(requestUrl, "http://localhost:3000/api/websites");
    } finally {
        global.fetch = originalFetch;
    }
});

test("creates a website through the API", async () => {
    const originalFetch = global.fetch;
    const savedWebsite = { id: 1, name: "Example", url: "https://example.com/" };
    let requestUrl;
    let requestOptions;

    global.fetch = async (url, options) => {
        requestUrl = url;
        requestOptions = options;
        return { ok: true, json: async () => savedWebsite };
    };

    try {
        assert.deepEqual(await createWebsite({
            name: " Example ",
            url: "https://example.com"
        }), savedWebsite);
        assert.equal(requestUrl, "http://localhost:3000/api/websites");
        assert.equal(requestOptions.method, "POST");
        assert.equal(requestOptions.headers["Content-Type"], "application/json");
        assert.deepEqual(JSON.parse(requestOptions.body), {
            name: "Example",
            url: "https://example.com/"
        });
    } finally {
        global.fetch = originalFetch;
    }
});

test("rejects unsuccessful API responses and non-web URLs", async () => {
    const originalFetch = global.fetch;
    global.fetch = async () => ({ ok: false });

    try {
        await assert.rejects(fetchWebsites(), /Failed to fetch websites/);
        await assert.rejects(
            createWebsite({ name: "Example", url: "javascript:alert(1)" }),
            /Website URL must begin with http:\/\/ or https:\/\//
        );
    } finally {
        global.fetch = originalFetch;
    }
});
