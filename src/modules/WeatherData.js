import { fromUnixTime, format } from "date-fns";
import pubsub from "./Pubsub";

const getAPILink = (cityName, units) => {
  const APILink = `http://api.openweathermap.org/data/2.5/weather?q=${cityName}&units=${units}&APPID=449b05371154016e4225fe1f885a634e`;
  return APILink;
};

const extractRequiredData = (metric, imperial) => {
  const requiredData = {
    weatherMain: {
      main: metric.weather[0].main,
      iconId: metric.weather[0].icon,
      desc: metric.weather[0].description.toLowerCase(),
      temp: {
        metricUnits: Math.round(Number(metric.main.temp)),
        imperialUnits: Math.round(Number(imperial.main.temp)),
      },
      city: metric.name,
      country: metric.sys.country,
    },
    weatherDetails: {
      tempDetails: {
        metricUnits: {
          feelsLike: Math.round(Number(metric.main.feels_like)),
          tempMax: Math.round(Number(metric.main.temp_max)),
          tempMin: Math.round(Number(metric.main.temp_min)),
        },
        imperialUnits: {
          feelsLike: Math.round(Number(imperial.main.feels_like)),
          tempMax: Math.round(Number(imperial.main.temp_max)),
          tempMin: Math.round(Number(imperial.main.temp_min)),
        },
      },
      humidity: metric.main.humidity,
      windSpeed: {
        metricUnits: metric.wind.speed,
        imperialUnits: imperial.wind.speed,
      },
      cloudiness: metric.clouds.all,
      sunrise: format(fromUnixTime(metric.sys.sunrise), "HH:m:ss"),
      sunset: format(fromUnixTime(metric.sys.sunset), "HH:mm:ss"),
    },
  };
  console.log(requiredData);
  pubsub.publish("getWeatherData", requiredData);
};

const getWeatherData = async (cityName) => {
  const [metricUnitsPromise, imperialUnitsPromise] = await Promise.all([
    fetch(getAPILink(cityName, "metric")),
    fetch(getAPILink(cityName, "imperial")),
  ]);
  const dataInMetricUnits = await metricUnitsPromise.json();
  const dataInImperialUnits = await imperialUnitsPromise.json();
  extractRequiredData(dataInMetricUnits, dataInImperialUnits);
};

const weatherDataModule = {
  execute: () => {
    pubsub.subscribe("getCityName", getWeatherData);
  },
};

export default weatherDataModule;