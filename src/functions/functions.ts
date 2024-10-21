import ExpressionFunction from "../types/expression-function";
import len from "./len";

const functions = new Map<string, ExpressionFunction>;
functions.set("LEN", len);

export default functions;