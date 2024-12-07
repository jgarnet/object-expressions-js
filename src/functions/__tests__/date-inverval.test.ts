import createContext from "../../create-context";
import dateInterval from "../date-interval";
import {DateTime} from "luxon";

const testAssertion = async (args: any[], result: any) => {
    const ctx = createContext({});
    expect(await dateInterval.evaluate({ context: ctx, args })).toEqual(result);
};

const testError = async (args: any[], error: string) => {
    // noinspection TypeScriptValidateTypes
    await expect(() => dateInterval.evaluate({ context: createContext({ expression: 'exp' }), args })).rejects.toThrow(error);
};

describe('dateInterval tests', () => {
    it('should throw error if invalid args received', async () => {
        await testError([], 'DATEIVL() requires a date and an interval; invalid arguments received in expression: exp');
        await testError(['2024-01-01'], 'DATEIVL() requires a date and an interval; invalid arguments received in expression: exp');
        await testError(['2024-01-01', 'invalid'], 'DATEIVL() received invalid interval invalid');
        await testError(['invalid', 'invalid'], 'DATEIVL() failed to parse date invalid in expression: exp');
    });
    it('should apply interval to date', async () => {
        await testAssertion(['2024-01-20', '-10D'], DateTime.fromISO('2024-01-10', { zone: 'UTC' }));
        await testAssertion(['"2024-01-20"', '-10D'], DateTime.fromISO('2024-01-10', { zone: 'UTC' }));
        await testAssertion(['"2024-01-20"', '"-10D"'], DateTime.fromISO('2024-01-10', { zone: 'UTC' }));
        await testAssertion(['2024-01-20', '"-10D"'], DateTime.fromISO('2024-01-10', { zone: 'UTC' }));
    });
    it('should apply interval to date using timezone', async () => {
        await testAssertion(['2024-01-20', '-10D', 'timezone=UTC+5'], DateTime.fromISO('2024-01-10', { zone: 'UTC+5' }));
    });
    it('should apply interval to date using format', async () => {
        await testAssertion(['20-01-2024', '-10D', 'format="dd-MM-yyyy"'], DateTime.fromISO('2024-01-10', { zone: 'UTC' }));
    });
    it('should support year, month, day, hour, minute in interval', async () => {
        await testAssertion(['2024-01-01', '+1Y'], DateTime.fromISO('2025-01-01', { zone: 'UTC' }));
        await testAssertion(['2024-01-01', '+1M'], DateTime.fromISO('2024-02-01', { zone: 'UTC' }));
        await testAssertion(['2024-01-01', '+1D'], DateTime.fromISO('2024-01-02', { zone: 'UTC' }));
        await testAssertion(['2024-01-01T00:00', '+1H'], DateTime.fromISO('2024-01-01T01:00', { zone: 'UTC' }));
        await testAssertion(['2024-01-01T00:00', '+1m'], DateTime.fromISO('2024-01-01T00:01', { zone: 'UTC' }));
    });
});