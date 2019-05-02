#!/bin/bash

# check that the version in the package.json is different from the previous version, and update it if they are the same

# this can be used as a self-correcting pre-commit check

dir=$(dirname $0)
json=$dir/../../node_modules/json/lib/json.js
current_version=$($json "version" < package.json)
previous_version=$(git show HEAD:package.json | $json version)
if [[ "$previous_version" != "$current_version" ]]; then
   exit 1
fi
new_version=$(echo $current_version | perl -ne '@p=split(/\./); $p[-1]++; print join(".",@p)')
echo new_version=$new_version
$json -I -f package.json -e this.version=\"$new_version\"
exit 0