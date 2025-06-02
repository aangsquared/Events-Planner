'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useRole } from '@/app/hooks/useRole';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import dayjs from 'dayjs';
import LoadingSpinner from '@/app/components/common/LoadingSpinner';

interface EventFormData {
  name: string;
  description: string;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  venue: {
    name: string;
    address: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
  };
  category: string;
  price: {
    amount: number;
    currency: string;
  };
  capacity: number;
  images: string[];
  isPublic: boolean;
  tags: string[];
}

export default function EditEventPage() {
  const router = useRouter();
  const params = useParams();
  const { isStaff } = useRole();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState<EventFormData>({
    name: '',
    description: '',
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
    venue: {
      name: '',
      address: '',
      city: '',
      state: '',
      country: '',
      postalCode: '',
    },
    category: '',
    price: {
      amount: 0,
      currency: 'USD',
    },
    capacity: 0,
    images: [],
    isPublic: true,
    tags: [],
  });

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const response = await fetch(`/api/events/platform/${params.id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch event');
        }
        const event = await response.json();
        
        // Convert ISO dates to date and time strings
        const startDate = new Date(event.startDate);
        const endDate = new Date(event.endDate);
        
        setFormData({
          ...event,
          startDate: startDate.toISOString().split('T')[0],
          startTime: startDate.toTimeString().slice(0, 5),
          endDate: endDate.toISOString().split('T')[0],
          endTime: endDate.toTimeString().slice(0, 5),
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch event');
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [params.id]);

  // Redirect if not staff
  if (!isStaff) {
    router.push('/unauthorized');
    return null;
  }

  if (loading) {
    return <LoadingSpinner />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      // Combine date and time before sending to API
      const {
        startTime,
        endTime,
        ...restFormData
      } = formData;

      const combinedData = {
        ...restFormData,
        startDate: new Date(`${formData.startDate}T${formData.startTime}`).toISOString(),
        endDate: new Date(`${formData.endDate}T${formData.endTime}`).toISOString(),
      };

      const response = await fetch(`/api/events/platform/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(combinedData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update event');
      }

      router.push('/dashboard/events');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update event');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof EventFormData] as Record<string, string | number>),
          [child]: value,
        },
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleTagsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const tags = e.target.value.split(',').map(tag => tag.trim()).filter(Boolean);
    setFormData(prev => ({
      ...prev,
      tags,
    }));
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <div className="min-h-screen bg-gray-100 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h1 className="text-2xl font-semibold text-gray-900">Edit Event</h1>
              <p className="mt-1 text-sm text-gray-500">
                Update event details
              </p>
            </div>

            {error && (
              <div className="p-4 bg-red-50 text-red-700">
                <p>{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="px-4 py-5 sm:p-6">
              <div className="grid grid-cols-1 gap-6">
                {/* Basic Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900">Basic Information</h3>
                  
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                      Event Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      id="name"
                      required
                      value={formData.name}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 placeholder-gray-500"
                    />
                  </div>

                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                      Description
                    </label>
                    <textarea
                      name="description"
                      id="description"
                      required
                      rows={4}
                      value={formData.description}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 placeholder-gray-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-4">
                      <div>
                        <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">
                          Start Date
                        </label>
                        <input
                          type="date"
                          name="startDate"
                          id="startDate"
                          required
                          value={formData.startDate}
                          onChange={handleInputChange}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
                        />
                      </div>
                      <div>
                        <label htmlFor="startTime" className="block text-sm font-medium text-gray-700">
                          Start Time
                        </label>
                        <TimePicker
                          value={formData.startTime ? dayjs(`2000-01-01T${formData.startTime}`) : null}
                          onChange={(newValue) => {
                            handleInputChange({
                              target: {
                                name: 'startTime',
                                value: newValue ? newValue.format('HH:mm') : ''
                              }
                            } as any);
                          }}
                          slotProps={{
                            textField: {
                              fullWidth: true,
                              className: "mt-1",
                            }
                          }}
                          ampm={false}
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">
                          End Date
                        </label>
                        <input
                          type="date"
                          name="endDate"
                          id="endDate"
                          required
                          value={formData.endDate}
                          onChange={handleInputChange}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
                        />
                      </div>
                      <div>
                        <label htmlFor="endTime" className="block text-sm font-medium text-gray-700">
                          End Time
                        </label>
                        <TimePicker
                          value={formData.endTime ? dayjs(`2000-01-01T${formData.endTime}`) : null}
                          onChange={(newValue) => {
                            handleInputChange({
                              target: {
                                name: 'endTime',
                                value: newValue ? newValue.format('HH:mm') : ''
                              }
                            } as any);
                          }}
                          slotProps={{
                            textField: {
                              fullWidth: true,
                              className: "mt-1",
                            }
                          }}
                          ampm={false}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Venue Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900">Venue Information</h3>
                  
                  <div>
                    <label htmlFor="venue.name" className="block text-sm font-medium text-gray-700">
                      Venue Name
                    </label>
                    <input
                      type="text"
                      name="venue.name"
                      id="venue.name"
                      required
                      value={formData.venue.name}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 placeholder-gray-500"
                    />
                  </div>

                  <div>
                    <label htmlFor="venue.address" className="block text-sm font-medium text-gray-700">
                      Address
                    </label>
                    <input
                      type="text"
                      name="venue.address"
                      id="venue.address"
                      required
                      value={formData.venue.address}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 placeholder-gray-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="venue.city" className="block text-sm font-medium text-gray-700">
                        City
                      </label>
                      <input
                        type="text"
                        name="venue.city"
                        id="venue.city"
                        required
                        value={formData.venue.city}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 placeholder-gray-500"
                      />
                    </div>

                    <div>
                      <label htmlFor="venue.state" className="block text-sm font-medium text-gray-700">
                        State/Province
                      </label>
                      <input
                        type="text"
                        name="venue.state"
                        id="venue.state"
                        required
                        value={formData.venue.state}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 placeholder-gray-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="venue.country" className="block text-sm font-medium text-gray-700">
                        Country
                      </label>
                      <input
                        type="text"
                        name="venue.country"
                        id="venue.country"
                        required
                        value={formData.venue.country}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 placeholder-gray-500"
                      />
                    </div>

                    <div>
                      <label htmlFor="venue.postalCode" className="block text-sm font-medium text-gray-700">
                        Postal Code
                      </label>
                      <input
                        type="text"
                        name="venue.postalCode"
                        id="venue.postalCode"
                        required
                        value={formData.venue.postalCode}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 placeholder-gray-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Event Details */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900">Event Details</h3>

                  <div>
                    <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                      Category
                    </label>
                    <select
                      name="category"
                      id="category"
                      required
                      value={formData.category}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 placeholder-gray-500"
                    >
                      <option value="">Select a category</option>
                      <option value="Music">Music</option>
                      <option value="Sports">Sports</option>
                      <option value="Arts & Theatre">Arts & Theatre</option>
                      <option value="Comedy">Comedy</option>
                      <option value="Family">Family</option>
                      <option value="Miscellaneous">Miscellaneous</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="price.amount" className="block text-sm font-medium text-gray-700">
                        Price
                      </label>
                      <input
                        type="number"
                        name="price.amount"
                        id="price.amount"
                        required
                        min="0"
                        step="0.01"
                        value={formData.price.amount}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 placeholder-gray-500"
                      />
                    </div>

                    <div>
                      <label htmlFor="price.currency" className="block text-sm font-medium text-gray-700">
                        Currency
                      </label>
                      <select
                        name="price.currency"
                        id="price.currency"
                        required
                        value={formData.price.currency}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 placeholder-gray-500"
                      >
                        <option value="USD">USD</option>
                        <option value="EUR">EUR</option>
                        <option value="GBP">GBP</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="capacity" className="block text-sm font-medium text-gray-700">
                      Capacity
                    </label>
                    <input
                      type="number"
                      name="capacity"
                      id="capacity"
                      required
                      min="1"
                      value={formData.capacity}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 placeholder-gray-500"
                    />
                  </div>

                  <div>
                    <label htmlFor="tags" className="block text-sm font-medium text-gray-700">
                      Tags (comma-separated)
                    </label>
                    <input
                      type="text"
                      name="tags"
                      id="tags"
                      value={formData.tags.join(', ')}
                      onChange={handleTagsChange}
                      placeholder="e.g. live, outdoor, family-friendly"
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 placeholder-gray-500"
                    />
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="isPublic"
                      id="isPublic"
                      checked={formData.isPublic}
                      onChange={(e) => setFormData(prev => ({ ...prev, isPublic: e.target.checked }))}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <label htmlFor="isPublic" className="ml-2 block text-sm text-gray-900">
                      Make this event public
                    </label>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-indigo-600 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </LocalizationProvider>
  );
} 