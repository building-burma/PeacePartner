CREATE TABLE sponsors (
    id int not null unique primary key,
    accommodatenum int not null, -- amount of refugees that can be accommodated
    pets int not null, -- amount of pets
    pettypes text,
    country varchar(2) not null ,
    city text not null ,
    state varchar (2)
);

CREATE TABLE refugees (
    id int not null unique primary key,
    currcity text not null, -- the current city
    currcountry varchar(2) not null, -- the current country
    prefcountry varchar(2) not null, -- preferred country
    prefcity text not null, -- preferred city
    prefstate varchar(2), -- if usa, preferred state. ex: Los Angeles -> LA
    persons int not null, -- amount of persons
    pets int not null, -- amount of pets
    pettypes text,
    picture bytea -- bytearray picture data
);

CREATE TABLE users (
    id int not null unique primary key,
    type bool not null, -- true: Sponsor, false: refugee
    familycomp varchar(2) not null, -- family composition. Single male = SM, single female = SF, family = FA
    name text not null, -- full name
    username text not null, -- username for login
    passhash varchar(256) not null, -- hash of password + passsalt
    passsalt varchar(128) not null,
    email text,
    phone text, -- optional phone number
    refugeeId int,
    sponsorId int,

    foreign key (refugeeId) references refugees(id),
    foreign key (sponsorId) references sponsors(id)
);

CREATE TABLE matches (
    id int not null unique primary key,
    matchScore int not null, -- the 'score' of the match or how well the users match each other. the higher the higher the priority of the match
    firstUserId int not null,
    secondUserId int not null,

    foreign key (firstUserId) references users(id),
    foreign key (secondUserId) references users(id)
);
