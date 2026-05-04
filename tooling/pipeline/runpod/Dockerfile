# Phase 1: Pull prebuilt binaries
FROM ghcr.io/ggml-org/llama.cpp:full-cuda AS llama-bin

# Phase 2: Building environment
FROM nvidia/cuda:12.6.3-devel-ubuntu24.04

ENV DEBIAN_FRONTEND=noninteractive \
  CMAKE_GENERATOR=Ninja \
  APP_ROOT=/workspace/app \
  BUILD_DIR=/workspace/app/build

RUN apt-get update && apt-get install -y --no-install-recommends \
  build-essential \
  ca-certificates \
  curl \
  git \
  libboost-json-dev \
  libboost-program-options-dev \
  libssl-dev \
  ninja-build \
  pkg-config \
  zlib1g-dev \
  && rm -rf /var/lib/apt/lists/*

# Install modern CMake via curl (Ubuntu 24.04 'apt' version can be laggy)
RUN curl -L https://github.com/Kitware/CMake/releases/download/v3.31.0/cmake-3.31.0-linux-x86_64.sh -o cmake.sh && \
  sh cmake.sh --skip-license --prefix=/usr/local && rm cmake.sh

# Copy backends to /usr/local/lib and register with ldconfig so the
# runtime linker can resolve libllama.so, libggml.so, libggml-base.so etc.
COPY --from=llama-bin /app/lib*.so* /usr/local/lib/
RUN ldconfig

# Headers for C++ Build
RUN curl -L https://github.com/ggml-org/llama.cpp/archive/refs/tags/b9012.tar.gz -o /tmp/llama-src.tar.gz && \
  tar -xzf /tmp/llama-src.tar.gz -C /tmp && \
  cp -r /tmp/llama.cpp-b9012/include/* /usr/local/include/ && \
  cp -r /tmp/llama.cpp-b9012/ggml/include/* /usr/local/include/ && \
  rm -rf /tmp/llama-src.tar.gz /tmp/llama.cpp-b9012

ENV LD_LIBRARY_PATH="/usr/local/lib:${LD_LIBRARY_PATH}"

WORKDIR /workspace/app
COPY . .

# Build the C++ pipeline
RUN cmake -S . -B build -G Ninja -DCMAKE_BUILD_TYPE=Release && \
  cmake --build build -j$(nproc)

# Co-locate GGML backend plugins with the executable.
# ggml_backend_load_all() searches the executable directory first when
# GGML_BACKEND_DIR is not set. Copying the ggml-*.so plugin files here
# ensures the loader finds them without any environment variable.

# libllama.so, libggml.so, and libggml-base.so are NOT copied here —
# those are proper shared libraries resolved via ldconfig/LD_LIBRARY_PATH.
RUN cp /usr/local/lib/libggml-cuda.so  /workspace/app/build/ 2>/dev/null || true && \
  cp /usr/local/lib/libggml-cpu*.so   /workspace/app/build/ 2>/dev/null || true && \
  cp /usr/local/lib/libggml-blas*.so  /workspace/app/build/ 2>/dev/null || true && \
  cp /usr/local/lib/libggml-rpc*.so   /workspace/app/build/ 2>/dev/null || true

# Setup Start Script
COPY ./runpod/start.sh /usr/local/bin/biergarten-start
RUN chmod +x /usr/local/bin/biergarten-start

WORKDIR /workspace/app/build
ENTRYPOINT ["/usr/local/bin/biergarten-start"]
