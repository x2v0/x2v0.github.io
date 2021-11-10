#!/data/data/com.termux/files/usr/bin/sh

tnl=$(pidof ssh tnl)
gitdir=$HOME/wrk/x2v0.github.io
file=tnl.html

cd $gitdir
git commit -m "tunnel" $gitdir/$file
git push
