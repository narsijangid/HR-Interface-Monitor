const mongoose = require('mongoose');
const InterfaceLog = require('../models/InterfaceLog');
require('dotenv').config();

const interfaceNames = [
  'SAP SuccessFactors Employee Sync',
  'SAP ECP Payroll Integration',
  'Workday HR Data Export',
  'AD User Provisioning',
  'Benefits Enrollment Sync',
  'Time Tracking Integration',
  'Performance Management Export',
  'Learning Management Sync',
  'Recruitment Data Import',
  'Compensation Update Feed'
];

const integrationKeys = [
  'SF-ECP-EMP-001',
  'ECP-PAYROLL-002',
  'WD-EXPORT-003',
  'AD-USER-004',
  'BENEFITS-005',
  'TIME-TRACK-006',
  'PERF-MGMT-007',
  'LEARN-SYNC-008',
  'RECRUIT-IMP-009',
  'COMP-FEED-010'
];

const statuses = ['success', 'failed', 'warning', 'running'];
const severities = ['low', 'medium', 'high', 'critical'];

const messages = {
  success: [
    'Successfully processed 1,247 employee records',
    'Payroll data synchronized with 99.8% accuracy',
    'User provisioning completed for 45 new hires',
    'Benefits enrollment updated for Q3 2024',
    'Performance ratings exported to external system'
  ],
  failed: [
    'Connection timeout to SAP SuccessFactors API',
    'Invalid data format in employee records',
    'Authentication failed for Workday integration',
    'Database connection pool exhausted',
    'Required field missing in payroll data'
  ],
  warning: [
    'Partial data sync completed with 3 skipped records',
    'API rate limit approaching threshold',
    'Duplicate employee ID detected and handled',
    'Slow response times detected from external system',
    'Data validation warnings for 12 records'
  ],
  running: [
    'Processing employee data batch 3 of 5',
    'Synchronizing benefits enrollment changes',
    'Validating payroll calculation results',
    'Exporting performance review data',
    'Updating user access permissions'
  ]
};

function generateRandomLog() {
  const status = statuses[Math.floor(Math.random() * statuses.length)];
  const interfaceName = interfaceNames[Math.floor(Math.random() * interfaceNames.length)];
  const integrationKey = integrationKeys[interfaceNames.indexOf(interfaceName)];
  
  const now = new Date();
  const randomDays = Math.floor(Math.random() * 30); // Last 30 days
  const randomHours = Math.floor(Math.random() * 24);
  const randomMinutes = Math.floor(Math.random() * 60);
  
  now.setDate(now.getDate() - randomDays);
  now.setHours(randomHours, randomMinutes);

  return {
    interfaceName,
    integrationKey,
    status,
    message: messages[status][Math.floor(Math.random() * messages[status].length)],
    severity: severities[Math.floor(Math.random() * severities.length)],
    duration: Math.floor(Math.random() * 30000) + 1000, // 1-30 seconds
    recordsProcessed: Math.floor(Math.random() * 5000) + 100,
    timestamp: now,
    metadata: {
      sourceSystem: interfaceName.includes('SAP') ? 'SAP' : interfaceName.includes('Workday') ? 'Workday' : 'External',
      targetSystem: interfaceName.includes('ECP') ? 'SAP ECP' : 'Downstream System',
      jobId: `JOB-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      userId: `admin${Math.floor(Math.random() * 5) + 1}`
    }
  };
}

async function seedDatabase() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

 
    await InterfaceLog.deleteMany({});
    console.log('Cleared existing logs');

  
    const logs = [];
    const batchSize = 10000;
    const totalLogs = 500000;

    console.log('Generating seed data...');
    
    for (let i = 0; i < totalLogs; i += batchSize) {
      const batch = [];
      for (let j = 0; j < Math.min(batchSize, totalLogs - i); j++) {
        batch.push(generateRandomLog());
      }
      logs.push(...batch);
      
      if (logs.length >= batchSize || i + batchSize >= totalLogs) {
        await InterfaceLog.insertMany(logs);
        console.log(`Inserted ${Math.min(i + batchSize, totalLogs)} logs`);
        logs.length = 0;
      }
    }

    console.log(`Successfully seeded ${totalLogs} interface logs`);
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}


if (require.main === module) {
  seedDatabase();
}

module.exports = { seedDatabase };