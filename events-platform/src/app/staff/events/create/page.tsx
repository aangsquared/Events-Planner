'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useRole } from '@/app/hooks/useRole';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import dayjs from 'dayjs';
import DashboardHeader from '@/app/components/DashboardHeader';
import Image from 'next/image';

const categoryImages = {
  'Music': [
    { url: '/images/events/music-concert.png', alt: 'Concert crowd at night' },
    { url: '/images/events/music-festival.png', alt: 'Music festival stage' },
    { url: '/images/events/music-classical.png', alt: 'Classical orchestra' }
  ],
  'Sports': [
    { url: '/images/events/sports-stadium.png', alt: 'Sports stadium' },
    { url: '/images/events/sports-field.png', alt: 'Sports field' },
    { url: '/images/events/sports-court.png', alt: 'Indoor sports court' }
  ],
  'Arts & Theatre': [
    { url: '/images/events/theatre-stage.png', alt: 'Theatre stage' },
    { url: '/images/events/art-gallery.png', alt: 'Art gallery' },
    { url: '/images/events/theatre-seats.png', alt: 'Theatre seats' }
  ],
  'Comedy': [
    { url: '/images/events/comedy-mic.png', alt: 'Comedy microphone' },
    { url: '/images/events/comedy-stage.png', alt: 'Comedy club stage' },
    { url: '/images/events/comedy-crowd.png', alt: 'Comedy show audience' }
  ],
  'Family': [
    { url: '/images/events/family-park.png', alt: 'Family park event' },
    { url: '/images/events/family-carnival.png', alt: 'Family carnival' },
    { url: '/images/events/family-show.png', alt: 'Family show' }
  ],
  'Miscellaneous': [
    { url: '/images/events/misc-conference.png', alt: 'Conference hall' },
    { url: '/images/events/misc-workshop.png', alt: 'Workshop space' },
    { url: '/images/events/misc-venue.png', alt: 'General venue' }
  ]
};

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
  coverImage?: string;
}

interface ValidationErrors {
  [key: string]: string;
}

