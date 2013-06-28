#!/bin/bash

# Fix modules

cd node_modules/mega/
npm rm request
npm install request@2.10.0
cd ../../
bash build.sh