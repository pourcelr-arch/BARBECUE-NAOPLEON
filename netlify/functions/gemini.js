exports.handler = async function (event, context) {
  // Récupère la clé API depuis les variables d'environnement sécurisées de Netlify
  const apiKey = process.env.GEMINI_API_KEY;
  const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;

  try {
    const { prompt, isJson } = JSON.parse(event.body);

    if (!prompt) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Le prompt est manquant." }),
      };
    }
    
    // Construit la requête pour l'API Gemini
    const payload = {
      contents: [{ parts: [{ text: prompt }] }],
    };

    if (isJson) {
      payload.generationConfig = { responseMimeType: "application/json" };
    }

    // Appelle l'API Gemini
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Erreur de l'API Gemini:", errorData);
      return {
        statusCode: response.status,
        body: JSON.stringify({ error: "Erreur lors de l'appel à l'API Gemini." }),
      };
    }

    const result = await response.json();
    const text = result.candidates[0].content.parts[0].text;

    // Renvoie la réponse au client (votre application)
    return {
      statusCode: 200,
      body: JSON.stringify({ text: text }),
    };

  } catch (error) {
    console.error("Erreur dans la fonction serverless:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Erreur interne du serveur." }),
    };
  }
};

