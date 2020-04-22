var mongoose = require('mongoose'),
    Schema = mongoose.Schema;
var MessageSchema = new Schema({
    de:{
        type:String,
        required:true
    },
    contenu:{
        type:String,
        required: true
    },
    salle:{
        type : Number,
        required : true
    }
})
module.exports = mongoose.model('Message', MessageSchema);
