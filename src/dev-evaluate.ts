import evaluate from "./index";
import {CONSOLE_COLORS} from "./utils";

const expression = process.argv[2];
const object = JSON.parse(process.argv[3]);

const { red, green, blue, reset } = CONSOLE_COLORS;

console.log('Evaluating expression: ' + blue + expression + reset);
evaluate({ expression, object, debug: true }).then(result => {
    console.log(reset + 'Result: ' + (result ? green : red) + result + reset)
});