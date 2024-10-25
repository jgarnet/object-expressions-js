import ExpressionContext from "../types/expression-context";

const get = require("lodash/get");
const isBoolean = require("lodash/isBoolean");

const getValue = <T>(funcKey: string, token: string, context: ExpressionContext<T>) => {
    const numericValue = Number(token);
    if (!Number.isNaN(numericValue) && !isBoolean(token)) {
        return numericValue;
    } else {
        const value = get(context.object, token);
        const numericValue = Number(value);
        if (Number.isNaN(numericValue) || isBoolean(value)) {
            throw new Error(`SyntaxError: ${funcKey}() received non-numeric value in ${context.expression}`);
        }
        return numericValue;
    }
};

export { getValue };