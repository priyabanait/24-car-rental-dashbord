import mongoose from 'mongoose';

const RentSlabSchema = new mongoose.Schema({
  trips: String,
  rentDay: Number,
  weeklyRent: Number,
  accidentalCover: { type: Number, default: 105 },
  acceptanceRate: { type: Number, default: 60 }
}, { _id: false });

const CarPlanSchema = new mongoose.Schema({
  name: { type: String, required: true },
  vehicleType: { type: String },
  securityDeposit: { type: Number, default: 0 },
  weeklyRentSlabs: { type: [RentSlabSchema], default: [] },
  dailyRentSlabs: { type: [RentSlabSchema], default: [] },
  status: { type: String, default: 'active' },
  category: { type: String, default: 'standard' },
  createdDate: String
}, { timestamps: true });

export default mongoose.models.CarPlan || mongoose.model('CarPlan', CarPlanSchema);
