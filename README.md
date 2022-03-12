# Pokedex
A small API project where show it how get pokemons with filters and other basic operations.


## Pokedex installation
To install all project dependencies:
```bash
$ npm install
```
Besides, you must have installed docker in your OS and after that execute:
```bash
$ docker-compose up -d
```
To seed your database execute the next commands:
```bash
# create the database schema
$ npm run schema:sync
# populate data in database
$ npm run seed:run
```

## Running the Pokedex app
To run the project:
```bash
# development
$ npm run start
```

## Testing
To execute the e2e tests:
```bash
# e2e tests
$ npm run test:e2e

# e2e updating snapshots
$ npm run test:e2e:update:snapshot
```
Details about implementation in [Implementation Details Document](./IMPL-DETAILS.md)

