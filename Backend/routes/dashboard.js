const express = require('express');
const router = express.Router();
const InterfaceLog = require('../models/InterfaceLog');


router.get('/summary', async (req, res) => {
  try {
    const { period = '24h' } = req.query;
    
 
    let startDate = new Date();
    switch (period) {
      case '1h':
        startDate.setHours(startDate.getHours() - 1);
        break;
      case '24h':
        startDate.setDate(startDate.getDate() - 1);
        break;
      case '7d':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(startDate.getDate() - 30);
        break;
      default:
        startDate.setDate(startDate.getDate() - 1);
    }


    const summary = await InterfaceLog.aggregate([
      {
        $match: {
          timestamp: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          avgDuration: { $avg: '$duration' },
          totalRecords: { $sum: '$recordsProcessed' }
        }
      },
      {
        $project: {
          status: '$_id',
          count: 1,
          avgDuration: { $round: ['$avgDuration', 2] },
          totalRecords: 1,
          _id: 0
        }
      }
    ]);


    const totalLogs = await InterfaceLog.countDocuments({
      timestamp: { $gte: startDate }
    });

    const recentFailures = await InterfaceLog.find({
      status: 'failed',
      timestamp: { $gte: startDate }
    })
    .sort({ timestamp: -1 })
    .limit(5)
    .select('interfaceName integrationKey message timestamp severity');

   
    const successCount = summary.find(s => s.status === 'success')?.count || 0;
    const failedCount = summary.find(s => s.status === 'failed')?.count || 0;
    const successRate = totalLogs > 0 ? ((successCount / totalLogs) * 100).toFixed(1) : 0;

    res.json({
      summary,
      totalLogs,
      successRate,
      recentFailures,
      period
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


router.get('/trends', async (req, res) => {
  try {
    const { period = '24h' } = req.query;
    
    let startDate = new Date();
    let interval;
    
    switch (period) {
      case '1h':
        startDate.setHours(startDate.getHours() - 1);
        interval = 5 * 60 * 1000; 
        break;
      case '24h':
        startDate.setDate(startDate.getDate() - 1);
        interval = 60 * 60 * 1000; 
        break;
      case '7d':
        startDate.setDate(startDate.getDate() - 7);
        interval = 6 * 60 * 60 * 1000; 
        break;
      case '30d':
        startDate.setDate(startDate.getDate() - 30);
        interval = 24 * 60 * 60 * 1000; // 1 day
        break;
      default:
        startDate.setDate(startDate.getDate() - 1);
        interval = 60 * 60 * 1000;
    }

    const trends = await InterfaceLog.aggregate([
      {
        $match: {
          timestamp: { $gte: startDate }
        }
      },
      {
        $addFields: {
          timeBucket: {
            $dateToString: {
              format: period === '1h' ? '%Y-%m-%d %H:%M' : 
                     period === '24h' ? '%Y-%m-%d %H:00' :
                     '%Y-%m-%d',
              date: '$timestamp'
            }
          }
        }
      },
      {
        $group: {
          _id: {
            timeBucket: '$timeBucket',
            status: '$status'
          },
          count: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: '$_id.timeBucket',
          statuses: {
            $push: {
              status: '$_id.status',
              count: '$count'
            }
          }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    // Transform data for frontend
    const transformedTrends = trends.map(trend => ({
      time: trend._id,
      success: trend.statuses.find(s => s.status === 'success')?.count || 0,
      failed: trend.statuses.find(s => s.status === 'failed')?.count || 0,
      warning: trend.statuses.find(s => s.status === 'warning')?.count || 0,
      running: trend.statuses.find(s => s.status === 'running')?.count || 0
    }));

    res.json({
      trends: transformedTrends,
      period
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/interfaces', async (req, res) => {
  try {
    const { period = '24h' } = req.query;
    
    let startDate = new Date();
    startDate.setDate(startDate.getDate() - (period === '7d' ? 7 : period === '30d' ? 30 : 1));

    const interfaceHealth = await InterfaceLog.aggregate([
      {
        $match: {
          timestamp: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: '$interfaceName',
          totalRuns: { $sum: 1 },
          successCount: {
            $sum: { $cond: [{ $eq: ['$status', 'success'] }, 1, 0] }
          },
          failedCount: {
            $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] }
          },
          avgDuration: { $avg: '$duration' },
          lastRun: { $max: '$timestamp' }
        }
      },
      {
        $project: {
          interfaceName: '$_id',
          totalRuns: 1,
          successCount: 1,
          failedCount: 1,
          successRate: {
            $cond: [
              { $gt: ['$totalRuns', 0] },
              { $multiply: [{ $divide: ['$successCount', '$totalRuns'] }, 100] },
              0
            ]
          },
          avgDuration: { $round: ['$avgDuration', 2] },
          lastRun: 1,
          _id: 0
        }
      },
      {
        $sort: { lastRun: -1 }
      }
    ]);

    res.json({
      interfaces: interfaceHealth,
      period
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;