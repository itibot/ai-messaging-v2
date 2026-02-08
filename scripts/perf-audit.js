
import { ChatOrchestrator } from '../src/services/geminiService.js';
import dotenv from 'dotenv';
dotenv.config();

// Mock importMeta if needed for compatibility
if (!global.import) {
    global.import = { meta: { env: process.env } };
}

async function audit() {
    const orchestrator = new ChatOrchestrator();

    const tests = [
        { name: "Simple Greeting", prompt: "Hello" },
        { name: "Complex Strategy", prompt: "Should I captain Haaland or Salah next week?" }
    ];

    for (const test of tests) {
        console.log(`\n🚀 Starting Test: ${test.name}`);
        const start = Date.now();
        try {
            const response = await orchestrator.sendMessage(test.prompt);
            const end = Date.now();
            console.log(`✅ Completed in: ${(end - start) / 1000}s`);
            console.log(`📝 Response Preview: ${response.text.substring(0, 100)}...`);
        } catch (e) {
            console.error(`❌ Test Failed: ${e.message}`);
        }
    }
}

audit();
