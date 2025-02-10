#!/bin/bash
find ./ -type f \( \
     -name "*.js"   -o \
     -name "*.java" -o \
     -name "*.jrl"  -o \
     -name "*.fbe"  -o \
     -name "*.sh"   -o \
     -name "*.flow" -o \
     -name "*.txt"  -o \
     -name "*.html" -o \
     -name "*.md" \) \
   -exec perl -p -i -e 's/foam\.core/foam\.lang/g' \{} \; \
   -exec perl -p -i -e 's/NSpec/COREService/g'   \{} \; \
   -exec perl -p -i -e 's/nanos/core/g'          \{} \; \
   -exec perl -p -i -e 's/NANOS/CORE/g'          \{} \;
