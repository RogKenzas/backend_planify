import express = require("express");

const { getClassroomSchedule, upsertScheduleSlot, deleteScheduleSlot, } = require("../controllers/scheduleControllers");

const router = express.Router();


/* =========================================================
   COURS
   ========================================================= */

/**
 * GET /api/schedule/data
 *
 * Récupère tous les cours du catalogue.
 */
// router.get("/data", getCourses);


/**
 * POST /api/schedule/post
 *
 * Crée un nouveau cours.
 */
// router.post("/post", createCourse);


/* =========================================================
   EMPLOI DU TEMPS PAR SALLE
   ========================================================= */

/**
 * GET /api/schedule/classroom/:classroomId
 *
 * Charge l'emploi du temps d'une salle.
 *
 * Exemple :
 * /api/schedule/classroom/671234...
 */
router.get( "/classroom/:classroomId", getClassroomSchedule );

/**
 * PUT /api/schedule/classroom/:classroomId
 *
 * Ajoute ou remplace le cours d'un créneau.
 *
 * Body attendu :
 *
 * {
 *   "courseId": "...",
 *   "day": "Lundi",
 *   "time": "08:00"
 * }
 */
router.put( "/classroom/:classroomId", upsertScheduleSlot );


/**
 * DELETE /api/schedule/classroom/:classroomId/:slotId
 *
 * Supprime un créneau du planning.
 */
router.delete( "/classroom/:classroomId/:slotId", deleteScheduleSlot );


/* =========================================================
   MODIFICATION D'UN COURS
   ========================================================= */

/**
 * PUT /api/schedule/:id
 *
 * Modifie un cours existant.
 *
 * IMPORTANT :
 * cette route reste après les routes /classroom.
 */
// router.put("/:id", updateCourse);


module.exports = router;