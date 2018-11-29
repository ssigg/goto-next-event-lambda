import { Injectable } from '@angular/core';
import { GoogleMapsAPIWrapper } from '@agm/core';
import { HttpClient } from '@angular/common/http';
import { GeoLocation } from './model';

declare var google: any;

@Injectable()
export class GoogleGeocodingService {
  constructor(private httpClient: HttpClient) { }

  public async getCoordinates(address: string): Promise<GeoLocation> {
    const googleApiKey = 'AIzaSyCpLjmfi3hs4lphiXcFt1p3EKZa-OdJzzA'; // TODO: define this only once in the module
    const googleGeoCodingUrl = 'https://maps.googleapis.com/maps/api/geocode/json?key=' + googleApiKey + '&address=' + address;
    return new Promise<GeoLocation>((resolve, reject) => {
      this.httpClient.get<GoogleGeocodeResponse>(googleGeoCodingUrl).subscribe(data => {
        resolve(data.results[0].geometry.location);
      });
    });
  }
}

class GoogleGeocodeResponse {
  results: GoogleGeocodeResult[];
}

class GoogleGeocodeResult {
  geometry: GoogleGeocodeGeometry;
}

class GoogleGeocodeGeometry {
  location: GeoLocation;
}
