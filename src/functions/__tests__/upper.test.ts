import {describe, expect, it} from "@jest/globals";
import createContext from "../../create-context";
import ExpressionError from "../../expression-error";
import upper from "../upper";

const testError = (arg: any, error: ExpressionError) => {
    // noinspection TypeScriptValidateTypes
    expect(() => upper.evaluate(createContext({}), arg)).toThrowError(error);
};

describe('upper tests', () => {
    it('should return the length of a string', () => {
        // https://youtrack.jetbrains.com/issue/WEB-36766
        // noinspection TypeScriptValidateTypes
        expect(upper.evaluate(createContext({}), 'Test')).toEqual('TEST');
        // noinspection TypeScriptValidateTypes
        expect(upper.evaluate(createContext({}), '"Test"')).toEqual('TEST');
        // noinspection TypeScriptValidateTypes
        expect(upper.evaluate(createContext({}), '"\"Test\""')).toEqual('"TEST"');
    });
    it('should throw ExpressionError when invalid arguments are received', () => {
        testError([], new ExpressionError('UPPER() received non-string argument in expression: undefined'));
        testError({}, new ExpressionError('UPPER() received non-string argument in expression: undefined'));
        testError(null, new ExpressionError('UPPER() received non-string argument in expression: undefined'));
        testError(undefined, new ExpressionError('UPPER() received non-string argument in expression: undefined'));
        testError(20, new ExpressionError('UPPER() received non-string argument in expression: undefined'));
        testError(true, new ExpressionError('UPPER() received non-string argument in expression: undefined'));
    });
});