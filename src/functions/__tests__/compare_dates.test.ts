import {expect} from "@jest/globals";
import createContext from "../../create-context";
import ExpressionError from "../../expression-error";
import compareDates from "../compare-dates";

const testAssertion = async (args: any[], result: any) => {
    const ctx = createContext({});
    expect(await compareDates.evaluate(ctx, ...args)).toEqual(result);
};

const testError = async (args: any[], error: ExpressionError) => {
    // noinspection TypeScriptValidateTypes
    await expect(() => compareDates.evaluate(createContext({ expression: 'exp' }), ...args)).rejects.toThrowError(error);
};

describe('compareDates tests', () => {
    it('should compare equality', async () => {
        await testAssertion(['2024-01-01', '2024-01-01', 'unit=day'], true);
        await testAssertion(['2024-01-01', '2024-01-02', 'unit=day'], false);
        await testAssertion(['2025-01-01', '2024-01-01', 'unit=day'], false);
    });
    it('should parse format', async () => {
        await testAssertion(['2024-01-01', '2024-01-01', 'format=yyyy-MM-dd'], true);
        await testAssertion(['02-01-2024', '02-01-2024', 'format=MM-dd-yyyy'], true);
    });
});