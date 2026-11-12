# API de clientes, categorias e fornecedores

## Como executar

```bash
npm install
npm start
```

A API ficará disponível em `http://localhost:3000`.

## Rotas

As rotas `/clientes`, `/categorias`, `/fornecedores` e `/produtos` possuem:

- `GET /rota` — lista registros;
- `GET /rota/:id` — busca um registro;
- `POST /rota` — cadastra;
- `PUT /rota/:id` — substitui;
- `DELETE /rota/:id` — remove.

Validações implementadas:

- cliente não aceita email repetido (`409`);
- produto só aceita `categoriaId` existente (`400`);
- fornecedor exige CNPJ com 14 caracteres (`400`);
- campos obrigatórios ausentes retornam `400`;
- registro inexistente retorna `404`.

## Exemplos para o Insomnia

### Criar cliente

`POST http://localhost:3000/clientes`

```json
{
  "nome": "Carlos Lima",
  "email": "carlos@example.com",
  "telefone": "11988887777",
  "ativo": true
}
```

### Testar email duplicado

Envie novamente o mesmo email. A resposta esperada é `409`.

### Criar produto com categoria válida

`POST http://localhost:3000/produtos`

```json
{
  "nome": "Fone de ouvido",
  "preco": 99.9,
  "categoriaId": "Eletrônicos"
}
```
