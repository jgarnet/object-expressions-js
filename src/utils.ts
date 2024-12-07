import ExpressionContext from "./types/expression-context";
import ExpressionError from "./expression-error";
import {DateTime} from "luxon";

const isArray = require("lodash/isArray");
const isSet = require("lodash/isSet");

const luxon = require("luxon");
const Settings = luxon.Settings;
Settings.throwOnInvalid = true;

const NUMBER_REGEX = /^-?\.?\d+(\.\d+)?$/;

/**
 * Compares equality of two values.
 * Returns 1 if a > b, 0 if a = b, -1 if a < b.
 * If a and b cannot be compared, -2 is returned.
 * @param a The first value.
 * @param b The second value.
 * @param context The {@link ExpressionContext}.
 */
const comparePrimitives = <T> (a: any, b: any, context: ExpressionContext<T>): number => {
    a = unwrapString(a);
    b = unwrapString(b);
    if (isNumber(a)) {
        a = convertToNumber(a);
    }
    if (isNumber(b)) {
        b = convertToNumber(b);
    }
    if (typeof a === 'number' && typeof b === 'number') {
        if (a > b) {
            return 1;
        } else if (a < b) {
            return -1;
        }
        return 0;
    }
    if (typeof a === 'string' && typeof b === 'string') {
        const result = unwrapString(a).localeCompare(unwrapString(b));
        if (result > 0) {
            return 1;
        } else if (result < 0) {
            return -1;
        }
        return 0;
    }
    return -2;
};

/**
 * Retrieves a field from the {@link ExpressionContext} or a supplied Object given a path.
 * @param field The field path.
 * @param context The {@link ExpressionContext}.
 * @param object Optional Object to retrieve the field from.
 */
const getField = <T>(field: string, context: ExpressionContext<T>, object?: any): any => {
    if (field === '$') {
        return object ?? context.object;
    }
    if (field.startsWith('$')) {
        field = field.slice(1);
    }
    return context.pathEvaluator.evaluate(object ?? context.object, field);
};

/**
 * Converts a string to its number value, if applicable.
 * If the value is a number, it will be returned as-is.
 * @param val The value.
 */
const convertToNumber = (val: string | number): number => {
    if (typeof val === 'string') {
        return Number(val.replace(/,/g, ''));
    }
    return val;
};

/**
 * Determines if a value is a number.
 * Valid values include integers, decimals, positive, negative, and numbers with comma separators.
 * @param value The value being tested.
 */
const isNumber = (value: any): boolean => {
    if (typeof value === 'number') {
        return true;
    }
    if (typeof value === 'string') {
        return NUMBER_REGEX.test(value.replace(/,/g, ''));
    }
    return false;
};

/**
 * Determines if a string value is wrapped within a start and end tag.
 * @param value The value being tested.
 * @param startTag The start tag to check.
 * @param endTag The end tag to check.
 */
const isWrapped = (value: any, startTag: string, endTag: string): boolean => {
    return (
        typeof value === 'string' &&
        // value starts with start tag
        value.slice(0, startTag.length) === startTag &&
        // value ends with end tag
        value.slice(value.length - endTag.length, value.length) === endTag
    );
};

/**
 * Unwraps a string given a start tag and end tag.
 * @param value The string being unwrapped.
 * @param startTag The start tag wrapping the string.
 * @param endTag The end tag wrapping the string.
 */
const unwrapValue = (value: string, startTag: string, endTag: string): string => {
    return value.slice(startTag.length, value.length - endTag.length);
};

/**
 * If the value is a string and is wrapped in quotes, it will be unwrapped.
 * Escaped quotes within the string will also have all backslashes removed.
 * If the value is not a wrapped string, it will be returned as-is.
 * @param value The value.
 */
