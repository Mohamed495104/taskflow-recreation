require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { graphqlHTTP } = require('express-graphql');
const { buildSchema } = require('graphql');
const mongoose = require('mongoose');
const rateLimit = require('express-rate-limit');
const validator = require('validator');
const sanitize = require('mongo-sanitize');


// Create Express Server
const app = express();

app.set("trust proxy", 1);  
// Rate Limiting for security
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

const allowedOrigins = [
  "http://localhost:5173",
  "https://taskflow-recreation.vercel.app/",
  "https://taskflow-recreation.onrender.com"
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (Render, Postman, server-to-server)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.warn("CORS blocked origin:", origin);
        callback(null, false); // DO NOT throw error
      }
    },
    credentials: true,
  })
);

app.use(express.json());

// MongoDB Connection with serverless optimization
let isConnected = false;

const connectToDatabase = async () => {
  if (isConnected && mongoose.connection.readyState === 1) {
    return;
  }
  
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: 1, // Limit connection pool for serverless
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    isConnected = true;
    console.log('MongoDB connected');
  } catch (err) {
    console.error('MongoDB connection error:', err);
    isConnected = false;
    throw err;
  }
};

// Test Route
app.get('/', (req, res) => res.send('GraphQL Server is running'));

// Define Mongoose Schema
const TaskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  status: { type: String, required: true, enum: ['Pending', 'In Progress', 'Completed'], default: 'Pending' },
  dueDate: { type: String, required: true },
  priority: { type: String, required: true, enum: ['Low', 'Medium', 'High'], default: 'Medium' },
}, { timestamps: true });

// Prevent model re-compilation in serverless environment
const Task = mongoose.models.Task || mongoose.model('Task', TaskSchema);

// Recreation Stats Schema (migrated from Firestore)
const RecreationStatsSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  gameKey: { type: String, required: true, enum: ['ticTacToe', 'hangman'] },
  wins: { type: Number, default: 0 },
  lastUpdated: { type: Date, default: Date.now }
}, { timestamps: true });

// Compound index for efficient queries
RecreationStatsSchema.index({ userId: 1, gameKey: 1 }, { unique: true });

const RecreationStats = mongoose.models.RecreationStats || mongoose.model('RecreationStats', RecreationStatsSchema);

// TicTacToe Match Schema (migrated from Firestore)
const TicTacToeMatchSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  xName: { type: String, default: 'Player X' },
  oName: { type: String, default: 'Player O' },
  winner: { type: String, enum: ['X', 'O', 'draw'], required: true },
  mode: { type: String, enum: ['cpu', 'local-2p'], required: true },
  finishedAt: { type: Date, default: Date.now }
}, { timestamps: true });

const TicTacToeMatch = mongoose.models.TicTacToeMatch || mongoose.model('TicTacToeMatch', TicTacToeMatchSchema);

// Hangman Game Schema (migrated from Firestore)
const HangmanGameSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  word: { type: String, required: true },
  category: { type: String, required: true },
  hint: { type: String },
  result: { type: String, enum: ['won', 'lost', 'timeout'], required: true },
  hintUsed: { type: Boolean, default: false },
  wrongGuesses: { type: Number, required: true },
  totalGuesses: { type: Number, required: true },
  timeElapsed: { type: Number },
  timeRemaining: { type: Number },
  score: { type: Number, default: 0 },
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'] },
  finishedAt: { type: Date, default: Date.now }
}, { timestamps: true });

const HangmanGame = mongoose.models.HangmanGame || mongoose.model('HangmanGame', HangmanGameSchema);

