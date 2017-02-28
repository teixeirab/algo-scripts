FROM jenkins:2.32.2
# FROM jenkins:2.7.1
# if we want to install via apt
USER root

RUN apt-get update
RUN apt-get install vim -y
RUN apt-get -y install g++
RUN apt-get install build-essential -y
RUN apt-get install python-software-properties -y
RUN apt-get install rsync -y
# gpg keys listed at https://github.com/nodejs/node
RUN curl -sL https://deb.nodesource.com/setup_7.x | bash -
RUN apt-get install nodejs build-essential -y
# USER jenkins
# RUN apt-get install cron -y
# RUN apt-get install openssh-server -y

# Make ssh dir
RUN echo EST > /etc/timezone && dpkg-reconfigure --frontend noninteractive tzdata
# RUN apt-get install zsh -y
# RUN sh -c "$(curl -fsSL https://raw.githubusercontent.com/robbyrussell/oh-my-zsh/master/tools/install.sh)"
RUN npm install -g gulp


# Create app directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app
COPY package.json /usr/src/app
RUN npm install
ADD . /usr/src/app

# RUN crontab schedules
RUN chmod -R a+x ./shells
RUN chmod a+x ./exec_tasks.sh
RUN chmod a+x ./entrypoint.sh
