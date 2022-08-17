CREATE TABLE sponsors (
    id int not null unique primary key,
    familycomp varchar(2) not null, -- family composition. Single male = SM, single female = SF, family = FA
    accommodatenum int not null, -- amount of refugees that can be accommodated
    country varchar(2) not null ,
    city varchar (50) not null ,
    state varchar (2)
);

CREATE TABLE refugees (
    id int not null unique primary key,
    currcity varchar(50) not null, -- the current city
    currcountry varchar(2) not null, -- the current country
    prefcountry varchar(2) not null, -- preferred city
    prefstate varchar(2), -- if usa, preferred state. ex: Los Angeles -> LA
    persons int not null, -- amount of persons
    pets int, -- amount of pets, null if none
    picture bytea -- bytearray picture data
);

CREATE TABLE users (
    id int not null unique primary key,
    type bool not null, -- true: Sponsor, false: refugee
    name varchar(256) not null, -- full name
    username varchar(128) not null, -- username for login
    passhash varchar(256) not null, -- hash of password + passsalt
    passsalt varchar(128) not null,
    email varchar(256),
    phone varchar(30), -- optional phone number
    refugeeId int,
    sponsorId int,

    foreign key (refugeeId) references refugees(id),
    foreign key (sponsorId) references sponsors(id)
);
