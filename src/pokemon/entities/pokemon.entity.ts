import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, HydratedDocument } from "mongoose";

@Schema()
export class Pokemon extends Document {
    @Prop({
        unique: true,
        index: true
    })
    name: string;

    @Prop({
        unique: true,
        index: true
    })
    no: number;
}

export type PokemonDocument = HydratedDocument<Pokemon>;
export const PokemonSchema = SchemaFactory.createForClass(Pokemon);