import type { Request, Response } from 'express';
import mongoose = require('mongoose');

const Room = require('../models/Room');


// ==========================================
// GET /api/rooms
// ==========================================

const getRooms = async (
    req: Request,
    res: Response
) => {
    try {
        const rooms = await Room.find()
            .sort({ building: 1, name: 1 });

        return res.status(200).json(rooms);

    } catch (error) {
        console.error(
            'Erreur récupération salles :',
            error
        );

        return res.status(500).json({
            message:
                'Impossible de récupérer les salles'
        });
    }
};


// ==========================================
// POST /api/rooms
// ==========================================

const createRoom = async (
    req: Request,
    res: Response
) => {
    try {
        const {
            name,
            building,
            capacity,
            type
        } = req.body;

        if (!name || !building) {
            return res.status(400).json({
                message:
                    'Le nom et le bâtiment sont obligatoires'
            });
        }

        const room = await Room.create({
            name,
            building,
            capacity,
            type
        });

        return res.status(201).json(room);

    } catch (error) {
        console.error(
            'Erreur création salle :',
            error
        );

        return res.status(500).json({
            message:
                'Impossible de créer la salle'
        });
    }
};


// ==========================================
// PUT /api/rooms/:id
// ==========================================

const updateRoom = async (
    req: Request,
    res: Response
) => {
    try {
        const id = req.params.id;

        if (
            !id ||
            Array.isArray(id) ||
            !mongoose.Types.ObjectId.isValid(id)
        ) {
            return res.status(400).json({
                message: 'ID de salle invalide'
            });
        }

        const {
            name,
            building,
            capacity,
            type
        } = req.body;

        const room = await Room.findByIdAndUpdate(
            id,
            {
                name,
                building,
                capacity,
                type
            },
            {
                new: true,
                runValidators: true
            }
        );

        if (!room) {
            return res.status(404).json({
                message: 'Salle introuvable'
            });
        }

        return res.status(200).json(room);

    } catch (error) {
        console.error(
            'Erreur modification salle :',
            error
        );

        return res.status(500).json({
            message:
                'Impossible de modifier la salle'
        });
    }
};


// ==========================================
// DELETE /api/rooms/:id
// ==========================================

const deleteRoom = async (
    req: Request,
    res: Response
) => {
    try {
        const id = req.params.id;

        if (
            !id ||
            Array.isArray(id) ||
            !mongoose.Types.ObjectId.isValid(id)
        ) {
            return res.status(400).json({
                message: 'ID de salle invalide'
            });
        }

        const room =
            await Room.findByIdAndDelete(id);

        if (!room) {
            return res.status(404).json({
                message: 'Salle introuvable'
            });
        }

        return res.status(200).json({
            message:
                'Salle supprimée avec succès',
            id: room._id.toString()
        });

    } catch (error) {
        console.error(
            'Erreur suppression salle :',
            error
        );

        return res.status(500).json({
            message:
                'Impossible de supprimer la salle'
        });
    }
};


export = { getRooms, createRoom, updateRoom, deleteRoom };