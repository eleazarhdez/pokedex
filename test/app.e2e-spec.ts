import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';

describe('Pokedex e2e suite test', () => {
  let app: INestApplication;
  let server;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ transform: true }));
    await app.init();
    server = request(app.getHttpServer());
  });

  it('Get pokemon by id', async () => {
    const id = 1;
    const result = await server.get(`/pokemon/${id}`).expect(200);
    expect(result.body).toMatchSnapshot();
  });

  it('Pokemon Not Found', async () => {
    const id = 152;
    const result = await server.get(`/pokemon/${id}`).expect(404);
    expect(result.body).toMatchSnapshot();
  });

  it('Bad Request', async () => {
    const id = 'test';
    const result = await server.get(`/pokemon/${id}`).expect(400);
    expect(result.body).toMatchSnapshot();
  });

  it('Get all Pokemons', async () => {
    const result = await server.get('/pokemon').expect(200);
    expect(result.body).toMatchSnapshot();
  });

  it('Get pokemons paginated', async () => {
    const page = 1;
    const take = 5;
    const result = await server.get(`/pokemon?page=${page}&take=${take}`).expect(200);
    expect(result.body).toMatchSnapshot();
  });

  it('Get pokemon by name', async () => {
    const name = 'Bulbasaur';
    const result = await server.get(`/pokemon?name=${name}`).expect(200);
    expect(result.body).toMatchSnapshot();
  });

  it('Get pokemon by type', async () => {
    const type = 'Grass';
    const result = await server.get(`/pokemon?type=${type}`).expect(200);
    expect(result.body).toMatchSnapshot();
  });

  it('Get all Pokemon Types', async () => {
    const result = await server.get('/pokemon/types').expect(200);
    expect(result.body).toMatchSnapshot();
  });

  it('Mark pokemon as favorite', async () => {
    const id = 1;
    await server.put(`/pokemon/${id}`).send({ favorite: true }).expect(200);
    const result = await server.get(`/pokemon/favorites`).expect(200);
    expect(result.body).toMatchSnapshot();
  });

  it('Remove pokemon as favorite', async () => {
    const id = 1;
    await server.put(`/pokemon/${id}`).send({ favorite: false }).expect(200);
    const result = await server.get(`/pokemon/favorites`).expect(200);
    expect(result.body).toMatchSnapshot();
  });

  it('Favorite field can not be a number, has to be a boolean. Bad Request', async () => {
    const id = 1;
    const result = await server.put(`/pokemon/${id}`).send({ favorite: 1 }).expect(400);
    expect(result.body).toMatchSnapshot();
  });

  it('Favorite field can not be a string, has to be boolean. Bad Request', async () => {
    const id = '1';
    const result = await server.put(`/pokemon/${id}`).send({ favorite: 'true' }).expect(400);
    expect(result.body).toMatchSnapshot();
  });

  afterAll(async () => {
    await app.close();
  });

});
