import { GoogleGenerativeAI } from "@google/generative-ai";
import { supabase } from './supabase';

export const generateWorkshopIdeas = async (theme: string) => {
    // 1. Try fetching from Database (Admin Panel)
    let API_KEY = '';
    try {
        const { data } = await supabase.from('system_settings').select('value').eq('key', 'gemini_api_key').single();
        if (data?.value) API_KEY = data.value.trim();
    } catch (e) {
        console.warn('Failed to fetch API key from DB, falling back to ENV');
    }

    // 2. Fallback to Env
    if (!API_KEY) {
        API_KEY = import.meta.env.VITE_GEMINI_API_KEY?.trim();
    }

    if (!API_KEY) {
        throw new Error("Chave API não configurada! Adicione em 'Administração > Configurações' ou no arquivo .env");
    }

    // List of models to try in order of preference
    const models = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-flash-latest", "gemini-1.5-flash", "gemini-1.5-flash-latest", "gemini-1.5-flash-001", "gemini-pro", "gemini-1.0-pro"];

    let lastError;

    for (const modelName of models) {
        try {
            console.log(`Trying AI model: ${modelName}...`);
            const genAI = new GoogleGenerativeAI(API_KEY);
            const model = genAI.getGenerativeModel({ model: modelName });

            const prompt = `Crie 3 ideias de oficinas criativas e práticas para o tema: "${theme}". 
            O público alvo são alunos de um curso técnico (Ensino Médio).
            Retorne APENAS um JSON array neste formato, sem markdown:
            [
                { "title": "Titulo da Oficina", "description": "Descrição curta e atrativa (max 200 caracteres)" }
            ]`;

            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();

            console.log("AI Raw Response:", text);

            // Robust JSON extraction
            let jsonString = text.replace(/```json/g, '').replace(/```/g, '').trim();
            const firstBracket = jsonString.indexOf('[');
            const lastBracket = jsonString.lastIndexOf(']');
            if (firstBracket !== -1 && lastBracket !== -1) {
                jsonString = jsonString.substring(firstBracket, lastBracket + 1);
            }

            try {
                return JSON.parse(jsonString);
            } catch (e) {
                // Fallback: Return a single item if parsing fails, trying to salvage text
                return [{ title: "Sugestão da IA", description: text.slice(0, 200) }];
            }

        } catch (error: any) {
            console.warn(`Model ${modelName} failed:`, error.message);
            lastError = error;
            // Continue to next model
        }
    }

    // If all failed, try to list actual available models to debug
    try {
        console.log("Attempting to list available models...");
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`);
        const data = await response.json();
        console.log("AVAILABLE MODELS:", data);
        if (data.models) {
            const names = data.models.map((m: any) => m.name);
            console.log("Model Names:", names);
            if (names.length > 0) {
                throw new Error(`Modelos disponíveis encontrados: ${names.join(', ')}. Mas nenhum dos tentados funcionou.`);
            }
        }
    } catch (debugError) {
        console.error("Failed to list models:", debugError);
    }

    console.error("All models failed. Last error:", lastError);
    if (lastError?.message?.includes('404')) {
        throw new Error("Erro 404: Modelos não encontrados. Verifique no Console (F12) a lista de 'AVAILABLE MODELS' para ver o que sua chave permite acessar.");
    }
    throw lastError;
};

export const testConnection = async (providedKey?: string) => {
    try {
        let API_KEY = providedKey?.trim() || '';

        if (!API_KEY) {
            try {
                const { data } = await supabase.from('system_settings').select('value').eq('key', 'gemini_api_key').single();
                if (data?.value) API_KEY = data.value.trim();
            } catch (e) { console.warn('DB Fetch failed'); }
        }

        if (!API_KEY) API_KEY = import.meta.env.VITE_GEMINI_API_KEY?.trim() || '';

        if (!API_KEY) {
            return { success: false, error: "Nenhuma chave encontrada (digite no campo ou salve primeiro)." };
        }

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`);
        if (!response.ok) {
            const errText = await response.text();
            throw new Error(`Erro HTTP ${response.status}: ${errText}`);
        }

        const data = await response.json();

        if (!data.models) throw new Error("Resposta inválida da API (sem lista de modelos)");

        const modelNames = data.models.map((m: any) => m.name.replace('models/', ''));
        return { success: true, models: modelNames };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
};
