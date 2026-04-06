const { validationResult } = require("express-validator");
const Match = require("../models/Match");

// GET /api/matches
const getMatches = async (req, res) => {
  try {
    const { status, intensity } = req.query;
    const filter = {};

    if (status) filter.status = status;
    if (intensity) filter.intensity = intensity;

    const matches = await Match.find(filter)
      .populate("players.user", "name position")
      .populate("createdBy", "name")
      .sort({ date: 1 });

    res.json(matches);
  } catch (error) {
    res.status(500).json({ message: "Error del servidor" });
  }
};

// GET /api/matches/:id
const getMatchById = async (req, res) => {
  try {
    const match = await Match.findById(req.params.id)
      .populate("players.user", "name position rating birthDate playStyle")
      .populate("createdBy", "name");

    if (!match) {
      return res.status(404).json({ message: "Partido no encontrado" });
    }

    res.json(match);
  } catch (error) {
    res.status(500).json({ message: "Error del servidor" });
  }
};

// POST /api/matches
const createMatch = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, location, lat, lng, date, time, maxPlayers, ageRange, intensity } = req.body;

    // Crear slots vacíos
    const playersPerTeam = maxPlayers / 2;
    const players = [];
    for (let i = 0; i < maxPlayers; i++) {
      players.push({
        user: null,
        team: i < playersPerTeam ? "A" : "B",
        slotIndex: i,
      });
    }

    const match = await Match.create({
      createdBy: req.user._id,
      name,
      location,
      lat,
      lng,
      date,
      time,
      maxPlayers,
      players,
      ageRange,
      intensity,
    });

    await match.populate("createdBy", "name");
    res.status(201).json(match);
  } catch (error) {
    res.status(500).json({ message: "Error del servidor" });
  }
};

// POST /api/matches/:id/join
const joinMatch = async (req, res) => {
  try {
    const { slotIndex } = req.body;
    const match = await Match.findById(req.params.id);

    if (!match) {
      return res.status(404).json({ message: "Partido no encontrado" });
    }

    if (match.status !== "upcoming") {
      return res.status(400).json({ message: "El partido no está disponible" });
    }

    // Verificar si ya está en el partido
    const alreadyIn = match.players.some(
      (p) => p.user && p.user.toString() === req.user._id.toString()
    );

    if (alreadyIn) {
      // Mover al nuevo slot
      const oldSlot = match.players.find(
        (p) => p.user && p.user.toString() === req.user._id.toString()
      );
      if (oldSlot) oldSlot.user = null;
    }

    const slot = match.players.find((p) => p.slotIndex === slotIndex);
    if (!slot) {
      return res.status(400).json({ message: "Slot inválido" });
    }
    if (slot.user) {
      return res.status(400).json({ message: "El lugar ya está ocupado" });
    }

    slot.user = req.user._id;
    await match.save();

    await match.populate("players.user", "name position");
    res.json(match);
  } catch (error) {
    res.status(500).json({ message: "Error del servidor" });
  }
};

// POST /api/matches/:id/leave
const leaveMatch = async (req, res) => {
  try {
    const match = await Match.findById(req.params.id);

    if (!match) {
      return res.status(404).json({ message: "Partido no encontrado" });
    }

    const slot = match.players.find(
      (p) => p.user && p.user.toString() === req.user._id.toString()
    );

    if (!slot) {
      return res.status(400).json({ message: "No estás en este partido" });
    }

    slot.user = null;
    await match.save();

    await match.populate("players.user", "name position");
    res.json(match);
  } catch (error) {
    res.status(500).json({ message: "Error del servidor" });
  }
};

// PATCH /api/matches/:id/finish
const finishMatch = async (req, res) => {
  try {
    const { teamAScore, teamBScore } = req.body;
    const match = await Match.findById(req.params.id);

    if (!match) {
      return res.status(404).json({ message: "Partido no encontrado" });
    }

    if (match.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Solo el creador puede finalizar el partido" });
    }

    match.status = "finished";
    match.result = { teamA: teamAScore, teamB: teamBScore };
    await match.save();

    res.json(match);
  } catch (error) {
    res.status(500).json({ message: "Error del servidor" });
  }
};

module.exports = { getMatches, getMatchById, createMatch, joinMatch, leaveMatch, finishMatch };
