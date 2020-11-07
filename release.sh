#!/bin/bash

LAST_TAG=`git describe --tags --match 'v*' --abbrev=0`

git pull || exit

if [ "$1" != "dist" -a -n "$1" ]; then
	TAG="$1"
	if [ -z "`grep -E '^## '"$TAG"'$' README.md`" ]; then
		echo "Please update README.md:"
		echo "## $TAG"
		echo "#### New features:"
		echo "#### Fixes:"
		../../../utils/git-log-since-tag.sh $LAST_TAG | awk '{print "- " $0}'
		exit 1
	fi
	
	awk '/^## v[0-9.]*$/ { first++ } { if (first == 1) {print }}' README.md
	read -p "Commit and release? (y/N) " ANSWER
	if [ "$ANSWER" != "y" ]; then
		exit 2
	fi
	
	sed -i 's/"version": ".*",/"version": "'"$TAG"'",/' package.json 
	echo "Releasing $TAG"
else
	echo "Usage:"
	echo "  $0        Compile the code"
	echo "  $0 dist   Compile the code and push dist but don't release with a tag"
	echo "  $0 <tag>  Compile the code and release with a tag"
	echo
	echo "Last released version was $LAST_TAG"
	echo "Building test version"
fi

grunt

if [ "$1" == "dist" ]; then
	git add app/css/main.css.orig app/info.json package.json dist/ &&
	git commit -m "dist" &&
	git push &&
	git push
fi

if [ -n "$TAG" ]; then
	git add README.md app/css/main.css.orig app/info.json package.json dist/ &&
	git commit -m "dist" && git tag "$TAG" &&
	git push && git push --tags &&
	git checkout master && git merge dev && git push && git checkout dev # merge with master
fi
