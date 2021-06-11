// eslint-disable no-console
// Based on similar script in React
// https://github.com/facebook/react/blob/b87aabdfe1b7461e7331abb3601d9e6bb27544bc/scripts/prettier/index.js

// supported modes = check, check-changed, write, write-changed

import { sync } from 'glob-gitignore';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import yargs from 'yargs';
import pkg from 'prettier';

const { resolveConfig, format, check } = pkg;

function runPrettier(options) {
    const { changedFiles, shouldWrite } = options;

    let didWarn = false;
    let didError = false;

    const warnedFiles = [];
    const ignoredFiles = readFileSync(join(process.cwd(), '.eslintignore'), 'utf-8')
        .split(/\r*\n/)
        .filter((notEmpty) => notEmpty);

    const files = sync('**/*.{js,md,tsx,ts,json}', {
        ignore: [
            '**/node_modules/**',
            // these are auto-generated
            'docs/pages/api-docs/**/*.md',
            ...ignoredFiles,
        ],
    }).filter((f) => !changedFiles || changedFiles.has(f));

    if (!files.length) {
        return;
    }

    const prettierConfigPath = join(process.cwd(), '.prettierrc.json');

    files.forEach((file) => {
        const prettierOptions = resolveConfig.sync(file, {
            config: prettierConfigPath,
        });

        try {
            const input = readFileSync(file, 'utf8');
            if (shouldWrite) {
                console.log(`Formatting ${file}`);
                const output = format(input, { ...prettierOptions, filepath: file });
                if (output !== input) {
                    writeFileSync(file, output, 'utf8');
                }
            } else {
                console.log(`Checking ${file}`);
                if (!check(input, { ...prettierOptions, filepath: file })) {
                    warnedFiles.push(file);
                    didWarn = true;
                }
            }
        } catch (error) {
            didError = true;
            console.log(`\n\n${error.message}`);
            console.log(file);
        }
    });

    if (didWarn) {
        console.log(
            '\n\nThis project uses prettier to format all JavaScript code.\n' +
                `Please run '${!changedFiles ? 'yarn prettier:all' : 'yarn prettier'}'` +
                ' and commit the changes to the files listed below:\n\n',
        );
        console.log(warnedFiles.join('\n'));
    }

    if (didWarn || didError) {
        throw new Error('Triggered at least one error or warning');
    }
}

async function run(argv) {
    const { mode, branch } = argv;
    const shouldWrite = mode === 'write' || mode === 'write-changed';

    runPrettier({ shouldWrite, branch });
}

yargs()
    .command({
        command: '$0 [mode]',
        description: 'formats codebase',
        builder: (command) =>
            command
                .positional('mode', {
                    description: '"write" | "check-changed" | "write-changed"',
                    type: 'string',
                    default: 'write-changed',
                })
                .option('branch', {
                    default: 'next',
                    describe: 'The branch to diff against',
                    type: 'string',
                }),
        handler: run,
    })
    .help()
    .strict(true)
    .version(false)
    .parse();
