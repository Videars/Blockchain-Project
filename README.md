# Blockchain-Project

[https://remix.ethereum.org](https://remix.ethereum.org)

Our website is hosted on Apache2 and it requires php and MySql modules.

Download apache for Windows 11:
https://www.apachelounge.com/download/VS17/binaries/httpd-2.4.58-win64-VS17.zip
Extract the folder and put it in "C:\Apache24"
Move our project “Code” directory contents in “C:\Apache24\htdocs”
Open a terminal in “C:\Apache24\bin” and run the command “httpd.exe”
Now the site will be up a running without php and MySql

download MySql installer:
https://dev.mysql.com/downloads/file/?id=523567
Install MySQL server 
port 3306
Set a password (remember this will be the password that has to be inserted inside the “config.php” file)
Terminate the installation
Install MySQL workbench 
https://dev.mysql.com/downloads/file/?id=519997
Log In with the user created and import the schema located inside the db directory of our project. Call it “remora_db”

Php set up:
after the php installation, paste 
	LoadModule php_module "C:\PHP\php8apache2_4.dll"
AddHandler application/x-httpd-php .php
PHPIniDir "C:\PHP"
inside the “httpd.conf” file of apache that you can find on "C:\Apache24\conf\httpd.conf"

MySql setup:
after mysqli installation, uncomment the line
	extension=mysqli
inside the “php.ini” file of php that you can find in "C:\PHP\php.ini". If you cannot find it, simply create it by copying the “php.ini-development” file and renaming it “php.ini” .

Once the project has been downloaded, the password inside the “config.php” file in the “php_scripts” folder, has to be changed with the one that has been used during the MySql installer phase.


![gear-token](https://github.com/Videars/videars.github.io/assets/105921751/8e811874-0280-4c6a-9b0e-3b59abf539e0)
