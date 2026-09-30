# Contact Management System

A simple REST API with a test web page for managing contacts. Built with **Node.js**, **Express**, and **MongoDB Atlas** (Mongoose).

## Features

- Full CRUD: create, read (all / one), update, delete contacts
- Validation on every field
- Unique `contactId` and unique `email`
- Simple frontend (`src/index.html`) to test all operations from the browser

## Tech Stack

| Layer     | Technology           |
|-----------|----------------------|
| Runtime   | Node.js              |
| Framework | Express              |
| Database  | MongoDB Atlas        |
| ODM       | Mongoose             |
| Config    | dotenv               |

## Project Structure

```
my-project/
├── src/
│   └── index.html      # Frontend test page
├── app.js              # Server, schema, and API routes
├── .env                # Environment variables (NOT committed)
├── .env.example        # Sample env file
├── .gitignore
├── package.json
└── README.md
```

## Contact Schema

| Field       | Type   | Rules                                                  |
|-------------|--------|--------------------------------------------------------|
| `contactId` | String | Unique. Auto-generated (UUID) if not provided          |
| `name`      | String | Required                                               |
| `phone`     | String | Required, exactly 10 digits                            |
| `email`     | String | Optional, unique, must be a valid email (saved lowercase) |

## Setup

### 1. Prerequisites

