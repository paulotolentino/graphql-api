import express from 'express';
import { graphqlHTTP } from 'express-graphql';
import { buildSchema, execute, subscribe } from 'graphql';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { createServer } from 'http';
import { useServer } from 'graphql-ws/lib/use/ws';
import { WebSocketServer } from 'ws';
import { PubSub } from 'graphql-subscriptions';
import pino from 'pino';


const logger = pino({ level: 'info' });

const pubsub = new PubSub();

const SECRET_KEY = 'mysecretkey';

const prisma = new PrismaClient();

// Definindo o schema GraphQL
const schema = buildSchema(`

  type Subscription {
    postAdded: Post!
  }

  type User {
    id: ID!
    name: String!
    email: String!
    password: String
    posts: [Post!]!
  }

  type Post {
    id: ID!
    title: String!
    content: String
    published: Boolean!
    author: User!
  }

  type Query {
    users: [User!]!
    user(id: ID!): User
    posts(skip: Int, take: Int, orderBy: String): [Post!]!
    post(id: ID!): Post
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  type Mutation {
    createUser(name: String!, email: String!): User
    createPost(authorId: ID!, title: String!, content: String, published: Boolean): Post
    signup(name: String!, email: String!, password: String!): AuthPayload!
    login(email: String!, password: String!): AuthPayload!
  }
`);

// Definindo os resolvers
const root = {

  // Auth
  signup: async ({ name, email, password }) => {
    // Verificar se o email já existe
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      throw new Error('Email já está em uso');
    }

    // Criptografar a senha
    const hashedPassword = await bcrypt.hash(password, 10);

    // Criar o usuário
    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword },
    });

    // Gerar um token JWT
    const token = jwt.sign({ userId: user.id }, SECRET_KEY);

    return { token, user };
  },
  login: async ({ email, password }) => {
    // Verificar se o usuário existe
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new Error('Usuário não encontrado');
    }

    // Verificar a senha
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      throw new Error('Senha incorreta');
    }

    // Gerar um token JWT
    const token = jwt.sign({ userId: user.id }, SECRET_KEY);

    return { token, user };
  },

  // Users
  users: async (_args, req) => {
    const userId = authenticate(req);
    console.log(`User ID: ${userId} buscando todos os usuários`);
    return prisma.user.findMany();
  },
  user: async ({ id }, req) => {
    const userId = authenticate(req);
    console.log(`User ID: ${userId} buscando usuário com ID: ${id}`);
    return prisma.user.findUnique({ where: { id: parseInt(id) } });
  },
  createUser: async ({ name, email }, req) => {

    const userId = authenticate(req);
    console.log(`User ID: ${userId} criando novo usuário`);

    // Verificar se o email já existe
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      throw new Error('Email já está em uso');
    }

    // Criar novo usuário
    return prisma.user.create({
      data: { name, email },
    });
  },
  deleteUser: async ({ id }, req) => {
    const userId = authenticate(req);
    console.log(`User ID: ${userId} deletando usuário com ID: ${id}`);

    await prisma.user.delete({ where: { id: parseInt(id) } });
    return true;
  },

  // Posts
  posts: async ({ skip = 0, take = 10, orderBy = 'id' }, req) => {
    const userId = authenticate(req);
    console.log(`User ID: ${userId} buscando todos os posts`);

    return prisma.post.findMany({
      skip,
      take,
      orderBy: { [orderBy]: 'asc' },
      include: { author: true },
    });
  },
  createPost: async ({ authorId, title, content, published }, req) => {
    const userId = authenticate(req);
    console.log(`User ID: ${userId} criando novo post`);

    const newPost = prisma.post.create({
      data: {
        title,
        content,
        published: published || false,
        author: { connect: { id: parseInt(authorId) } },
      },
    });
    pubsub.publish('POST_ADDED', { postAdded: newPost });
    return newPost;
  },
  postAdded: {
    subscribe: () => pubsub.asyncIterator(['POST_ADDED']),
  },
};

// Middleware para autenticação
const authenticate = (req) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    throw new Error('Acesso negado');
  }

  const token = authHeader.replace('Bearer ', '');
  const { userId } = jwt.verify(token, SECRET_KEY);

  return userId;
};

// Configurando o servidor Express
const app = express();

app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url}`);
  next();
});

app.use(
  '/graphql',
  graphqlHTTP({
    schema,
    rootValue: root,
    graphiql: true, // Interface para testar queries
  })
);

// Adicione WebSocket ao Express
const server = createServer(app);

// Configuração do WebSocket Server
const wsServer = new WebSocketServer({
  server,
  path: '/graphql',
});

useServer({
  schema, execute, subscribe, onConnect: () => console.log('Cliente conectado'),
  onDisconnect: () => console.log('Cliente desconectado'),
}, wsServer);

app.listen(4000, () =>
  console.log('Servidor GraphQL rodando em http://localhost:4000/graphql')
);

export default app;