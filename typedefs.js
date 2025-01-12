const fs = require("fs");
const path = require("path");

// const __dirname = path.dirname(new URL(import.meta.url).pathname);

const schemaPath = path.join(__dirname, 'schema.graphqls');
const typeDefs = fs.readFileSync(schemaPath, 'utf-8');

module.exports = typeDefs;