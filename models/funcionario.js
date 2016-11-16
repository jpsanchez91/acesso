// importantado o mongo e o schema
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// Criando a instancia de funcionario
module.exports = mongoose.model('Funcionario', new Schema({
    nome: String,
    email: String,
    celular : String,
    file : String
}));
