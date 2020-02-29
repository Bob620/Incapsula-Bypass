//Add bad config detection
const fs = require('fs').promises;
const path = require('path');

function randomFolder(folders) {
    return folders[Math.floor(Math.random() * folders.length)];
}

async function configReader(customConfig) {
    if (customConfig && customConfig.includes('..'))
        throw 'Potential security hazard, this entire thing is so iffy...';

    const directory = path.join(__dirname, 'configs');
    const folders = await fs.readdir(directory);
    const configFolder = customConfig ? customConfig : randomFolder(folders);
    let file = path.join(directory, configFolder, 'jsoverrider.json');

    const config = (await fs.readFile(file)).toString().replace(/^/, 'exports =');
    return {config: eval(config), folder: configFolder}
}

module.exports = configReader;