# Students-Analytics-Platform# 🎓 Student Performance & Article Analytics Dashboard

A full-stack MERN application with Next.js, TypeScript, and Three.js for creating and tracking educational content with beautiful analytics.

## ✨ Features

### Teacher Portal
- 📊 **Interactive Dashboard** with Chart.js visualizations
  - Bar chart: Top articles by views
  - Pie chart: Category distribution
  - Line chart: Daily engagement trends
- 📝 **Article Creation** with multiple content types (text, images, videos)
- 📈 **Analytics Tracking** for student engagement
- 🎨 **Beautiful UI** with glassmorphism effects

### Student Portal
- 📚 **Browse Articles** with search and category filters
- ✏️ **Text Highlighting** with notes
- ⏱️ **Automatic Time Tracking** per article
- 📊 **Personal Analytics** showing reading patterns
- 💾 **Save Highlights** for future reference

### Design Features
- 🌌 **Three.js 3D Background** with floating geometric shapes
- ✨ **GSAP & Framer Motion** animations
- 🎨 **Glassmorphism UI** with dark theme
- 📱 **Fully Responsive** design

## 🛠️ Tech Stack

**Frontend:**
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS + Shadcn UI
- Chart.js for data visualization
- Three.js for 3D graphics
- Framer Motion & GSAP for animations
- Axios for API calls

**Backend:**
- Node.js + Express.js
- TypeScript
- MongoDB + Mongoose
- JWT Authentication
- Bcrypt for password hashing

## 📦 Installation

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- npm or yarn

### Backend Setup

```bash
# Create backend folder
mkdir backend && cd backend

# Initialize project
npm init -y

# Install dependencies
npm install express mongoose cors dotenv bcryptjs jsonwebtoken
npm install -D typescript @types/express @types/node @types/bcryptjs @types/jsonwebtoken ts-node nodemon

# Initialize TypeScript
npx tsc --init

# Create folder structure
mkdir -p src/models src/routes src/middleware src/controllers
```

### Frontend Setup

```bash
# Create Next.js app
npx create-next-app@latest frontend --typescript --tailwind --app --src-dir

cd frontend

# Install dependencies
npm install axios chart.js react-chartjs-2 framer-motion gsap three @types/three
npm install lucide-react zustand react-hook-form @hookform/resolvers zod
npm install class-variance-authority clsx tailwind-merge

# Install Shadcn UI
npx shadcn-ui@latest init
npx shadcn-ui@latest add button card input label dialog
```

## 🔧 Configuration

### Backend .env

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/student-analytics
JWT_SECRET=your_super_secret_jwt_key_change_in_production
JWT_EXPIRE=7d
NODE_ENV=development
```

### Frontend .env.local

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

## 🚀 Running the Application

### Start MongoDB
```bash
# Local MongoDB
mongod

# Or use Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

### Start Backend
```bash
cd backend

# Run in development
npm run dev

# Seed sample data (optional)
npm run seed
```

Backend runs on: `http://localhost:5000`

### Start Frontend
```bash
cd frontend

# Run in development
npm run dev
```

Frontend runs on: `http://localhost:3000`

## 📝 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get current user (protected)

### Articles
- `GET /api/articles` - Get all articles (protected)
- `GET /api/articles/:id` - Get single article (protected)
- `POST /api/articles` - Create article (teacher only)
- `PUT /api/articles/:id` - Update article (teacher only)
- `DELETE /api/articles/:id` - Delete article (teacher only)

### Analytics
- `GET /api/analytics` - Get teacher analytics (teacher only)
- `GET /api/analytics/student` - Get student analytics (student only)
- `POST /api/analytics/track` - Track article view/time (student only)

### Highlights
- `POST /api/highlights` - Save highlight (student only)
- `GET /api/highlights` - Get user highlights (student only)
- `DELETE /api/highlights/:id` - Delete highlight (student only)

## 🧪 Test Credentials

After running seed script:

**Teacher Account:**
- Email: `teacher@test.com`
- Password: `teacher123`

**Student Account:**
- Email: `student@test.com`
- Password: `student123`

## 📂 Project Structure

```
student-analytics-platform/
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── (auth)/
│   │   │   │   ├── login/
│   │   │   │   └── register/
│   │   │   ├── teacher/
│   │   │   │   ├── dashboard/
│   │   │   │   ├── articles/
│   │   │   │   ├── create-article/
│   │   │   │   ├── edit-article/[id]/
│   │   │   │   └── preview-article/[id]/
│   │   │   └── student/
│   │   │       ├── dashboard/
│   │   │       ├── articles/
│   │   │       └── article/[id]/
│   │   ├── components/
│   │   │   └── ui/
│   │   └── lib/
│   ├── package.json
│   ├── tailwind.config.js
│   └── next.config.js
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── authController.ts
│   │   │   ├── articleController.ts
│   │   │   ├── analyticsController.ts
│   │   │   ├── trackingController.ts
│   │   │   └── highlightsController.ts
│   │   ├── middleware/
│   │   │   └── auth.ts
│   │   ├── models/
│   │   │   ├── User.ts
│   │   │   ├── Article.ts
│   │   │   ├── Analytics.ts
│   │   │   └── Highlight.ts
│   │   ├── routes/
│   │   │   ├── auth.ts
│   │   │   ├── articles.ts
│   │   │   ├── analytics.ts
│   │   │   ├── tracking.ts
│   │   │   └── highlights.ts
│   │   ├── config/
│   │   │   └── database.ts
│   │   └── server.ts
│   ├── package.json
│   └── tsconfig.json
├── README.md
└── postman-collection.json

```

## 🎨 Key Features Implementation

### Chart.js Integration
Three types of charts implemented:
1. **Bar Chart** - Articles vs Views
2. **Pie Chart** - Category Distribution & Time per Category
3. **Line Chart** - Daily Engagement Trends

### Text Highlighting
Students can:
1. Select any text in articles
2. Add optional notes
3. Save highlights to their profile
4. View all highlights later

### Analytics Tracking
- Automatic view counting
- Time spent tracking (in seconds)
- Category-wise statistics
- Daily engagement patterns

### Three.js Background
- 15 floating geometric shapes
- Mouse movement parallax effect
- Smooth animations
- Responsive design

## 🐛 Troubleshooting

### MongoDB Connection Error
```bash
# Ensure MongoDB is running
mongod --dbpath /path/to/data

# Or check connection string in .env
```

### CORS Issues
Backend already configured with CORS. Ensure frontend API URL matches backend port.

### Chart.js Not Rendering
Make sure all Chart.js components are registered:
```typescript
import { Chart as ChartJS, ... } from 'chart.js';
ChartJS.register(...);
```

## 🚢 Deployment

### Backend (Heroku/Railway)
1. Add `Procfile`: `web: node dist/server.js`
2. Set environment variables
3. Deploy

### Frontend (Vercel)
1. Connect GitHub repo
2. Set `NEXT_PUBLIC_API_URL` environment variable
3. Deploy automatically

## 📄 License

MIT License - Feel free to use for learning and projects!

## 👨‍💻 Author

Built with ❤️ for educational purposes

---

## 🎯 Next Steps

- Add real-time notifications
- Implement file upload for images
- Add quiz functionality
- Social sharing features
- Mobile app version