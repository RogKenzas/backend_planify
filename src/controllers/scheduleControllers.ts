import type { Request, Response } from "express";
import mongoose = require("mongoose");

const Course = require("../models/Course");
const Teacher = require("../models/Teacher");
const Classroom = require("../models/Classroom");
const ScheduleSlot = require("../models/ScheduleSlot");


/* =========================================================
   SERIALIZATION DES COURS
   ========================================================= */

const serializeCourse = (course: {
  _id: unknown;
  title: string;
  teacherId: unknown;
  room: string;
  duration: string;
  color: "blue" | "green" | "purple" | "yellow";
}) => ({
  id: String(course._id),
  title: course.title,
  teacherId: String(course.teacherId),
  room: course.room,
  duration: course.duration,
  color: course.color,
});


/* =========================================================
   SERIALIZATION DES CRÉNEAUX
   ========================================================= */

const serializeScheduleSlot = (slot: any) => ({
  id: String(slot._id),

  classroomId:
    slot.classroomId?._id
      ? String(slot.classroomId._id)
      : String(slot.classroomId),

  courseId:
    slot.courseId?._id
      ? String(slot.courseId._id)
      : String(slot.courseId),

  day: slot.day,
  time: slot.time,

  course: slot.courseId?._id
    ? {
      id: String(slot.courseId._id),
      title: slot.courseId.title,
      teacherId: String(slot.courseId.teacherId),
      room: slot.courseId.room,
      duration: slot.courseId.duration,
      color: slot.courseId.color,
    }
    : null,

  createdAt: slot.createdAt,
  updatedAt: slot.updatedAt,
});


/* =========================================================
   COURS
   ========================================================= */

const getCourses = async (_req: Request, res: Response) => {
  try {
    const courses = await Course.find().sort({ createdAt: -1 });

    res.json(
      courses.map(serializeCourse)
    );
  } catch (error) {
    console.error("Erreur getCourses :", error);

    res.status(500).json({
      message: "Impossible de charger les cours",
    });
  }
};


const createCourse = async (req: Request, res: Response) => {
  try {
    const title = String(req.body?.title ?? "").trim();
    const teacherId = String(req.body?.teacherId ?? "").trim();
    const room = String(req.body?.room ?? "").trim();
    const duration = String(req.body?.duration ?? "2h").trim();
    const color = String(req.body?.color ?? "blue").trim();

    if (!title || !teacherId || !room) {
      res.status(400).json({
        message:
          "L'intitulé, la salle et le professeur sont requis",
      });
      return;
    }

    if (!mongoose.Types.ObjectId.isValid(teacherId)) {
      res.status(400).json({
        message: "Professeur invalide",
      });
      return;
    }

    const teacher = await Teacher.findById(teacherId);

    if (!teacher) {
      res.status(400).json({
        message: "Aucun professeur existant",
      });
      return;
    }

    const course = await Course.create({
      title,
      teacherId,
      room,
      duration,
      color,
    });

    res.status(201).json(
      serializeCourse(course)
    );
  } catch (error) {
    console.error("Erreur createCourse :", error);

    res.status(500).json({
      message: "Impossible d'enregistrer le cours",
    });
  }
};


const updateCourse = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id ?? "");
    const title = String(req.body?.title ?? "").trim();
    const teacherId = String(req.body?.teacherId ?? "").trim();
    const room = String(req.body?.room ?? "").trim();
    const duration = String(req.body?.duration ?? "2h").trim();
    const color = String(req.body?.color ?? "blue").trim();

    if (!title || !teacherId || !room) {
      res.status(400).json({
        message:
          "L'intitulé, la salle et le professeur sont requis",
      });
      return;
    }

    if (
      !mongoose.Types.ObjectId.isValid(id) ||
      !mongoose.Types.ObjectId.isValid(teacherId)
    ) {
      res.status(400).json({
        message: "Identifiant invalide",
      });
      return;
    }

    const teacher = await Teacher.findById(teacherId);

    if (!teacher) {
      res.status(400).json({
        message: "Aucun professeur existant",
      });
      return;
    }

    const course = await Course.findByIdAndUpdate(
      id,
      {
        title,
        teacherId,
        room,
        duration,
        color,
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!course) {
      res.status(404).json({
        message: "Aucun cours existant",
      });
      return;
    }

    res.json(
      serializeCourse(course)
    );
  } catch (error) {
    console.error("Erreur updateCourse :", error);

    res.status(500).json({
      message: "Impossible de modifier le cours",
    });
  }
};


/* =========================================================
   EMPLOI DU TEMPS D'UNE SALLE
   ========================================================= */

