import { Http2ServerRequest, Http2ServerResponse } from "http2";
import { IcloudService } from "./ical/icloud.service";
import { IcalParserService } from "./ical/ical-parser.service";
import { IcalCalendar, IcalEvent } from "./ical/ical.entities";

module.exports = async (req: Http2ServerRequest, res: Http2ServerResponse) => {
    const calendarIds = req.url.split('=')[1].split('|');
    
    const icloudService = new IcloudService();
    const icalStrings = await Promise.all(calendarIds.map(async id => await icloudService.getIcalString(id)));
    
    const icalParserService = new IcalParserService();
    const icalCalendars = icalStrings.map(s => icalParserService.parse(s)).reduce((pv, cv) => pv.concat(cv), []);

    const coloredEvents = getColoredEvents(icalCalendars, 1);

    res.end(JSON.stringify(coloredEvents));
};

function getColoredEvents(calendars: IcalCalendar[], limit: number): ColoredIcalEvent[] {
    return calendars
        .map(c => c.events.map(e => new ColoredIcalEvent(c.color, e)))
        .reduce((pv, cv) => pv.concat(cv))
        .filter(e => e.event.startTimestamp > Date.now())
        .filter(e => e.event.geoLocation !== undefined || e.event.locationLines !== undefined)
        .sort((a, b) => a.event.startTimestamp - b.event.startTimestamp > 0 ? 1 : -1)
        .slice(0, limit);
}

class ColoredIcalEvent {
    constructor(color: string, event: IcalEvent) {
        this.color = color;
        this.event = event;
    }
    color: string;
    event: IcalEvent;
}
