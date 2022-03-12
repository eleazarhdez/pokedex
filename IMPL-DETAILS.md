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

### Obtain list of pokemons, obtain a pokemon by name and obtain list of pokemons with different filters

To implement this case I started creating the following test:
```typscrypt
    it('Get all Pokemons', async () => {
      const result = await request(app.getHttpServer()).get('/pokemon').expect(200);
      expect(result.body).toMatchSnapshot();
    });
```
After that, I create the endpoint in controller, the case in the service and query in the  repository.

Based on the database model that I designed, the query to get all pokemons its a little bit bigger and complex than expected before:
```typescript
    const query = this.pokemonRepository
      .createQueryBuilder('pokemon')
      .leftJoinAndSelect('pokemon.pokemonType', 'pokemonType')
      .leftJoinAndSelect('pokemon.resistant', 'resistant')
      .leftJoinAndSelect('pokemon.weaknesses', 'weaknesses')
      .leftJoinAndSelect('pokemon.previousEvolutions', 'previousEvolutions')
      .leftJoinAndSelect('pokemon.evolutions', 'evolutions')
      .leftJoinAndSelect('pokemon.attacks', 'attacks')
      .leftJoinAndSelect('attacks.type', 'attackTypes')
      .leftJoinAndSelect('attacks.category', 'attackCategories');
    if (!!queryParams.name) {
      query.andWhere('pokemon.name = :name', { name: queryParams.name });
    }
    if (!!queryParams.type) {
      query.andWhere((qb) => {
        const subQuery = qb
          .subQuery()
          .select('pokemon.id', 'id')
          .from(PokemonEntity, 'pokemon')
          .leftJoin('pokemon.pokemonType', 'pokemonType')
          .where('pokemonType.type = :type', { type: queryParams.type })
          .getQuery();
        return 'pokemon.id IN ' + subQuery;
      });
    }
    const [pokemonEntities, itemCount] = await query.skip(pageOptions.skip).take(pageOptions.take).getManyAndCount();
```
We can see in the query, *queryParams* and *pageOptions* params.
The QueryParamsDTO and PageOptionsDto and its equivalent domain models were created to handle query parameters and pagination.
Also its mappers.

In **PageOptionsDto** class I had an attribute in order to define the *order* field. I created an enum to stablish the possible values for this:
```typescript
export enum Order {
  ASC = 'ASC',
  DESC = 'DESC',
}
```
Besides, the default value will be `ASC`:
```typescript
  readonly order?: Order = Order.ASC;
```
In **QueryParamsDto** I have 2 fields: *type* and *name*. For type param I used other enum to only use like type param the pokemon types allowed:
```typescrypt
export enum PokemonType {
  GRASS = 'Grass',
  POISON = 'Poison',
  FIRE = 'Fire',
  ICE = 'Ice',
  BUG = 'Bug',
  STEEL = 'steel',
  FAIRY = 'Fairy',
  WATER = 'Water',
  GROUND = 'Ground',
  ROCK = 'Rock',
  ELECTRIC = 'Electric',
  FIGHTING = 'Fighting',
  FLYING = 'Flying',
  PSYCHIC = 'Psychic',
  NORMAL = 'Normal',
}
```
Also, for both fields, *type* and *name*, I decided implement a transform function to map the string inserted by user by the same string with the first char in upperCase to match with the values in database:
```typescript
@ApiPropertyOptional({ enum: PokemonType })
  @IsEnum(PokemonType)
  @IsOptional()
  @Transform((type) => type.value.charAt(0).toUpperCase() + type.value.substring(1))
  readonly type?: PokemonType;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  @Transform((name) => name.value.charAt(0).toUpperCase() + name.value.substring(1))
  readonly name?: string;
```

I decided implement  the pagination based me on the next class and its equivalent domain model:
```typescript
export class PageDto<T> {
  @ApiProperty({ isArray: true })
  @IsArray()
  readonly data: T[];

  @ApiProperty({ type: () => PageMetaDto })
  readonly meta: PageMetaDto;

  constructor(data: T[], meta: PageMetaDto) {
    this.data = data;
    this.meta = meta;
  }
}
```
I used a Page class to keep the data info in *data* array and metadata of the query like page, itemcount, nextPage, etc in *meta* field

