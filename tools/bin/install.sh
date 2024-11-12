#!/bin/bash

HOST=$1
SYSTEM_NAME=$(./build.sh -XappName | grep "Application Name" | sed -E 's/(.*):{1}(.*)/\2/' | tr -d '[:blank:]')
VERSION=$(./build.sh -Xversions | grep "Application Version" | sed -E 's/(.*):{1}(.*)/\2/' | tr -d '[:blank:]')
TARBALL_NAME=${SYSTEM_NAME}-deploy-${VERSION}.tar.gz
TMP_PATH=/tmp/deploy
rm -rf ${TMP_PATH}
mkdir -p ${TMP_PATH}
cp build/package/${TARBALL_NAME} ${TMP_PATH}/
TARBALL=${TMP_PATH}/${TARBALL_NAME}

echo Installing $SYSTEM_NAME-$VERSION to $HOST
ssh -o ConnectTimeout=5 $HOST 'touch /tmp/OFFLINE; sleep 5; sudo systemctl stop '${SYSTEM_NAME}'; rm /tmp/OFFLINE'
foam3/tools/bin/install_remote.sh -W$HOST -T${TARBALL} -S${SYSTEM_NAME} -V${VERSION}
