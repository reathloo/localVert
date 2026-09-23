#!/bin/zsh
set -eu

project_dir=${0:A:h}
open -a Firefox 'about:debugging#/runtime/this-firefox'
open -R "$project_dir/manifest.json"

print 'Firefox: Auf „Temporäres Add-on laden“ klicken und die im Finder markierte manifest.json auswählen.'
print 'Danach auf das Erweiterungssymbol klicken. Der Konverter öffnet in einem kleinen Fenster ohne Tab.'
