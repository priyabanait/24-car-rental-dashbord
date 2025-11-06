import { X } from 'lucide-react';
import { formatDate, formatCurrency } from '../../utils';

export default function VehicleDetailModal({ isOpen, onClose, vehicle = null }) {
  if (!isOpen) return null;

  const v = vehicle || {};

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />
        <div className="relative bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between p-4 border-b">
            <h3 className="text-lg font-medium">Vehicle Details</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="h-5 w-5"/></button>
          </div>

          <div className="p-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Registration Number</p>
                <p className="font-medium">{v.registrationNumber || v.regNo || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Make / Model</p>
                <p className="font-medium">{(v.make || '-') + (v.model ? ` / ${v.model}` : '')}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Owner Name</p>
                <p className="font-medium">{v.ownerName || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Owner Phone</p>
                <p className="font-medium">{v.ownerPhone || '-'}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Manufacture Year</p>
                <p className="font-medium">{v.manufactureYear || v.year || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Registration Date</p>
                <p className="font-medium">{formatDate(v.registrationDate)}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Insurance Expiry</p>
                <p className="font-medium">{formatDate(v.insuranceExpiryDate || v.insuranceExpiry || v.insuranceDate)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">RC Expiry</p>
                <p className="font-medium">{formatDate(v.rcExpiryDate || v.rcExpiry)}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Fitness Expiry</p>
                <p className="font-medium">{formatDate(v.fitnessExpiryDate || v.fitnessExpiry)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Road Tax Date</p>
                <p className="font-medium">{formatDate(v.roadTaxDate)}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Traffic Fine</p>
                <p className="font-medium">{v.trafficFine != null ? formatCurrency(v.trafficFine) : '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Assigned Driver</p>
                <p className="font-medium">{v.assignedDriver || '-'}</p>
              </div>

              <div className="md:col-span-2">
                <p className="text-sm text-gray-500">Remarks</p>
                <p className="font-medium">{v.remarks || '-'}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end p-4 border-t">
            <button onClick={onClose} className="btn btn-primary">Close</button>
          </div>
        </div>
      </div>
    </div>
  );
}
