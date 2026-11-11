//DATABASE LAYER
const path = require("node:path");
const { Sequelize, DataTypes } = require("sequelize");

const sequelize = new Sequelize({
    dialect: "sqlite",
    storage: path.join(__dirname, "password-manager.sqlite"),
    logging: false
});

const Website = sequelize.define("Website", {
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    url: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: { isUrl: true }
    }
});

const Credential = sequelize.define("Credential", {
    username: {
        type: DataTypes.STRING,
        allowNull: false
    },
    // Store encrypted password parts, not the plaintext password.
    passwordCiphertext: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    passwordIv: {
        type: DataTypes.STRING,
        allowNull: false
    },
    passwordAuthTag: {
        type: DataTypes.STRING,
        allowNull: false
    }
});

Website.hasMany(Credential, {
    as: "credentials",
    foreignKey: { name: "websiteId", allowNull: false },
    onDelete: "CASCADE"
});
Credential.belongsTo(Website, {
    as: "website",
    foreignKey: "websiteId"
});

module.exports = { sequelize, Website, Credential };