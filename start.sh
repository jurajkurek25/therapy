#!/bin/bash
cd /home/teraplan/htdocs/teraplan.eu
export NODE_ENV=production
exec node_modules/.bin/next start -p 3210 -H 127.0.0.1
