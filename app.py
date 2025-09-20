# app.py

import vertexai
from vertexai.generative_models import GenerativeModel, Part
from flask import Flask, render_template, request, jsonify
import os
import io
from google.cloud import vision, translate_v2 as translate, texttospeech, speech
from google.cloud.speech import RecognitionConfig, RecognitionAudio

# ----- IMPORTANT: Update these values -----
PROJECT_ID = "artisan-ai-project"
LOCATION = "us-central1"
# Make sure this path is correct if you are using a local service account file
VISION_KEY = "artisan-ai-project-56cbb2e01ab4.json"

vision_client = vision.ImageAnnotatorClient.from_service_account_json(VISION_KEY)
translate_client = translate.Client.from_service_account_json(VISION_KEY)
tts_client = texttospeech.TextToSpeechClient.from_service_account_json(VISION_KEY)
speech_client = speech.SpeechClient.from_service_account_json(VISION_KEY)

# Initialize Vertex AI for the Gemini model
vertexai.init(project=PROJECT_ID, location=LOCATION)
gemini_model = GenerativeModel("gemini-2.5-pro")

# --- Flask App ---
app = Flask(__name__)

# Route to serve the main HTML page
@app.route('/')
def index():
    return render_template("index.html")

# Route to handle image analysis and description generation
@app.route('/analyze_image', methods=['POST'])
def analyze_image():
    if 'image' not in request.files:
        return jsonify({"error": "No image uploaded"}), 400

    content = request.files['image']
    
    try:
        image_content = content.read()
        image_bytes = vision.Image(content=image_content)
        
        response = vision_client.label_detection(image=image_bytes)
        labels = response.label_annotations
        labels_text = ", ".join([label.description for label in labels])

        prompt = f"Write a professional marketing description for a handmade craft with the following labels: {labels_text}"
        image_part = Part.from_data(data=io.BytesIO(image_content).getvalue(), mime_type="image/jpeg")
        
        gemini_response = gemini_model.generate_content([image_part, prompt])
        description = gemini_response.text

        return jsonify({
            "success": True,
            "description": description,
            "labels": labels_text
        })

    except Exception as e:
        print(f"An error occurred: {e}")
        return jsonify({"error": str(e)}), 500

# New: Route for Text-to-Speech
@app.route('/tts', methods=['POST'])
def text_to_speech():
    data = request.json
    text = data.get('text')
    lang_code = data.get('lang', 'en')
    speaking_rate = float(data.get('speakingRate', 1.0))

    if not text:
        return jsonify({"error": "No text provided"}), 400
    
    try:
        # Map language codes to humane voice names
        voice_map = {
            "en": "en-US-Neural2-F",
            "hi": "hi-IN-Wavenet-A",
            "bn": "bn-IN-Wavenet-A",
        }

        # Select a voice based on the language code from the frontend
        voice_name = voice_map.get(lang_code, "en-US-Neural2-F")

        ssml_text = f"<speak><prosody rate='{speaking_rate}'>{text}</prosody></speak>"
        synthesis_input = texttospeech.SynthesisInput(ssml=ssml_text)
        
        voice = texttospeech.VoiceSelectionParams(
            language_code=lang_code,
            name=voice_name
        )
        
        audio_config = texttospeech.AudioConfig(
            audio_encoding=texttospeech.AudioEncoding.MP3
        )
        
        response = tts_client.synthesize_speech(
            input=synthesis_input,
            voice=voice,
            audio_config=audio_config
        )
        
        audio_content = response.audio_content.hex()
        return jsonify({"success": True, "audio": audio_content})

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# New: Route for Text Translation
@app.route('/translate', methods=['POST'])
def translate_text():
    data = request.json
    text = data.get('text')
    target_lang = data.get('target', 'bn')

    if not text:
        return jsonify({"error": "No text provided"}), 400
    
    try:
        result = translate_client.translate(
            text,
            target_language=target_lang
        )
        return jsonify({"success": True, "translation": result['translatedText']})

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# New: Route for Speech-to-Text
@app.route('/stt', methods=['POST'])
def speech_to_text():
    if 'audio' not in request.files:
        return jsonify({"error": "No audio file provided"}), 400
    
    audio_file = request.files['audio']
    
    try:
        audio_content = audio_file.read()
        audio = RecognitionAudio(content=audio_content)
        config = RecognitionConfig(
            encoding=RecognitionConfig.AudioEncoding.MP3,
            language_code="en-US"
        )
        
        response = speech_client.recognize(config=config, audio=audio)
        transcribed_text = ""
        for result in response.results:
            transcribed_text += result.alternatives[0].transcript
            
        return jsonify({"success": True, "transcript": transcribed_text})

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, use_reloader=False, port=os.environ.get("PORT", 5000))