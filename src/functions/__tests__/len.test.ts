import {describe, expect, it} from "@jest/globals";
import createContext from "../../create-context";
import len from "../len";
import ExpressionError from "../../expression-error";

const testError = async (arg: any, error: ExpressionError) => {
    // noinspection TypeScriptValidateTypes
    await expect(() => len.evaluate(createContext({}), arg)).rejects.toThrowError(error);
};

describe('len tests', () => {
    it('should return the length of a string', async () => {
        // https://youtrack.jetbrains.com/issue/WEB-36766
        // noinspection TypeScriptValidateTypes
        expect(await len.evaluate(createContext({}), 'Test')).toEqual(4);
        // noinspection TypeScriptValidateTypes
        expect(await len.evaluate(createContext({}), '"Test"')).toEqual(4);
        // noinspection TypeScriptValidateTypes
        expect(await len.evaluate(createContext({}), '"\"Test\""')).toEqual(6);
    });
    it('should throw ExpressionError when invalid arguments are received', () => {
        testError([], new ExpressionError('LEN() received non-string argument in expression: undefined'));
        testError({}, new ExpressionError('LEN() received non-string argument in expression: undefined'));
        testError(null, new ExpressionError('LEN() received non-string argument in expression: undefined'));
        testError(undefined, new ExpressionError('LEN() received non-string argument in expression: undefined'));
    });
});