// GraphQL Schema
const schema = buildSchema(`
  type Task {
    id: ID!
    title: String!
    description: String
    status: String!
    dueDate: String  
    priority: String!
    createdAt: String
    updatedAt: String
  }
  
  type RecreationStats {
    id: ID!
    userId: String!
    gameKey: String!
    wins: Int!
    lastUpdated: String
  }
  
  type TicTacToeMatch {
    id: ID!
    userId: String!
    xName: String!
    oName: String!
    winner: String!
    mode: String!
    finishedAt: String
  }
  
  type HangmanGame {
    id: ID!
    userId: String!
    word: String!
    category: String!
    hint: String
    result: String!
    hintUsed: Boolean!
    wrongGuesses: Int!
    totalGuesses: Int!
    timeElapsed: Int
    timeRemaining: Int
    score: Int!
    difficulty: String
    finishedAt: String
  }
  
  type Query {
    tasks(status: String, searchTerm: String): [Task]
    recreationStats(userId: String!, gameKey: String!): RecreationStats
  }
  
  type Mutation {
    addTask(title: String!, description: String, status: String!, dueDate: String!, priority: String!): Task
    updateTask(id: ID!, title: String!, description: String, status: String!, dueDate: String!, priority: String!): Task
    deleteTask(id: ID!): Task
    
    incrementWins(userId: String!, gameKey: String!): RecreationStats
    logTicTacToeMatch(userId: String!, xName: String, oName: String, winner: String!, mode: String!): TicTacToeMatch
    logHangmanGame(userId: String!, word: String!, category: String!, hint: String, result: String!, hintUsed: Boolean!, wrongGuesses: Int!, totalGuesses: Int!, timeElapsed: Int, timeRemaining: Int, score: Int!, difficulty: String): HangmanGame
  }
`);

