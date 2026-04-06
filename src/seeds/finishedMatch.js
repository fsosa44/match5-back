/**
 * Seed: crea jugadores de prueba y un partido terminado sin calificar.
 * Ejecutar: node src/seeds/finishedMatch.js
 */
require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Match = require("../models/Match");

const FRANCISCO_ID = "69d2d6a7a3057a874a88fe69";

const testPlayers = [
  { name: "Juan Pérez", email: "juan@test.com", position: "Delantero", playStyle: "competitive", birthDate: "2002-03-15" },
  { name: "Carlos López", email: "carlos@test.com", position: "Mediocampista", playStyle: "flexible", birthDate: "2000-07-22" },
  { name: "Diego Martínez", email: "diego@test.com", position: "Defensor", playStyle: "competitive", birthDate: "2001-11-05" },
  { name: "Andrés García", email: "andres@test.com", position: "Delantero", playStyle: "recreational", birthDate: "1999-06-18" },
  { name: "Lucas Rodríguez", email: "lucas@test.com", position: "Arquero", playStyle: "flexible", birthDate: "2003-01-30" },
  { name: "Miguel Santos", email: "miguel@test.com", position: "Mediocampista", playStyle: "recreational", birthDate: "1998-12-03" },
  { name: "Tomás Aranda", email: "tomas@test.com", position: "Defensor", playStyle: "competitive", birthDate: "2000-04-10" },
  { name: "Pablo Fernández", email: "pablo@test.com", position: "Delantero", playStyle: "flexible", birthDate: "2001-08-25" },
  { name: "Matías Silva", email: "matias@test.com", position: "Mediocampista", playStyle: "competitive", birthDate: "1997-09-14" },
];

const run = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Conectado a MongoDB");

  // Crear jugadores de prueba (o buscarlos si ya existen)
  const playerIds = [];
  const hashedPassword = await bcrypt.hash("123456", 10);

  for (const p of testPlayers) {
    let user = await User.findOne({ email: p.email });
    if (!user) {
      user = await User.create({ ...p, password: hashedPassword });
      console.log(`  Creado: ${user.name} (${user._id})`);
    } else {
      console.log(`  Ya existe: ${user.name} (${user._id})`);
    }
    playerIds.push(user._id.toString());
  }

  // Crear partido terminado (5v5 = 10 jugadores)
  // Equipo A: Francisco + 4 jugadores
  // Equipo B: 5 jugadores
  const players = [
    { user: FRANCISCO_ID, team: "A", slotIndex: 0 },
    { user: playerIds[0], team: "A", slotIndex: 1 },
    { user: playerIds[1], team: "A", slotIndex: 2 },
    { user: playerIds[2], team: "A", slotIndex: 3 },
    { user: playerIds[3], team: "A", slotIndex: 4 },
    { user: playerIds[4], team: "B", slotIndex: 5 },
    { user: playerIds[5], team: "B", slotIndex: 6 },
    { user: playerIds[6], team: "B", slotIndex: 7 },
    { user: playerIds[7], team: "B", slotIndex: 8 },
    { user: playerIds[8], team: "B", slotIndex: 9 },
  ];

  const match = await Match.create({
    createdBy: FRANCISCO_ID,
    name: "Fulbito del sábado",
    location: "La Fábrica de Fútbol",
    lat: -34.676219,
    lng: -58.3244228,
    date: new Date("2026-04-05"),
    time: "18:00 hs",
    maxPlayers: 10,
    players,
    ageRange: { min: 18, max: 30, label: "Jóvenes" },
    intensity: "competitive",
    status: "finished",
    result: { teamA: 3, teamB: 2 },
  });

  console.log(`\nPartido terminado creado: ${match._id}`);
  console.log(`  ${match.name} — ${match.location}`);
  console.log(`  Resultado: ${match.result.teamA} - ${match.result.teamB}`);
  console.log(`  Status: ${match.status}`);

  await mongoose.disconnect();
  console.log("\nSeed completado!");
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
