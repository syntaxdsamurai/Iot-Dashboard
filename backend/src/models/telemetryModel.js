import mongoose from 'mongoose';

const telemetrySchema = new mongoose.Schema(
  {
    deviceId: {
      type: String,
      required: true,
      index: true,
    },
    siteId: {
      type: String,
      required: true,
      index: true,
    },
    // The main data payload
    data: {
      temperature: {
        type: Number,
        required: true,
      },
      humidity: {
        type: Number,
        required: true,
      },
      pressure: {
        type: Number,
      },
      // You can add more sensor readings here
    },
    // The timestamp from the sensor itself
    sensorTimestamp: {
      type: Date,
      required: true,
      index: true,
    },
  },
  {
    // Automatically adds createdAt and updatedAt fields
    timestamps: true,
    
    // We'll also create a TTL (Time-To-Live) index.
    // This tells MongoDB to automatically delete documents
    // after 30 days. This is critical for preventing
    // the database from growing indefinitely.
    indexes: [
      {
        createdAt: 1,
      },
    ],
    expireAfterSeconds: 30 * 24 * 60 * 60, // 30 days
  }
);

// Create a compound index for efficient querying by device and time
telemetrySchema.index({ deviceId: 1, sensorTimestamp: -1 });

const Telemetry = mongoose.model('Telemetry', telemetrySchema);

export default Telemetry;