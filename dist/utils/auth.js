"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const crypto = require("crypto");
const HASH_ITERATIONS = 100000;
const HASH_KEY_LENGTH = 64;
const HASH_DIGEST = "sha512";
const SESSION_TTL_DAYS = 7;
const toBuffer = (value) => Buffer.from(value, "hex");
const buildHash = (password, saltHex) => crypto.pbkdf2Sync(password, saltHex, HASH_ITERATIONS, HASH_KEY_LENGTH, HASH_DIGEST).toString("hex");
const hashPassword = (password) => {
    const saltHex = crypto.randomBytes(16).toString("hex");
    const hashHex = buildHash(password, saltHex);
    return `${saltHex}:${hashHex}`;
};
const verifyPassword = (password, storedHash) => {
    const [saltHex, hashHex] = storedHash.split(":");
    if (!saltHex || !hashHex)
        return false;
    const inputHashHex = buildHash(password, saltHex);
    return crypto.timingSafeEqual(toBuffer(hashHex), toBuffer(inputHashHex));
};
const createSessionToken = () => crypto.randomBytes(32).toString("hex");
const getSessionExpiration = () => {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + SESSION_TTL_DAYS);
    return expiresAt;
};
module.exports = {
    hashPassword,
    verifyPassword,
    createSessionToken,
    getSessionExpiration,
};
//# sourceMappingURL=auth.js.map