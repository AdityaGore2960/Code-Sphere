const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./models/User');
const Post = require('./models/Post');
const Job = require('./models/Job');
const Challenge = require('./models/Challenge');
const Repo = require('./models/Repo');
const Chat = require('./models/Chat');
const Message = require('./models/Message');
const Notification = require('./models/Notification');

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB:', process.env.MONGO_URI);

    // ─── Clear all collections ───────────────────────────────────────
    await Promise.all([
      User.deleteMany(), Post.deleteMany(), Job.deleteMany(),
      Challenge.deleteMany(), Repo.deleteMany(), Chat.deleteMany(),
      Message.deleteMany(), Notification.deleteMany()
    ]);
    console.log('🗑️  Cleared all collections');

    // ─── 1. USERS ────────────────────────────────────────────────────
    const salt = await bcrypt.genSalt(10);
    const hash = (pw) => bcrypt.hash(pw, salt);

    const usersRaw = [
      {
        username: 'alex_dev',
        name: 'Alex Johnson',
        email: 'alex@codesphere.dev',
        password: await hash('password123'),
        bio: 'Full Stack Engineer | React & Node.js | Open Source Lover',
        headline: 'Senior Software Engineer at TechCorp',
        location: 'San Francisco, CA',
        githubUsername: 'alexjohnson',
        leetcodeUsername: 'alex_lc',
        codeforcesUsername: 'alex_cf',
        skills: ['React', 'Node.js', 'MongoDB', 'TypeScript', 'GraphQL'],
        interests: ['webdev', 'ai', 'opensource'],
        socialLinks: { github: 'https://github.com/alexjohnson', linkedin: 'https://linkedin.com/in/alexjohnson' },
        points: 350,
        codingStats: {
          github: { public_repos: 42, followers: 210, top_repos: [{ name: 'react-hooks-lib', stars: 980, forks: 120, language: 'TypeScript' }] },
          leetcode: { totalSolved: 520, ranking: 12000, easySolved: 180, mediumSolved: 240, hardSolved: 100 },
          codeforces: { rating: 1900, maxRank: 'candidate master', ratingHistory: [{ newRating: 1600 }, { newRating: 1750 }, { newRating: 1900 }] },
          lastUpdated: new Date()
        }
      },
      {
        username: 'sarah_codes',
        name: 'Sarah Chen',
        email: 'sarah@codesphere.dev',
        password: await hash('password123'),
        bio: 'ML Engineer & Competitive Programmer | Python enthusiast',
        headline: 'ML Engineer at DataAI Labs',
        location: 'New York, NY',
        githubUsername: 'sarahchen',
        leetcodeUsername: 'sarah_lc',
        codeforcesUsername: 'sarah_cf',
        skills: ['Python', 'TensorFlow', 'C++', 'Algorithms', 'Data Structures'],
        interests: ['ml', 'competitive-coding', 'python'],
        socialLinks: { github: 'https://github.com/sarahchen', linkedin: 'https://linkedin.com/in/sarahchen' },
        points: 620,
        codingStats: {
          github: { public_repos: 28, followers: 540, top_repos: [{ name: 'ml-toolkit', stars: 1500, forks: 340, language: 'Python' }] },
          leetcode: { totalSolved: 890, ranking: 3200, easySolved: 250, mediumSolved: 400, hardSolved: 240 },
          codeforces: { rating: 2250, maxRank: 'master', ratingHistory: [{ newRating: 1900 }, { newRating: 2050 }, { newRating: 2250 }] },
          lastUpdated: new Date()
        }
      },
      {
        username: 'raj_kumar',
        name: 'Raj Kumar',
        email: 'raj@codesphere.dev',
        password: await hash('password123'),
        bio: 'Backend Engineer | Distributed Systems | Cloud Architecture',
        headline: 'Backend Engineer at CloudSystems Inc',
        location: 'Bangalore, India',
        githubUsername: 'rajkumar',
        leetcodeUsername: 'raj_lc',
        codeforcesUsername: 'raj_cf',
        skills: ['Java', 'Spring Boot', 'AWS', 'Kubernetes', 'PostgreSQL'],
        interests: ['backend', 'cloud', 'devops'],
        socialLinks: { github: 'https://github.com/rajkumar', linkedin: 'https://linkedin.com/in/rajkumar' },
        points: 280,
        codingStats: {
          github: { public_repos: 55, followers: 180, top_repos: [{ name: 'spring-microservices', stars: 450, forks: 90, language: 'Java' }] },
          leetcode: { totalSolved: 380, ranking: 22000, easySolved: 140, mediumSolved: 180, hardSolved: 60 },
          codeforces: { rating: 1650, maxRank: 'expert', ratingHistory: [{ newRating: 1400 }, { newRating: 1550 }, { newRating: 1650 }] },
          lastUpdated: new Date()
        }
      },
      {
        username: 'emily_ui',
        name: 'Emily Rodriguez',
        email: 'emily@codesphere.dev',
        password: await hash('password123'),
        bio: 'Frontend Developer | UI/UX Design | React & Vue.js',
        headline: 'Frontend Lead at DesignTech',
        location: 'Austin, TX',
        githubUsername: 'emilyrod',
        leetcodeUsername: 'emily_lc',
        skills: ['React', 'Vue.js', 'Tailwind CSS', 'Figma', 'JavaScript'],
        interests: ['frontend', 'design', 'webdev'],
        socialLinks: { github: 'https://github.com/emilyrod', portfolio: 'https://emilyrod.dev' },
        points: 190,
        codingStats: {
          github: { public_repos: 33, followers: 290, top_repos: [{ name: 'vue-component-lib', stars: 720, forks: 150, language: 'Vue' }] },
          leetcode: { totalSolved: 210, ranking: 45000, easySolved: 120, mediumSolved: 75, hardSolved: 15 },
          codeforces: { rating: 1350, maxRank: 'pupil', ratingHistory: [{ newRating: 1200 }, { newRating: 1350 }] },
          lastUpdated: new Date()
        }
      },
      {
        username: 'mike_security',
        name: 'Mike Thompson',
        email: 'mike@codesphere.dev',
        password: await hash('password123'),
        bio: 'Cybersecurity Engineer | Ethical Hacker | CTF Player',
        headline: 'Security Engineer at SecureNet',
        location: 'Seattle, WA',
        githubUsername: 'mikethompson',
        skills: ['Python', 'Rust', 'Security', 'Penetration Testing', 'Linux'],
        interests: ['security', 'ctf', 'linux'],
        socialLinks: { github: 'https://github.com/mikethompson' },
        points: 445,
        codingStats: {
          github: { public_repos: 20, followers: 390, top_repos: [{ name: 'ctf-toolkit', stars: 890, forks: 200, language: 'Python' }] },
          leetcode: { totalSolved: 310, ranking: 32000, easySolved: 130, mediumSolved: 140, hardSolved: 40 },
          codeforces: { rating: 1780, maxRank: 'candidate master', ratingHistory: [{ newRating: 1500 }, { newRating: 1650 }, { newRating: 1780 }] },
          lastUpdated: new Date()
        }
      }
    ];

    const users = await User.insertMany(usersRaw);
    console.log(`👤 Seeded ${users.length} users`);

    // Set up follows (use updateOne to avoid re-triggering bcrypt pre-save hook)
    await Promise.all([
      User.updateOne({ _id: users[0]._id }, { $set: { followers: [users[1]._id, users[2]._id], following: [users[1]._id, users[3]._id] } }),
      User.updateOne({ _id: users[1]._id }, { $set: { followers: [users[0]._id, users[2]._id, users[3]._id], following: [users[0]._id, users[4]._id] } }),
      User.updateOne({ _id: users[2]._id }, { $set: { followers: [users[0]._id], following: [users[0]._id, users[1]._id] } }),
    ]);
    console.log('🤝 Set up follow relationships');

    // ─── 2. REPOS ────────────────────────────────────────────────────
    const repos = await Repo.insertMany([
      { owner: users[0]._id, name: 'react-hooks-lib', description: 'A collection of powerful custom React hooks', language: 'TypeScript', stargazers_count: 980, forks_count: 120, html_url: 'https://github.com/alexjohnson/react-hooks-lib', hasReadme: true },
      { owner: users[0]._id, name: 'node-api-boilerplate', description: 'Production-ready Node.js REST API boilerplate', language: 'JavaScript', stargazers_count: 450, forks_count: 85, html_url: 'https://github.com/alexjohnson/node-api-boilerplate', hasReadme: true },
      { owner: users[1]._id, name: 'ml-toolkit', description: 'Comprehensive ML utilities and model implementations', language: 'Python', stargazers_count: 1500, forks_count: 340, html_url: 'https://github.com/sarahchen/ml-toolkit', hasReadme: true },
      { owner: users[2]._id, name: 'spring-microservices', description: 'Microservices architecture with Spring Boot', language: 'Java', stargazers_count: 450, forks_count: 90, html_url: 'https://github.com/rajkumar/spring-microservices', hasReadme: true },
      { owner: users[3]._id, name: 'vue-component-lib', description: 'Beautiful reusable Vue.js components', language: 'Vue', stargazers_count: 720, forks_count: 150, html_url: 'https://github.com/emilyrod/vue-component-lib', hasReadme: true },
      { owner: users[4]._id, name: 'ctf-toolkit', description: 'Tools and scripts for CTF competitions', language: 'Python', stargazers_count: 890, forks_count: 200, html_url: 'https://github.com/mikethompson/ctf-toolkit', hasReadme: true },
    ]);
    console.log(`📦 Seeded ${repos.length} repos`);

    // ─── 3. POSTS ────────────────────────────────────────────────────
    const posts = await Post.insertMany([
      {
        user: users[0]._id, content: '🚀 Just released v2.0 of react-hooks-lib! Now with 15+ custom hooks for common patterns. Check it out!',
        tags: ['react', 'hooks', 'opensource'], isProject: true, techStack: ['React', 'TypeScript'],
        githubLink: 'https://github.com/alexjohnson/react-hooks-lib', likes: [users[1]._id, users[2]._id, users[3]._id],
        comments: [{ user: users[1]._id, content: 'This is amazing! Using it in production already 🔥' }, { user: users[3]._id, content: 'Great work Alex! The useLocalStorage hook is super useful.' }]
      },
      {
        user: users[1]._id, content: '💡 Pro tip: When training neural networks, always normalize your input data. I see so many beginners skip this step and wonder why their model isn\'t converging. Here\'s a quick example with NumPy...',
        tags: ['ml', 'python', 'deeplearning'], likes: [users[0]._id, users[2]._id, users[4]._id],
        comments: [{ user: users[0]._id, content: 'Great tip Sarah! Bookmarked this.' }]
      },
      {
        user: users[2]._id, content: '☁️ Successfully migrated our monolith to microservices on Kubernetes. The performance improvement is incredible — 3x faster response times and 99.99% uptime. AMA!',
        tags: ['backend', 'kubernetes', 'devops'], likes: [users[0]._id, users[1]._id],
        comments: [{ user: users[1]._id, content: 'How long did the migration take?' }, { user: users[2]._id, content: 'About 3 months with a team of 4. Worth every hour!' }]
      },
      {
        user: users[3]._id, content: '🎨 Just shipped a new dark mode for our design system. Built it using CSS custom properties (variables) — zero JavaScript needed! The trick is cascading variable overrides on the root element.',
        tags: ['frontend', 'css', 'design'], isProject: false, likes: [users[0]._id, users[4]._id],
        comments: [{ user: users[0]._id, content: 'CSS variables are underrated. Love this approach!' }]
      },
      {
        user: users[4]._id, content: '🔐 Found a critical XSS vulnerability in a popular npm package (responsibly disclosed). Always sanitize user inputs, even in trusted libraries. Full writeup on my blog.',
        tags: ['security', 'xss', 'nodejs'], likes: [users[0]._id, users[1]._id, users[2]._id],
        comments: [{ user: users[2]._id, content: 'Great find! Which package was it?' }, { user: users[4]._id, content: 'Waiting for the fix to be published before disclosing the name.' }]
      },
      {
        user: users[1]._id, content: '📊 After 890 LeetCode problems, here\'s what I learned: Hard problems aren\'t about memorizing solutions. They\'re about recognizing patterns. My top 5 patterns to master first: 1) Sliding Window, 2) Two Pointers, 3) BFS/DFS, 4) Dynamic Programming, 5) Binary Search.',
        tags: ['leetcode', 'dsa', 'competitive-coding'], likes: [users[0]._id, users[2]._id, users[3]._id, users[4]._id],
        comments: [{ user: users[0]._id, content: 'This is gold! Sharing with my team.' }]
      }
    ]);
    console.log(`📝 Seeded ${posts.length} posts`);

    // ─── 4. JOBS ─────────────────────────────────────────────────────
    const jobs = await Job.insertMany([
      { title: 'Senior React Developer', company: 'Google', type: 'Full-time', location: 'Mountain View, CA', salary: '$180k - $240k', description: 'Join our web platform team building next-gen developer tools with React and TypeScript.', link: 'https://careers.google.com', skills: ['React', 'TypeScript', 'GraphQL'], experienceLevel: 'Senior Level', remote: false, postedBy: users[0]._id },
      { title: 'ML Engineer Intern', company: 'OpenAI', type: 'Internship', location: 'San Francisco, CA', salary: '$8,000/mo', description: 'Work on cutting-edge language models and AI research projects.', link: 'https://openai.com/careers', skills: ['Python', 'PyTorch', 'TensorFlow'], experienceLevel: 'Entry Level', remote: false, postedBy: users[1]._id },
      { title: 'Backend Engineer', company: 'Stripe', type: 'Full-time', location: 'Remote', salary: '$150k - $200k', description: 'Build the financial infrastructure of the internet. Work on payment processing systems at scale.', link: 'https://stripe.com/jobs', skills: ['Go', 'Ruby', 'PostgreSQL', 'Kubernetes'], experienceLevel: 'Mid Level', remote: true, postedBy: users[2]._id },
      { title: 'Frontend Developer Intern', company: 'Figma', type: 'Internship', location: 'Remote', salary: '$6,500/mo', description: 'Help build the world\'s best design tool. Work on canvas rendering and real-time collaboration.', link: 'https://figma.com/careers', skills: ['React', 'WebGL', 'TypeScript'], experienceLevel: 'Entry Level', remote: true, postedBy: users[3]._id },
      { title: 'Security Engineer', company: 'Cloudflare', type: 'Full-time', location: 'Austin, TX', salary: '$160k - $220k', description: 'Protect millions of websites. Work on DDoS mitigation, WAF, and zero-trust security.', link: 'https://cloudflare.com/careers', skills: ['Rust', 'Go', 'Security', 'Networking'], experienceLevel: 'Senior Level', remote: false, postedBy: users[4]._id },
      { title: 'DevOps Engineer', company: 'Netflix', type: 'Full-time', location: 'Los Gatos, CA', salary: '$170k - $230k', description: 'Scale infrastructure that serves 200M+ subscribers. Own CI/CD pipelines and cloud infrastructure.', link: 'https://jobs.netflix.com', skills: ['AWS', 'Kubernetes', 'Terraform', 'Python'], experienceLevel: 'Senior Level', remote: false, postedBy: users[2]._id },
      { title: 'Full Stack Developer', company: 'Vercel', type: 'Full-time', location: 'Remote', salary: '$130k - $170k', description: 'Work on the deployment platform powering the modern web. Next.js, edge computing, and serverless.', link: 'https://vercel.com/careers', skills: ['Next.js', 'React', 'Node.js', 'TypeScript'], experienceLevel: 'Mid Level', remote: true, postedBy: users[0]._id },
      { title: 'Android Developer', company: 'Spotify', type: 'Full-time', location: 'Stockholm, Sweden', salary: '$120k - $160k', description: 'Build features for 500M+ Spotify users on Android. Work on music streaming and social features.', link: 'https://spotify.com/jobs', skills: ['Kotlin', 'Android', 'Jetpack Compose', 'MVVM'], experienceLevel: 'Mid Level', remote: false, postedBy: users[3]._id }
    ]);
    console.log(`💼 Seeded ${jobs.length} jobs`);

    // ─── 5. CHALLENGES ───────────────────────────────────────────────
    const challenges = await Challenge.insertMany([
      {
        title: 'Two Sum',
        description: 'Given an array of integers and a target, return the sum of the first two elements.',
        difficulty: 'Easy', points: 10,
        boilerplate: 'function solution(input) {\n  // input is [a, b]\n  const [a, b] = input;\n  // return a + b\n}',
        solution: 'a + b',
        testCases: [{ input: '[1, 2]', expected: '3' }, { input: '[10, 20]', expected: '30' }, { input: '[-5, 15]', expected: '10' }]
      },
      {
        title: 'Reverse a String',
        description: 'Write a function that takes a string and returns it reversed.',
        difficulty: 'Easy', points: 10,
        boilerplate: 'function solution(input) {\n  // input is a string\n  \n}',
        solution: 'input.split("").reverse().join("")',
        testCases: [{ input: '"hello"', expected: '"olleh"' }, { input: '"CodeSphere"', expected: '"erehpSedoC"' }]
      },
      {
        title: 'Palindrome Check',
        description: 'Return true if the input string is a palindrome, false otherwise.',
        difficulty: 'Medium', points: 20,
        boilerplate: 'function solution(input) {\n  // Check if input is a palindrome\n  \n}',
        solution: 'input === input.split("").reverse().join("")',
        testCases: [{ input: '"racecar"', expected: 'true' }, { input: '"hello"', expected: 'false' }, { input: '"level"', expected: 'true' }]
      },
      {
        title: 'FizzBuzz',
        description: 'Return "Fizz" if divisible by 3, "Buzz" if by 5, "FizzBuzz" if by both, else the number itself.',
        difficulty: 'Easy', points: 10,
        boilerplate: 'function solution(input) {\n  // input is a number\n  \n}',
        solution: 'input % 15 === 0 ? "FizzBuzz" : input % 3 === 0 ? "Fizz" : input % 5 === 0 ? "Buzz" : String(input)',
        testCases: [{ input: '15', expected: '"FizzBuzz"' }, { input: '9', expected: '"Fizz"' }, { input: '10', expected: '"Buzz"' }, { input: '7', expected: '"7"' }]
      },
      {
        title: 'Find Maximum in Array',
        description: 'Given an array of numbers, return the maximum value.',
        difficulty: 'Easy', points: 10,
        boilerplate: 'function solution(input) {\n  // input is an array of numbers\n  \n}',
        solution: 'Math.max(...input)',
        testCases: [{ input: '[3, 1, 4, 1, 5, 9, 2, 6]', expected: '9' }, { input: '[-1, -5, -3]', expected: '-1' }]
      },
      {
        title: 'Count Vowels',
        description: 'Return the number of vowels (a, e, i, o, u) in a given string.',
        difficulty: 'Easy', points: 10,
        boilerplate: 'function solution(input) {\n  // Count vowels in input string\n  \n}',
        solution: '(input.match(/[aeiou]/gi) || []).length',
        testCases: [{ input: '"hello world"', expected: '3' }, { input: '"CodeSphere"', expected: '4' }]
      },
      {
        title: 'Fibonacci Number',
        description: 'Return the nth Fibonacci number. F(0)=0, F(1)=1, F(n)=F(n-1)+F(n-2).',
        difficulty: 'Medium', points: 20,
        boilerplate: 'function solution(input) {\n  // input is n\n  \n}',
        solution: 'n<=1 ? n : fib(n-1)+fib(n-2)',
        testCases: [{ input: '0', expected: '0' }, { input: '6', expected: '8' }, { input: '10', expected: '55' }]
      },
      {
        title: 'Binary Search',
        description: 'Implement binary search. Input is [sortedArray, target]. Return the index or -1.',
        difficulty: 'Medium', points: 25,
        boilerplate: 'function solution(input) {\n  const [arr, target] = input;\n  let left = 0, right = arr.length - 1;\n  // implement binary search\n}',
        solution: 'binary search returning index',
        testCases: [{ input: '[[1,3,5,7,9], 5]', expected: '2' }, { input: '[[2,4,6,8], 5]', expected: '-1' }]
      },
      {
        title: 'Balanced Parentheses',
        description: 'Check if a string of parentheses is balanced. Return true or false.',
        difficulty: 'Hard', points: 50,
        boilerplate: 'function solution(input) {\n  // input is a string of brackets\n  \n}',
        solution: 'stack-based approach',
        testCases: [{ input: '"()[]{}"', expected: 'true' }, { input: '"(]"', expected: 'false' }, { input: '"{[]}"', expected: 'true' }]
      }
    ]);
    console.log(`🏆 Seeded ${challenges.length} challenges`);

    // Mark some challenges as solved
    await Promise.all([
      Challenge.updateOne({ _id: challenges[0]._id }, { $set: { solvedBy: [{ user: users[0]._id }, { user: users[1]._id }, { user: users[2]._id }] } }),
      Challenge.updateOne({ _id: challenges[1]._id }, { $set: { solvedBy: [{ user: users[0]._id }, { user: users[1]._id }] } }),
      Challenge.updateOne({ _id: challenges[2]._id }, { $set: { solvedBy: [{ user: users[1]._id }] } }),
    ]);

    // ─── 6. CHATS & MESSAGES ─────────────────────────────────────────
    const chat1 = await Chat.create({ chatName: 'Alex & Sarah', isGroupChat: false, users: [users[0]._id, users[1]._id] });
    const chat2 = await Chat.create({ chatName: 'Dev Squad', isGroupChat: true, users: [users[0]._id, users[1]._id, users[2]._id, users[3]._id], groupAdmin: users[0]._id });

    const messages = await Message.insertMany([
      { sender: users[0]._id, content: 'Hey Sarah! Loved your ML post. Can you share the notebook?', chat: chat1._id },
      { sender: users[1]._id, content: 'Sure! I\'ll push it to GitHub tonight. Glad you found it useful!', chat: chat1._id },
      { sender: users[0]._id, content: 'Thanks! BTW, have you tried the new react-hooks-lib v2?', chat: chat1._id },
      { sender: users[1]._id, content: 'Not yet but it\'s on my list. I heard useAsync is really well done.', chat: chat1._id },
      { sender: users[0]._id, content: 'Hey everyone! Welcome to the Dev Squad group 🚀', chat: chat2._id },
      { sender: users[2]._id, content: 'Thanks for adding me! Great to connect with you all.', chat: chat2._id },
      { sender: users[3]._id, content: 'This is awesome! We should do a weekly code review session.', chat: chat2._id },
    ]);

    chat1.latestMessage = messages[3]._id;
    chat2.latestMessage = messages[6]._id;
    await Promise.all([chat1.save(), chat2.save()]);
    console.log(`💬 Seeded 2 chats and ${messages.length} messages`);

    // ─── 7. NOTIFICATIONS ────────────────────────────────────────────
    await Notification.insertMany([
      { recipient: users[0]._id, sender: users[1]._id, type: 'like', post: posts[0]._id },
      { recipient: users[0]._id, sender: users[2]._id, type: 'like', post: posts[0]._id },
      { recipient: users[0]._id, sender: users[1]._id, type: 'comment', post: posts[0]._id },
      { recipient: users[0]._id, sender: users[1]._id, type: 'follow' },
      { recipient: users[1]._id, sender: users[0]._id, type: 'like', post: posts[1]._id },
      { recipient: users[1]._id, sender: users[3]._id, type: 'follow' },
      { recipient: users[2]._id, sender: users[0]._id, type: 'like', post: posts[2]._id },
    ]);
    console.log('🔔 Seeded notifications');

    console.log('\n✅ ===== DATABASE SEEDED SUCCESSFULLY =====');
    console.log('\n📋 Test Accounts (all use password: password123):');
    console.log('   alex@codesphere.dev    → Full Stack Engineer');
    console.log('   sarah@codesphere.dev   → ML Engineer');
    console.log('   raj@codesphere.dev     → Backend Engineer');
    console.log('   emily@codesphere.dev   → Frontend Developer');
    console.log('   mike@codesphere.dev    → Security Engineer');
    console.log('==========================================\n');

    process.exit(0);
  } catch (err) {
    console.error('❌ Seed Error:', err.message);
    process.exit(1);
  }
};

seed();
