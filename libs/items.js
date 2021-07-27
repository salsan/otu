/**
 * @description check all items required from scene
 * @param {Object} theme - full source of original theme
 * @param {Object} source	- items required from scene
 */
function listRequire(theme, source) {

  const itemsRequire = [];

  source.forEach(name => {
  itemsRequire.push(name);

    let sceneCurr = theme["sources"].filter(scene => scene.name == name)[0];
    if (sceneCurr !== undefined) {
      if (sceneCurr.settings.items !== undefined) {
        const items = sceneCurr.settings.items.map(item => item.name);
        itemsRequire.push(listRequire(theme, items));
      }
    }
  });

  return itemsRequire.flat();

}


module.exports = {
  listRequire: listRequire
}
