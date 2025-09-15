# URL Shortener API

Um serviço de encurtamento de URLs construído com Node.js, Express e PostgreSQL, seguindo os princípios do Domain-Driven Design (DDD).

## 🏗️ Arquitetura

O projeto segue a arquitetura DDD c## 🔑 Níveis de Acesso e Permissões

### Usuário Não Autenticado
- ✅ Acessar URLs encurtadas (redirecionamento)
- ✅ Ver estatísticas públicas básicas
- ✅ Criar URLs públicas
- ✅ Listar URLs públicas
- ✅ Criar conta e fazer login
- ❌ Criar URLs privadas
- ❌ Gerenciar URLs
- ❌ Ver estatísticas detalhadas

### Usuário Autenticado
- ✅ Todas as permissões de usuário não autenticado
- ✅ Criar URLs privadas
- ✅ Editar suas próprias URLs
- ✅ Desativar/reativar suas URLs
- ✅ Ver estatísticas detalhadas de suas URLs
- ✅ Gerenciar seu perfil
- ✅ Deletar suas próprias URLs
- ❌ Gerenciar URLs de outros usuários

### 📂 Estrutura de Diretórios
```
src/
├── domain/                 # Regras de negócio e entidades
│   ├── entities/          # Entidades de domínio
│   └── repositories/      # Interfaces dos repositórios
├── application/           # Casos de uso e serviços
│   └── services/         # Serviços da aplicação
├── infrastructure/        # Implementações técnicas
│   ├── database/         # Conexão e repositórios
│   ├── config/           # Configurações
│   └── middleware/       # Middlewares
├── interfaces/           # Interfaces com usuário
│   └── http/            # Controllers HTTP
└── tests/               # Testes unitários e de integração
```

### 🔄 Fluxo de Dados
1. Request HTTP → Controller
2. Controller → Service
3. Service → Repository
4. Repository → Database
5. Database → Entity
6. Entity → Response

## 🛣️ Endpoints

### Autenticação
```http
# Criar novo usuário
POST /signup
{
    "email": "user@example.com",
    "password": "senha123"
}

# Login
POST /login
{
    "email": "user@example.com",
    "password": "senha123"
}

# Resposta do Login (sucesso)
{
    "message": "Login successful",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6...", // Bearer Token
    "user": {
        "id": 1,
        "email": "user@example.com"
    }
}
```

### 🔑 Autenticação com Bearer Token

Após o login bem-sucedido, o servidor retorna um JWT (JSON Web Token). Este token deve ser incluído no header `Authorization` de todas as requisições que requerem autenticação:

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6...
```

Exemplos de requisições que requerem o token:
- Criar URLs privadas
- Deletar URLs
- Acessar informações específicas do usuário

⚠️ **Importante**: 
- O token tem validade de 24 horas
- Deve ser incluído em todas as requisições que requerem autenticação
- Formato obrigatório: `Bearer <token>`
- Token inválido ou expirado retorna erro 403

### URLs
```http
# Encurtar URL (com ou sem autenticação)
POST /shorten
{
    "url": "https://exemplo-url-longa.com"
}

# Listar URLs (opcional: filtrar por usuário)
GET /urls
GET /urls?userId=1

# Deletar URL (soft delete)
PATCH /urls/:id
Authorization: Bearer {token}

