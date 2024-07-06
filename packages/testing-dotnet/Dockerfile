FROM mcr.microsoft.com/devcontainers/dotnet:dev-8.0-jammy

RUN apt-get update && export DEBIAN_FRONTEND=noninteractive \
    && apt-get -y install --no-install-recommends \
        cmake \
        llvm \
        clang \
        build-essential \
        python3 \
        curl \
        git \
        lldb \
        liblldb-dev \
        libunwind8 \
        libunwind8-dev \
        gettext \
        libicu-dev \
        liblttng-ust-dev \
        libssl-dev \
        libkrb5-dev \
        zlib1g-dev \
        ninja-build

COPY ./build-runtime.sh /build-runtime.sh
