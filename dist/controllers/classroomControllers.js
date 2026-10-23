"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require("mongoose");
const Classroom = require("../models/Classroom");
const Teacher = require("../models/Teacher");
/**
 * Transforme une salle MongoDB en objet propre pour le frontend.
 *
 * MongoDB utilise "_id".
 * Notre frontend utilisera simplement "id".
 */
const serializeClassroom = (classroom) => ({
    id: String(classroom._id),
    name: classroom.name,
    teacherId: classroom.teacherId?._id
        ? String(classroom.teacherId._id)
        : String(classroom.teacherId),
    teacher: classroom.teacherId?._id
        ? {
            id: String(classroom.teacherId._id),
            name: classroom.teacherId.name,
            subject: classroom.teacherId.subject,
        }
        : null,
    createdAt: classroom.createdAt,
    updatedAt: classroom.updatedAt,
});
/**
 * GET /api/classrooms
 *
 * Récupère toutes les salles.
 */
const getClassrooms = async (_req, res) => {
    try {
        const classrooms = await Classroom.find()
            .populate("teacherId", "name subject")
            .sort({ createdAt: -1 });
        res.json(classrooms.map(serializeClassroom));
    }
    catch (error) {
        console.error("Erreur getClassrooms :", error);
        res.status(500).json({
            message: "Impossible de charger les salles",
        });
    }
};
/**
 * GET /api/classrooms/:id
 *
 * Récupère une seule salle.
 */
const getClassroomById = async (req, res) => {
    try {
        const id = req.params.id;
        if (typeof id !== "string" || !mongoose.Types.ObjectId.isValid(id)) {
            res.status(400).json({
                message: "Identifiant de salle invalide",
            });
            return;
        }
        const classroom = await Classroom.findById(id).populate("teacherId", "name subject");
        if (!classroom) {
            res.status(404).json({
                message: "Salle introuvable",
            });
            return;
        }
        res.json(serializeClassroom(classroom));
    }
    catch (error) {
        console.error("Erreur getClassroomById :", error);
        res.status(500).json({
            message: "Impossible de charger la salle",
        });
    }
};
/**
 * POST /api/classrooms
 *
 * Crée une nouvelle salle.
 */
const createClassroom = async (req, res) => {
    try {
        const name = String(req.body?.name ?? "").trim();
        const teacherId = String(req.body?.teacherId ?? "").trim();
        /*
         * Vérification des champs obligatoires.
         */
        if (!name || !teacherId) {
            res.status(400).json({
                message: "Le nom de la salle et le professeur titulaire sont requis",
            });
            return;
        }
        /*
         * Vérification de l'identifiant MongoDB du professeur.
         */
        if (!mongoose.Types.ObjectId.isValid(teacherId)) {
            res.status(400).json({
                message: "Identifiant du professeur invalide",
            });
            return;
        }
        /*
         * Vérification que le professeur existe réellement.
         */
        const teacher = await Teacher.findById(teacherId);
        if (!teacher) {
            res.status(404).json({
                message: "Professeur introuvable",
            });
            return;
        }
        /*
         * Vérification qu'une salle avec ce nom
         * n'existe pas déjà.
         */
        const existingClassroom = await Classroom.findOne({
            name: {
                $regex: `^${escapeRegex(name)}$`,
                $options: "i",
            },
        });
        if (existingClassroom) {
            res.status(409).json({
                message: "Une salle portant ce nom existe déjà",
            });
            return;
        }
        /*
         * Création de la salle dans MongoDB.
         */
        const classroom = await Classroom.create({
            name,
            teacherId,
        });
        /*
         * Récupération des informations du professeur
         * avant d'envoyer la réponse au frontend.
         */
        await classroom.populate("teacherId", "name subject");
        res.status(201).json(serializeClassroom(classroom));
    }
    catch (error) {
        console.error("Erreur createClassroom :", error);
        /*
         * Sécurité supplémentaire si MongoDB détecte
         * un doublon sur le nom.
         */
        if (error?.code === 11000) {
            res.status(409).json({
                message: "Une salle portant ce nom existe déjà",
            });
            return;
        }
        res.status(500).json({
            message: "Impossible de créer la salle",
        });
    }
};
/**
 * PUT /api/classrooms/:id
 *
 * Modifie une salle existante.
 */
const updateClassroom = async (req, res) => {
    try {
        const id = String(req.params.id ?? "").trim();
        const name = String(req.body?.name ?? "").trim();
        const teacherId = String(req.body?.teacherId ?? "").trim();
        /*
         * Vérification de l'id de la salle.
         */
        if (!mongoose.Types.ObjectId.isValid(id)) {
            res.status(400).json({
                message: "Identifiant de salle invalide",
            });
            return;
        }
        /*
         * Vérification des champs.
         */
        if (!name || !teacherId) {
            res.status(400).json({
                message: "Le nom de la salle et le professeur titulaire sont requis",
            });
            return;
        }
        /*
         * Vérification de l'id du professeur.
         */
        if (!mongoose.Types.ObjectId.isValid(teacherId)) {
            res.status(400).json({
                message: "Identifiant du professeur invalide",
            });
            return;
        }
        /*
         * Vérification que le professeur existe.
         */
        const teacher = await Teacher.findById(teacherId);
        if (!teacher) {
            res.status(404).json({
                message: "Professeur introuvable",
            });
            return;
        }
        /*
         * Vérification des doublons.
         *
         * On cherche une AUTRE salle ayant déjà ce nom.
         */
        const duplicateClassroom = await Classroom.findOne({
            _id: {
                $ne: id,
            },
            name: {
                $regex: `^${escapeRegex(name)}$`,
                $options: "i",
            },
        });
        if (duplicateClassroom) {
            res.status(409).json({
                message: "Une autre salle porte déjà ce nom",
            });
            return;
        }
        /*
         * Modification.
         */
        const classroom = await Classroom.findByIdAndUpdate(id, {
            name,
            teacherId,
        }, {
            new: true,
            runValidators: true,
        }).populate("teacherId", "name subject");
        if (!classroom) {
            res.status(404).json({
                message: "Salle introuvable",
            });
            return;
        }
        res.json(serializeClassroom(classroom));
    }
    catch (error) {
        console.error("Erreur updateClassroom :", error);
        if (error?.code === 11000) {
            res.status(409).json({
                message: "Une salle portant ce nom existe déjà",
            });
            return;
        }
        res.status(500).json({
            message: "Impossible de modifier la salle",
        });
    }
};
/**
 * DELETE /api/classrooms/:id
 *
 * Supprime une salle.
 */
const deleteClassroom = async (req, res) => {
    try {
        const id = req.params.id;
        if (typeof id !== "string" || !mongoose.Types.ObjectId.isValid(id)) {
            res.status(400).json({
                message: "Identifiant de salle invalide",
            });
            return;
        }
        const classroom = await Classroom.findByIdAndDelete(id);
        if (!classroom) {
            res.status(404).json({
                message: "Salle introuvable",
            });
            return;
        }
        res.json({
            message: "Salle supprimée avec succès",
            id: String(classroom._id),
        });
    }
    catch (error) {
        console.error("Erreur deleteClassroom :", error);
        res.status(500).json({
            message: "Impossible de supprimer la salle",
        });
    }
};
/**
 * Échappe les caractères spéciaux utilisés
 * dans les expressions régulières.
 */
const escapeRegex = (value) => {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};
module.exports = {
    getClassrooms,
    getClassroomById,
    createClassroom,
    updateClassroom,
    deleteClassroom,
};
//# sourceMappingURL=classroomControllers.js.map