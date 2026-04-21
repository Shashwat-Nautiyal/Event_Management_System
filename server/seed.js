const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const User = require('./src/models/User');
const Category = require('./src/models/Category');
const Event = require('./src/models/Event');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/campus_events';

const categories = [
  { name: 'Technical', description: 'Coding competitions, hackathons, tech talks', color: '#6366f1', icon: '💻' },
  { name: 'Workshop', description: 'Hands-on learning sessions', color: '#8b5cf6', icon: '🔧' },
  { name: 'Cultural', description: 'Music, dance, drama, art events', color: '#ec4899', icon: '🎭' },
  { name: 'Sports', description: 'Athletic events and tournaments', color: '#10b981', icon: '⚽' },
  { name: 'Guest Lecture', description: 'Talks by industry experts', color: '#f59e0b', icon: '🎤' },
  { name: 'Seminar', description: 'Academic and research seminars', color: '#3b82f6', icon: '📖' },
  { name: 'Social', description: 'Networking and social gatherings', color: '#ef4444', icon: '🤝' },
  { name: 'Career', description: 'Placement drives, career fairs', color: '#14b8a6', icon: '💼' },
];

const users = [
  { name: 'Admin User', email: 'admin@campus.edu', password: 'admin123', role: 'admin', department: 'Administration' },
  { name: 'Dr. Sarah Chen', email: 'organizer@campus.edu', password: 'organizer123', role: 'organizer', department: 'Computer Science' },
  { name: 'Prof. Rajesh Kumar', email: 'organizer2@campus.edu', password: 'organizer123', role: 'organizer', department: 'Electronics' },
  { name: 'Ajay Student', email: 'student@campus.edu', password: 'student123', role: 'student', department: 'Computer Science' },
  { name: 'Priya Sharma', email: 'student2@campus.edu', password: 'student123', role: 'student', department: 'Mechanical' },
];

