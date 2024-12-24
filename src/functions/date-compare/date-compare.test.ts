import {expect} from "@jest/globals";
import createContext from "../../context/create-context";
import dateCompare from "./date-compare";
import {DateTime} from "luxon";

const testAssertion = async (args: any[], result: any) => {
    const ctx = createContext({});
    expect(await dateCompare.evaluate({ context: ctx, args })).toEqual(result);
};

const testError = async (args: any[], error: string) => {
    // noinspection TypeScriptValidateTypes
    await expect(() => dateCompare.evaluate({ context: createContext({ expression: 'exp' }), args })).rejects.toThrow(error);
};

describe('dateCompare tests', () => {
    it('should compare equality', async () => {
        await testAssertion(['2024-01-01', '2024-01-01', 'unit=day'], true);
        await testAssertion(['2024-01-01', '2024-01-01', 'operator=='], true);
        await testAssertion(['2024-01-01', '2024-01-02', 'unit=day'], false);
        await testAssertion(['2025-01-01', '2024-01-01', 'unit=day'], false);
    });
    it('should compare if date a is before date b', async () => {
        await testAssertion(['2024-01-01', '2024-01-02', 'operator=<'], true);
        await testAssertion(['2024-01-01', '2024-01-01', 'operator=<'], false);
        await testAssertion(['2024-01-01 12:00', '2024-01-01 13:00', 'operator=<', 'unit=hour', 'format=yyyy-MM-dd HH:mm'], true);
        await testAssertion(['2024-01-02', '2024-01-01', 'operator=<'], false);
        await testAssertion(['2024-01-01 13:00', '2024-01-01 12:00', 'operator=<', 'unit=hour', 'format=yyyy-MM-dd HH:mm'], false);
    });
    it('should compare if date a is after date b', async () => {
        await testAssertion(['2024-01-02', '2024-01-01', 'operator=>'], true);
        await testAssertion(['2024-01-01', '2024-01-01', 'operator=>'], false);
        await testAssertion(['2024-01-01 13:00', '2024-01-01 12:00', 'operator=>', 'unit=hour', 'format=yyyy-MM-dd HH:mm'], true);
        await testAssertion(['2024-01-01', '2024-01-02', 'operator=>'], false);
        await testAssertion(['2024-01-01 12:00', '2024-01-01 13:00', 'operator=>', 'unit=hour', 'format=yyyy-MM-dd HH:mm'], false);
    });
    it('should compare if date a is same or before date b', async () => {
        await testAssertion(['2024-01-01', '2024-01-02', 'operator=<='], true);
        await testAssertion(['2024-01-02', '2024-01-02', 'operator=<='], true);
        await testAssertion(['2024-01-01 12:00', '2024-01-01 13:00', 'operator=<=', 'unit=hour', 'format=yyyy-MM-dd HH:mm'], true);
        await testAssertion(['2024-01-01 13:00', '2024-01-01 13:00', 'operator=<=', 'unit=hour', 'format=yyyy-MM-dd HH:mm'], true);
        await testAssertion(['2024-01-02', '2024-01-01', 'operator=<='], false);
        await testAssertion(['2024-01-01 13:00', '2024-01-01 12:00', 'operator=<=', 'unit=hour', 'format=yyyy-MM-dd HH:mm'], false);
    });
    it('should compare if date a is same or after date b', async () => {
        await testAssertion(['2024-01-02', '2024-01-01', 'operator=>='], true);
        await testAssertion(['2024-01-02', '2024-01-02', 'operator=>='], true);
        await testAssertion(['2024-01-01 13:00', '2024-01-01 12:00', 'operator=>=', 'unit=hour', 'format=yyyy-MM-dd HH:mm'], true);
        await testAssertion(['2024-01-01 13:00', '2024-01-01 13:00', 'operator=>=', 'unit=hour', 'format=yyyy-MM-dd HH:mm'], true);
        await testAssertion(['2024-01-01', '2024-01-02', 'operator=>='], false);
        await testAssertion(['2024-01-01 12:00', '2024-01-01 13:00', 'operator=>=', 'unit=hour', 'format=yyyy-MM-dd HH:mm'], false);
    });
    it('should parse format', async () => {
        await testAssertion(['2024-01-01', '2024-01-01', 'format=yyyy-MM-dd'], true);
        await testAssertion(['02-01-2024', '02-01-2024', 'format=MM-dd-yyyy'], true);
    });
    it('should parse timezone', async () => {
        await testAssertion(['2024-01-01T04:00:00.000+04:00', '2024-01-01T00:00:00.000Z', 'unit=hour'], true);
        await testAssertion(['2024-01-01 04:00', '2024-01-01 00:00', 'unit=hour', 'format=yyyy-MM-dd HH:mm', 'timezoneA=UTC+4', 'timezoneB=UTC'], true);
        await testAssertion(['2024-01-01 00:00', '2024-01-01 00:00', 'unit=hour', 'format=yyyy-MM-dd HH:mm', 'timezoneA=UTC+4', 'timezoneB=UTC'], false);
    });
    it('should compare JS dates', async () => {
        await testAssertion([new Date(), new Date()], true);
    });
    it('should compare luxon DateTimes', async () => {
        await testAssertion([DateTime.now(), DateTime.now()], true);
    });
    it('should parse NOW and intervals', async () => {
        await testAssertion([DateTime.now(), 'NOW'], true);
        await testAssertion([DateTime.now().plus({ years: 1 }), 'NOW+1Y'], true);
        await testAssertion([DateTime.now().minus({ years: 1 }), 'NOW-1Y'], true);
        await testAssertion([DateTime.now().plus({ months: 1 }), 'NOW+1M'], true);
        await testAssertion([DateTime.now().minus({ months: 1 }), 'NOW-1M'], true);
        await testAssertion([DateTime.now().plus({ days: 1 }), 'NOW+1D'], true);
        await testAssertion([DateTime.now().minus({ days: 1 }), 'NOW-1D'], true);
        await testAssertion([DateTime.now().plus({ hours: 1 }), 'NOW+1H'], true);
        await testAssertion([DateTime.now().minus({ hours: 1 }), 'NOW-1H'], true);
        await testAssertion([DateTime.now().plus({ minutes: 1 }), 'NOW+1m'], true);
        await testAssertion([DateTime.now().minus({ minutes: 1 }), 'NOW-1m'], true);
        await testError(['NOW+1f', 'NOW'], 'DATECOMP() received invalid interval +1f');
        await testError(['NOW+1d', 'NOW'], 'DATECOMP() received invalid interval +1d');
    });
    it('should compare dates if values are wrapped in quotes', async () => {
        await testAssertion([DateTime.fromISO('2000-01-02'), '"01-02-2000"', 'formatB="MM-dd-yyyy"'], true);
        await testAssertion([DateTime.fromISO('2000-01-02'), '01-02-2000', 'formatB="MM-dd-yyyy"'], true);
        await testAssertion([DateTime.fromISO('2000-01-02'), '01-02-2000', 'formatB=MM-dd-yyyy'], true);
    });
    it('should throw error when parsing error is encountered', async () => {
        await testError(['2024-01-01', '2024-01-01', 'format=invalid'], 'DATECOMP() failed to parse date 2024-01-01 in expression: exp');
        await testError(['2024-01', '2024-01-01', 'format=yyyy-MM-dd'], 'DATECOMP() failed to parse date 2024-01 in expression: exp');
        await testError(['invalid', '2024-01-01'], 'DATECOMP() failed to parse date invalid in expression: exp');
        await testError(['2024-01-01', '2024-01-01', 'timezone=invalid'], 'DATECOMP() failed to parse date 2024-01-01 in expression: exp');
        await testError(['2024-01-01', '2024-01-01', 'timezone=invalid', 'format=yyyy-MM-dd'], 'DATECOMP() failed to parse date 2024-01-01 in expression: exp');
        await testError(['2024-01-01', '2024-01-01', 'unit=invalid'], 'DATECOMP() failed to compare date 2024-01-01T00:00:00.000Z to 2024-01-01T00:00:00.000Z in expression: exp');
    });
});