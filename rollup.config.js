import resolve from 'rollup-plugin-node-resolve';
import typescript from 'rollup-plugin-typescript2';

export default {
    input: 'components/index.ts',
    context: 'window',
    output: {
        file: 'dist/visualization-components-bundle.js',
        format: 'umd',
        sourcemap: true,
        name: "arnd"
    },
    plugins: [
        typescript(),
        resolve({
            jsnext: true,
            main: true,
            module: true
        })
    ],
    moduleName: 'arnd'
};
