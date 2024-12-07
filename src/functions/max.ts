import ExpressionFunction from "../types/expression-function";
import {comparePrimitives, isCollection} from "../utils";
import FunctionContext from "../types/function-context";

const max: ExpressionFunction = {
    async evaluate<T>(ctx: FunctionContext<T>): Promise<any> {
        const { args, context } = ctx;
        const allItems = [];
        for (const arg of args) {
            if (isCollection(arg)) {
                allItems.push(...arg);
            } else {
                allItems.push(arg);
            }
        }
        let max = null;
        for (const item of allItems) {
            if (max === null || comparePrimitives(item, max, context) === 1) {
                max = item;
            }
        }
        return max;
    }
};

export default max;