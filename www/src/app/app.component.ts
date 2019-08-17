import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { IcalEvent, GeoLocation, TransportConnection, TransportSection } from './model';
import { GoogleGeocodingService } from './google-geocoding.service';
import { TransportService } from './transport.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  public sourceGeoLocation: GeoLocation;
  public targetGeoLocation: GeoLocation;
  public nextEventWithConnection: NextEventWithConnection;

  constructor (private readonly route: ActivatedRoute, private readonly httpClient: HttpClient, private readonly googleGeocoding: GoogleGeocodingService, private readonly transportService: TransportService) { }

  public async ngOnInit(): Promise<void> {
    this.route.queryParams.subscribe(params => this.loadData(params));
  }

  public removeSection(section: TransportSection): void {
    if (!this.nextEventWithConnection) {
      return;
    }
    const nonFootwalkConnections = this.nextEventWithConnection.connection.sections.filter(s => s.walk == null);
    if (this.nextEventWithConnection && section === nonFootwalkConnections[nonFootwalkConnections.length - 1]) {
      this.nextEventWithConnection.connection.sections = this.nextEventWithConnection.connection.sections.filter(s => s !== section);
    }
  }

  private async loadData(params: Params): Promise<void> {
    if (params['calendarIds'] !== undefined) {
      const sourceLocationPromise = this.getSourceLocation();
      const coloredEventsPromise = this.getCalendarEvent(params);
      const firstColoredEvent = (await coloredEventsPromise)[0];
      const targetLocationPromise = this.getTargetLocation(firstColoredEvent);
      this.sourceGeoLocation = await sourceLocationPromise;
      this.targetGeoLocation = await targetLocationPromise;
      this.nextEventWithConnection = await this.getNextEventWithConnection(this.sourceGeoLocation, this.targetGeoLocation, firstColoredEvent);
    }
  }

  private async getSourceLocation(): Promise<GeoLocation> {
    if (window.navigator && window.navigator.geolocation) {
      return new Promise<GeoLocation>(resolve => {
        window.navigator.geolocation.getCurrentPosition(
          position => resolve({ lat: position.coords.latitude, lng: position.coords.longitude }),
          _ => resolve({ lat: 47.375220, lng: 8.539902 })
        );
      });
    } else {
      return Promise.resolve({ lat: 47.375220, lng: 8.539902 });
    }
  }

  private async getCalendarEvent(params: Params): Promise<ColoredIcalEvent[]> {
    const calendarIdsString = params['calendarIds'];
    return this.httpClient.get<ColoredIcalEvent[]>('/api/icloud-calendar.js?calendarIds=' + calendarIdsString).toPromise();
  }

  private async getTargetLocation(coloredEvent: ColoredIcalEvent): Promise<GeoLocation> {
    if (coloredEvent.event.geoLocation) {
      return Promise.resolve(coloredEvent.event.geoLocation);
    } else {
      return this.googleGeocoding.getCoordinates(coloredEvent.event.locationLines.join(' '));
    }
  }

  private async getNextEventWithConnection(sourceLocation: GeoLocation, targetLocation: GeoLocation, coloredEvent: ColoredIcalEvent): Promise<NextEventWithConnection> {
    const connection = await this.transportService.getBestConnection(sourceLocation, targetLocation, coloredEvent.event.startTimestamp);
    return new NextEventWithConnection(coloredEvent, connection);
  }
}

export class NextEventWithConnection {
  constructor(event: ColoredIcalEvent, connection: TransportConnection) {
    this.coloredEvent = event;
    this.connection = connection;
  }
  coloredEvent: ColoredIcalEvent;
  connection: TransportConnection;
}

export class ColoredIcalEvent {
  constructor(color: string, event: IcalEvent) {
    this.color = color;
    this.event = event;
  }
  color: string;
  event: IcalEvent;
}
