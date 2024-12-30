import ExpressionFunction from "../../expression-function";
import ExpressionError from "../../../errors/expression-error";
import {getField, isNumber, requireString} from "../../../utils";
import FunctionContext from "../../context/function-context";

const isNil = require("lodash/isNil");

const get: ExpressionFunction = {
    async evaluate<T>(ctx: FunctionContext<T>): Promise<any> {
        const { args, context } = ctx;
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