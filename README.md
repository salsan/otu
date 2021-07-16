# otu
**otu** ( OBS themes utility ) is  [Node.js](https://nodejs.org) script, an handle tool for work with your scenes of Open Broadcaster Software

# Description
otu is an utility to permit to export/import your theme with all files in an archive, add and extract scene from theme, and many features are added in the future

# Installation
```bash
npm i otu-tool
```
# Features
* Export OBS theme scene
* Import OBS theme scene
* Add single scene on OBS theme
* Extract single scene from OBS theme

# Usage

### Export
Create a zip archive (.otu) from scene.json with all files present on scenes

```bash
otu-tool export -i mytheme.json -o mythemearchive.otu
```
### Import
Extract files from zip archive (.otu) and create scene.json for OBS

```bash
otu-tool import -i mythemearchive.otu -o mytheme.json
```

### Add
Add a single scene to your theme
```bash
otu-tool add  -i mytheme.json  --scene myscenearchive.otu -o mynewtheme.json
```

### Extract
Extract single scene from theme
```bash
otu-tool extract  -i mytheme.json  --scene "NameOfScene"  -o myscenearchive.otu
```


# Supported Broadcaster Sofware
* [OBS Studio](https://obsproject.com/)

# Download
* [Last Release](https://github.com/salsan/otu/releases)

# Todo
- [ ] Check fonts ~~and install it if is required~~
- [x] ~~Extract/Add single scene of your theme with relative files~~
- [ ] Convert [Streamlabs OBS](https://streamlabs.com/streamlabs-obs-live-streaming-software) scenes to [OBS Broadcaster Software](https://obsproject.com/)

# License

Copyright 2021 Salvatore Santagati (<me@salsan.dev>)

This program is free software; you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation; either version 3 of the License, or
(at your option) any later version.
