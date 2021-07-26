const fs = require('fs');

/**
 * @description Show info about theme scene
 * @param {string} fsource - source file
 * @param {Object} options - Options
 */

module.exports = function showInfo(fsource, options) {
  fs.readFile(fsource, 'utf8', (err, data) => {
    const theme = JSON.parse(data);

    if (options.scenes) {
      theme.scene_order.forEach((scene, index) => {
        console.log(index + '\t-  "' + scene.name + '"');
        const itemsRequired = theme['sources'].filter(item => item.name === scene.name);
        if (itemsRequired[0].settings.items !== undefined) {
          itemsRequired[0].settings.items.forEach(res => {
            console.log('\t\t -"' + res.name + '"')
          });
        }
      })
    }
  })
}
