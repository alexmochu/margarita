// @flow

import * as DateFNS from 'date-fns';
import { head, last } from 'ramda';
import { fromGlobalId } from '@kiwicom/graphql-global-id';

import type { ApiRouteItem } from '../Itinerary';
import type { RouteStop, Sector, Segment } from '../../common/CommonTypes';

export const differenceInMinutes = (
  from: ?(string | number),
  to: ?(string | number),
) => {
  if (from == null || to == null) {
    return null;
  }
  const parseNonSpecificDate = date =>
    typeof date === 'string'
      ? DateFNS.parseISO(date)
      : DateFNS.fromUnixTime(date);

  return parseInt(
    DateFNS.differenceInMinutes(
      parseNonSpecificDate(to),
      parseNonSpecificDate(from),
    ),
    10,
  );
};

export const unmaskID = (ids: string[]): string[] =>
  ids.map(id => fromGlobalId(id));

export const mapVehicle = (type: ?string, uniqueNo: ?string) => ({
  type: type ?? null,
  uniqueNo: uniqueNo ?? null,
});

export const sanitizeCarrier = (routeItem: ?ApiRouteItem) => ({
  name: null, // @TODO - value is currently missing from API endpoint response
  code: routeItem?.airline ?? null,
});

export const getItineraryType = (routes: ?Array<Array<string>>) => {
  if (routes == null) {
    return null;
  }
  if (routes.length === 1) {
    return 'oneway';
  }
  if (routes.length === 2) {
    return 'return';
  }
  return null;
};

/**
 * This function converts route and routes data from REST API to well-structured Sectors with Segments.
 * Sector = The whole part from source to destination, e.g Oslo -> Prague. A return trip will have 2 sectors
 * and 1 way trip will have 1 sector. A multicity trip could have 2 or more sectors.
 * Segment = A part of the sector. Segments could be Oslo -> Warzaw, Warzaw -> Prague
 */
export const mapSectors = (
  routesList: ?(ApiRouteItem[]),
  routeCodes: ?Array<string[]>,
): ?Array<Sector> => {
  if (routesList == null || routeCodes == null) {
    return null;
  }
  const sectors = [];
  let currentSectorIndex = 0;
  let currentRouteCode = head(routeCodes) ?? [];

  let { currentSector, currentArrival } = sanitizeSector(
    routesList,
    currentRouteCode,
  );

  sectors[currentSectorIndex] = currentSector;

  routesList.forEach((route: ApiRouteItem) => {
    const segment = sanitizeSegment(route);

    if (sectors[currentSectorIndex].segments) {
      sectors[currentSectorIndex].segments.push(segment);
    }

    if (route.flyTo === currentArrival?.flyTo) {
      currentSectorIndex++;
      // $FlowExpectedError: We already tested that routeCodes != null
      currentRouteCode = routeCodes[currentSectorIndex];

      if (currentRouteCode == null) {
        return;
      }
      // $FlowExpectedError: We already tested that routesList != null
      const nextSector = sanitizeSector(routesList, currentRouteCode);
      currentArrival = nextSector.currentArrival;
      sectors[currentSectorIndex] = nextSector.currentSector;
    }
  });

  return sectors;
};

const sanitizeSector = (
  routesList: ApiRouteItem[],
  currentRouteCode: string[],
) => {
  const currentRouteArrivalCode = last(currentRouteCode) ?? '';
  const currentRouteDepartureCode = head(currentRouteCode) ?? '';

  const currentDeparture: ?ApiRouteItem = routesList.find(
    route => route.flyFrom === currentRouteDepartureCode,
  );

  const currentArrival: ?ApiRouteItem = routesList.find(
    route => route.flyTo === currentRouteArrivalCode,
  );

  const departure = apiRouteItemToDeparture(currentDeparture);
  const arrival = apiRouteItemToArrival(currentArrival);

  const currentSector = {
    duration: differenceInMinutes(departure.time?.utc, arrival.time?.utc),
    segments: [],
    stopoverDuration: 0,
    departure,
    arrival,
  };

  return {
    currentArrival,
    currentSector,
  };
};

const apiRouteItemToArrival = (routeItem: ?ApiRouteItem): RouteStop => ({
  code: routeItem?.flyTo,
  time: {
    utc: routeItem?.utc_arrival,
    local: routeItem?.local_arrival,
  },
});

const apiRouteItemToDeparture = (routeItem: ?ApiRouteItem): RouteStop => ({
  code: routeItem?.flyFrom,
  time: {
    utc: routeItem?.utc_departure,
    local: routeItem?.local_departure,
  },
});

const sanitizeSegment = (segment: ?ApiRouteItem): Segment => {
  return {
    duration: differenceInMinutes(segment?.utc_departure, segment?.utc_arrival),
    id: segment?.id,
    carrier: sanitizeCarrier(segment),
    vehicle: mapVehicle(segment?.vehicle_type, String(segment?.flight_no)),
    departure: apiRouteItemToDeparture(segment),
    arrival: apiRouteItemToArrival(segment),
  };
};