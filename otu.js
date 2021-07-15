#!/usr/bin/env node

"use strict";

const fs = require('fs');
const path = require('path');
const Archive = require('adm-zip');
const yargs = require('yargs/yargs');
const {
  hideBin
} = require('yargs/helpers');
const openType = require('opentype.js');
const {
  exec
} = require('child_process');

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
        importTheme(argv.input, argv.output, argv)
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
        exportTheme(argv.input, argv.output, argv);
      } else {
        console.log(argv.input + "file doesn't exist")
        return false;
      }
    }
  ).command('extract [input] [output]', 'extract scene from theme', {
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
        extractScene(argv.input, argv.output, argv.scene, argv);
      } else {
        console.log(argv.input + "file doesn't exist")
        return false;
      }
    })
  .help()
  .alias('help', 'h')
  .alias('version', 'v')
  .argv;

/**
 * @description checkItemsRequired check all items required from scene
 * @param {Object} theme - full source of original theme
 * @param {Object} source	- items required from scene
 */
function checkItemsRequired(theme, source) {

  const itemsRequired = [];

  source.forEach(name => {
    itemsRequired.push(name);

    let sceneCurr = theme["sources"].filter(scene => scene.name == name)[0];

    if (sceneCurr.settings.items !== undefined) {
      const items = sceneCurr.settings.items.map(item => item.name);
      itemsRequired.push(checkItemsRequired(theme, items));
    }

  });

  return itemsRequired.flat();

}

/**
 * @description extractScene extract scene from theme
 * @param {string} fsource - source file
 * @param {string} fdest	- destination file
 * @param {string} sceneName - name of scene want extract
 * @param {Object} options - Options
 */
function extractScene(fsource, fdest, sceneName, options) {

  fs.readFile(fsource, 'utf8', (err, data) => {
    const theme = JSON.parse(data);
    const scene = {};
    const itemsRequired = new Set();
    const zip = new Archive();


    scene.sources = theme['sources'].filter(item => item.name === sceneName);

    if (scene.sources.length > 0) {
      scene.name = sceneName;
      if (scene.sources[0].settings.items !== undefined) {
        const itemsList = Array.from(itemsRequired.add(checkItemsRequired(theme, scene.sources[0].settings.items.map(item => item.name)))).flat();

        itemsList.forEach(itemName => {
          let sceneCurr = theme['sources'].filter(itemCurr => itemCurr.name === itemName);
          if (sceneCurr[0].settings.file !== undefined) console.log(sceneCurr[0].settings.file);

          if (typeof(sceneCurr[0].settings.files) !== 'undefined') {
            sceneCurr[0].settings.files.forEach(item => {
              if (fs.existsSync(item.value)) {
                if (fs.statSync(item.value).isFile()) {
                  zip.addLocalFile(item.value, 'files/', path.win32.basename(item.value));
                } else {
                  zip.addFile('files/' + path.win32.basename(item.value) + '/', Buffer.alloc(0), "", fs.statSync(item.value));
                  zip.addLocalFolder(item.value, 'files/' + path.win32.basename(item.value) + '/');
                }
              }
            })
          };

          if ((typeof(sceneCurr[0].settings.file) !== 'undefined') && fs.existsSync(sceneCurr[0].settings.file)) {
            zip.addLocalFile(sceneCurr[0].settings.file, 'files/', path.win32.basename(sceneCurr[0].settings.file))
          };

          if ((typeof(sceneCurr[0].settings.custom_font) !== 'undefined') && fs.existsSync(sceneCurr[0].settings.custom_font)) {
            zip.addLocalFile(sceneCurr[0].settings.custom_font, 'files/', path.win32.basename(sceneCurr[0].settings.custom_font))
          };

          if ((typeof(sceneCurr[0].settings.local_file) !== 'undefined') && fs.existsSync(sceneCurr[0].settings.local_file)) {
            zip.addLocalFile(sceneCurr[0].settings.local_file, 'files/', path.win32.basename(sceneCurr[0].settings.local_file))
          };

          scene.sources.push(...sceneCurr);
        });


      }

      zip.addFile("scene.json", Buffer.from(JSON.stringify(scene), "utf8"));
      zip.writeZip(fdest + ".otu");

    } else console.log(sceneName + " is not present");
  });

}

/**
 * @description importTheme return compatible scene version from original and extract files
 * @param {string} fsource - source file
 * @param {string} fdest	- destination file
 * @param {Object} options - Options
 */

