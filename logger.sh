#!/bin/bash

# if [ -v CODIO_HOSTNAME ]
# then
DU=`du -sb /home/codio/workspace/`
HOME=${DU%/home/codio/workspace/}
DU2=`du -sb /home/codio/workspace/public/uploads/`
UPLOADS=${DU2%/home/codio/workspace/public/uploads/}
SIZE=$(($HOME - $UPLOADS))
TIMESTAMP=`date +"%s"`
DATE=`date +"%D"`
TIME=`date +"%T"`
LOG="$TIMESTAMP,$DATE,$TIME,$SIZE"
echo $LOG >> /home/codio/log.csv
# fi
