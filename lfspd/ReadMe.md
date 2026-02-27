## Linux For SPD

This is the base system for SPD software docker container.

The main features of the distro:
- minimalistic linux distribuition (no X11, no GUIs, no mans, no locales etc.).
    
  supposed that all applications will run in docker container in batch mode
- all packages built from sources, including system ones
- minimized by size (compiled with size optimization flags + stripped & cleaned) 
- set of packages for scientific programming 
- the latest versions of all the packages : glibc, gcc, perl, cmake, python etc.
- packages installed in <code>/usr /usr/local</code>. Greatly simpifies <b>setup scripts</b>
- customizable. Package not needed - comment it out & rebuild. To add  - valeriy.onuchin@yandex.ru 

Based on the Linux From Scratch project https://www.linuxfromscratch.org/

## The LFSPD binaries located in 

 <b>[Distros/](Disrtros/)</b>