With the pagination and query params we can test more use cases and several new test were implemented during the  process:
```typescript
  test('Get pokemons paginated', async () => {
    const page = 1;
    const take = 5;
    const result = await request(app.getHttpServer()).get(`/pokemon?page=${page}&take=${take}`).expect(200);
    expect(result.body).toMatchSnapshot();
  });

  test('Get pokemon by name', async () => {
    const name = 'Bulbasaur';
    const result = await request(app.getHttpServer()).get(`/pokemon?name=${name}`).expect(200);
    expect(result.body).toMatchSnapshot();
  });
```

### Obtain pokemon types
I started this use case with the following test:
```typescript
  it('Get all Pokemon Types', async () => {
    const result = await request(app.getHttpServer()).get('/pokemon/types').expect(200);
    expect(result.body).toMatchSnapshot();
  });
```
Based on my database model this use case was relatively trivial because we have stored all pokemon types in one single database table.
I had to implement controller, service and repository methods and I decided return a string array as answer.
By other side, as the pagination was already implement, I decided paginate this answer too to allow decide how many items in the array we want and make it countable. But I could simplify this only returning simple string array.

### Mark, unmark and get favorite pokemons
For this use case I decided use other single database table. This decision made me create other entity: **FavoritePokemon** and its Dto. I keep in this table pokemon id and the *favorite* field with its possible values (true or false).
This makes easy the queries to mark or unmark the favorite pokemons.

To check this features I designed the following tests:
```typescript
  it('Mark pokemon as favorite', async () => {
    const id = 1;
    await request(app.getHttpServer()).put(`/pokemon/${id}`).send({ favorite: true }).expect(200);
    const result = await request(app.getHttpServer()).get(`/pokemon/favorites`).expect(200);
    expect(result.body).toMatchSnapshot();
  });

  it('Remove pokemon as favorite', async () => {
    const id = 1;
    await request(app.getHttpServer()).put(`/pokemon/${id}`).send({ favorite: false }).expect(200);
    const result = await request(app.getHttpServer()).get(`/pokemon/favorites`).expect(200);
    expect(result.body).toMatchSnapshot();
  });
```
Due to I keep favorite pokemons in a single table and I want return a pokemon name array as answer for get favorite pokemons query the strategy was:
1. Get favorite pokemon ids.
2. Get pokemon names from before pokemon ids array.
```typescript
const favoritePokemonIds = await this.favoritePokemonRepository.find({
      select: ['id'],
      where: { favorite: true },
    });
    const favoriteIds: number[] = [];
    favoritePokemonIds.map((favoritePokemon) => favoriteIds.push(favoritePokemon.id));
    const [favoritePokemons, itemCount] = await this.pokemonRepository.findAndCount({
      where: { id: In(favoriteIds) },
      skip: pageOptions.skip,
      take: pageOptions.take,
    });
```
Like the get pokemon Types case, I decided keep the pagination, but we can simplify this only returnin a string array with the pokemon names.

To ensure that users insert correct boolen values to mark or unmark pokemon as favorite, we add validators and I had test to check this use case too:
```typescript
  it('Favorite field can not be a number, has to be a boolean. Bad Request', async () => {
    const id = 1;
    const result = await request(app.getHttpServer()).put(`/pokemon/${id}`).send({ favorite: 1 }).expect(400);
    expect(result.body).toMatchSnapshot();
  });

  it('Favorite field can not be a string, has to be boolean. Bad Request', async () => {
    const id = '1';
    const result = await request(app.getHttpServer()).put(`/pokemon/${id}`).send({ favorite: 'true' }).expect(400);
    expect(result.body).toMatchSnapshot();
  });
```

## Possible improvements:
Probably I would have to remove query params in get pokemon types query because its not very useful.
By other side add any other test, as unit tests or other use case tests.






