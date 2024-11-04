import {describe, expect, it} from "@jest/globals";
import createContext from "../../create-context";
import pow from "../pow";

const testAssertion = async (a: number, b: number, result: number) => {
    // https://youtrack.jetbrains.com/issue/WEB-36766
    // noinspection TypeScriptValidateTypes
    expect(await pow.evaluate(createContext({}), a, b)).toEqual(result);
};

describe('pow tests', () => {
    it('should take the power of a base to an exponent', async () => {
        await testAssertion(10, 2, 100);
        await testAssertion(2, 10, 1024);
    });
});