import type { Request, Response } from "express";

const express = require ("express");
const cors = require ("cors");
const connectDB = require("./config/db");
const scheduleRoutes = require("./routes/schedule");
const teacherRoutes = require("./routes/teachers");
const navRoutes = require("./routes/nav");
const authRoutes = require("./routes/auth");
const dotenv = require("dotenv");

dotenv.config();
const port = Number(process.env.PORT) || 5000;

const app = express();

connectDB();

app.use(
  cors({
    origin: (
      origin: string | undefined,
      callback: (err: Error | null, allow?: boolean) => void
    ) => {
      if (!origin) return callback(null, true);
      if (/^http:\/\/localhost:\d+$/.test(origin)) return callback(null, true);
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);
app.use(express.json());

app.get("/api/health", (req: Request, res: Response) => {
  res.json({ ok: true, service: "backend", time: new Date().toISOString() });
});

app.use("/api/schedule", scheduleRoutes);
app.use("/api/teachers", teacherRoutes);
app.use("/api/nav", navRoutes);
app.use("/api/auth", authRoutes);

app.listen(port, () => {
    console.log(`Serveur backend est en cours d'exécution sur http://localhost:${port}`);
});