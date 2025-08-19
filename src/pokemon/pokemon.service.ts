import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreatePokemonDto } from './dto/create-pokemon.dto';
import { UpdatePokemonDto } from './dto/update-pokemon.dto';
import { isValidObjectId, Model } from 'mongoose';
import { Pokemon, PokemonDocument } from './entities/pokemon.entity';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class PokemonService {

  constructor(

    @InjectModel(Pokemon.name)
    private readonly pokemonModel: Model<PokemonDocument>
  ) {}

  async create(createPokemonDto: CreatePokemonDto) {
    try {
      const pokemon = await this.pokemonModel.create(createPokemonDto);
      return pokemon;
    } catch (error) {
      if (error.code === 11000) {
        throw new BadRequestException(`Pokemon ${JSON.stringify(error.keyValue)} already exists`);
      }
      throw new InternalServerErrorException('Error creating Pokemon');
    }
  }

  findAll() {
    return `This action returns all pokemon`;
  }

  async findOne(term: string): Promise<PokemonDocument> {
    let pokemon: PokemonDocument;

    try {
      if (!isNaN(+term)) {
        return await this.pokemonModel.findOne({ no: term }).orFail();
      }

      if (isValidObjectId(term)) {
        return await this.pokemonModel.findById(term).orFail();
      }

      return await this.pokemonModel
        .findOne({ name: term.toLowerCase().trim() })
        .orFail();

    } catch (error) {
      throw new NotFoundException(
        `Pokemon with id, name or no "${term}" not found`,
      );
    }
  }


  async update(term: string, updatePokemonDto: UpdatePokemonDto) {
    const pokemon = await this.findOne(term);

    if (updatePokemonDto.no){
      const ByNo = await this.pokemonModel.findOne({
                        no: updatePokemonDto.no,
                        _id: { $ne: pokemon._id }   // excluye el que estoy editando
                      });

      if (ByNo) throw new BadRequestException(`Pokemon with no ${updatePokemonDto.no} already exists`);
    }

    if (updatePokemonDto.name) {
      const exist = await this.pokemonModel.findOne({
        name: updatePokemonDto.name.toLowerCase().trim(),
        _id: { $ne: pokemon._id },
      });
      if (exist) {
        throw new BadRequestException(`Pokemon with name ${updatePokemonDto.name} already exists`);
      }
    }

    if ( updatePokemonDto.name ) {
      await pokemon.updateOne({ name: updatePokemonDto.name.toLowerCase().trim() });
    }

    if (updatePokemonDto.no) {
      await pokemon.updateOne({ no: updatePokemonDto.no });
    }

    return {... pokemon.toJSON(), ...updatePokemonDto};
  }

  async remove(id: string) {
    const pokemon = await this.findOne(id);
    await pokemon.deleteOne();
  }
}
