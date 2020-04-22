//Definition des variables du serveur
var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var i;
const APIRoutes = require('./routes');

const controller = require('./controllers');

// Creation de la connexion Redis pour la gestion des utilisateurs
const redis = require('redis');
const  client = redis.createClient();

//Creation de la connexion à la base de données MongoDB ( Dans MongoDb la base de donnée sera appelé Chat
const mongoose = require('mongoose');
database = 'mongodb://localhost:27017/chat';
mongoose.connect(database,(err)=>{
    if(err)
        throw err;
    console.log('Connection à MongoDB : success')
});

/**
 * Lancement du serveur en écoutant les connexions arrivant sur le port 3000
 */
http.listen(3000, function () {
    console.log('Le serveur est en écoute sur le port *:3000');
});


/**
 * Gestion des requêtes HTTP des utilisateurs en leur renvoyant les fichiers du dossier 'public'
 */
app.use('/', express.static(__dirname + '/public'));
app.use(APIRoutes);
/**
 * Liste des utilisateurs connectés
 */
var users = [];

/**
 * Historique des messages
 */
var messages = [];


/**
 * List des salles de  conversation
 */
let rooms = [{
    'id':1,
    'nom':'unnom',
    'numUser':0,
    'users':[]
},
    {
        'id':2,
        'nom':'unnom',
        'numUser':0,
        'users':[]
    },
    {
    'id':3,
    'nom':'unnom',
    'numUser':0,
    'users':[]
}];

// On éfface toutes les données de la base de donnée de redis avant de commencer
client.FLUSHALL();


/**
 * Liste des utilisateurs en train de saisir un message
 */
var typingUsers = [];

io.on('connection', function (socket) {

    /**
     * Utilisateur connecté à la socket
     */
    var loggedUser;

    /**
     * Déconnexion d'un utilisateur
     */
    socket.on('disconnect', function () {
        if (loggedUser !== undefined) {
            // Broadcast d'un 'service-message'
            var serviceMessage = {
                text: 'Utilisateur "' + loggedUser.username + '" déconnecté',
                type: 'logout'
            };
            socket.broadcast.to(loggedUser.room).emit('service-message', serviceMessage);
            // Suppression de la liste des connectés
            client.lrem(['Salle' + loggedUser.room,0,loggedUser.username], function(err, reply) {
            });
            client.lrange('Salle' + loggedUser.room,0,-1, function(err,reply) {
                rooms.find(x => x.id === loggedUser.room).users=reply;
            });
            // Ajout du message à l'historique
            messages.push(serviceMessage);
            // Emission d'un 'user-logout' contenant le user
            io.emit('user-logout', loggedUser);
            // Si jamais il était en train de saisir un texte, on l'enlève de la liste
            var typingUserIndex = typingUsers.indexOf(loggedUser);
            if (typingUserIndex !== -1) {
                typingUsers.splice(typingUserIndex, 1);
            }
        }
    });

    /**
     * Connexion d'un utilisateur via le formulaire :
     */
    socket.on('user-login', function (user, callback) {
        // Vérification que l'utilisateur n'existe pas
        var userIndex = -1;
        for(nbRoom=0;nbRoom<rooms.length;nbRoom++){
            var usersRoom = rooms.find(x => x.id === (nbRoom+1)).users;
            for (i = 0; i < usersRoom.length; i++) {
                if (usersRoom[i] === user.username) {
                    userIndex = i;
                }
            }
        }
        if (user !== undefined && userIndex === -1) { // S'il est bien nouveau

            // Sauvegarde de l'utilisateur et ajout du User dans Redis

            loggedUser = user;
            users.push(loggedUser);
            client.rpush(['Salle' + loggedUser.room, loggedUser.username], function(err, reply) {
                if (err) throw err;
                console.log(reply); // Pour verifier que Redis à bien entrer l'utilisateur dans la base de donnée.
            });
            client.lrange('Salle' + loggedUser.room,0,-1, function(err,reply) {
                rooms.find(x => x.id === user.room).users=reply;
            });
            rooms.find(x => x.id=== user.room).numUsers++;
            // Envoi et sauvegarde des messages de service
            socket.join(user.room)
            for (i = 0; i < messages.length; i++) {
                if (messages[i].room == user.room){
                    if (messages[i].username !== undefined ) {
                        socket.emit('chat-message', messages[i]);
                    } else {
                        socket.emit('service-message', messages[i]);
                    }
                }

            }


            var userServiceMessage = {
                text: 'Vous etes connecté en tant que  "' + loggedUser.username + '" dans la salle :' +loggedUser.room,
                type: 'login'
            };
            var broadcastedServiceMessage = {
                text: 'Utilisateur "' + loggedUser.username + '" connecté dans cette salle ',
                type: 'login'
            };
            //emit logged as untel
            socket.emit('service-message', userServiceMessage);
            //emit to member of the room that a men will coming
            socket.broadcast.to(user.room).emit('service-message', broadcastedServiceMessage);
            messages.push(broadcastedServiceMessage);
            // Emission de 'user-login' et appel du callback
            io.sockets.in(user.room).emit('user-login', [loggedUser,rooms.find(x => x.id === user.room).users]);
            callback(true);
        } else {
            callback(false);
        }
    });

    /**
     * Réception de l'événement 'chat-message' et réémission vers tous les utilisateurs
     * Insertion des messages dans mongoDB
     */
    socket.on('chat-message', function (message) {
        // On ajoute les details du message à savoir lé emetteur
        message.username = loggedUser.username;
        message.room = loggedUser.room;
        io.sockets.in(message.room).emit('chat-message', message);
        // Enregistrement du message
        messages.push(message);

        //Envoi du message dans la base de données grace au controller
        controller.postMessage(message);
        console.log(message);
        if (messages.length > 150) {
            messages.splice(0, 1);
        }
    });

    /**
     * Réception de l'événement 'start-typing'
     * L'utilisateur commence à saisir son message
     */
    socket.on('start-typing', function () {
        // Ajout du user à la liste des utilisateurs en cours de saisie
        if (typingUsers.indexOf(loggedUser) === -1) {
            typingUsers.push(loggedUser);
        }
        io.emit('update-typing', typingUsers);
    });

    /**
     * Réception de l'événement 'stop-typing'
     * L'utilisateur a arrêter de saisir son message
     */
    socket.on('stop-typing', function () {
        var typingUserIndex = typingUsers.indexOf(loggedUser);
        if (typingUserIndex !== -1) {
            typingUsers.splice(typingUserIndex, 1);
        }
        io.emit('update-typing', typingUsers);
    });
});
