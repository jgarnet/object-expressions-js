import ExpressionContext from "../types/expression-context";

const get = require("lodash/get");
const isBoolean = require("lodash/isBoolean");

const getField = <T>(object: T, field: string): any => {
    if (field.startsWith('$.')) {
        field = field.slice(2);
    }
    return get(object, field);
};

const parseNumber = <T>(funcKey: string, token: string, context: ExpressionContext<T>) => {
    const numericValue = Number(token);
    if (!Number.isNaN(numericValue) && !isBoolean(token)) {
        return numericValue;
    } else {
        const value = getField(context.object, token);
        const numericValue = Number(value);
        if (Number.isNaN(numericValue) || isBoolean(value)) {
            throw new Error(`SyntaxError: ${funcKey}() received non-numeric value in ${context.expression}`);
        }
        return numericValue;
    }
};

export {
    getField,
    parseNumber
};