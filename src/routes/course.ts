import express = require('express');
import courseController = require('../controllers/courseController');

const router = express.Router();


// ===============================
// RÉCUPÉRER TOUS LES COURS
// GET /api/courses
// ===============================
router.get(
    '/',
    courseController.getCourses
);


// ===============================
// RÉCUPÉRER UN COURS PAR ID
// GET /api/courses/:id
// ===============================
router.get(
    '/:id',
    courseController.getCourseById
);


// ===============================
// CRÉER UN COURS
// POST /api/courses
// ===============================
router.post(
    '/',
    courseController.createCourse
);


// ===============================
// MODIFIER UN COURS
// PUT /api/courses/:id
// ===============================
router.put(
    '/:id',
    courseController.updateCourse
);


// ===============================
// SUPPRIMER UN COURS
// DELETE /api/courses/:id
// ===============================
router.delete(
    '/:id',
    courseController.deleteCourse
);


export = router;