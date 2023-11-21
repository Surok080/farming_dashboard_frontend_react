#!/bin/bash
echo "###GIT PULL"
git pull
echo "###npm run build"
npm run build
echo "###update service"
scp -r build/* hodakoov@80.249.145.246:/var/www/hodakoov.ru/dashboard/


