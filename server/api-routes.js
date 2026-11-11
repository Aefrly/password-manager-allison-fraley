const crypto = require("node:crypto");
const express = require("express");

function getEncryptionKey(value = process.env.CREDENTIALS_ENCRYPTION_KEY) {
    if (typeof value !== "string" || !/^[0-9a-f]{64}$/i.test(value)) {
        throw new Error("CREDENTIALS_ENCRYPTION_KEY must be a 64-character hexadecimal key");
    }
    return Buffer.from(value, "hex");
}

function encryptPassword(password, key) {
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
    const ciphertext = Buffer.concat([
        cipher.update(password, "utf8"),
        cipher.final()
    ]);

    return {
        passwordCiphertext: ciphertext.toString("base64"),
        passwordIv: iv.toString("base64"),
        passwordAuthTag: cipher.getAuthTag().toString("base64")
    };
}

function decryptPassword(credential, key) {
    const decipher = crypto.createDecipheriv(
        "aes-256-gcm",
        key,
        Buffer.from(credential.passwordIv, "base64")
    );
    decipher.setAuthTag(Buffer.from(credential.passwordAuthTag, "base64"));
    return Buffer.concat([
        decipher.update(Buffer.from(credential.passwordCiphertext, "base64")),
        decipher.final()
    ]).toString("utf8");
}

function createApiRouter({ Website, Credential, encryptionKey }) {
    if (!Website || !Credential) {
        throw new Error("Website and Credential models are required");
    }
    const key = Buffer.isBuffer(encryptionKey)
        ? encryptionKey
        : getEncryptionKey(encryptionKey);
    if (key.length !== 32) {
        throw new Error("The credential encryption key must be 32 bytes");
    }

    const router = express.Router();

    router.get("/websites", async (request, response) => {
        const websites = await Website.findAll({ order: [["id", "ASC"]] });
        response.json(websites);
    });

    router.post("/websites", async (request, response) => {
        const { name, url } = request.body || {};
        if (typeof name !== "string" || !name.trim() || typeof url !== "string") {
            return response.status(400).json({ error: "Website name and URL are required" });
        }

        let parsedUrl;
        try {
            parsedUrl = new URL(url);
        } catch {
            return response.status(400).json({ error: "Website URL must be valid" });
        }
        if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
            return response.status(400).json({ error: "Website URL must begin with http:// or https://" });
        }

        const website = await Website.create({
            name: name.trim(),
            url: parsedUrl.href
        });
        response.status(201).json(website);
    });

    router.get("/credentials", async (request, response) => {
        const credentials = await Credential.findAll({
            attributes: [
                "id",
                "websiteId",
                "username",
                "passwordCiphertext",
                "passwordIv",
                "passwordAuthTag"
            ],
            include: [{
                model: Website,
                as: "website",
                attributes: ["name"]
            }],
            order: [["id", "ASC"]]
        });

        response.json(credentials.map((credential) => {
            const record = credential.get
                ? credential.get({ plain: true })
                : credential;
            return {
                id: record.id,
                websiteId: record.websiteId,
                websiteName: record.website.name,
                username: record.username,
                password: decryptPassword(record, key)
            };
        }));
    });

    router.post("/credentials", async (request, response) => {
        const { websiteId: websiteIdValue, username, password } = request.body || {};
        const websiteId = Number(websiteIdValue);
        if (
            websiteIdValue === undefined ||
            websiteIdValue === null ||
            websiteIdValue === "" ||
            !Number.isSafeInteger(websiteId) ||
            websiteId < 1
        ) {
            return response.status(400).json({ error: "A valid website ID is required" });
        }
        if (typeof username !== "string" || !username.trim()) {
            return response.status(400).json({ error: "Username or email is required" });
        }
        if (typeof password !== "string" || !password) {
            return response.status(400).json({ error: "Password is required" });
        }

        const website = await Website.findByPk(websiteId);
        if (!website) {
            return response.status(404).json({ error: "Website not found" });
        }

        const encryptedPassword = encryptPassword(password, key);
        const credential = await Credential.create({
            websiteId,
            username: username.trim(),
            ...encryptedPassword
        });

        response.status(201).json({
            id: credential.id,
            websiteId,
            websiteName: website.name,
            username: credential.username
        });
    });

    return router;
}

module.exports = {
    createApiRouter,
    decryptPassword,
    encryptPassword,
    getEncryptionKey
};
