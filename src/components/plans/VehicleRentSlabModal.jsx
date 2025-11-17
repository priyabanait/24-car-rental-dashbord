import { useState, useEffect } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { Modal } from '../ui/Modal';

export default function VehicleRentSlabModal({ isOpen, onClose, vehicleName, vehicleData, onSave, embedded = false }) {
  const [formData, setFormData] = useState({
    securityDeposit: 0,
    rows: []
  });

  useEffect(() => {
    if (vehicleData) {
      setFormData({
        securityDeposit: vehicleData.securityDeposit || 0,
        rows: vehicleData.rows ? [...vehicleData.rows] : []
      });
    }
  }, [vehicleData]);

  const handleSecurityDepositChange = (e) => {
    const newData = {
      ...formData,
      securityDeposit: parseFloat(e.target.value) || 0
    };
    setFormData(newData);
    if (embedded) onSave(newData);
  };

  const handleRowChange = (index, field, value) => {
    const newRows = [...formData.rows];
    newRows[index] = {
      ...newRows[index],
      [field]: field === 'trips' ? value : (parseFloat(value) || 0)
    };
    const newData = { ...formData, rows: newRows };
    setFormData(newData);
    if (embedded) onSave(newData);
  };

  const addRow = () => {
    const newData = {
      ...formData,
      rows: [...formData.rows, { trips: '', rentDay: 0, weeklyRent: 0, accidentalCover: 105, acceptanceRate: 60 }]
    };
    setFormData(newData);
    if (embedded) onSave(newData);
  };

  const removeRow = (index) => {
    const newData = {
      ...formData,
      rows: formData.rows.filter((_, i) => i !== index)
    };
    setFormData(newData);
    if (embedded) onSave(newData);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  // Embedded mode - render only form fields without Modal wrapper
  if (embedded) {
    return (
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Security Deposit (₹)
          </label>
          <input
            type="number"
            value={formData.securityDeposit}
            onChange={handleSecurityDepositChange}
            className="input w-full"
            required
            min="0"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="block text-sm font-medium text-gray-700">
              Rent Slabs
            </label>
            <button
              type="button"
              onClick={addRow}
              className="btn btn-outline btn-sm flex items-center"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Row
            </button>
          </div>

          <div className="space-y-3">
            {formData.rows.map((row, index) => (
              <div key={index} className="flex items-start gap-2 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex-1 grid grid-cols-5 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1"> Trips</label>
                    <input
                      type="text"
                      value={row.trips}
                      onChange={(e) => handleRowChange(index, 'trips', e.target.value)}
                      className="input w-full text-sm"
                      placeholder="60 or 0-59"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Rent/Day (₹)</label>
                    <input
                      type="text"
                      value={row.rentDay}
                      onChange={(e) => handleRowChange(index, 'rentDay', e.target.value)}
                      className="input w-full text-sm"
                      required
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Weekly Rent (₹)</label>
                    <input
                      type="text"
                      value={row.weeklyRent}
                      onChange={(e) => handleRowChange(index, 'weeklyRent', e.target.value)}
                      className="input w-full text-sm"
                      required
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Accidental Cover (₹)</label>
                    <input
                      type="text"
                      value={row.accidentalCover || 105}
                      onChange={(e) => handleRowChange(index, 'accidentalCover', e.target.value)}
                      className="input w-full text-sm"
                      required
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Acceptance Rate (%)</label>
                    <input
                      type="text"
                      value={row.acceptanceRate || 60}
                      onChange={(e) => handleRowChange(index, 'acceptanceRate', e.target.value)}
                      className="input w-full text-sm"
                      required
                      min="0"
                      max="100"
                    />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => removeRow(index)}
                  className="text-red-600 hover:text-red-800 p-2 mt-6"
                  title="Remove row"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
            {formData.rows.length === 0 && (
              <p className="text-sm text-gray-500 text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
                No rent slabs added. Click "Add Row" to create one.
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Edit ${vehicleName} Rent Plan`} className="max-w-5xl">
      <form onSubmit={handleSubmit} className="flex flex-col max-h-[80vh]">
        <div className="flex-1  px-6 py-4 space-y-6">
          {/* Security Deposit */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Security Deposit (₹)
            </label>
            <input
              type="text"
              value={formData.securityDeposit}
              onChange={handleSecurityDepositChange}
              className="input w-full"
              required
              min="0"
            />
          </div>

          {/* Rent Rows */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-gray-700">
                Rent Slabs
              </label>
              <button
                type="button"
                onClick={addRow}
                className="btn btn-outline btn-sm flex items-center"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Row
              </button>
            </div>

            <div className="space-y-3">
              {formData.rows.map((row, index) => (
                <div key={index} className="flex items-start gap-2 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex-1 grid grid-cols-5 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Weekly Trips</label>
                      <input
                        type="text"
                        value={row.trips}
                        onChange={(e) => handleRowChange(index, 'trips', e.target.value)}
                        className="input w-full text-sm"
                        placeholder="60 or 0-59"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Rent/Day (₹)</label>
                      <input
                        type="text"
                        value={row.rentDay}
                        onChange={(e) => handleRowChange(index, 'rentDay', e.target.value)}
                        className="input w-full text-sm"
                        required
                        min="0"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Weekly Rent (₹)</label>
                      <input
                        type="text"
                        value={row.weeklyRent}
                        onChange={(e) => handleRowChange(index, 'weeklyRent', e.target.value)}
                        className="input w-full text-sm"
                        required
                        min="0"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Accidental Cover (₹)</label>
                      <input
                        type="text"
                        value={row.accidentalCover || 105}
                        onChange={(e) => handleRowChange(index, 'accidentalCover', e.target.value)}
                        className="input w-full text-sm"
                        required
                        min="0"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Acceptance Rate (%)</label>
                      <input
                        type="text"
                        value={row.acceptanceRate || 60}
                        onChange={(e) => handleRowChange(index, 'acceptanceRate', e.target.value)}
                        className="input w-full text-sm"
                        required
                        min="0"
                        max="100"
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeRow(index)}
                    className="text-red-600 hover:text-red-800 p-2 mt-6"
                    title="Remove row"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
              {formData.rows.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
                  No rent slabs added. Click "Add Row" to create one.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Actions - Fixed at bottom */}
        {!embedded && (
          <div className="flex justify-end gap-3 pt-4 px-6 pb-4 border-t border-gray-200 bg-gray-50">
            <button 
              type="button" 
              onClick={onClose} 
              className="px-5 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-200"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="px-5 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-200 shadow-sm hover:shadow-md"
            >
              Save Changes
            </button>
          </div>
        )}
      </form>
    </Modal>
  );
}
