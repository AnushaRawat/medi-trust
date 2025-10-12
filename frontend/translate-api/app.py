from flask import Flask, request, jsonify
from flask_cors import CORS
import argostranslate.package
import argostranslate.translate

app = Flask(__name__)
CORS(app)  # ✅ Allow cross-origin requests (important for frontend integration)

@app.route('/translate', methods=['POST'])
def translate():
    data = request.get_json()
    text = data.get('text', '')
    from_lang = "en"
    to_lang = "hi"

    # 🧠 Perform translation
    translated_text = argostranslate.translate.translate(text, from_lang, to_lang)

    # 🪵 Debug logs
    print("🌐 Incoming text to translate:", text)
    print("🌐 Translated output:", translated_text)

    return jsonify({'translatedText': translated_text})

if __name__ == '__main__':
    app.run(port=4000)
