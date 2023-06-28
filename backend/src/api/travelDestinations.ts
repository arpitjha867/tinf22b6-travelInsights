import { Controller, Get, Path, Res, Route, TsoaResponse } from 'tsoa';
import { AppDataSource } from '../data-source';
import { City } from '../db/City';
import { Country } from '../db/Country';

@Route('travelDestinations')
export class TravelDestinations extends Controller {
  @Get('{country}')
  public async getTravelDestinationForCountry(@Path() country: string, @Res() errorResponse: TsoaResponse<500, {
    reason: string
  }>): Promise<Country> {
    const countryRepository = AppDataSource.getRepository(Country);
    let currentCountry = await countryRepository.find({where: {name: country}, relations: {cities: true}});
    if (currentCountry.length != 0) {
      return currentCountry[0];
    } else {
      return Promise.reject("Country not found!");
    }
  }
}