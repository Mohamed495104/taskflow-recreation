require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { graphqlHTTP } = require("express-graphql");
const { buildSchema } = require("graphql");
const mongoose = require("mongoose");
const rateLimit = require("express-rate-limit");
const validator = require("validator");
const sanitize = require("mongo-sanitize");

// ---------------------------
// CREATE EXPRESS APP
// ---------------------------
const app = express();

// Required for Render & Vercel (reverse proxy)
app.set("trust proxy", 1);

// ---------------------------
// RATE LIMITING
// ---------------------------
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many requests, try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});

// ---------------------------
// ALLOWED ORIGINS (IMPORTANT: NO TRAILING SLASHES)
// ---------------------------
const allowedOrigins = [
  "http://localhost:5173",
  "https://taskflow-recreation.vercel.app",
  "https://taskflow-recreation.onrender.com"
];

// ---------------------------
// CORS FIX (FINAL PRODUCTION SAFE VERSION)
// ---------------------------
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true); // Allow Postman / server-to-server

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      console.warn("🚫 CORS blocked:", origin);
      return callback(null, false); // DO NOT THROW ERROR
    },
    credentials: true,
  })
);

// Preflight handling
app.options("*", cors());

// ---------------------------
// EXPRESS JSON
// ---------------------------
app.use(express.json());

// ---------------------------
// MONGODB CONNECTION
// ---------------------------
let isConnected = false;

const connectToDatabase = async () => {
  if (isConnected && mongoose.connection.readyState === 1) return;

  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: 1,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    isConnected = true;
    console.log("MongoDB connected");
  } catch (err) {
    console.error("MongoDB connection error:", err);
    isConnected = false;
    throw err;
  }
};

// ---------------------------
// HEALTH CHECK (DO NOT MOUNT GRAPHQL HERE)
// ---------------------------
app.get("/", (req, res) => {
  res.json({
    message: "GraphQL backend running",
    graphql: "/graphql",
  });
});

// ------------------------------------------------------------
// YOUR MONGOOSE SCHEMAS (UNCHANGED)
// ------------------------------------------------------------

// Task Schema
const TaskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  status: { type: String, enum: ["Pending", "In Progress", "Completed"], default: "Pending" },
  dueDate: { type: String, required: true },
  priority: { type: String, enum: ["Low", "Medium", "High"], default: "Medium" },
}, { timestamps: true });

const Task = mongoose.models.Task || mongoose.model("Task", TaskSchema);

// Recreation Stats
const RecreationStatsSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  gameKey: { type: String, required: true, enum: ["ticTacToe", "hangman"] },
  wins: { type: Number, default: 0 },
  lastUpdated: { type: Date, default: Date.now },
}, { timestamps: true });

RecreationStatsSchema.index({ userId: 1, gameKey: 1 }, { unique: true });

const RecreationStats = mongoose.models.RecreationStats || mongoose.model("RecreationStats", RecreationStatsSchema);

// TicTacToe Matches
const TicTacToeMatchSchema = new mongoose.Schema({
  userId: String,
  xName: String,
  oName: String,
  winner: String,
  mode: String,
  finishedAt: { type: Date, default: Date.now },
}, { timestamps: true });

const TicTacToeMatch = mongoose.models.TicTacToeMatch || mongoose.model("TicTacToeMatch", TicTacToeMatchSchema);

// Hangman Game Schema
const HangmanGameSchema = new mongoose.Schema({
  userId: String,
  word: String,
  category: String,
  hint: String,
  result: String,
  hintUsed: Boolean,
  wrongGuesses: Number,
  totalGuesses: Number,
  timeElapsed: Number,
  timeRemaining: Number,
  score: Number,
  difficulty: String,
  finishedAt: { type: Date, default: Date.now },
}, { timestamps: true });

const HangmanGame = mongoose.models.HangmanGame || mongoose.model("HangmanGame", HangmanGameSchema);

// ------------------------------------------------------------
// GRAPHQL SCHEMA
// ------------------------------------------------------------
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

