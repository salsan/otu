const fs = require('fs');
const path = require('path');
const Archive = require('adm-zip');
const yargs = require('yargs/yargs')
const {
  hideBin
} = require('yargs/helpers')

yargs(hideBin(process.argv))
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
  )
  .help()
  .alias('help', 'h')
  .alias('version', 'v')
  .argv;

/**
 * @description importTheme return compatible scene version from original and extract files
 * @param {string} fsource - source file
 * @param {string} fdest	- destination file
 * @param {Object} options - Options
 */

function importTheme(fsource, fdest, options) {

  const zip = new Archive(fsource);
  const zipEntries = zip.getEntries();
  const scene = zipEntries.filter(zipEntry => zipEntry.entryName == 'theme.json');
  const theme = JSON.parse(scene[0].getData().toString("utf8"));
  const currentDir = path.dirname(fdest)

  theme["sources"].forEach(src => {

    if (typeof(src.settings.file) !== 'undefined') {

      src.settings.file = path.resolve(currentDir, 'files', path.win32.basename(src.settings.file));
      zip.extractEntryTo("files/" + path.win32.basename(src.settings.file), currentDir, true, true);
    }

    if (typeof(src.settings.custom_font) !== 'undefined') {

      src.settings.custom_font = path.resolve(currentDir, 'files', path.win32.basename(src.settings.custom_font));
      zip.extractEntryTo("files/" + path.win32.basename(src.settings.custom_font), currentDir, true, true);
    }

    if (typeof(src.settings.local_file) !== 'undefined') {
      src.settings.local_file = path.resolve(currentDir, 'files', path.win32.basename(src.settings.local_file));
      zip.extractEntryTo("files/" + path.win32.basename(src.settings.local_file), currentDir, true, true);
    }
  });


  fdest = fdest || theme["name"] + ".json";

  fs.writeFile(fdest, JSON.stringify(theme), function(err) {
    if (err) return console.log(err);
    console.log('Completed!!!');
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

  });

}
