import { EVENT_CONFIG, maskPhoneNumber } from './eventConfig';

export const EVENT_DETAILS = {
  TITLE: EVENT_CONFIG.name,
  SUBTITLE: EVENT_CONFIG.tagline,
  DATE_STRING: EVENT_CONFIG.dateShort,
  TIME_STRING: EVENT_CONFIG.time,
  VENUE: EVENT_CONFIG.venue,
  WEBSITE_URL: EVENT_CONFIG.websiteUrl,
};

export { maskPhoneNumber };
