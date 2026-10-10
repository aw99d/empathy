import fs from 'fs';

const jsContent = fs.readFileSync('/tmp/empathy_js.js', 'utf8');

const duMatch = jsContent.match(/Du=\{name:[^}]+}/);

// Find Ou=[...
const ouIndex = jsContent.indexOf('Ou=[');
let bracketDepth = 0;
let ouEnd = -1;
for (let i = ouIndex + 3; i < jsContent.length; i++) {
  if (jsContent[i] === '[') bracketDepth++;
  else if (jsContent[i] === ']') {
    if (bracketDepth === 0) {
      ouEnd = i + 1;
      break;
    }
    bracketDepth--;
  }
}
const ouCode = jsContent.slice(ouIndex, ouEnd);

// Find ku=[...
const kuIndex = jsContent.indexOf('ku=[');
bracketDepth = 0;
let kuEnd = -1;
for (let i = kuIndex + 3; i < jsContent.length; i++) {
  if (jsContent[i] === '[') bracketDepth++;
  else if (jsContent[i] === ']') {
    if (bracketDepth === 0) {
      kuEnd = i + 1;
      break;
    }
    bracketDepth--;
  }
}
const kuCode = jsContent.slice(kuIndex, kuEnd);

const evalScript = `
var Du, Ou, ku, output;
${duMatch[0]};
${ouCode};
var W = "/images/placeholder_empathy_coffee_1791136879221.jpg";
${kuCode};
output = { settings: Du, categories: Ou, products: ku };
`;

let output;
eval(evalScript);

fs.mkdirSync('data', { recursive: true });
fs.writeFileSync('data/menu.json', JSON.stringify(output, null, 2), 'utf8');
console.log('Successfully saved data/menu.json with', output.products.length, 'products and', output.categories.length, 'categories');
