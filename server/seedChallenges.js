const mongoose = require('mongoose');
const Challenge = require('./models/Challenge');
require('dotenv').config();

const challenges = [
  {
    title: 'Two Sum',
    description: 'Write a function that returns the sum of two numbers.',
    difficulty: 'Easy',
    points: 10,
    boilerplate: 'function solution(input) {\n  // Your code here\n  const [a, b] = input;\n  \n}',
    solution: 'a + b',
    testCases: [
      { input: '[1, 2]', expected: '3' },
      { input: '[10, 20]', expected: '30' }
    ]
  },
  {
    title: 'Reverse String',
    description: 'Write a function that reverses a string.',
    difficulty: 'Easy',
    points: 10,
    boilerplate: 'function solution(input) {\n  // Your code here\n  \n}',
    solution: 'input.split("").reverse().join("")',
    testCases: [
      { input: '"hello"', expected: '"olleh"' },
      { input: '"world"', expected: '"dlrow"' }
    ]
  },
  {
    title: 'Palindrome Check',
    description: 'Return true if a string is a palindrome, false otherwise.',
    difficulty: 'Medium',
    points: 20,
    boilerplate: 'function solution(input) {\n  // Your code here\n  \n}',
    solution: 'input === input.split("").reverse().join("")',
    testCases: [
      { input: '"racecar"', expected: 'true' },
      { input: '"hello"', expected: 'false' }
    ]
  }
];

const seedChallenges = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');
    
    await Challenge.deleteMany();
    console.log('Cleared existing challenges');
    
    await Challenge.insertMany(challenges);
    console.log('Seeded challenges successfully');
    
    process.exit();
  } catch (error) {
    console.error('Seed Error:', error);
    process.exit(1);
  }
};

seedChallenges();
