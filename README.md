# Modrinth Modpack Downloader

This is a small command-line tool that can download multiple mods at once from [Modrinth](https://modrint.com).

## Limitations

This tool cannot download mods that are not hosted on Modrinth.
The tool does not automatically download dependencies for mods. You will have to manually add the slugs of the dependencies for mods.
You may need administrative privileges to run the tool on specific system.

## Installation

1. Modrinth Modpack Downloader runs on NodeJS. Make sure you have NodeJS installed on your system.

2. Clone this repository locally or download the repository as a zip file and extract it.

3. Run `npm install` in the root directory of the repository.

## Usage

### Configuration

Create a `data.json` file in the root directory of the repository. This file will contain the list of mods you want to download. The format of the file is as follows:

```json
{
    "targetVersion": "The Minecraft version you want to download mods for, e.g. 1.16.5",
    "slugs": [
        "The slugs of the mods you want to download"
        "e.g.",
        "fabric-api",
        "mod1",
        "mod2"
    ]
}
```

You can find an example `data.json` file in the repository.

#### Finding the slug of a mod

The slug of a mod is the last part of the URL of the mod on Modrinth. For example, the slug of the mod  [Fabric API (https://modrinth.com/mod/fabric-api)](https://modrinth.com/mod/fabric-api) is `fabric-api`.

### Running the tool

Run `npm start` in the root directory of the repository. The tool will download the mods to the `files` directory in the root directory of the repository. The previous contents of the `files` directory will be deleted.

You'll also get an error log in the command line if any of the mods fail to download. This also contains warnings if no stable `release` version is found for a mod.
The tool will continue to download the rest of the mods.

You can copy the mods from the `files` directory to your mods folder in your Minecraft instance.
