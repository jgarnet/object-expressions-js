import {describe, expect, it} from "@jest/globals";
import createContext from "../../create-context";
import mod from "../mod";

const testAssertion = async (a: number, b: number, result: number) => {
    // https://youtrack.jetbrains.com/issue/WEB-36766
    // noinspection TypeScriptValidateTypes
    expect(await mod.evaluate({ context: createContext({}), args: [a, b] })).toEqual(result);
};

describe('mod tests', () => {
    it('should return the remainder between two numbers', async () => {
        await testAssertion(4, 2, 0);
        await testAssertion(49, 28, 21);
    });
});