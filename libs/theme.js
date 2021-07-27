const AdmZip = require('adm-zip');
const fs = require('fs');
const path = require('path');
const openType = require('opentype.js');
const {
  exec
} = require('child_process');


/**
 * @description importTheme return compatible scene version from original and extract files
 * @param {string} fsource - source file
 * @param {string} fdest	- destination file
 * @param {Object} options - Options
 */

function _import(fsource, fdest, options) {

  const zip = new AdmZip(fsource);
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
 * @param {string} fdest	- destination save AdmZip
 * @param {Object} options - Options
 */

function _export(fsource, fdest, options) {

  const zip = new AdmZip();

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
        zip.addLocalFile(src.settings.file, 'files/', path.win32.basename(src.settings.file));
      };

      if ((typeof(src.settings.custom_font) !== 'undefined') && fs.existsSync(src.settings.custom_font)) {
        zip.addLocalFile(src.settings.custom_font, 'files/', path.win32.basename(src.settings.custom_font));
      };

      if ((typeof(src.settings.local_file) !== 'undefined') && fs.existsSync(src.settings.local_file)) {
        zip.addLocalFile(src.settings.local_file, 'files/', path.win32.basename(src.settings.local_file));
      };

    });

    fdest = fdest || theme["name"];
    zip.addFile("theme.json", Buffer.from(JSON.stringify(theme), "utf8"));
    zip.writeZip(fdest + ".otu");
    console.log('Completed!!! ' + fdest + '.otu');

  });

}


module.exports = {
  _import: _import,
  _export: _export
}
