import typescript from '@rollup/plugin-typescript';
import babel from '@rollup/plugin-babel';
import terser from '@rollup/plugin-terser';
export default {
    input: 'src/index.ts',
    plugins: [
        typescript(),
        babel({
            babelrc: false,
            presets: [['@babel/preset-env', { modules: false, loose: true }]],
            plugins: [['@babel/plugin-proposal-class-properties', { loose: true }]],
            exclude: ['node_modules/**'],
        }),
        terser(),

    ],
    output: [
        {
            dir: 'dist',
            format: 'esm',
            entryFileNames: '[name].js',
        },
    ]
};