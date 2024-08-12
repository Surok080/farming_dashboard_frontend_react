#!/bin/bash

echo "###GIT PULL###"
git pull

echo "###yarn###"
yarn cache clean
rm -rf node_modules
yarn install

echo "###yarn build###"
NODE_OPTIONS=--max-old-space-size=4096 yarn build  # Увеличиваем лимит памяти

echo "###copy project###"
sudo scp -r build/* /var/www/html/dashboard/

echo "delete temporary files"
sudo rm -R build
sudo rm -R node_modules
