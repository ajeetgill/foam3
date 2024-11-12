#!/bin/bash

FOAM_TARBALL=
FOAM_REMOTE_OUTPUT=/tmp
INSTALL_ONLY=0

RC_FILE=~/.config/foam/remoterc

REMOTE_USER=
REMOTE_URL=
SSH_KEY=
BACKUP=true
CLUSTER=false

function quit {
    echo "ERROR :: [${REMOTE_URL}] Install Failed"
    exit $1
}

function usage {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options are:"
    echo "  -B <true | false>  : backup"
    echo "  -c                   : enable clustering, CLUSTER=true"
    echo "  -C <true | false>  : clustering"
    echo "  -h                   : Print usage information."
    echo "  -i                    : Install only"
    echo "  -I <ssh-key>        : SSH Key to use to connect to remote server"
    echo "  -O <path>           : Remote Location to put tarball, default to /tmp"
    echo "  -R <filepath>       : remoterc file to load, default to ./config/foam/remoterc"
    echo "  -T <tarball>        : Name of tarball, looks in target/package"
    echo "  -U <user>           : Remote user to connect to"
    echo "  -W <web-address>    : Remote url to connect to"
    echo ""
}

while getopts "B:cC:hiI:O:R:T:U:W:" opt ; do
    case $opt in
        B) BACKUP=${OPTARG};;
        c) CLUSTER=true;;
        C) CLUSTER=${OPTARG};;
        h) usage; exit 0;;
        i) INSTALL_ONLY=1;;
        I) SSH_KEY=${OPTARG};;
        O) FOAM_REMOTE_OUTPUT=${OPTARG};;
        R) RC_FILE=$OPTARG;;
        T) FOAM_TARBALL_PATH=${OPTARG};;
        U) REMOTE_USER=${OPTARG};;
        W) REMOTE_URL=${OPTARG};;
        ?) usage; exit 0;;
   esac
done

if [ -f $RC_FILE ]; then
    echo "INFO :: [${REMOTE_URL}] Loading $RC_FILE"
    . $RC_FILE
fi

VERSION=$(grep version pom.js | cut -d\' -f 2);
echo "INFO :: [${REMOTE_URL}] APP VERSION: $VERSION"

if [ -z $FOAM_TARBALL_PATH ]; then
    FOAM_TARBALL_PATH=target/package/foam-deploy-${VERSION}.tar.gz
fi

FOAM_TARBALL=$(basename $FOAM_TARBALL_PATH)
FOAM_HOME=/opt/foam-${VERSION}

if [ ! -f $FOAM_TARBALL_PATH ]; then
    echo "ERROR :: [${REMOTE_URL}] Tarball ${FOAM_TARBALL_PATH} doesn't exist"
    quit
fi

# user and ssh key may be specified in .ssh/config
REMOTE=${REMOTE_URL}
if [ ! -z ${REMOTE_USER} ]; then
    REMOTE=${REMOTE_USER}@${REMOTE_URL}
fi

SSH_KEY_OPT=""
if [ ! -z ${SSH_KEY} ]; then
    SSH_KEY_OPT="-i ${SSH_KEY}"
fi

if [ $INSTALL_ONLY -eq 0 ]; then

    ssh ${SSH_KEY_OPT} ${REMOTE} 'rm -rf ${FOAM_REMOTE_OUTPUT}/*tar*'
    if [ ! $? -eq 0 ]; then
        echo "ERROR :: [${REMOTE_URL}] Failed removing tarball from remote server ${REMOTE_URL}"
        quit
    fi

    echo "INFO :: [${REMOTE_URL}] Copying ${FOAM_TARBALL_PATH} to ${REMOTE}:${FOAM_REMOTE_OUTPUT}/${FOAM_TARBALL}"
    if [ -f ${FOAM_TARBALL_PATH} ]; then
        scp ${SSH_KEY_OPT} ${FOAM_TARBALL_PATH} ${REMOTE}:${FOAM_REMOTE_OUTPUT}/${FOAM_TARBALL}
    else
        echo "ERROR :: [${REMOTE_URL}] tarball not found ${FOAM_TARBALL_PATH}"
        quit
    fi

    if [ ! $? -eq 0 ]; then
        echo "ERROR :: [${REMOTE_URL}] Failed copying tarball to remote server ${REMOTE_URL}"
        quit
    else
        echo "INFO :: [${REMOTE_URL}] Successfully copied tarball to remote server ${REMOTE_URL}"
    fi
fi

ssh ${SSH_KEY_OPT} ${REMOTE} "sudo bash -s -- -I${FOAM_REMOTE_OUTPUT}/${FOAM_TARBALL} -N${FOAM_HOME} -C${CLUSTER} -B${BACKUP}" < ./foam3/tools/deploy/bin/install.sh

if [ ! $? -eq 0 ]; then
    quit;
else
    echo "INFO :: [${REMOTE_URL}] Remote install successful"
fi

exit 0;
