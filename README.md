# HireHub - Server

Backend for HireHub. Built with Node.js, Express, MongoDB, JWT, Multer.

Environment:

- Copy `.env.example` to `.env` and set `MONGO_URI` and `JWT_SECRET`.

Install and run (PowerShell):

```powershell
cd server
npm install
# Run in dev (nodemon)
npm run dev
# or start
npm start
```

API endpoints:

- POST `/api/auth/register` { name, email, password, role }
- POST `/api/auth/login` { email, password }
- GET `/api/jobs`
- POST `/api/jobs` (recruiter/admin)
- POST `/api/jobs/:id/apply` (candidate) - form-data `resume` file
- GET `/api/users` (admin)

Uploads are saved to `server/uploads` and served at `/uploads/*`.
