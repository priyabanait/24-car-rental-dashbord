import express from 'express';
import CarPlan from '../models/carPlan.js';

const router = express.Router();

// List all daily rent plans
router.get('/', async (req, res) => {
  try {
    const list = await CarPlan.find({ 
      dailyRentSlabs: { $exists: true, $ne: [] } 
    }).lean();
    res.json(list);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to load daily rent plans' });
  }
});

// Get single daily rent plan
router.get('/:id', async (req, res) => {
  try {
    const plan = await CarPlan.findById(req.params.id).lean();
    if (!plan || !plan.dailyRentSlabs || plan.dailyRentSlabs.length === 0) {
      return res.status(404).json({ message: 'Daily rent plan not found' });
    }
    res.json(plan);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to load daily rent plan' });
  }
});

// Create daily rent plan
router.post('/', async (req, res) => {
  try {
    const body = req.body;
    console.log('daily-rent-plans POST payload:', JSON.stringify(body).slice(0, 1000));
    
    const payload = {
      name: body.name || 'Daily Rent Plan',
      vehicleType: body.vehicleType || body.category || 'General',
      securityDeposit: body.securityDeposit || 0,
      weeklyRentSlabs: [], // Empty for daily plans
      dailyRentSlabs: Array.isArray(body.dailyRentSlabs) ? body.dailyRentSlabs : [],
      status: body.status || 'active',
      category: body.category || 'standard',
      createdDate: body.createdDate || new Date().toISOString()
    };

    const p = new CarPlan(payload);
    await p.save();
    console.log('daily-rent-plan saved id=', p._id);
    res.status(201).json(p);
  } catch (err) {
    console.error('daily-rent-plans POST error:', err);
    res.status(400).json({ message: 'Failed to create daily rent plan', error: err.message || String(err) });
  }
});

// Update daily rent plan
router.put('/:id', async (req, res) => {
  try {
    const body = req.body;
    const updateData = {
      ...body,
      dailyRentSlabs: Array.isArray(body.dailyRentSlabs) ? body.dailyRentSlabs : []
    };
    
    const updated = await CarPlan.findByIdAndUpdate(req.params.id, updateData, { new: true }).lean();
    if (!updated) return res.status(404).json({ message: 'Not found' });
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: 'Failed to update daily rent plan' });
  }
});

// Delete daily rent plan
router.delete('/:id', async (req, res) => {
  try {
    const removed = await CarPlan.findByIdAndDelete(req.params.id).lean();
    if (!removed) return res.status(404).json({ message: 'Not found' });
    res.json({ message: 'Deleted' });
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: 'Failed to delete daily rent plan' });
  }
});

export default router;
