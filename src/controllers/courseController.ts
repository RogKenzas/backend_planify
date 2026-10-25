import type { Request, Response } from 'express';
import mongoose = require('mongoose');

const Course = require('../models/Course');
const ScheduleSlot = require('../models/ScheduleSlot');


// =====================================================
// RÉCUPÉRER TOUS LES COURS
// GET /api/courses
// =====================================================

const getCourses = async (
    req: Request,
    res: Response
) => {
    try {

        const courses = await Course.find()
        return res.status(200).json(courses);

    } catch (error) {

        console.error(
            'Erreur récupération des cours :',
            error
        );

        return res.status(500).json({
            message: 'Impossible de récupérer les cours'
        });
    }
};


// =====================================================
// RÉCUPÉRER UN COURS PAR ID
// GET /api/courses/:id
// =====================================================

const getCourseById = async (
    req: Request,
    res: Response
) => {
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

        const course = await Course.findById(id)
        if (!course) {
            return res.status(404).json({
                message: 'Cours introuvable'
            });
        }

        return res.status(200).json(course);

    } catch (error) {

        console.error(
            'Erreur récupération du cours :',
            error
        );

        return res.status(500).json({
            message: 'Erreur serveur'
        });
    }
};


// =====================================================
// CRÉER UN COURS
// POST /api/courses
// =====================================================

const createCourse = async (
    req: Request,
    res: Response
) => {
    try {

        const {
            title,
            teacherId,
            duration,
            color
        } = req.body;

        if (!title || !teacherId) {
            return res.status(400).json({
                message:
                    'Le titre et le professeur sont obligatoires'
            });
        }

        if (!mongoose.Types.ObjectId.isValid(teacherId)) {
            return res.status(400).json({
                message: 'ID du professeur invalide'
            });
        }

        const course = await Course.create({
            title,
            teacherId,
            duration: duration || '2h',
            color: color || 'blue'
        });

        return res.status(201).json(course);

    } catch (error) {

        console.error(
            'Erreur création cours :',
            error
        );

        return res.status(500).json({
            message: 'Impossible de créer le cours'
        });
    }
};


// =====================================================
// MODIFIER UN COURS
// PUT /api/courses/:id
// =====================================================

const updateCourse = async (
    req: Request,
    res: Response
) => {
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

        const {
            title,
            teacherId,
            duration,
            color
        } = req.body;

        if (
            teacherId &&
            !mongoose.Types.ObjectId.isValid(teacherId)
        ) {
            return res.status(400).json({
                message: 'ID du professeur invalide'
            });
        }

        const updatedCourse =
            await Course.findByIdAndUpdate(
                id,
                {
                    title,
                    teacherId,
                    duration,
                    color
                },
                {
                    new: true,
                    runValidators: true
                }
            );

        if (!updatedCourse) {
            return res.status(404).json({
                message: 'Cours introuvable'
            });
        }

        return res.status(200).json(updatedCourse);

    } catch (error) {

        console.error(
            'Erreur modification cours :',
            error
        );

        return res.status(500).json({
            message:
                'Impossible de modifier le cours'
        });
    }
};

// =====================================================
// SUPPRIMER UN COURS
// DELETE /api/courses/:id
// =====================================================

const deleteCourse = async (
    req: Request,
    res: Response
) => {
    try {

        const id = req.params.id;

        console.log(
            'ID reçu pour suppression :',
            id
        );

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

        const deletedCourse =
            await Course.findByIdAndDelete(id);

        if (!deletedCourse) {
            return res.status(404).json({
                message: 'Cours introuvable'
            });
        }

        console.log(
            'Cours supprimé :',
            deletedCourse._id
        );

        return res.status(200).json({
            message: 'Cours supprimé avec succès',
            id: deletedCourse._id.toString()
        });

    } catch (error) {

        console.error(
            'Erreur suppression cours :',
            error
        );

        return res.status(500).json({
            message: 'Impossible de supprimer le cours'
        });
    }
};

// =====================================================
// SUPPRIMER TOUS LES COURS
// DELETE /api/courses
// =====================================================

const deleteAllCourses = async (
    req: Request,
    res: Response
) => {
    try {

        // Supprime les créneaux utilisant les cours
        const deletedSlots =
            await ScheduleSlot.deleteMany({});

        // Supprime ensuite le catalogue
        const deletedCourses =
            await Course.deleteMany({});

        return res.status(200).json({
            message:
                'Le catalogue des cours a été vidé avec succès',

            deletedCourses:
                deletedCourses.deletedCount,

            deletedScheduleSlots:
                deletedSlots.deletedCount
        });

    } catch (error) {

        console.error(
            'Erreur vidage catalogue :',
            error
        );

        return res.status(500).json({
            message:
                'Impossible de vider le catalogue des cours'
        });
    }
};


// =====================================================
// EXPORTS
// =====================================================

export = {
    getCourses,
    getCourseById,
    createCourse,
    updateCourse,
    deleteCourse,
    deleteAllCourses
};