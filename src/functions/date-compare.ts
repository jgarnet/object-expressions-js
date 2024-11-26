import ExpressionFunction from "../types/expression-function";
import ExpressionContext from "../types/expression-context";
import {DateTime, DateTimeUnit} from "luxon";
import ExpressionError from "../expression-error";
import {extractSettings, parseDate, parseSetting, unwrapString} from "../utils";

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
        const a = parseDate(context, 'DATECOMP', unwrapString(args[0]), { zone: zoneA, format: formatA });
        const b = parseDate(context, 'DATECOMP', unwrapString(args[1]), { zone: zoneB, format: formatB });
        return compare(a, b, operator, unit, zoneA, context);
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