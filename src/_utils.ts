import ExpressionContext from "./types/expression-context";
import ExpressionError from "./expression-error";
import {DateTime} from "luxon";

const isArray = require("lodash/isArray");
const isBoolean = require("lodash/isBoolean");
const isSet = require("lodash/isSet");

const luxon = require("luxon");
const Settings = luxon.Settings;
Settings.throwOnInvalid = true;

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
    consoleColors,
    debug,
    extractSettings,
    getField,
    isCollection,
    isNumber,
    isWrapped,
    parseDate,
    parseNumber,
    parseSetting,
    requireArray,
    requireCollection,
    requireString,
    unwrapValue,
    unwrapString
};