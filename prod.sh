CLIENT=/var/www/html/link-folder.ru/client
SERVER=/var/www/html/link-folder.ru/server

RED='\033[0;31m'
GREEN='\033[0;32m'

if ! [ -d "$CLIENT" ]; then
  echo "${RED}Client directory '${CLIENT}' is not exists"
  exit 1
fi

if ! [ -d "$SERVER" ]; then
  echo "${RED}Server directory '${SERVER}' is not exists"
  exit 1
fi


if ! yarn > /dev/null 2>&1; then
  echo "${RED}Could not update dependencies"
  exit 1
fi

if ! npm run build > /dev/null 2>&1; then
  echo "${RED}Build failed"
  exit 1
fi

echo "${GREEN}********************"
echo "${GREEN}* Build successful *"
echo "${GREEN}********************"

rm -R $CLIENT
[ -d "${SERVER}/src" ] && rm -R $SERVER/src
[ -d "${SERVER}/migrations" ] && rm -R $SERVER/migrations

mkdir $CLIENT
mkdir $SERVER/src
mkdir $SERVER/migrations


cp -R dist/apps/links-folder/* $CLIENT
cp -R dist/apps/backend/* $SERVER/src
cp -R apps/backend/src/migrations/* $SERVER/migrations
cp -R apps/backend/src/sequelizeConfig.js $SERVER/config.js
cp -R package.json.server $SERVER/package.json

cp dist/apps/backend/.env $SERVER

cd $SERVER
if ! yarn > /dev/null 2>&1; then
  echo "${RED}Could not update server dependencies"
  exit 1;
fi
npx sequelize db:migrate --config config.js --env migration
cd -


