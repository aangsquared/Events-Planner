import { generateGoogleCalendarUrl } from '@/lib/google/calendar';
import { CalendarIcon } from '@heroicons/react/24/outline';

interface AddToCalendarButtonProps {
  eventName: string;
  startTime: string;
  endTime: string;
  location?: string;
  description?: string;
}

export default function AddToCalendarButton({
  eventName,
  startTime,
  endTime,
  location,
  description
}: AddToCalendarButtonProps) {
  const handleAddToCalendar = () => {
    const calendarUrl = generateGoogleCalendarUrl({
      title: eventName,
      startTime,
      endTime,
      location,
      description
    });
    window.open(calendarUrl, '_blank');
  };

  return (
    <button
      onClick={handleAddToCalendar}
      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
    >
      <CalendarIcon className="h-5 w-5 mr-2" />
      Add to Calendar
    </button>
  );
} 