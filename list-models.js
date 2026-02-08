import { GoogleGenerativeAI } from "@google/generative-ai";

async function listModels() {
    const apiKey = "AIzaSyCh0xtJJvz01ZuuBllPKM1phXweiIMflJE";
    console.log("Listing models for key (first 5):", apiKey.substring(0, 5));

    try {
        // In @google/generative-ai, listModels is actually an async generator usually 
        // or a simple method depending on version. 
        // Let's try to fetch it.
        const genAI = new GoogleGenerativeAI(apiKey);

        // Some versions use this:
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
        const data = await response.json();

        if (data.models) {
            console.log("AVAILABLE MODELS:");
            data.models.forEach(m => console.log(`- ${m.name} (${m.displayName})`));
        } else {
            console.log("No models returned in response:", data);
        }
    } catch (error) {
        console.error("LIST MODELS ERROR:", error.message);
    }
}

listModels();
