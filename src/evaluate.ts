import ExpressionContext from "./types/expression-context";
import createContext from "./create-context";

const evaluate = <T> (context: Partial<ExpressionContext<T>>): boolean => {
    const ctx = createContext(context);
    return ctx.expressionEvaluator.evaluate(ctx);
};

export default evaluate;