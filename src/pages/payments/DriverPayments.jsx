import { useState, useEffect } from 'react';
// Helper to get initial extra state for all selections

import { CreditCard, Users, Download, Search, Check, Clock, AlertTriangle, Wallet, User, Phone, IndianRupee, Eye, ChevronDown, CheckCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/Table';
import { formatDate } from '../../utils';
import { PermissionGuard } from '../../components/guards/PermissionGuards';
import { PERMISSIONS } from '../../utils/permissions';
import toast from 'react-hot-toast';

export default function DriverPayments() {
  const { user } = useAuth(); // Get logged-in user
  const isManager = user?.role === 'fleet_manager';
  // Manager dropdown state
  const [managers, setManagers] = useState([]);
  const [selectedManagers, setSelectedManagers] = useState({}); // { selectionId: managerId }
   const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [modeFilter, setModeFilter] = useState('all');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [loading, setLoading] = useState(true);
  const [selections, setSelections] = useState([]);
  const [selectedDetail, setSelectedDetail] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [rentSummaries, setRentSummaries] = useState({});
  function getInitialExtraState(selections) {
  const state = {};
  selections.flat().forEach(s => {
    state[s._id] = {
      amount: '', // Keep empty for new extra amount input
      reason: '', // Keep empty for new reason input
      loading: false
    };
  });
  return state;
}
  // State for editing extra amount/reason per row
  const [extraInputs, setExtraInputs] = useState({});
  // State for adjustment amount and reason per row
  const [adjustmentInputs, setAdjustmentInputs] = useState({});
  // State for cash payment completion (deposit and rent amounts)
  const [cashPaymentInputs, setCashPaymentInputs] = useState({});
  // Sync extraInputs state when selections change
  useEffect(() => {
    setExtraInputs(getInitialExtraState(selections));
    // Initialize adjustmentInputs state - keep amount empty for new input
    const adjState = {};
    selections.flat().forEach(s => {
      adjState[s._id] = {
        amount: '', // Keep empty for new adjustment input
        reason: '', // Keep empty for new reason input
        loading: false
      };
    });
    setAdjustmentInputs(adjState);
    // Initialize cash payment inputs
    const cashPayState = {};
    selections.flat().forEach(s => {
      cashPayState[s._id] = {
        depositAmount: '',
        rentAmount: '',
        paymentType: 'deposit', // 'deposit', 'rent', or 'payable'
        loading: false
      };
    });
    setCashPaymentInputs(cashPayState);
  }, [selections]);
  // Save handler for extra amount/reason
    // Save handler for adjustment amount and reason
    const handleSaveAdjustment = async (selectionId) => {
      const { amount, reason } = adjustmentInputs[selectionId] || {};
      
      if (!amount || Number(amount) <= 0) {
        toast.error('Please enter a valid adjustment amount');
        return;
      }
      
      setAdjustmentInputs(prev => ({
        ...prev,
        [selectionId]: { ...prev[selectionId], loading: true }
      }));
      
      try {
        const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000';
        const token = localStorage.getItem('token');
        
        // Find the selection to check if it's a booking
        const selection = selections.flat().find(s => s._id === selectionId);
        const isBooking = selection?.planType === 'booking';
        
        let res;
        if (isBooking) {
          // Use bookings API for bookings
          res = await fetch(`${API_BASE}/api/bookings/${selectionId}/adjustment`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ adjustmentAmount: Number(amount) || 0, adjustmentReason: reason || 'Adjustment' })
          });
        } else {
          // Use driver-plan-selections API for plan selections
          res = await fetch(`${API_BASE}/api/driver-plan-selections/${selectionId}`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              ...(token ? { 'Authorization': `Bearer ${token}` } : {})
            },
            body: JSON.stringify({ adjustmentAmount: Number(amount) || 0, adjustmentReason: reason || 'Adjustment' })
          });
        }
        
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.message || 'Failed to update adjustment amount');
        }
        
        const result = await res.json();
        const adjustmentTotal = isBooking ? result.booking.adjustmentAmount : result.selection.adjustmentAmount;
        
        // Update local state with cumulative adjustment
        setSelections(prev => prev.map(group =>
          group.map(s => {
            if (s._id !== selectionId) return s;
            
            if (isBooking) {
              // Recalculate booking payment details with adjustment
              const deposit = s.securityDeposit || 0;
              const totalRent = (s.numberOfDays || 0) * (s.pricePerDay || 0);
              const paidAmount = s.paidAmount || 0;
              const extraAmount = s.extraAmount || 0;
              
              // Calculate what's been paid toward deposit and rent
              let depositDue = 0;
              let rentDue = 0;
              
              if (paidAmount >= deposit) {
                // Deposit fully paid, remaining goes to rent
                depositDue = 0;
                const rentPaid = paidAmount - deposit;
                // Apply adjustment to rent due
                rentDue = Math.max(0, totalRent - rentPaid - adjustmentTotal);
              } else {
                // Partial or no deposit payment
                depositDue = deposit - paidAmount;
                // Apply adjustment to rent due
                rentDue = Math.max(0, totalRent - adjustmentTotal);
              }
              
              const finalTotalPayable = Math.max(0, depositDue + rentDue + extraAmount);
              
              return { 
                ...s, 
                adjustmentAmount: adjustmentTotal,
                adjustmentReason: result.booking.adjustmentReason,
                paymentDetails: {
                  ...s.paymentDetails,
                  totalPayable: finalTotalPayable
                }
              };
            } else {
              // For plan selections, keep existing logic
              return { 
                ...s, 
                adjustmentAmount: adjustmentTotal,
                adjustmentReason: result.selection.adjustmentReason
              };
            }
          })
        ));
        
        // Clear input fields after successful save
        setAdjustmentInputs(prev => ({
          ...prev,
          [selectionId]: { amount: '', reason: '', loading: false }
        }));
        
        toast.success(`Added ₹${Number(amount).toLocaleString('en-IN')} to adjustments. Total: ₹${adjustmentTotal.toLocaleString('en-IN')}`);
      } catch (e) {
        toast.error(e.message || 'Failed to update adjustment amount');
        setAdjustmentInputs(prev => ({
          ...prev,
          [selectionId]: { ...prev[selectionId], loading: false }
        }));
      }
    };
  const handleSaveExtra = async (selectionId) => {
    setExtraInputs(prev => ({
      ...prev,
      [selectionId]: { ...prev[selectionId], loading: true }
    }));
    try {
      const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000';
      const token = localStorage.getItem('token');
      const { amount, reason } = extraInputs[selectionId];
      
      // Find the selection to check if it's a booking
      const selection = selections.flat().find(s => s._id === selectionId);
      const isBooking = selection?.planType === 'booking';
      
      let res;
      if (isBooking) {
        // Use bookings API for bookings
        res = await fetch(`${API_BASE}/api/bookings/${selectionId}/extra`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ extraAmount: Number(amount) || 0, extraReason: reason })
        });
      } else {
        // Use driver-plan-selections API for plan selections
        res = await fetch(`${API_BASE}/api/driver-plan-selections/${selectionId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
          },
          body: JSON.stringify({ extraAmount: Number(amount) || 0, extraReason: reason })
        });
      }
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to update extra amount');
      }
      
      const result = await res.json();
      const extraTotal = isBooking ? result.booking.extraAmount : Number(amount) || 0;
      
      // Update local state for this selection
      setSelections(prev => prev.map(group =>
        group.map(s => {
          if (s._id !== selectionId) return s;
          
          if (isBooking) {
            // Recalculate booking payment details with extra amount
            const deposit = s.securityDeposit || 0;
            const totalRent = (s.numberOfDays || 0) * (s.pricePerDay || 0);
            const paidAmount = s.paidAmount || 0;
            const adjustmentAmount = s.adjustmentAmount || 0;
            
            // Calculate what's been paid toward deposit and rent
            let depositDue = 0;
            let rentDue = 0;
            
            if (paidAmount >= deposit) {
              // Deposit fully paid, remaining goes to rent
              depositDue = 0;
              const rentPaid = paidAmount - deposit;
              // Apply adjustment to rent due
              rentDue = Math.max(0, totalRent - rentPaid - adjustmentAmount);
            } else {
              // Partial or no deposit payment
              depositDue = deposit - paidAmount;
              // Apply adjustment to rent due
              rentDue = Math.max(0, totalRent - adjustmentAmount);
            }
            
            const finalTotalPayable = Math.max(0, depositDue + rentDue + extraTotal);
            
            return { 
              ...s, 
              extraAmount: extraTotal,
              extraReason: reason,
              paymentDetails: {
                ...s.paymentDetails,
                extraAmount: extraTotal,
                totalPayable: finalTotalPayable
              }
            };
          } else {
            // For plan selections, keep existing logic
            return { 
              ...s, 
              extraAmount: extraTotal, 
              extraReason: reason
            };
          }
        })
      ));
      toast.success('Extra amount updated');
      
      // Clear input fields after successful save
      setExtraInputs(prev => ({
        ...prev,
        [selectionId]: { amount: '', reason: '', loading: false }
      }));
    } catch (e) {
      toast.error(e.message || 'Failed to update extra amount');
      setExtraInputs(prev => ({
        ...prev,
        [selectionId]: { ...prev[selectionId], loading: false }
      }));
    }
  };
    // Handler for completing cash payment
    const handleCompleteCashPayment = async (selectionId, planType) => {
      const { depositAmount, rentAmount, paymentType } = cashPaymentInputs[selectionId] || {};
      
      if (!depositAmount && !rentAmount) {
        toast.error('Please enter deposit amount or rent amount');
        return;
      }
      
      const totalPaid = Number(depositAmount || 0) + Number(rentAmount || 0);
      
      setCashPaymentInputs(prev => ({
        ...prev,
        [selectionId]: { ...prev[selectionId], loading: true }
      }));
      
      try {
        const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000';
        
        // For bookings, update the booking payment status
        if (planType === 'booking') {
          const res = await fetch(`${API_BASE}/api/bookings/${selectionId}/payment`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              paymentStatus: 'completed',
              paidAmount: totalPaid,
              paymentType: paymentType || 'deposit'
            })
          });
          
          if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.message || 'Failed to update payment status');
          }
          
          const result = await res.json();
          
          // Update local state with recalculated dues from backend
          setSelections(prev => prev.map(group =>
            group.map(s => {
              if (s._id !== selectionId) return s;
              
              const deposit = s.securityDeposit || 0;
              const totalRent = (s.numberOfDays || 0) * (s.pricePerDay || 0);
              const paidNow = result.booking.paidAmount || 0;
              const updatedExtraAmount = result.booking.extraAmount || 0; // Get updated extra amount from backend
              const adjustmentAmount = s.adjustmentAmount || 0;
              
              // Recalculate dues based on updated paid amount
              let depositDue = Math.max(0, deposit - Math.min(paidNow, deposit));
              let rentPaid = Math.max(0, paidNow - deposit);
              let rentDue = Math.max(0, totalRent - rentPaid - adjustmentAmount);
              
              const finalTotalPayable = Math.max(0, depositDue + rentDue + updatedExtraAmount);
              
              return { 
                ...s, 
                paymentStatus: 'completed',
                paidAmount: paidNow,
                extraAmount: updatedExtraAmount, // Update extra amount from backend
                status: result.booking.status,
                paymentDetails: {
                  ...s.paymentDetails,
                  paidAmount: paidNow,
                  depositDue: depositDue,
                  rentDue: rentDue,
                  extraAmount: updatedExtraAmount,
                  totalPayable: finalTotalPayable
                }
              };
            })
          ));
        } else {
          // For driver plan selections
          const res = await fetch(`${API_BASE}/api/driver-plan-selections/${selectionId}`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              paymentStatus: 'completed',
              paidAmount: totalPaid
            })
          });
          
          if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.message || 'Failed to update payment status');
          }
          
          const result = await res.json();
          
          // Update local state with exact values from backend
          setSelections(prev => prev.map(group =>
            group.map(s =>
              s._id === selectionId
                ? { 
                    ...s, 
                    paymentStatus: 'completed',
                    paidAmount: result.selection?.paidAmount || totalPaid
                  }
                : s
            )
          ));
        }
        
        // Clear input fields but preserve payment type
        setCashPaymentInputs(prev => ({
          ...prev,
          [selectionId]: { 
            depositAmount: '', 
            rentAmount: '', 
            paymentType: prev[selectionId]?.paymentType || 'deposit',
            loading: false 
          }
        }));
        
        toast.success(`Payment completed successfully! Total paid: ₹${totalPaid.toLocaleString('en-IN')}`);
      } catch (e) {
        toast.error(e.message || 'Failed to complete payment');
        setCashPaymentInputs(prev => ({
          ...prev,
          [selectionId]: { ...prev[selectionId], loading: false }
        }));
      }
    };

    // Delete handler
    const handleDelete = async (selectionId) => {
  if (!window.confirm('Are you sure you want to delete this payment record?')) return;

  try {
    const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000';

    const selection = selections.flat().find(s => s._id === selectionId);
    const isBooking = selection?.planType === 'booking';

    const url = isBooking
      ? `${API_BASE}/api/bookings/${selectionId}`
      : `${API_BASE}/api/driver-plan-selections/${selectionId}`;

    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Please login to delete records');
      return;
    }
    const res = await fetch(url, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!res.ok) {
      // Try to parse JSON error body, otherwise fall back to text
      let errorData = {};
      try {
        errorData = await res.json();
      } catch (err) {
        errorData = { message: await res.text().catch(() => `HTTP ${res.status}`) };
      }
      throw new Error(errorData.message || `Failed to delete record (${res.status})`);
    }

    toast.success('Payment record deleted');

    setSelections(prev =>
      prev
        .map(group => group.filter(s => s._id !== selectionId))
        .filter(group => group.length > 0)
    );
  } catch (e) {
    console.error('Delete error:', e);
    toast.error(e.message || 'Failed to delete record');
  }
};

 


  useEffect(() => {
    const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000';
    // If logged-in user is a manager, use their email/ID, otherwise use selected manager filter
    const managerFilter = isManager ? (user?.email || user?.id) : (selectedManagers?.filter || '');
    
    // Fetch managers for dropdown (only if not a manager user)
    if (!isManager) {
      (async () => {
        try {
          const res = await fetch(`${API_BASE}/api/managers?limit=1000`);
          if (!res.ok) throw new Error(`Failed to load managers: ${res.status}`);
          const result = await res.json();
          const data = result.data || result;
          setManagers(Array.isArray(data) ? data : []);
        } catch (err) {
          console.error('Error loading managers:', err);
          setManagers([]);
        }
      })();
    }

    // Fetch payments by manager if selected, else fetch all
    const fetchPayments = async () => {
      setLoading(true);
      try {
        // Fetch driver plan selections
        let url = `${API_BASE}/api/driver-plan-selections?limit=1000`;
        if (managerFilter) {
          url = `${API_BASE}/api/driver-plan-selections/by-manager/${encodeURIComponent(managerFilter)}?limit=1000`;
          console.log('Fetching payments for manager:', managerFilter, 'URL:', url);
        } else {
          console.log('Fetching all payments');
        }
        const res = await fetch(url);
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({ message: `HTTP ${res.status}` }));
          throw new Error(errorData.message || `Failed to load payments: ${res.status}`);
        }
        const result = await res.json();
        const planSelectionData = result.data || result;
        console.log('Driver plan selections data received:', Array.isArray(planSelectionData) ? planSelectionData.length : 0, 'records');
        
        // Fetch bookings data
        const token = localStorage.getItem('token');
        let bookingsData = [];
        try {
          const bookingsRes = await fetch(`${API_BASE}/api/bookings?limit=1000&all=true`, {
            headers: token ? { 'Authorization': `Bearer ${token}` } : {}
          });
          console.log('Bookings API response status:', bookingsRes.status);
          if (bookingsRes.ok) {
            const bookingsResult = await bookingsRes.json();
            console.log('Bookings API result:', bookingsResult);
            bookingsData = (bookingsResult.bookings || bookingsResult.data || bookingsResult || []).map(booking => {
              const totalRent = (booking.numberOfDays || 0) * (booking.pricePerDay || 0);
              const deposit = booking.securityDeposit || 0;
              const extraAmount = booking.extraAmount || 0;
              const adjustmentAmount = booking.adjustmentAmount || 0;
              const totalPayable = booking.finalAmount || (totalRent + deposit);
              const paidAmount = booking.paidAmount || 0;

              // Calculate what's been paid toward deposit and rent
              let depositDue = 0;
              let rentDue = 0;

              if (paidAmount >= deposit) {
                // Deposit fully paid, remaining goes to rent
                depositDue = 0;
                const rentPaid = paidAmount - deposit;
                // Apply adjustment to rent due
                rentDue = Math.max(0, totalRent - rentPaid - adjustmentAmount);
              } else {
                // Partial or no deposit payment
                depositDue = deposit - paidAmount;
                // Apply adjustment to rent due
                rentDue = Math.max(0, totalRent - adjustmentAmount);
              }

              // Calculate final total payable (rent due + extra, adjustment already applied to rent)
              const finalTotalPayable = Math.max(0, depositDue + rentDue + extraAmount);

              return {
                ...booking,
                // Convert booking to driver-plan-selection format for consistent display
                // IMPORTANT: Start counting rent only when admin/vehicle assignment sets `rentStartDate`
                // or when vehicle assignment/activation sets it on the booking. Do NOT fallback to tripStartDate.
                driverUsername: booking.driverName,
                driverMobile: booking.driverMobile,
                planName: booking.vehicleName || 'Vehicle Booking',
                planType: 'booking',
                selectedDate: booking.createdAt,
                paymentStatus: booking.paymentStatus || 'pending',
                paymentMode: booking.paymentMethod || 'cash',
                paymentMethod: booking.paymentMethod || 'cash',
                paymentDate: booking.createdAt,
                paymentType: 'booking',
                securityDeposit: deposit,
                paidAmount: paidAmount,
                // Use explicit rentStartDate only; do not fall back to tripStartDate to prevent early counting
                rentStartDate: booking.rentStartDate || null,
                extraAmount: extraAmount,
                extraReason: booking.extraReason,
                extraAmounts: booking.extraAmounts || [],
                adjustmentAmount: adjustmentAmount,
                adjustmentReason: booking.adjustmentReason,
                adjustments: booking.adjustments || [],
                paymentDetails: (() => {
                  // If rent hasn't started, days should be 0 (no counting). If rentStartDate exists, compute days dynamically.
                  let days = 0;
                  if (booking.rentStartDate) {
                    const start = new Date(booking.rentStartDate);
                    let end = new Date();
                    // Normalize to midnight
                    const startMid = new Date(start.getFullYear(), start.getMonth(), start.getDate());
                    const endMid = new Date(end.getFullYear(), end.getMonth(), end.getDate());
                    days = Math.floor((endMid - startMid) / (1000 * 60 * 60 * 24)) + 1;
                    days = Math.max(1, days);
                  }
                  const rentPerDay = booking.pricePerDay || 0;
                  const totalRentComputed = days * rentPerDay;

                  // Recompute depositDue and rentDue using computed totalRent
                  let computedDepositDue = 0;
                  let computedRentDue = 0;
                  if (paidAmount >= deposit) {
                    computedDepositDue = 0;
                    const rentPaid = paidAmount - deposit;
                    computedRentDue = Math.max(0, totalRentComputed - rentPaid - adjustmentAmount);
                  } else {
                    computedDepositDue = Math.max(0, deposit - paidAmount);
                    computedRentDue = Math.max(0, totalRentComputed - adjustmentAmount);
                  }

                  const computedFinalTotal = Math.max(0, computedDepositDue + computedRentDue + extraAmount);

                  return {
                    totalPayable: computedFinalTotal,
                    depositDue: computedDepositDue,
                    rentDue: computedRentDue,
                    accidentalCover: 0,
                    extraAmount: extraAmount,
                    paidAmount: paidAmount,
                    days: days,
                    rentPerDay: rentPerDay
                  };
                })()
              };
            });
          }
        } catch (e) {
          console.error('Failed to fetch bookings:', e);
        }

        // Fetch driver payments (cancellations and other records)
        try {
          const paymentsRes = await fetch(`${API_BASE}/api/payments/drivers`, {
            headers: token ? { 'Authorization': `Bearer ${token}` } : {}
          });
          if (paymentsRes.ok) {
            const payments = await paymentsRes.json();
            // Filter booking cancellations and apply them to bookings in-place
            const cancels = (Array.isArray(payments) ? payments : []).filter(p => p.paymentType === 'booking_cancellation');
            if (cancels.length > 0 && bookingsData.length > 0) {
              cancels.forEach(c => {
                const booking = bookingsData.find(b => String(b._id) === String(c.bookingId));
                if (booking) {
                  booking.paymentStatus = 'cancelled';
                  booking.cancellationRecord = c;
                }
              });
              console.log('Applied cancellations to bookings:', cancels.length);
            }
          }
        } catch (err) {
          console.error('Failed to load driver payments:', err);
        }


        
        // Combine driver plan selections and bookings
        const combinedData = [...(Array.isArray(planSelectionData) ? planSelectionData : []), ...bookingsData];
        
        // Group by driverMobile or driverUsername
        const grouped = {};
        combinedData.forEach(s => {
          const key = s.driverMobile || s.driverUsername || s._id;
          if (!grouped[key]) grouped[key] = [];
          grouped[key].push(s);
        });
        setSelections(Object.values(grouped));
      } catch (err) {
        console.error('Error loading payments:', err);
        toast.error(err.message || 'Failed to load payments');
        setSelections([]);
      } finally {
        setLoading(false);
      }
    };
    fetchPayments();

    // Listen for vehicle updates to refresh payments data (e.g., when admin assigns driver or changes status)
    const handleVehicleUpdated = (ev) => {
      console.log('Vehicle updated event received', ev.detail);
      fetchPayments();
    };
    window.addEventListener('vehicle:updated', handleVehicleUpdated);

    return () => {
      window.removeEventListener('vehicle:updated', handleVehicleUpdated);
    };
  }, [selectedManagers?.filter, isManager, user?.email, user?.id]);

  // Debug: log selections after fetch
 useEffect(() => {
  console.log("DEBUG: Selections array:", selections);
  console.log("DEBUG: Selected manager filter:", selectedManagers?.filter);
}, [selections, selectedManagers]);


  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (openDropdown && !event.target.closest('.status-dropdown')) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [openDropdown]);

  const loadSelections = async () => {
    setLoading(true);
    try {
      const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000';
      const res = await fetch(`${API_BASE}/api/driver-plan-selections?limit=1000`);
      if (!res.ok) throw new Error('Failed to load driver payments');
      const result = await res.json();
      const data = result.data || result;
      // Only consider selections that have a payment status recorded
      const withPayments = data.filter(s => s.paymentStatus === 'completed' || s.paymentStatus === 'pending');
      // Group by driverMobile
      const grouped = {};
      withPayments.forEach(s => {
        const key = s.driverMobile || s.driverUsername || s._id;
        if (!grouped[key]) grouped[key] = [];
        grouped[key].push(s);
      });
      setSelections(Object.values(grouped));
      // Fetch rent summaries for all transactions
      const idsToFetch = withPayments.filter(s => s.rentStartDate).map(s => s._id);
      if (idsToFetch.length > 0) {
        const summaries = {};
        await Promise.all(
          idsToFetch.map(async (id) => {
            try {
              const summaryRes = await fetch(`${API_BASE}/api/driver-plan-selections/${id}/rent-summary`);
              if (summaryRes.ok) {
                summaries[id] = await summaryRes.json();
              }
            } catch (err) {
              console.error(`Failed to load summary for ${id}:`, err);
            }
          })
        );
        setRentSummaries(summaries);
      }
    } catch (e) {
      console.error(e);
      toast.error('Failed to load driver payments');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed':
        return <Badge variant="success" className="flex items-center gap-1"><Check className="h-3 w-3" />Completed</Badge>;
      case 'pending':
        return <Badge variant="warning" className="flex items-center gap-1"><Clock className="h-3 w-3" />Pending</Badge>;
      case 'failed':
        return <Badge variant="danger" className="flex items-center gap-1"><AlertTriangle className="h-3 w-3" />Failed</Badge>;
      case 'cancelled':
        return <Badge variant="danger" className="flex items-center gap-1"><AlertTriangle className="h-3 w-3" />Cancelled</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  }; 

  const getModeBadge = (mode) => {
    switch (mode) {
      case 'online':
        return <Badge variant="info" className="flex items-center gap-1"><CreditCard className="h-3 w-3" />Online</Badge>;
      case 'cash':
        return <Badge variant="success" className="flex items-center gap-1"><Wallet className="h-3 w-3" />Cash</Badge>;
      default:
        return <Badge variant="secondary">N/A</Badge>;
    }
  };

  const filtered = selections.filter(s => {
    // s is now an array of transactions for a driver
    // Filter if any transaction matches
    return s.some(tx => {
      const matchesSearch = (
        tx.driverUsername?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.driverMobile?.includes(searchTerm) ||
        tx.planName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      let matchesStatus = false;
      if (statusFilter === 'unpaid') {
        const rentDue = (() => {
          if (tx.rentStartDate) {
            const start = new Date(tx.rentStartDate);
            let end = new Date();
            if (tx.status === 'inactive' && tx.rentPausedDate) {
              end = new Date(tx.rentPausedDate);
            }
            let days = Math.floor((end - start) / (1000 * 60 * 60 * 24));
            days = Math.max(1, days + 1);
            const rentPerDay = rentSummaries[tx._id]?.rentPerDay || 0;
            return Math.max(0, (days * rentPerDay) - (tx.paidAmount || 0));
          }
          return 0;
        })();
        const depositDue = (tx.securityDeposit || 0) - (tx.paymentType === 'security' ? (tx.paidAmount || 0) : 0);
        matchesStatus = (rentDue > 0) || (depositDue > 0);
      } else {
        matchesStatus = statusFilter === 'all' || tx.paymentStatus === statusFilter;
      }
      const matchesMode = modeFilter === 'all' || tx.paymentMode === modeFilter;
      // Date filter
      let matchesDate = true;
      if (fromDate) {
        const txDate = tx.paymentDate ? new Date(tx.paymentDate) : null;
        const from = new Date(fromDate);
        matchesDate = txDate ? txDate >= from : false;
      }
      if (toDate) {
        const txDate = tx.paymentDate ? new Date(tx.paymentDate) : null;
        const to = new Date(toDate);
        matchesDate = matchesDate && (txDate ? txDate <= to : false);
      }
      return matchesSearch && matchesStatus && matchesMode && matchesDate;
    });
  });

  const computeTotal = (s) => {
    // Use backend-calculated total if available
    if (s.paymentDetails) {
      return s.paymentDetails.totalPayable;
    }
    // Fallback to 0 if no payment details
    return 0;
  };

  const stats = {
    total: filtered.length,
    completed: filtered.flat().filter(s => s.paymentStatus === 'completed').length,
    pending: filtered.flat().filter(s => s.paymentStatus === 'pending').length,
    online: filtered.flat().filter(s => s.paymentMode === 'online').length,
    cash: filtered.flat().filter(s => s.paymentMode === 'cash').length,
    totalAmount: filtered.flat().reduce((sum, s) => sum + computeTotal(s), 0)
  };

  const handleExport = () => {
    if (filtered.length === 0) {
      toast.error('No records to export');
      return;
    }
    
    // Flatten grouped records for export
    const allRecords = filtered.flat();
    
    const escape = (value) => {
      if (value == null) return '';
      const str = String(value);
      return `"${str.replace(/"/g, '""')}"`;
    };
    
    const rows = allRecords.map(s => {
      // Calculate days for rent
      let days = 0;
      if (s.rentStartDate) {
        const start = new Date(s.rentStartDate);
        let end = new Date();
        if (s.status === 'inactive' && s.rentPausedDate) {
          end = new Date(s.rentPausedDate);
        }
        const startMidnight = new Date(start.getFullYear(), start.getMonth(), start.getDate());
        const endMidnight = new Date(end.getFullYear(), end.getMonth(), end.getDate());
        days = Math.floor((endMidnight - startMidnight) / (1000 * 60 * 60 * 24)) + 1;
        days = Math.max(1, days);
      }
      
      // Calculate amounts
      const rentPerDay = s.calculatedRent || (() => {
        const slab = s.selectedRentSlab || {};
        return s.planType === 'weekly' ? (slab.weeklyRent || 0) : (slab.rentDay || 0);
      })();
      
      const accidentalCover = s.planType === 'weekly' ? (s.calculatedCover || (s.selectedRentSlab?.accidentalCover || 105)) : 0;
      const adjustment = s.adjustmentAmount || 0;
      const paidAmount = s.paidAmount || 0;
      
      // Calculate deposit due
      let depositDue = 0;
      if (s.paymentType === 'security') {
        depositDue = Math.max(0, (s.securityDeposit || 0) - paidAmount);
      } else {
        depositDue = s.securityDeposit || 0;
      }
      
      // Calculate rent due (adjustment is deducted from rent)
      let rentDue = 0;
      const totalRent = days * rentPerDay;
      if (s.paymentType === 'rent') {
        rentDue = Math.max(0, totalRent - paidAmount - adjustment);
      } else {
        rentDue = Math.max(0, totalRent - adjustment);
      }
      
      const extraAmount = s.extraAmount || 0;
      const totalPayable = depositDue + rentDue + accidentalCover + extraAmount;
      
      return [
        s.driverUsername || 'N/A',
        s.driverMobile ? `'${s.driverMobile}'` : 'N/A',
        s.planName || 'N/A',
        s.planType || 'N/A',
       
        s.securityDeposit || 0,
        depositDue,
        adjustedPaid || 0,
        days,
        rentPerDay,
        rentDue,
        accidentalCover,
        extraAmount,
        s.extraReason || '',
        adjustment,
        s.adjustmentReason || '',
        totalPayable,
        s.paymentMode || 'N/A',
        s.paymentMethod || 'N/A',
        s.paymentStatus || 'N/A',
        s.paymentType || 'N/A',
        s.paymentDate ? formatDate(s.paymentDate) : 'N/A',
        s.selectedDate ? formatDate(s.selectedDate) : 'N/A',
        s.rentStartDate ? formatDate(s.rentStartDate) : 'N/A',
        s.rentPausedDate ? formatDate(s.rentPausedDate) : 'N/A',
       
        s.createdAt ? formatDate(s.createdAt) : 'N/A',
        s.updatedAt ? formatDate(s.updatedAt) : 'N/A',
        s._id || 'N/A'
      ].map(escape);
    });
    
    const headers = [
      'Driver Name',
      'Driver Mobile',
      'Plan Name',
      'Plan Type',
      
      'Security Deposit',
      'Deposit Due',
      'Deposit Paid',
      'Rent Days',
      'Rent Per Day',
      'Rent Due',
      'Accidental Cover',
      'Extra Amount',
      'Extra Reason',
      'Adjustment Amount',
      'Adjustment Reason',
      'Total Payable',
      'Payment Mode',
      'Payment Method',
      'Payment Status',
      'Payment Type',
      'Payment Date',
      'Selected Date',
      'Rent Start Date',
      'Rent Paused Date',
     
      'Created At',
      'Updated At',
      'Selection ID'
    ].map(escape);
    
    const csv = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const date = new Date().toISOString().split('T')[0];
    a.download = `driver-payments-${date}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Exported ${allRecords.length} payment records successfully`);
  };

  const handleViewDetails = async (driverGroup) => {
    try {
      // Pass the entire group of transactions for this driver
      setSelectedDetail(driverGroup);
      setShowDetailModal(true);
    } catch (e) {
      console.error(e);
      toast.error('Failed to load payment details');
    }
  };

  const handleStatusChange = async (selectionId, newStatus) => {
    try {
      const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000';
      const token = localStorage.getItem('token');
      
      console.log('Updating status:', { selectionId, newStatus });
      
      const res = await fetch(`${API_BASE}/api/driver-plan-selections/${selectionId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to update status');
      }
      
      const data = await res.json();
      console.log('Status updated successfully:', data);
      
      // Update local state
      setSelections(prev => prev.map(s => 
        s._id === selectionId ? { ...s, status: newStatus } : s
      ));
      
      const message = newStatus === 'active' 
        ? '✓ Plan activated - Daily rent calculation resumed!' 
        : '✕ Plan deactivated - Daily rent calculation stopped!';
      toast.success(message, { duration: 3000 });
      setOpenDropdown(null);
      
      // Reload selections to get updated data
      setTimeout(() => loadSelections(), 500);
    } catch (e) {
      console.error('Status change error:', e);
      toast.error(e.message || 'Failed to update status');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }


  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isManager ? 'My Drivers Payment Records' : 'Driver Payments'}
          </h1>
          <p className="text-gray-600">
            {isManager 
              ? `Viewing payment records for drivers assigned to you (${user?.name})` 
              : 'See who paid for driver plan selections'}
          </p>
        </div>
        <PermissionGuard permission={PERMISSIONS.REPORTS_EXPORT}>
          <button onClick={handleExport} className="btn btn-secondary mt-4 sm:mt-0 flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export CSV
          </button>
        </PermissionGuard>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Records</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <CreditCard className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
                <p className="text-xs text-gray-500">Pending: {stats.pending}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <Check className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Payment Modes</p>
                <p className="text-sm font-semibold text-gray-900">Online: {stats.online}</p>
                <p className="text-sm font-semibold text-gray-900">Cash: {stats.cash}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <Wallet className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Payment</p>
                <p className="text-2xl font-bold text-gray-900">₹{stats.totalAmount.toLocaleString('en-IN')}</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-lg">
                <IndianRupee className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
{/* Search Input */}
<div>


  <div className="relative w-full">
    <Search
      className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none"
    />

    <input
      type="text"
      placeholder="Search by driver or plan..."
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      className="
        w-full pl-10 pr-3 py-2
        border border-gray-300 rounded-md 
        text-sm focus:outline-none 
        focus:ring-2 focus:ring-blue-500
      "
    />
  </div>
</div>


      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-7 gap-4 items-end">
            {/* From Date */}
            <div>
              <label className="block text-xs text-gray-500 mb-1">From Date</label>
              <input
                type="date"
                value={fromDate}
                onChange={e => setFromDate(e.target.value)}
                className="input w-full"
              />
            </div>
            {/* To Date */}
            <div>
              <label className="block text-xs text-gray-500 mb-1">To Date</label>
              <input
                type="date"
                value={toDate}
                onChange={e => setToDate(e.target.value)}
                className="input w-full"
              />
            </div>
            {/* Status Filter */}
            <div>
              <label className="block text-xs text-gray-500 mb-1">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="input w-full"
              >
                <option value="all">All Status</option>
                <option value="completed">Completed</option>
                <option value="unpaid">Unpaid</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
              </select>
            </div>
            {/* Mode Filter */}
            <div>
              <label className="block text-xs text-gray-500 mb-1">Mode</label>
              <select
                value={modeFilter}
                onChange={(e) => setModeFilter(e.target.value)}
                className="input w-full"
              >
                <option value="all">All Modes</option>
                <option value="online">Online</option>
                <option value="cash">Cash</option>
              </select>
            </div>
            {/* Manager Filter Dropdown - Only shown for non-manager users */}
            {!isManager && (
              <div>
                <label className="block text-xs text-gray-500 mb-1">Manager</label>
                <select
                  className="input w-full"
                  value={selectedManagers['filter'] || ''}
                  onChange={e => {
                    const value = e.target.value;
                    setSelectedManagers(prev => ({ ...prev, filter: value }));
                  }}
                >
                  <option value="">All Managers</option>
                  {managers.map(mgr => (
                    <option key={mgr._id} value={mgr._id}>{mgr.name}</option>
                  ))}
                </select>
              </div>
            )}
            {/* Clear Filters Button */}
            <div>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
                  setModeFilter('all');
                  setFromDate('');
                  setToDate('');
                  setSelectedManagers(prev => ({ ...prev, filter: '' }));
                }}
                className="btn btn-secondary w-full"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </CardContent>
      </Card>


      <Card className="w-full">
        <CardHeader>
          <CardTitle>Driver Payment Records</CardTitle>
        </CardHeader>
        <CardContent className="p-0">

      <div className="overflow-x-auto">
            <Table className="w-full">
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-gray-500">No records found</TableCell>
                  </TableRow>
                ) : (
                  filtered.map((group, idx) => {
                    const first = group[0];
                    return (
                      <TableRow key={first.driverMobile || first.driverUsername || idx}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                              <Users className="h-5 w-5 text-primary-600" />
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900">{first.driverUsername || 'N/A'}</p>
                              <p className="text-xs text-gray-500 flex items-center gap-1"><Phone className="h-3 w-3" />{first.driverMobile}</p>
                              {/* <p className="text-[10px] text-gray-400">ID: {first._id.slice(-6)}</p> */}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell colSpan={8}>
                          {/* Nested table for transactions */}
                          <div className="">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Plan</TableHead>
                                  <TableHead>Deposite Amount</TableHead>
                                  <TableHead>Total Payable Amount</TableHead>
                                  <TableHead>Total Paid Amount</TableHead>
                                  <TableHead>Daily Rent</TableHead>
                                      <TableHead>Transaction</TableHead>
                                  <TableHead>Payment</TableHead>
                                  <TableHead>Payment Status</TableHead>
                                 
                                  <TableHead>Actions</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {group.map(s => (
                                  <TableRow key={s._id}>
                                    <TableCell>
                                      <div className="space-y-1">
                                        <p className="font-medium">{s.planName}</p>
                                        <p className="text-xs text-gray-500 capitalize">Type: {s.planType}</p>
                                        <p className="text-xs text-gray-500">Selected: {s.selectedDate ? formatDate(s.selectedDate) : 'N/A'}</p>
                                        { (s.paymentStatus === 'cancelled' || s.cancellationRecord) && (
                                          <p className="text-xs text-red-600 font-semibold">Status: Cancelled{(s.cancellationRecord && (s.cancellationRecord.paymentDate || s.cancellationRecord.createdAt)) ? ` on ${new Date(s.cancellationRecord.paymentDate || s.cancellationRecord.createdAt).toLocaleDateString()}` : ''}</p>
                                        ) }
                                      </div>
                                    </TableCell>
                                    <TableCell>
                                      <p className='text-xs'>Deposite Amount: ₹{(s.securityDeposit||0).toLocaleString('en-IN')}</p>
                                      {/* Show deposit paid if available */}
                                      {(s.paymentType === 'security' || s.planType === 'booking') && s.paidAmount !== null && s.paidAmount !== undefined && s.paidAmount > 0 && (
                                        <div className="mt-1 pt-1 border-t border-gray-200">
                                          <p className="text-xs font-semibold text-green-600">Deposit Paid: ₹{Math.max(0, (s.paidAmount || 0) - (s.adjustmentAmount || 0)).toLocaleString('en-IN')}</p>
                                          {s.adjustmentAmount > 0 && (
                                            <p className="text-xs font-semibold text-yellow-600">Adjustment Deducted: -₹{s.adjustmentAmount.toLocaleString('en-IN')}</p>
                                          )}
                                        </div>
                                      )}
                                    </TableCell>
                                    <TableCell>
                                        <div className="space-y-1">
                                          <p className="font-bold text-blue-600">
                                            ₹{(s.paymentDetails?.totalPayable || 0).toLocaleString('en-IN')}
                                          </p>
                                          <p className="text-[11px] text-gray-500">
                                            Remaining Due = (Rent Due  + Extra Amount)
                                          </p>
                                          <div className="text-[10px] text-gray-500 mt-1">
                                            <div>Deposit Due: ₹{(s.paymentDetails?.depositDue || 0).toLocaleString('en-IN')}</div>
                                            <div>Rent Due: ₹{(s.paymentDetails?.rentDue || 0).toLocaleString('en-IN')}</div>
                                            {/* <div>Accidental Cover: ₹{(s.paymentDetails?.accidentalCover || 0).toLocaleString('en-IN')}</div> */}
                                            <div>Extra Amount: ₹{(s.paymentDetails?.extraAmount || 0).toLocaleString('en-IN')}</div>
                                            <div>Paid: ₹{(s.paymentDetails?.paidAmount || 0).toLocaleString('en-IN')}</div>
                                          </div>
                                          {/* Show all due calculated amounts below */}
                                          <div className="mt-1">
                                           
                                            {/* Extra Amount Due and Reason */}
                                            {s.extraAmount > 0 && (
                                              <p className="text-xs text-yellow-700">Extra Amount: ₹{s.extraAmount.toLocaleString('en-IN')}</p>
                                            )}
                                            {/* {s.extraAmount > 0 && s.extraReason && (
                                              <p className="text-xs text-gray-700">Reason: {s.extraReason}</p>
                                            )} */}
                                            {/* Adjustment Amount and Reason */}
                                            {s.adjustmentAmount > 0 && (
                                              <p className="text-xs text-yellow-700 mt-1">Adjustment Amount: ₹{s.adjustmentAmount.toLocaleString('en-IN')}</p>
                                            )}
                                            {/* {s.adjustmentAmount > 0 && s.adjustmentReason && (
                                              <p className="text-xs text-gray-700">Reason: {s.adjustmentReason}</p>
                                            )} */}
                                          </div>
                                          {/* Show rent paid if available */}
                                          {s.paymentType === 'rent' && s.paidAmount !== null && s.paidAmount !== undefined && (
                                            <div className="mt-1 pt-1 border-t border-gray-200">
                                              <p className="text-xs font-semibold text-green-600">Rent Paid: ₹{((s.paidAmount || 0) - (s.adjustmentAmount || 0)).toLocaleString('en-IN')}</p>
                                            </div>
                                          )}
                                          {/* Show all due amounts, extra amount, and reason */}
                                        
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                      <div className="space-y-1">
                                        {(() => {
                                          // Calculate total paid amount for this driver across all transactions
                                          // This shows all rent, deposit, and other payments made by the driver
                                          const totalPaidByDriver = group.reduce((sum, transaction) => {
                                            return sum + (transaction.paidAmount || 0);
                                          }, 0);
                                          
                                          return (
                                            <div>
                                              <p className="font-bold text-green-600 text-lg">
                                                ₹{totalPaidByDriver.toLocaleString('en-IN')}
                                              </p>
                                              {/* <p className="text-[10px] text-gray-500 mt-1">
                                                Total paid across {group.length} transaction{group.length !== 1 ? 's' : ''}
                                              </p> */}
                                            </div>
                                          );
                                        })()}
                                      </div>
                                    </TableCell>
                                    <TableCell>
                                      {s.rentStartDate ? (
                                        <div className="space-y-1">
                                          <p className="text-xs text-gray-600">
                                            <span className="font-semibold">Days:</span> {s.paymentDetails?.days || 0}
                                          </p>
                                          <p className="text-xs text-gray-600">
                                            <span className="font-semibold">Rent/Day:</span> ₹{(s.paymentDetails?.rentPerDay || 0).toLocaleString('en-IN')}
                                          </p>
                                          {/* Deposit paid/due status */}
                                          {((s.securityDeposit || 0) > 0) && (
                                            <p className="text-xs">
                                              <span className="font-semibold">Deposit: </span>
                                              {(s.paymentDetails?.depositDue || 0) === 0 ? (
                                                <span className="text-green-600 font-semibold">Paid ₹{(s.securityDeposit || 0).toLocaleString('en-IN')}</span>
                                              ) : (
                                                <>
                                                  <span className="text-green-600 font-semibold">Paid ₹{((s.securityDeposit || 0) - (s.paymentDetails?.depositDue || 0)).toLocaleString('en-IN')}</span>
                                                  {' / '}
                                                  <span className="text-orange-600 font-semibold">Due ₹{(s.paymentDetails?.depositDue || 0).toLocaleString('en-IN')}</span>
                                                </>
                                              )}
                                            </p>
                                          )}
                                          
                                          <div className="flex items-center gap-4 ">
                                                <p className="text-xs font-semibold text-yellow-700 whitespace-nowrap">Add Adjustment :</p>
                                                <input
                                                  type="number"
                                                  className="border border-gray-300 rounded-md px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-yellow-500 w-24"
                                                  placeholder="Amount"
                                                  value={adjustmentInputs[s._id]?.amount ?? ''}
                                                  onChange={e => setAdjustmentInputs(prev => ({
                                                    ...prev,
                                                    [s._id]: { ...prev[s._id], amount: e.target.value }
                                                  }))}
                                                  disabled={adjustmentInputs[s._id]?.loading}
                                                />
                                                <input
                                                  type="text"
                                                  className="border border-gray-300 rounded-md px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-yellow-500 w-40"
                                                  placeholder="Enter reason..."
                                                  value={adjustmentInputs[s._id]?.reason ?? ''}
                                                  onChange={e => setAdjustmentInputs(prev => ({
                                                    ...prev,
                                                    [s._id]: { ...prev[s._id], reason: e.target.value }
                                                  }))}
                                                  disabled={adjustmentInputs[s._id]?.loading}
                                                />
                                                <button
                                                  className="bg-yellow-600 text-white text-xs px-4 py-1.5 rounded-md hover:bg-yellow-700 transition disabled:opacity-60"
                                                  onClick={() => handleSaveAdjustment(s._id)}
                                                  disabled={adjustmentInputs[s._id]?.loading}
                                                >
                                                  {adjustmentInputs[s._id]?.loading ? 'saving...' : 'Save'}
                                                </button>
                                              </div>

                                              <div className="flex items-center gap-4">
                                                <p className="text-xs font-semibold text-yellow-700 whitespace-nowrap">Extra Amount :</p>
                                                <input
                                                  type="number"
                                                  className="border border-gray-300 rounded-md px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-yellow-500 w-24"
                                                  placeholder="Amount"
                                                  value={extraInputs[s._id]?.amount ?? ''}
                                                  onChange={e => setExtraInputs(prev => ({
                                                    ...prev,
                                                    [s._id]: { ...prev[s._id], amount: e.target.value }
                                                  }))}
                                                  disabled={extraInputs[s._id]?.loading}
                                                />
                                                <input
                                                  type="text"
                                                  className="border border-gray-300 rounded-md px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-yellow-500 w-40"
                                                  placeholder="Enter reason..."
                                                  value={extraInputs[s._id]?.reason ?? ''}
                                                  onChange={e => setExtraInputs(prev => ({
                                                    ...prev,
                                                    [s._id]: { ...prev[s._id], reason: e.target.value }
                                                  }))}
                                                  disabled={extraInputs[s._id]?.loading}
                                                />
                                                <button
                                                  className="bg-yellow-600 text-white text-xs px-4 py-1.5 rounded-md hover:bg-yellow-700 transition disabled:opacity-60"
                                                  onClick={() => handleSaveExtra(s._id)}
                                                  disabled={extraInputs[s._id]?.loading}
                                                >
                                                  {extraInputs[s._id]?.loading ? 'Saving...' : 'Save'}
                                                </button>
                                              </div>
                                              
                                              {/* Cash Payment Completion - Only for cash payments with pending status */}
                                              {s.paymentMethod === 'cash' && s.paymentStatus === 'pending' && (
                                                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                                                  <p className="text-xs font-semibold text-blue-800 mb-2">Complete Cash Payment</p>
                                                  <div className="flex items-center gap-2">
                                                    <div>
                                                      <label className="block text-[10px] text-gray-600 mb-1">Deposit Amount</label>
                                                      <input
                                                        type="number"
                                                        className="border border-gray-300 rounded-md px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 w-20"
                                                        placeholder="₹"
                                                        value={cashPaymentInputs[s._id]?.depositAmount ?? ''}
                                                        onChange={e => setCashPaymentInputs(prev => ({
                                                          ...prev,
                                                          [s._id]: { ...prev[s._id], depositAmount: e.target.value }
                                                        }))}
                                                        disabled={cashPaymentInputs[s._id]?.loading}
                                                      />
                                                    </div>
                                                    <div>
                                                      <label className="block text-[10px] text-gray-600 mb-1">Rent Amount</label>
                                                      <input
                                                        type="number"
                                                        className="border border-gray-300 rounded-md px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 w-20"
                                                        placeholder="₹"
                                                        value={cashPaymentInputs[s._id]?.rentAmount ?? ''}
                                                        onChange={e => setCashPaymentInputs(prev => ({
                                                          ...prev,
                                                          [s._id]: { ...prev[s._id], rentAmount: e.target.value }
                                                        }))}
                                                        disabled={cashPaymentInputs[s._id]?.loading}
                                                      />
                                                    </div>
                                                    <button
                                                      className="bg-blue-600 text-white text-xs px-3 py-1.5 rounded-md hover:bg-blue-700 transition disabled:opacity-60 mt-4"
                                                      onClick={() => handleCompleteCashPayment(s._id, s.planType)}
                                                      disabled={cashPaymentInputs[s._id]?.loading}
                                                    >
                                                      {cashPaymentInputs[s._id]?.loading ? 'Processing...' : 'Mark Completed'}
                                                    </button>
                                                  </div>
                                                  <p className="text-[10px] text-gray-600 mt-1">
                                                    Total: ₹{((Number(cashPaymentInputs[s._id]?.depositAmount) || 0) + (Number(cashPaymentInputs[s._id]?.rentAmount) || 0)).toLocaleString('en-IN')}
                                                  </p>
                                                </div>
                                              )}
                                              
                                              {/* Additional Payment - For paying remaining dues */}
                                              {s.paymentMethod === 'cash' && s.paymentStatus === 'completed' && s.paymentDetails?.totalPayable > 0 && (
                                                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
                                                  <p className="text-xs font-semibold text-green-800 mb-2">Pay Remaining Dues</p>
                                                  <div className="text-[10px] text-gray-600 mb-2 space-y-1">
                                                    {s.paymentDetails?.depositDue > 0 && <p>Deposit Due: ₹{s.paymentDetails.depositDue.toLocaleString('en-IN')}</p>}
                                                    {s.paymentDetails?.rentDue > 0 && <p>Rent Due: ₹{s.paymentDetails.rentDue.toLocaleString('en-IN')}</p>}
                                                    {s.paymentDetails?.extraAmount > 0 && <p>Extra Amount: ₹{s.paymentDetails.extraAmount.toLocaleString('en-IN')}</p>}
                                                    <p className="font-semibold text-green-800">Total Payable: ₹{s.paymentDetails.totalPayable.toLocaleString('en-IN')}</p>
                                                  </div>
                                                  <div className="flex items-center gap-2 flex-wrap">
                                                    <div>
                                                      <label className="block text-[10px] text-gray-600 mb-1">Payment Type</label>
                                                      <select
                                                        className="border border-gray-300 rounded-md px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-green-500 w-32"
                                                        value={cashPaymentInputs[s._id]?.paymentType ?? 'deposit'}
                                                        onChange={e => setCashPaymentInputs(prev => ({
                                                          ...prev,
                                                          [s._id]: { 
                                                            ...prev[s._id], 
                                                            paymentType: e.target.value,
                                                            rentAmount: ''
                                                          }
                                                        }))}
                                                        disabled={cashPaymentInputs[s._id]?.loading}
                                                      >
                                                        {s.paymentDetails?.depositDue > 0 && <option value="deposit">Deposit</option>}
                                                        {s.paymentDetails?.rentDue > 0 && <option value="rent">Rent</option>}
                                                        <option value="payable">Total Payable</option>
                                                      </select>
                                                    </div>
                                                    <div>
                                                      <label className="block text-[10px] text-gray-600 mb-1">Payment Amount</label>
                                                      <input
                                                        type="number"
                                                        className="border border-gray-300 rounded-md px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-green-500 w-24"
                                                        placeholder="₹"
                                                        value={cashPaymentInputs[s._id]?.rentAmount ?? ''}
                                                        onChange={e => setCashPaymentInputs(prev => ({
                                                          ...prev,
                                                          [s._id]: { ...prev[s._id], rentAmount: e.target.value, depositAmount: '' }
                                                        }))}
                                                        disabled={cashPaymentInputs[s._id]?.loading}
                                                      />
                                                    </div>
                                                    <button
                                                      className="bg-green-600 text-white text-xs px-3 py-1.5 rounded-md hover:bg-green-700 transition disabled:opacity-60 mt-4"
                                                      onClick={() => handleCompleteCashPayment(s._id, s.planType)}
                                                      disabled={cashPaymentInputs[s._id]?.loading}
                                                    >
                                                      {cashPaymentInputs[s._id]?.loading ? 'Processing...' : 'Pay Now'}
                                                    </button>
                                                    <button
                                                      className="bg-blue-600 text-white text-xs px-3 py-1.5 rounded-md hover:bg-blue-700 transition disabled:opacity-60 mt-4"
                                                      onClick={() => {
                                                        const paymentType = cashPaymentInputs[s._id]?.paymentType ?? 'deposit';
                                                        let fullAmount = s.paymentDetails.totalPayable;
                                                        if (paymentType === 'deposit') fullAmount = s.paymentDetails.depositDue || 0;
                                                        else if (paymentType === 'rent') fullAmount = s.paymentDetails.rentDue || 0;
                                                        setCashPaymentInputs(prev => ({
                                                          ...prev,
                                                          [s._id]: { ...prev[s._id], rentAmount: fullAmount, depositAmount: '' }
                                                        }));
                                                      }}
                                                    >
                                                      Pay Full
                                                    </button>
                                                  </div>
                                                </div>
                                              )}
                                        </div>
                                      ) : (
                                        <div className="text-xs text-gray-500">Not started</div>
                                      )}
                                    </TableCell>
                                      <TableCell>
                                      <div className="flex gap-2">
                                        <button
                                          onClick={() => handleViewDetails(group)}
                                          className="text-primary-600 hover:text-primary-700 flex items-center gap-1 text-sm font-medium border border-primary-200 rounded px-2 py-1"
                                          title="View all transactions"
                                        >
                                          <Eye className="h-4 w-4" />
                                          See Transaction
                                        </button>
                                       
                                      </div>
                                    </TableCell>
                                    <TableCell>
                                      <div className="space-y-1">
                                        <div>{getModeBadge(s.paymentMode)}</div>
                                        <p className="text-xs text-gray-500">Method: {s.paymentMethod || 'N/A'}</p>
                                        <p className="text-xs text-gray-500">Date: {s.paymentDate ? formatDate(s.paymentDate) : 'Not paid yet'}</p>
                                       
                                       
                                      </div>
                                    </TableCell>
                                    <TableCell>
                                      {getStatusBadge(s.paymentStatus)}
                                    </TableCell>
                                    
                                    <TableCell>
                                      <div className="flex gap-2">
                                        {/* <button
                                          onClick={() => handleViewDetails(group)}
                                          className="text-primary-600 hover:text-primary-700 flex items-center gap-1 text-sm font-medium border border-primary-200 rounded px-2 py-1"
                                          title="View all transactions"
                                        >
                                          <Eye className="h-4 w-4" />
                                          View
                                        </button> */}
                                        <button
                                          onClick={() => handleDelete(s._id)}
                                          className="text-red-600 hover:text-red-700 flex items-center gap-1 text-sm font-medium border border-red-200 rounded px-2 py-1"
                                          title="Delete payment record"
                                        >
                                          🗑 Delete
                                        </button>
                                      </div>
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      {/* Payment Detail Modal - All Transactions */}
      {selectedDetail && showDetailModal && Array.isArray(selectedDetail) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-gray-200 flex-shrink-0">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Transaction History</h2>
                  <p className="text-sm text-gray-600 mt-1">
                    {selectedDetail[0]?.driverUsername} - {selectedDetail[0]?.driverMobile}
                  </p>
                </div>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ✕
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-4 overflow-y-auto flex-1">
              {/* Summary Cards */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-blue-50 rounded-lg p-4">
                  <p className="text-xs text-gray-600">Total Transactions</p>
                  <p className="text-2xl font-bold text-blue-600">{selectedDetail.length}</p>
                </div>
                <div className="bg-green-50 rounded-lg p-4">
                  <p className="text-xs text-gray-600">Total Paid</p>
                  <p className="text-2xl font-bold text-green-600">
                    ₹{selectedDetail.reduce((sum, t) => sum + (t.paidAmount || 0), 0).toLocaleString('en-IN')}
                  </p>
                </div>
                <div className="bg-orange-50 rounded-lg p-4">
                  <p className="text-xs text-gray-600">Total Due</p>
                  <p className="text-2xl font-bold text-orange-600">
                    ₹{selectedDetail.reduce((sum, t) => sum + (t.paymentDetails?.totalPayable || 0), 0).toLocaleString('en-IN')}
                  </p>
                </div>
              </div>

              {/* Transaction List */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-gray-700">All Transactions</h3>
                {selectedDetail.map((transaction, index) => (
                  <div key={transaction._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-semibold text-gray-900">Transaction #{index + 1}</h4>
                        <p className="text-xs text-gray-500">ID: {transaction._id}</p>
                      </div>
                      <div className="text-right">
                        {getStatusBadge(transaction.paymentStatus)}
                      </div>
                    </div>

                    {/* Transaction Details Grid */}
                    <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                      <div>
                        <span className="text-gray-600">Plan:</span>
                        <span className="ml-2 font-medium">{transaction.planName}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Type:</span>
                        <span className="ml-2 font-medium capitalize">{transaction.planType}</span>
                      </div>
                      
                      <div>
                        <span className="text-gray-600">Security Deposit:</span>
                        <span className="ml-2 font-medium">₹{(transaction.securityDeposit || 0).toLocaleString('en-IN')}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Payment Type:</span>
                        <span className="ml-2 font-medium capitalize">{transaction.paymentType || 'N/A'}</span>
                      </div>

                      {transaction.rentStartDate && (
                        <>
                          <div>
                            <span className="text-gray-600">Rent Start:</span>
                            <span className="ml-2 font-medium">{formatDate(transaction.rentStartDate)}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Days:</span>
                            <span className="ml-2 font-medium">{transaction.paymentDetails?.days || 0}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Rent/Day:</span>
                            <span className="ml-2 font-medium">₹{(transaction.paymentDetails?.rentPerDay || 0).toLocaleString('en-IN')}</span>
                          </div>
                        </>
                      )}

                      <div>
                        <span className="text-gray-600">Payment Mode:</span>
                        <span className="ml-2">{getModeBadge(transaction.paymentMode)}</span>
                      </div>

                      <div>
                        <span className="text-gray-600">Payment Date:</span>
                        <span className="ml-2 font-medium">
                          {transaction.paymentDate ? formatDate(transaction.paymentDate) : 'Not paid'}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">Selected Date:</span>
                        <span className="ml-2 font-medium">
                          {transaction.selectedDate ? formatDate(transaction.selectedDate) : 'N/A'}
                        </span>
                      </div>
                    </div>

                    {/* Payment Breakdown */}
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Deposit Due:</span>
                          <span className="font-semibold">₹{(transaction.paymentDetails?.depositDue || 0).toLocaleString('en-IN')}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Rent Due:</span>
                          <span className="font-semibold">₹{(transaction.paymentDetails?.rentDue || 0).toLocaleString('en-IN')}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Accidental Cover:</span>
                          <span className="font-semibold">₹{(transaction.paymentDetails?.accidentalCover || 0).toLocaleString('en-IN')}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Extra Amount:</span>
                          <span className="font-semibold text-yellow-600">₹{(transaction.extraAmount || 0).toLocaleString('en-IN')}</span>
                        </div>
                        {transaction.adjustmentAmount > 0 && (
                          <div className="flex justify-between col-span-2">
                            <span className="text-gray-600">Adjustment (Discount):</span>
                            <span className="font-semibold text-green-600">-₹{transaction.adjustmentAmount.toLocaleString('en-IN')}</span>
                          </div>
                        )}
                      </div>

                      {/* Extra Amounts - Show all individual entries */}
                      {(transaction.extraAmounts?.length > 0 || (transaction.extraAmount > 0 && transaction.extraReason)) && (
                        <div className="mt-2 space-y-2">
                          <p className="text-xs font-semibold text-yellow-800">Extra Amounts Added:</p>
                          
                          {/* Show new array format if available */}
                          {transaction.extraAmounts?.map((extra, idx) => (
                            <div key={idx} className="p-3 bg-yellow-50 border border-yellow-200 rounded text-xs">
                              <div className="flex justify-between items-start mb-1">
                                <span className="font-semibold text-yellow-800">Amount #{idx + 1}:</span>
                                <span className="text-yellow-600 font-medium">₹{extra.amount.toLocaleString('en-IN')}</span>
                              </div>
                              <div className="text-yellow-700 mb-1">
                                <span className="font-medium">Reason:</span> {extra.reason || 'No reason provided'}
                              </div>
                              <div className="text-yellow-600 text-[10px]">
                                <span className="font-medium">Date:</span> {extra.date ? formatDate(extra.date) : 'N/A'}
                              </div>
                            </div>
                          ))}
                          
                          {/* Fallback: Show old single format if no array but has values */}
                          {(!transaction.extraAmounts || transaction.extraAmounts.length === 0) && transaction.extraAmount > 0 && transaction.extraReason && (
                            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded text-xs">
                              <div className="flex justify-between items-start mb-1">
                                <span className="font-semibold text-yellow-800">Extra Amount:</span>
                                <span className="text-yellow-600 font-medium">₹{transaction.extraAmount.toLocaleString('en-IN')}</span>
                              </div>
                              <div className="text-yellow-700 mb-1">
                                <span className="font-medium">Reason:</span> {transaction.extraReason}
                              </div>
                              <div className="text-yellow-600 text-[10px]">
                                <span className="font-medium">Last Updated:</span> {transaction.updatedAt ? formatDate(transaction.updatedAt) : 'N/A'}
                              </div>
                            </div>
                          )}
                          
                          <div className="text-xs font-semibold text-yellow-800 pt-1 border-t border-yellow-300">
                            Total Extra Amount: ₹{(transaction.extraAmount || 0).toLocaleString('en-IN')}
                          </div>
                        </div>
                      )}
                      
                      {/* Adjustments - Show all individual entries */}
                      {(transaction.adjustments?.length > 0 || (transaction.adjustmentAmount > 0 && transaction.adjustmentReason)) && (
                        <div className="mt-2 space-y-2">
                          <p className="text-xs font-semibold text-green-800">Adjustments (Discounts) Applied:</p>
                          
                          {/* Show new array format if available */}
                          {transaction.adjustments?.map((adj, idx) => (
                            <div key={idx} className="p-3 bg-green-50 border border-green-200 rounded text-xs">
                              <div className="flex justify-between items-start mb-1">
                                <span className="font-semibold text-green-800">Adjustment #{idx + 1}:</span>
                                <span className="text-green-600 font-medium">-₹{adj.amount.toLocaleString('en-IN')}</span>
                              </div>
                              <div className="text-green-700 mb-1">
                                <span className="font-medium">Reason:</span> {adj.reason || 'No reason provided'}
                              </div>
                              <div className="text-green-600 text-[10px]">
                                <span className="font-medium">Date:</span> {adj.date ? formatDate(adj.date) : 'N/A'}
                              </div>
                            </div>
                          ))}
                          
                          {/* Fallback: Show old single format if no array but has values */}
                          {(!transaction.adjustments || transaction.adjustments.length === 0) && transaction.adjustmentAmount > 0 && transaction.adjustmentReason && (
                            <div className="p-3 bg-green-50 border border-green-200 rounded text-xs">
                              <div className="flex justify-between items-start mb-1">
                                <span className="font-semibold text-green-800">Adjustment (Discount):</span>
                                <span className="text-green-600 font-medium">-₹{transaction.adjustmentAmount.toLocaleString('en-IN')}</span>
                              </div>
                              <div className="text-green-700 mb-1">
                                <span className="font-medium">Reason:</span> {transaction.adjustmentReason}
                              </div>
                              <div className="text-green-600 text-[10px]">
                                <span className="font-medium">Last Updated:</span> {transaction.updatedAt ? formatDate(transaction.updatedAt) : 'N/A'}
                              </div>
                            </div>
                          )}
                          
                          <div className="text-xs font-semibold text-green-800 pt-1 border-t border-green-300">
                            Total Adjustment: -₹{(transaction.adjustmentAmount || 0).toLocaleString('en-IN')}
                          </div>
                        </div>
                      )}

                      {/* Totals */}
                      <div className="mt-3 pt-2 border-t border-gray-300 flex justify-between items-center">
                        <div>
                          <span className="text-gray-600 font-medium">Paid Amount:</span>
                          <span className="ml-2 text-lg font-bold text-green-600">
                            ₹{(transaction.paidAmount || 0).toLocaleString('en-IN')}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600 font-medium">Total Payable:</span>
                          <span className="ml-2 text-lg font-bold text-blue-600">
                            ₹{(transaction.paymentDetails?.totalPayable || 0).toLocaleString('en-IN')}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Timestamps */}
                    <div className="mt-3 pt-2 border-t border-gray-100 flex justify-between text-xs text-gray-500">
                      <span>Created: {formatDate(transaction.createdAt)}</span>
                      {transaction.updatedAt && (
                        <span>Updated: {formatDate(transaction.updatedAt)}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex gap-3 flex-shrink-0">
              <button
                onClick={() => setShowDetailModal(false)}
                className="btn btn-secondary flex-1"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}