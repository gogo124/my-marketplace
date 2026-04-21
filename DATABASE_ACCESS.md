# Database Access

This app uses MongoDB for:

- authentication
- listings
- conversations
- messages

## Required environment variables

Add these values to `.env.local`:

```env
MONGODB_URI=mongodb://127.0.0.1:27017/my-marketplace
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=replace-with-a-long-random-string
GOOGLE_ID=your-google-client-id
GOOGLE_SECRET=your-google-client-secret
ALLOW_IN_MEMORY_DB=false
```

## Access modes

Use a real MongoDB database:

- recommended for normal development and deployment
- set `MONGODB_URI` to your local MongoDB server or MongoDB Atlas connection string

Use a temporary in-memory database:

- set `ALLOW_IN_MEMORY_DB=true`
- only use this when you do not have MongoDB yet
- data will not persist reliably across restarts

## Current local setup

The current `.env.local` in this workspace has:

- `NEXTAUTH_URL`
- `NEXTAUTH_SECRET`

It does not currently define `MONGODB_URI`.
