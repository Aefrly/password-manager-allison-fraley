const path = require("node:path");
const express = require("express");
const { sequelize, Website, Credential } = require("./models");
const { createApiRouter, getEncryptionKey } = require("./api-routes");

const HOST = "127.0.0.1";
const PORT = Number(process.env.PORT || 3000);

async function startServer() {
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