- Node.js 18 or higher
- A MongoDB Atlas account and cluster ([mongodb.com/atlas](https://www.mongodb.com/atlas))

### 2. Clone and install

```bash
git clone https://github.com/YOUR_USERNAME/YOUR_REPO.git
cd YOUR_REPO
npm install
```

If you are starting from scratch instead:

```bash
npm init -y
npm install express mongoose dotenv
```

### 3. Configure MongoDB Atlas

1. Create a database user: **Database Access → Add New Database User**.
2. Allow your IP: **Network Access → Add IP Address** (use `0.0.0.0/0` for development).
3. Get the connection string: **Database → Connect → Drivers**.

### 4. Create the `.env` file

Create a file named `.env` in the project root. Each variable goes on its own line, and the quotes must be closed:

```properties
MONGO_URI="mongodb+srv://USERNAME:PASSWORD@cluster0.xxxxx.mongodb.net/contactsdb?appName=Cluster0"
PORT=3000
```

Notes:

- `contactsdb` is the database name. Put it before the `?`.
- If your password has special characters (`@ : / ?`), URL-encode them.
- Never commit `.env` or share your password.

### 5. Run the server

```bash
node app.js
```

Expected output:

```
◇ injected env (2) from .env
MongoDB connected successfully
Indexes synced
Server running at http://localhost:3000
```

Open `http://localhost:3000` in your browser (or the Simple Browser / preview URL on ByteXL).

## API Endpoints

Base URL: `http://localhost:3000`

| Operation | Method | Endpoint                     |
|-----------|--------|------------------------------|
| Status    | GET    | `/api/status`                |
| Create    | POST   | `/api/contacts`              |
| Read all  | GET    | `/api/contacts`              |
| Read one  | GET    | `/api/contacts/:contactId`   |
| Update    | PUT    | `/api/contacts/:contactId`   |
| Delete    | DELETE | `/api/contacts/:contactId`   |

---

### Status: `GET /api/status`

```bash
curl http://localhost:3000/api/status
```

Response `200`:

```json
{
  "success": true,
  "message": "Contact Management System API is running"
}
```

---

### Create: `POST /api/contacts`

Request:

```bash
curl -X POST http://localhost:3000/api/contacts \
  -H "Content-Type: application/json" \
  -d '{"contactId":"C001","name":"Nandhu Siva","phone":"9876543210","email":"nandhu@example.com"}'
```

Body:

```json
{
  "contactId": "C001",
  "name": "Nandhu Siva",
  "phone": "9876543210",
  "email": "nandhu@example.com"
}
```

Response `201`:

```json
{
  "success": true,
  "data": {
    "contactId": "C001",
    "name": "Nandhu Siva",
    "phone": "9876543210",
    "email": "nandhu@example.com",
    "_id": "6650f1c2a1b2c3d4e5f60789",
    "createdAt": "2026-09-30T10:15:00.000Z",
    "updatedAt": "2026-09-30T10:15:00.000Z",
    "__v": 0
  }
}
```

Minimum body (`contactId` and `email` are optional):

```json
{
  "name": "Ravi Kumar",
  "phone": "9123456789"
}
```

---

### Read all: `GET /api/contacts`

```bash
curl http://localhost:3000/api/contacts
```

Response `200`:

```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "contactId": "C002",
      "name": "Ravi Kumar",
      "phone": "9123456789",
      "_id": "6650f2d3a1b2c3d4e5f60790",
      "createdAt": "2026-09-30T10:20:00.000Z",
      "updatedAt": "2026-09-30T10:20:00.000Z"
    },
    {
      "contactId": "C001",
      "name": "Nandhu Siva",
      "phone": "9876543210",
      "email": "nandhu@example.com",
      "_id": "6650f1c2a1b2c3d4e5f60789",
      "createdAt": "2026-09-30T10:15:00.000Z",
      "updatedAt": "2026-09-30T10:15:00.000Z"
    }
  ]
}
```

---

### Read one: `GET /api/contacts/:contactId`

```bash
curl http://localhost:3000/api/contacts/C001
```

Response `200`:

```json
{
  "success": true,
  "data": {
    "contactId": "C001",
    "name": "Nandhu Siva",
    "phone": "9876543210",
    "email": "nandhu@example.com"
  }
}
```

---

### Update: `PUT /api/contacts/:contactId`

`contactId` cannot be changed. Send only the fields you want to update. Sending `"email": ""` removes the email.

```bash
curl -X PUT http://localhost:3000/api/contacts/C001 \
  -H "Content-Type: application/json" \
  -d '{"name":"Nandhu S","phone":"9000000000"}'
```

Response `200`:

```json
{
  "success": true,
  "data": {
    "contactId": "C001",
    "name": "Nandhu S",
    "phone": "9000000000",
    "email": "nandhu@example.com"
  }
}
```

---

### Delete: `DELETE /api/contacts/:contactId`

```bash
curl -X DELETE http://localhost:3000/api/contacts/C001
```

Response `200`:

```json
{
  "success": true,
  "message": "Contact deleted"
}
```

## Error Responses

| Case                          | Status | Response message                                  |
|-------------------------------|--------|---------------------------------------------------|
| Missing name                  | 400    | `Name is required`                                |
| Phone not 10 digits           | 400    | `Phone must be exactly 10 digits`                 |
| Invalid email format          | 400    | `Email format is invalid`                         |
| Duplicate email / contactId   | 409    | `email already exists` / `contactId already exists` |
| Contact not found             | 404    | `Contact not found`                               |
| Unknown route                 | 404    | `Route not found`                                 |

**Validation error (400):**

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": ["Phone must be exactly 10 digits"]
}
```

**Duplicate (409):**

```json
{
  "success": false,
  "message": "email already exists"
}
```

**Not found (404):**

```json
{
  "success": false,
  "message": "Contact not found"
}
```

## Testing

### From the browser

Open the app root (`/`). The page lets you add, list, view, edit, and delete contacts. The **Last API response** box shows the status code and JSON of each call.

### From Postman or Thunder Client

1. Set the method and URL (for example `POST http://localhost:3000/api/contacts`).
2. For POST and PUT: **Body → raw → JSON**, then paste a sample body from above.
3. Check the status code: `201` for create, `200` for read, update, and delete.

### Quick test sequence

```bash
# 1. Create
curl -X POST localhost:3000/api/contacts -H "Content-Type: application/json" \
  -d '{"contactId":"T1","name":"Test User","phone":"9999999999","email":"test@example.com"}'

# 2. Read all
curl localhost:3000/api/contacts

# 3. Read one
curl localhost:3000/api/contacts/T1

# 4. Update
curl -X PUT localhost:3000/api/contacts/T1 -H "Content-Type: application/json" \
  -d '{"name":"Updated User"}'

# 5. Delete
curl -X DELETE localhost:3000/api/contacts/T1
```

## Viewing data in Atlas

Go to **Database → Browse Collections** and open database `contactsdb`, collection `contacts`. Click the refresh icon if new data does not appear. The terminal also prints the database name in use when the server starts.

## Troubleshooting

| Problem | Fix |
|---------|-----|
| `Cannot find module 'express'` | Run `npm install` |
| `MongoDB connection failed` | Check `MONGO_URI`, the password, and Atlas Network Access (IP allow list) |
| `injected env (1)` instead of `(2)` | `.env` has a formatting error. Put each variable on its own line and close the quotes |
| Preview is blank on ByteXL | Make sure the server runs on the same port as the preview URL (for example 3000) and listens on `0.0.0.0` |
| Data not visible in Atlas | Check you are looking at the right database name, and refresh Atlas |
| Index name conflict error | Use `Contact.syncIndexes()` at startup and set `autoIndex: false` in the schema |
| `Cannot GET /` | Make sure `src/index.html` exists |

## Security

- Do not commit `.env` or `node_modules`. Add both to `.gitignore`:

  ```
  .env
  node_modules
  ```

- Commit a `.env.example` with fake values so others know which variables to set:

  ```properties
  MONGO_URI="mongodb+srv://USERNAME:PASSWORD@cluster0.xxxxx.mongodb.net/contactsdb?appName=Cluster0"
  PORT=3000
  ```

- If a password was ever shared or pushed to GitHub, change it in Atlas (**Database Access → Edit → Edit Password**).

## License

This project is for learning purposes.