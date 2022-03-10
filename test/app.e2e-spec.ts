import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';

describe('Pokedex e2e suite test', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ transform: true }));
    await app.init();
  });

  it('Get pokemon by id', async () => {
    const id = 1;
    const result = await request(app.getHttpServer()).get(`/pokemon/${id}`).expect(200);
    expect(result.body).toMatchSnapshot();
  });

  it('Pokemon Not Found', async () => {
    const id = 152;
    const result = await request(app.getHttpServer()).get(`/pokemon/${id}`).expect(404);
    expect(result.body).toMatchSnapshot();
  });

  it('Bad Request', async () => {
    const id = 'test';
    const result = await request(app.getHttpServer()).get(`/pokemon/${id}`).expect(400);
    expect(result.body).toMatchSnapshot();
  });

  it('Get all Pokemons', async () => {
    const result = await request(app.getHttpServer()).get('/pokemon').expect(200);
    expect(result.body).toMatchSnapshot();
  });

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

  afterAll(async () => {
    await app.close();
  });

});
