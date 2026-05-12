# --- Stage 1: Build Environment (The "Heavy" Stage) ---
FROM nvidia/cuda:12.6.3-devel-ubuntu24.04 AS builder

ENV DEBIAN_FRONTEND=noninteractive \
  CMAKE_GENERATOR=Ninja

RUN apt-get update && apt-get install -y --no-install-recommends \
  build-essential ca-certificates curl git libboost-json-dev \
  libboost-program-options-dev libssl-dev ninja-build pkg-config zlib1g-dev \
  && rm -rf /var/lib/apt/lists/*

# Install modern CMake
RUN curl -L https://github.com/Kitware/CMake/releases/download/v3.31.0/cmake-3.31.0-linux-x86_64.sh -o cmake.sh && \
  sh cmake.sh --skip-license --prefix=/usr/local && rm cmake.sh

# Get headers for C++ build
RUN curl -L https://github.com/ggml-org/llama.cpp/archive/refs/tags/b9012.tar.gz -o /tmp/llama-src.tar.gz && \
  tar -xzf /tmp/llama-src.tar.gz -C /tmp && \
  cp -r /tmp/llama.cpp-b9012/include/* /usr/local/include/ && \
  cp -r /tmp/llama.cpp-b9012/ggml/include/* /usr/local/include/

# Pull llama.cpp binaries to use during build if needed
COPY --from=ghcr.io/ggml-org/llama.cpp:full-cuda /app/lib*.so* /usr/local/lib/

WORKDIR /app
COPY . .

# Build the C++ pipeline
RUN cmake -S . -B build -G Ninja -DCMAKE_BUILD_TYPE=Release && \
  cmake --build build -j$(nproc)

# --- Stage 2: Runtime Environment (The "Slim" Stage) ---
FROM nvidia/cuda:12.6.3-runtime-ubuntu24.04 AS runtime

# Install only necessary runtime shared libraries
RUN apt-get update && apt-get install -y --no-install-recommends \
  curl \
  ca-certificates \
  libboost-json1.83.0 \
  libboost-program-options1.83.0 \
  libgomp1 \
  libssl3 \
  zlib1g \
  && rm -rf /var/lib/apt/lists/*

ENV APP_ROOT=/app \
  LD_LIBRARY_PATH="/usr/local/lib:${LD_LIBRARY_PATH}"

WORKDIR /app/build

# Copy only the compiled binaries from the builder
COPY --from=builder /app/build/biergarten-pipeline ./

# Copy required config files
COPY locations.json /app/build/
COPY beer-styles.json /app/build/

# Copy prompt templates
COPY prompts /app/prompts

# Copy only the necessary shared libraries from builder/llama-bin
COPY --from=ghcr.io/ggml-org/llama.cpp:full-cuda /app/lib*.so* /usr/local/lib/

# Co-locate plugins
RUN cp /usr/local/lib/libggml-cuda.so . 2>/dev/null || true && \
  cp /usr/local/lib/libggml-cpu*.so . 2>/dev/null || true

# Setup Start Script
COPY ./runpod/start.sh /usr/local/bin/biergarten-start
RUN chmod +x /usr/local/bin/biergarten-start

ENTRYPOINT ["/usr/local/bin/biergarten-start"]
