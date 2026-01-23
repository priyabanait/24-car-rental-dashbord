import { useState, useEffect } from "react";
import {
  Users,
  UserPlus,
  Search,
  Filter,
  Edit,
  Trash2,
  Mail,
  Phone,
  Home,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Car,
  FileText,
  UserCheck,
  AlertCircle,
  
} from "lucide-react";

import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell
} from "../../components/ui/Table";
import { Modal } from "../../components/ui/Modal";
import { api } from "../../utils/api";
import toast from "react-hot-toast";

export default function ResidentsManagement() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");
  const [showModal, setShowModal] = useState(false);
  const [editingResident, setEditingResident] = useState(null);
  const [viewingResident, setViewingResident] = useState(null);
  const [viewingFamily, setViewingFamily] = useState(null);

  const [residents, setResidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingFamily, setLoadingFamily] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        // Fetch registered members from new endpoint
        const res = await api.get('/api/users/registered-members');
        const members = res?.members || res?.data || [];
        
        // Transform the data to match the expected format
        const list = members.map(m => {
          // Try both _id and id fields for residentId
          const residentId = m.resident?._id || m.resident?.id;
          
          // Capitalize status from User model
          const userStatus = m.status || 'pending';
          const capitalizedStatus = userStatus.charAt(0).toUpperCase() + userStatus.slice(1);
          
          return {
            id: m.userId,
            residentId: residentId, // Store the actual Resident document ID
            name: m.resident?.fullName || m.username || '-',
            email: m.resident?.email || '-',
            phone: m.mobile,
            alternateMobile: m.resident?.alternateMobile || '-',
            flatNo: m.resident?.flatNumber || '-',
            tower: m.resident?.buildingName || '-',
            floorNumber: m.resident?.floorNumber || '-',
            flatType: m.resident?.flatType || '-',
            type: m.resident?.ownershipType || '-',
            moveInDate: m.resident?.moveInDate || m.createdAt,
            status: capitalizedStatus,
            isPrimary: true,
            // Additional details from registration
            gender: m.resident?.gender || '-',
            dateOfBirth: m.resident?.dateOfBirth || null,
            governmentIdNumber: m.resident?.governmentIdNumber || '-',
            societyName: m.resident?.societyName || '-',
            numberOfFamilyMembers: m.resident?.numberOfFamilyMembers || 1,
            familyMembers: m.resident?.familyMembers || [],
            emergencyContactName: m.resident?.emergencyContactName || '-',
            emergencyContactNumber: m.resident?.emergencyContactNumber || '-',
            vehicles: m.resident?.vehicles || [],
            documents: m.resident?.documents || {},
            approvedBy: m.resident?.approvedBy || '-',
            approvedAt: m.resident?.approvedAt || null,
            remarks: m.resident?.remarks || '',
            registeredAt: m.createdAt,
            lastLogin: m.lastLogin
          };
        });
        
        setResidents(list);
      } catch (err) {
        console.error('Failed to load registered members:', err);
        toast.error(err.message || 'Failed loading registered members');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const stats = {
    total: residents.length,
    active: residents.filter(r => r.status === "Active").length,
    pending: residents.filter(r => r.status === "Pending").length,
    owners: residents.filter(r => r.type === "Owner").length
  };

  const filteredResidents = residents.filter((r) => {
    const matchesSearch = 
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.email.toLowerCase().includes(search.toLowerCase()) ||
      r.phone.includes(search) ||
      r.flatNo.includes(search);
    
    const matchesStatus = statusFilter === "All" || r.status === statusFilter;
    const matchesType = typeFilter === "All" || r.type === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  const handleSaveResident = async (residentData) => {
    try {
      if (editingResident) {
        const updated = await api.put(`/api/residents/${editingResident.residentId || editingResident.id}`, {
          fullName: residentData.name,
          email: residentData.email,
          mobile: residentData.phone,
          buildingName: residentData.tower,
          flatNumber: residentData.flatNo,
          ownershipType: residentData.type,
          moveInDate: residentData.moveInDate
        });
        const r = updated?.member || updated?.data;
        setResidents(residents.map(x => x.id === editingResident.id ? {
          ...x,
          name: r.fullName || residentData.name,
          email: r.email || residentData.email,
          phone: r.mobile || residentData.phone,
          flatNo: r.flatNumber || residentData.flatNo,
          tower: r.buildingName || residentData.tower,
          type: r.ownershipType || residentData.type,
          moveInDate: r.moveInDate || residentData.moveInDate
        } : x));
        toast.success('Resident updated');
      } else {
        const created = await api.post('/api/residents', {
          fullName: residentData.name,
          email: residentData.email,
          mobile: residentData.phone,
          societyName: residentData.societyName || 'Default Society',
          buildingName: residentData.tower,
          flatNumber: residentData.flatNo,
          ownershipType: residentData.type,
          moveInDate: residentData.moveInDate
        });
        const r = created?.member || created?.data;
        setResidents([...residents, {
          id: r._id,
          name: r.fullName,
          email: r.email,
          phone: r.mobile,
          flatNo: r.flatNumber || '-',
          tower: r.buildingName || '-',
          type: r.ownershipType,
          moveInDate: r.moveInDate,
          status: 'Pending',
          isPrimary: true
        }]);
        toast.success('Resident added');
      }
    } catch (err) {
      toast.error(err.message || 'Failed to save resident');
    } finally {
      setShowModal(false);
      setEditingResident(null);
    }
  };

  const handleDeleteResident = async (id) => {
    if (!confirm('Are you sure you want to delete this resident?')) return;
    try {
      await api.del(`/api/residents/${id}`);
      setResidents(residents.filter(r => r.id !== id));
      toast.success('Resident deleted');
    } catch (err) {
      toast.error(err.message || 'Failed to delete resident');
    }
  };

  const handleApprove = async (id) => {
    try {
      const updated = await api.put(`/api/residents/${id}/approve`, { approvedBy: 'Admin' });
      setResidents(residents.map(x => x.id === id ? { ...x, status: 'Active' } : x));
      toast.success('Resident approved successfully');
    } catch (err) {
      console.error('Approval error:', err);
      toast.error(err.message || 'Approval failed');
    }
  };

  const handleReject = async (id) => {
    if (!confirm('Are you sure you want to reject this resident?')) return;
    try {
      await api.del(`/api/residents/${id}`);
      setResidents(residents.filter(r => r.id !== id));
      toast.success('Resident rejected & removed');
    } catch (err) {
      console.error('Reject error:', err);
      toast.error(err.message || 'Reject failed');
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      if (newStatus === 'Active') {
        await api.put(`/api/residents/${id}/approve`, { approvedBy: 'Admin' });
      } else {
        // Update status directly
        await api.put(`/api/residents/${id}`, { status: newStatus.toLowerCase() });
      }
      setResidents(residents.map(x => x.id === id ? { ...x, status: newStatus } : x));
      toast.success(`Status updated to ${newStatus}`);
    } catch (err) {
      console.error('Status change error:', err);
      toast.error(err.message || 'Failed to update status');
    }
  };

  const handleViewFamily = async (resident) => {
    try {
      setLoadingFamily(true);
      
      console.log('handleViewFamily called with:', resident);
      console.log('residentId:', resident?.residentId);
      
      // Use residentId if available, otherwise try to fetch by mobile
      if (!resident || !resident.residentId) {
        console.error('No residentId found for resident:', resident);
        toast.error('Resident ID not found. Cannot load family details.');
        return;
      }
      
      console.log('Fetching family details for residentId:', resident.residentId);
      const response = await api.get(`/api/residents/${resident.residentId}/with-family`);
      console.log('Family details response:', response);
      
      if (response.success) {
        setViewingFamily(response.data);
      } else {
        toast.error('Failed to load family details');
      }
    } catch (err) {
      console.error('Error loading family details:', err);
      toast.error(err.message || 'Failed to load family details');
    } finally {
      setLoadingFamily(false);
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Residents Management</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage society residents, owners, and tenants - {residents.length} registered members
          </p>
        </div>

        <button 
          onClick={() => { setEditingResident(null); setShowModal(true); }}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
        >
          <UserPlus size={18} />
          Add Resident
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading registered members...</p>
          </div>
        </div>
      ) : (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <StatCard 
              title="Total Residents" 
              value={stats.total} 
              icon={<Users size={24} />}
              color="blue"
            />
            <StatCard 
              title="Active Residents" 
              value={stats.active} 
              icon={<CheckCircle size={24} />}
              color="green"
            />
            <StatCard 
              title="Pending Approval" 
              value={stats.pending} 
              icon={<Clock size={24} />}
              color="yellow"
            />
            <StatCard 
              title="Owners" 
              value={stats.owners} 
              icon={<Home size={24} />}
              color="indigo"
            />
          </div>

      {/* Search & Filters */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex flex-wrap gap-4 items-center">
        <div className="relative flex-1 min-w-[280px]">
          <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search by name, email, phone, or flat..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="All">All Status</option>
          <option>Active</option>
          <option>Pending</option>
          <option>Inactive</option>
        </select>

        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="All">All Types</option>
          <option>Owner</option>
          <option>Tenant</option>
          <option>Family Member</option>
        </select>
      </div>

      {/* Residents Table */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h2 className="text-lg font-semibold text-gray-900">
            Residents List ({filteredResidents.length})
          </h2>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Flat Details</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Move-In Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
  {filteredResidents.map((resident) => (
    <TableRow
      key={resident.id}
      className="hover:bg-blue-50 cursor-pointer transition-colors"
     
    >
      <TableCell>
        <div>
          <div className="font-medium text-gray-900">{resident.name}</div>
          {resident.isPrimary && (
            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
              Primary
            </span>
          )}
        </div>
      </TableCell>

      <TableCell>
        <div className="space-y-1 text-sm">
          <div className="flex items-center gap-1 text-gray-600">
            <Mail size={14} />
            <span>{resident.email}</span>
          </div>
          <div className="flex items-center gap-1 text-gray-600">
            <Phone size={14} />
            <span>{resident.phone}</span>
          </div>
        </div>
      </TableCell>

      <TableCell>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-700 rounded-full font-semibold text-sm">
            {resident.tower}
          </span>
          <span className="font-medium">{resident.flatNo}</span>
        </div>
      </TableCell>

      <TableCell>
        <span
          className={`px-2.5 py-1 rounded-md text-sm font-medium ${
            resident.type === 'Owner'
              ? 'bg-purple-100 text-purple-700'
              : resident.type === 'Tenant'
              ? 'bg-orange-100 text-orange-700'
              : 'bg-gray-100 text-gray-700'
          }`}
        >
          {resident.type}
        </span>
      </TableCell>

      <TableCell className="text-sm text-gray-600">
        {new Date(resident.moveInDate).toLocaleDateString()}
      </TableCell>

    <TableCell className="align-middle">
  <div className="flex items-center">
    <select
      value={resident.status}
      onChange={(e) => {
        e.stopPropagation();
        handleStatusChange(resident.id, e.target.value);
      }}
      className={`min-w-[100px] h-10 px-2 rounded-md text-sm font-medium border-0 cursor-pointer
        focus:ring-2 focus:ring-blue-500 focus:outline-none appearance-none ${
          resident.status === 'Active'
            ? 'bg-green-100 text-green-700'
            : resident.status === 'Pending'
            ? 'bg-yellow-100 text-yellow-700'
            : 'bg-gray-100 text-gray-700'
        }`}
      title="Change Status"
    >
      <option value="Active">Active</option>
      <option value="Pending">Pending</option>
      <option value="Inactive">Inactive</option>
    </select>
  </div>
</TableCell>


      <TableCell className="text-right">
        <div
          className="flex justify-end gap-2"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Family Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleViewFamily(resident);
            }}
            className="p-1.5 hover:bg-green-50 rounded-md transition-colors"
            title="View Family"
          >
            <Users size={16} className="text-green-600" />
          </button>

          {/* View */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setViewingResident(resident);
            }}
            className="p-1.5 hover:bg-indigo-50 rounded-md transition-colors"
            title="View Details"
          >
            <Eye size={16} className="text-indigo-600" />
          </button>

          {/* Edit */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setEditingResident(resident);
              setShowModal(true);
            }}
            className="p-1.5 hover:bg-blue-50 rounded-md transition-colors"
            title="Edit"
          >
            <Edit size={16} className="text-blue-600" />
          </button>

          {/* Delete */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteResident(resident.id);
            }}
            className="p-1.5 hover:bg-red-50 rounded-md transition-colors"
            title="Delete"
          >
            <Trash2 size={16} className="text-red-600" />
          </button>
        </div>
      </TableCell>
    </TableRow>
  ))}
</TableBody>

          </Table>
        </div>
      </div>

      {/* Modals */}
      {showModal && (
        <ResidentModal
          resident={editingResident}
          onClose={() => { setShowModal(false); setEditingResident(null); }}
          onSave={handleSaveResident}
        />
      )}

      {viewingFamily && (
        <FamilyMembersModal
          familyData={viewingFamily}
          loading={loadingFamily}
          onClose={() => setViewingFamily(null)}
        />
      )}

      {viewingResident && (
        <ResidentDetailsModal
          resident={viewingResident}
          onClose={() => setViewingResident(null)}
        />
      )}
      </>
      )}
    </div>
  );
}

