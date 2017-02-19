FROM jenkins:2.7.1

# if we want to install via apt
USER root

RUN apt-get update
RUN apt-get install vim -y
RUN apt-get -y install g++
RUN apt-get install build-essential -y
# gpg keys listed at https://github.com/nodejs/node
RUN set -ex \
  && for key in \
    9554F04D7259F04124DE6B476D5A82AC7E37093B \
    94AE36675C464D64BAFA68DD7434390BDBE9B9C5 \
    0034A06D9D9B0064CE8ADF6BF1747F4AD2306D93 \
    FD3A5288F042B6850C66B31F09FE44734EB7990E \
    71DCFD284A79C3B38668286BC97EC7A07EDE3FC1 \
    DD8F2338BAE7501E3DD5AC78C273792F7D83545D \
    B9AE9905FFD7803F25714661B63B535A4C206CA9 \
    C4F0DFFF4E8C1A8236409D08E73BC641CC11F4C8 \
  ; do \
    gpg --keyserver ha.pool.sks-keyservers.net --recv-keys "$key"; \
  done

ENV NPM_CONFIG_LOGLEVEL info
ENV NODE_VERSION 4.6.0

RUN curl -SLO "https://nodejs.org/dist/v$NODE_VERSION/node-v$NODE_VERSION-linux-x64.tar.xz" \
  && curl -SLO "https://nodejs.org/dist/v$NODE_VERSION/SHASUMS256.txt.asc" \
  && gpg --batch --decrypt --output SHASUMS256.txt SHASUMS256.txt.asc \
  && grep " node-v$NODE_VERSION-linux-x64.tar.xz\$" SHASUMS256.txt | sha256sum -c - \
  && tar -xJf "node-v$NODE_VERSION-linux-x64.tar.xz" -C /usr/local --strip-components=1 \
  && rm "node-v$NODE_VERSION-linux-x64.tar.xz" SHASUMS256.txt.asc SHASUMS256.txt \
  && ln -s /usr/local/bin/node /usr/local/bin/nodejs

# USER jenkins
# RUN apt-get install cron -y
# RUN apt-get install openssh-server -y

# Make ssh dir
RUN mkdir /root/.ssh/
RUN echo Asia/Hong_Kong > /etc/timezone && dpkg-reconfigure --frontend noninteractive tzdata
# RUN apt-get install zsh -y
# RUN sh -c "$(curl -fsSL https://raw.githubusercontent.com/robbyrussell/oh-my-zsh/master/tools/install.sh)"
RUN npm install -g gulp
# Copy over private key, and set permissions
ADD id_rsa /root/.ssh/id_rsa
RUN chmod 700 /root/.ssh/id_rsa

RUN ssh-keyscan -H -p 10022 topsolver.biz > ~/.ssh/known_hosts
RUN apt-get install python-software-properties -y
RUN apt-get install rsync -y
# RUN ssh-keyscan -H -p 10022 58.96.190.164 > ~/.ssh/known_hosts


# Create app directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app
COPY package.json /usr/src/app

RUN npm config set registry https://registry.npm.taobao.org
RUN npm install
ADD . /usr/src/app

# RUN crontab schedules
RUN chmod -R a+x ./shells
RUN chmod a+x ./entrypoint.sh

RUN rm -rf node_modules/fundpie-backend-engine
RUN rm -rf node_modules/fundpie-backend-models
RUN rm -rf node_modules/fundpie-backend-services

ADD tmp/fundpie-backend-engine node_modules/fundpie-backend-engine
ADD tmp/fundpie-backend-models node_modules/fundpie-backend-models
ADD tmp/fundpie-backend-services node_modules/fundpie-backend-services

#ENTRYPOINT bash ./entrypoint.sh
# CMD ls /var/jenkins_home
# USER jenkins
