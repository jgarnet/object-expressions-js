import ExpressionFunction from "../types/expression-function";
import {requireCollection} from "../utils";
import FunctionContext from "../types/function-context";

const _size = require("lodash/size");

const size: ExpressionFunction = {
    async evaluate<T>(ctx: FunctionContext<T>): Promise<any> {
        const { args, context } = ctx;
        requireCollection(context, 'SIZE', args[0]);
        let value = args[0];
        return _size(value);
    }
};

export default size;