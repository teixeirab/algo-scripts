#!/bin/bash
rsync -a -v jobs /var/jenkins_home

/bin/tini -s -- /usr/local/bin/jenkins.sh
