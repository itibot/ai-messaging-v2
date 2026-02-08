import { GoogleGenerativeAI } from "@google/generative-ai";

async function testQuota() {
    const apiKey = "AIzaSyCh0xtJJvz01ZuuBllPKM1phXweiIMflJE";
    const genAI = new GoogleGenerativeAI(apiKey);

    const modelsToTest = [
        "gemini-2.5-flash",
        "gemini-2.0-flash-lite",
        "gemini-flash-latest",
        "gemini-pro-latest"
    ];

    for (const modelName of modelsToTest) {
        console.log(`Testing model: ${modelName}...`);
        try {
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent("test");
            const response = await result.response;
            console.log(`✅ SUCCESS with ${modelName}: ${response.text().substring(0, 20)}...`);
            break; // Stop at the first working one
        } catch (error) {
            console.log(`❌ FAILED with ${modelName}: ${error.message.substring(0, 100)}`);
        }
    }
}

testQuota();