const seed = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Category.deleteMany({});
    await Event.deleteMany({});
    console.log('Cleared existing data');

    // Create categories
    const createdCategories = await Category.insertMany(categories);
    console.log(`Created ${createdCategories.length} categories`);

    // Create users
    const createdUsers = [];
    for (const userData of users) {
      const user = await User.create(userData);
      createdUsers.push(user);
    }
    console.log(`Created ${createdUsers.length} users`);

    // Find organizer and category references
    const organizer1 = createdUsers.find(u => u.email === 'organizer@campus.edu');
    const organizer2 = createdUsers.find(u => u.email === 'organizer2@campus.edu');
    const techCat = createdCategories.find(c => c.name === 'Technical');
    const workshopCat = createdCategories.find(c => c.name === 'Workshop');
    const culturalCat = createdCategories.find(c => c.name === 'Cultural');
    const guestCat = createdCategories.find(c => c.name === 'Guest Lecture');
    const sportsCat = createdCategories.find(c => c.name === 'Sports');
    const careerCat = createdCategories.find(c => c.name === 'Career');

    // Create sample events
    const events = [
      {
        title: 'CodeStorm 2026 — 24hr Hackathon',
        description: 'Join the biggest hackathon on campus! Build something incredible in 24 hours. Open to all departments. Prizes worth ₹50,000. Meals and snacks provided. Teams of 2-4 members.',
        category: techCat._id,
        organizer: organizer1._id,
        venue: 'Main Auditorium & CS Labs',
        date: new Date('2026-05-15'),
        startTime: '09:00',
        endTime: '09:00',
        maxParticipants: 200,
        status: 'approved',
        tags: ['hackathon', 'coding', 'prizes', 'team'],
        isFeatured: true,
      },
      {
        title: 'React & Node.js Full-Stack Workshop',
        description: 'A hands-on 3-day workshop covering React fundamentals, Node.js backend development, and MongoDB. Build a complete project by the end. Laptop required.',
        category: workshopCat._id,
        organizer: organizer1._id,
        venue: 'CS Lab 201',
        date: new Date('2026-05-20'),
        startTime: '10:00',
        endTime: '16:00',
        maxParticipants: 60,
        status: 'approved',
        tags: ['react', 'nodejs', 'fullstack', 'web'],
      },
      {
        title: 'Spring Cultural Fest — Rhythms 2026',
        description: 'The annual cultural extravaganza! Featuring dance competitions, battle of bands, stand-up comedy, and art exhibitions. Register individually or as groups.',
        category: culturalCat._id,
        organizer: organizer2._id,
        venue: 'Open Air Theatre',
        date: new Date('2026-06-01'),
        startTime: '17:00',
        endTime: '22:00',
        maxParticipants: 500,
        status: 'approved',
        tags: ['culture', 'dance', 'music', 'art'],
        isFeatured: true,
      },
      {
        title: 'AI in Healthcare — Guest Lecture by Dr. Patel',
        description: 'Dr. Meera Patel from Google Health discusses the latest applications of AI in diagnostics, drug discovery, and patient care. Q&A session included.',
        category: guestCat._id,
        organizer: organizer1._id,
        venue: 'Seminar Hall B',
        date: new Date('2026-05-25'),
        startTime: '14:00',
        endTime: '16:00',
        maxParticipants: 150,
        status: 'approved',
        tags: ['AI', 'healthcare', 'guest-lecture'],
      },
      {
        title: 'Inter-Department Cricket Tournament',
        description: 'T20 format cricket tournament between all departments. Register your team of 11+4 substitutes. Trophy and medals for top 3 teams.',
        category: sportsCat._id,
        organizer: organizer2._id,
        venue: 'Sports Ground',
        date: new Date('2026-06-10'),
        startTime: '08:00',
        endTime: '18:00',
        maxParticipants: 120,
        status: 'approved',
        tags: ['cricket', 'sports', 'tournament'],
      },
      {
        title: 'Campus Placement Prep — Resume & Interview Workshop',
        description: 'Get placement-ready! Learn resume building, group discussion techniques, and mock interviews with HR professionals from top companies.',
        category: careerCat._id,
        organizer: organizer1._id,
        venue: 'Conference Room A',
        date: new Date('2026-05-28'),
        startTime: '10:00',
        endTime: '15:00',
        maxParticipants: 80,
        status: 'approved',
        tags: ['placement', 'career', 'interview', 'resume'],
      },
      {
        title: 'IoT & Embedded Systems Workshop',
        description: 'Learn to build IoT projects using Arduino and Raspberry Pi. Components will be provided. Prior programming experience recommended.',
        category: workshopCat._id,
        organizer: organizer2._id,
        venue: 'Electronics Lab 105',
        date: new Date('2026-06-05'),
        startTime: '09:00',
        endTime: '17:00',
        maxParticipants: 40,
        status: 'pending',
        tags: ['IoT', 'arduino', 'embedded', 'hardware'],
      },
      {
        title: 'Cybersecurity CTF Challenge',
        description: 'Capture The Flag competition for cybersecurity enthusiasts. Test your skills in web exploitation, cryptography, reverse engineering, and forensics.',
        category: techCat._id,
        organizer: organizer1._id,
        venue: 'CS Lab 301',
        date: new Date('2026-06-15'),
        startTime: '10:00',
        endTime: '22:00',
        maxParticipants: 100,
        status: 'pending',
        tags: ['cybersecurity', 'CTF', 'hacking'],
      },
    ];

    const createdEvents = await Event.insertMany(events);
    console.log(`Created ${createdEvents.length} events`);

    console.log('\n✅ Seed completed successfully!');
    console.log('\n📋 Login Credentials:');
    console.log('  Admin:     admin@campus.edu / admin123');
    console.log('  Organizer: organizer@campus.edu / organizer123');
    console.log('  Student:   student@campus.edu / student123\n');

    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

seed();
