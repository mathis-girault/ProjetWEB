const usersModel = require("../models/users.js");
const gamesModel = require("../models/games");
const usersgamesModel = require("../models/usersgames");
const discussions = require("../models/discussions");
const etats = require("../models/etats");
const messages = require("../models/messages");
const morts = require("../models/morts");
const propVote = require("../models/propositionVotes");
const ratifications = require("../models/ratifiacations");
const vivants = require("../models/vivants");
const daytimes = require("../models/daytimes");
// Ajouter ici les nouveaux require des nouveaux modèles

// eslint-disable-next-line no-unexpected-multiline
(async () => {
  // Regénère la base de données
  await require("../models/database.js").sync({ force: true });

  console.log("Base de données créée.");
  await usersModel.sync({ force: true });
  await gamesModel.sync({ force: true });
  await usersgamesModel.sync({ force: true });
  await etats.sync({ force: true });
  await morts.sync({ force: true });
  await daytimes.sync({force: true});
  await propVote.sync({ force: true });
  await ratifications.sync({ force: true });
  await vivants.sync({ force: true });
  await discussions.sync({ force: true });
  await messages.sync({ force: true });
  // Initialise la base avec quelques données
  await usersModel.create({
    username: "Luca",
    password: "nullos",
    admin: false
  });

  await usersModel.create({
    username: "DarkJL",
    password: "oui",
    admin: false
  });

  await usersModel.create({
    username: "1",
    password: "1",
    admin: false
  });

  await usersModel.create({
    username: "2",
    password: "2",
    admin: false
  });

  await usersModel.create({
    username: "Camille",
    password: "Camille",
    admin: false
  });

  await usersModel.create({
    username: "CamilleSup",
    password: "CamilleSup",
    admin: false
  });

  await usersModel.create({
    username: "Mathis",
    password: "Mathis",
    admin: false
  });

  await usersModel.create({
    username: "Tit",
    password: "Tit",
    admin: false
  });

  await usersModel.create({
    username: "Jules",
    password: "Jule",
    admin: true
  });

  await gamesModel.create({
    nbJoueur: 7,
    dureeJour: 6000,
    dureeNuit: 180000,
    dateDeb: "2023-01-17T04:33:12.000Z",
    probaPouv: 0.2,
    probaLoup: 0.3,
    aCommence: true
  });

  await gamesModel.create({ 
    nbJoueur: 8,
    dureeJour: 2*3600,
    dureeNuit: 3*3600 + 1*60,
    dateDeb: "2023-01-17T04:33:13.000Z",
    probaPouv: 0.5,
    probaLoup: 0.5,
    aCommence: true
  });

  await usersgamesModel.create({
    gameIdGame: 1,
    userIdUser: 1
  });

  await usersgamesModel.create({
    gameIdGame: 1,
    userIdUser: 2
  });

  await usersgamesModel.create({
    gameIdGame: 1,
    userIdUser: 5
  });

  await usersgamesModel.create({
    gameIdGame: 1,
    userIdUser: 6
  });

  await usersgamesModel.create({
    gameIdGame: 1,
    userIdUser: 7
  });

  await usersgamesModel.create({
    gameIdGame: 1,
    userIdUser: 8
  });

  await usersgamesModel.create({
    gameIdGame: 1,
    userIdUser: 9
  });

  await etats.create({
    usersgameIdUsergame: 1
  });

  await etats.create({
    usersgameIdUsergame: 2
  });

  await etats.create({
    usersgameIdUsergame: 3
  });

  await etats.create({
    usersgameIdUsergame: 4
  });

  await etats.create({
    usersgameIdUsergame: 5
  });

  await etats.create({
    usersgameIdUsergame: 6
  });

  await etats.create({
    usersgameIdUsergame: 7
  });

  await morts.create({
    etatId:1,
    eluSpiritisme: true
  });

  await vivants.create({
    etatId:2,
    typeVivant: "humain",
    pouvoir: null,
  });

  await vivants.create({
    etatId:3,
    typeVivant: "loup-garou"
  });

  await vivants.create({
    etatId:4,
    typeVivant: "loup-garou",
    pouvoir: "contamination"
  });

  await vivants.create({
    etatId:5,
    typeVivant: "humain",
    pouvoir: "spiritisme"
  });

  await vivants.create({
    etatId:6,
    typeVivant: "humain",  
    pouvoir: "insomnie"
  });

  await vivants.create({
    etatId:7,
    typeVivant: "humain",
    pouvoir: "voyance"
  });

  // Ajouter ici le code permettant d'initialiser par défaut la base de donnée
})();
