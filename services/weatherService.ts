
export const fetchTemperature = async (lat: number, lng: number): Promise<number | null> => {
  try {
    const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current_weather=true`);
    if (!response.ok) return null;
    const data = await response.json();
    return data.current_weather?.temperature || null;
  } catch (error) {
    console.error("Erro ao buscar clima:", error);
    return null;
  }
};