/**
 * GET
 *
 * Charge tous les créneaux d'une salle.
 */
const getClassroomSchedule = async (
  req: Request,
  res: Response
) => {
  try {
    const classroomId = String(
      req.params.classroomId ?? ""
    );

    if (
      !mongoose.Types.ObjectId.isValid(classroomId)
    ) {
      res.status(400).json({
        message: "Identifiant de salle invalide",
      });
      return;
    }

    const classroom = await Classroom.findById(
      classroomId
    );

    if (!classroom) {
      res.status(404).json({
        message: "Salle introuvable",
      });
      return;
    }

    const slots = await ScheduleSlot.find({
      classroomId,
    })
      .populate("courseId")
      .sort({
        day: 1,
        time: 1,
      });

    res.json(
      slots.map(serializeScheduleSlot)
    );
  } catch (error) {
    console.error(
      "Erreur getClassroomSchedule :",
      error
    );

    res.status(500).json({
      message:
        "Impossible de charger l'emploi du temps",
    });
  }
};


/**
 * PUT
 *
 * Crée un créneau s'il n'existe pas.
 *
 * S'il existe déjà pour cette salle + jour + heure,
 * le cours est remplacé.
 */
const upsertScheduleSlot = async (
  req: Request,
  res: Response
) => {
  try {
    const classroomId = String(
      req.params.classroomId ?? ""
    );

    const courseId = String(
      req.body?.courseId ?? ""
    ).trim();

    const day = String(
      req.body?.day ?? ""
    ).trim();

    const time = String(
      req.body?.time ?? ""
    ).trim();

    if (
      !classroomId ||
      !courseId ||
      !day ||
      !time
    ) {
      res.status(400).json({
        message:
          "La salle, le cours, le jour et l'heure sont requis",
      });
      return;
    }

    if (
      !mongoose.Types.ObjectId.isValid(classroomId) ||
      !mongoose.Types.ObjectId.isValid(courseId)
    ) {
      res.status(400).json({
        message: "Identifiant invalide",
      });
      return;
    }

    /*
     * Vérification de la salle.
     */
    const classroom = await Classroom.findById(
      classroomId
    );

    if (!classroom) {
      res.status(404).json({
        message: "Salle introuvable",
      });
      return;
    }

    /*
     * Vérification du cours.
     */
    const course = await Course.findById(courseId);

    if (!course) {
      res.status(404).json({
        message: "Cours introuvable",
      });
      return;
    }

    /*
     * Un créneau est identifié par :
     *
     * classroomId + day + time
     *
     * Si le créneau existe déjà, son cours
     * est remplacé.
     */
    const slot = await ScheduleSlot.findOneAndUpdate(
      {
        classroomId,
        day,
        time,
      },
      {
        $set: {
          courseId,
        },
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true,
      }
    ).populate("courseId");

    res.json(
      serializeScheduleSlot(slot)
    );
  } catch (error: any) {
    console.error(
      "Erreur upsertScheduleSlot :",
      error
    );

    if (error?.code === 11000) {
      res.status(409).json({
        message:
          "Ce créneau est déjà occupé",
      });
      return;
    }

    res.status(500).json({
      message:
        "Impossible d'enregistrer le créneau",
    });
  }
};


/**
 * DELETE
 *
 * Supprime un créneau précis d'une salle.
 */
const deleteScheduleSlot = async (
  req: Request,
  res: Response
) => {
  try {
    const classroomId = String(
      req.params.classroomId ?? ""
    );

    const slotId = String(
      req.params.slotId ?? ""
    );

    if (
      !mongoose.Types.ObjectId.isValid(classroomId) ||
      !mongoose.Types.ObjectId.isValid(slotId)
    ) {
      res.status(400).json({
        message: "Identifiant invalide",
      });
      return;
    }

    /*
     * On utilise classroomId ET slotId.
     *
     * Cela évite de supprimer accidentellement
     * le créneau d'une autre salle.
     */
    const slot =
      await ScheduleSlot.findOneAndDelete({
        _id: slotId,
        classroomId,
      });

    if (!slot) {
      res.status(404).json({
        message: "Créneau introuvable",
      });
      return;
    }

    res.json({
      message: "Créneau supprimé avec succès",
      id: String(slot._id),
    });
  } catch (error) {
    console.error(
      "Erreur deleteScheduleSlot :",
      error
    );

    res.status(500).json({
      message:
        "Impossible de supprimer le créneau",
    });
  }
};


module.exports = {
  /*
   * Cours
   */
  getCourses,
  createCourse,
  updateCourse,

  /*
   * Planning
   */
  getClassroomSchedule,
  upsertScheduleSlot,
  deleteScheduleSlot,
};