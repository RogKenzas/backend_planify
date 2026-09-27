import type { Request, Response } from "express";

const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const scheduleRoutes = require("./routes/schedule");
const teacherRoutes = require("./routes/teachers");
const courseRoutes = require("./routes/course")
const navRoutes = require("./routes/nav");
const authRoutes = require("./routes/auth");
const dotenv = require("dotenv");

dotenv.config();

const port = Number(process.env.PORT) || 10000;

const app = express();

/**
 * Connexion à MongoDB
 */
connectDB();

/**
 * CORS
 *
 * En local :
 * - http://localhost:5173
 * - http://localhost:3000
 *
 * En production :
 * - FRONTEND_URL doit être définie dans Render
 */
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(
  cors({
    origin: (
      origin: string | undefined,
      callback: (err: Error | null, allow?: boolean) => void
    ) => {
      // Autorise les requêtes sans Origin
      // (ex: certains outils backend, health checks, etc.)
      if (!origin) {
        return callback(null, true);
      }

      // Autorise les origines configurées
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      console.log("CORS blocked:", origin);

      return callback(new Error("Not allowed by CORS"));
    },

    credentials: true,
  })
);

/**
 * Middleware JSON
 */
app.use(express.json());

/**
 * Health check
 */
app.get("/api/health", (req: Request, res: Response) => {
  res.json({
    ok: true,
    service: "backend",
    time: new Date().toISOString(),
  });
});

/**
 * Routes
 */
app.use("/api/schedule", scheduleRoutes);
app.use("/api/course", courseRoutes)
app.use("/api/teachers", teacherRoutes);
app.use("/api/nav", navRoutes);
app.use("/api/auth", authRoutes);

/**
 * Démarrage du serveur
 */
app.listen(port, () => {
  console.log(
    `Serveur backend est en cours d'exécution sur http://localhost:${port}`
  );
});