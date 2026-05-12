```bash
touch runpod/start.sh
docker build \
 --progress=plain \
 -t biergarten-pipeline:latest \
 -f runpod/Dockerfile \
 . 2>&1 | tee build.log
```
