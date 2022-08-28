import {
  endOfDay,
  endOfMonth,
  fromUnixTime,
  getUnixTime,
  Interval,
  isValid,
  isWithinInterval,
  startOfDay,
  startOfMonth,
} from "date-fns";
import { formatInTimeZone, utcToZonedTime, zonedTimeToUtc } from "date-fns-tz";

export const DEFAULT_TARGET_TIME_ZONE = "Europe/London";
export const DATE_FMTSTR_HMSDMY_TZ = "HH:mm:ss.SSS d LLL yyyy (O)";

export const DATE_PICKER_MIN_DATE = startOfDay(new Date(2021, 8, 1));
export const DATE_PICKER_MAX_DATE = endOfDay(new Date(2024, 7, 31));
export const DATE_PICKER_ALLOWED_INTERVAL: Interval = {
  start: DATE_PICKER_MIN_DATE,
  end: DATE_PICKER_MAX_DATE,
};

export const fromUnixTimeMillisUtil = (unixTsMillis: number) => {
  const seconds = Math.floor(unixTsMillis / 1000);
  const milliseconds = unixTsMillis % 1000;
  const result = fromUnixTime(seconds);
  result.setMilliseconds(milliseconds);
  return result;
};

export const getUnixTimeMillisUtil = (date: Date) =>
  getUnixTime(date) * 1000 + date.getMilliseconds();

/**
 * Tl;dr in Razor language: Wack (system) to correct (actual). Mutates the underlying timestamp.
 * See end of this file for extended explanation.
 * E.g. When used in Singapore, and the specified timeZone is Europe/London, results in timestamp
 *      +7h.
 * USAGE IS ONLY REQUIRED AT THE SURFACE BOUNDARY BETWEEN ACTUAL TIMESTAMP AND WACK DATE
 */
export const systemReprToTsActualUtil = zonedTimeToUtc;
/**
 * Tl;dr in Razor language: Correct (actual) to wack (system). Mutates the underlying timestamp.
 * See end of this file for extended explanation.
 * E.g. When used in Singapore, and the specified timeZone is Europe/London, results in timestamp
 *      -7h.
 * USAGE IS ONLY REQUIRED AT THE SURFACE BOUNDARY BETWEEN ACTUAL TIMESTAMP AND WACK DATE
 */
export const tsActualToSystemReprUtil = utcToZonedTime;

/**
 * Returns the correct timestamp.
 */
export const startOfMonthMillisAsOfNowInTzUtil = (timeZone: string) =>
  getUnixTimeMillisUtil(
    systemReprToTsActualUtil(
      // startOfMonth returns first millisecond
      startOfMonth(tsActualToSystemReprUtil(new Date(), timeZone)),
      timeZone
    )
  );

/**
 * Returns the correct timestamp.
 */
export const endOfMonthMillisAsOfNowInTzUtil = (timeZone: string) =>
  getUnixTimeMillisUtil(
    systemReprToTsActualUtil(
      // endOfMonth returns last millisecond
      endOfMonth(tsActualToSystemReprUtil(new Date(), timeZone)),
      timeZone
    )
  );

export const getStartOfMonthTsFromTsUtil = (ts: number, timeZone: string) =>
  getUnixTimeMillisUtil(
    systemReprToTsActualUtil(
      // startOfMonth returns first millisecond
      startOfMonth(
        tsActualToSystemReprUtil(fromUnixTimeMillisUtil(ts), timeZone)
      ),
      timeZone
    )
  );

/**
 * @param date Assumed to be valid.
 */
export const isWithinAllowedIntervalUtil = (date: Date) =>
  isWithinInterval(date, {
    start: DATE_PICKER_MIN_DATE,
    end: DATE_PICKER_MAX_DATE,
  });

export const generateDatePickerHelperTextUtil = (date: Date | null) =>
  date === null
    ? " "
    : !isValid(date)
    ? 'Date is not of form "month yyyy"'
    : !isWithinAllowedIntervalUtil(date)
    ? "Date is outside of allowed range"
    : " ";

export const generateDatePickerHelperTextUtilDebug = (
  date: Date | null,
  unixTsMillisActInc: number | null,
  timeZone: string
) => {
  const pickerString =
    date === null
      ? "null"
      : !isValid(date)
      ? 'Date is not of form "month yyyy"'
      : !isWithinAllowedIntervalUtil(date)
      ? "Date is outside of allowed range"
      : formatInTimeZone(date, timeZone, DATE_FMTSTR_HMSDMY_TZ);
  const reduxString =
    unixTsMillisActInc === null
      ? "null"
      : formatInTimeZone(
          fromUnixTimeMillisUtil(unixTsMillisActInc),
          DEFAULT_TARGET_TIME_ZONE,
          DATE_FMTSTR_HMSDMY_TZ
        );
  return `Picker: ${pickerString}; Redux: ${reduxString}`;
};

export const getCurrentTimeZoneString = (timeZone: string) =>
  formatInTimeZone(getUnixTimeMillisUtil(new Date()), timeZone, "O");

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
