const Path = require('path');
const { rollup } = require('rollup');
const nodeResolve = require('rollup-plugin-node-resolve');
const rollupCJS = require('rollup-plugin-commonjs');
const { compile } = require('@zenparsing/skert');

function buildPlugin() {
  return {
    name: 'buildPlugin',
    transform(code, id) {
      try {
        let result = compile(code, {
          location: id,
          module: true,
          sourceMap: true,
        });

        return {
          code: result.output,
          map: result.sourceMap,
        };
      } catch (err) {
        throw new Error(`Error compiling ${ id }: ${ err.message } (${ err.line + 1 }:${ err.column + 1 })`);
      }
    },
    resolveId(id, from) {
      if (id === 'straylight') {
        return Path.resolve(__dirname, '../../node_modules/straylight/dist/straylight.js');
      }
    },
  };
}

async function main() {
  let bundle = await rollup({
    input: Path.resolve(__dirname, '../src/main.js'),
    plugins: [buildPlugin(), rollupCJS(), nodeResolve()],
  });

  await bundle.write({
    file: Path.resolve(__dirname, '../main.js'),
    format: 'iife',
    sourcemap: true,
  });
}

main();
