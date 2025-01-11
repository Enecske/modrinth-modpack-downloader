const axios = require('axios');
const semver = require('semver');
const fs = require('fs');
const path = require('path');

const { targetVersion, slugs } = require('./data.json');

if (!fs.existsSync(path.join(__dirname, 'files'))) fs.mkdirSync(path.join(__dirname, 'files'));
fs.readdirSync(path.join(__dirname, 'files')).forEach(file => {
    fs.unlinkSync(path.join(__dirname, 'files', file));
});

const errors = [];
const warnings = [];

const download = async (slug) => {
    try {
        const data = await axios.get(`https://api.modrinth.com/v2/project/${slug}/version`);

        let eligibleVersions = data.data.filter(version =>
            version.game_versions.includes(targetVersion) &&
            version.version_type === 'release' &&
            version.loaders.includes('fabric'));
        if (eligibleVersions.length === 0) {
            eligibleVersions = data.data.filter(version =>
                version.game_versions.includes(targetVersion) &&
                version.loaders.includes('fabric'));
        }
        if (eligibleVersions.length === 0) {
            const error = new Error('No eligible versions found!');

            let allVersions = [];
            data.data.forEach(version => version.game_versions.forEach(ver => {
                if (ver.split('.').length === 2) ver += '.0';
                if (!allVersions.includes(ver) && semver.valid(ver) !== null) allVersions.push(ver);
            }));
            allVersions = allVersions.sort((a, b) => semver.rcompare(a, b));
            error.versions = allVersions;

            throw error;
        }

        eligibleVersions.sort((a, b) => new Date(b.date_published) - new Date(a.date_published));

        const latestVersion = eligibleVersions[0];
        if (latestVersion.version_type !== 'release')
            warnings.push({ slug, warning: `No stable release found, using ${latestVersion.version_type} instead!` });
        const primaryFile = latestVersion.files.find(file => file.primary);

        const file = await axios.get(primaryFile.url, { responseType: 'stream' });
        fs.promises.writeFile(path.join(__dirname, 'files', primaryFile.filename), file.data);

        console.log('\x1b[32m%s\x1b[0m', `Downloaded ${slug} for ${targetVersion} (${primaryFile.filename})`);
    } catch (error) {
        if (error instanceof axios.AxiosError && error.status === 404) {
            error.message = 'Mod not found!';
        }
        console.error(`Error downloading ${slug}: ${error.message}`);
        errors.push({ slug, error });
    }
};

(async () => {
    const packSize = 10;

    for (let i = 0; i < Math.ceil(slugs.length / packSize); i++) {
        await Promise.all(slugs.slice(i * packSize, i * packSize + packSize).map(download));
    }

    if (warnings.length > 0) {
        console.log('\x1b[33m%s\x1b[0m', `Warnings:`);
        warnings.forEach(({ slug, warning }) => {
            console.log(` - \x1b[33m${slug}: ${warning}\x1b[0m`);
        });
    }

    if (errors.length > 0) {
        console.log('\x1b[31m%s\x1b[0m', `Failed to fetch ${errors.length} mods!\nNo eligible versions found:`);
        errors.filter(object => object.error.message == 'No eligible versions found!').forEach(({ slug, error }) => {
            console.log(` - \x1b[31m${slug}\x1b[0m${" ".repeat(40 - slug.length)}Avaiable for ${error.versions[0]}${' '.repeat(15)}https://modrinth.com/mod/${slug}/versions`);
        });
        console.log('\x1b[31m%s\x1b[0m', 'Mods not found:');
        errors.filter(object => object.error.message == 'Mod not found!').forEach(({ slug, error }) => {
            console.log(` - \x1b[31m${slug}\x1b[0m`);
        });
        console.log('\x1b[31m%s\x1b[0m', 'Other errors:');
        errors.filter(object => object.error.message != 'No eligible versions found!' && object.error.message != 'Mod not found!').forEach(({ slug, error }) => {
            console.log(` - \x1b[31m${slug}: ${error.message}\x1b[0m`);
        });

    } else {
        console.log('\x1b[32m%s\x1b[0m', 'All files fetched successfully!');
    }
})();