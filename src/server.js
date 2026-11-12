const express = require('express');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

let clientes = [
  {
    id: 1,
    nome: 'Ana Souza',
    email: 'ana@example.com',
    telefone: '11999990000',
    ativo: true,
  },
];

let categorias = [
  { id: 1, nome: 'Eletrônicos', descricao: 'Produtos eletrônicos' },
  { id: 2, nome: 'Livros', descricao: 'Livros e materiais de leitura' },
];

let fornecedores = [
  {
    id: 1,
    razaoSocial: 'Fornecedor Exemplo LTDA',
    cnpj: '12345678000195',
    contato: 'contato@fornecedor.com',
  },
];

let produtos = [];

function proximoId(array) {
  return array.length ? Math.max(...array.map((item) => item.id)) + 1 : 1;
}

function validarCampos(body, campos) {
  return campos.every((campo) => body[campo] !== undefined && body[campo] !== null && body[campo] !== '');
}

function idValido(param) {
  const id = Number(param);
  return Number.isInteger(id) && id > 0 ? id : null;
}

function criarRotasCrud({ rota, obterArray, camposObrigatorios, validarCriacao, validarAtualizacao }) {
  app.get(rota, (req, res) => res.json(obterArray()));

  app.get(`${rota}/:id`, (req, res) => {
    const id = idValido(req.params.id);
    const item = id && obterArray().find((registro) => registro.id === id);
    if (!item) return res.status(404).json({ erro: 'Registro não encontrado' });
    return res.json(item);
  });

  app.post(rota, (req, res) => {
    if (!validarCampos(req.body, camposObrigatorios)) {
      return res.status(400).json({ erro: `Campos obrigatórios: ${camposObrigatorios.join(', ')}` });
    }
    const erro = validarCriacao?.(req.body);
    if (erro) return res.status(erro.status).json({ erro: erro.mensagem });

    const array = obterArray();
    const novo = { id: proximoId(array), ...req.body };
    array.push(novo);
    return res.status(201).json(novo);
  });

  app.put(`${rota}/:id`, (req, res) => {
    const id = idValido(req.params.id);
    const array = obterArray();
    const indice = id && array.findIndex((registro) => registro.id === id);
    if (indice === null || indice === false || indice < 0) {
      return res.status(404).json({ erro: 'Registro não encontrado' });
    }
    if (!validarCampos(req.body, camposObrigatorios)) {
      return res.status(400).json({ erro: `Campos obrigatórios: ${camposObrigatorios.join(', ')}` });
    }
    const erro = validarAtualizacao?.(req.body, id);
    if (erro) return res.status(erro.status).json({ erro: erro.mensagem });

    array[indice] = { id, ...req.body };
    return res.json(array[indice]);
  });

  app.delete(`${rota}/:id`, (req, res) => {
    const id = idValido(req.params.id);
    const array = obterArray();
    const indice = id && array.findIndex((registro) => registro.id === id);
    if (indice === null || indice === false || indice < 0) {
      return res.status(404).json({ erro: 'Registro não encontrado' });
    }
    const [removido] = array.splice(indice, 1);
    return res.json({ mensagem: 'Registro removido com sucesso', registro: removido });
  });
}

const emailDuplicado = (body, idAtual) => clientes.some(
  (cliente) => cliente.email.toLowerCase() === body.email.toLowerCase() && cliente.id !== idAtual,
);

criarRotasCrud({
  rota: '/clientes',
  obterArray: () => clientes,
  camposObrigatorios: ['nome', 'email', 'telefone', 'ativo'],
  validarCriacao: (body) => emailDuplicado(body) && { status: 409, mensagem: 'Já existe um cliente com este email' },
  validarAtualizacao: (body, id) => emailDuplicado(body, id) && { status: 409, mensagem: 'Já existe um cliente com este email' },
});

criarRotasCrud({
  rota: '/categorias',
  obterArray: () => categorias,
  camposObrigatorios: ['nome', 'descricao'],
});

criarRotasCrud({
  rota: '/fornecedores',
  obterArray: () => fornecedores,
  camposObrigatorios: ['razaoSocial', 'cnpj', 'contato'],
  validarCriacao: (body) => body.cnpj.length !== 14
    ? { status: 400, mensagem: 'O CNPJ deve ter exatamente 14 caracteres' }
    : null,
  validarAtualizacao: (body) => body.cnpj.length !== 14
    ? { status: 400, mensagem: 'O CNPJ deve ter exatamente 14 caracteres' }
    : null,
});

criarRotasCrud({
  rota: '/produtos',
  obterArray: () => produtos,
  camposObrigatorios: ['nome', 'preco', 'categoriaId'],
  validarCriacao: (body) => !categorias.some((categoria) => categoria.id === Number(body.categoriaId))
    ? { status: 400, mensagem: 'A categoria informada não existe' }
    : null,
  validarAtualizacao: (body) => !categorias.some((categoria) => categoria.id === Number(body.categoriaId))
    ? { status: 400, mensagem: 'A categoria informada não existe' }
    : null,
});

app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({ erro: 'JSON inválido' });
  }
  return next(err);
});

app.listen(PORT, () => {
  console.log(`API executando em http://localhost:${PORT}`);
});

module.exports = app;
