export interface IcalElement { }

export class IcalCalendar implements IcalElement {
    constructor() {
        this.events = [];
    }
    public name: string;
    public events: IcalEvent[];
}

export class IcalEvent implements IcalElement {
    public startTimestamp: number;
    public endTimestamp: number;
    public locationLines: string[];
    public geoLocation: GeoLocation;
    public summary: string;
}

export class GeoLocation {
    public lat: number;
    public lng: number;
}

export class TransportLocation {
    public stations: TransportEndPoint[];
}

export class TransportEndPoint {
    public name: string;
    public distance: number;
}

export class TransportConnectionList {
    public connections: TransportConnection[];
}

export class TransportConnection {
    public from: TransportDeparture;
    public to: TransportArrival;
    public sections: TransportSection[];
}

export class TransportSection {
    public walk: any;
    public departure: any;
    public arrival: any;
}

export class TransportDeparture {
    public departure: string;
    public station: TransportStation;
}

export class TransportArrival {
    public arrival: string;
    public station: TransportStation;
}

export class TransportStation {
    public name: string;
}
