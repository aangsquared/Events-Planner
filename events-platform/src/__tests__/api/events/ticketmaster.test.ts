import { createMocks } from 'node-mocks-http';
import { GET } from '@/app/api/events/ticketmaster/route';

// Mock fetch
global.fetch = jest.fn();

describe('/api/events/ticketmaster', () => {
  const mockTicketmasterResponse = {
    _embedded: {
      events: [
        {
          id: 'tm123',
          name: 'Test Concert',
          info: 'Great concert',
          dates: {
            start: {
              localDate: '2024-06-01',
              localTime: '20:00:00',
              dateTime: '2024-06-01T20:00:00Z',
            },
            status: { code: 'onsale' },
          },
          _embedded: {
            venues: [
              {
                name: 'Test Arena',
                address: { line1: '123 Main St' },
                city: { name: 'Test City' },
                state: { name: 'Test State' },
                country: { name: 'USA' },
                location: { latitude: '40.7128', longitude: '-74.0060' },
              },
            ],
          },
          images: [{ url: 'http://example.com/image.jpg' }],
          classifications: [
            {
              segment: { name: 'Music' },
              genre: { name: 'Rock' },
              subGenre: { name: 'Alternative' },
            },
          ],
          priceRanges: [{ type: 'standard', currency: 'USD', min: 50, max: 150 }],
          url: 'http://ticketmaster.com/event/123',
          sales: {
            public: {
              startDateTime: '2024-01-01T10:00:00Z',
              endDateTime: '2024-06-01T19:00:00Z',
            },
          },
        },
      ],
    },
    page: {
      size: 20,
      totalElements: 1,
      totalPages: 1,
      number: 0,
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.TICKETMASTER_API_KEY = 'test-api-key';
  });

  afterEach(() => {
    delete process.env.TICKETMASTER_API_KEY;
  });

  it('should fetch and transform Ticketmaster events successfully', async () => {
    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockTicketmasterResponse,
    });

    const { req } = createMocks({
      method: 'GET',
      url: '/api/events/ticketmaster?city=New York&keyword=concert',
    });

    const response = await GET(req as any);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.events).toHaveLength(1);
    expect(data.events[0]).toMatchObject({
      id: 'tm_tm123',
      name: 'Test Concert',
      source: 'ticketmaster',
      venue: {
        name: 'Test Arena',
        city: 'Test City',
      },
    });
    expect(data.pagination).toEqual({
      page: 0,
      size: 20,
      totalElements: 1,
      totalPages: 1,
    });
  });

  it('should handle pagination parameters', async () => {
    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockTicketmasterResponse,
    });

    const { req } = createMocks({
      method: 'GET',
      url: '/api/events/ticketmaster?page=2&size=10',
    });

    await GET(req as any);

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('page=2&size=10')
    );
  });

  it('should handle search and filter parameters', async () => {
    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockTicketmasterResponse,
    });

    const { req } = createMocks({
      method: 'GET',
      url: '/api/events/ticketmaster?city=Chicago&keyword=jazz&category=Music',
    });

    await GET(req as any);

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('city=Chicago&keyword=jazz&classificationName=Music')
    );
  });

  it('should return error when API key is missing', async () => {
    delete process.env.TICKETMASTER_API_KEY;

    const { req } = createMocks({
      method: 'GET',
      url: '/api/events/ticketmaster',
    });

    const response = await GET(req as any);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe('Ticketmaster API key not configured');
  });

  it('should handle Ticketmaster API errors', async () => {
    (fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 429,
    });

    const { req } = createMocks({
      method: 'GET',
      url: '/api/events/ticketmaster',
    });

    const response = await GET(req as any);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe('Failed to fetch events from Ticketmaster');
  });

  it('should handle network errors', async () => {
    (fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

    const { req } = createMocks({
      method: 'GET',
      url: '/api/events/ticketmaster',
    });

    const response = await GET(req as any);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe('Failed to fetch events from Ticketmaster');
  });

  it('should return empty events array when no events found', async () => {
    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        page: {
          size: 20,
          totalElements: 0,
          totalPages: 0,
          number: 0,
        },
      }),
    });

    const { req } = createMocks({
      method: 'GET',
      url: '/api/events/ticketmaster',
    });

    const response = await GET(req as any);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.events).toEqual([]);
  });
});
