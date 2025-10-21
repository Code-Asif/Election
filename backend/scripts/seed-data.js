const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/election-app');

// Import schemas
const User = require('../src/schemas/user.schema');
const Election = require('../src/schemas/election.schema');
const Candidate = require('../src/schemas/candidate.schema');

async function seedData() {
  try {
    // Clear existing data
    await User.deleteMany({});
    await Election.deleteMany({});
    await Candidate.deleteMany({});

    // Create admin user
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const admin = new User({
      name: 'Admin User',
      email: 'admin@example.com',
      password: hashedPassword,
      role: 'admin',
      isEmailVerified: true
    });
    await admin.save();

    // Create regular user
    const userPassword = await bcrypt.hash('user123', 10);
    const user = new User({
      name: 'John Doe',
      email: 'john@example.com',
      password: userPassword,
      role: 'voter',
      isEmailVerified: true
    });
    await user.save();

    // Create sample elections
    const election1 = new Election({
      title: 'Student Council Election',
      description: 'Vote for your student council representatives',
      type: 'public',
      status: 'running',
      startAt: new Date(),
      endAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      creator: admin._id,
      slug: 'student-council-2024',
      eligibilityType: 'domain',
      eligibilityValue: 'example.com',
      maxVotes: 1,
      allowMultipleVotes: false,
      showResults: true,
      isActive: true
    });
    await election1.save();

    const election2 = new Election({
      title: 'Class President Election',
      description: 'Choose your class president for the upcoming semester',
      type: 'public',
      status: 'running',
      startAt: new Date(),
      endAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
      creator: admin._id,
      slug: 'class-president-2024',
      eligibilityType: 'domain',
      eligibilityValue: 'example.com',
      maxVotes: 1,
      allowMultipleVotes: false,
      showResults: true,
      isActive: true
    });
    await election2.save();

    // Create candidates for election 1
    const candidate1 = new Candidate({
      name: 'Alice Johnson',
      description: 'Experienced leader with a vision for student welfare',
      electionId: election1._id,
      imageUrl: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
      order: 1
    });
    await candidate1.save();

    const candidate2 = new Candidate({
      name: 'Bob Smith',
      description: 'Passionate about student rights and campus improvements',
      electionId: election1._id,
      imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
      order: 2
    });
    await candidate2.save();

    const candidate3 = new Candidate({
      name: 'Carol Davis',
      description: 'Focused on academic excellence and student support',
      electionId: election1._id,
      imageUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
      order: 3
    });
    await candidate3.save();

    // Create candidates for election 2
    const candidate4 = new Candidate({
      name: 'David Wilson',
      description: 'Strong advocate for class unity and academic success',
      electionId: election2._id,
      imageUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      order: 1
    });
    await candidate4.save();

    const candidate5 = new Candidate({
      name: 'Emma Brown',
      description: 'Dedicated to improving class communication and activities',
      electionId: election2._id,
      imageUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face',
      order: 2
    });
    await candidate5.save();

    console.log('✅ Sample data created successfully!');
    console.log('👤 Admin user: admin@example.com / admin123');
    console.log('👤 Regular user: john@example.com / user123');
    console.log('🗳️  Created 2 sample elections with candidates');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding data:', error);
    process.exit(1);
  }
}

seedData();
