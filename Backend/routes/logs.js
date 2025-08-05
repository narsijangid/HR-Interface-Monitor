const express = require('express');
const router = express.Router();
const InterfaceLog = require('../models/InterfaceLog');


router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 50,
      interfaceName,
      integrationKey,
      status,
      severity,
      startDate,
      endDate,
      search
    } = req.query;

   
    let query = {};

   
    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) query.timestamp.$gte = new Date(startDate);
      if (endDate) query.timestamp.$lte = new Date(endDate);
    }

 
    if (interfaceName) query.interfaceName = new RegExp(interfaceName, 'i');
    if (integrationKey) query.integrationKey = new RegExp(integrationKey, 'i');
    if (status) query.status = status;
    if (severity) query.severity = severity;

   
    if (search) {
      query.$or = [
        { interfaceName: new RegExp(search, 'i') },
        { integrationKey: new RegExp(search, 'i') },
        { message: new RegExp(search, 'i') }
      ];
    }

  
    const logs = await InterfaceLog.find(query)
      .sort({ timestamp: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

  
    const totalCount = await InterfaceLog.countDocuments(query);

    res.json({
      logs,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: page,
      totalCount
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


router.get('/:id', async (req, res) => {
  try {
    const log = await InterfaceLog.findById(req.params.id);
    if (!log) return res.status(404).json({ error: 'Log not found' });
    res.json(log);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


router.post('/', async (req, res) => {
  try {
    const log = new InterfaceLog(req.body);
    await log.save();
    res.status(201).json(log);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});


router.put('/:id', async (req, res) => {
  try {
    const log = await InterfaceLog.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!log) return res.status(404).json({ error: 'Log not found' });
    res.json(log);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});


router.delete('/:id', async (req, res) => {
  try {
    const log = await InterfaceLog.findByIdAndDelete(req.params.id);
    if (!log) return res.status(404).json({ error: 'Log not found' });
    res.json({ message: 'Log deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


router.get('/filters/values', async (req, res) => {
  try {
    const [interfaceNames, integrationKeys, statuses, severities] = await Promise.all([
      InterfaceLog.distinct('interfaceName'),
      InterfaceLog.distinct('integrationKey'),
      InterfaceLog.distinct('status'),
      InterfaceLog.distinct('severity')
    ]);

    res.json({
      interfaceNames: interfaceNames.sort(),
      integrationKeys: integrationKeys.sort(),
      statuses: statuses.sort(),
      severities: severities.sort()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;