const mongoose = require('mongoose');

let memoryServerInstance = null;

const connectDB = async () => {
  const mongoURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/medlocate';
  const preferMemory = process.env.USE_MEMORY_DB === 'true';

  if (!preferMemory) {
    try {
      console.log(`[Database] Attempting connection to MongoDB at: ${mongoURI}`);
      const conn = await mongoose.connect(mongoURI, {
        serverSelectionTimeoutMS: 3000
      });
      console.log(`[Database] Connected to external/local MongoDB: ${conn.connection.host}`);
      return conn;
    } catch (err) {
      console.warn(`[Database] Could not connect to external MongoDB: ${err.message}`);
      console.log(`[Database] Falling back to high-fidelity MongoDB In-Memory Server...`);
    }
  }

  try {
    const { MongoMemoryServer } = require('mongodb-memory-server');
    console.log(`[Database] Initializing MongoDB Memory Server...`);
    memoryServerInstance = await MongoMemoryServer.create();
    const uri = memoryServerInstance.getUri();
    const conn = await mongoose.connect(uri);
    console.log(`[Database] Connected to high-performance MongoDB instance at: ${uri}`);
    return conn;
  } catch (memErr) {
    console.error(`[Database] Critical error initializing MongoDB:`, memErr);
    process.exit(1);
  }
};

const disconnectDB = async () => {
  await mongoose.disconnect();
  if (memoryServerInstance) {
    await memoryServerInstance.stop();
  }
};

module.exports = { connectDB, disconnectDB };
