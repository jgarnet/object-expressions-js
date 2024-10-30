import ExpressionContext from "./types/expression-context";

const isBoolean = require("lodash/isBoolean");

const getField = <T>(context: ExpressionContext<T>, field: string): any => {
    if (field.startsWith('$.')) {
        field = field.slice(2);
    }
    return context.pathEvaluator.evaluate(context.object, field);
};

const parseNumber = <T>(funcKey: string, token: string, context: ExpressionContext<T>) => {
    const numericValue = Number(token);
    if (!Number.isNaN(numericValue) && !isBoolean(token)) {
        return numericValue;
    } else {
        const value = getField(context, token);
        const numericValue = Number(value);
        if (Number.isNaN(numericValue) || isBoolean(value)) {
            throw new Error(`SyntaxError: ${funcKey}() received non-numeric value in ${context.expression}`);
        }
        return numericValue;
    }
};

const isWrapped = (value: string, startTag: string, endTag: string): boolean => {
    return (
        // value starts with start tag
        value.slice(0, startTag.length) === startTag &&
        // value ends with end tag
        value.slice(value.length - endTag.length, value.length) === endTag
    );
};

const unwrapString = (value: string, startTag: string, endTag: string): string => {
    return isWrapped(value, startTag, endTag) ? value.slice(startTag.length, value.length - endTag.length) : value;
};

export {
    getField,
    isWrapped,
    parseNumber,
    unwrapString
};