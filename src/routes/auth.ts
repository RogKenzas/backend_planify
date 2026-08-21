import type { Request, Response } from "express";
import express = require("express");
const {
  createSessionToken,
  getSessionExpiration,
  hashPassword,
  verifyPassword,
} = require("../utils/auth");

const User = require("../models/User");
const Session = require("../models/Session");

const router = express.Router();

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const USERNAME_REGEX = /^[a-zA-Z0-9_.-]{3,30}$/;

const getBearerToken = (req: Request) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return null;
  if (!authHeader.startsWith("Bearer ")) return null;
  return authHeader.slice(7).trim() || null;
};

router.get("/availability", async (req: Request, res: Response) => {
  try {
    const { email, username } = req.query as {
      email?: string;
      username?: string;
    };

    const normalizedEmail = email?.trim().toLowerCase();
    const normalizedUsername = username?.trim();

    const [emailExists, usernameExists] = await Promise.all([
      normalizedEmail ? User.exists({ email: normalizedEmail }) : null,
      normalizedUsername ? User.exists({ username: normalizedUsername }) : null,
    ]);

    return res.json({
      ok: true,
      email: { checked: Boolean(normalizedEmail), exists: Boolean(emailExists) },
      username: { checked: Boolean(normalizedUsername), exists: Boolean(usernameExists) },
    });
  } catch (err) {
    return res.status(500).json({ ok: false, message: "Erreur serveur." });
  }
});

router.post("/register", async (req: Request, res: Response) => {
  try {
    const { email, username, password } = (req.body ?? {}) as {
      email?: string;
      username?: string;
      password?: string;
    };

    const normalizedEmail = email?.trim().toLowerCase();
    const normalizedUsername = username?.trim();

    if (!normalizedEmail || !normalizedUsername || !password) {
      return res.status(400).json({ ok: false, message: "Champs requis manquants." });
    }

    if (!EMAIL_REGEX.test(normalizedEmail)) {
      return res.status(400).json({ ok: false, message: "Format email invalide." });
    }

    if (!USERNAME_REGEX.test(normalizedUsername)) {
      return res
        .status(400)
        .json({ ok: false, message: "Username invalide (3-30, lettres/chiffres/._-)." });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ ok: false, message: "Le mot de passe doit contenir au moins 6 caractères." });
    }

    const [existingEmail, existingUsername] = await Promise.all([
      User.exists({ email: normalizedEmail }),
      User.exists({ username: normalizedUsername }),
    ]);

    if (existingEmail) {
      return res.status(409).json({ ok: false, message: "Cet email est déjà utilisé." });
    }

    if (existingUsername) {
      return res.status(409).json({ ok: false, message: "Ce username est déjà utilisé." });
    }

    const user = await User.create({
      email: normalizedEmail,
      username: normalizedUsername,
      passwordHash: hashPassword(password),
      role: "user",
    });

    const token = createSessionToken();
    await Session.create({
      userId: user._id,
      token,
      expiresAt: getSessionExpiration(),
    });

    return res.status(201).json({
      ok: true,
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    return res.status(500).json({ ok: false, message: "Erreur serveur." });
  }
});

router.post("/login", async (req: Request, res: Response) => {
  try {
    const { email, username, identifier, password } = (req.body ?? {}) as {
      email?: string;
      username?: string;
      identifier?: string;
      password?: string;
    };

    const loginIdentifier = identifier?.trim() || email?.trim().toLowerCase() || username?.trim();

    if (!password || !loginIdentifier) {
      return res.status(400).json({ ok: false, message: "Champs requis manquants." });
    }

    const searchQuery = loginIdentifier.includes("@")
      ? { email: loginIdentifier.toLowerCase() }
      : { username: loginIdentifier };

    const user = await User.findOne(searchQuery);

    if (!user || !verifyPassword(password, user.passwordHash)) {
      return res.status(401).json({ ok: false, message: "Identifiants invalides." });
    }

    const token = createSessionToken();
    await Session.create({
      userId: user._id,
      token,
      expiresAt: getSessionExpiration(),
    });

    return res.json({
      ok: true,
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    return res.status(500).json({ ok: false, message: "Erreur serveur." });
  }
});

router.get("/session", async (req: Request, res: Response) => {
  try {
    const token = getBearerToken(req);
    if (!token) {
      return res.status(401).json({ ok: false, message: "Session invalide." });
    }

    const session = await Session.findOne({
      token,
      expiresAt: { $gt: new Date() },
    }).populate("userId", "username email role");

    if (!session || !session.userId) {
      return res.status(401).json({ ok: false, message: "Session expirée ou invalide." });
    }

    return res.json({
      ok: true,
      user: {
        id: session.userId._id,
        username: session.userId.username,
        email: session.userId.email,
        role: session.userId.role,
      },
    });
  } catch (err) {
    return res.status(500).json({ ok: false, message: "Erreur serveur." });
  }
});

router.post("/logout", async (req: Request, res: Response) => {
  try {
    const token = getBearerToken(req);
    if (!token) {
      return res.status(400).json({ ok: false, message: "Token manquant." });
    }

    await Session.deleteOne({ token });
    return res.json({ ok: true, message: "Déconnexion réussie." });
  } catch (err) {
    return res.status(500).json({ ok: false, message: "Erreur serveur." });
  }
});

module.exports = router;

