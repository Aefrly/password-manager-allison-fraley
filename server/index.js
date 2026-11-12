const path = require("node:path");
const fs = require("node:fs");
const express = require("express");
const { sequelize, Website, Credential } = require("./models");
const { createApiRouter, getEncryptionKey } = require("./api-routes");

const HOST = process.env.HOST || "127.0.0.1";
const PORT = Number(process.env.PORT || 3000);
const ENV_FILE = path.join(__dirname, "..", "documentation", ".env");

// Loads environment variables from the .env file
function loadEnvironmentFile(filePath) {
    if (!fs.existsSync(filePath)) {
        return;
    }

    const lines = fs.readFileSync(filePath, "utf8").split(/\r?\n/);
    lines.forEach((line) => {
        const match = line.match(/^\s*(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*?)\s*$/);
        if (!match || process.env[match[1]] !== undefined) {
            return;
        }

        let value = match[2];
        if (
            value.length >= 2 &&
            ((value.startsWith("\"") && value.endsWith("\"")) ||
                (value.startsWith("'") && value.endsWith("'")))
        ) {
            value = value.slice(1, -1);
        } else {
            value = value.replace(/\s+#.*$/, "");
        }
        process.env[match[1]] = value;
    });
}

// Starts the Express server, loading environment variables, authenticating the database, and setting up routes
async function startServer() {
    loadEnvironmentFile(ENV_FILE);
    const encryptionKey = getEncryptionKey();
    await sequelize.authenticate();
    await sequelize.sync();

    const app = express();
    app.use(express.json({ limit: "32kb" }));
    app.use("/api", createApiRouter({ Website, Credential, encryptionKey }));
    app.use(express.static(path.join(__dirname, "..", "source code")));
    app.use((error, request, response, next) => {
        if (response.headersSent) {
            return next(error);
        }
        console.error("API request failed:", error.message);
        return response.status(500).json({ error: "Internal server error" });
    });

    app.listen(PORT, HOST, () => {
        console.log(`OpenSesame server listening at http://${HOST}:${PORT}`);
    });
}

if (require.main === module) {
    startServer().catch((error) => {
        console.error("Unable to start OpenSesame server:", error.message);
        process.exitCode = 1;
    });
}

module.exports = { startServer };
