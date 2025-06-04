export const validateImageUrl = (url: string): string => {
    // If the URL starts with a slash, it's a valid relative URL
    if (url.startsWith('/')) {
        return url;
    }

    try {
        const parsedUrl = new URL(url);
        // Check if the URL is using a supported protocol
        if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
            return '/images/event-placeholder.png';
        }
        return url;
    } catch (e) {
        // If URL parsing fails, return the placeholder
        return '/images/event-placeholder.png';
    }
};

export const getEventImage = (images: string[]): string => {
    if (!images || images.length === 0) {
        return '/images/event-placeholder.png';
    }

    // Try to get a valid image from the array
    for (const image of images) {
        const validatedUrl = validateImageUrl(image);
        if (validatedUrl !== '/images/event-placeholder.png') {
            return validatedUrl;
        }
    }

    return '/images/event-placeholder.png';
}; 