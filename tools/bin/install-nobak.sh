#!/bin/bash
# Calls install_remote with backup false

APP_NAME=$(./build.sh -XappName | grep "Application Name" | sed -E 's/(.*):{1}(.*)/\2/' | tr -d '[:blank:]')
VERSION=$(./build.sh -Xversions | grep "Application Version" | sed -E 's/(.*):{1}(.*)/\2/' | tr -d '[:blank:]')
TARBALL_NAME=${APP_NAME}-deploy-${VERSION}.tar.gz
TMP_PATH=/tmp/deploy
rm -rf ${TMP_PATH}
mkdir -p ${TMP_PATH}
cp build/package/${TARBALL_NAME} ${TMP_PATH}/
TARBALL=${TMP_PATH}/${TARBALL_NAME}

exec 4<$1
while read -u4 m; do
    echo $m
    ssh -o ConnectTimeout=5 $m 'touch /tmp/OFFLINE; sleep 5; sudo systemctl stop foam; rm /tmp/OFFLINE'
    tools/bin/install_remote.sh -Bfalse -W$m -T${TARBALL} &
done
