require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { graphqlHTTP } = require('express-graphql');
const { buildSchema } = require('graphql');
const mongoose = require('mongoose');

// Create Express Server
const app = express();

const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:3000',
  'https://taskflow-recreation.vercel.app',
  'http://localhost:5173',
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
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
  type Query {
    tasks(status: String, searchTerm: String): [Task]
  }
  type Mutation {
    addTask(title: String!, description: String, status: String!, dueDate: String!, priority: String!): Task
    updateTask(id: ID!, title: String!, description: String, status: String!, dueDate: String!, priority: String!): Task
    deleteTask(id: ID!): Task
  }
`);

const root = {
  tasks: async ({ status, searchTerm }) => {
    try {
      await connectToDatabase();
      let query = {};
      if (status && status !== 'All') query.status = status;
      if (searchTerm) {
        query.$or = [
          { title: { $regex: searchTerm, $options: 'i' } },
          { description: { $regex: searchTerm, $options: 'i' } },
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
      const task = new Task({ title, description, status, dueDate, priority });
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
      const task = await Task.findByIdAndUpdate(
        id,
        { title, description, status, dueDate, priority },
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

// GraphQL Endpoint - simplified routing
app.use('/graphql', graphqlMiddleware);
app.use('/', graphqlMiddleware); // This will handle the root path for Vercel

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
