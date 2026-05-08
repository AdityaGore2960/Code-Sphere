const { GoogleGenerativeAI } = require("@google/generative-ai");
const AgentHistory = require("../models/AgentHistory");
const User = require("../models/User");
const Post = require("../models/Post");
const Job = require("../models/Job");
const Challenge = require("../models/Challenge");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const processAgentTask = async (req, res) => {
  try {
    const { task } = req.body;
    const userId = req.user._id;

    if (!task) {
      return res.status(400).json({ message: "Task is required" });
    }

    // Fetch user history to "learn"
    const history = await AgentHistory.find({ user: userId }).sort({ createdAt: -1 }).limit(10);
    
    // Prepare context
    let historyContext = "";
    if (history.length > 0) {
      historyContext = "Previous interactions for context:\n" + 
        history.reverse().map(h => `User: ${h.task}\nAgent: ${h.response}`).join("\n\n");
    }

    // Fetch some general app data to help the agent
    const user = await User.findById(userId);
    const recentPosts = await Post.find().sort({ createdAt: -1 }).limit(3);
    const availableJobs = await Job.find().limit(3);
    const challenges = await Challenge.find().limit(3);

    const appState = {
      user: {
        username: user.username,
        skills: user.skills,
        points: user.points
      },
      recentPosts: recentPosts.map(p => ({ content: p.content.substring(0, 50) })),
      availableJobs: availableJobs.map(j => ({ title: j.title, company: j.company })),
      challenges: challenges.map(c => ({ title: c.title, difficulty: c.difficulty }))
    };

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const systemPrompt = `
      You are "CodeSphere AI", a highly intelligent and helpful AI agent integrated into the CodeSphere platform.
      CodeSphere is a social hub for developers, featuring job boards, coding challenges, and messaging.
      
      Your goal is to help users with any task within the application.
      You must learn from previous interactions provided in the context.
      
      Current App State:
      ${JSON.stringify(appState, null, 2)}
      
      ${historyContext}
      
      User's current task: ${task}
      
      Respond in a helpful, professional, yet friendly tone. If the task involves something you can't directly do, explain how the user can do it in the app.
      If you are suggesting a feature, mention why it suits the user based on their skills or history.
    `;

    const result = await model.generateContent(systemPrompt);
    const response = result.response.text();

    // Save history for learning
    const newHistory = new AgentHistory({
      user: userId,
      task,
      response
    });
    await newHistory.save();

    res.json({ response });

  } catch (error) {
    console.error("Agent Error:", error);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};

const getAgentHistory = async (req, res) => {
  try {
    const history = await AgentHistory.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(20);
    res.json(history);
  } catch (error) {
    res.status(500).json({ message: "Error fetching history", error: error.message });
  }
};

module.exports = {
  processAgentTask,
  getAgentHistory
};
