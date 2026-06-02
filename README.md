<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://coveralls.io/github/nestjs/nest?branch=master" target="_blank"><img src="https://coveralls.io/repos/github/nestjs/nest/badge.svg?branch=master#9" alt="Coverage" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Project setup

```bash
$ npm install
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ npm install -g mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).

# Library Manager API

A REST API for managing a library system with books, members, and borrowing operations built with NestJS, TypeORM, and SQLite.

## Features

- **Authentication**: JWT-based authentication with role-based authorization
- **Books Management**: CRUD operations for books with genre filtering and availability status
- **Members Management**: Register and manage library members with borrowing history
- **Borrow/Return Operations**: Check out and return books with automatic copy tracking
- **Reports**: Overdue books list and most popular genres statistics
- **Swagger Documentation**: Interactive API documentation

## Database Schema

- **books**: id, title, author, genre, published_year, available_copies
- **members**: id, name, email, phone, join_date
- **borrow_records**: id, book_id, member_id, borrow_date, due_date, return_date
- **genres**: id, name (lookup table)
- **staff**: id, username, password_hash, role (for future authentication)

## Installation

1. Clone the repository
2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the development server:

   ```bash
   npm run start:dev
   ```

4. Seed the database with initial data:
   ```bash
   npm run seed
   ```

If your app is deployed in production and you want the initial seed data to run on startup, set:

```bash
SEED_DATABASE=true
```

Then restart the app. This is useful after switching your database to a new Neon instance.

If you are using Neon and your `.env` contains separate Postgres values rather than a full URL, the app now also supports:

```bash
POSTGRES_HOST=...
POSTGRES_PORT=5432
POSTGRES_USER=...
POSTGRES_PASSWORD=...
POSTGRES_DATABASE=...
DATABASE_SSL=true
```

If you prefer, you can still set `DATABASE_URL` directly with the full Neon connection string.

## API Documentation

Once the server is running, visit `http://localhost:3000/api` for interactive Swagger documentation.

## Authentication

The API uses JWT (JSON Web Tokens) for authentication. Most endpoints require authentication.

### Default Admin User

After seeding the database, you can login with:

- **Email**: `admin@library.com`
- **Password**: `password123`

### Authentication Endpoints

- `POST /auth/login` - Login with username and password
- `POST /auth/signup` - Register a new staff member
- `GET /auth/profile` - Get current user profile (requires authentication)

## API Endpoints

### Books

- `GET /books` - Get all books (with optional filtering)
- `GET /books/:id` - Get a specific book
- `POST /books` - Create a new book (requires admin/librarian role)
- `PATCH /books/:id` - Update a book (requires admin/librarian role)
- `DELETE /books/:id` - Delete a book (requires admin role)

### Members

- `GET /members` - Get all members
- `GET /members/:id` - Get a specific member
- `GET /members/:id/borrowing-history` - Get member's borrowing history
- `POST /members` - Register a new member (requires admin/librarian role)
- `PATCH /members/:id` - Update a member (requires admin/librarian role)
- `DELETE /members/:id` - Delete a member (requires admin role)

### Borrow Records

- `GET /borrow-records` - Get all borrow records
- `GET /borrow-records/:id` - Get a specific borrow record
- `POST /borrow-records/borrow` - Borrow a book (requires admin/librarian role)
- `POST /borrow-records/return` - Return a book (requires admin/librarian role)
- `GET /borrow-records/reports/overdue` - Get overdue books report
- `GET /borrow-records/reports/popular-genres` - Get most popular genres

### Genres

- `GET /genres` - Get all genres
- `GET /genres/:id` - Get a specific genre
- `POST /genres` - Create a new genre (requires admin role)
- `PATCH /genres/:id` - Update a genre (requires admin role)
- `DELETE /genres/:id` - Delete a genre (requires admin role)

## Example Usage

### Login

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "admin123"
  }'
```

### Create a Book (with authentication)

```bash
# First, get the token from login
TOKEN="your-jwt-token-here"

curl -X POST http://localhost:3000/books \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "title": "The Lord of the Rings",
    "author": "J.R.R. Tolkien",
    "published_year": 1954,
    "available_copies": 2,
    "genre_id": 1
  }'
```

### Borrow a Book (with authentication)

```bash
# First, get the token from login
TOKEN="your-jwt-token-here"

curl -X POST http://localhost:3000/borrow-records/borrow \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "book_id": 1,
    "member_id": 1,
    "due_date": "2024-02-15"
  }'
```

### Get Overdue Books (with authentication)

```bash
# First, get the token from login
TOKEN="your-jwt-token-here"

curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/borrow-records/reports/overdue
```

## Development

- **Database**: SQLite with TypeORM
- **Validation**: class-validator with automatic validation pipes
- **Documentation**: Swagger/OpenAPI
- **Testing**: Jest (configured but not implemented)

## Project Structure

```
src/
├── entities/           # TypeORM entities
├── dto/               # Data Transfer Objects
├── books/             # Books module
├── members/           # Members module
├── borrow-records/    # Borrow/Return operations
├── genres/            # Genres module
├── seeder/            # Database seeding
├── app.module.ts      # Main application module
└── main.ts           # Application bootstrap
```

## Future Enhancements

- Authentication and authorization (JWT)
- Pagination for large datasets
- Advanced search and filtering
- Email notifications for overdue books
- Fine calculation system
- Reservation system
