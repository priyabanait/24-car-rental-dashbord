import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Car, Calendar, Clock, Shield, CheckCircle, IndianRupee, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

export default function DriverPlanSelection() {
  const navigate = useNavigate();
  const [planType, setPlanType] = useState('weekly'); // 'weekly' or 'daily'
  const [weeklyPlans, setWeeklyPlans] = useState([]);
  const [dailyPlans, setDailyPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [selectedRentSlab, setSelectedRentSlab] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const API_BASE = import.meta.env.VITE_API_BASE || 'https://udrive-backend-1hzo.vercel.app';

  useEffect(() => {
    // Check if driver is logged in
    const token = localStorage.getItem('driver_token');
    if (!token) {
      toast.error('Please login first');
      navigate('/drivers/login');
      return;
    }

    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    setLoading(true);
    try {
      const [weeklyRes, dailyRes] = await Promise.all([
        fetch(`${API_BASE}/api/weekly-rent-plans`),
        fetch(`${API_BASE}/api/daily-rent-plans`)
      ]);

      if (weeklyRes.ok) {
        const weeklyData = await weeklyRes.json();
        setWeeklyPlans(weeklyData);
      }

      if (dailyRes.ok) {
        const dailyData = await dailyRes.json();
        setDailyPlans(dailyData);
      }
    } catch (err) {
      console.error('Fetch plans error:', err);
      toast.error('Failed to load plans');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPlan = async () => {
    if (!selectedPlan) {
      toast.error('Please select a plan');
      return;
    }

    if (!selectedRentSlab) {
      toast.error('Please select a rent slab');
      return;
    }

    setSubmitting(true);
    try {
      const token = localStorage.getItem('driver_token');
      const rentSlabs = planType === 'weekly' ? selectedPlan.weeklyRentSlabs : selectedPlan.dailyRentSlabs;
      const res = await fetch(`${API_BASE}/api/driver-plan-selections`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          planId: selectedPlan._id,
          planName: selectedPlan.name,
          planType: planType,
          securityDeposit: selectedPlan.securityDeposit || 0,
          rentSlabs: rentSlabs || [],
          selectedRentSlab: selectedRentSlab
        })
      });

      const data = await res.json();

      if (res.ok) {
        toast.success('Plan selected successfully!');
        // Redirect to driver dashboard or confirmation page
        setTimeout(() => {
          navigate('/drivers/my-plans');
        }, 1500);
      } else {
        toast.error(data.message || 'Failed to select plan');
      }
    } catch (err) {
      console.error('Select plan error:', err);
      toast.error('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const currentPlans = planType === 'weekly' ? weeklyPlans : dailyPlans;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#001730] via-[#002D62] to-[#004AAD]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#001730] via-[#002D62] to-[#004AAD] p-4">
      <div className="max-w-6xl mx-auto py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate('/drivers/login')}
            className="flex items-center text-white hover:text-[#00C6FF] transition-colors"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back
          </button>
          <h1 className="text-3xl font-bold text-white text-center flex-1">Choose Your Plan</h1>
          <div className="w-20"></div>
        </div>

        {/* Plan Type Toggle */}
        <div className="flex justify-center mb-8">
          <div className="bg-white/10 backdrop-blur-lg rounded-lg p-2 inline-flex">
            <button
              onClick={() => setPlanType('weekly')}
              className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                planType === 'weekly'
                  ? 'bg-[#00C6FF] text-[#001730]'
                  : 'text-white hover:bg-white/10'
              }`}
            >
              <Calendar className="h-5 w-5 inline mr-2" />
              Weekly Plans
            </button>
            <button
              onClick={() => setPlanType('daily')}
              className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                planType === 'daily'
                  ? 'bg-[#00C6FF] text-[#001730]'
                  : 'text-white hover:bg-white/10'
              }`}
            >
              <Clock className="h-5 w-5 inline mr-2" />
              Daily Plans
            </button>
          </div>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {currentPlans.map((plan) => {
            const rentSlabs = planType === 'weekly' ? plan.weeklyRentSlabs : plan.dailyRentSlabs;
            return (
            <div
              key={plan._id}
              onClick={() => {
                setSelectedPlan(plan);
                setSelectedRentSlab(null); // Reset rent slab when changing plan
              }}
              className={`bg-white/10 backdrop-blur-lg rounded-2xl p-6 cursor-pointer transition-all border-2 ${
                selectedPlan?._id === plan._id
                  ? 'border-[#00C6FF] shadow-xl shadow-[#00C6FF]/20 scale-105'
                  : 'border-white/20 hover:border-white/40'
              }`}
            >
              {/* Plan Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-[#00C6FF]/20 rounded-lg">
                  <Car className="h-8 w-8 text-[#00C6FF]" />
                </div>
                {selectedPlan?._id === plan._id && (
                  <CheckCircle className="h-8 w-8 text-[#00C6FF]" />
                )}
              </div>

              {/* Plan Name */}
              <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>

              {/* Security Deposit */}
              <div className="bg-white/10 rounded-lg p-4 mb-4">
                <div className="flex items-center justify-between">
                  <span className="text-white/70 text-sm flex items-center">
                    <Shield className="h-4 w-4 mr-2" />
                    Security Deposit
                  </span>
                  <span className="text-[#00C6FF] font-bold text-lg flex items-center">
                    <IndianRupee className="h-5 w-5" />
                    {plan.securityDeposit || 0}
                  </span>
                </div>
              </div>

              {/* Rent Slabs Info */}
              <div className="space-y-2">
                <div className="text-white/70 text-sm">
                  {planType === 'weekly' ? (
                    <>
                      <p className="mb-1">Weekly Rent Plans Available</p>
                      {rentSlabs && rentSlabs.length > 0 && (
                        <p className="text-xs text-white/50">
                          {rentSlabs.length} different trip slabs
                        </p>
                      )}
                    </>
                  ) : (
                    <>
                      <p className="mb-1">Daily Rent Plans Available</p>
                      {rentSlabs && rentSlabs.length > 0 && (
                        <p className="text-xs text-white/50">
                          {rentSlabs.length} different trip slabs
                        </p>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          )})}
        </div>

        {/* No Plans Message */}
        {currentPlans.length === 0 && (
          <div className="text-center text-white/70 py-12">
            <Car className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <p className="text-xl">No {planType} plans available at the moment</p>
          </div>
        )}

        {/* Rent Slab Selection */}
        {selectedPlan && (
          <div className="mb-8">
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border-2 border-[#00C6FF]">
              <h2 className="text-2xl font-bold text-white mb-4">Select Your Rent Plan</h2>
              <p className="text-white/70 mb-6">Choose the rent slab based on your expected trips</p>
              
              <div className="grid grid-cols-1 gap-4">
                {(planType === 'weekly' ? selectedPlan.weeklyRentSlabs : selectedPlan.dailyRentSlabs)?.map((slab, index) => (
                  <div
                    key={index}
                    onClick={() => setSelectedRentSlab(slab)}
                    className={`bg-white/10 rounded-xl p-4 cursor-pointer transition-all border-2 ${
                      selectedRentSlab === slab
                        ? 'border-[#00C6FF] bg-[#00C6FF]/20'
                        : 'border-white/20 hover:border-white/40'
                    }`}
                  >
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div className="flex items-center space-x-4">
                        {selectedRentSlab === slab && (
                          <CheckCircle className="h-6 w-6 text-[#00C6FF]" />
                        )}
                        <div>
                          <p className="text-white font-semibold text-lg">
                            {slab.trips} Trips {planType === 'weekly' ? 'per Week' : 'per Day'}
                          </p>
                          <p className="text-white/70 text-sm">
                            Acceptance Rate: {slab.acceptanceRate || 60}%
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-4">
                        <div className="bg-white/10 rounded-lg px-4 py-2">
                          <p className="text-white/70 text-xs">Rent/Day</p>
                          <p className="text-[#00C6FF] font-bold text-lg flex items-center">
                            <IndianRupee className="h-4 w-4" />
                            {slab.rentDay}
                          </p>
                        </div>
                        <div className="bg-white/10 rounded-lg px-4 py-2">
                          <p className="text-white/70 text-xs">Weekly Rent</p>
                          <p className="text-[#00C6FF] font-bold text-lg flex items-center">
                            <IndianRupee className="h-4 w-4" />
                            {slab.weeklyRent}
                          </p>
                        </div>
                        <div className="bg-white/10 rounded-lg px-4 py-2">
                          <p className="text-white/70 text-xs">Accidental Cover</p>
                          <p className="text-[#00C6FF] font-bold text-lg flex items-center">
                            <IndianRupee className="h-4 w-4" />
                            {slab.accidentalCover || 105}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Total Payment Summary */}
              {selectedRentSlab && (
                <div className="mt-6 bg-gradient-to-r from-[#00C6FF]/20 to-[#004AAD]/20 rounded-xl p-6 border-2 border-[#00C6FF]">
                  <h3 className="text-xl font-bold text-white mb-4">Payment Summary</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-white/70">Security Deposit</span>
                      <span className="text-white font-semibold flex items-center">
                        <IndianRupee className="h-4 w-4" />
                        {selectedPlan.securityDeposit || 0}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-white/70">{planType === 'weekly' ? 'Weekly Rent' : 'Daily Rent'}</span>
                      <span className="text-white font-semibold flex items-center">
                        <IndianRupee className="h-4 w-4" />
                        {planType === 'weekly' ? selectedRentSlab.weeklyRent : selectedRentSlab.rentDay}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-white/70">Accidental Cover</span>
                      <span className="text-white font-semibold flex items-center">
                        <IndianRupee className="h-4 w-4" />
                        {selectedRentSlab.accidentalCover || 105}
                      </span>
                    </div>
                    <div className="border-t border-white/20 pt-3 mt-3">
                      <div className="flex justify-between items-center">
                        <span className="text-white font-bold text-lg">Total {planType === 'weekly' ? 'Weekly' : 'Daily'} Payment</span>
                        <span className="text-[#00C6FF] font-bold text-2xl flex items-center">
                          <IndianRupee className="h-6 w-6" />
                          {planType === 'weekly' 
                            ? (selectedRentSlab.weeklyRent || 0) + (selectedRentSlab.accidentalCover || 105)
                            : (selectedRentSlab.rentDay || 0) + (selectedRentSlab.accidentalCover || 105)
                          }
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Submit Button */}
        {currentPlans.length > 0 && (
          <div className="flex justify-center">
            <button
              onClick={handleSelectPlan}
              disabled={!selectedPlan || submitting}
              className={`px-8 py-4 rounded-lg font-semibold text-lg transition-all ${
                selectedPlan && !submitting
                  ? 'bg-[#00C6FF] hover:bg-[#009EE3] text-[#001730]'
                  : 'bg-gray-500 text-gray-300 cursor-not-allowed'
              }`}
            >
              {submitting ? 'Selecting Plan...' : 'Confirm Plan Selection'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
