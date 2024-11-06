import ExpressionFunction from "../types/expression-function";
import ExpressionContext from "../types/expression-context";
import ExpressionError from "../expression-error";
import {getField, isNumber, requireString} from "../_utils";

const isNil = require("lodash/isNil");

const get: ExpressionFunction = {
    async evaluate<T>(context: ExpressionContext<T>, ...args: any[]): Promise<any> {
        if (args.length < 2) {
            throw new ExpressionError(`GET() requires a collection and an object path; invalid arguments received in ${context.expression}`);
        }
        if (isNil(args[0])) {
            return null;
        }
        if (!isNumber(args[1])) {
            requireString(context, 'GET', args[1]);
        }
        return getField(`${args[1]}`, context, args[0]);
    }
};

export default get;