# otu
**otu** ( OBS themes utility ) is  [Node.js](https://nodejs.org) script, an handle tool for work with your scenes of Open Broadcaster Software

# Description
otu is an utility to permit to export/import your theme with all files, and many features are added in the next release

# Installation
```bash
npm i otu-tool
```
# Features
* Export OBS theme scene
* Import OBS theme scene

# Usage
### Export
Create a zip archive (.otu) from scene.json with all files present on scenes

```bash
otu-tool export -i myscene.json -o myscenearchive.otu
```
### Import
Extract files from zip archive (.otu) and create scene.json for OBS
```bash
otu-tool import -i myscenearchive.otu -o myscene.json
```
# Supported Broadcaster Sofware
* [OBS Studio](https://obsproject.com/)

# Download
* [Last Release](https://github.com/salsan/otu/releases)

# Todo
- [ ] Check fonts ~~and install it if is required~~
- [ ] Extract/Add single scene of your theme with relative files
- [ ] Convert [Streamlabs OBS](https://streamlabs.com/streamlabs-obs-live-streaming-software) scenes to [OBS Broadcaster Software](https://obsproject.com/)

# License

Copyright 2021 Salvatore Santagati (<me@salsan.dev>)

This program is free software; you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation; either version 3 of the License, or
(at your option) any later version.
