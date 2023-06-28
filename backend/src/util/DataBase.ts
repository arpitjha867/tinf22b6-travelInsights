import { AppDataSource } from '../data-source';
import { readFile } from 'fs/promises';
import xml2json from '@hendt/xml2json/lib';
import { Country } from '../db/Country';
import axios from 'axios/index';
import { IGeoLocation } from '../api/CityData';
import { City } from '../db/City';

interface ICity {
  name: string;
}

interface ICountry {
  name: string;
  cities: Array<ICity>;
}

export async function FillDatabase() {
  const countryRepository = AppDataSource.getRepository(Country);
  let count = await countryRepository.count();
  console.log(count);
  if (count > 0) {
    return;
  } else {
    console.log('No entries found, scanning for Data Source!');
    return readFile(__dirname + '/out.xml')
      .then(async (buffer) => {
        const json = xml2json(buffer.toString());

        const countryRepository = AppDataSource.getRepository(Country);
        const cityRespoitory = AppDataSource.getRepository(City);

        for (let country of json.countries.country) {
          let currentCountry = await countryRepository.find({ where: { name: country } });
          console.log(currentCountry);

          if (currentCountry.length === 0) {
            console.log('Country not found, creating new for', country);
            const newCountry = new Country();
            const countryCoordinates = await getCoordinates(country.name).catch(() => {
              return Promise.reject('Country coordinates not found for ' + country.name);
            });
            newCountry.lat = countryCoordinates.lat;
            newCountry.lng = countryCoordinates.lng;
            newCountry.name = country;
            newCountry.cities = [];
            await countryRepository.save(newCountry);
            currentCountry = await countryRepository.find({ where: { name: country } });
          }

          for (let city of country.city) {
            let currentCity = await cityRespoitory.find({ where: { name: city.name, country: currentCountry } });
            if (currentCity.length === 0) {
              const googleData = await getGoogleData(city.name).catch(() => {
                return Promise.reject('Google Api Reject');
              });
              const wikiData = await getWikipediaDescription(city.name).catch(() => {
                return 'No Wiki information available!';
              });
              const cityCoordinates = await getCoordinates(city.name).catch(() => {
                return Promise.reject('City coordinates not found for ' + city.name);
              });
              const newCity = new City();
              newCity.name = city.name;
              newCity.shortDescription = googleData.description;
              newCity.longDescription = wikiData;
              newCity.imageSrc = googleData.image;
              newCity.lat = cityCoordinates.lat;
              newCity.lng = cityCoordinates.lng;
              newCity.country = currentCountry[0];
  
              await cityRespoitory.save(newCity);
            }
              
          }
        }
      })
      .catch((reason) => {
        return Promise.reject(reason);
      });
  }
}

async function getCoordinates(place: string): Promise<IGeoLocation> {
  return axios
    .get(
      `https://nominatim.openstreetmap.org/search?q=${place}&format=json&limit=1`
    )
    .then((response) => {
      return { lat: response.data[0].lat, lng: response.data[0].lon };
    })
    .catch(() => {
      return Promise.reject('Can\'t get location from String');
    });
}

async function getGoogleData(place: string): Promise<{ image: string; description: string }> {
  if (place.includes('Isla de')) {
    place = place.split(' ')[2];
  }
  return axios
    .get(
      `https://kgsearch.googleapis.com/v1/entities:search?query=${place}&key=${process.env.GOOGLE_API_KEY}&limit=10`
    )
    .then((result) => {
      for (let entry of result.data.itemListElement) {
        if (
          entry.result['@type'].includes('City') ||
          entry.result['@type'].includes('AdministrativeArea') ||
          entry.result['@type'].includes('Place')
        ) {
          return {
            image: entry.result.image.contentUrl,
            description: entry.result.detailedDescription.articleBody
          };
        }
      }
      return Promise.reject();
    });
}

async function getWikipediaDescription(place: string): Promise<string> {
  return axios
    .get(
      `https://en.wikipedia.org/w/api.php?format=json&action=query&prop=extracts&exintro=1&explaintext=1&titles=${place}`
    )
    .then((response) => {
      const pages = response.data.query.pages;
      for (let page in pages) {
        return pages[page].extract;
      }
    });
};
