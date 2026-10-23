"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const { getClassrooms, getClassroomById, createClassroom, updateClassroom, deleteClassroom, } = require("../controllers/classroomControllers");
const router = express.Router();
/**
 * GET /api/classrooms
 *
 * Récupérer toutes les salles
 */
router.get("/", getClassrooms);
/**
 * GET /api/classrooms/:id
 *
 * Récupérer une salle par son identifiant
 */
router.get("/:id", getClassroomById);
/**
 * POST /api/classrooms
 *
 * Créer une nouvelle salle
 */
router.post("/", createClassroom);
/**
 * PUT /api/classrooms/:id
 *
 * Modifier une salle existante
 */
router.put("/:id", updateClassroom);
/**
 * DELETE /api/classrooms/:id
 *
 * Supprimer une salle
 */
router.delete("/:id", deleteClassroom);
module.exports = router;
//# sourceMappingURL=classrooms.js.map