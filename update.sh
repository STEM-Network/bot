git fetch -v 2>&1 |& tee update.log
git pull -v 2>&1 |& tee -a update.log
npm update 2>&1 |& tee -a update.log
node index.js
