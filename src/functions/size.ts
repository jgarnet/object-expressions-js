import ExpressionFunction from "../types/expression-function";
import ExpressionContext from "../types/expression-context";
import {requireCollection} from "../_utils";

const _size = require("lodash/size");

const size: ExpressionFunction = {
    async evaluate<T>(context: ExpressionContext<T>, ...args: any[]): Promise<any> {
        requireCollection(context, 'SIZE', args[0]);
        let value = args[0];
        return _size(value);
    }
};

export default size;