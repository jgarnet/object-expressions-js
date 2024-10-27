import ExpressionFunction from "../types/expression-function";
import len from "./len";
import add from "./add";
import subtract from "./subtract";
import multiply from "./multiply";
import divide from "./divide";

const functions = new Map<string, ExpressionFunction>;
functions.set("LEN", len);
functions.set("ADD", add);
functions.set("SUBTRACT", subtract);
functions.set("MULTIPLY", multiply);
functions.set("DIVIDE", divide);

export default functions;