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
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
  });

  it('Get pokemon by id', async () => {
    const id = 1;
    const result = await request(app.getHttpServer()).get(`/pokemon/${id}`).expect(200);
    expect(result.body.name).toEqual('Bulbasaur');
  });

  it('Get pokemon by id not found', async () => {
    const id = 152;
    const result = await request(app.getHttpServer()).get(`/pokemon/${id}`).expect(404);
    expect(result.body.message).toEqual('Pokemon not Found');
  });

  it('Get pokemon by id bad request', async () => {
    const id = 'test';
    const result = await request(app.getHttpServer()).get(`/pokemon/${id}`).expect(400);
    expect(result.body.message).toEqual(['id must be an integer number']);
  });
});
