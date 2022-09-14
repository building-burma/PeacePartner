# PeacePartner

Sponsor matching for people seeking refuge.

## requirements

* postgres installation
* Node dependencies listed in package.json

## Noteworthy
The "SESSIONSECRET" token in the config.json file MUST stay secret. This is the key used for cookie encryption. I recommend generating a new one before every server start.

## structure

```text
PeacePartner/
   | Routes/ -- contains routes
        | auth.js -- login, register and log out is handled here
        | home.js -- self explanatory
   | static/ -- contains static files. these files are public 
   |    | js/ -- contains static js files
   |    | css/ -- contains .scss files, also contains the transpiled css files
   | templates/ -- contains pug template files
        | base.pug -- base template. links to style.css
        | home.pug -- homepage template
        | register.pug -- contains register form
   | matcher.js -- contains the algorithm for matchmaking. called when a new user is created
   | server.js -- entry point of the webapp. to be ran with node
   | db.js -- database configuration file.
   | config.json -- main configuration file. should remain secret at all costs
   | database_model.sql -- contains the database model
```