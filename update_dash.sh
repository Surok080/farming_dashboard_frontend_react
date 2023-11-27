#!/bin/bash#!/bin/bash
echo "###GIT PULL###"
git pull

echo "###npm run build###"
npm run build

echo "###download project###"

read -rp "Введите username и ip для входа [example: username@111.111.111.111]: " username_ip
echo ""
scp -r build/* "${username_ip}":/var/www/html/agro-connect.online
echo ""
echo "Если ошибки, то нужно дать права пользователю для изменения папки"
echo "На сервере прописать [example: sudo chown -R hodakoov:hodakoov html/] указав свои данные и нужную папку"
