import axios from 'axios';

const CLIMATIQ_API_KEY = '12V8R6XJC55CZ8SY7EM19B33VG';
const CLIMATIQ_BASE_URL = 'https://beta3.api.climatiq.io';

interface ClimatiqResponse {
  co2e: number;
  co2e_unit: string;
  emission_factor: {
    activity_id: string;
    source: string;
    year: number;
    region: string;
  };
}

export async function calculateDataCenterImpact(
  region: string,
  energyUsage: number // in kWh
): Promise<{ co2e: number }> {
  try {
    const response = await axios.post(
      `${CLIMATIQ_BASE_URL}/estimate`,
      {
        emission_factor: {
          activity_id: "cloud_computing-processing-avg_cpu",
          source: "climatiq",
          region: region.toLowerCase()
        },
        parameters: {
          energy: energyUsage,
          energy_unit: "kWh"
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${CLIMATIQ_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const data = response.data as ClimatiqResponse;
    return { co2e: data.co2e };
  } catch (error) {
    console.error('Error calculating data center impact:', error);
    // Fallback to estimated values if API call fails
    const fallbackIntensity = {
      'fr': 0.085,
      'us': 0.385,
      'us-west': 0.275,
      'eu': 0.231
    }[region.toLowerCase()] || 0.275;
    
    return { co2e: energyUsage * fallbackIntensity };
  }
}