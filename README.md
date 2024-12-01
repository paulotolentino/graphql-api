# **GraphQL API com Express, Prisma e Subscriptions**

Este é um projeto de exemplo que implementa uma API GraphQL usando **Express**, **Prisma** e **GraphQL Subscriptions**. Ele permite criar, consultar e receber notificações em tempo real (via Subscriptions) para novos posts. A API utiliza SQLite como banco de dados.

## **Features**

- API GraphQL configurada com Express.
- Integração com o banco de dados SQLite via Prisma ORM.
- CRUD para **Usuários** e **Posts**.
- Suporte a **Subscriptions** (WebSocket) para eventos em tempo real (em progresso).
- Pronto para adicionar **testes automatizados** com Jest (em progresso).

---

## **Requisitos**

- Node.js 16 ou superior.
- npm ou yarn.
- SQLite (configurado automaticamente pelo Prisma).

---

## **Instalação**

1. Clone o repositório:

   ```bash
   git clone https://github.com/seu-usuario/graphql-express-prisma.git
   cd graphql-express-prisma
   ```

2. Instale as dependências:

   ```bash
   npm install
   ```

3. Configure o banco de dados:

   - Execute o comando para inicializar o Prisma e criar as tabelas no SQLite:
     ```bash
     npx prisma migrate dev --name init
     ```
   - Gere o cliente Prisma:
     ```bash
     npx prisma generate
     ```

4. Inicie o servidor:

   ```bash
   npm start
   ```

5. Acesse o GraphQL Playground no navegador:
   ```
   http://localhost:4000/graphql
   ```

---

## **Como Usar**

### **Consultas (Query)**

- Buscar todos os posts:
  ```graphql
  query {
    posts {
      id
      title
      content
    }
  }
  ```

### **Mutations**

- Criar um novo post:
  ```graphql
  mutation {
    createPost(title: "Exemplo de Post", content: "Conteúdo do post") {
      id
      title
      content
    }
  }
  ```

### **Subscriptions**

- Acompanhar novos posts em tempo real (WebSocket **não configurado ainda**):
  ```graphql
  subscription {
    postAdded {
      id
      title
      content
    }
  }
  ```

---

## **Estrutura do Projeto**

```plaintext
graphql-express-prisma/
├── prisma/               # Configuração do Prisma e arquivo schema.prisma
│   ├── schema.prisma     # Modelos de dados
├── node_modules/         # Dependências do Node.js
├── src/
│   ├── schema.js         # Schema GraphQL
│   ├── resolvers.js      # Resolvers para Queries, Mutations e Subscriptions
│   └── server.js         # Configuração do servidor Express e WebSocket
├── .env                  # Variáveis de ambiente
├── package.json          # Configurações do projeto
└── README.md             # Este arquivo
```

---

## **Próximos Passos**

1. **Configurar WebSocket**:

   - Implementar `useServer` para suporte total a Subscriptions.
   - Testar Subscriptions usando Altair ou ferramentas similares.

2. **Adicionar Testes**:

   - Configurar Jest para testar resolvers e integrações.

3. **Deploy**:
   - Deploy em serviços como AWS, Vercel ou Heroku para tornar o projeto acessível online.

---

## **Tecnologias Utilizadas**

- **Node.js**: Plataforma para execução do servidor.
- **Express**: Framework web para configurar a API.
- **GraphQL**: Linguagem de consulta para a API.
- **Prisma ORM**: Integração com o banco de dados.
- **SQLite**: Banco de dados local.
- **GraphQL Subscriptions**: Para eventos em tempo real (em progresso).

---

## **Contribuindo**

Contribuições são bem-vindas! Sinta-se à vontade para abrir issues ou enviar pull requests.

---

## **Licença**

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.
