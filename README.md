Test utility for re-connecting shared mount points within Docker.

The (node.js) program within uses FUSE to expose whatever is mounted
at `/source` as a mount point inside whatever is mounted at `/shared`

## Instructions

First, we need to prepare a shared folder:

    mkdir /tmp/shared
    mount --bind /tmp/shared /tmp/shared
    mount --make-shared /tmp/shared

Build the docker image (assuming this folder is `pwd`):

    docker build -t fuse-test .

Run a container:

    docker run --name fuse-server -d -v /tmp/shared:/shared:shared -v $(pwd):/source --privileged --device /dev/fuse fuse-test

You should, on the host, now be able to see the contents of `pwd`
at `/tmp/shared/fuse`. Now, we want to mount that endpoint inside
another container.

    docker run -d --name fuse-client -v /tmp/shared/fuse:/shared:ro,rslave busybox top

If we exec in, we should see our shared folder:

    docker exec -it fuse-client sh
    ls /shared

Exit out, and restart the fuse server:

    docker restart fuse-server

Finally, exec back into the client and see that the transport is now disconnected:


    docker exec -it fuse-client sh
    ls /shared
    >> ls: /shared: Transport endpoint is not connected
