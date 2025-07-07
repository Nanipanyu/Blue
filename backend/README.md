# TeamUp Backend API

A Node.js/Express.js backend API for the TeamUp sports platform built with TypeScript, Prisma ORM, and PostgreSQL.

## 🚀 Features

- **User Authentication** - JWT-based auth with bcrypt password hashing
- **Team Management** - Create, update, and manage sports teams
- **Challenge System** - Send and respond to match challenges
- **Match Results** - Record and track match outcomes
- **Rating System** - ELO-style rating calculations
- **Real-time Notifications** - Stay updated on challenges and matches
- **Multi-sport Support** - Football, Basketball, Cricket, Volleyball, and more
- **Regional Filtering** - Find teams in your area

## 🛠️ Tech Stack

- **Node.js** with **Express.js**
- **TypeScript** for type safety
- **PostgreSQL** database
- **Prisma ORM** for database management
- **JWT** for authentication
- **bcryptjs** for password hashing
- **express-validator** for input validation
- **helmet** for security
- **cors** for cross-origin requests

## 📦 Installation

1. **Clone the repository**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env .env.local
   ```
   
   Update `.env` with your configuration:
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/teamup"
   JWT_SECRET="your_super_secret_jwt_key_here"
   PORT=5000
   NODE_ENV=development
   FRONTEND_URL="http://localhost:3000"
   ```

4. **Set up PostgreSQL database**
   ```bash
   # Make sure PostgreSQL is running
   # Create database
   createdb teamup
   ```

5. **Run Prisma migrations**
   ```bash
   npx prisma migrate dev
   ```

6. **Seed the database (optional)**
   ```bash
   npm run seed
   ```

7. **Start the development server**
   ```bash
   npm run dev
   ```

The API will be available at `http://localhost:5000`

## 📊 Database Schema

### Users
- Authentication and profile information
- Regional association for team discovery

### Teams
- Sports team information and stats
- Rating system for competitive matching
- Team ownership and member management

### Challenges
- Match challenge system between teams
- Status tracking (pending, accepted, declined)
- Proposed dates and venues

### Matches
- Match results and scores
- Rating change calculations
- Match history tracking

### Notifications
- Real-time updates for users
- Challenge and match notifications

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile (protected)
- `PUT /api/auth/profile` - Update user profile (protected)

### Teams
- `GET /api/teams` - Get all teams (with filtering)
- `GET /api/teams/:id` - Get team by ID
- `POST /api/teams` - Create new team (protected)
- `GET /api/teams/my/teams` - Get user's teams (protected)
- `PUT /api/teams/:id` - Update team (protected)
- `DELETE /api/teams/:id` - Delete team (protected)
- `GET /api/teams/:id/stats` - Get team statistics

### Challenges
- `POST /api/challenges` - Send challenge (protected)
- `GET /api/challenges/my` - Get user's challenges (protected)
- `GET /api/challenges/pending` - Get pending challenges (protected)
- `PATCH /api/challenges/:id/respond` - Respond to challenge (protected)

## 🔧 Development

### Available Scripts

```bash
npm run dev         # Start development server with hot reload
npm run build       # Build for production
npm run start       # Start production server
npm run migrate     # Run Prisma migrations
npm run seed        # Seed database with sample data
npm run studio      # Open Prisma Studio
```

### Code Structure

```
src/
├── config/         # Database and app configuration
├── controllers/    # Route controllers
├── middleware/     # Custom middleware (auth, validation)
├── routes/         # API route definitions
├── types/          # TypeScript type definitions
├── utils/          # Utility functions and seed data
└── server.ts       # Main application entry point
```

## 🔒 Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## 🏆 Rating System

Teams have ratings that change based on match results:
- **Starting Rating**: 1500 points
- **Win**: Gain rating points based on opponent strength
- **Loss**: Lose rating points based on opponent strength  
- **Draw**: Minimal rating change

## 🌍 CORS Configuration

The API is configured to accept requests from:
- `http://localhost:3000` (default frontend)
- Configure additional origins in environment variables

## 📝 Sample Data

Run `npm run seed` to populate the database with sample data:
- 5 test users with teams
- Multiple sports (Football, Basketball, Volleyball)
- Sample challenges and matches
- Test credentials: `john@example.com` / `password123`

## 🚀 Production Deployment

1. Set up PostgreSQL database
2. Configure environment variables
3. Run migrations: `npx prisma migrate deploy`
4. Build the application: `npm run build`
5. Start the server: `npm start`

## 🔍 API Documentation

Visit `http://localhost:5000/api` for endpoint documentation.
Health check available at `http://localhost:5000/health`.

## 🛡️ Security Features

- **Helmet.js** for security headers
- **Rate limiting** to prevent abuse
- **Input validation** with express-validator
- **Password hashing** with bcryptjs
- **JWT token** authentication
- **CORS** configuration

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.
