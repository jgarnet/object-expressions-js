import ExpressionFunction from "../types/expression-function";
import len from "./len";
import add from "./add";
import subtract from "./subtract";
import multiply from "./multiply";
import divide from "./divide";
import size from "./size";
import pow from "./pow";
import upper from "./upper";
import lower from "./lower";
import filter from "./filter";

const functions = new Map<string, ExpressionFunction>;

functions.set("ADD", add);
functions.set("DIVIDE", divide);
functions.set("FILTER", filter);
functions.set("LEN", len);
functions.set("LOWER", lower);
functions.set("MULTIPLY", multiply);
functions.set("POW", pow);
functions.set("SIZE", size);
functions.set("SUBTRACT", subtract);
functions.set("UPPER", upper);

export default functions;