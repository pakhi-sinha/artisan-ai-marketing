# Artisan AI Marketing Generator

## Overview
This project automates the creation of marketing content for handmade crafts using **Google Cloud APIs**.  
It detects product features from images, generates descriptive marketing text, converts it into speech, and can transcribe the speech back into text.

The pipeline demonstrates a fully Google Cloud–based solution for artisans to quickly create engaging content for online marketing.

---

## Features
- **Vision API**: Detects features of handmade crafts from images (e.g., “wooden basket”, “hand-painted”).  
- **Vertex AI API (Gemini / Text Generation)**: Generates marketing text automatically based on detected labels.  
- **Translate API**: Optional support for generating descriptions in multiple languages.  
- **Text-to-Speech (TTS)**: Converts generated marketing descriptions into audio for multimedia marketing.  
- **Speech-to-Text (STT)**: Converts audio back into text for verification or further processing.

---

## Setup Instructions

1. **Create a Google Cloud service account** with access to:
   - Vision API  
   - Vertex AI API (Text Generation / Gemini)  
   - Translate API (optional)  
   - Text-to-Speech API  
   - Speech-to-Text API  

2. **Download the JSON key** for your service account. **Do NOT upload this file to GitHub.**

3. **Upload the JSON key** to Colab or your local environment.

4. **Set the environment variable** in Python/Colab:

```python
import os
os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = "your-service-account.json"

5. **Install required packages** : pip install google-cloud-vision google-cloud-translate google-cloud-texttospeech google-cloud-speech pydub vertexai