const root = {
  tasks: async ({ status, searchTerm }) => {
    try {
      await connectToDatabase();
      let query = {};
      if (status && status !== 'All') query.status = status;
      if (searchTerm) {
        // Sanitize search term to prevent injection
        const sanitizedSearch = sanitize(validator.escape(searchTerm));
        query.$or = [
          { title: { $regex: sanitizedSearch, $options: 'i' } },
          { description: { $regex: sanitizedSearch, $options: 'i' } },
        ];
      }
      const tasks = await Task.find(query);
      return tasks
        .filter(task => task.dueDate)
        .map(task => ({
          id: task._id.toString(),
          title: task.title || '',
          description: task.description || '',
          status: task.status || 'Pending',
          dueDate: task.dueDate,
          priority: task.priority || 'Medium',
          createdAt: task.createdAt?.toISOString(),
          updatedAt: task.updatedAt?.toISOString(),
        }));
    } catch (err) {
      console.error('Error in tasks resolver:', err);
      throw new Error('Failed to fetch tasks');
    }
  },

  addTask: async ({ title, description, status, dueDate, priority }) => {
    try {
      await connectToDatabase();
      // Sanitize inputs
      const sanitizedTitle = sanitize(title);
      const sanitizedDescription = sanitize(description);
      
      const task = new Task({ 
        title: sanitizedTitle, 
        description: sanitizedDescription, 
        status, 
        dueDate, 
        priority 
      });
      const savedTask = await task.save();
      return {
        id: savedTask._id.toString(),
        title: savedTask.title,
        description: savedTask.description,
        status: savedTask.status,
        dueDate: savedTask.dueDate,
        priority: savedTask.priority,
        createdAt: savedTask.createdAt?.toISOString(),
        updatedAt: savedTask.updatedAt?.toISOString(),
      };
    } catch (err) {
      console.error('Error in addTask resolver:', err);
      throw new Error('Failed to add task');
    }
  },

  updateTask: async ({ id, title, description, status, dueDate, priority }) => {
    try {
      await connectToDatabase();
      // Sanitize inputs
      const sanitizedTitle = sanitize(title);
      const sanitizedDescription = sanitize(description);
      
      const task = await Task.findByIdAndUpdate(
        id,
        { title: sanitizedTitle, description: sanitizedDescription, status, dueDate, priority },
        { new: true }
      );
      if (!task) {
        throw new Error('Task not found');
      }
      return {
        id: task._id.toString(),
        title: task.title,
        description: task.description,
        status: task.status,
        dueDate: task.dueDate,
        priority: task.priority,
        createdAt: task.createdAt?.toISOString(),
        updatedAt: task.updatedAt?.toISOString(),
      };
    } catch (err) {
      console.error('Error in updateTask resolver:', err);
      throw new Error('Failed to update task');
    }
  },

  deleteTask: async ({ id }) => {
    try {
      await connectToDatabase();
      const deletedTask = await Task.findByIdAndDelete(id);
      if (!deletedTask) {
        throw new Error('Task not found');
      }
      return {
        id: deletedTask._id.toString(),
        title: deletedTask.title,
        description: deletedTask.description,
        status: deletedTask.status,
        dueDate: deletedTask.dueDate,
        priority: deletedTask.priority,
        createdAt: deletedTask.createdAt?.toISOString(),
        updatedAt: deletedTask.updatedAt?.toISOString(),
      };
    } catch (err) {
      console.error('Error in deleteTask resolver:', err);
      throw new Error('Failed to delete task');
    }
  },

  // Recreation Stats Resolvers
  recreationStats: async ({ userId, gameKey }) => {
    try {
      await connectToDatabase();
      const stats = await RecreationStats.findOne({ userId, gameKey });
      if (!stats) {
        // Return default stats if not found
        return {
          id: 'new',
          userId,
          gameKey,
          wins: 0,
          lastUpdated: new Date().toISOString()
        };
      }
      return {
        id: stats._id.toString(),
        userId: stats.userId,
        gameKey: stats.gameKey,
        wins: stats.wins,
        lastUpdated: stats.lastUpdated?.toISOString()
      };
    } catch (err) {
      console.error('Error in recreationStats resolver:', err);
      throw new Error('Failed to fetch recreation stats');
    }
  },

  incrementWins: async ({ userId, gameKey }) => {
    try {
      await connectToDatabase();
      // Use upsert to create if doesn't exist, increment if exists
      const stats = await RecreationStats.findOneAndUpdate(
        { userId, gameKey },
        { 
          $inc: { wins: 1 },
          $set: { lastUpdated: new Date() }
        },
        { upsert: true, new: true }
      );
      return {
        id: stats._id.toString(),
        userId: stats.userId,
        gameKey: stats.gameKey,
        wins: stats.wins,
        lastUpdated: stats.lastUpdated?.toISOString()
      };
    } catch (err) {
      console.error('Error in incrementWins resolver:', err);
      throw new Error('Failed to increment wins');
    }
  },

  logTicTacToeMatch: async ({ userId, xName, oName, winner, mode }) => {
    try {
      await connectToDatabase();
      const match = new TicTacToeMatch({
        userId,
        xName: xName || 'Player X',
        oName: oName || 'Player O',
        winner,
        mode,
        finishedAt: new Date()
      });
      const savedMatch = await match.save();
      return {
        id: savedMatch._id.toString(),
        userId: savedMatch.userId,
        xName: savedMatch.xName,
        oName: savedMatch.oName,
        winner: savedMatch.winner,
        mode: savedMatch.mode,
        finishedAt: savedMatch.finishedAt?.toISOString()
      };
    } catch (err) {
      console.error('Error in logTicTacToeMatch resolver:', err);
      throw new Error('Failed to log TicTacToe match');
    }
  },

  logHangmanGame: async ({ userId, word, category, hint, result, hintUsed, wrongGuesses, totalGuesses, timeElapsed, timeRemaining, score, difficulty }) => {
    try {
      await connectToDatabase();
      const game = new HangmanGame({
        userId,
        word,
        category,
        hint,
        result,
        hintUsed,
        wrongGuesses,
        totalGuesses,
        timeElapsed,
        timeRemaining,
        score,
        difficulty,
        finishedAt: new Date()
      });
      const savedGame = await game.save();
      return {
        id: savedGame._id.toString(),
        userId: savedGame.userId,
        word: savedGame.word,
        category: savedGame.category,
        hint: savedGame.hint,
        result: savedGame.result,
        hintUsed: savedGame.hintUsed,
        wrongGuesses: savedGame.wrongGuesses,
        totalGuesses: savedGame.totalGuesses,
        timeElapsed: savedGame.timeElapsed,
        timeRemaining: savedGame.timeRemaining,
        score: savedGame.score,
        difficulty: savedGame.difficulty,
        finishedAt: savedGame.finishedAt?.toISOString()
      };
    } catch (err) {
      console.error('Error in logHangmanGame resolver:', err);
      throw new Error('Failed to log Hangman game');
    }
  },
};

// GraphQL middleware
const graphqlMiddleware = graphqlHTTP(async (req) => {
  await connectToDatabase();
  return {
    schema,
    rootValue: root,
    graphiql: true,
  };
});

// GraphQL Endpoint with rate limiting
app.use('/graphql', limiter, graphqlMiddleware);
app.use('/', limiter, graphqlMiddleware); // This will handle the root path for Vercel

// Only start server locally
if (require.main === module) {
  const PORT = process.env.PORT || 5000;
  connectToDatabase().then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 Server running at http://localhost:${PORT}/graphql`);
    });
  });
}

module.exports = app;
