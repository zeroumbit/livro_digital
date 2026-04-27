const fs = require('fs');
const f = 'src/components/forms/MariaDaPenhaForm.tsx';
let c = fs.readFileSync(f, 'utf8');
c = c.replace(/\\`/g, '`').replace(/\\\$\{/g, '${');
fs.writeFileSync(f, c);
