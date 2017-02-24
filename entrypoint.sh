#!/bin/bash
echo 'copying jobs'
rsync -a -v /usr/src/app/jobs /var/jenkins_home
echo 'starting jenkins'
/bin/tini -s -- /usr/local/bin/jenkins.sh
