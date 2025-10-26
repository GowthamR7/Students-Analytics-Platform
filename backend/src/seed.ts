// backend/src/seed.ts
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User';
import Article from './models/Article';

dotenv.config();

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/student-analytics');
    console.log(' Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Article.deleteMany({});
    console.log('🗑️  Cleared existing data');

    // Create users
    const teacher = await User.create({
      name: 'John Teacher',
      email: 'teacher@test.com',
      password: 'teacher123',
      role: 'teacher',
    });

    const student = await User.create({
      name: 'Jane Student',
      email: 'student@test.com',
      password: 'student123',
      role: 'student',
    });

    console.log('👥 Created users');

    // Create sample articles
    const articles = [
      {
        title: 'Introduction to Photosynthesis',
        category: 'Science',
        contentBlocks: [
          {
            type: 'text',
            content: 'Photosynthesis is the process by which green plants and some other organisms use sunlight to synthesize nutrients from carbon dioxide and water. This process is fundamental to life on Earth.',
            order: 0,
          },
          {
            type: 'image',
            content: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=800',
            order: 1,
          },
          {
            type: 'text',
            content: 'The process occurs in chloroplasts and produces glucose and oxygen as byproducts. It is essential for the food chain and oxygen production.',
            order: 2,
          },
        ],
        createdBy: teacher._id,
      },
      {
        title: 'Pythagoras Theorem Explained',
        category: 'Math',
        contentBlocks: [
          {
            type: 'text',
            content: 'The Pythagoras theorem states that in a right-angled triangle, the square of the hypotenuse is equal to the sum of squares of the other two sides. Formula: a² + b² = c²',
            order: 0,
          },
          {
            type: 'text',
            content: 'This theorem is used extensively in geometry, trigonometry, and real-world applications like construction and navigation.',
            order: 1,
          },
        ],
        createdBy: teacher._id,
      },
      {
        title: 'Shakespeare and English Literature',
        category: 'English',
        contentBlocks: [
          {
            type: 'text',
            content: 'William Shakespeare is widely regarded as one of the greatest writers in the English language. His works include 37 plays, 154 sonnets, and several poems.',
            order: 0,
          },
          {
            type: 'text',
            content: 'His most famous plays include Romeo and Juliet, Hamlet, Macbeth, and A Midsummer Night\'s Dream. His writing has influenced literature for centuries.',
            order: 1,
          },
        ],
        createdBy: teacher._id,
      },
      {
        title: 'The French Revolution',
        category: 'History',
        contentBlocks: [
          {
            type: 'text',
            content: 'The French Revolution (1789-1799) was a period of radical social and political upheaval in France that had a lasting impact on French history and Western civilization.',
            order: 0,
          },
          {
            type: 'text',
            content: 'Key events include the storming of the Bastille, the Reign of Terror, and the rise of Napoleon Bonaparte. It led to the end of monarchy and the rise of democracy.',
            order: 1,
          },
        ],
        createdBy: teacher._id,
      },
      {
        title: 'Introduction to JavaScript',
        category: 'Computer Science',
        contentBlocks: [
          {
            type: 'text',
            content: 'JavaScript is a versatile programming language used for web development. It allows developers to create interactive and dynamic web pages.',
            order: 0,
          },
          {
            type: 'text',
            content: 'Key concepts include variables, functions, objects, arrays, and DOM manipulation. Modern frameworks like React, Vue, and Angular are built on JavaScript.',
            order: 1,
          },
        ],
        createdBy: teacher._id,
      },
    ];

    await Article.insertMany(articles);
    console.log('📝 Created sample articles');

    console.log('\n Seed data created successfully!');
    console.log('\nTest Credentials:');
    console.log('Teacher - Email: teacher@test.com, Password: teacher123');
    console.log('Student - Email: student@test.com, Password: student123\n');

    process.exit(0);
  } catch (error) {
    console.error(' Error seeding data:', error);
    process.exit(1);
  }
};

seedData();

// ============================================

// backend/package.json - Add this script
// "scripts": {
//   "seed": "ts-node src/seed.ts"
// }

// Run with: npm run seed