
import { GoogleGenAI, Type } from "@google/genai";
import { Flight, FlightInsight, AirportBoard } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getFlightInsight = async (flight: Flight): Promise<FlightInsight> => {
  const prompt = `Pesquise informações REAIS sobre este voo:
  Indicativo (Callsign): ${flight.callsign}
  Aeronave ICAO24: ${flight.icao24}
  
  Retorne um JSON em PORTUGUÊS com:
  1. O modelo exato da aeronave.
  2. Origem (Cidade ou Aeroporto IATA).
  3. Destino (Cidade ou Aeroporto IATA).
  4. Coordenadas do destino (latitude e longitude decimais aproximadas do aeroporto).
  5. Um resumo do voo (companhia aérea e contexto).
  6. Horários (Saída Estimada, Saída Real, Chegada Estimada, Chegada Real).
  7. Uma URL de imagem representativa do modelo da aeronave.
  8. Um fato curioso sobre este modelo ou rota.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            origin: { type: Type.STRING },
            destination: { type: Type.STRING },
            destinationCoords: {
              type: Type.OBJECT,
              properties: {
                lat: { type: Type.NUMBER },
                lng: { type: Type.NUMBER }
              },
              required: ["lat", "lng"]
            },
            funFact: { type: Type.STRING },
            aircraftTypeGuess: { type: Type.STRING },
            imageUrl: { type: Type.STRING },
            schedule: {
              type: Type.OBJECT,
              properties: {
                departureEstimated: { type: Type.STRING },
                departureActual: { type: Type.STRING },
                arrivalEstimated: { type: Type.STRING },
                arrivalActual: { type: Type.STRING }
              },
              required: ["departureEstimated", "departureActual", "arrivalEstimated", "arrivalActual"]
            }
          },
          required: ["summary", "origin", "destination", "funFact", "aircraftTypeGuess", "schedule"]
        }
      }
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error("Erro no insight do Gemini:", error);
    return {
      summary: `Voo ${flight.callsign} operando no espaço aéreo de ${flight.originCountry}.`,
      origin: "Desconhecido",
      destination: "Desconhecido",
      funFact: "A maioria dos dados de radar vem de receptores ADS-B mantidos por voluntários.",
      aircraftTypeGuess: "Aeronave Comercial",
      schedule: {
        departureEstimated: "--:--",
        departureActual: "--:--",
        arrivalEstimated: "--:--",
        arrivalActual: "--:--"
      }
    };
  }
};

export const getAirportBoard = async (iata: string, airportName: string): Promise<AirportBoard> => {
  const prompt = `Pesquise o quadro de voos em tempo real para o aeroporto ${airportName} (${iata}).
  Gere uma lista de voos REAIS (ou altamente prováveis para o horário atual) que inclua:
  - Voos "Em curso" (já decolaram ou estão pousando agora)
  - Voos "Estimados" (previstos para os próximos 30-60 min)
  - Voos "Próximos" (agendados para mais tarde hoje)
  
  Retorne um JSON com o nome do aeroporto, cidade e uma lista de voos com: callsign, airline, status (Em curso/Estimado/Próximo), type (Partida/Chegada), time (formato HH:MM) e destinationOrigin (Cidade/País).`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            airportName: { type: Type.STRING },
            city: { type: Type.STRING },
            flights: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  callsign: { type: Type.STRING },
                  airline: { type: Type.STRING },
                  status: { type: Type.STRING, enum: ["Em curso", "Estimado", "Próximo"] },
                  type: { type: Type.STRING, enum: ["Partida", "Chegada"] },
                  time: { type: Type.STRING },
                  destinationOrigin: { type: Type.STRING }
                },
                required: ["callsign", "airline", "status", "type", "time", "destinationOrigin"]
              }
            }
          },
          required: ["airportName", "city", "flights"]
        }
      }
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error("Erro ao carregar quadro do aeroporto:", error);
    return {
      airportName: airportName,
      city: "Brasil",
      flights: []
    };
  }
};
