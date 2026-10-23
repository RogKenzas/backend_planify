"use strict";
const mongoose = require("mongoose");
const Classroom = require('../models/Classroom');
const Course = require('../models/Course');
// =====================================================
// RÉCUPÉRER TOUS LES COURS
// GET /api/courses
// =====================================================
const getCourses = async (req, res) => {
    try {
        const courses = await Course.find()
            .populate('classroomId', 'name');
        return res.status(200).json(courses);
    }
    catch (error) {
        console.error('Erreur récupération des cours :', error);
        return res.status(500).json({
            message: 'Impossible de récupérer les cours'
        });
    }
};
// =====================================================
// RÉCUPÉRER UN COURS PAR ID
// GET /api/courses/:id
// =====================================================
const getCourseById = async (req, res) => {
    try {
        const id = req.params.id;
        if (!id || Array.isArray(id)) {
            return res.status(400).json({
                message: 'ID du cours invalide'
            });
        }
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                message: 'Format ID MongoDB invalide'
            });
        }
        const course = await Course
            .findById(id)
            .populate('classroomId', 'name');
        if (!course) {
            return res.status(404).json({
                message: 'Cours introuvable'
            });
        }
        return res.status(200).json(course);
    }
    catch (error) {
        console.error('Erreur récupération du cours :', error);
        return res.status(500).json({
            message: 'Erreur serveur'
        });
    }
};
// =====================================================
// CRÉER UN COURS
// POST /api/courses
// =====================================================
const createCourse = async (req, res) => {
    try {
        const { title, teacherId, classroomId, duration, color } = req.body;
        // ================================
        // Champs obligatoires
        // ================================
        if (!title || !teacherId || !classroomId) {
            return res.status(400).json({
                message: 'Le titre, le professeur et la salle sont obligatoires'
            });
        }
        // ================================
        // Vérifier teacherId
        // ================================
        if (!mongoose.Types.ObjectId.isValid(teacherId)) {
            return res.status(400).json({
                message: 'ID du professeur invalide'
            });
        }
        // ================================
        // Vérifier classroomId
        // ================================
        if (!mongoose.Types.ObjectId.isValid(classroomId)) {
            return res.status(400).json({
                message: 'ID de la salle invalide'
            });
        }
        // ================================
        // Vérifier que la salle existe
        // ================================
        const classroom = await Classroom.findById(classroomId);
        if (!classroom) {
            return res.status(404).json({
                message: 'Salle introuvable'
            });
        }
        // ================================
        // Création
        // ================================
        const course = await Course.create({
            title,
            teacherId,
            classroomId,
            duration: duration || '2h',
            color: color || 'blue'
        });
        // ================================
        // Retourner le cours avec la salle
        // ================================
        const populatedCourse = await Course
            .findById(course._id)
            .populate('classroomId', 'name');
        return res.status(201).json(populatedCourse);
    }
    catch (error) {
        console.error('Erreur création cours :', error);
        return res.status(500).json({
            message: 'Impossible de créer le cours'
        });
    }
};
// =====================================================
// MODIFIER UN COURS
// PUT /api/courses/:id
// =====================================================
const updateCourse = async (req, res) => {
    try {
        const id = req.params.id;
        if (!id || Array.isArray(id)) {
            return res.status(400).json({
                message: 'ID du cours invalide'
            });
        }
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                message: 'Format ID MongoDB invalide'
            });
        }
        const { title, teacherId, classroomId, duration, color } = req.body;
        // ================================
        // Vérifier teacherId
        // ================================
        if (teacherId &&
            !mongoose.Types.ObjectId.isValid(teacherId)) {
            return res.status(400).json({
                message: 'ID du professeur invalide'
            });
        }
        // ================================
        // Vérifier classroomId
        // ================================
        if (classroomId &&
            !mongoose.Types.ObjectId.isValid(classroomId)) {
            return res.status(400).json({
                message: 'ID de la salle invalide'
            });
        }
        // ================================
        // Vérifier que la salle existe
        // ================================
        if (classroomId) {
            const classroom = await Classroom.findById(classroomId);
            if (!classroom) {
                return res.status(404).json({
                    message: 'Salle introuvable'
                });
            }
        }
        // ================================
        // Modification
        // ================================
        const updatedCourse = await Course.findByIdAndUpdate(id, {
            title,
            teacherId,
            classroomId,
            duration,
            color
        }, {
            new: true,
            runValidators: true
        }).populate('classroomId', 'name');
        if (!updatedCourse) {
            return res.status(404).json({
                message: 'Cours introuvable'
            });
        }
        return res.status(200).json(updatedCourse);
    }
    catch (error) {
        console.error('Erreur modification cours :', error);
        return res.status(500).json({
            message: 'Impossible de modifier le cours'
        });
    }
};
// =====================================================
// SUPPRIMER UN COURS
// DELETE /api/courses/:id
// =====================================================
const deleteCourse = async (req, res) => {
    try {
        const id = req.params.id;
        console.log('ID reçu pour suppression :', id);
        if (!id || Array.isArray(id)) {
            return res.status(400).json({
                message: 'ID du cours invalide'
            });
        }
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                message: 'Format ID MongoDB invalide'
            });
        }
        const deletedCourse = await Course.findByIdAndDelete(id);
        if (!deletedCourse) {
            return res.status(404).json({
                message: 'Cours introuvable'
            });
        }
        console.log('Cours supprimé :', deletedCourse._id);
        return res.status(200).json({
            message: 'Cours supprimé avec succès',
            id: deletedCourse._id.toString()
        });
    }
    catch (error) {
        console.error('Erreur suppression cours :', error);
        return res.status(500).json({
            message: 'Impossible de supprimer le cours'
        });
    }
};
module.exports = {
    getCourses,
    getCourseById,
    createCourse,
    updateCourse,
    deleteCourse
};
//# sourceMappingURL=courseController.js.map