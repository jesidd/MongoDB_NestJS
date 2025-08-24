import { Injectable } from '@nestjs/common';
import { PokeApiResponse } from './interfaces/pokeApi.interfaces';
import { Pokemon } from 'src/pokemon/entities/pokemon.entity';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { AxiosAdapter } from 'src/common/adapters/axios.adapter';

@Injectable()
export class SeedService {

  constructor(
    @InjectModel(Pokemon.name)
    private readonly pokemonModel: Model<Pokemon>,

    private readonly httpAdapter: AxiosAdapter) {}
  async excuteSeed(){
    await this.pokemonModel.deleteMany({});
    const data = await this.httpAdapter.get<PokeApiResponse>("https://pokeapi.co/api/v2/pokemon?limit=350&offset=0");

    const pokemonToInsert = data.results.map(({ name, url }) => {
    const segments = url.split('/');
    const no: number = +segments[segments.length - 2];
    return { name, no };
  });

  
    return await this.pokemonModel.insertMany(pokemonToInsert);;
  }

}