function importTheme(fsource, fdest, options) {

  const zip = new Archive(fsource);
  const scene = zip.getEntry('theme.json');
  const theme = JSON.parse(scene.getData().toString("utf8"));
  const currentDir = path.dirname(fdest);
  const fontDir = process.env.LOCALAPPDATA + '\\Microsoft\\Windows\\Fonts\\';

  theme["sources"].forEach(src => {

    if (typeof(src.settings.files) !== 'undefined') {
      src.settings.files.forEach((item, index) => {
        if ((fs.statSync(item.value).isFile()) && (zip.getEntry('files/' + path.win32.basename((item.value))))) {
          zip.extractEntryTo("files/" + path.win32.basename(item.value), currentDir, true, true);
        } else zip.extractEntryTo("files/" + path.win32.basename(item.value) + "/", currentDir, true, true);

        src.settings.files[index].value = path.resolve(currentDir, 'files', path.win32.basename(src.settings.files[index].value));
      })
    }

    if ((typeof(src.settings.file) !== 'undefined') && (zip.getEntry('files/' + path.win32.basename(src.settings.file)))) {
      console.log(src.settings.file);

      src.settings.file = path.resolve(currentDir, 'files', path.win32.basename(src.settings.file));
      zip.extractEntryTo('files/' + path.win32.basename(src.settings.file), currentDir, true, true);
    }

    if ((typeof(src.settings.custom_font) !== 'undefined') && (zip.getEntry('files/' + path.win32.basename(src.settings.custom_font)))) {
      let fontPath = fontDir + path.win32.basename(src.settings.custom_font);
      src.settings.custom_font = fontPath;

      if (!fs.existsSync(fontPath)) {
        zip.extractEntryTo('files/' + path.win32.basename(src.settings.custom_font), fontDir, false, false);

        let font = openType.loadSync(fontPath);
        let fontFamilyName = font["tables"]["name"]["fontFamily"]["en"] + ' (TrueType)';
        let strReg = 'reg add "HKCU\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion\\Fonts" /v ' + '"' + fontFamilyName + '"' + ' /t REG_SZ /d ' + '"' + fontPath + '"' + ' /f';

        const result = exec(strReg, (error, stdout, stderr) => {

          if (error) {
            console.error(`error: ${error.message}`);
            return;
          }

          if (stderr) {
            console.error(`stderr: ${stderr}`);
            return;
          }

          console.log(`stdout:\n${stdout}`);
        })
      } else console.log("File exist : " + fontPath);


    }

    if (typeof(src.settings.local_file) !== 'undefined') {
      src.settings.local_file = path.resolve(currentDir, 'files', path.win32.basename(src.settings.local_file));
      zip.extractEntryTo("files/" + path.win32.basename(src.settings.local_file), currentDir, true, true);
    }
  });


  fdest = fdest || theme["name"];

  fs.writeFile(fdest + '.json', JSON.stringify(theme), function(err) {
    if (err) return console.log(err);
    console.log('Completed!!! ' + fdest + '.json');
    return;
  });
}


/**
 * @description exportTheme export in an archive obs scene with files
 * @param {string} fsource - json source file of scene
 * @param {string} fdest	- destination save archive
 * @param {Object} options - Options
 */

function exportTheme(fsource, fdest, options) {

  const zip = new Archive();

  fs.readFile(fsource, 'utf8', (err, data) => {
    const theme = JSON.parse(data);

    theme["sources"].forEach(src => {

      if (typeof(src.settings.files) !== 'undefined') {
        src.settings.files.forEach(item => {
          if (fs.existsSync(item.value)) {
            if (fs.statSync(item.value).isFile()) {
              zip.addLocalFile(item.value, 'files/', path.win32.basename(item.value));
            } else {
              zip.addFile('files/' + path.win32.basename(item.value) + '/', Buffer.alloc(0), "", fs.statSync(item.value));
              zip.addLocalFolder(item.value, 'files/' + path.win32.basename(item.value) + '/');
            }
          }
        })
      };

      if ((typeof(src.settings.file) !== 'undefined') && fs.existsSync(src.settings.file)) {
        zip.addLocalFile(src.settings.file, 'files/', path.win32.basename(src.settings.file))
      };

      if ((typeof(src.settings.custom_font) !== 'undefined') && fs.existsSync(src.settings.custom_font)) {
        zip.addLocalFile(src.settings.custom_font, 'files/', path.win32.basename(src.settings.custom_font))
      };

      if ((typeof(src.settings.local_file) !== 'undefined') && fs.existsSync(src.settings.local_file)) {
        zip.addLocalFile(src.settings.local_file, 'files/', path.win32.basename(src.settings.local_file))
      };

    });

    zip.addFile("theme.json", Buffer.from(JSON.stringify(theme), "utf8"));
    zip.writeZip(fdest + ".otu");
    console.log('Completed!!! ' + fdest + '.otu');

  });

}
