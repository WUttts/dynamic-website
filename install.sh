#!/bin/bash

# SETUP HEROKU DEPLOYMENT TUTORIAL

red=`tput setaf 1`
green=`tput setaf 2`
reset=`tput sgr0`

echo
echo "======= CHECKING WE ARE ON A CODIO BOX ======="
if [ -v CODIO_HOSTNAME ]
then
	echo "Codio box detected"
	echo "continuing setup"
else
	echo "no Codio box detected"
	echo "exiting setup"
	exit 1
fi

type=${CODIO_TYPE:-assignment}

if [ $type = "lab" ];
then
	echo "YOU ARE TRYING TO RUN THIS IN A CODIO **LAB**"
	echo "script should only be run in your box"
	exit 1
fi

echo
echo "============== ${green}DELETING${reset} OLD FILES ==================="
sudo chown -R codio:codio .
sudo chmod -R 775 .

rm -rf *
rm -rf .*
rm -rf .guides

echo
echo "============== CLONING ${green}REPOSITORY${reset} ==================="
git clone https://github.coventry.ac.uk/web/Codio-Deno-Dynamic-Website-Template.git .
chmod +x .githooks/*
git remote rm origin
rm -rf install.sh # delete this script so it can't be run from inside the project!
rm .codio
mv codio.json .codio
echo
echo "============= DELETING ${green}TEMPORARY FILES${reset} =============="
rm -rf *.db  # delete any old database files
rm -rf package-lock.json
rm -rf .settings
rm -rf .sqlite_history
rm -rf .bash_history
rm -rf .git # delete the repository we have cloned (if any)

echo "=============== CONFIGURING ${green}GIT${reset} ====================="

git init
git config core.hooksPath .githooks/
git config branch.master.mergeoptions  "--no-ff"

echo
echo "============ INSTALLING LOGGER TOOL ============"

mv -f /home/codio/workspace/logger.sh /home/codio/logger.sh
chmod +x /home/codio/logger.sh
mv -f /home/codio/workspace/stats.js /home/codio/stats.js
chmod +x /home/codio/stats.js
touch /home/codio/reset_history.csv
sudo chown codio:codio /home/codio/reset_history.csv
sudo chmod 775 /home/codio/reset_history.csv

touch /home/codio/log.csv
sudo chown codio:codio /home/codio/log.csv
sudo chmod 775 /home/codio/log.csv

sudo -s <<EOF
(crontab -l ; echo "*/5 * * * * /home/codio/logger.sh")| crontab -
EOF

sudo service cron reload

echo
echo "============ INSTALLING PACKAGES ============"

sudo add-apt-repository -y ppa:git-core/ppa
sudo apt update -y
sudo apt upgrade -y

sudo apt install -y psmisc lsof tree build-essential gcc g++ make jq curl git unzip dnsutils lcov
sudo apt autoremove -y

echo "============= INSTALLING MYSQL =============="
sudo debconf-set-selections <<< 'mysql-server mysql-server/root_password password p455w0rd'
sudo debconf-set-selections <<< 'mysql-server mysql-server/root_password_again password p455w0rd'
sudo apt -y install mysql-server mysql-client

FILENAME="/etc/mysql/mysql.conf.d/mysqld.cnf"
SEARCH="127.0.0.1"
REPLACE="0.0.0.0"
sudo sed -i "s/$SEARCH/$REPLACE/gi" $FILENAME

# disable secure file privileges (so we can import a csv file)
echo 'secure_file_priv=""' | sudo tee -a /etc/mysql/mysql.conf.d/mysqld.cnf

mysql -u root -pp455w0rd website -e "DROP DATABASE IF EXISTS website; DROP USER IF EXISTS websiteuser;"
mysql -u root -pp455w0rd -e "create database website";
mysql -u root -pp455w0rd website < setup.sql

FILENAME="/etc/mysql/mysql.conf.d/mysqld.cnf"
SEARCH="127.0.0.1"
REPLACE="0.0.0.0"
sudo sed -i "s/$SEARCH/$REPLACE/gi" $FILENAME

# disable secure file privileges (so we can import a csv file)
echo 'secure_file_priv=""' | sudo tee -a /etc/mysql/mysql.conf.d/mysqld.cnf

echo
echo "====== INSTALLING ${green}DENO${reset} ======"
curl -fsSL https://deno.land/x/install/install.sh | sh -s v1.14.0

echo
echo "=============== INSTALLING ${green}HEROKU${reset} TOOL ================"
curl https://cli-assets.heroku.com/install-ubuntu.sh | sh

echo
echo "=============== INSTALLING THE ${green}AWS${reset} TOOL ================"
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install
rm awscliv2.zip
rm -rf aws/

echo
echo "========= CUSTOMISING SHELL PROMPT =========="
if grep PS1 ~/.profile
then
  echo "correct prompt found"
else
  echo "prompt needs updating"
  echo "PS1='$ '" >> ~/.profile
fi

if grep deno ~/.profile
then
  echo "path to deno executable found"
else
  echo "path to deno executable needs adding"
  echo "PATH='$PATH:$HOME/.deno/bin'" >> ~/.profile
fi

if grep clear ~/.profile
then
  echo "clear prompt found"
else
  echo "clear prompt needs adding"
  echo "clear" >> ~/.profile
fi

if grep TMPDIR ~/.profile
then
  echo "temp directory set correctly"
else
  echo "need to set temp directory"
  echo "export TMPDIR=/home/codio/workspace/tmp/" >> ~/.profile
fi

source ~/.profile

TIMESTAMP=`date +"%s"`
DATE=`date +"%D"`
TIME=`date +"%T"`
LOG="$TIMESTAMP,$DATE,$TIME"
echo $LOG >> /home/codio/reset_history.csv
