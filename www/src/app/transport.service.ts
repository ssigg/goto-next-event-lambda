import * as moment from 'moment-timezone';
import { Injectable } from '@angular/core';
import { GeoLocation, TransportEndPoint, TransportLocation, TransportConnectionList, TransportConnection } from './model';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class TransportService {
  private apiUrl = 'https://transport.opendata.ch/v1/';

  constructor(private readonly httpClient: HttpClient) { }

  public async getBestConnection(sourceLocation: GeoLocation, targetLocation: GeoLocation, targetTimestamp: number) {
    const sourceStation = await this.getBestStation(sourceLocation);
    const targetStation = await this.getBestStation(targetLocation);
    const connections = await this.getConnections(sourceStation, targetStation, targetTimestamp);
    const bestConnection = this.selectBestConnection(connections, targetTimestamp);
    return bestConnection;
  }

  private async getBestStation(position: GeoLocation): Promise<TransportEndPoint> {
    const query = 'x=' + position.lat + '&y=' + position.lng;
    const locationResponse = await this.httpClient.get<TransportLocation>(this.apiUrl + 'locations?' + query).toPromise();
    return locationResponse.stations.sort((a, b) => a.distance - b.distance > 0 ? 1 : -1)[0];
  }

  private async getConnections(start: TransportEndPoint, end: TransportEndPoint, arrivalTimestamp: number): Promise<TransportConnection[]> {
    const arrivalTime = moment(arrivalTimestamp).tz('Europe/Zurich');
    const arrivalDateString = arrivalTime.format('YYYY-MM-DD');
    const arrivalTimeString = arrivalTime.format('HH:mm');
    const query = 'from=' + start.name + '&to=' + end.name + '&date=' + arrivalDateString + '&time=' + arrivalTimeString + '&isArrivalTime=1';
    const connectionListResponse = await this.httpClient.get<TransportConnectionList>(this.apiUrl + 'connections?' + query).toPromise();
    return connectionListResponse.connections;
  }

  private selectBestConnection(connections: TransportConnection[], eventStartTimestamp: number): TransportConnection {
    return connections.reverse().find(c => this.getArrivalTimestamp(c) < eventStartTimestamp);
  }

  private getArrivalTimestamp(connection: TransportConnection): number {
    const walkFactor = 0.9;
    const lastSection = connection.sections[connection.sections.length - 1];
    if (lastSection.walk != null) {
      const walkDuration = lastSection.arrival.arrivalTimestamp - lastSection.departure.departureTimestamp;
      const difference = walkDuration - (walkDuration * walkFactor);
      const dateTime = this.parseTimeString(connection.to.arrival);
      return dateTime - difference * 6 * 1000;
    } else {
      const dateTime = this.parseTimeString(connection.to.arrival);
      return dateTime;
    }
  }

  private parseTimeString(dateString: string): number {
    const timestamp = moment.tz(dateString, 'Europe/Zurich').toDate().valueOf();
    return timestamp;
  }

}
