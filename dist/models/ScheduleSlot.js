"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require("mongoose");
const scheduleSlotSchema = new mongoose.Schema({
    /**
     * Classe à laquelle appartient ce créneau.
     *
     * Exemple :
     * 4DSA possède son propre lundi 08:00,
     * GS01 peut également avoir son lundi 08:00.
     */
    classroomId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Classroom",
        required: true,
    },
    roomId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Room",
        required: false,
        default: null
    },
    /**
     * Cours placé dans le créneau.
     */
    courseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
        required: true,
    },
    /**
     * Jour de la semaine.
     *
     * On garde volontairement les mêmes valeurs
     * que celles utilisées actuellement par le frontend.
     */
    day: {
        type: String,
        required: true,
        trim: true,
    },
    /**
     * Heure du créneau.
     *
     * Exemple :
     * 08:00
     * 10:00
     * 13:00
     * 15:00
     */
    time: {
        type: String,
        required: true,
        trim: true,
    },
}, {
    timestamps: true,
});
/**
 * Une salle ne peut contenir qu'un seul cours
 * pour un jour et une heure donnés.
 *
 * En revanche :
 *
 * 4DSA / Lundi / 08:00
 * GS01 / Lundi / 08:00
 *
 * sont deux créneaux différents et sont donc autorisés.
 */
scheduleSlotSchema.index({
    classroomId: 1,
    day: 1,
    time: 1,
}, {
    unique: true,
});
const ScheduleSlot = mongoose.models.ScheduleSlot ||
    mongoose.model("ScheduleSlot", scheduleSlotSchema);
module.exports = ScheduleSlot;
//# sourceMappingURL=ScheduleSlot.js.map