function nbPersParSalle(req,res){
    const redis = require('redis');
    const client = redis.createClient();

    client.lrange('Salle' + req.params.room,0,-1, function(err,reply) {
        if (err) return console.log(err);
        res.status(200).send(reply);
    });
}

function nbPersParConv(req,res){
    const redis = require('redis');
    const client = redis.createClient();

    client.lrange('Salle' + req.params.room,0,-1, function(err,reply) {
        if (err) return console.log(err);
        res.status(200).send([reply.length]);
    });
}

function postMessage(req,res){
    const Message = require('../models');

    var message1 = new Message({
        de : req.username,
        contenu : req.text,
        salle : req.room
    });
    message1.save()

}

function NbMessageTotal(req,res){
    const Message = require('../models');
    Message.countDocuments({},function (err,response) {
        if (err) throw err;

        res.json("Nombre d'enregistrement dans la table : " + response)
    })
}

function NbMessageParConv(req,res){
    const Message = require('../models');
    Message.countDocuments({room:req.params.roomID},function (err,response) {
        if (err) throw err;

        res.json("Nombre d'enregistrement dans la conversation "+req.params.roomID+" : " + response)
    })
}

module.exports.nbPersParSalle=nbPersParSalle;
module.exports.nbPersParConv=nbPersParConv;
module.exports.NbMessageParConv=NbMessageParConv;
module.exports.NbMessageTotal=NbMessageTotal;
module.exports.postMessage = postMessage;