// ------------------------------------------------------------
// GRAPHQL RESOLVERS (UNCHANGED)
// ------------------------------------------------------------
const root = {
  tasks: async ({ status, searchTerm }) => {
    await connectToDatabase();
    let query = {};

    if (status && status !== "All") query.status = status;

    if (searchTerm) {
      const sanitizedSearch = sanitize(validator.escape(searchTerm));
      query.$or = [
        { title: { $regex: sanitizedSearch, $options: "i" } },
        { description: { $regex: sanitizedSearch, $options: "i" } },
      ];
    }

    const tasks = await Task.find(query);
    return tasks
      .filter(t => t.dueDate)
      .map(t => ({
        id: t._id.toString(),
        title: t.title,
        description: t.description,
        status: t.status,
        dueDate: t.dueDate,
        priority: t.priority,
        createdAt: t.createdAt?.toISOString(),
        updatedAt: t.updatedAt?.toISOString(),
      }));
  },

  addTask: async ({ title, description, status, dueDate, priority }) => {
    await connectToDatabase();
    const task = new Task({
      title: sanitize(title),
      description: sanitize(description),
      status,
      dueDate,
      priority,
    });
    const saved = await task.save();
    return {
      id: saved._id.toString(),
      ...saved._doc,
      createdAt: saved.createdAt.toISOString(),
      updatedAt: saved.updatedAt.toISOString(),
    };
  },

  updateTask: async ({ id, title, description, status, dueDate, priority }) => {
    await connectToDatabase();
    const task = await Task.findByIdAndUpdate(
      id,
      {
        title: sanitize(title),
        description: sanitize(description),
        status,
        dueDate,
        priority,
      },
      { new: true }
    );
    return {
      id: task._id.toString(),
      ...task._doc,
      createdAt: task.createdAt.toISOString(),
      updatedAt: task.updatedAt.toISOString(),
    };
  },

  deleteTask: async ({ id }) => {
    await connectToDatabase();
    const deleted = await Task.findByIdAndDelete(id);
    return {
      id: deleted._id.toString(),
      ...deleted._doc,
      createdAt: deleted.createdAt.toISOString(),
      updatedAt: deleted.updatedAt.toISOString(),
    };
  },

  recreationStats: async ({ userId, gameKey }) => {
    await connectToDatabase();
    const stats = await RecreationStats.findOne({ userId, gameKey });

    if (!stats)
      return {
        id: "new",
        userId,
        gameKey,
        wins: 0,
        lastUpdated: new Date().toISOString(),
      };

    return {
      id: stats._id.toString(),
      ...stats._doc,
      lastUpdated: stats.lastUpdated.toISOString(),
    };
  },

  incrementWins: async ({ userId, gameKey }) => {
    await connectToDatabase();
    const stats = await RecreationStats.findOneAndUpdate(
      { userId, gameKey },
      {
        $inc: { wins: 1 },
        $set: { lastUpdated: new Date() },
      },
      { upsert: true, new: true }
    );

    return {
      id: stats._id.toString(),
      ...stats._doc,
      lastUpdated: stats.lastUpdated.toISOString(),
    };
  },

  logTicTacToeMatch: async ({ userId, xName, oName, winner, mode }) => {
    await connectToDatabase();
    const match = new TicTacToeMatch({
      userId,
      xName: xName || "Player X",
      oName: oName || "Player O",
      winner,
      mode,
      finishedAt: new Date(),
    });
    const saved = await match.save();
    return {
      id: saved._id.toString(),
      ...saved._doc,
      finishedAt: saved.finishedAt.toISOString(),
    };
  },

  logHangmanGame: async (args) => {
    await connectToDatabase();
    const game = new HangmanGame({
      ...args,
      finishedAt: new Date(),
    });
    const saved = await game.save();
    return {
      id: saved._id.toString(),
      ...saved._doc,
      finishedAt: saved.finishedAt.toISOString(),
    };
  },
};

// ------------------------------------------------------------
// GRAPHQL MIDDLEWARE
// ------------------------------------------------------------
const graphqlMiddleware = graphqlHTTP(async () => {
  await connectToDatabase();
  return {
    schema,
    rootValue: root,
    graphiql: true,
  };
});

// ------------------------------------------------------------
// GRAPHQL ENDPOINT
// ------------------------------------------------------------
app.use("/graphql", limiter, graphqlMiddleware);

// ------------------------------------------------------------
// LOCAL SERVER (Render loads as module, so skip)
// ------------------------------------------------------------
if (require.main === module) {
  const PORT = process.env.PORT || 5000;
  connectToDatabase().then(() => {
    app.listen(PORT, () =>
      console.log(`🚀 Server running at http://localhost:${PORT}/graphql`)
    );
  });
}

module.exports = app;
