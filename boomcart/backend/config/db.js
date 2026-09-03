const mongoose = require('mongoose');
const dns = require('dns');

// Create a resolver that uses Google DNS (bypasses router DNS issues)
const resolver = new dns.Resolver();
resolver.setServers(['8.8.8.8', '8.8.4.4']);

const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI;
    const isSRV = uri.startsWith('mongodb+srv://');

    const options = {
      serverSelectionTimeoutMS: 15000,
      // Use Google DNS for hostname resolution (fixes local router DNS issues)
      lookup: (hostname, options, callback) => {
        resolver.resolve4(hostname, (err, addresses) => {
          if (err) return callback(err);
          callback(null, addresses.map(addr => ({ address: addr, family: 4 })));
        });
      },
    };

    // srvServiceName is only valid with mongodb+srv:// URIs
    if (isSRV) {
      options.srvServiceName = 'mongodb';
    }

    const conn = await mongoose.connect(uri, options);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (err) {
    console.error(`❌ MongoDB Error: ${err.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;

