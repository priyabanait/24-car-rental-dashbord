import { useState, useEffect } from "react";
import {
  Building2,
  Home,
  Users,
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
ArrowLeft 
} from "lucide-react";

import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell
} from "../ui/Table";
import { Modal } from "../ui/Modal";
import api from "../../utils/api";
import toast from "react-hot-toast";
import { useAuth } from "../../contexts/AuthContext";

export default function TowersFlatsManagement() {
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [showTowerModal, setShowTowerModal] = useState(false);
  const [showFlatModal, setShowFlatModal] = useState(false);
  const [editingTower, setEditingTower] = useState(null);
  const [editingFlat, setEditingFlat] = useState(null);
  const [selectedTower, setSelectedTower] = useState(null); // Track selected tower for detail view
  
  const [towers, setTowers] = useState([]);
  const [flats, setFlats] = useState([]);
  
  // Default societyId for testing (in production, this should come from user context)
  const societyId = user?.societyId || "507f1f77bcf86cd799439011";

  // Load towers + flats from backend
  useEffect(() => {
    const load = async () => {
      try {
        const [tRes, fRes] = await Promise.all([
          api.getPublic('/api/towers'),
          api.getPublic('/api/flats')
        ]);
        const tList = (tRes?.data || []).map(t => ({
          id: t._id,
          name: t.name,
          totalFloors: t.totalFloors,
          flatsPerFloor: t.flatsPerFloor,
          totalFlats: t.totalFlats
        }));
        const fList = (fRes?.data || []).map(f => ({
          id: f._id,
          flatNo: f.flatNo,
          tower: f.tower?.name || f.tower,
          towerId: typeof f.tower === 'object' ? f.tower._id : f.tower,
          floor: f.floor,
          flatType: f.flatType,
          ownership: f.ownership,
          occupancyStatus: f.occupancyStatus,
          carpetArea: f.carpetArea
        }));
        setTowers(tList);
        setFlats(fList);
      } catch (err) {
        toast.error(err.message || 'Failed loading data');
      }
    };
    load();
  }, []);

  const stats = {
    totalTowers: towers.length,
    totalFlats: flats.length,
    occupied: flats.filter(f => f.occupancyStatus === "Occupied").length,
    vacant: flats.filter(f => f.occupancyStatus === "Vacant").length
  };

  // Get flats for the selected tower
  const selectedTowerFlats = selectedTower 
    ? flats.filter(f => f.towerId === selectedTower.id)
    : [];

  // Filter flats for detail view based on status
  const filteredTowerFlats = selectedTowerFlats.filter((f) => {
    return (
      (statusFilter === "All" || f.occupancyStatus === statusFilter) &&
      (f.flatNo.toLowerCase().includes(search.toLowerCase()))
    );
  });

const handleAddTower = async (towerData) => {
  try {
    const payload = {
      name: towerData.name,
      totalFloors: Number(towerData.totalFloors),
      flatsPerFloor: Number(towerData.flatsPerFloor),
      societyId: societyId
    };

    if (editingTower) {
      const res = await api.put(
        `/api/towers/${editingTower.id}`,
        payload
      );

      const t = res?.data || res;

      setTowers(towers.map(x =>
        x.id === editingTower.id
          ? {
              id: t._id,
              name: t.name,
              totalFloors: t.totalFloors,
              flatsPerFloor: t.flatsPerFloor,
              totalFlats: t.totalFlats
            }
          : x
      ));

      toast.success('Tower updated');
    } else {
      const res = await api.post('/api/towers', payload);

      const t = res?.data || res;

      setTowers([
        ...towers,
        {
          id: t._id,
          name: t.name,
          totalFloors: t.totalFloors,
          flatsPerFloor: t.flatsPerFloor,
          totalFlats: t.totalFlats
        }
      ]);

      toast.success('Tower added');
    }
  } catch (err) {
    toast.error(err.response?.data?.message || 'Failed to save tower');
  } finally {
    setShowTowerModal(false);
    setEditingTower(null);
  }
};


  const handleAddFlat = async (flatData) => {
    const tower = towers.find(t => t.id === (typeof flatData.towerId === 'string' ? flatData.towerId : String(flatData.towerId)) || t.id === parseInt(flatData.towerId));
    try {
      if (editingFlat) {
        const updated = await api.put(`/api/flats/${editingFlat.id}`, {
          flatNo: flatData.flatNo,
          tower: tower?.id,
          floor: Number(flatData.floor),
          flatType: flatData.flatType,
          carpetArea: Number(flatData.carpetArea),
          ownership: flatData.ownership,
          occupancyStatus: flatData.occupancyStatus,
          society: societyId
        });
        const f = updated?.data || updated;
        setFlats(flats.map(x => x.id === editingFlat.id ? {
          id: f._id,
          flatNo: f.flatNo,
          tower: f.tower?.name || tower?.name,
          towerId: typeof f.tower === 'object' ? f.tower._id : tower?.id,
          floor: f.floor,
          flatType: f.flatType,
          ownership: f.ownership,
          occupancyStatus: f.occupancyStatus,
          carpetArea: f.carpetArea
        } : x));
        toast.success('Flat updated');
      } else {
        const created = await api.post('/api/flats', {
          flatNo: flatData.flatNo,
          tower: tower?.id,
          floor: Number(flatData.floor),
          flatType: flatData.flatType,
          carpetArea: Number(flatData.carpetArea),
          ownership: flatData.ownership,
          occupancyStatus: flatData.occupancyStatus,
          society: societyId
        });
        const f = created?.data || created;
        setFlats([...flats, {
          id: f._id,
          flatNo: f.flatNo,
          tower: f.tower?.name || tower?.name,
          towerId: typeof f.tower === 'object' ? f.tower._id : tower?.id,
          floor: f.floor,
          flatType: f.flatType,
          ownership: f.ownership,
          occupancyStatus: f.occupancyStatus,
          carpetArea: f.carpetArea
        }]);
        toast.success('Flat added');
      }
    } catch (err) {
      toast.error(err.message || 'Failed to save flat');
    } finally {
      setShowFlatModal(false);
      setEditingFlat(null);
    }
  };

  const handleDeleteTower = async (id) => {
    if (!confirm('Are you sure you want to delete this tower?')) return;
    try {
      await api.del(`/api/towers/${id}`);
      setTowers(towers.filter(t => t.id !== id));
      toast.success('Tower deleted');
    } catch (err) {
      toast.error(err.message || 'Failed to delete tower');
    }
  };

  const handleDeleteFlat = async (id) => {
    if (!confirm('Are you sure you want to delete this flat?')) return;
    try {
      await api.del(`/api/flats/${id}`);
      setFlats(flats.filter(f => f.id !== id));
      toast.success('Flat deleted');
    } catch (err) {
      toast.error(err.message || 'Failed to delete flat');
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
           {selectedTower && (
            <button 
              onClick={() => { setSelectedTower(null); setSearch(""); }}
              className="flex items-center gap-2  text-black py-2 rounded-lg  "
            >
              <ArrowLeft size={18} />
              Back to Towers
            </button>
          )}
          <h1 className="text-3xl mt-4  font-bold text-gray-900">
            {selectedTower ? `Tower ${selectedTower.name}` : "Towers Management"}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {selectedTower 
              ? "View and manage all flats in this tower" 
              : "Manage towers & flats across your society"}
          </p>
        </div>

        <div className="flex gap-3">
         
          {!selectedTower && (
            <button 
              onClick={() => { setEditingTower(null); setShowTowerModal(true); }}
              className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
            >
              <Plus size={18} />
              Add Tower
            </button>
          )}
          {selectedTower && (
            <button 
              onClick={() => { setEditingFlat(null); setShowFlatModal(true); }}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
            >
              <Plus size={18} />
              Add Flat
            </button>
          )}
        </div>
      </div>

      {/* Stats Cards - Show only when on tower list */}
      {!selectedTower && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatCard 
            title="Total Towers" 
            value={stats.totalTowers} 
            icon={<Building2 size={24} />}
            color="blue"
          />
          <StatCard 
            title="Total Flats" 
            value={stats.totalFlats} 
            icon={<Home size={24} />}
            color="indigo"
          />
          <StatCard 
            title="Occupied Flats" 
            value={stats.occupied} 
            icon={<Users size={24} />}
            color="green"
          />
          <StatCard 
            title="Vacant Flats" 
            value={stats.vacant} 
            icon={<Home size={24} />}
            color="yellow"
          />
        </div>
      )}

      {/* TOWERS LIST VIEW */}
      {!selectedTower ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">All Towers</h2>
          </div>
          <div className="p-6">
            {towers.length === 0 ? (
              <div className="text-center py-12">
                <Building2 size={48} className="mx-auto text-gray-300 mb-3" />
                <p className="text-gray-500 text-lg">No towers yet</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {towers.map(tower => {
                  const towerFlatCount = flats.filter(f => f.towerId === tower.id).length;
                  return (
                    <div 
                      key={tower.id} 
                      onClick={() => setSelectedTower(tower)}
                      className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-5 border border-blue-100 hover:shadow-lg hover:border-blue-300 transition-all cursor-pointer transform hover:scale-105"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="bg-blue-600 text-white w-12 h-12 rounded-lg flex items-center justify-center text-xl font-bold">
                          {tower.name}
                        </div>
                        <div className="flex gap-1">
                          <button 
                            onClick={(e) => { e.stopPropagation(); setEditingTower(tower); setShowTowerModal(true); }}
                            className="p-1.5 hover:bg-blue-100 rounded-md transition-colors"
                          >
                            <Edit size={16} className="text-blue-600" />
                          </button>
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleDeleteTower(tower.id); }}
                            className="p-1.5 hover:bg-red-100 rounded-md transition-colors"
                          >
                            <Trash2 size={16} className="text-red-600" />
                          </button>
                        </div>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Floors:</span>
                          <span className="font-semibold text-gray-900">{tower.totalFloors}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Flats/Floor:</span>
                          <span className="font-semibold text-gray-900">{tower.flatsPerFloor}</span>
                        </div>
                        <div className="flex justify-between pt-2 border-t border-blue-200">
                          <span className="text-gray-600">Total Flats:</span>
                          <span className="font-bold text-blue-600">{tower.totalFlats}</span>
                        </div>
                        <div className="flex justify-between pt-2 border-t border-blue-200">
                          <span className="text-gray-600">Occupied:</span>
                          <span className="font-bold text-green-600">{flats.filter(f => f.towerId === tower.id && f.occupancyStatus === "Occupied").length}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* TOWER DETAILS VIEW */
        <div className="space-y-6">
          {/* Tower Info Card */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl p-8 shadow-lg">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div>
                <p className="text-blue-100 text-sm font-medium">Total Floors</p>
                <p className="text-3xl font-bold mt-2">{selectedTower.totalFloors}</p>
              </div>
              <div>
                <p className="text-blue-100 text-sm font-medium">Flats per Floor</p>
                <p className="text-3xl font-bold mt-2">{selectedTower.flatsPerFloor}</p>
              </div>
              <div>
                <p className="text-blue-100 text-sm font-medium">Total Flats</p>
                <p className="text-3xl font-bold mt-2">{selectedTower.totalFlats}</p>
              </div>
              <div>
                <p className="text-blue-100 text-sm font-medium">Occupied</p>
                <p className="text-3xl font-bold mt-2">{flats.filter(f => f.towerId === selectedTower.id && f.occupancyStatus === "Occupied").length}</p>
              </div>
            </div>
          </div>

          {/* Search & Filter */}
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex flex-wrap gap-4 items-center">
            <div className="relative flex-1 min-w-[260px]">
              <Search
                className="absolute left-3 top-2.5 text-gray-400"
                size={18}
              />
              <input
                type="text"
                placeholder="Search by flat no..."
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
              <option value="Occupied">Occupied</option>
              <option value="Vacant">Vacant</option>
              <option value="Under Renovation">Under Renovation</option>
            </select>
          </div>

          {/* Flats Table */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h2 className="text-lg font-semibold text-gray-900">
                Flats in Tower {selectedTower.name} ({filteredTowerFlats.length})
              </h2>
            </div>

            {filteredTowerFlats.length === 0 ? (
              <div className="p-12 text-center">
                <Home size={48} className="mx-auto text-gray-300 mb-3" />
                <p className="text-gray-500 text-lg">No flats found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Flat No</TableHead>
                      <TableHead>Floor</TableHead>
                      <TableHead>Flat Type</TableHead>
                      <TableHead>Carpet Area</TableHead>
                      <TableHead>Ownership</TableHead>
                      <TableHead>Occupancy Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {filteredTowerFlats.map((flat) => (
                      <TableRow key={flat.id} className="hover:bg-gray-50">
                        <TableCell className="font-medium">{flat.flatNo}</TableCell>
                        <TableCell>{flat.floor}</TableCell>
                        <TableCell>
                          <span className="px-2.5 py-1 bg-indigo-100 text-indigo-700 rounded-md text-sm font-medium">
                            {flat.flatType}
                          </span>
                        </TableCell>
                        <TableCell>{flat.carpetArea} sq ft</TableCell>
                        <TableCell>
                          <span className="px-2.5 py-1 bg-purple-100 text-purple-700 rounded-md text-sm font-medium">
                            {flat.ownership}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span
                            className={`px-2.5 py-1 rounded-md text-sm font-medium ${
                              flat.occupancyStatus === "Occupied"
                                ? "bg-green-100 text-green-700"
                                : flat.occupancyStatus === "Vacant"
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-orange-100 text-orange-700"
                            }`}
                          >
                            {flat.occupancyStatus}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <button 
                              onClick={() => { setEditingFlat(flat); setShowFlatModal(true); }}
                              className="p-1.5 hover:bg-blue-50 rounded-md transition-colors"
                            >
                              <Edit size={16} className="text-blue-600" />
                            </button>
                            <button 
                              onClick={() => handleDeleteFlat(flat.id)}
                              className="p-1.5 hover:bg-red-50 rounded-md transition-colors"
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
            )}
          </div>
        </div>
      )}

      {/* Modals */}
      {showTowerModal && (
        <TowerModal
          tower={editingTower}
          onClose={() => { setShowTowerModal(false); setEditingTower(null); }}
          onSave={handleAddTower}
        />
      )}

      {showFlatModal && (
        <FlatModal
          flat={editingFlat}
          towers={towers}
          onClose={() => { setShowFlatModal(false); setEditingFlat(null); }}
          onSave={handleAddFlat}
        />
      )}
    </div>
  );
}

/* Stat Card Component */
function StatCard({ title, value, icon, color = "blue" }) {
  const colorClasses = {
    blue: "bg-blue-100 text-blue-600",
    indigo: "bg-indigo-100 text-indigo-600",
    green: "bg-green-100 text-green-600",
    yellow: "bg-yellow-100 text-yellow-600",
    purple: "bg-purple-100 text-purple-600"
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

/* Tower Modal */
function TowerModal({ tower, onClose, onSave }) {
  const [formData, setFormData] = useState(tower || {
    name: "",
    totalFloors: "",
    flatsPerFloor: ""
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...formData,
      totalFloors: parseInt(formData.totalFloors),
      flatsPerFloor: parseInt(formData.flatsPerFloor),
      totalFlats: parseInt(formData.totalFloors) * parseInt(formData.flatsPerFloor)
    });
  };

  return (
    <Modal isOpen={true} onClose={onClose} title={tower ? "Edit Tower" : "Add New Tower"}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tower Name</label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., A, B, C"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Total Floors</label>
            <input
              type="number"
              required
              min="1"
              value={formData.totalFloors}
              onChange={(e) => setFormData({ ...formData, totalFloors: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Flats per Floor</label>
            <input
              type="number"
              required
              min="1"
              value={formData.flatsPerFloor}
              onChange={(e) => setFormData({ ...formData, flatsPerFloor: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {formData.totalFloors && formData.flatsPerFloor && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-800">
              Total Flats: <span className="font-bold">{parseInt(formData.totalFloors || 0) * parseInt(formData.flatsPerFloor || 0)}</span>
            </p>
          </div>
        )}

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
            {tower ? "Update" : "Add"} Tower
          </button>
        </div>
      </form>
    </Modal>
  );
}

/* Flat Modal */
function FlatModal({ flat, towers, onClose, onSave }) {
  const [formData, setFormData] = useState(flat || {
    flatNo: "",
    towerId: "",
    floor: "",
    flatType: "2BHK",
    carpetArea: "",
    ownership: "Owner",
    occupancyStatus: "Vacant"
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...formData,
      floor: parseInt(formData.floor),
      carpetArea: parseInt(formData.carpetArea)
    });
  };

  return (
    <Modal isOpen={true} onClose={onClose} title={flat ? "Edit Flat" : "Add New Flat"}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Flat Number</label>
            <input
              type="text"
              required
              value={formData.flatNo}
              onChange={(e) => setFormData({ ...formData, flatNo: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., 101, 1203"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tower</label>
            <select
              required
              value={formData.towerId}
              onChange={(e) => setFormData({ ...formData, towerId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Tower</option>
              {towers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Floor</label>
            <input
              type="number"
              required
              min="0"
              value={formData.floor}
              onChange={(e) => setFormData({ ...formData, floor: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Flat Type</label>
            <select
              value={formData.flatType}
              onChange={(e) => setFormData({ ...formData, flatType: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option>1BHK</option>
              <option>2BHK</option>
              <option>3BHK</option>
              <option>4BHK</option>
              <option>5BHK</option>
              <option>Penthouse</option>
              <option>Studio</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Carpet Area (sq ft)</label>
          <input
            type="number"
            required
            min="1"
            value={formData.carpetArea}
            onChange={(e) => setFormData({ ...formData, carpetArea: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ownership</label>
            <select
              value={formData.ownership}
              onChange={(e) => setFormData({ ...formData, ownership: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option>Owner</option>
              <option>Tenant</option>
              <option>Company</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Occupancy Status</label>
            <select
              value={formData.occupancyStatus}
              onChange={(e) => setFormData({ ...formData, occupancyStatus: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option>Occupied</option>
              <option>Vacant</option>
              <option>Under Renovation</option>
            </select>
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
            {flat ? "Update" : "Add"} Flat
          </button>
        </div>
      </form>
    </Modal>
  );
}
