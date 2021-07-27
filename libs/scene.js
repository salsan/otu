const fs = require('fs');
const AdmZip = require('adm-zip');
const path = require('path');
const items = require('./items.js');
const openType = require('opentype.js');
const {
  exec
} = require('child_process');

/**
 * @description add scene to theme
 * @param {string} fsource - source file
 * @param {string} fdest	- destination file
 * @param {string} sceneName - name of scene archive want add
 * @param {Object} options - Options
 */

function add(fsource, fdest, sceneArchive, options) {

  fs.readFile(fsource, 'utf8', (err, data) => {
    const zip = new AdmZip(sceneArchive);
    const scene = JSON.parse(zip.getEntry('scene.json').getData().toString("utf8"));
    const theme = JSON.parse(data);
    const currentDir = path.dirname(fdest);
    const fontDir = process.env.LOCALAPPDATA + '\\Microsoft\\Windows\\Fonts\\';

    theme.scene_order.push({
      "name": theme.name
    });

    if (scene.hasOwnProperty('groups')) {
      if (theme.hasOwnProperty('groups')) {
        theme.groups.push(...scene.groups);
      } else {
        theme.groups = scene.groups;
      }
    }

    scene.sources.forEach(src => {

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

      theme.sources.push(src);
    });

    fdest = fdest || theme.name;
    fs.writeFile(fdest + '.json', JSON.stringify(theme), function(err) {
      if (err) return console.log(err);
      console.log('Completed!!! ==> ' + fdest + '.json');
      return;
    });

  });
}

/**
 * @description extract scene from theme
 * @param {string} fsource - source file
 * @param {string} fdest	- destination file
 * @param {string} sceneName - name of scene want extract
 * @param {Object} options - Options
 */
function extract(fsource, fdest, sceneName, options) {

  fs.readFile(fsource, 'utf8', (err, data) => {
    const theme = JSON.parse(data);
    const scene = {};
    const itemsRequired = new Set();
    const zip = new AdmZip();

    scene.sources = theme['sources'].filter(item => item.name === sceneName);

    if (scene.sources.length > 0) {
      scene.name = sceneName;
      if (scene.sources[0].settings.items !== undefined) {
        const itemsList = Array.from(itemsRequired.add(items.listRequire(theme, scene.sources[0].settings.items.map(item => item.name)))).flat();

        itemsList.forEach(itemName => {
          let sceneCurr = theme['sources'].filter(itemCurr => itemCurr.name === itemName);
          if (sceneCurr.length > 0) {
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
              zip.addLocalFile(sceneCurr[0].settings.file, 'files/', path.win32.basename(sceneCurr[0].settings.file));
            };

            if ((typeof(sceneCurr[0].settings.custom_font) !== 'undefined') && fs.existsSync(sceneCurr[0].settings.custom_font)) {
              zip.addLocalFile(sceneCurr[0].settings.custom_font, 'files/', path.win32.basename(sceneCurr[0].settings.custom_font));
            };

            if ((typeof(sceneCurr[0].settings.local_file) !== 'undefined') && fs.existsSync(sceneCurr[0].settings.local_file)) {
              zip.addLocalFile(sceneCurr[0].settings.local_file, 'files/', path.win32.basename(sceneCurr[0].settings.local_file));
            };

            scene.sources.push(...sceneCurr);

          } else {
            if (theme.hasOwnProperty('groups')) {
              if (scene.hasOwnProperty('groups')) {
                scene.groups.push(theme['groups'].filter(item => (item.name === itemName))[0]);
              } else {
                scene.groups = (theme['groups'].filter(item => (item.name === itemName)));
              }
            }
          }
        });


      }

      fdest = fdest || scene.name;
      zip.addFile("scene.json", Buffer.from(JSON.stringify(scene), "utf8"));
      zip.writeZip(fdest + ".otu");
      console.log('Completed!!! ' + fdest + '.otu');


    } else console.log('"' + sceneName + '" is not present, please use showInfo command for see list of scene available, more info --help');
  });

}

module.exports = {
    add: add,
    extract: extract
}
