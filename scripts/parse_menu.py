import subprocess
import os

with open('/tmp/empathy_js.js') as f:
    js = f.read()

start_du = js.find('Du={')
end_du = js.find('},Ou=[', start_du) + 1
du_str = js[start_du + 3:end_du]

start_ou = js.find('Ou=[')
end_ou = js.find('],W=', start_ou) + 1
ou_str = js[start_ou + 3:end_ou]

start_ku = js.find('ku=[')
depth = 0
end_ku = -1
for i in range(start_ku + 3, len(js)):
    if js[i] == '[':
        depth += 1
    elif js[i] == ']':
        depth -= 1
        if depth == 0:
            end_ku = i + 1
            break

ku_str = js[start_ku + 3:end_ku]

node_code = f"""
const fs = require('fs');
let W = "/images/placeholder_empathy_coffee_1791136879221.jpg";
let Du = {du_str};
let Ou = {ou_str};
let ku = {ku_str};

fs.mkdirSync('data', {{ recursive: true }});
fs.writeFileSync('data/menu.json', JSON.stringify({{
    settings: Du,
    categories: Ou,
    products: ku
}}, null, 2));

console.log('SUCCESS: Products:', ku.length, 'Categories:', Ou.length);
"""

with open('/tmp/runner.cjs', 'w') as f:
    f.write(node_code)

res = subprocess.run(['node', '/tmp/runner.cjs'], capture_output=True, text=True)
print(res.stdout)
if res.stderr:
    print('ERROR:', res.stderr)
