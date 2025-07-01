interface GeocodingResponse {
  lat: string;
  lon: string;
  display_name: string;
}

interface GeocodeResult {
  latitude: number;
  longitude: number;
  displayName: string;
}

interface GeocodeError {
  error: string;
  details?: string;
}

type GeocodeServiceResult = GeocodeResult | GeocodeError;

class GeocodingService {
  private static instance: GeocodingService;
  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly cache = new Map<string, GeocodeResult>();
  private readonly CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours
  private readonly REQUEST_TIMEOUT = 5000; // 5 seconds

  private constructor() {
    this.apiKey = process.env.GEOCODING_API_KEY!;
    this.baseUrl = "https://geocode.maps.co";

    if (!this.apiKey) {
      throw new Error("GEOCODING_API_KEY environment variable is required");
    }
  }

  static getInstance(): GeocodingService {
    if (!GeocodingService.instance) {
      GeocodingService.instance = new GeocodingService();
    }
    return GeocodingService.instance;
  }

  async getCoordinates(address: string): Promise<GeocodeServiceResult> {
    // Input validation
    if (
      !address ||
      typeof address !== "string" ||
      address.trim().length === 0
    ) {
      return { error: "Address is required and must be a non-empty string" };
    }

    const normalizedAddress = address.trim().toLowerCase();

    // Check cache first
    const cached = this.cache.get(normalizedAddress);
    if (cached) {
      return cached;
    }

    try {
      const encodedAddress = encodeURIComponent(address);
      const url = `${this.baseUrl}/search?q=${encodedAddress}&api_key=${this.apiKey}&limit=1`;

      // Create AbortController for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(
        () => controller.abort(),
        this.REQUEST_TIMEOUT,
      );

      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          "User-Agent": "bandsy-app/1.0",
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text().catch(() => "Unknown error");
        return {
          error: `Geocoding API error: ${response.status}`,
          details: errorText,
        };
      }

      const data = (await response.json()) as GeocodingResponse[];

      if (!data || data.length === 0) {
        return {
          error: "No results found for the provided address",
        };
      }

      const result = data[0];
      if (!result?.lat || !result?.lon) {
        return {
          error: "Invalid response format from geocoding API",
        };
      }

      // Convert strings to numbers and validate
      const latitude = parseFloat(result.lat);
      const longitude = parseFloat(result.lon);

      if (isNaN(latitude) || isNaN(longitude)) {
        return {
          error: "Invalid coordinates received from geocoding API",
        };
      }

      // Validate coordinate ranges
      if (
        latitude < -90 ||
        latitude > 90 ||
        longitude < -180 ||
        longitude > 180
      ) {
        return {
          error: "Coordinates are outside valid range",
        };
      }

      const geocodeResult: GeocodeResult = {
        latitude,
        longitude,
        displayName: result.display_name || address,
      };

      // Cache the result
      this.cache.set(normalizedAddress, geocodeResult);

      // Clean cache periodically (simple implementation)
      if (this.cache.size > 1000) {
        this.clearOldCacheEntries();
      }

      return geocodeResult;
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === "AbortError") {
          return {
            error:
              "Request timeout - geocoding service took too long to respond",
          };
        }
        return { error: `Network error: ${error.message}` };
      }
      return { error: "Unknown error occurred during geocoding" };
    }
  }

  private clearOldCacheEntries(): void {
    // Simple cache cleanup - in production, you might want to track timestamps
    const keysToDelete = Array.from(this.cache.keys()).slice(0, 500);
    keysToDelete.forEach((key) => this.cache.delete(key));
  }

  // Utility method to check if result is an error
  static isError(result: GeocodeServiceResult): result is GeocodeError {
    return "error" in result;
  }

  // Clear cache manually if needed
  clearCache(): void {
    this.cache.clear();
  }
}

export default GeocodingService;
export type { GeocodeResult, GeocodeError, GeocodeServiceResult };
