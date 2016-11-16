// importantado o mongo e o schema
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// Criando a instancia de usuario
module.exports = mongoose.model('Usuario', new Schema({
    nome: String,
    senha: String,
    perfil : String
}));