/* Stat Card Component */
function StatCard({ title, value, icon, color = "blue" }) {
  const colorClasses = {
    blue: "bg-blue-100 text-blue-600",
    green: "bg-green-100 text-green-600",
    yellow: "bg-yellow-100 text-yellow-600",
    indigo: "bg-indigo-100 text-indigo-600"
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-xl ${colorClasses[color]}`}>
          {icon}
        </div>
        <div>
          <p className="text-sm text-gray-500 font-medium">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
        </div>
      </div>
    </div>
  );
}

/* Resident Modal */
function ResidentModal({ resident, onClose, onSave }) {
  const [formData, setFormData] = useState(resident || {
    name: "",
    email: "",
    phone: "",
    flatNo: "",
    tower: "",
    societyName: "",
    type: "Owner",
    moveInDate: "",
    status: "Pending",
    isPrimary: true,
    emergencyContact: {
      name: "",
      phone: "",
      relation: ""
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Modal isOpen={true} onClose={onClose} title={resident ? "Edit Resident" : "Add New Resident"}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Enter full name"
            />
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Society Name *</label>
            <input
              type="text"
              required
              value={formData.societyName}
              onChange={(e) => setFormData({ ...formData, societyName: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Enter society name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="email@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
            <input
              type="tel"
              required
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="+91 9876543210"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tower *</label>
            <select
              required
              value={formData.tower}
              onChange={(e) => setFormData({ ...formData, tower: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Tower</option>
              <option>A</option>
              <option>B</option>
              <option>C</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Flat Number *</label>
            <input
              type="text"
              required
              value={formData.flatNo}
              onChange={(e) => setFormData({ ...formData, flatNo: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., 101"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Resident Type *</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option>Owner</option>
              <option>Tenant</option>
              <option>Family Member</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Move-In Date *</label>
            <input
              type="date"
              required
              value={formData.moveInDate}
              onChange={(e) => setFormData({ ...formData, moveInDate: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="border-t pt-4">
          <h3 className="text-sm font-medium text-gray-900 mb-3">Emergency Contact (Optional)</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                type="text"
                value={formData.emergencyContact?.name || ""}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  emergencyContact: { ...formData.emergencyContact, name: e.target.value }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Contact name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input
                type="tel"
                value={formData.emergencyContact?.phone || ""}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  emergencyContact: { ...formData.emergencyContact, phone: e.target.value }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="+91 9876543210"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Relation</label>
              <input
                type="text"
                value={formData.emergencyContact?.relation || ""}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  emergencyContact: { ...formData.emergencyContact, relation: e.target.value }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Spouse, Parent, Sibling"
              />
            </div>
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            {resident ? "Update" : "Add"} Resident
          </button>
        </div>
      </form>
    </Modal>
  );
}

/* Resident Details Modal - View All Registration Info */
function ResidentDetailsModal({ resident, onClose }) {
  if (!resident) return null;

  return (
    <Modal isOpen={true} onClose={onClose} title="Resident Details">
      <div className="space-y-6 max-h-[70vh] overflow-y-auto">
        {/* Personal Information */}
        <section>
          <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Users size={18} className="text-blue-600" />
            Personal Information
          </h3>
          <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
            <DetailItem label="Full Name" value={resident.name} />
            <DetailItem label="Gender" value={resident.gender} />
            <DetailItem label="Date of Birth" value={resident.dateOfBirth ? new Date(resident.dateOfBirth).toLocaleDateString() : '-'} />
            <DetailItem label="Mobile" value={resident.phone} />
            <DetailItem label="Alternate Mobile" value={resident.alternateMobile} />
            <DetailItem label="Email" value={resident.email} />
            <DetailItem label="Government ID" value={resident.governmentIdNumber} />
          </div>
        </section>

        {/* Society & Flat Details */}
        <section>
          <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Home size={18} className="text-blue-600" />
            Society & Flat Details
          </h3>
          <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
            <DetailItem label="Society Name" value={resident.societyName} />
            <DetailItem label="Building/Tower" value={resident.tower} />
            <DetailItem label="Flat Number" value={resident.flatNo} />
            <DetailItem label="Floor Number" value={resident.floorNumber} />
            <DetailItem label="Flat Type" value={resident.flatType} />
            <DetailItem label="Ownership Type" value={resident.type} />
            <DetailItem label="Move-In Date" value={new Date(resident.moveInDate).toLocaleDateString()} />
            <DetailItem label="Status" value={
              <span className={`px-2.5 py-1 rounded-md text-sm font-medium ${
                resident.status === "Active" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
              }`}>
                {resident.status}
              </span>
            } />
          </div>
        </section>

        {/* Family Details */}
        <section>
          <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Users size={18} className="text-blue-600" />
            Family Details
          </h3>
          <div className="bg-gray-50 p-4 rounded-lg space-y-3">
            <DetailItem label="Number of Family Members" value={resident.numberOfFamilyMembers} />
            {resident.familyMembers && resident.familyMembers.length > 0 && (
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Family Members:</p>
                <div className="space-y-2">
                  {resident.familyMembers.map((member, idx) => (
                    <div key={idx} className="bg-white p-3 rounded border border-gray-200">
                      <p className="font-medium">{member.name}</p>
                      <p className="text-sm text-gray-600">Relation: {member.relation} | Age: {member.age || 'N/A'}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <DetailItem label="Emergency Contact Name" value={resident.emergencyContactName} />
            <DetailItem label="Emergency Contact Number" value={resident.emergencyContactNumber} />
          </div>
        </section>

        {/* Vehicle Details */}
        {resident.vehicles && resident.vehicles.length > 0 && (
          <section>
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Car size={18} className="text-blue-600" />
              Vehicle Details
            </h3>
            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
              {resident.vehicles.map((vehicle, idx) => (
                <div key={idx} className="bg-white p-3 rounded border border-gray-200">
                  <p className="font-medium">{vehicle.vehicleType}</p>
                  <p className="text-sm text-gray-600">
                    Number: {vehicle.vehicleNumber || 'N/A'} | Parking: {vehicle.parkingSlotNumber || 'N/A'}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Documents */}
        {resident.documents && Object.keys(resident.documents).length > 0 && (
          <section>
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <FileText size={18} className="text-blue-600" />
              Documents
            </h3>
            <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
              {resident.documents.idProof && (
                <DetailItem label="ID Proof" value={
                  <a href={resident.documents.idProof} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                    View Document
                  </a>
                } />
              )}
              {resident.documents.addressProof && (
                <DetailItem label="Address Proof" value={
                  <a href={resident.documents.addressProof} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                    View Document
                  </a>
                } />
              )}
              {resident.documents.rentAgreement && (
                <DetailItem label="Rent Agreement" value={
                  <a href={resident.documents.rentAgreement} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                    View Document
                  </a>
                } />
              )}
              {resident.documents.photo && (
                <DetailItem label="Photo" value={
                  <a href={resident.documents.photo} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                    View Photo
                  </a>
                } />
              )}
            </div>
          </section>
        )}

        {/* Admin Information */}
        <section>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Admin Information</h3>
          <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
            <DetailItem label="Registered At" value={new Date(resident.registeredAt).toLocaleString()} />
            <DetailItem label="Last Login" value={resident.lastLogin ? new Date(resident.lastLogin).toLocaleString() : 'Never'} />
            {resident.approvedBy && <DetailItem label="Approved By" value={resident.approvedBy} />}
            {resident.approvedAt && <DetailItem label="Approved At" value={new Date(resident.approvedAt).toLocaleString()} />}
            {resident.remarks && (
              <div className="col-span-2">
                <DetailItem label="Remarks" value={resident.remarks} />
              </div>
            )}
          </div>
        </section>
      </div>

      <div className="mt-6 pt-4 border-t">
        <button
          onClick={onClose}
          className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
        >
          Close
        </button>
      </div>
    </Modal>
  );
}

/* Detail Item Helper Component */
function DetailItem({ label, value }) {
  return (
    <div>
      <p className="text-sm text-gray-500 font-medium mb-1">{label}</p>
      <p className="text-gray-900">{value || '-'}</p>
    </div>
  );
}

/* Family Members Modal - Shows all family members for a resident */
function FamilyMembersModal({ familyData, loading, onClose }) {
  if (!familyData) return null;

  const { resident, familyMembers, familyCount } = familyData;

  return (
    <Modal 
      isOpen={true} 
      onClose={onClose} 
      title={`Family Members - ${resident?.fullName || 'Resident'}`}
    >
      <div className="space-y-6 max-h-[70vh] overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading family details...</p>
            </div>
          </div>
        ) : (
          <>
            {/* Resident Summary */}
            <section className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {resident?.fullName}
                  </h3>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center gap-2 text-gray-700">
                      <Phone size={14} />
                      <span>{resident?.mobile}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-700">
                      <Mail size={14} />
                      <span>{resident?.email || 'N/A'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-700">
                      <Home size={14} />
                      <span>{resident?.flatNumber} {resident?.buildingName && `- ${resident.buildingName}`}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-700">
                      <UserCheck size={14} />
                      <span className={`font-medium ${
                        resident?.ownershipType === 'Owner' ? 'text-purple-700' : 'text-orange-700'
                      }`}>
                        {resident?.ownershipType}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Family Statistics */}
            <section className="grid grid-cols-3 gap-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                <Users size={24} className="text-blue-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-blue-900">{familyCount?.total || 0}</p>
                <p className="text-sm text-blue-700">Total Members</p>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                <CheckCircle size={24} className="text-green-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-green-900">{familyCount?.approved || 0}</p>
                <p className="text-sm text-green-700">Approved</p>
              </div>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
                <Clock size={24} className="text-yellow-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-yellow-900">{familyCount?.pending || 0}</p>
                <p className="text-sm text-yellow-700">Pending</p>
              </div>
            </section>

            {/* Family Members List */}
            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Users size={18} className="text-blue-600" />
                Family Members ({familyMembers?.length || 0})
              </h3>

              {!familyMembers || familyMembers.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
                  <Users size={48} className="text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600 font-medium">No family members added yet</p>
                  <p className="text-sm text-gray-500 mt-1">
                    The resident hasn't added any family members yet.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {familyMembers.map((member) => (
                    <FamilyMemberCard key={member._id} member={member} />
                  ))}
                </div>
              )}
            </section>

            {/* Additional Info */}
            {resident?.numberOfFamilyMembers && (
              <section className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle size={20} className="text-blue-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-blue-900">
                      Registered Family Members: {resident.numberOfFamilyMembers}
                    </p>
                    <p className="text-xs text-blue-700 mt-1">
                      This is the number declared during registration. 
                      Actual family members shown above may differ.
                    </p>
                  </div>
                </div>
              </section>
            )}
          </>
        )}
      </div>

      <div className="mt-6 pt-4 border-t flex gap-3">
        <button
          onClick={onClose}
          className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
        >
          Close
        </button>
      </div>
    </Modal>
  );
}

/* Family Member Card Component */
function FamilyMemberCard({ member }) {
  return (
    <div className={`bg-white border rounded-lg p-4 transition-all hover:shadow-md ${
      member.isApproved 
        ? 'border-green-200 hover:border-green-300' 
        : 'border-yellow-200 hover:border-yellow-300'
    }`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-semibold text-gray-900 text-lg">{member.name}</h4>
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
              member.isApproved 
                ? 'bg-green-100 text-green-700' 
                : 'bg-yellow-100 text-yellow-700'
            }`}>
              {member.isApproved ? 'Approved' : 'Pending'}
            </span>
          </div>
          <p className="text-sm text-gray-600">
            <span className="font-medium">Relation:</span> {member.relation}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm">
        {member.age && (
          <div>
            <p className="text-gray-500 font-medium">Age</p>
            <p className="text-gray-900">{member.age} years</p>
          </div>
        )}
        {member.gender && (
          <div>
            <p className="text-gray-500 font-medium">Gender</p>
            <p className="text-gray-900">{member.gender}</p>
          </div>
        )}
        {member.phone && (
          <div>
            <p className="text-gray-500 font-medium">Phone</p>
            <p className="text-gray-900 flex items-center gap-1">
              <Phone size={12} />
              {member.phone}
            </p>
          </div>
        )}
        {member.email && (
          <div>
            <p className="text-gray-500 font-medium">Email</p>
            <p className="text-gray-900 flex items-center gap-1">
              <Mail size={12} />
              {member.email}
            </p>
          </div>
        )}
      </div>

      {member.photo && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          <a 
            href={member.photo} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-sm text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-1"
          >
            <FileText size={14} />
            View Photo
          </a>
        </div>
      )}

      {member.isApproved && member.approvedBy && (
        <div className="mt-3 pt-3 border-t border-gray-200 text-xs text-gray-500">
          <p>
            Approved by {member.approvedBy.name || 'Admin'} on{' '}
            {new Date(member.approvedAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric'
            })}
          </p>
        </div>
      )}
    </div>
  );
}
