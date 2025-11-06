import { X, Mail, Phone, FileText, User, MapPin, Car, CreditCard } from 'lucide-react';
import { formatDate } from '../../utils';

const docUrl = (doc) => {
  if (!doc) return null;
  if (typeof doc === 'string') return doc;
  if (doc instanceof File) return URL.createObjectURL(doc);
  return null;
};

export default function DriverDetailModal({ isOpen, onClose, driver }) {
  if (!isOpen || !driver) return null;

  const renderDocumentPreview = (doc) => {
    if (!doc) return <div className="text-sm text-gray-500">Not uploaded</div>;

    // Handle string URLs (from backend)
    if (typeof doc === 'string') {
      if (doc.match(/\.(pdf)$/i)) {
        return (
          <a href={doc} target="_blank" rel="noreferrer" className="text-primary-600 hover:underline">
            View PDF
          </a>
        );
      }
      if (doc.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
        return <img src={doc} alt="Document" className="h-32 w-32 object-cover rounded border" />;
      }
      return <a href={doc} target="_blank" rel="noreferrer" className="text-primary-600 hover:underline">{doc}</a>;
    }

    // Handle File objects (from file inputs)
    if (doc instanceof File) {
      if (doc.type.startsWith('image/')) {
        const previewUrl = URL.createObjectURL(doc);
        return (
          <img 
            src={previewUrl} 
            alt="Document" 
            className="h-32 w-32 object-cover rounded border"
            onLoad={() => URL.revokeObjectURL(previewUrl)}
          />
        );
      }
      return <div className="text-sm text-gray-600">{doc.name}</div>;
    }

    return <div className="text-sm text-gray-500">Invalid document</div>;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={onClose} />

        <div className="relative bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center space-x-4">
              <div className="h-12 w-12 bg-primary-100 rounded-full overflow-hidden flex items-center justify-center">
                {docUrl(driver.profilePhoto) ? (
                  <img src={driver.profilePhoto} alt={driver.name} className="h-12 w-12 object-cover" />
                ) : (
                  <span className="text-lg font-medium text-primary-700">
                    {driver.name?.split(' ').map(n => n[0]).join('')}
                  </span>
                )}
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">{driver.name}</h2>
                <p className="text-sm text-gray-600">License: {driver.licenseNumber || '—'}</p>
              </div>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Basic info */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <div className="card">
                  <div className="p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Personal Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Full Name</label>
                        <div className="mt-1 flex items-center">
                          <User className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="text-sm text-gray-900">{driver.name}</span>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Email</label>
                        <div className="mt-1 flex items-center">
                          <Mail className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="text-sm text-gray-900">{driver.email}</span>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Phone</label>
                        <div className="mt-1 flex items-center">
                          <Phone className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="text-sm text-gray-900">{driver.phone}</span>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Address</label>
                        <div className="mt-1 flex items-start">
                          <MapPin className="h-4 w-4 text-gray-400 mr-2 mt-0.5" />
                          <span className="text-sm text-gray-900 whitespace-pre-line">{driver.address}</span>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Join Date</label>
                        <div className="mt-1 text-sm text-gray-900">{formatDate(driver.joinDate)}</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="card">
                  <div className="p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Professional</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Plan</label>
                        <div className="mt-1 flex items-center">
                          <Car className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="text-sm text-gray-900">{driver.planType || driver.currentPlan || '—'}</span>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Vehicle</label>
                        <div className="mt-1 text-sm text-gray-900">{driver.vehiclePreference || driver.vehicleAssigned || '—'}</div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">KYC Status</label>
                        <div className="mt-1 text-sm text-gray-900">{driver.kycStatus || '—'}</div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Status</label>
                        <div className="mt-1 text-sm text-gray-900">{driver.status || '—'}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Documents */}
              <div className="space-y-6">
                <div className="card">
                  <div className="p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Documents</h3>
                    <div className="grid grid-cols-2 gap-4">
                      {[
                        { key: 'licenseDocument', label: 'License Document', number: driver.licenseNumber },
                        { key: 'aadharDocument', label: 'Aadhar Card', number: driver.aadharNumber },
                        { key: 'panDocument', label: 'PAN Card', number: driver.panNumber },
                        { key: 'bankDocument', label: 'Bank Document', number: driver.accountNumber },
                      ].map(({ key, label, number }) => (
                        <div key={key} className="border rounded-lg p-3 bg-gray-50">
                          <div className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                            <FileText className="h-4 w-4 mr-2 text-gray-400" />
                            {label}
                          </div>
                          {number && (
                            <div className="text-xs text-gray-500 mb-2 font-mono">
                              {number}
                            </div>
                          )}
                          <div className="flex items-center justify-center bg-white rounded border p-2">
                            {renderDocumentPreview(driver[key])}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="card">
                  <div className="p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Bank Details</h3>
                    <div className="space-y-2 text-sm text-gray-900">
                      <div className="flex justify-between"><span className="text-gray-600">Bank</span><span>{driver.bankName || '—'}</span></div>
                      <div className="flex justify-between"><span className="text-gray-600">Account No.</span><span className="font-mono">{driver.accountNumber || '—'}</span></div>
                      <div className="flex justify-between"><span className="text-gray-600">IFSC</span><span className="font-mono">{driver.ifscCode || '—'}</span></div>
                      <div className="flex justify-between"><span className="text-gray-600">Holder</span><span>{driver.accountHolderName || '—'}</span></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


