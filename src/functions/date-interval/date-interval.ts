import ExpressionFunction from "../expression-function";
import ExpressionError from "../../errors/expression-error";
import {applyDateInterval, extractSettings, parseDate, parseSetting, unwrapString} from "../../utils";
import FunctionContext from "../../context/function-context";

const dateInterval: ExpressionFunction = {
    async evaluate<T>(ctx: FunctionContext<T>): Promise<any> {
        const { args, context } = ctx;
        if (args.length < 2) {
            throw new ExpressionError(`DATEIVL() requires a date and an interval; invalid arguments received in expression: ${context.expression}`);
        }
        const settings = extractSettings(context, 'DATEIVL', ...args.slice(2));
        const format = parseSetting(context, settings, 'format');
        const zone = parseSetting(context, settings, 'timezone') ?? 'UTC';
        const date = parseDate(context, 'DATEIVL', unwrapString(args[0]), { zone, format });
        const interval = unwrapString(args[1]);
        return applyDateInterval(date, 'DATEIVL', interval);
    }
};

export default dateInterval;