const unwrapString = (value: any): string => {
    if (typeof value === 'string') {
        if (isWrapped(value, '"', '"')) {
            return unwrapValue(value, '"', '"').replace(/\\"/g, '"');
        } else if (isWrapped(value, '\'', '\'')) {
            return unwrapValue(value, '\'', '\'').replace(/\\'/g, '\'');
        }
    }
    return value;
};

/**
 * Requires all values to be strings.
 * @param context The {@link ExpressionContext}.
 * @param funcKey The function key which is being invoked.
 * @param values The values being tested.
 */
const requireString = <T>(context: ExpressionContext<T>, funcKey: string, ...values: any[]): void => {
    for (const value of values) {
        if (typeof value !== 'string') {
            throw new ExpressionError(`${funcKey}() received non-string argument in expression: ${context.expression}`);
        }
    }
};

/**
 * Requires all values to be numbers.
 * @param context The {@link ExpressionContext}.
 * @param funcKey The function key which is being invoked.
 * @param values The values being tested.
 */
const requireNumber = <T>(context: ExpressionContext<T>, funcKey: string, ...values: any[]): void => {
    for (const value of values) {
        if (!isNumber(value)) {
            throw new ExpressionError(`${funcKey}() received non-numeric argument in expression: ${context.expression}`);
        }
    }
};

const CONSOLE_COLORS = {
    red: '\x1b[31m',
    green: '\x1b[32m',
    blue: '\x1b[34m',
    reset: '\x1b[0m'
};

/**
 * Prints debug output if debug mode is enabled.
 * @param text The text being printed.
 * @param context The {@link ExpressionContext}.
 */
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

/**
 * Determines if a value is a collection (array or set).
 * @param value The value being tested.
 */
const isCollection = (value: any): boolean => {
    return isArray(value) || isSet(value);
};

/**
 * Requires all values to be collections.
 * @param context The {@link ExpressionContext}.
 * @param funcKey The function key which is being invoked.
 * @param values The values being tested.
 */
const requireCollection = <T>(context: ExpressionContext<T>, funcKey: string, ...values: any[]): void => {
    for (const value of values) {
        if (!isCollection(value)) {
            throw new ExpressionError(`${funcKey}() received non-collection argument in expression: ${context.expression}`);
        }
    }
};

/**
 * Requires all values to be arrays.
 * @param context The {@link ExpressionContext}.
 * @param funcKey The function key which is being invoked.
 * @param values The values being tested.
 */
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
const extractSettings = <T> (context: ExpressionContext<T>, funcKey: string, ...args: any[]): Map<string, any> => {
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

/**
 * Parses and returns the value of a setting from a function's arguments.
 * Allows fields to be extracted and unwraps string values.
 * @param context The {@link ExpressionContext}.
 * @param settings The function settings Map.
 * @param key The key of the target setting.
 * @param object Optional object which fields can be extracted from.
 */
const parseSetting = <T> (context: ExpressionContext<T>, settings: Map<string, any>, key: string, object?: any): any => {
    let value = settings.get(key);
    if (typeof value === 'string' && value.startsWith('$')) {
        value = getField(value, context, object);
    }
    return unwrapString(value);
};

/**
 * Parses a date value with support for timezone and format string.
 * @param context The {@link ExpressionContext}.
 * @param funcKey The key of the function parsing the date.
 * @param date The date value, which may include a JS Date, Luxon DateTime, Object, or String.
 * @param opts Optional options which may specify timezone or format string to be used during parsing.
 */
const parseDate = <T> (context: ExpressionContext<T>, funcKey: string, date: any, opts?: { zone?: string, format?: string }): DateTime => {
    const zone = opts?.zone;
    const format = opts?.format;
    try {
        if (date instanceof Date) {
            return DateTime.fromJSDate(date, { zone });
        }
        if (date instanceof DateTime) {
            return date.setZone(zone);
        }
        if (typeof date === 'object') {
            return DateTime.fromObject(date, { zone });
        }
        if (typeof date === 'string') {
            if (/^NOW([+-]?\d+([a-zA-Z]))*$/.test(date)) {
                const now = DateTime.now().setZone(zone);
                const intervalStr = date.slice(3);
                if (intervalStr.length > 0) {
                    return applyDateInterval(now, funcKey, intervalStr);
                }
                return now;
            }
            return format ? DateTime.fromFormat(date, format, { zone }) : DateTime.fromISO(date, { zone });
        }
        if (isNumber(date)) {
            return DateTime.fromMillis(date, { zone });
        }
        throw new ExpressionError(`${funcKey}() received an unsupported Date value in expression: ${context.expression}`);
    } catch (error) {
        if (error instanceof ExpressionError) {
            throw error;
        }
        const expressionError = new ExpressionError(`${funcKey}() failed to parse date ${date} in expression: ${context.expression}`);
        expressionError.cause = error as Error;
        throw expressionError;
    }
};

/**
 * Applies an interval to a DateTime instance.
 * @param date The DateTime instance.
 * @param funcKey The function this operation is being performed in.
 * @param intervalStr The interval being applied to the date.
 */
const applyDateInterval = (date: DateTime, funcKey: string, intervalStr: string): DateTime => {
    const interval = intervalStr.split(/[+-]\d+/);
    const unit = intervalStr.split(/[a-zA-Z]/);
    if (interval.length == 2 && unit.length == 2) {
        switch (interval[1]) {
            case 'Y':
                return date.plus({ years: Number(unit[0]) });
            case 'M':
                return date.plus({ months: Number(unit[0]) });
            case 'D':
                return date.plus({ days: Number(unit[0]) });
            case 'H':
                return date.plus({ hours: Number(unit[0]) });
            case 'm':
                return date.plus({ minutes: Number(unit[0]) });
        }
    }
    throw new ExpressionError(`${funcKey}() received invalid interval ${intervalStr}`);
};

export {
    applyDateInterval,
    comparePrimitives,
    CONSOLE_COLORS,
    convertToNumber,
    debug,
    extractSettings,
    getField,
    isCollection,
    isNumber,
    isWrapped,
    NUMBER_REGEX,
    parseDate,
    parseSetting,
    requireArray,
    requireCollection,
    requireString,
    requireNumber,
    unwrapValue,
    unwrapString
};