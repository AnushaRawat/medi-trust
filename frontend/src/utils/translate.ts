// frontend/src/utils/translate.ts

export async function translateTextViaLocalAPI(text: string): Promise<string> {
    try {
      const response = await fetch("http://localhost:4000/translate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ text })
      });
  
      if (!response.ok) {
        const error = await response.json();
        console.error("❌ API returned:", error);
        throw new Error("Translation API error: " + response.status);
      }
  
      const data = await response.json();
      return data.translatedText;
    } catch (err) {
      console.error("❌ Translation failed:", err);
      throw err;
    }
  }
  
  