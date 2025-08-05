const mongoose = require('mongoose');

const interfaceLogSchema = new mongoose.Schema({
  interfaceName: {
    type: String,
    required: true,
    index: true
  },
  integrationKey: {
    type: String,
    required: true,
    index: true
  },
  status: {
    type: String,
    enum: ['success', 'failed', 'warning', 'running'],
    required: true,
    index: true
  },
  message: {
    type: String,
    required: true
  },
  severity: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  duration: {
    type: Number,
    default: 0
  },
  recordsProcessed: {
    type: Number,
    default: 0
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  },
  metadata: {
    sourceSystem: String,
    targetSystem: String,
    jobId: String,
    userId: String
  }
}, {
  timestamps: true
});


interfaceLogSchema.index({ interfaceName: 1, timestamp: -1 });
interfaceLogSchema.index({ integrationKey: 1, timestamp: -1 });
interfaceLogSchema.index({ status: 1, timestamp: -1 });
interfaceLogSchema.index({ timestamp: -1 });


interfaceLogSchema.virtual('formattedDuration').get(function() {
  if (this.duration < 1000) return `${this.duration}ms`;
  if (this.duration < 60000) return `${(this.duration / 1000).toFixed(1)}s`;
  return `${(this.duration / 60000).toFixed(1)}m`;
});

module.exports = mongoose.model('InterfaceLog', interfaceLogSchema);