#!/bin/bash

##########################################
# Check that all files commited versions #
##########################################
#git diff-index --quiet HEAD -- || exit "Uncommitted changes found! please commit + push all changes before publishing"

###################
# Verify versions #
###################

# Verify against repository
json=node_modules/json/lib/json.js
packageName=$($json "name" < package.json)
current_version=$($json "version" < package.json)
repository_version=$(git show HEAD:package.json | $json version)
if [[ "$repository_version" != "$current_version" ]]; then
   echo "Conflict between versions: echo current_version=$current_version, echo repository_version=$repository_version"
   echo "Please verify what you doing"
   exit 1
fi

##################
# Update version #
##################
new_version=$(echo $current_version | perl -ne '@p=split(/\./); $p[-1]++; print join(".",@p)')
echo new_version=$new_version
$json -I -f package.json -e this.version=\"$new_version\"


###################
# Verify versions #
###################

# Verify against NPM registry
test -z "$(npm info ${packageName}@${new_version})"
if [[ ! $? -eq 0 ]]
then
    exit "$packageName@$new_version is already published in npm registry"
fi


###################
# Commit changes  #
###################
git commit package.json -m "Updating package version to $new_version"

###################
# Push changes  #
###################
git push origin master