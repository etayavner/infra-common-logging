#!/bin/bash

# check that the version in the package.json is different from the previous version, and update it if they are the same

# this can be used as a self-correcting pre-commit check

json=node_modules/json/lib/json.js
current_version=$($json "version" < package.json)
echo current_version=$current_version
repository_version=$(git show HEAD:package.json | $json version)
echo repository_version=$repository_version
if [[ "$repository_version" != "$current_version" ]]; then
   exit 0
fi
new_version=$(echo $current_version | perl -ne '@p=split(/\./); $p[-1]++; print join(".",@p)')
echo new_version=$new_version
$json -I -f package.json -e this.version=\"$new_version\"

git commit package.json -m "Updating package version to $new_version"

git push origin master