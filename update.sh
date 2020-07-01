git fetch 2>&1 |& tee update.log
git pull 2>&1 |& tee -a update.log
npm update 2>&1 |& tee -a update.log
node index.js
