import ExpressionFunction from "../types/expression-function";
import ExpressionContext from "../types/expression-context";
import {comparePrimitives, isCollection} from "../_utils";

const max: ExpressionFunction = {
    async evaluate<T>(context: ExpressionContext<T>, ...args: any[]): Promise<any> {
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