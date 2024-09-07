FROM ubuntu:16.04

RUN apt-get update && \
  apt-get install -y build-essential zlib1g-dev libncurses5-dev libgdbm-dev \
  libnss3-dev libssl-dev libreadline-dev libffi-dev wget cmake ninja-build python \
  nodejs-legacy libncurses-dev unzip libboost1.58-tools-dev time git && \
  wget https://www.python.org/ftp/python/3.7.4/Python-3.7.4.tgz && \
  tar xzf Python-3.7.4.tgz && \
  cd Python-3.7.4 && \
  ./configure && \
  make && \
  make install
