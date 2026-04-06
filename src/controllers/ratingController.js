const MatchRating = require("../models/MatchRating");
const Match = require("../models/Match");
const User = require("../models/User");

// POST /api/ratings/:matchId
const rateMatch = async (req, res) => {
  try {
    const { ratings } = req.body; // [{ player: id, rating: 1-5, comment? }]

    if (!ratings || !Array.isArray(ratings) || ratings.length === 0) {
      return res.status(400).json({ message: "Se requieren calificaciones" });
    }

    const match = await Match.findById(req.params.matchId);
    if (!match) {
      return res.status(404).json({ message: "Partido no encontrado" });
    }

    if (match.status !== "finished") {
      return res.status(400).json({ message: "El partido aún no finalizó" });
    }

    // Validar ratings
    for (const r of ratings) {
      if (!r.player || !r.rating || r.rating < 1 || r.rating > 5) {
        return res.status(400).json({ message: "Formato de calificación inválido" });
      }
    }

    const matchRating = await MatchRating.create({
      match: req.params.matchId,
      ratedBy: req.user._id,
      ratings,
    });

    // Actualizar reviews de cada jugador calificado
    for (const r of ratings) {
      await User.findByIdAndUpdate(r.player, {
        $push: {
          reviews: {
            author: req.user._id,
            rating: r.rating,
            comment: r.comment || "",
          },
        },
      });

      // Recalcular rating promedio del jugador
      const user = await User.findById(r.player);
      if (user && user.reviews.length > 0) {
        const avg = user.reviews.reduce((sum, rev) => sum + rev.rating, 0) / user.reviews.length;
        user.rating = Math.round(avg * 10) / 10;
        await user.save();
      }
    }

    res.status(201).json(matchRating);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: "Ya calificaste este partido" });
    }
    res.status(500).json({ message: "Error del servidor" });
  }
};

// GET /api/ratings/:matchId
const getMatchRatings = async (req, res) => {
  try {
    const ratings = await MatchRating.find({ match: req.params.matchId })
      .populate("ratedBy", "name")
      .populate("ratings.player", "name");

    res.json(ratings);
  } catch (error) {
    res.status(500).json({ message: "Error del servidor" });
  }
};

// GET /api/ratings/pending
const getPendingRatings = async (req, res) => {
  try {
    // Partidos finalizados donde el usuario participó
    const finishedMatches = await Match.find({
      status: "finished",
      "players.user": req.user._id,
    });

    // Filtrar los que aún no calificó
    const pending = [];
    for (const match of finishedMatches) {
      const rated = await MatchRating.findOne({
        match: match._id,
        ratedBy: req.user._id,
      });
      if (!rated) pending.push(match);
    }

    res.json(pending);
  } catch (error) {
    res.status(500).json({ message: "Error del servidor" });
  }
};

module.exports = { rateMatch, getMatchRatings, getPendingRatings };
