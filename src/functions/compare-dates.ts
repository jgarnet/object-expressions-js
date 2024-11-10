import ExpressionFunction from "../types/expression-function";
import ExpressionContext from "../types/expression-context";
import {DateTime, DateTimeUnit} from "luxon";
import ExpressionError from "../expression-error";
import {extractSettings} from "../_utils";

const compareDates: ExpressionFunction = {
    async evaluate<T>(context: ExpressionContext<T>, ...args: any[]): Promise<any> {
        if (args.length < 2) {
            throw new ExpressionError(`COMP_DT() requires two dates for comparison; invalid arguments received in expression: ${context.expression}`);
        }
        const settings = extractSettings(context, 'COMP_DT', ...args.slice(2));
        const format = settings.get('format');
        const zone = settings.get('timezone') ?? 'UTC';
        const operator = settings.get('operator') ?? '=';
        const unit = settings.get('unit') ?? 'day';
        const a = format ? DateTime.fromFormat(args[0], format, { zone }) : DateTime.fromISO(args[0], { zone });
        const b = format ? DateTime.fromFormat(args[1], format, { zone }) : DateTime.fromISO(args[1], { zone });
        return compare(a, b, operator, unit, context);
    }
};

const compare = <T> (a: DateTime, b: DateTime, operator: string, unit: string, context: ExpressionContext<T>): boolean => {
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
            return a.hasSame(b, unit as DateTimeUnit);
        default:
            throw new ExpressionError(`COMP_DT() received invalid operator ${operator} in expression: ${context.expression}`);
    }
};

export default compareDates;