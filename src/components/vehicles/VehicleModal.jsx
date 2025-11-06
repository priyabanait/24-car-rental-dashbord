import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import toast from 'react-hot-toast';

export default function VehicleModal({ isOpen, onClose, vehicle = null, onSave }) {
  const [form, setForm] = useState({
    registrationNumber: '',
    model: '',
    ownerName: '',
    ownerPhone: '',
    kycStatus: '',
    manufactureYear: '',
    registrationDate: '',
    roadTaxDate: '',
    insuranceDate: '',
    permitDate: '',
    emissionDate: '',
    trafficFine: '',
    trafficFineDate: '',
    fuelType: '',
    assignedDriver: '',
    status: 'active',
    remarks: ''
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (vehicle) {
      setForm({
        registrationNumber: vehicle.registrationNumber || '',
        model: vehicle.model || '',
        ownerName: vehicle.ownerName || vehicle.owner || '',
        ownerPhone: vehicle.ownerPhone || '',
        kycStatus: vehicle.kycStatus || vehicle.kyc || vehicle.kyc_status || '',
        manufactureYear: vehicle.year || vehicle.manufactureYear || '',
        registrationDate: vehicle.registrationDate || vehicle.purchaseDate || '',
        roadTaxDate: vehicle.roadTaxDate || '',
        insuranceDate: vehicle.insuranceDate || vehicle.insuranceExpiry || '',
        permitDate: vehicle.permitDate || '',
        emissionDate: vehicle.emissionDate || '',
        trafficFine: vehicle.trafficFine || '',
        trafficFineDate: vehicle.trafficFineDate || '',
        fuelType: vehicle.fuelType || '',
        assignedDriver: vehicle.assignedDriver || '',
        status: vehicle.status || 'active',
        remarks: vehicle.remarks || ''
      });
    } else {
      setForm({
        registrationNumber: '', model: '', ownerName: '', ownerPhone: '', kycStatus: '', manufactureYear: '',
        registrationDate: '', roadTaxDate: '', insuranceDate: '', permitDate: '', emissionDate: '',
        trafficFine: '', trafficFineDate: '', fuelType: '', assignedDriver: '', status: 'active', remarks: ''
      });
    }
  }, [vehicle, isOpen]);

  if (!isOpen) return null;

  const validateField = (field, value) => {
    const e = { ...errors };
    const v = (value ?? '').toString();
    const currentYear = new Date().getFullYear();

    switch(field){
      case 'registrationNumber':
        if (!v.trim()) e.registrationNumber = 'Registration number is required';
        else delete e.registrationNumber;
        break;
      case 'model':
        if (!v.trim()) e.model = 'Vehicle model is required';
        else delete e.model;
        break;
      case 'ownerPhone':
        if (v && !/^\+?[0-9\s-]{7,15}$/.test(v)) e.ownerPhone = 'Enter a valid phone number';
        else delete e.ownerPhone;
        break;
      case 'manufactureYear':
        if (v) {
          const n = Number(v);
          if (Number.isNaN(n) || n < 1900 || n > currentYear + 1) e.manufactureYear = `Enter a year between 1900 and ${currentYear + 1}`;
          else delete e.manufactureYear;
        } else delete e.manufactureYear;
        break;
      case 'trafficFine':
        if (v) {
          const n = Number(v);
          if (Number.isNaN(n) || n < 0) e.trafficFine = 'Traffic fine must be a positive number';
          else delete e.trafficFine;
        } else delete e.trafficFine;
        break;
      case 'fuelType':
        if (!v.trim()) e.fuelType = 'Select a fuel type';
        else delete e.fuelType;
        break;
      case 'status':
        if (!v.trim()) e.status = 'Select status';
        else delete e.status;
        break;
      default:
        break;
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateForm = () => {
    // run validations for required fields and collect results
    const validations = [
      validateField('registrationNumber', form.registrationNumber),
      validateField('model', form.model),
      validateField('ownerPhone', form.ownerPhone),
      validateField('manufactureYear', form.manufactureYear),
      validateField('trafficFine', form.trafficFine),
      validateField('fuelType', form.fuelType),
      validateField('status', form.status)
    ];
    // All validations must pass
    return validations.every(isValid => isValid);
  };

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    validateField(field, value);
  };

  const handleSubmit = async () => {
    // final validation before submit
    const isValid = validateForm();
    if (!isValid) {
      toast.error('Please fix form errors before saving');
      return;
    }
  setLoading(true);
    try {
      const payload = {
        registrationNumber: form.registrationNumber,
        model: form.model,
        ownerName: form.ownerName,
        ownerPhone: form.ownerPhone,
        kycStatus: form.kycStatus || undefined,
        year: form.manufactureYear ? Number(form.manufactureYear) : undefined,
        manufactureYear: form.manufactureYear ? Number(form.manufactureYear) : undefined,
        registrationDate: form.registrationDate,
        roadTaxDate: form.roadTaxDate,
        insuranceDate: form.insuranceDate,
        permitDate: form.permitDate,
        emissionDate: form.emissionDate,
        trafficFine: form.trafficFine ? Number(form.trafficFine) : undefined,
        trafficFineDate: form.trafficFineDate,
        fuelType: form.fuelType,
        assignedDriver: form.assignedDriver,
        status: form.status,
        remarks: form.remarks
      };

      // Delegate saving to parent; expect it to throw on error
      await onSave(payload);
      toast.success('Vehicle saved');
      setLoading(false);
      onClose();
      return;
    } catch (err) {
      console.error('Vehicle save error', err);
      toast.error(err.message || 'Failed to save vehicle');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={onClose} />
        <div className="relative bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between p-4 border-b">
            <h3 className="text-lg font-medium">{vehicle ? 'Edit Vehicle' : ''}</h3>
            <button className="text-gray-400 hover:text-gray-600" onClick={onClose}><X className="h-5 w-5" /></button>
          </div>

          <div className="p-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium">Vehicle No.</label>
                <input className={`input ${errors.registrationNumber ? 'border-red-500' : ''}`} value={form.registrationNumber} onChange={(e)=>handleChange('registrationNumber', e.target.value)} />
                {errors.registrationNumber && <p className="text-xs text-red-600 mt-1">{errors.registrationNumber}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium">Vehicle Model</label>
                <input className={`input ${errors.model ? 'border-red-500' : ''}`} value={form.model} onChange={(e)=>handleChange('model', e.target.value)} />
                {errors.model && <p className="text-xs text-red-600 mt-1">{errors.model}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium">Owner Name</label>
                <input className="input" value={form.ownerName} onChange={(e)=>handleChange('ownerName', e.target.value)} />
              </div>

              <div>
                <label className="block text-sm font-medium">Owner Phone No.</label>
                <input className={`input ${errors.ownerPhone ? 'border-red-500' : ''}`} value={form.ownerPhone} onChange={(e)=>handleChange('ownerPhone', e.target.value)} />
                {errors.ownerPhone && <p className="text-xs text-red-600 mt-1">{errors.ownerPhone}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium">Manufacture Year</label>
                <input type="number" className={`input ${errors.manufactureYear ? 'border-red-500' : ''}`} value={form.manufactureYear} onChange={(e)=>handleChange('manufactureYear', e.target.value)} />
                {errors.manufactureYear && <p className="text-xs text-red-600 mt-1">{errors.manufactureYear}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium">Registration Date</label>
                <input type="date" className="input" value={form.registrationDate} onChange={(e)=>handleChange('registrationDate', e.target.value)} />
              </div>

              <div>
                <label className="block text-sm font-medium">Road Tax Date</label>
                <input type="date" className="input" value={form.roadTaxDate} onChange={(e)=>handleChange('roadTaxDate', e.target.value)} />
              </div>

              <div>
                <label className="block text-sm font-medium">Insurance Date</label>
                <input type="date" className="input" value={form.insuranceDate} onChange={(e)=>handleChange('insuranceDate', e.target.value)} />
              </div>

              <div>
                <label className="block text-sm font-medium">Permit Date</label>
                <input type="date" className="input" value={form.permitDate} onChange={(e)=>handleChange('permitDate', e.target.value)} />
              </div>

              <div>
                <label className="block text-sm font-medium">Emission Date</label>
                <input type="date" className="input" value={form.emissionDate} onChange={(e)=>handleChange('emissionDate', e.target.value)} />
              </div>

              <div>
                <label className="block text-sm font-medium">Traffic Fine</label>
                <input type="number" className={`input ${errors.trafficFine ? 'border-red-500' : ''}`} value={form.trafficFine} onChange={(e)=>handleChange('trafficFine', e.target.value)} />
                {errors.trafficFine && <p className="text-xs text-red-600 mt-1">{errors.trafficFine}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium">Traffic Fine Date</label>
                <input type="date" className="input" value={form.trafficFineDate} onChange={(e)=>handleChange('trafficFineDate', e.target.value)} />
              </div>

              <div>
                <label className="block text-sm font-medium">Fuel Type</label>
                <select className={`input ${errors.fuelType ? 'border-red-500' : ''}`} value={form.fuelType} onChange={(e)=>handleChange('fuelType', e.target.value)}>
                  <option value="">Select</option>
                  <option value="Petrol">Petrol</option>
                  <option value="Diesel">Diesel</option>
                  <option value="CNG">CNG</option>
                  <option value="Electric">Electric</option>
                </select>
                {errors.fuelType && <p className="text-xs text-red-600 mt-1">{errors.fuelType}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium">Assign to Driver</label>
                <input className="input" value={form.assignedDriver} onChange={(e)=>handleChange('assignedDriver', e.target.value)} placeholder="Driver ID or name" />
              </div>
              

              <div>
                <label className="block text-sm font-medium">Status</label>
                <select className={`input ${errors.status ? 'border-red-500' : ''}`} value={form.status} onChange={(e)=>handleChange('status', e.target.value)}>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="suspended">Suspended</option>
                </select>
                {errors.status && <p className="text-xs text-red-600 mt-1">{errors.status}</p>}
              </div>

                <div>
                  <label className="block text-sm font-medium">KYC Status</label>
                  <select className="input" value={form.kycStatus} onChange={(e)=>handleChange('kycStatus', e.target.value)}>
                    <option value="">Select</option>
                    <option value="verified">Verified</option>
                    <option value="pending">Pending</option>
                    <option value="rejected">Rejected</option>
                    <option value="incomplete">Incomplete</option>
                  </select>
                </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium">Remarks</label>
                <textarea className="input" rows={2} value={form.remarks} onChange={(e)=>handleChange('remarks', e.target.value)} />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end p-4 border-t">
            <button className="btn btn-secondary mr-3" onClick={onClose} disabled={loading}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSubmit} disabled={loading || Object.keys(errors).length > 0}>{loading ? 'Saving...' : 'Save Vehicle'}</button>
          </div>
        </div>
      </div>
    </div>
  );
}
