#!/usr/bin/env node

"use strict";

const fs = require('fs');
const yargs = require('yargs/yargs');
const {
  hideBin
} = require('yargs/helpers');
const info = require('./libs/info.js');
const scene = require('./libs/scene.js');
const theme = require('./libs/theme.js');

yargs(hideBin(process.argv))
  .scriptName("otu-tool")
  .usage('Usage: $0 <command> [options]')
  .command('import [input] [output]', 'import theme obs', {
      input: {
        description: 'insert path of theme want import',
        alias: 'i',
        demandOption: true,
        type: 'string',
        requiresArg: true
      },
      output: {
        description: 'insert path where save',
        alias: 'o',
        type: 'string',
        requiresArg: true,
        default: ''
      }
    },
    (argv) => {
      if (fs.existsSync(argv.input)) {
        theme._import(argv.input, argv.output, argv)
      } else {
        console.log(argv.input + "file doesn't exist")
        return false;
      }
    }
  )
  .command('export [input] [output]', 'export your themes with files', {
      input: {
        description: 'insert path of theme want export',
        alias: 'i',
        demandOption: true,
        type: 'string',
        requiresArg: true,
      },
      output: {
        description: 'insert path where save',
        alias: 'o',
        type: 'string',
        requiresArg: true
      }
    },
    (argv) => {
      if (fs.existsSync(argv.input)) {
        theme._export(argv.input, argv.output, argv);
      } else {
        console.log(argv.input + "file doesn't exist")
        return false;
      }
    }
  ).command('extract [scene] [input] [output]', 'extract scene from theme', {
      input: {
        description: 'insert path of theme want extract a scene',
        alias: 'i',
        demandOption: true,
        type: 'string',
        requiresArg: true,
      },
      output: {
        description: 'insert path where save',
        alias: 'o',
        type: 'string',
        requiresArg: true
      },
      scene: {
        description: 'name scene want extract',
        alias: 's',
        type: 'string',
        requiresArg: true
      }
    },
    (argv) => {
      if (fs.existsSync(argv.input)) {
        scene.extract(argv.input, argv.output, argv.scene, argv);
      } else {
        console.log(argv.input + "file doesn't exist")
        return false;
      }
    })
  .command('add [scene] [input] [output]', 'add scene to theme', {
      input: {
        description: 'insert path of theme want to add scene',
        alias: 'i',
        demandOption: true,
        type: 'string',
        requiresArg: true,
      },
      output: {
        description: 'insert path where save new theme',
        alias: 'o',
        type: 'string',
        demandOption: true,
        requiresArg: true
      },
      scene: {
        description: 'insert path of scene want add',
        alias: 's',
        type: 'string',
        requiresArg: true
      }
    },
    (argv) => {
      if (fs.existsSync(argv.input)) {
        scene.add(argv.input, argv.output, argv.scene, argv);
      } else {
        console.log(argv.input + "file doesn't exist")
        return false;
      }
    })
  .command('show [input] [Options]', 'show info about theme', {
      scenes: {
        description: 'show list of scene present',
        type: 'boolean',
        default: false
      },
      input: {
        description: 'insert path of theme want show info',
        alias: 'i',
        demandOption: true,
        type: 'string',
        requiresArg: true,
      }
    },
    (argv) => {
      if (fs.existsSync(argv.input)) {
        info(argv.input, argv);
      } else {
        console.log(argv.input + "file doesn't exist")
        return false;
      }
    })
  .help()
  .alias('help', 'h')
  .alias('version', 'v')
  .argv;
