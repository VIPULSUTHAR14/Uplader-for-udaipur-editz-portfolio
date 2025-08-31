import { MongoClient } from 'mongodb';

const uri = process.env.MONGOURI;
const options = {};

// Debug logging (remove in production)
console.log('MongoDB URI exists:', !!uri);
console.log('MongoDB URI starts with:', uri?.substring(0, 20) + '...');

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (!process.env.MONGOURI) {
  throw new Error('Please add your Mongo URI to .env.local');
}

if (process.env.NODE_ENV === 'development') {
  // In development mode, use a global variable so that the value
  // is preserved across module reloads caused by HMR (Hot Module Replacement).
  const globalWithMongo = global as typeof globalThis & { _mongoClientPromise?: Promise<MongoClient> };
  if (!globalWithMongo._mongoClientPromise) {
    client = new MongoClient(uri as string, options);
    globalWithMongo._mongoClientPromise = client.connect();
  }
  clientPromise = globalWithMongo._mongoClientPromise;
} else {
  // In production mode, it's best to not use a global variable.
  client = new MongoClient(uri as string, options);
  clientPromise = client.connect();
}

// Export a module-scoped MongoClient promise. By doing this in a
// separate module, the client can be shared across functions.
export default clientPromise;