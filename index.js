const fuse = require('fuse-bindings');
const fs = require('fs');

const MOUNT_PATH = "/shared/fuse";
const SOURCE_PATH = "/source/";

// we unmount upfront to make sure we can later mount
try {
    var result = require("child_process").execSync("umount " + MOUNT_PATH);
} catch(e) { }

// we create a mount point if it doesn't already exist
try {
    var result = fs.mkdirSync(MOUNT_PATH);
} catch(e) { }

fuse.mount(MOUNT_PATH, {
    open: open,
    release: release,
    read: read,
    readdir: readdir,
    getattr: getattr,
    error: function(err){ console.warn("FUSE ERROR:", err) }
}, function(err) {
    if (err)
        console.warn("mount error", err)
    else
        console.log("mounted")
})

function readdir(path, callback)
{
    fs.readdir(newPath(path), function _readdir(err, result) {
        if (err) {
            console.log("readdir", err)
            return callback(fuse.ENOENT);
        }

        callback(0, result)
    });
}

function open(path, flags, callback)
{
    fs.open(newPath(path), flags, function _open2(err, fd) {
        if (err) {
            console.log("open", err)
            return callback(fuse.ENOENT);
        }

        callback(0, fd)
    })
}

function release(path, fd, callback)
{
    fs.close(fd, function _release(err) {
        if (err)
            callback(fuse.ENOENT)
        else
            callback(0)
    })
}

function read(path, fd, buffer, length, position, callback)
{
    fs.read(fd, buffer, 0, length, position, function _read(err, bytesRead) {
        if (err) {
            console.log("read", err)
            return callback(0)
        }

        callback(bytesRead)
    })
}

function getattr(path, callback)
{
    fs.stat(newPath(path), function _getattr2(err, stat) {
        if (err) {
            console.log("stat", err)
            return callback(fuse.ENOENT)
        }

        callback(0, {
            mtime: stat.mtime,
            atime: stat.atime,
            ctime: stat.ctime,
            size: stat.size,
            mode: stat.mode,
            uid: process.getuid(),
            gid: process.getgid()
        })
    })
}

function newPath(path) {
    return SOURCE_PATH + path
}
