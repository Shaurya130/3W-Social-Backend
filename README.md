# 3W Backend

A Node.js/Express backend API for a social media platform with authentication, posts, polls, promotions, and user management.

## Features

- **User Authentication**: JWT-based authentication with access and refresh tokens
- **Posts Management**: Create, read, like, and comment on posts
- **Polls**: Create and vote in interactive polls
- **Promotions**: Create promotional content with custom buttons
- **Image Upload**: Cloudinary integration for image storage
- **CORS Enabled**: Cross-origin resource sharing support

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **File Upload**: Multer middleware
- **Image Storage**: Cloudinary
- **Environment Variables**: dotenv

## Project Structure

```
src/
├── app.js                 # Express app configuration
├── index.js              # Server entry point
├── constants.js          # Application constants
├── Controller/           # Route handlers
│   ├── post.controller.js
│   └── user.controller.js
├── db/                   # Database configuration
│   └── index.js
├── middlewares/          # Custom middleware
│   ├── auth.middleware.js
│   ├── error.middleware.js
│   └── multer.middleware.js
├── models/              # Database models
│   ├── post.model.js
│   └── user.model.js
├── routes/              # API routes
│   ├── post.routes.js
│   └── user.routes.js
└── utils/               # Utility functions
    ├── ApiError.js
    ├── ApiResponse.js
    ├── asyncHandle.js
    └── cloudinary.js
```

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd "3W backend"
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the root directory:
   ```env
   PORT=5001
   MONGODB_URI=mongodb://localhost:27017/3w-social
   ACCESS_TOKEN_SECRET=your_access_token_secret
   REFRESH_TOKEN_SECRET=your_refresh_token_secret
   ACCESS_TOKEN_EXPIRY=1d
   REFRESH_TOKEN_EXPIRY=10d
   CORS_ORIGIN=http://localhost:5173
   
   # Cloudinary Configuration
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   ```

4. **Start the server**
   ```bash
   npm start
   # or for development
   npm run dev
   ```

The server will run on `http://localhost:5001`

## API Endpoints

### Authentication
- `POST /api/v1/users/register` - Register new user
- `POST /api/v1/users/login` - User login
- `POST /api/v1/users/logout` - User logout
- `POST /api/v1/users/refresh-token` - Refresh access token

### Posts
- `GET /api/v1/posts` - Get all posts (requires auth)
- `POST /api/v1/posts/create-post` - Create new post (requires auth)
- `POST /api/v1/posts/create-poll` - Create poll (requires auth)
- `POST /api/v1/posts/create-promotion` - Create promotion (requires auth)
- `POST /api/v1/posts/:postId/toggle-like` - Toggle like on post (requires auth)
- `POST /api/v1/posts/:postId/add-comment` - Add comment to post (requires auth)
- `POST /api/v1/posts/:postId/vote` - Vote in poll (requires auth)

### Debug
- `GET /api/v1/test-cookies` - Test cookie reception

## Authentication

The API uses JWT-based authentication. Include the access token in requests using one of these methods:

1. **Cookies** (recommended):
   ```javascript
   // Frontend request with credentials
   fetch('/api/v1/posts', {
     credentials: 'include'
   })
   ```

2. **Authorization Header**:
   ```javascript
   // Frontend request with Bearer token
   fetch('/api/v1/posts', {
     headers: {
       'Authorization': `Bearer ${accessToken}`
     }
   })
   ```

3. **Request Body**:
   ```json
   {
     "accessToken": "your_jwt_token_here",
     "otherData": "..."
   }
   ```

## Request/Response Examples

### Create Post
```bash
POST /api/v1/posts/create-post
Content-Type: multipart/form-data

{
  "content": "Hello World!",
  "image": <file>
}
```

### Create Poll
```bash
POST /api/v1/posts/create-poll
Content-Type: application/json

{
  "question": "What's your favorite color?",
  "options": ["Red", "Blue", "Green"],
  "expiresAt": "2026-02-12T00:00:00.000Z"
}
```

### Get Posts Response
```json
{
  "statusCode": 200,
  "data": {
    "feed": [
      {
        "_id": "post_id",
        "type": "POST",
        "username": "john_doe",
        "content": "Hello World!",
        "image": "cloudinary_url",
        "likesCount": 5,
        "likedBy": ["user1", "user2"],
        "commentsCount": 2,
        "comments": [
          {
            "username": "jane_doe",
            "content": "Nice post!"
          }
        ]
      }
    ],
    "total": 1
  },
  "message": "Feed fetched successfully",
  "success": true
}
```

## Error Handling

The API returns consistent error responses:

```json
{
  "statusCode": 400,
  "data": null,
  "message": "Error description",
  "success": false,
  "errors": []
}
```

## Development

### Scripts
- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon

### Dependencies
- `express` - Web framework
- `mongoose` - MongoDB ODM
- `jsonwebtoken` - JWT implementation
- `bcrypt` - Password hashing
- `multer` - File upload handling
- `cloudinary` - Image storage
- `cors` - Cross-origin resource sharing
- `cookie-parser` - Cookie parsing middleware

## CORS Configuration

The API is configured to accept requests from:
- Development: `http://localhost:5173` (Vite default)
- Production: Set via `CORS_ORIGIN` environment variable

## File Upload

Images are uploaded to Cloudinary. Supported formats:
- JPEG, PNG, GIF
- Max size: 16KB per request (configurable)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License.
