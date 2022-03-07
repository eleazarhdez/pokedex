import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';

describe('Pokedex e2e suite test', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('Get pokemon by id', async () => {
    const id = 1;
    const result = await request(app.getHttpServer())
      .get(`/pokemon/${id}`)
      .expect(200);
    expect(result.body.name).toEqual('Bulbasaur');
  });
});
