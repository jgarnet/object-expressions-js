import {describe, expect, it} from "@jest/globals";
import createContext from "../../create-context";
import len from "../len";
import ExpressionError from "../../expression-error";

const testError = (arg: any, error: ExpressionError) => {
    // noinspection TypeScriptValidateTypes
    expect(() => len.evaluate(createContext({}), arg)).toThrowError(error);
};

describe('len tests', () => {
    it('should return the length of a string', () => {
        // https://youtrack.jetbrains.com/issue/WEB-36766
        // noinspection TypeScriptValidateTypes
        expect(len.evaluate(createContext({}), 'Test')).toEqual(4);
        // noinspection TypeScriptValidateTypes
        expect(len.evaluate(createContext({}), '"Test"')).toEqual(4);
        // noinspection TypeScriptValidateTypes
        expect(len.evaluate(createContext({}), '"\"Test\""')).toEqual(6);
        // noinspection TypeScriptValidateTypes
        expect(len.evaluate(createContext({}), null)).toEqual(0);
        // noinspection TypeScriptValidateTypes
        expect(len.evaluate(createContext({}), undefined)).toEqual(0);
    });
    it('should throw ExpressionError when invalid arguments are received', () => {
        testError([], new ExpressionError('LEN() received non-string argument in expression: undefined'));
        testError({}, new ExpressionError('LEN() received non-string argument in expression: undefined'));
    });
});