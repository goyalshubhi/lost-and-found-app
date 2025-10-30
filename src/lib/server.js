'use strict';

import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import 'regenerator-runtime/runtime.js';
import logger from './logger.js';

import errorMiddleware from './middleware/error-middleware.js';
import loggerMiddleware from './middleware/logger-middleware.js';

import authRouter from '../router/auth-router.js';
import adminRouter from '../router/admin-router.js';
import itemRouter from '../router/items-router.js';
import twilioRouter from '../router/twilio-router.js';

// ✅ Load environment variables
dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);
let server = null;

// ✅ Middleware
app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(loggerMiddleware);

// ✅ Routes
app.use('/api/auth', authRouter);
app.use('/api/admin', adminRouter);
app.use('/api/items', itemRouter);
app.use('/api/twilio', twilioRouter);

// ✅ Global error handler
app.use((err, req, res, next) => {
  console.error('🔥 Unhandled Error:', err.stack || err.message);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message,
  });
});

// ✅ Error middleware
app.use(errorMiddleware);

// ✅ Start server with retry logic
const startServer = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI;

    if (!mongoURI) {
      throw new Error('❌ MONGODB_URI not found in environment variables.');
    }

    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
    });

    console.log('✅ MongoDB Connected Successfully');

    const tryListen = (port) => {
      if (port > 65535) {
        console.error('❌ No available ports below 65536.');
        process.exit(1);
      }

      server = app
        .listen(port, () => {
          console.log(`🚀 Server listening on http://localhost:${port}`);
        })
        .on('error', (err) => {
          if (err.code === 'EADDRINUSE') {
            console.log(`⚠️ Port ${port} in use, trying ${port + 1}...`);
            tryListen(port + 1);
          } else {
            throw err;
          }
        });
    };

    tryListen(PORT);
  } catch (err) {
    console.error('❌ MongoDB connection failed:', err.message);
    process.exit(1);
  }
};

// 🛑 Stop server
const stopServer = async () => {
  try {
    await mongoose.disconnect();
    if (server) {
      server.close(() => {
        logger.log(logger.INFO, 'Server stopped');
      });
    }
  } catch (err) {
    console.error('❌ Error while stopping server:', err.message);
  }
};

export { startServer, stopServer };
