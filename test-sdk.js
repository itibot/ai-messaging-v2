import { GoogleGenerativeAI } from "@google/generative-ai";

async function testSDK() {
    // Key from .env.local
    const apiKey = "AIzaSyCh0xtJJvz01ZuuBllPKM1phXweiIMflJE";
    console.log("Using API Key (first 5):", apiKey.substring(0, 5));

    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        // Try a more generic model name if gemini-1.5-flash is having issues with versioning
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        console.log("Sending test message...");
        const result = await model.generateContent("Hello!");
        const response = await result.response;
        console.log("Response text:", response.text());
        console.log("SUCCESS: SDK is functional.");
    } catch (error) {
        console.error("FAILURE: SDK test failed:", error);
        if (error.status === 404) {
            console.log("Retrying with gemini-pro...");
            try {
                const genAI = new GoogleGenerativeAI(apiKey);
                const model = genAI.getGenerativeModel({ model: "gemini-pro" });
                const result = await model.generateContent("Hello!");
                const response = await result.response;
                console.log("Response text:", response.text());
                console.log("SUCCESS: SDK is functional with gemini-pro.");
            } catch (err) {
                console.error("FAILURE: SDK test failed with fallback too.");
            }
        }
    }
}

testSDK();
