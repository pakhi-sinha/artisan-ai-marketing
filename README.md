# 🎨 ArtisanAide

[![Live Demo](https://img.shields.io/badge/Live-Demo-brightgreen?style=for-the-badge)](https://artisan-ai-project-774216645801.us-central1.run.app/)

[![Python](https://img.shields.io/badge/Python-3.9%2B-blue.svg)](https://www.python.org/downloads/)
[![Flask](https://img.shields.io/badge/Flask-2.0%2B-green.svg)](https://flask.palletsprojects.com/)
[![Google Cloud](https://img.shields.io/badge/Google-Cloud-orange.svg)](https://cloud.google.com/)

ArtisanAide is a web application designed to empower artisans by leveraging the power of Google's Generative AI. Built with Flask and integrated with multiple Google Cloud services, this tool provides a suite of features to analyze images, translate languages, and interact via voice.



---

## ✨ Core Features

* **AI-Powered Vision:** Analyzes images using the **Vertex AI Gemini Pro Vision** model to provide rich descriptions and insights.
* **Multilingual Translation:** Utilizes the **Google Translate API** to break down language barriers.
* **Text-to-Speech:** Converts generated text into natural-sounding speech for enhanced accessibility using the **Google Text-to-Speech API**.
* **Speech Recognition:** Allows users to interact with the application using their voice, powered by the **Google Speech-to-Text API**.
* **Generative AI Core:** Powered by the **Gemini 2.5 Pro** model for intelligent and context-aware responses.

---

## 🛠️ Tech Stack

* **Backend:** Flask
* **Primary Language:** Python
* **Google Cloud Services:**
    * Vertex AI (Gemini 2.5 Pro, Gemini Pro Vision)
    * Cloud Translate API
    * Cloud Text-to-Speech API
    * Cloud Speech-to-Text API
* **Deployment:** Google Cloud Run (via Buildpacks)

---

## 🚀 Getting Started

Follow these instructions to get a copy of the project up and running on your local machine.

### Prerequisites

* Python 3.9 or higher
* A Google Cloud Platform (GCP) project with the necessary APIs enabled.
* A GCP service account key (`.json` file) with appropriate permissions.

### Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/pakhi-sinha/artisan-ai-marketing.git](https://github.com/pakhi-sinha/artisan-ai-marketing.git)
    cd artisan-ai-marketing
    ```

2.  **Create and activate a virtual environment:**

    * On macOS/Linux:
        ```bash
        python3 -m venv venv
        source venv/bin/activate
        ```
    * On Windows:
        ```bash
        python -m venv venv
        .\venv\Scripts\activate
        ```

3.  **Install the required dependencies:**
    ```bash
    pip install -r requirements.txt
    ```

4.  **Configure Google Cloud Credentials:**

    **IMPORTANT:** Your service account `.json` key file is a secret and should never be committed to Git. The `.gitignore` file in this project is already configured to ignore `.json` files.

    Make your key file available to the application by setting an environment variable. Rename your key file to `service_account.json` and place it in the project's root directory. The application is coded to look for this specific file name.

5.  **Run the application:**
    ```bash
    flask run
    ```

    The application will be available at `http://127.0.0.1:5000`.

---

## 📄 License

This project is licensed under the MIT License.