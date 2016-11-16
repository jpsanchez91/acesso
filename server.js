// =======================
// Imports necessarios
// =======================
var express     = require('express');
var app         = express();
var bodyParser  = require('body-parser');
var morgan      = require('morgan');
var mongoose    = require('mongoose');

var jwt    = require('jsonwebtoken');
var config = require('./config');
var Usuario   = require('./models/user');
var Funcionario   = require('./models/funcionario');
var validator = require('validator');

// =======================
// Configuração
// =======================
var port = process.env.PORT || 8080;
mongoose.connect(config.database);
app.set('superSecret', config.secret);

// Parser de requisição do express
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Morgan para o log
app.use(morgan('dev'));

// =======================
// rotas
// =======================
// Rota basica de bem vindo
app.get('/', function(req, res) {
    res.send('Bem vindo a api de cadastro de empresas e funcionarios da acesso, veja a documentação para os endpoints');
});

app.get('/inicio', function(req, res) {

  // create a sample user
  var nick = new Usuario({
    nome: 'master',
    senha: '1234',
    perfil: 'master'
  });

  // save the sample user
  nick.save(function(err) {
    if (err) throw err;

    res.json({ success: true });
  });
});

// API ROUTES -------------------

// instacia da /api
var apiRoutes = express.Router();

// rota de autenticação
apiRoutes.post('/autenticar', function(req, res) {

  // find do usuario
  Usuario.findOne({
    nome: req.body.nome
  }, function(err, user) {

    if (err) throw err;

    if (!user) {
      res.json({ success: false, message: 'Usuario ou senha incorretos' });
    } else if (user) {

      // validacao de senha
      if (user.password != req.body.password) {
        res.json({ success: false, message: 'Usuario ou senha incorretos.' });
      } else {

        // se tudo correto
        // gera o token
        var token = jwt.sign(user, app.get('superSecret'), {
          expiresIn: '24h'
        });

        // return de sucesso
        res.json({
          success: true,
          message: 'Login realizado com sucesso',
          token: token
        });
      }

    }

  });
});

// rota de update de funcionario
apiRoutes.put('/funcionario', function(req, res) {

   // verifica token
    jwt.verify(req.body.token, app.get('superSecret'), function(err, decoded) {
      if (err) {
        return res.json({ success: false, message: 'Falha de autenticação do token' });
      } else {
        // coloca o usuario decodificado no request token
        req.decoded = decoded;
      }
    });


      if(!validator.isEmail(req.body.email)){
          return res.json({ success: false, message: 'Email invalido' });
      }

          //coleta as informações para o update
          req.decoded._doc.nome = req.body.nome;
          req.decoded._doc.email = req.body.email;
          req.decoded._doc.celular = req.body.celular;
          req.decoded._doc.file = req.body.file;
          //efetiva o update
          InsertFuncionario.findOneAndUpdate({'_id' : req.decoded._doc._id}, req.decoded._doc,  {upsert:true}, function(err, doc){
            if (err) return res.send(500, { error: err });
            return res.json({ success: true, message: 'Funcionario atualizado com sucesso'});
            });


});

// validação do token
apiRoutes.use(function(req, res, next) {

  // coleta da url o token
  var token = req.body.token || req.query.token || req.headers['x-access-token'];

  // decodifica o token
  if (token) {

    // verifica token
    jwt.verify(token, app.get('superSecret'), function(err, decoded) {
      if (err) {
        return res.json({ success: false, message: 'Falha de autenticação do token' });
      } else {
        // coloca o usuario decodificado no request token
        req.decoded = decoded;
        next();
      }
    });

  } else {

    // se nao tiver token
    // retorna erro
    return res.status(403).send({
        success: false,
        message: 'Por favor forneça o token de acesso'
    });

  }
});

// rota de inserção de empresa
apiRoutes.post('/empresa', function(req, res) {
  //valida o perfil do usuario
  if(req.decoded._doc.perfil != 'master'){
       return res.json({ success: false, message: 'Usuario sem acesso para essa função' });
  }
  else{
      var nick = new Usuario({
            nome: req.body.nome,
            senha: req.body.senha,
            perfil: 'empresa'
        });

        nick.save(function(err) {
        if (err) throw err;

          res.json({ success: true, message: 'Empresa inserida com sucesso' });
        });

  }

});

// rota de inserção de funcionario
apiRoutes.post('/funcionario', function(req, res) {
  //valida o perfil do usuario
  if(req.decoded._doc.perfil != 'empresa'){
       return res.json({ success: false, message: 'Usuario sem acesso para essa função' });
  }
  else{

      if(!validator.isEmail(req.body.email)){
          return res.json({ success: false, message: 'Email invalido' });
      }

      var InsertFuncionario = new Funcionario({
            nome: req.body.nome,
            email: req.body.email,
            celular : req.body.celular,
            file : req.body.file,
            idEmpresa : req.decoded._id,
            perfil : 'funcionario'
        });

        InsertFuncionario.save(function(err) {
        if (err) throw err;

          var token = jwt.sign(InsertFuncionario, app.get('superSecret'));
          res.json({ success: true, message: 'Funcionario inserida com sucesso token para alteração na resposta', token : token });
        });

  }

});


// Devinição da api de rotas
app.use('/api', apiRoutes);


// =======================
// Start do servidor
// =======================
app.listen(port);