# Acessar URL encurtada
GET /:shortCode
```

### Banco de Dados
```http
# Inicializar banco de dados
GET /setup
```

## 🔧 Tecnologias Utilizadas

- **Node.js**: Runtime JavaScript
- **Express**: Framework web
- **PostgreSQL**: Banco de dados relacional
- **Docker**: Containerização
- **Jest**: Framework de testes
- **JWT**: Autenticação
- **bcrypt**: Hash de senhas

## 🔐 Autenticação e Segurança

### Sistema de Autenticação
- JWT (JSON Web Tokens) para autenticação
- Token retornado após login bem-sucedido
- Validade do token: 24 horas
- Necessário em todas as operações administrativas
- Formato do header: `Authorization: Bearer <token>`

### Segurança
- Senhas armazenadas com hash bcrypt
- Middleware de autenticação para rotas protegidas
- Validação de token em cada requisição protegida
- Soft delete para exclusão segura de dados
- Verificação de propriedade dos recursos

### Fluxo de Autenticação
1. Usuário faz login com email/senha
2. Servidor valida credenciais e gera token JWT
3. Cliente armazena token recebido
4. Cliente inclui token no header de requisições subsequentes
5. Servidor valida token em cada requisição protegida
6. Acesso concedido/negado baseado na validade do token e permissões

## 🗄️ Modelo de Dados

### Users
```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    deleted_at TIMESTAMP NULL
);
```

### URLs
```sql
CREATE TABLE urls (
    id SERIAL PRIMARY KEY,
    original_url TEXT NOT NULL,
    short_code VARCHAR(6) UNIQUE NOT NULL,
    user_id INT REFERENCES users(id),
    clicks INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    deleted_at TIMESTAMP NULL
);
```

## 🚀 Como Executar

1. Clone o repositório
```bash
git clone https://github.com/seu-usuario/docker-compose-urlshortener.git
```

2. Inicie os containers
```bash
docker compose up --build
```

3. Inicialize o banco de dados
```bash
curl http://localhost:1500/setup
```

## 🧪 Testes

O projeto inclui testes unitários abrangentes:

```bash
# Executar todos os testes
npm test

# Executar testes com coverage
npm run test:coverage

# Executar testes em modo watch
npm run test:watch
```

## 🏛️ Padrões de Projeto

- **Domain-Driven Design (DDD)**: Organização baseada no domínio
- **Repository Pattern**: Abstração do acesso a dados
- **Dependency Injection**: Inversão de controle
- **Service Layer**: Encapsulamento da lógica de negócios

## ✨ Funcionalidades

- Criação de URLs curtas (públicas ou privadas)
- Autenticação de usuários
- Rastreamento de cliques
- Soft delete de recursos
- Listagem com filtros
- URLs públicas e privadas
- Validação de dados

## � Diferenças entre Usuário Autenticado e Não Autenticado

### Usuário Não Autenticado
- ✅ Pode criar URLs curtas (serão públicas)
- ✅ Pode acessar qualquer URL curta
- ✅ Pode listar todas as URLs do sistema
- ❌ Não pode deletar URLs
- ❌ Não pode criar URLs privadas
- ❌ Não pode filtrar URLs por usuário

### Usuário Autenticado
- ✅ Pode criar URLs curtas (públicas ou privadas)
- ✅ Pode acessar qualquer URL curta
- ✅ Pode listar todas as URLs do sistema
- ✅ Pode filtrar URLs por usuário
- ✅ Pode deletar suas próprias URLs
- ✅ Pode deletar URLs públicas
- ❌ Não pode deletar URLs privadas de outros usuários

### Detalhes de Implementação

1. **Controle de Acesso**:
   - Middleware de autenticação verifica token JWT
   - Roles definidas no token (`user` ou `admin`)
   - Verificação de propriedade em cada operação
   - Cache de permissões para performance

2. **Criação de URLs**:
   - Não autenticado → URL pública (user_id = null)
   - Autenticado → URL pública ou privada (configurável)
   - Admin → Pode criar para qualquer usuário

3. **Gerenciamento de URLs**:
   - Proprietário → Controle total sobre suas URLs
   - Admin → Controle total sobre todas URLs
   - Outros → Apenas acesso de leitura

4. **Listagem e Filtros**:
   - Filtros por status (ativo/inativo)
   - Ordenação customizável
   - Paginação de resultados
   - Cache de listagens frequentes

5. **Estatísticas e Métricas**:
   - Tracking de acessos em tempo real
   - Agregação de dados por períodos
   - Exportação de relatórios (admin)
   - Análise de tendências

6. **Segurança**:
   - Rate limiting por IP e usuário
   - Proteção contra ataques de força bruta
   - Validação de URLs maliciosas
   - Logs de auditoria detalhados

## �🔍 Observações

- URLs podem ser criadas com ou sem autenticação
- URLs criadas sem autenticação são públicas
- URLs privadas só podem ser deletadas pelo proprietário
- O sistema usa soft delete para manter histórico
- Códigos curtos são únicos e gerados aleatoriamente
