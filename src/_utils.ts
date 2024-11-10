import ExpressionContext from "./types/expression-context";
import ExpressionError from "./expression-error";

const isArray = require("lodash/isArray");
const isBoolean = require("lodash/isBoolean");
const isSet = require("lodash/isSet");

const getField = <T>(field: string, context: ExpressionContext<T>, object?: any): any => {
    if (field === '$') {
        return object ?? context.object;
    }
    if (field.startsWith('$')) {
        field = field.slice(1);
    }
    return context.pathEvaluator.evaluate(object ?? context.object, field);
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

const isNumber = (value: any): boolean => {
    if (typeof value === 'object') {
        return false;
    }
    const numericValue = Number(value);
    return !Number.isNaN(numericValue) && !isBoolean(value);
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

const isCollection = (value: any): boolean => {
    return isArray(value) || isSet(value);
};

const requireCollection = <T>(context: ExpressionContext<T>, funcKey: string, ...values: any[]): void => {
    for (const value of values) {
        if (!isCollection(value)) {
            throw new ExpressionError(`${funcKey}() received non-collection argument in expression: ${context.expression}`);
        }
    }
};

const requireArray = <T>(context: ExpressionContext<T>, funcKey: string, ...values: any[]): void => {
    for (const value of values) {
        if (!isArray(value)) {
            throw new ExpressionError(`${funcKey}() received non-array argument in expression: ${context.expression}`);
        }
    }
};

/**
 * Allows function parameters to be defined using syntax FUNC(arg0=val0,arg1=val1,...)
 * So that arguments can be optional and defined in any order.
 * @param context The {@link ExpressionContext}.
 * @param funcKey The function arguments are being extracted for.
 * @param args The arguments passed to the function.
 */
const extractArgs = <T> (context: ExpressionContext<T>, funcKey: string, ...args: any[]): Map<string, any> => {
    const map = new Map<string, any>();
    for (const arg of args) {
        if (typeof arg === 'string' && /^[a-zA-Z_0-9]+=.+$/.test(arg)) {
            const splitIndex = arg.indexOf('=');
            const key = arg.slice(0, splitIndex).trim();
            if (map.has(key)) {
                throw new ExpressionError(`${funcKey}() received duplicate argument ${key} in expression: ${context.expression}`);
            }
            const value = arg.slice(splitIndex + 1).trim();
            map.set(key, value);
        }
    }
    return map;
};

export {
    consoleColors,
    debug,
    extractArgs,
    getField,
    isCollection,
    isNumber,
    isWrapped,
    parseNumber,
    requireArray,
    requireCollection,
    requireString,
    unwrapValue,
    unwrapString
};