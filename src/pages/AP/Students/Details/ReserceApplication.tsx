import React from 'react';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { X } from 'lucide-react';
import { useGetApplicationRoomTypesQuery } from '@/services/apiService';

const ReserveModal = ({ isOpen, onClose, id, CapacityId }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    moveInDate: '',
    reservationPeriod: '',
    roomNumber: '',
    roomType: '',
  });
  const [errors, setErrors] = useState({});

  console.log('wr', id);

  const roomTypes = [
    { id: 1, name: 'Single Room' },
    { id: 2, name: 'Double Room' },
    { id: 3, name: 'Studio' },
    { id: 4, name: 'Suite' },
  ];

  const validateForm = () => {
    const newErrors = {};
    if (!formData.moveInDate) newErrors.moveInDate = 'Move in date is required';
    if (!formData.reservationPeriod) newErrors.reservationPeriod = 'Reservation period is required';
    if (!formData.roomNumber) newErrors.roomNumber = 'Room number is required';
    if (!formData.roomType) newErrors.roomType = 'Room type is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const { data, isSuccess, isError, error } = useGetApplicationRoomTypesQuery(id);
  console.log({ data, isSuccess, isError, error });
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);
    try {
      // Replace with your actual API endpoint
      const response = await fetch('/api/reserve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Reservation failed');

      //   onClose();
      // You might want to show a success toast here
    } catch (error) {
      setErrors({ submit: 'Failed to make reservation. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: undefined,
      }));
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-[#6B7280]/40 backdrop-blur-[2px] " aria-hidden="true" />

      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-lg p-6 rounded-2xl">
          <DialogHeader>
            <div className="flex justify-between items-center">
              <DialogTitle>Reserve</DialogTitle>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
                <X className="h-4 w-4" />
              </button>
            </div>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <p className="text-sm text-gray-600">Provide the accommodation details to be provided to the student prior to moving in.</p>

            <div className="space-y-2">
              <Label htmlFor="moveInDate">Planned Move In Date</Label>
              <Input
                id="moveInDate"
                type="date"
                value={formData.moveInDate}
                onChange={(e) => handleInputChange('moveInDate', e.target.value)}
                className={errors.moveInDate ? 'border-red-500' : ''}
              />
              {errors.moveInDate && <p className="text-red-500 text-sm">{errors.moveInDate}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="reservationPeriod">Set a reservation period</Label>
              <Input
                id="reservationPeriod"
                type="text"
                value={formData.reservationPeriod}
                onChange={(e) => handleInputChange('reservationPeriod', e.target.value)}
                className={errors.reservationPeriod ? 'border-red-500' : ''}
                placeholder="e.g., 6 months"
              />
              {errors.reservationPeriod && <p className="text-red-500 text-sm">{errors.reservationPeriod}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="roomNumber">Select a Room Number</Label>
              <Input
                id="roomNumber"
                type="text"
                value={formData.roomNumber}
                onChange={(e) => handleInputChange('roomNumber', e.target.value)}
                className={errors.roomNumber ? 'border-red-500' : ''}
              />
              {errors.roomNumber && <p className="text-red-500 text-sm">{errors.roomNumber}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="roomType">Select a Room Type</Label>
              <Select value={formData.roomType} onValueChange={(value) => handleInputChange('roomType', value)}>
                <SelectTrigger className={errors.roomType ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Select an option" />
                </SelectTrigger>
                <SelectContent>
                  {roomTypes.map((type) => (
                    <SelectItem key={type.id} value={type.name}>
                      {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.roomType && <p className="text-red-500 text-sm">{errors.roomType}</p>}
            </div>

            {errors.submit && <p className="text-red-500 text-sm">{errors.submit}</p>}

            <Button type="submit" className="w-full bg-orange-500 hover:bg-orange-600" disabled={isLoading}>
              {isLoading ? 'Processing...' : 'Confirm'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ReserveModal;
