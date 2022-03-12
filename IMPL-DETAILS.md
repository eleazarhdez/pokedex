# Implementation Details
This project is about implement some pokedex behaviours.

## Pokedex operations
The basic operations implemented are:
* Obtain a pokemon by id
* Obtain list of pokemons
* Obtain a pokemon by name
* Obtain list of pokemons with different filters
* Allow obtain pokemon types
* Allow add a pokemon as favourite
* Allow remove a pokemon as favourite
* Allow obtain list of favourite pokemons

## Preparing database
In first instance, I decided that my database would be a postgreSQL instance. So I created a docker-compose.yml file to allow up the instance in some machine with docker.

After that, I started to think how to implement the first operation

## Basic operations detailed
My implementation idea was develop the project in layers arquitecture (Controller, Service, Repository) using **typeORM** to work with database.
### Obtain pokemon by id
In first place, I defined an e2e test to check the basic use case: get a pokemon from pokedex by id:

```typescript
  it('Get pokemon by id', async () => {
    const id = 1;
    const result = await request(app.getHttpServer()).get(`/pokemon/${id}`).expect(200);
    expect(result.body).toMatchSnapshot();
  });
```
My second step was create a pokemon module, and all its layers: PokemonController, PokemonService and PokemonRepository.
In addition, I created necessary entities, domain models and dto's and its mappers in order to work with them.
In this step I take some decisions about database entities and its fields.
For Pokemon Entity:
* *previousEvolutions* and *evolutions* fields are **PokemonEntity** arrays
* *pokemonType*, *resistant*, *weaknesses* fields are **PokemonTypeEntity** arrays
* *attacks* field is an **AttackEntity** array
For Attack Entity:
* *type* was defined like **PokemonTypeEntity** type because all attacks have a pokemon type. I decided use the same entity for this field.
* *category* was defined like **AttackTypeEntity** type to speciy if attack is fast or special

Also I include swagger dependencies to maintain the API documented.

To start check all this implementation I need connection with our database. So I had to define an ormconfig.json file and define how works typeORM in the module:
```typescript
 imports: [
    TypeOrmModule.forRootAsync({
      useFactory: async () =>
        Object.assign(await getConnectionOptions(), {
          autoLoadEntities: true,
        }),
    }),
    PokemonModule,
  ],
```
I decided use `autoLoadEntities: true` because in development phase is most comfortable to the process. This can be removed in next development phases.

But to starting check, we need data in our database. So I decided use **typeorm-seeding** dependency.
I had to define a seed file (`load-pokedex.ts`). All this script is based on the `pokemon.json` file available with all necessary data.
This tool needs know about the entities and the seed scripts. This information has to be defined in ormconfig.json
```json
  "entities": ["dist/**/*.entity{.ts,.js}"],
  "seeds": ["dist/seeds/*.js"],
```

After all, I had my fist test passed. So we can continue with other cases. I define other use case.
* User trying get a not available pokemon:
```typescript
  it('Pokemon Not Found', async () => {
    const id = 152;
    const result = await request(app.getHttpServer()).get(`/pokemon/${id}`).expect(404);
    expect(result.body).toMatchSnapshot();
  });
```
For this case I created a domain *NotFoundError*
```typescript
export class NotFoundError extends Error {
  constructor(message: string) {
    super(message);
  }
}
```
and *HttpExceptionFilter* to can map this or other erros to HTTP errors.
```typescript
@Catch()
export class HttpExceptionFilter extends BaseExceptionFilter {
  catch(exception: Error, host: ArgumentsHost): void {
    if (exception instanceof NotFoundError) {
      return super.catch(new NotFoundException(exception.message), host);
    }
    super.catch(exception, host);
  }
}
```
In addition I have to notify controller to allow it use this filter:
```typescript
 @UseFilters(HttpExceptionFilter)
 @Controller('pokemon')
 ...
 ```
 Next step was create a test to check when user try to get a pokemon with wrong param, like a string or other no number type:
 ```typescript
   it('Bad Request', async () => {
    const id = 'test';
    const result = await request(app.getHttpServer()).get(`/pokemon/${id}`).expect(400);
    expect(result.body).toMatchSnapshot();
  });
 ```
 To solve this problem I decided use validators and `ValidationPipe`.
 Adding this notations in `PathParmDto`:
 ```Typescript
  @Type(() => Number)
  @IsInt()
  id: number;
 ```
 We can try transform the param to a number type and check if its string. In any other case this launch and error type managed by ValidationPipe.
 For this I had to define its use in bootstrap function in `main.ts` file:
 ```typescript
   app.useGlobalPipes(new ValidationPipe({ transform: true }));
```
Note: We need `class-trasnformer` and `class-validator` to can do this in this way