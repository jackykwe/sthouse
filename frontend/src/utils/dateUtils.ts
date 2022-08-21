import { endOfMonth, fromUnixTime, getUnixTime } from "date-fns";
import { utcToZonedTime, zonedTimeToUtc } from "date-fns-tz";

export const fromUnixTimeMillisUtil = (unixTsMillis: number) =>
  fromUnixTime(Math.floor(unixTsMillis / 1000));

export const getUnixTimeMillisUtil = (date: Date) =>
  getUnixTime(date) * 1000 + date.getMilliseconds();

/**
 * Tl;dr in Razor language: Wack (system) to correct (actual). Mutates the underlying timestamp.
 * See end of this file for extended explanation.
 * E.g. When used in Singapore, and the specified timeZone is Europe/London, results in timestamp
 *      +7h.
 * USAGE IS ONLY REQUIRED AT THE SURFACE BOUNDARY BETWEEN ACTUAL TIMESTAMP AND WACK DATE
 */
export const systemToActualUtil = zonedTimeToUtc;
/**
 * Tl;dr in Razor language: Correct (actual) to wack (system). Mutates the underlying timestamp.
 * See end of this file for extended explanation.
 * E.g. When used in Singapore, and the specified timeZone is Europe/London, results in timestamp
 *      -7h.
 * USAGE IS ONLY REQUIRED AT THE SURFACE BOUNDARY BETWEEN ACTUAL TIMESTAMP AND WACK DATE
 */
export const actualToSystemUtil = utcToZonedTime;

/**
 * Returns the correct timestamp.
 */
export const endOfMonthMillisAsOfNowInTzUtil = (timeZone: string) =>
  getUnixTimeMillisUtil(
    systemToActualUtil(
      // endOfMonth returns last millisecond
      endOfMonth(
        // actualToSystemUtil() used in a special way here ... // TODO understand and document
        actualToSystemUtil(new Date(), timeZone)
      ),
      timeZone
    )
  );

/**
 * Returns a date with the correct timestamp.
 * Razor language: -7h TS if done in SG, endOfMonth(), then +7h TS if done in SG
 */
export const endOfMonthInTzUtil = (sysDate: Date, timeZone: string) =>
  systemToActualUtil(
    endOfMonth(actualToSystemUtil(sysDate, timeZone)), // endOfMonth returns last millisecond
    timeZone
  );

/*
const systemTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
console.log(systemTimeZone);

console.log(getUnixTime(new Date()));
console.log(getUnixTime(zonedTimeToUtc(new Date(), systemTimeZone)));   // no change
console.log(getUnixTime(zonedTimeToUtc(new Date(), "Europe/London")));  // moved forward in time (TS got bigger) by 7h
console.log(getUnixTime(utcToZonedTime(new Date(), systemTimeZone)));   // no change
console.log(getUnixTime(utcToZonedTime(new Date(), "Europe/London")));  // moved backwards in time (TS got smaller) by 7h

console.log(new Date().toISOString());
console.log(zonedTimeToUtc(new Date(), systemTimeZone).toISOString());   // no change
console.log(zonedTimeToUtc(new Date(), "Europe/London").toISOString());  // moved forward in time (TS got bigger) by 7h
console.log(utcToZonedTime(new Date(), systemTimeZone).toISOString());   // no change
console.log(utcToZonedTime(new Date(), "Europe/London").toISOString());  // moved backwards in time (TS got smaller) by 7h

Conclusion:
- zonedTimeToUtc()'s effect: you specify a date instance in systemTimeZone, and it gives you the
  timestamp of the exact same date (year, month, day, hour, second, millisecond) but in the
  specified timezone

  E.g. When in Singapore, calling this function with "Europe/London" as the timezone argument (BST
       at time of writing) results in a +7h in timestamp.
       This is because the timestamp of 9pm 21 Aug in Europe/London (actual) is 7h bigger than the
       timestamp of 9pm 21 Aug in Asia/Singapore (system).

  This must be what the date-fns-tz documentation tried to convey, but was done poorly.
  W.r.t. the documentation, the use case here is, I select via a DatePicker 9pm 21 Aug, supposedly
         thinking that I'm picking a time in BST, but the value is actually in SGT. This function
         ensures that the timestamp value is correct (9pm 21 Aug in Europe/London) after conversion.

  Tl;dr in Razor language: Wack (system) to correct (actual).

- utcToZonedTime()'s effect: basically the inverse operation of zonedTimeToUtc().

  E.g. When in Singapore, calling this function with "Europe/London" as the timezone argument (BST
       at time of writing) results in a -7h in timestamp.
       This is because the timestamp of 9pm 21 Aug in Asia/Singapore (system) is 7h smaller than the
       timestamp of 9pm 21 Aug in Europe/London (actual).

  This must be what the date-fns-tz documentation tried to convey, but was done poorly.
  W.r.t. the documentation, the use case here is, the backend returns 9pm 21 Aug in BST. This
         function ensures that the timestamp value is correct before, but "wack" after conversion:
         now I can use a DatePicker thinking that I'm picking a time in BST, but the value is
         actually in SGT.

  Tl;dr in Razor language: Correct (actual) to wack (system).
*/
