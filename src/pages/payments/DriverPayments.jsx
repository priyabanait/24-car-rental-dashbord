import { useState, useEffect } from 'react';
// Helper to get initial extra state for all selections

import { CreditCard, Users, Download, Search, Check, Clock, AlertTriangle, Wallet, User, Phone, IndianRupee, Eye, ChevronDown, CheckCircle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/Table';
import { formatDate } from '../../utils';
import { PermissionGuard } from '../../components/guards/PermissionGuards';
import { PERMISSIONS } from '../../utils/permissions';
import toast from 'react-hot-toast';

export default function DriverPayments() {
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
      amount: s.extraAmount || '',
      reason: s.extraReason || '',
      loading: false
    };
  });
  return state;
}
  // State for editing extra amount/reason per row
  const [extraInputs, setExtraInputs] = useState({});
  // State for adjustment amount per row
  const [adjustmentInputs, setAdjustmentInputs] = useState({});
  // Sync extraInputs state when selections change
  useEffect(() => {
    setExtraInputs(getInitialExtraState(selections));
    // Initialize adjustmentInputs state
    const adjState = {};
    selections.flat().forEach(s => {
      adjState[s._id] = s.adjustmentAmount || '';
    });
    setAdjustmentInputs(adjState);
  }, [selections]);
  // Save handler for extra amount/reason
    // Save handler for adjustment amount
    const handleSaveAdjustment = (selectionId) => {
      const value = Number(adjustmentInputs[selectionId]) || 0;
      setSelections(prev => prev.map(group =>
        group.map(s =>
          s._id === selectionId
            ? { ...s, adjustmentAmount: value }
            : s
        )
      ));
      // Persist to backend
      (async () => {
        try {
          const API_BASE = import.meta.env.VITE_API_BASE || 'https://udrive-backend-1igb.vercel.app';
          const token = localStorage.getItem('token');
          const res = await fetch(`${API_BASE}/api/driver-plan-selections/${selectionId}`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              ...(token ? { 'Authorization': `Bearer ${token}` } : {})
            },
            body: JSON.stringify({ adjustmentAmount: value })
          });
          if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.message || 'Failed to update adjustment amount');
          }
          toast.success('Adjustment amount updated');
        } catch (e) {
          toast.error(e.message || 'Failed to update adjustment amount');
        }
      })();
    };
  const handleSaveExtra = async (selectionId) => {
    setExtraInputs(prev => ({
      ...prev,
      [selectionId]: { ...prev[selectionId], loading: true }
    }));
    try {
      const API_BASE = import.meta.env.VITE_API_BASE || 'https://udrive-backend-1igb.vercel.app';
      const token = localStorage.getItem('token');
      const { amount, reason } = extraInputs[selectionId];
      const res = await fetch(`${API_BASE}/api/driver-plan-selections/${selectionId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ extraAmount: Number(amount) || 0, extraReason: reason })
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to update extra amount');
      }
      // Update local state for this selection
      setSelections(prev => prev.map(group =>
        group.map(s =>
          s._id === selectionId
            ? { ...s, extraAmount: Number(amount) || 0, extraReason: reason }
            : s
        )
      ));
      toast.success('Extra amount updated');
    } catch (e) {
      toast.error(e.message || 'Failed to update extra amount');
    } finally {
      setExtraInputs(prev => ({
        ...prev,
        [selectionId]: { ...prev[selectionId], loading: false }
      }));
    }
  };
    // Delete handler
    const handleDelete = async (selectionId) => {
      if (!window.confirm('Are you sure you want to delete this payment record?')) return;
      try {
        const API_BASE = import.meta.env.VITE_API_BASE || 'https://udrive-backend-1igb.vercel.app';
        const res = await fetch(`${API_BASE}/api/driver-plan-selections/${selectionId}`, {
          method: 'DELETE'
        });
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.message || 'Failed to delete record');
        }
        toast.success('Payment record deleted');
        // Remove from local state
        setSelections(prev => prev.filter(s => s._id !== selectionId));
      } catch (e) {
        console.error('Delete error:', e);
        toast.error(e.message || 'Failed to delete record');
      }
    };
 

  useEffect(() => {
    const API_BASE = import.meta.env.VITE_API_BASE || 'https://udrive-backend-1igb.vercel.app';
    const managerFilter = selectedManagers?.filter || '';
    
    // Fetch managers for dropdown
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/api/managers`);
        if (!res.ok) throw new Error(`Failed to load managers: ${res.status}`);
        const data = await res.json();
        setManagers(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Error loading managers:', err);
        setManagers([]);
      }
    })();

    // Fetch payments by manager if selected, else fetch all
    const fetchPayments = async () => {
      setLoading(true);
      try {
        let url = `${API_BASE}/api/driver-plan-selections`;
        if (managerFilter) {
          url = `${API_BASE}/api/driver-plan-selections/by-manager/${encodeURIComponent(managerFilter)}`;
          console.log('Fetching payments for manager:', managerFilter, 'URL:', url);
        } else {
          console.log('Fetching all payments');
        }
        const res = await fetch(url);
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({ message: `HTTP ${res.status}` }));
          throw new Error(errorData.message || `Failed to load payments: ${res.status}`);
        }
        const data = await res.json();
        console.log('Payments data received:', data.length || 0, 'records');
        // Group by driverMobile or driverUsername
        const grouped = {};
        (Array.isArray(data) ? data : []).forEach(s => {
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
  }, [selectedManagers?.filter]);

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
      const API_BASE = import.meta.env.VITE_API_BASE || 'https://udrive-backend-1igb.vercel.app';
      const res = await fetch(`${API_BASE}/api/driver-plan-selections`);
      if (!res.ok) throw new Error('Failed to load driver payments');
      const data = await res.json();
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
    // Calculate days (inclusive)
    let days = 0;
    if (s.rentStartDate) {
      const start = new Date(s.rentStartDate);
      let end = new Date();
      if (s.status === 'inactive' && s.rentPausedDate) {
        end = new Date(s.rentPausedDate);
      }
      // Normalize to midnight for both dates
      const startMidnight = new Date(start.getFullYear(), start.getMonth(), start.getDate());
      const endMidnight = new Date(end.getFullYear(), end.getMonth(), end.getDate());
      days = Math.floor((endMidnight - startMidnight) / (1000 * 60 * 60 * 24)) + 1;
      days = Math.max(1, days);
    }

    // Rent per day/week
    const rentPerDay = s.calculatedRent || (() => {
      const slab = s.selectedRentSlab || {};
      return s.planType === 'weekly' ? (slab.weeklyRent || 0) : (slab.rentDay || 0);
    })();
    // Accidental cover for weekly plans
    const accidentalCover = s.planType === 'weekly' ? (s.calculatedCover || (s.selectedRentSlab?.accidentalCover || 105)) : 0;

    // Adjustment logic
    const adjustment = s.adjustmentAmount || 0;
    // Deposit paid after adjustment
    const depositPaid = (s.paidAmount || 0) + adjustment;
    // Deposit due
    let depositDue = 0;
    if (s.paymentType === 'security') {
      depositDue = Math.max(0, (s.securityDeposit || 0) - depositPaid);
    } else {
      depositDue = s.securityDeposit || 0;
    }

    // Rent due after adjustment
    let rentDue = 0;
    if (s.paidAmount && s.paymentType === 'rent') {
      rentDue = Math.max(0, (days * rentPerDay) - (s.paidAmount || 0) - adjustment);
    } else {
      rentDue = Math.max(0, (days * rentPerDay) - adjustment);
    }

    // Total calculation
    const extraAmount = s.extraAmount || 0;
    const total = depositDue + rentDue + accidentalCover + extraAmount;
    return total;
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
    const rows = filtered.map(s => {
      const deposit = s.calculatedDeposit || s.securityDeposit || 0;
      const rent = s.calculatedRent || (() => {
        const slab = s.selectedRentSlab || {};
        return s.planType === 'weekly' ? (slab.weeklyRent || 0) : (slab.rentDay || 0);
      })();
      const cover = s.calculatedCover || (() => {
        const slab = s.selectedRentSlab || {};
        return s.planType === 'weekly' ? (slab.accidentalCover || 105) : 0;
      })();
      const total = s.calculatedTotal || (deposit + rent + cover);
      
      return {
        'Driver Name': s.driverUsername || 'N/A',
        'Driver Mobile': s.driverMobile || 'N/A',
        'Plan Name': s.planName,
        'Plan Type': s.planType,
        'Security Deposit': deposit,
        'Rent Amount': rent,
        'Accidental Cover': cover,
        'Total Amount': total,
        'Payment Mode': s.paymentMode || 'N/A',
        'Payment Status': s.paymentStatus,
        'Payment Date': s.paymentDate ? formatDate(s.paymentDate) : 'N/A',
        'Selected Date': s.selectedDate ? formatDate(s.selectedDate) : 'N/A',
        'ID': s._id,
      };
    });
    const header = Object.keys(rows[0]).join(',');
    const body = rows.map(r => Object.values(r).join(',')).join('\n');
    const csv = `${header}\n${body}`;
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `driver-payments-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Exported driver payments');
  };

  const handleViewDetails = async (selectionId) => {
    try {
      const API_BASE = import.meta.env.VITE_API_BASE || 'https://udrive-backend-1igb.vercel.app';
      const res = await fetch(`${API_BASE}/api/driver-plan-selections/${selectionId}`);
      if (!res.ok) throw new Error('Failed to load details');
      const data = await res.json();
      setSelectedDetail(data);
      setShowDetailModal(true);
    } catch (e) {
      console.error(e);
      toast.error('Failed to load payment details');
    }
  };

  const handleStatusChange = async (selectionId, newStatus) => {
    try {
      const API_BASE = import.meta.env.VITE_API_BASE || 'https://udrive-backend-1igb.vercel.app';
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
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Driver Payments</h1>
          <p className="text-gray-600">See who paid for driver plan selections</p>
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
            {/* Manager Filter Dropdown */}
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


      <Card>
        <CardHeader>
          <CardTitle>Driver Payment Records</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Driver</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Security Deposit</TableHead>
                  <TableHead>Total Payment</TableHead>
                  <TableHead>Daily Rent</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead>Payment Status</TableHead>
                  <TableHead>Plan Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
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
                              <p className="text-[10px] text-gray-400">ID: {first._id.slice(-6)}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell colSpan={8}>
                          {/* Nested table for transactions */}
                          <div className="overflow-x-auto">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Plan</TableHead>
                                  <TableHead>Security Deposit</TableHead>
                                  <TableHead>Total Payment</TableHead>
                                  <TableHead>Daily Rent</TableHead>
                                  <TableHead>Payment</TableHead>
                                  <TableHead>Payment Status</TableHead>
                                  <TableHead>Plan Status</TableHead>
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
                                      </div>
                                    </TableCell>
                                    <TableCell>
                                      <p className="font-semibold">₹{(s.securityDeposit||0).toLocaleString('en-IN')}</p>
                                      {/* Show deposit paid if available */}
                                      {s.paymentType === 'security' && s.paidAmount !== null && s.paidAmount !== undefined && (
                                        <div className="mt-1 pt-1 border-t border-gray-200">
                                          <p className="text-xs font-semibold text-green-600">Deposit Paid: ₹{s.paidAmount.toLocaleString('en-IN')}</p>
                                        </div>
                                      )}
                                    </TableCell>
                                    <TableCell>
                                        <div className="space-y-1">
                                          <p className="font-bold text-blue-600">
                                            ₹{(computeTotal(s)).toLocaleString('en-IN')}
                                          </p>
                                          <p className="text-[11px] text-gray-500">
                                            Remaining Due = (Deposit Due + Rent Due + Accidental Cover + Extra Amount) 
                                          </p>
                                          <div className="text-[10px] text-gray-500 mt-1">
                                            <div>Deposit Due: ₹{(() => {
                                              const adjustment = s.adjustmentAmount || 0;
                                              const depositPaid = (s.paidAmount || 0) + adjustment;
                                              if (s.paymentType === 'security') {
                                                return Math.max(0, (s.securityDeposit || 0) - depositPaid).toLocaleString('en-IN');
                                              } else {
                                                return (s.securityDeposit || 0).toLocaleString('en-IN');
                                              }
                                            })()}</div>
                                            <div>Rent Due: ₹{(() => {
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
                                              const rentPerDay = s.calculatedRent || (() => {
                                                const slab = s.selectedRentSlab || {};
                                                return s.planType === 'weekly' ? (slab.weeklyRent || 0) : (slab.rentDay || 0);
                                              })();
                                              const adjustment = s.adjustmentAmount || 0;
                                              let rentDue = Math.max(0, (days * rentPerDay) - adjustment);
                                              if (s.paidAmount && s.paymentType === 'rent') {
                                                rentDue = Math.max(0, (days * rentPerDay) - (s.paidAmount || 0) - adjustment);
                                              }
                                              return rentDue.toLocaleString('en-IN');
                                            })()}</div>
                                            <div>Accidental Cover: ₹{s.planType === 'weekly' ? (s.calculatedCover || (s.selectedRentSlab?.accidentalCover || 105)).toLocaleString('en-IN') : '0'}</div>
                                            <div>Extra Amount: ₹{(s.extraAmount || 0).toLocaleString('en-IN')}</div>
                                            <div>Paid: ₹{(s.paidAmount || 0).toLocaleString('en-IN')}</div>
                                          </div>
                                          {/* Show all due calculated amounts below */}
                                          <div className="mt-1">
                                           
                                            {/* Extra Amount Due and Reason */}
                                            {s.extraAmount > 0 && (
                                              <p className="text-xs text-yellow-700">Extra Amount: ₹{s.extraAmount.toLocaleString('en-IN')}</p>
                                            )}
                                            {s.extraAmount > 0 && s.extraReason && (
                                              <p className="text-xs text-gray-700">Reason: {s.extraReason}</p>
                                            )}
                                          </div>
                                          {/* Show rent paid if available */}
                                          {s.paymentType === 'rent' && s.paidAmount !== null && s.paidAmount !== undefined && (
                                            <div className="mt-1 pt-1 border-t border-gray-200">
                                              <p className="text-xs font-semibold text-green-600">Rent Paid: ₹{s.paidAmount.toLocaleString('en-IN')}</p>
                                            </div>
                                          )}
                                          {/* Show all due amounts, extra amount, and reason */}
                                        
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                      {s.rentStartDate ? (
                                        (() => {
                                          const start = new Date(s.rentStartDate);
                                          let end = new Date();
                                          if (s.status === 'inactive' && s.rentPausedDate) {
                                            end = new Date(s.rentPausedDate);
                                          }
                                          // Normalize to midnight for both dates
                                          const startMidnight = new Date(start.getFullYear(), start.getMonth(), start.getDate());
                                          const endMidnight = new Date(end.getFullYear(), end.getMonth(), end.getDate());
                                          let days = Math.floor((endMidnight - startMidnight) / (1000 * 60 * 60 * 24)) + 1;
                                          days = Math.max(1, days);
                                              const rentPerDay = rentSummaries[s._id]?.rentPerDay || 0;
                                          // Always show rent due as days * rentPerDay minus adjustment unless rent is actually paid
                                          const adjustment = s.adjustmentAmount || 0;
                                          let rentDue = Math.max(0, (days * rentPerDay) - adjustment);
                                          if (s.paidAmount && s.paymentType === 'rent') {
                                            rentDue = Math.max(0, (days * rentPerDay) - (s.paidAmount || 0) - adjustment);
                                          }
                                          return (
                                            <div className="space-y-1">
                                              <p className="text-xs text-gray-600">
                                                <span className="font-semibold">Days:</span> {days}
                                              </p>
                                              <p className="text-xs text-gray-600">
                                                <span className="font-semibold">Rent/Day:</span> ₹{rentPerDay.toLocaleString('en-IN')}
                                              </p>
                                              {/* Deposit paid/due status */}
                                              {((s.securityDeposit || 0) > 0) && (
                                                <p className="text-xs">
                                                  <span className="font-semibold">Deposit: </span>
                                                  {(s.paymentType === 'security' && (s.paidAmount || 0) >= (s.securityDeposit || 0)) ? (
                                                    <span className="text-green-600 font-semibold">Paid ₹{(s.paidAmount || 0).toLocaleString('en-IN')}</span>
                                                  ) : (
                                                    <span className="text-orange-600 font-semibold">Due ₹{((s.securityDeposit || 0) - (s.paymentType === 'security' ? (s.paidAmount || 0) : 0)).toLocaleString('en-IN')}</span>
                                                  )}
                                                </p>
                                              )}
                                              {/* Rent due status */}
                                              <p className="text-xs font-semibold text-orange-600">
                                                Rent Due: ₹{rentDue.toLocaleString('en-IN')}
                                              </p>
                                              <div className="flex items-center gap-3">
                                                <p className="text-xs font-semibold text-yellow-600 whitespace-nowrap">
                                                  Adjustment Amount :
                                                </p>
                                                <input
                                                  type="number"
                                                  className="border border-gray-300 rounded px-2 py-1 text-xs w-24"
                                                  placeholder="0"
                                                  value={adjustmentInputs[s._id] ?? ''}
                                                  onChange={e => setAdjustmentInputs(prev => ({
                                                    ...prev,
                                                    [s._id]: e.target.value
                                                  }))}
                                                  />
                                                <button
                                                  className="bg-yellow-600 text-white text-xs px-3 py-1 rounded"
                                                  onClick={() => handleSaveAdjustment(s._id)}
                                                >
                                                  Save
                                                </button>
                                              </div>
                                              <div className="flex items-center gap-4 bg-gray-50 p-3 rounded-lg border border-gray-200 w-full">
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
                                                  className="border border-gray-300 rounded-md px-3 py-1.5 text-xs flex-1 focus:outline-none focus:ring-2 focus:ring-yellow-500"
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
                                            </div>
                                          );
                                        })()
                                      ) : (
                                        <div className="text-xs text-gray-500">Not started</div>
                                      )}
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
                                      {/* Plan Status Dropdown */}
                                      <div className="space-y-2">
                                        <div className="relative status-dropdown">
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              setOpenDropdown(openDropdown === s._id ? null : s._id);
                                            }}
                                            className={`flex items-center justify-between gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all shadow-md min-w-[120px] ${
                                              s.status === 'active' 
                                                ? 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700' 
                                                : 'bg-gradient-to-r from-gray-400 to-gray-500 text-white hover:from-gray-500 hover:to-gray-600'
                                            }`}
                                            title="Click to change plan status"
                                          >
                                            <span className="flex items-center gap-2">
                                              <span className={`w-2 h-2 rounded-full ${s.status === 'active' ? 'bg-white' : 'bg-gray-200'} animate-pulse`}></span>
                                              {s.status === 'active' ? 'Active' : 'Inactive'}
                                            </span>
                                            <ChevronDown className={`h-4 w-4 transition-transform ${openDropdown === s._id ? 'rotate-180' : ''}`} />
                                          </button>
                                          
                                          {openDropdown === s._id && (
                                            <div className="absolute left-0 mt-2 w-48 bg-white rounded-xl shadow-2xl border-2 border-gray-200 z-50 overflow-hidden">
                                              <button
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  handleStatusChange(s._id, 'active');
                                                }}
                                                className={`w-full px-4 py-3 text-left text-sm font-semibold transition-all flex items-center gap-3 ${
                                                  s.status === 'active' 
                                                    ? 'bg-green-50 text-green-800 border-l-4 border-green-600' 
                                                    : 'text-gray-700 hover:bg-green-50 hover:text-green-700'
                                                }`}
                                              >
                                                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-green-100 text-green-600">
                                                  ✓
                                                </span>
                                                <span>Active</span>
                                                {s.status === 'active' && <span className="ml-auto text-green-600">●</span>}
                                              </button>
                                              <div className="border-t-2 border-gray-100"></div>
                                              <button
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  handleStatusChange(s._id, 'inactive');
                                                }}
                                                className={`w-full px-4 py-3 text-left text-sm font-semibold transition-all flex items-center gap-3 ${
                                                  s.status === 'inactive' 
                                                    ? 'bg-gray-50 text-gray-800 border-l-4 border-gray-600' 
                                                    : 'text-gray-700 hover:bg-gray-50'
                                                }`}
                                              >
                                                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-gray-100 text-gray-600">
                                                  ✕
                                                </span>
                                                <span>Inactive</span>
                                                {s.status === 'inactive' && <span className="ml-auto text-gray-600">●</span>}
                                              </button>
                                            </div>
                                          )}
                                        </div>
                                        {/* Rent Status Info */}
                                        {/* {s.rentStartDate && (
                                          <div className="text-xs">
                                            {s.status === 'active' ? (
                                              rentSummaries[s._id]?.hasStarted ? (
                                                <div className="bg-green-50 border border-green-200 rounded px-2 py-1 text-green-700">
                                                  <div className="font-semibold">Rent Calculating</div>
                                                  <div>Days: {rentSummaries[s._id]?.totalDays || 0}</div>
                                                  <div>Due: ₹{(rentSummaries[s._id]?.totalDue || 0).toLocaleString('en-IN')}</div>
                                                </div>
                                              ) : (
                                                <div className="text-gray-500">Loading...</div>
                                              )
                                            ) : (
                                              <div className="bg-red-50 border border-red-200 rounded px-2 py-1 text-red-700">
                                                <div className="font-semibold">⚠ Rent Stopped</div>
                                                <div className="text-[10px]">Calculation paused</div>
                                              </div>
                                            )}
                                          </div>
                                        )} */}
                                      </div>
                                    </TableCell>
                                    <TableCell>
                                      <div className="flex gap-2">
                                        <button
                                          onClick={() => handleViewDetails(s._id)}
                                          className="text-primary-600 hover:text-primary-700 flex items-center gap-1 text-sm font-medium"
                                        >
                                          <Eye className="h-4 w-4" />
                                          View
                                        </button>
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

      {/* Payment Detail Modal */}
      {selectedDetail && showDetailModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Payment Details</h2>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Driver Information */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Driver Information
                </h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Name:</span>
                    <span className="text-sm font-medium">{selectedDetail.driverUsername || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Mobile:</span>
                    <span className="text-sm font-medium">{selectedDetail.driverMobile}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Plan:</span>
                    <span className="text-sm font-medium">{selectedDetail.planName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Plan Type:</span>
                    <span className="text-sm font-medium capitalize">{selectedDetail.planType}</span>
                  </div>
                </div>
              </div>

              {/* Payment Breakdown */}
              {selectedDetail.paymentBreakdown && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <CreditCard className="h-4 w-4" />
                    Payment Breakdown
                  </h3>
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Security Deposit:</span>
                      <span className="text-lg font-semibold text-gray-900">
                        ₹{selectedDetail.paymentBreakdown.securityDeposit.toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">{selectedDetail.paymentBreakdown.rentType === 'weeklyRent' ? 'Weekly Rent' : 'Daily Rent'}:</span>
                      <span className="text-lg font-semibold text-gray-900">
                        ₹{selectedDetail.paymentBreakdown.rent.toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Accidental Cover:</span>
                      <span className="text-lg font-semibold text-gray-900">
                        ₹{selectedDetail.paymentBreakdown.accidentalCover.toLocaleString('en-IN')}
                      </span>
                    </div>
                    {selectedDetail.paymentBreakdown.extraAmount > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Extra Amount:</span>
                        <span className="text-lg font-semibold text-gray-900">
                          ₹{selectedDetail.paymentBreakdown.extraAmount.toLocaleString('en-IN')}
                        </span>
                      </div>
                    )}
                    <div className="border-t border-blue-200 pt-3 mt-3">
                      <div className="flex justify-between items-center">
                        <span className="text-base font-bold text-gray-900">Remaining Due:</span>
                        <span className="text-2xl font-bold text-blue-600">
                          ₹{(selectedDetail.paymentBreakdown.totalAmount - (selectedDetail.paidAmount || 0)).toLocaleString('en-IN')}
                        </span>
                        <div className="text-xs text-gray-500 mt-2">
                          <div>Calculation: (Deposit Due + Rent Due + Accidental Cover + Extra Amount) - Paid</div>
                          <div>Deposit Due: ₹{selectedDetail.paymentBreakdown.securityDeposit.toLocaleString('en-IN')}</div>
                          <div>Rent Due: ₹{selectedDetail.paymentBreakdown.rent.toLocaleString('en-IN')}</div>
                          <div>Accidental Cover: ₹{selectedDetail.paymentBreakdown.accidentalCover.toLocaleString('en-IN')}</div>
                          <div>Extra Amount: ₹{selectedDetail.paymentBreakdown.extraAmount.toLocaleString('en-IN')}</div>
                          <div>Paid: ₹{(selectedDetail.paidAmount || 0).toLocaleString('en-IN')}</div>
                        </div>
                      </div>
                    </div>
                    {selectedDetail.paymentBreakdown.extraAmount > 0 && selectedDetail.paymentBreakdown.extraReason && (
                      <div className="mt-2 text-xs text-gray-700">
                        <span className="font-semibold">Extra Reason:</span> {selectedDetail.paymentBreakdown.extraReason}
                      </div>
                    )}
                    {selectedDetail.paidAmount !== null && selectedDetail.paidAmount !== undefined && (
                      <div className="border-t border-green-200 pt-3 mt-3 bg-green-50 -mx-4 -mb-4 px-4 pb-4 rounded-b-lg">
                        <div className="flex justify-between items-center">
                          <span className="text-base font-bold text-green-800">Amount Paid (Manual Entry):</span>
                          <span className="text-2xl font-bold text-green-600">
                            ₹{selectedDetail.paidAmount.toLocaleString('en-IN')}
                          </span>
                        </div>
                        {selectedDetail.paidAmount !== selectedDetail.paymentBreakdown.totalAmount && (
                          <p className="text-xs text-green-700 mt-2">
                            {selectedDetail.paidAmount < selectedDetail.paymentBreakdown.totalAmount 
                              ? `Partial payment (₹${(selectedDetail.paymentBreakdown.totalAmount - selectedDetail.paidAmount).toLocaleString('en-IN')} remaining)`
                              : `Overpayment by ₹${(selectedDetail.paidAmount - selectedDetail.paymentBreakdown.totalAmount).toLocaleString('en-IN')}`
                            }
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Payment Status */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <Wallet className="h-4 w-4" />
                  Payment Status
                </h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Payment Mode:</span>
                    {getModeBadge(selectedDetail.paymentMode)}
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Payment Method:</span>
                    <span className="text-sm font-medium">{selectedDetail.paymentMethod || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Status:</span>
                    {getStatusBadge(selectedDetail.paymentStatus)}
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Payment Date:</span>
                    <span className="text-sm font-medium">
                      {selectedDetail.paymentDate ? formatDate(selectedDetail.paymentDate) : 'Not paid yet'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Selected Date:</span>
                    <span className="text-sm font-medium">
                      {selectedDetail.selectedDate ? formatDate(selectedDetail.selectedDate) : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200">
              <button
                onClick={() => setShowDetailModal(false)}
                className="btn btn-secondary w-full"
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