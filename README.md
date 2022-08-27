# PeacePartner

Sponsor matching for people seeking refuge.

## requirements

* postgres installation

## structure

```text
PeacePartner/
   | Routes/ -- contains routes for 
   | static/ -- contains static files. these files are public 
   |    | js/ -- contains static js files
   |    | css/ -- contains .scss files, also contains the compiled css files
   | templates/ -- contains pug template files
   | server.js -- entry point of the webapp. to be ran with node
   | db.js -- database configuration file.
   | config.json -- main configuration file. should remain secret at all costs
   | database_model.sql -- contains the database model
```