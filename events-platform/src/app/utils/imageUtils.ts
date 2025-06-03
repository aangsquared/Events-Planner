export const validateImageUrl = (url: string): string => {
    try {
        const parsedUrl = new URL(url);
        // Check if the URL is using a supported protocol
        if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
            return '/images/event-placeholder.jpg';
        }
        return url;
    } catch (e) {
        // If URL parsing fails, return the placeholder
        return '/images/event-placeholder.jpg';
    }
};

export const getEventImage = (images: string[]): string => {
    if (!images || images.length === 0) {
        return '/images/event-placeholder.jpg';
    }

    return validateImageUrl(images[0]);
}; 