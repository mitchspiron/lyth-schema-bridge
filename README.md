# lyth-schema-bridge

Schema Bridge generates Prisma, Zod, OpenAPI, and REST/GraphQL CRUD code from a single model definition, giving you consistent, clean-architecture backends with minimal effort.

> A schema and code generator for building full-stack APIs with Clean Architecture

## Features

- **Single Source of Truth**: Define your models once
- **Automatic Generation**:
  - Prisma Schema
  - Zod Validation Schemas
  - OpenAPI 3.0 Documentation
  - Complete CRUD (getAll, getOne, create, update, delete)
- **Clean Architecture**: Structured and maintainable code
- **Complete Authentication**: Register, Login, Email Verification, Password Reset
- **Multi-API**: REST (Express) and/or GraphQL (Apollo Server)
- **Multi-Database**: PostgreSQL, MySQL, SQLite

## Installation

### Global Installation (Recommended)

```bash
npm install -g @lyth/schema-bridge
```

### Using npx

```bash
npx @lyth/schema-bridge init
```

### Local Installation

```bash
npm install --save-dev @lyth/schema-bridge
```

## Quick Start

### Interactive Mode

```bash
schema-bridge init
```

The CLI guides you through all configuration steps.

### Configuration Mode

Create a `schema.config.js` file:

```javascript
module.exports = {
  projectName: 'my-awesome-api',
  apiType: 'rest', // 'rest' | 'graphql' | 'both'
  database: 'postgresql', // 'postgresql' | 'mysql' | 'sqlite'
  authentication: true,
  models: [
    {
      name: 'Post',
      timestamps: true,
      fields: [
        { name: 'title', type: 'string', required: true },
        { name: 'content', type: 'string', required: true },
        { name: 'published', type: 'boolean', required: true, default: 'false' },
      ],
    },
  ],
};
```

Then generate:

```bash
schema-bridge generate --config schema.config.js
```

## Generated Structure

```
my-api/
├── prisma/
│   └── schema.prisma              # Prisma Schema
├── src/
│   ├── domain/                    # Domain Layer
│   │   ├── entities/
│   │   └── repositories/          # Interfaces
│   ├── application/               # Application Layer
│   │   ├── use-cases/
│   │   ├── dto/                   # Zod Validation
│   │   └── services/
│   ├── infrastructure/            # Infrastructure Layer
│   │   ├── database/
│   │   │   └── repositories/      # Prisma Implementations
│   │   └── http/
│   │       ├── express/
│   │       └── graphql/
│   ├── presentation/              # Presentation Layer
│   │   ├── rest/
│   │   │   ├── controllers/
│   │   │   ├── routes/
│   │   │   └── middlewares/
│   │   └── graphql/
│   │       └── resolvers/
│   ├── docs/
│   │   └── openapi.json           # OpenAPI Documentation
│   └── main.ts
├── .env.example
├── package.json
└── tsconfig.json
```

## Starting a Generated Project

```bash
# 1. Navigate to project
cd my-awesome-api

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.example .env
# Edit .env with your credentials

# 4. Setup database
npx prisma generate
npx prisma db push

# 5. Start server
npm run dev
```

Server starts on http://localhost:3000

## CLI Commands

### `schema-bridge init`

Interactive mode to create a new project.

```bash
schema-bridge init
# or with custom output
schema-bridge init --output ./projects
```

### `schema-bridge generate`

Generate a project from a configuration file.

```bash
schema-bridge generate --config schema.config.js
schema-bridge generate --config schema.config.js --output ./my-project
```

### `schema-bridge validate`

Validate a configuration file.

```bash
schema-bridge validate --config schema.config.js
```

### `schema-bridge example`

Generate an example configuration file.

```bash
schema-bridge example
schema-bridge example --output my-config.js
```

## Field Types

| Type    | Prisma   | Zod                | OpenAPI | Example         |
| ------- | -------- | ------------------ | ------- | --------------- |
| string  | String   | z.string()         | string  | "Hello"         |
| email   | String   | z.string().email() | string  | "user@mail.com" |
| number  | Int      | z.number().int()   | integer | 42              |
| float   | Float    | z.number()         | number  | 3.14            |
| boolean | Boolean  | z.boolean()        | boolean | true            |
| date    | DateTime | z.date()           | string  | "2024-01-01"    |
| json    | Json     | z.any()            | object  | {...}           |

## Authentication

When authentication is enabled:

### Generated Endpoints

```
POST   /api/auth/register          # Registration
POST   /api/auth/login             # Login
GET    /api/auth/verify-email      # Email Verification
POST   /api/auth/forgot-password   # Request Password Reset
POST   /api/auth/reset-password    # Reset Password
GET    /api/auth/profile           # Profile (protected)
```

### Usage Example

```bash
# 1. Register
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"pass123","name":"John"}'

# 2. Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"pass123"}'

# 3. Use token
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3000/api/auth/profile
```

## Examples

### Simple Blog

```javascript
{
  projectName: 'blog-api',
  apiType: 'rest',
  database: 'sqlite',
  authentication: true,
  models: [
    {
      name: 'Post',
      timestamps: true,
      fields: [
        { name: 'title', type: 'string', required: true },
        { name: 'content', type: 'string', required: true },
        { name: 'authorId', type: 'string', required: true }
      ]
    },
    {
      name: 'Comment',
      timestamps: true,
      fields: [
        { name: 'content', type: 'string', required: true },
        { name: 'postId', type: 'string', required: true }
      ]
    }
  ]
}
```

### E-Commerce

```javascript
{
  projectName: 'ecommerce-api',
  apiType: 'both',
  database: 'postgresql',
  authentication: true,
  models: [
    {
      name: 'Product',
      timestamps: true,
      fields: [
        { name: 'name', type: 'string', required: true },
        { name: 'price', type: 'float', required: true },
        { name: 'stock', type: 'number', required: true }
      ]
    },
    {
      name: 'Order',
      timestamps: true,
      fields: [
        { name: 'userId', type: 'string', required: true },
        { name: 'total', type: 'float', required: true },
        { name: 'status', type: 'string', required: true }
      ]
    }
  ]
}
```

## Clean Architecture

Schema Bridge generates code following Clean Architecture principles:

### Benefits

- **Testability**: Isolated business logic
- **Maintainability**: Well-structured code
- **Flexibility**: Easy to change framework/DB
- **Scalability**: Architecture that scales well

### Layers

1. **Domain**: Entities and repository interfaces
2. **Application**: Use cases and DTOs
3. **Infrastructure**: Technical implementations
4. **Presentation**: Controllers and routes

## Development

```bash
# Clone repository
git clone https://github.com/mitchspiron/lyth-schema-bridge
cd schema-bridge

# Install dependencies
npm install

# Development
npm run dev

# Build
npm run build

# Tests
npm test
npm run test:watch
npm run test:coverage

# Lint
npm run lint
npm run lint:fix

# Format
npm run format
```

## Contributing

Contributions are welcome! See [CONTRIBUTING.md](CONTRIBUTING.md)

## License

MIT ©

## Links

- [Documentation](https://github.com/mitchspiron/lyth-schema-bridge)
- [NPM Package](https://www.npmjs.com/package/@lyth/schema-bridge)
- [Issues](https://github.com/mitchspiron/lyth-schema-bridge/issues)

---

**Made with care by Schema Bridge**
