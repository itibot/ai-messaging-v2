import { GoogleGenerativeAI } from "@google/generative-ai";

async function diagnoseKey() {
    const apiKey = "AIzaSyCh0xtJJvz01ZuuBllPKM1phXweiIMflJE";
    console.log("Diagnosing API Key (first 5):", apiKey.substring(0, 5));

    try {
        // Note: The SDK doesn't have a direct listModels method on the genAI object themselves,
        // usually it's handled via the API directly or a specific endpoint.
        // However, we can try to fetch a very basic model info if possible.

        const genAI = new GoogleGenerativeAI(apiKey);

        // Test with the most basic possible request
        // Sometimes 404 means the model string is wrong or the API is disabled.
        console.log("Checking model 'gemini-1.5-flash'...");
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent("test");
        console.log("Success with gemini-1.5-flash");
    } catch (error) {
        console.error("DIAGNOSTICS ERROR:", error.message);
        if (error.message.includes("404")) {
            console.log("SUGGESTION: The Generative Language API might be disabled in the Google Cloud Console for this key, or the key is invalid.");
        }
    }
}

diagnoseKey();