export default function CreateEventPage() {
  const router = useRouter();
  const { isStaff } = useRole();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
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
    coverImage: '',
  });

  // Redirect if not staff
  if (!isStaff) {
    router.push('/unauthorised');
    return null;
  }

  const validateForm = () => {
    const errors: ValidationErrors = {};
    
    if (!formData.name.trim()) {
      errors.name = 'Event name is required';
    }
    
    if (!formData.description.trim()) {
      errors.description = 'Description is required';
    }
    
    if (!formData.startDate) {
      errors.startDate = 'Start date is required';
    }
    
    if (!formData.startTime) {
      errors.startTime = 'Start time is required';
    }
    
    if (!formData.endDate) {
      errors.endDate = 'End date is required';
    }
    
    if (!formData.endTime) {
      errors.endTime = 'End time is required';
    }
    
    if (!formData.venue.name.trim()) {
      errors['venue.name'] = 'Venue name is required';
    }
    
    if (!formData.venue.address.trim()) {
      errors['venue.address'] = 'Address is required';
    }
    
    if (!formData.venue.city.trim()) {
      errors['venue.city'] = 'City is required';
    }
    
    if (!formData.venue.state.trim()) {
      errors['venue.state'] = 'State is required';
    }
    
    if (!formData.venue.country.trim()) {
      errors['venue.country'] = 'Country is required';
    }
    
    if (!formData.venue.postalCode.trim()) {
      errors['venue.postalCode'] = 'Postal code is required';
    }
    
    if (!formData.category) {
      errors.category = 'Category is required';
    }
    
    if (formData.capacity <= 0) {
      errors.capacity = 'Capacity must be greater than 0';
    }

    if (!formData.coverImage && formData.category) {
      errors.coverImage = 'Please select a cover image for your event';
    }

    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setValidationErrors({});

    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      setLoading(false);
      // Scroll to the first error
      const firstErrorField = document.querySelector('[data-error="true"]');
      if (firstErrorField) {
        firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    try {
      // Combine date and time before sending to API
      const combinedData = {
        ...formData,
        startDate: new Date(`${formData.startDate}T${formData.startTime}`).toISOString(),
        endDate: new Date(`${formData.endDate}T${formData.endTime}`).toISOString(),
        // Ensure cover image is first in the images array
        images: formData.coverImage ? [formData.coverImage] : [],
      };

      const response = await fetch('/api/events/platform', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(combinedData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create event');
      }

      router.push('/dashboard/events');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create event');
    } finally {
      setLoading(false);
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

  const handleCoverImageSelect = (imageUrl: string) => {
    setFormData(prev => ({
      ...prev,
      coverImage: imageUrl,
      images: [imageUrl]
    }));
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <div className="min-h-screen bg-gray-100 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h1 className="text-2xl font-semibold text-gray-900">Create Event</h1>
              <p className="mt-1 text-sm text-gray-500">
                Add a new event to the platform
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
                      Event Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      id="name"
                      required
                      value={formData.name}
                      onChange={handleInputChange}
                      data-error={!!validationErrors.name}
                      className={`mt-1 block w-full border ${validationErrors.name ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 placeholder-gray-500`}
                    />
                    {validationErrors.name && (
                      <p className="mt-1 text-sm text-red-500">{validationErrors.name}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                      Description <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      name="description"
                      id="description"
                      required
                      rows={4}
                      value={formData.description}
                      onChange={handleInputChange}
                      data-error={!!validationErrors.description}
                      className={`mt-1 block w-full border ${validationErrors.description ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 placeholder-gray-500`}
                    />
                    {validationErrors.description && (
                      <p className="mt-1 text-sm text-red-500">{validationErrors.description}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-4">
                      <div>
                        <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">
                          Start Date <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="date"
                          name="startDate"
                          id="startDate"
                          required
                          value={formData.startDate}
                          onChange={handleInputChange}
                          data-error={!!validationErrors.startDate}
                          className={`mt-1 block w-full border ${validationErrors.startDate ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-900`}
                        />
                        {validationErrors.startDate && (
                          <p className="mt-1 text-sm text-red-500">{validationErrors.startDate}</p>
                        )}
                      </div>
                      <div>
                        <label htmlFor="startTime" className="block text-sm font-medium text-gray-700">
                          Start Time <span className="text-red-500">*</span>
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
                              error: !!validationErrors.startTime
                            }
                          }}
                          ampm={false}
                        />
                        {validationErrors.startTime && (
                          <p className="mt-1 text-sm text-red-500">{validationErrors.startTime}</p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">
                          End Date <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="date"
                          name="endDate"
                          id="endDate"
                          required
                          value={formData.endDate}
                          onChange={handleInputChange}
                          data-error={!!validationErrors.endDate}
                          className={`mt-1 block w-full border ${validationErrors.endDate ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-900`}
                        />
                        {validationErrors.endDate && (
                          <p className="mt-1 text-sm text-red-500">{validationErrors.endDate}</p>
                        )}
                      </div>
                      <div>
                        <label htmlFor="endTime" className="block text-sm font-medium text-gray-700">
                          End Time <span className="text-red-500">*</span>
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
                              error: !!validationErrors.endTime
                            }
                          }}
                          ampm={false}
                        />
                        {validationErrors.endTime && (
                          <p className="mt-1 text-sm text-red-500">{validationErrors.endTime}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Venue Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900">Venue Information</h3>
                  
                  <div>
                    <label htmlFor="venue.name" className="block text-sm font-medium text-gray-700">
                      Venue Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="venue.name"
                      id="venue.name"
                      required
                      value={formData.venue.name}
                      onChange={handleInputChange}
                      data-error={!!validationErrors['venue.name']}
                      className={`mt-1 block w-full border ${validationErrors['venue.name'] ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 placeholder-gray-500`}
                    />
                    {validationErrors['venue.name'] && (
                      <p className="mt-1 text-sm text-red-500">{validationErrors['venue.name']}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="venue.address" className="block text-sm font-medium text-gray-700">
                      Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="venue.address"
                      id="venue.address"
                      required
                      value={formData.venue.address}
                      onChange={handleInputChange}
                      data-error={!!validationErrors['venue.address']}
                      className={`mt-1 block w-full border ${validationErrors['venue.address'] ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 placeholder-gray-500`}
                    />
                    {validationErrors['venue.address'] && (
                      <p className="mt-1 text-sm text-red-500">{validationErrors['venue.address']}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="venue.city" className="block text-sm font-medium text-gray-700">
                        City <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="venue.city"
                        id="venue.city"
                        required
                        value={formData.venue.city}
                        onChange={handleInputChange}
                        data-error={!!validationErrors['venue.city']}
                        className={`mt-1 block w-full border ${validationErrors['venue.city'] ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 placeholder-gray-500`}
                      />
                      {validationErrors['venue.city'] && (
                        <p className="mt-1 text-sm text-red-500">{validationErrors['venue.city']}</p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="venue.state" className="block text-sm font-medium text-gray-700">
                        State/Province <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="venue.state"
                        id="venue.state"
                        required
                        value={formData.venue.state}
                        onChange={handleInputChange}
                        data-error={!!validationErrors['venue.state']}
                        className={`mt-1 block w-full border ${validationErrors['venue.state'] ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 placeholder-gray-500`}
                      />
                      {validationErrors['venue.state'] && (
                        <p className="mt-1 text-sm text-red-500">{validationErrors['venue.state']}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="venue.country" className="block text-sm font-medium text-gray-700">
                        Country <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="venue.country"
                        id="venue.country"
                        required
                        value={formData.venue.country}
                        onChange={handleInputChange}
                        data-error={!!validationErrors['venue.country']}
                        className={`mt-1 block w-full border ${validationErrors['venue.country'] ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 placeholder-gray-500`}
                      />
                      {validationErrors['venue.country'] && (
                        <p className="mt-1 text-sm text-red-500">{validationErrors['venue.country']}</p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="venue.postalCode" className="block text-sm font-medium text-gray-700">
                        Postal Code <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="venue.postalCode"
                        id="venue.postalCode"
                        required
                        value={formData.venue.postalCode}
                        onChange={handleInputChange}
                        data-error={!!validationErrors['venue.postalCode']}
                        className={`mt-1 block w-full border ${validationErrors['venue.postalCode'] ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 placeholder-gray-500`}
                      />
                      {validationErrors['venue.postalCode'] && (
                        <p className="mt-1 text-sm text-red-500">{validationErrors['venue.postalCode']}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Event Details */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900">Event Details</h3>

                  <div>
                    <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                      Category <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="category"
                      id="category"
                      required
                      value={formData.category}
                      onChange={handleInputChange}
                      data-error={!!validationErrors.category}
                      className={`mt-1 block w-full border ${validationErrors.category ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 placeholder-gray-500`}
                    >
                      <option value="">Select a category</option>
                      <option value="Music">Music</option>
                      <option value="Sports">Sports</option>
                      <option value="Arts & Theatre">Arts & Theatre</option>
                      <option value="Comedy">Comedy</option>
                      <option value="Family">Family</option>
                      <option value="Miscellaneous">Miscellaneous</option>
                    </select>
                    {validationErrors.category && (
                      <p className="mt-1 text-sm text-red-500">{validationErrors.category}</p>
                    )}
                  </div>

                  {formData.category && (
                    <div className="space-y-4">
                      <label className="block text-sm font-medium text-gray-700">
                        Cover Image <span className="text-red-500">*</span>
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        {categoryImages[formData.category as keyof typeof categoryImages]?.map((image, index) => (
                          <div
                            key={index}
                            className={`relative cursor-pointer rounded-lg overflow-hidden ${
                              formData.coverImage === image.url ? 'ring-2 ring-indigo-500' : ''
                            }`}
                            onClick={() => handleCoverImageSelect(image.url)}
                          >
                            <div className="aspect-w-16 aspect-h-9 relative h-48">
                              <Image
                                src={image.url}
                                alt={image.alt}
                                fill
                                className="object-cover"
                                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                              />
                            </div>
                            {formData.coverImage === image.url && (
                              <div className="absolute inset-0 bg-indigo-500 bg-opacity-20 flex items-center justify-center">
                                <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                      {validationErrors.coverImage && (
                        <p className="mt-1 text-sm text-red-500">{validationErrors.coverImage}</p>
                      )}
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="price.amount" className="block text-sm font-medium text-gray-700">
                        Price <span className="text-red-500">*</span>
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
                        Currency <span className="text-red-500">*</span>
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
                      Capacity <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="capacity"
                      id="capacity"
                      required
                      min="1"
                      value={formData.capacity}
                      onChange={handleInputChange}
                      data-error={!!validationErrors.capacity}
                      className={`mt-1 block w-full border ${validationErrors.capacity ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 placeholder-gray-500`}
                    />
                    {validationErrors.capacity && (
                      <p className="mt-1 text-sm text-red-500">{validationErrors.capacity}</p>
                    )}
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
                  disabled={loading}
                  className="bg-indigo-600 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400"
                >
                  {loading ? 'Creating...' : 'Create Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </LocalizationProvider>
  );
} 