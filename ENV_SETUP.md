# Environment Variables Setup

Create a `.env.local` file in the root directory with the following variables:

```env
# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here-generate-a-random-string

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/bakery-management
# OR for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/bakery-management?retryWrites=true&w=majority

# MongoDB Database Name (optional, defaults to "bakery-management")
MONGODB_DB_NAME=bakery-management
```

## How to Generate NEXTAUTH_SECRET

Run this command in your terminal:
```bash
openssl rand -base64 32
```

Or use an online generator to create a random string.

## MongoDB Setup

1. **Local MongoDB**: Install MongoDB locally and use `mongodb://localhost:27017/bakery-management`

2. **MongoDB Atlas** (Cloud):
   - Create a free account at https://www.mongodb.com/cloud/atlas
   - Create a new cluster
   - Get your connection string
   - Replace `<username>` and `<password>` with your credentials

## Important Notes

- Never commit `.env.local` to git (it's already in .gitignore)
- Change `NEXTAUTH_SECRET` in production
- Keep your MongoDB credentials secure

