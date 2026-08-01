import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware for JSON body parsing with higher payload limit for camera images
  app.use(express.json({ limit: "15mb" }));

  // API Health Endpoint
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", service: "Aventura Posicional Math Server" });
  });

  // AI Worksheet Grading Endpoint using Gemini Vision API
  app.post("/api/grade-worksheet", async (req, res) => {
    try {
      const { imageBase64, mimeType = "image/jpeg", expectedAnswers } = req.body;

      if (!imageBase64) {
        return res.status(400).json({
          error: "No image provided. Please capture or upload a worksheet photo.",
        });
      }

      if (!Array.isArray(expectedAnswers) || expectedAnswers.length === 0) {
        return res.status(400).json({
          error: "Invalid or missing expectedAnswers array.",
        });
      }

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({
          error: "GEMINI_API_KEY environment variable is missing on the server.",
        });
      }

      // Clean base64 string if it contains data URI prefix
      const cleanBase64 = imageBase64.includes(",")
        ? imageBase64.split(",")[1]
        : imageBase64;

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });

      const promptText = `
Analiza detenidamente esta fotografía de una ficha impresa de ejercicios de matemáticas.
El estudiante ha resuelto a mano o con números los ejercicios en la ficha.

A continuación está la lista de respuestas correctas esperadas para cada ejercicio de la ficha:
${JSON.stringify(expectedAnswers, null, 2)}

INSTRUCCIONES DE VERIFICACIÓN:
1. Para cada ejercicio (del #1 al #${expectedAnswers.length}), localiza la sección correspondiente en la hoja de trabajo.
2. Identifica con precisión los números finales o parciales escritos en las casillas de resultado del estudiante.
3. Si la escritura del estudiante está clara o parcialmente borrosa, determina el número más probable escrito.
4. Compara el número detectado con el resultado esperado de la clave de respuestas.
5. Determina si el ejercicio es correcto ('isCorrect': true) o incorrecto ('isCorrect': false).
6. Calcula la cantidad total de aciertos, el porcentaje de precisión (0 a 100) y asigna los puntos ganados (hasta 300 estrellas en proporción a la precisión).
`;

      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: [
          {
            inlineData: {
              mimeType,
              data: cleanBase64,
            },
          },
          {
            text: promptText,
          },
        ],
        config: {
          systemInstruction:
            "Eres un profesor experto en corrección visual de tareas escolares. Evalúas con precisión óptica los números escritos a mano en fichas de cálculo de valor posicional.",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              evaluatedExercises: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.INTEGER, description: "Número de ejercicio (1..12)" },
                    detectedAnswer: { type: Type.INTEGER, description: "Número escrito/resuelto que detectaste en la imagen" },
                    expectedAnswer: { type: Type.INTEGER, description: "Número respuesta correcta esperada" },
                    isCorrect: { type: Type.BOOLEAN, description: "True si el número detectado es igual a la respuesta esperada" },
                    confidence: { type: Type.STRING, description: "Confianza: 'alta', 'media' o 'baja'" },
                    notes: { type: Type.STRING, description: "Observación breve" },
                  },
                  required: ["id", "detectedAnswer", "expectedAnswer", "isCorrect"],
                },
              },
              totalCorrect: { type: Type.INTEGER },
              totalExercises: { type: Type.INTEGER },
              percentage: { type: Type.INTEGER },
              awardedPoints: { type: Type.INTEGER },
            },
            required: [
              "evaluatedExercises",
              "totalCorrect",
              "totalExercises",
              "percentage",
              "awardedPoints",
            ],
          },
        },
      });

      const responseText = response.text;
      if (!responseText) {
        throw new Error("Empty response from Gemini API");
      }

      const parsedData = JSON.parse(responseText);
      return res.json(parsedData);
    } catch (err: any) {
      console.error("Error in /api/grade-worksheet:", err);
      return res.status(500).json({
        error: "No se pudo realizar el análisis visual con la IA: " + (err.message || err.toString()),
      });
    }
  });

  // Vite middleware for development vs static serve for production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
