import ExpressionContext from "./types/expression-context";
import ExpressionError from "./expression-error";

const isBoolean = require("lodash/isBoolean");

const getField = <T>(field: string, context: ExpressionContext<T>): any => {
    if (field === '$') {
        return context.object;
    }
    if (field.startsWith('$')) {
        field = field.slice(1);
    }
    return context.pathEvaluator.evaluate(context.object, field);
};

const parseNumber = <T>(funcKey: string, token: string, context: ExpressionContext<T>) => {
    const numericValue = Number(token);
    if (!Number.isNaN(numericValue) && !isBoolean(token)) {
        return numericValue;
    } else {
        const value = getField(token, context);
        const numericValue = Number(value);
        if (Number.isNaN(numericValue) || isBoolean(value)) {
            throw new ExpressionError(`${funcKey}() received non-numeric value in ${context.expression}`);
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

const unwrapValue = (value: string, startTag: string, endTag: string): string => {
    return value.slice(startTag.length, value.length - endTag.length);
};

const unwrapString = (value: any): string => {
    if (typeof value === 'string' && isWrapped(value, '"', '"')) {
        return unwrapValue(value, '"', '"').replace(/\\"/g, '"');
    }
    return value;
};

const requireString = <T>(context: ExpressionContext<T>, funcKey: string, ...values: any[]): void => {
    for (const value of values) {
        if (typeof value !== 'string') {
            throw new ExpressionError(`${funcKey}() received non-string argument in expression: ${context.expression}`);
        }
    }
};

const consoleColors = {
    red: '\x1b[31m',
    green: '\x1b[32m',
    blue: '\x1b[34m',
    reset: '\x1b[0m'
};

const debug = <T>(text: string, context: ExpressionContext<T>) => {
    if (context.debug) {
        let output = '';
        const { nestLevel = 0 } = context;
        for (let i = 0; i < nestLevel; i++) {
            output += '. ';
        }
        output += text;
        console.log(output);
    }
};

export {
    consoleColors,
    debug,
    getField,
    isWrapped,
    parseNumber,
    requireString,
    unwrapValue,
    unwrapString
};