interface CalendarEvent {
    title: string;
    description?: string;
    location?: string;
    startTime: string;
    endTime: string;
}

export function generateGoogleCalendarUrl(event: CalendarEvent): string {
    const params = new URLSearchParams({
        action: 'TEMPLATE',
        text: event.title,
        dates: `${formatDateTime(event.startTime)}/${formatDateTime(event.endTime)}`,
        ...(event.description && { details: event.description }),
        ...(event.location && { location: event.location })
    });

    return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

// Helper function to format datetime for Google Calendar URL
function formatDateTime(dateTimeStr: string): string {
    const date = new Date(dateTimeStr);
    return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
} 