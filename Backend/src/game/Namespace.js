const io = require('../ws/websockets.js')
const Team = require('./Team.js')
const Room = require('./Room.js')
const GameState = require('./GameState.js')
const userModel = require("../models/users");
const usersgames = require('../models/usersgames.js');
const propVote = require("../models/propositionVotes")
function initNamespace(gameID) {
  const GameManager = require('./GameManager.js')
  const namespace = io.of('/' + gameID);

  // Middleware use for each new connection to the namespace
  namespace.use(async (socket, next) => {
    const token = socket.handshake.auth.token
    const userName = await GameManager.validUser(token, gameID)
    console.log(token);
    // Check if the user is member of the game. If not, close the socket.
    if (userName === null) {
      socket.disconnect();
    }
    // Give the user game_data when loading
    
    const role = await GameManager.getUserRole(userName, gameID);
    const team = await GameManager.getUserTeam(userName, gameID);
    
    
    GameManager.addRoleDirectory(socket.id, role);
    GameManager.addTeamDirectory(socket.id, team);

    //Send all the game data for the player
    const gameData = await GameManager.getGameData(gameID, userName);
    socket.emit("game_data", gameData);
    //TODO DELETE_ALL_TEST_MSG
    socket.emit("info_TEST", userName, role, team)
    next();
  })
  
  // Function call on connection
  namespace.on('connection', (socket) => {
    GameManager.setPlayerRoom(gameID, socket.id);

    console.log('utilisateur se connecte dans ' + gameID + " avec la socket : " + socket.id);
    socket.on('disconnect', () => {
      // When the user disconnect
      socket.disconnect();
      console.log("user disconnected");
    });



    socket.on("propVote", async (usernameVotant, usernameVote) => {
      console.log("Le joueur "+ usernameVotant + " vote " + usernameVote);
      console.log(gameID);
      const usergameVotant = await userModel.findOne({where: {username: usernameVotant}, include: {model:usersgames, where: {gameIdGame: gameID}}});
      console.log(usergameVotant)
      await propVote.create({usernameVote: usernameVote, usergameId: usergameVotant.idUsergame})
      console.log("ok");
    });



    socket.on("TEST", (mes) => {
      console.log(mes);
    });
    socket.on('message', (mes) => {
      //Fonction utiliser quand l'utilisateur envoie un message dans le chat
      //Il faut vérifier si l'utilisateur à bien le droit de faire cette opération
      //Ajouter le message à la discution si c'est pertinant
      //Il est probable qu'on ait besoin de rajouter d'autres paramètre (en plus de socket)
      const state = GameManager.states.get(gameID)
      const role = GameManager.socketToRoom.get(socket.id);
      const team = GameManager.socketToTeam.get(socket.id);
      //During the day everyone can send and receive message
      if(state === GameState.DAY) {
        if(team !== Team.DEATH) {
          namespace.emit("receive_msg", mes);
        }
      } else if(state === GameState.NIGHT) {
        
        if(role === Room.SPIRITISM || role === Room.ELECTED) {
          // Check if the human can talk to deads
          namespace.to(Room.ELECTED).to(Room.SPIRITISM).emit("receive_msg", mes);
          
        } else if(team === Team.WEREWOLF) {
          namespace.to(Team.WEREWOLF).to(Room.INSOMNIA).to(Room.CONTAMINATION).emit("receive_msg", mes);
        } else {
          // Truc illégal !
          socket.emit("receive_msg", "[Server] You cannot send message !");
        }
  
      }
    })
    
    socket.on('vote', async (username) => {
      // When the player send a vote
      const state = GameManager.states.get(gameID)
      const team = GameManager.socketToTeam.get(socket.id);
      const fromUsername = GameManager.socketDir.get(socket.id);

      // Savoir si c'est une nouvelle proposition ?
      if(state == GameState.DAY) {
        //  Verifier que le joueur ne vote qu'une seul fois
        namespace.emit("vote", fromUsername, username);
      }
      else if(state == GameState.NIGHT) {
        if(team == Team.WEREWOLF) {
          // Vérifier que le joueur vote pour un humain
          namespace.to(Team.WEREWOLF).to(Room.CONTAMINATION).emit("vote", fromUsername, username);
        }
      }
    })
  
    // socket.on('proposal', (username) => {
    //   // When the player send proposal

    //   // Trouver si c'est bien une proposition valide (pas déjà effectuer)
    //   // Notifie les joueurs de ça
    //   const state = GameManager.states.get(gameID)
    //   const team = GameManager.socketToTeam.get(socket.id);
    //   const fromUsername = GameManager.socketDir.get(socket.id);

    //   if(state == GameState.DAY) {
    //     //  Verifier que le joueur ne vote qu'une seul fois
    //     namespace.emit("vote", fromUsername, username);
    //   }
    //   else if(state == GameState.NIGHT) {
    //     if(team == Team.WEREWOLF) {
    //       // Vérifier que le joueur vote pour un humain
    //       namespace.to(Team.WEREWOLF).to(Room.CONTAMINATION).emit("vote", fromUsername, username);
    //     }
    //   }
    // })
  
    socket.on('contamination', (username) => {
      // When the player contaminate someone 
      if(GameManager.validRole(socket.id, Room.CONTAMINATION)) {
        //Vérifier si le  a été utilisé deux fois ?
        // Placer le joueur cible dans la team des loups garou
        // S'il est connecter, changer
        userSocketID = GameManager.userToSocket.get(username);
        if(userSocketID) {
          // Changement de team ici
          GameManager.addTeamDirectory(userSocketID, Team.WEREWOLF);
          const userSocket = io.of('/' + gameID).sockets.get(userSocketID);
          userSocket.join(Team.WEREWOLF);
          //Notifie le joueur de la contamination
          userSocket.emit("contamination");
          //Rejoint les loups
          // Mettre de la couleur ?
        }
        namespace.to(Team.WEREWOLF).to(Room.CONTAMINATION).emit("message", username + " is now a werewolf"); 

      }
    })
  
    socket.on('spiritism', (username) => {
      // Check if the player have spiritism's role
      if(GameManager.validRole(socket.id, Room.SPIRITISM)) {
        
        // Vérifier si le username est bien mort
        
        

      }
    })
  
    socket.on('psychic', (username) => {
      if(GameManager.validRole(socket.id, Room.PSYCHIC)) {
        // get the player role
        const playerRole = "";
        socket.emit("message", "Le role de " + username + " est " + playerRole)
      }
    })
  })

}

module.exports = initNamespace;