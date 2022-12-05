const path = require('path');
const express = require('express');
const app = express();

const dir = path.resolve(__dirname, './');

app.use(express.static(dir));
app.listen(3000, () => console.log(`Serving ${ dir } on port 3000`));
