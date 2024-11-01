import {describe, expect, it} from "@jest/globals";
import createContext from "../../create-context";
import len from "../len";

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
});