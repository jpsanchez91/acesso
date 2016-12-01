End Point:

get /iniciar:
Insere o usuario master para iniciar o projeto.

post /autenticar:
  body : 
    nome : String
    Senha : String
Autenticar o usuario gerando o token de acesso.

post /empresa:
  body : 
    nome : String
    Senha : String
Insere a empresa , apenas perfil master,  assim podendo realizar o login (Necessario autenticaçao, header x-access-token)

post /funcionario:
  body : 
    nome: String,
    email: String,
    celular : String,
    file : base/64
Insere funcionario , apenas perfil de empresa, retorna token para futuros update (Necessario autenticaçao, header x-access-token)


put /funcionario:
    nome: String,
    email: String,
    celular : String,
    file : base/6,
    token : string
atualiza funcionario, nao e necessario autenticação, apenas o token retornado na inserção
