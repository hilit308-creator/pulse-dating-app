/**
 * Built-in location data for city/country autocomplete
 * No external API required
 */

export const COUNTRIES = [
  { code: 'IL', name: 'Israel', emoji: '🇮🇱' },
  { code: 'US', name: 'United States', emoji: '🇺🇸' },
  { code: 'GB', name: 'United Kingdom', emoji: '🇬🇧' },
  { code: 'CA', name: 'Canada', emoji: '🇨🇦' },
  { code: 'AU', name: 'Australia', emoji: '🇦🇺' },
  { code: 'DE', name: 'Germany', emoji: '🇩🇪' },
  { code: 'FR', name: 'France', emoji: '🇫🇷' },
  { code: 'ES', name: 'Spain', emoji: '🇪🇸' },
  { code: 'IT', name: 'Italy', emoji: '🇮🇹' },
  { code: 'NL', name: 'Netherlands', emoji: '🇳🇱' },
  { code: 'BE', name: 'Belgium', emoji: '🇧🇪' },
  { code: 'CH', name: 'Switzerland', emoji: '🇨🇭' },
  { code: 'AT', name: 'Austria', emoji: '🇦🇹' },
  { code: 'SE', name: 'Sweden', emoji: '🇸🇪' },
  { code: 'NO', name: 'Norway', emoji: '🇳🇴' },
  { code: 'DK', name: 'Denmark', emoji: '🇩🇰' },
  { code: 'FI', name: 'Finland', emoji: '🇫🇮' },
  { code: 'PL', name: 'Poland', emoji: '🇵🇱' },
  { code: 'CZ', name: 'Czech Republic', emoji: '🇨🇿' },
  { code: 'PT', name: 'Portugal', emoji: '🇵🇹' },
  { code: 'GR', name: 'Greece', emoji: '🇬🇷' },
  { code: 'IE', name: 'Ireland', emoji: '🇮🇪' },
  { code: 'NZ', name: 'New Zealand', emoji: '🇳🇿' },
  { code: 'SG', name: 'Singapore', emoji: '🇸🇬' },
  { code: 'JP', name: 'Japan', emoji: '🇯🇵' },
  { code: 'KR', name: 'South Korea', emoji: '🇰🇷' },
  { code: 'BR', name: 'Brazil', emoji: '🇧🇷' },
  { code: 'MX', name: 'Mexico', emoji: '🇲🇽' },
  { code: 'AR', name: 'Argentina', emoji: '🇦🇷' },
  { code: 'ZA', name: 'South Africa', emoji: '🇿🇦' },
  { code: 'AE', name: 'United Arab Emirates', emoji: '🇦🇪' },
  { code: 'IN', name: 'India', emoji: '🇮🇳' },
  { code: 'TH', name: 'Thailand', emoji: '🇹🇭' },
  { code: 'PH', name: 'Philippines', emoji: '🇵🇭' },
  { code: 'RU', name: 'Russia', emoji: '🇷🇺' },
  { code: 'UA', name: 'Ukraine', emoji: '🇺🇦' },
  { code: 'TR', name: 'Turkey', emoji: '🇹🇷' },
  { code: 'EG', name: 'Egypt', emoji: '🇪🇬' },
  { code: 'CY', name: 'Cyprus', emoji: '🇨🇾' },
];

export const CITIES_BY_COUNTRY = {
  IL: [
    'Tel Aviv', 'Jerusalem', 'Haifa', 'Rishon LeZion', 'Petah Tikva',
    'Ashdod', 'Netanya', 'Beer Sheva', 'Holon', 'Bnei Brak',
    'Ramat Gan', 'Bat Yam', 'Rehovot', 'Ashkelon', 'Herzliya',
    'Kfar Saba', 'Hadera', 'Modiin', 'Nazareth', 'Lod',
    'Ramla', 'Raanana', 'Givatayim', 'Eilat', 'Tiberias',
  ],
  US: [
    'New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix',
    'Philadelphia', 'San Antonio', 'San Diego', 'Dallas', 'San Jose',
    'Austin', 'Jacksonville', 'Fort Worth', 'Columbus', 'Charlotte',
    'San Francisco', 'Indianapolis', 'Seattle', 'Denver', 'Boston',
    'Miami', 'Atlanta', 'Las Vegas', 'Portland', 'Nashville',
  ],
  GB: [
    'London', 'Birmingham', 'Manchester', 'Leeds', 'Glasgow',
    'Liverpool', 'Newcastle', 'Sheffield', 'Bristol', 'Edinburgh',
    'Leicester', 'Coventry', 'Bradford', 'Cardiff', 'Belfast',
    'Nottingham', 'Brighton', 'Cambridge', 'Oxford', 'Reading',
  ],
  CA: [
    'Toronto', 'Montreal', 'Vancouver', 'Calgary', 'Edmonton',
    'Ottawa', 'Winnipeg', 'Quebec City', 'Hamilton', 'Victoria',
  ],
  AU: [
    'Sydney', 'Melbourne', 'Brisbane', 'Perth', 'Adelaide',
    'Gold Coast', 'Canberra', 'Newcastle', 'Hobart', 'Darwin',
  ],
  DE: [
    'Berlin', 'Hamburg', 'Munich', 'Cologne', 'Frankfurt',
    'Stuttgart', 'Düsseldorf', 'Leipzig', 'Dortmund', 'Essen',
  ],
  FR: [
    'Paris', 'Marseille', 'Lyon', 'Toulouse', 'Nice',
    'Nantes', 'Strasbourg', 'Montpellier', 'Bordeaux', 'Lille',
  ],
  ES: [
    'Madrid', 'Barcelona', 'Valencia', 'Seville', 'Zaragoza',
    'Málaga', 'Murcia', 'Palma', 'Bilbao', 'Alicante',
  ],
  IT: [
    'Rome', 'Milan', 'Naples', 'Turin', 'Palermo',
    'Genoa', 'Bologna', 'Florence', 'Venice', 'Verona',
  ],
  NL: [
    'Amsterdam', 'Rotterdam', 'The Hague', 'Utrecht', 'Eindhoven',
    'Tilburg', 'Groningen', 'Almere', 'Breda', 'Nijmegen',
  ],
  // Add more as needed - these are the most common
};

// Get all cities for a country
export const getCitiesForCountry = (countryCode) => {
  return CITIES_BY_COUNTRY[countryCode] || [];
};

// Search countries by name
export const searchCountries = (query) => {
  if (!query || query.length < 1) return [];
  const lowerQuery = query.toLowerCase();
  return COUNTRIES.filter(c => 
    c.name.toLowerCase().includes(lowerQuery)
  ).slice(0, 10);
};

// Search cities within a country
export const searchCities = (countryCode, query) => {
  const cities = CITIES_BY_COUNTRY[countryCode] || [];
  if (!query || query.length < 1) return cities.slice(0, 10);
  const lowerQuery = query.toLowerCase();
  return cities.filter(city => 
    city.toLowerCase().includes(lowerQuery)
  ).slice(0, 10);
};

// Format location for display
export const formatLocation = (city, countryCode) => {
  const country = COUNTRIES.find(c => c.code === countryCode);
  if (!country) return city || '';
  if (!city) return country.name;
  return `${city}, ${country.name}`;
};
