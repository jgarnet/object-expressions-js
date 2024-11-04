import evaluate from "./index";
import {consoleColors} from "./_utils";

const expression = process.argv[2];
const object = JSON.parse(process.argv[3]);

const { red, green, blue, reset } = consoleColors;

console.log('Evaluating expression: ' + blue + expression + reset);
evaluate({ expression, object, debug: true }).then(result => {
    console.log(reset + 'Result: ' + (result ? green : red) + result + reset)
});