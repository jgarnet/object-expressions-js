import ExpressionFunction from "../types/expression-function";
import ExpressionContext from "../types/expression-context";
import {DateTime, DateTimeUnit} from "luxon";
import ExpressionError from "../expression-error";
import {extractSettings, parseSetting} from "../_utils";

const dateCompare: ExpressionFunction = {
    async evaluate<T>(context: ExpressionContext<T>, ...args: any[]): Promise<any> {
        if (args.length < 2) {
            throw new ExpressionError(`DATECOMP() requires two dates for comparison; invalid arguments received in expression: ${context.expression}`);
        }
        const settings = extractSettings(context, 'DATECOMP', ...args.slice(2));
        const format = parseSetting(context, settings, 'format');
        const formatA = parseSetting(context, settings, 'formatA') ?? format;
        const formatB = parseSetting(context, settings, 'formatB') ?? format;
        const zone = parseSetting(context, settings, 'timezone') ?? 'UTC';
        const zoneA = parseSetting(context, settings, 'timezoneA') ?? zone;
        const zoneB = parseSetting(context, settings, 'timezoneB') ?? zone;
        const operator = parseSetting(context, settings, 'operator') ?? '=';
        const unit = parseSetting(context, settings, 'unit') ?? 'day';
        const a = parse(context, args[0], zoneA, formatA);
        const b = parse(context, args[1], zoneB, formatB);
        return compare(a, b, operator, unit, zoneA, context);
    }
};

const parse = <T> (context: ExpressionContext<T>, date: any, zone: string, format?: string): DateTime => {
    try {
        if (date instanceof Date) {
            return DateTime.fromJSDate(date, { zone });
        }
        if (date instanceof DateTime) {
            return date.setZone(zone);
        }
        if (typeof date === 'string' && /^NOW([+-]?\d+([a-zA-Z]))*$/.test(date)) {
            const now = DateTime.now().setZone(zone);
            const intervalStr = date.slice(3);
            const interval = intervalStr.split(/[+-]\d+/);
            const unit = intervalStr.split(/[a-zA-Z]/);
            if (interval.length == 2 && unit.length == 2) {
                switch (interval[1]) {
                    case 'Y':
                        return now.plus({ years: Number(unit[0]) });
                    case 'M':
                        return now.plus({ months: Number(unit[0]) });
                    case 'D':
                        return now.plus({ days: Number(unit[0]) });
                    case 'H':
                        return now.plus({ hours: Number(unit[0]) });
                    case 'm':
                        return now.plus({ minutes: Number(unit[0]) });
                    default:
                        throw new ExpressionError(`DATECOMP() received invalid interval ${date} in expression: ${context.expression}`);
                }
            }
            return now;
        }
        return format ? DateTime.fromFormat(date, format, { zone }) : DateTime.fromISO(date, { zone });
    } catch (error) {
        if (error instanceof ExpressionError) {
            throw error;
        }
        const expressionError = new ExpressionError(`DATECOMP() failed to parse date ${date} in expression: ${context.expression}`);
        expressionError.cause = error as Error;
        throw expressionError;
    }
};

const compare = <T> (a: DateTime, b: DateTime, operator: string, unit: string, zoneA: string, context: ExpressionContext<T>): boolean => {
    try {
        switch (operator) {
            case '>':
                return a.startOf(unit as DateTimeUnit) > b.startOf(unit as DateTimeUnit);
            case '<':
                return a.startOf(unit as DateTimeUnit) < b.startOf(unit as DateTimeUnit);
            case '>=':
                return a.startOf(unit as DateTimeUnit) >= b.startOf(unit as DateTimeUnit);
            case '<=':
                return a.startOf(unit as DateTimeUnit) <= b.startOf(unit as DateTimeUnit);
            case '=':
                return a.hasSame(b.setZone(zoneA), unit as DateTimeUnit);
            default:
                throw new ExpressionError(`DATECOMP() received invalid operator ${operator} in expression: ${context.expression}`);
        }
    } catch (error) {
        if (error instanceof ExpressionError) {
            throw error;
        }
        const expressionError = new ExpressionError(`DATECOMP() failed to compare date ${a.toISO()} to ${b.toISO()} in expression: ${context.expression}`);
        expressionError.cause = error as Error;
        throw expressionError;
    }
};

export default dateCompare;