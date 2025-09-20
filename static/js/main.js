document.addEventListener('DOMContentLoaded', () => {
    // New: Welcome screen elements
    const welcomeScreen = document.getElementById('welcomeScreen');
    const mainContent = document.getElementById('mainContent');

    // Get all elements needed for the form and results
    const uploadForm = document.getElementById('uploadForm');
    const fileInput = document.getElementById('fileInput');
    const fileNameDisplay = document.getElementById('fileNameDisplay');
    const analyzeButton = document.getElementById('analyzeButton');
    const imagePreviewContainer = document.getElementById('imagePreview');
    const imagePreview = imagePreviewContainer.querySelector('img');
    const loadingMessage = document.getElementById('loadingMessage');
    const errorMessage = document.getElementById('errorMessage');
    const descriptionOutput = document.getElementById('descriptionOutput');
    const descriptionText = document.getElementById('descriptionText');
    const copyButton = document.getElementById('copyButton');
    const analyzationSuccessMessage = document.getElementById('analyzationSuccessMessage');

    // Get all elements for the action buttons
    const translateHindiBtn = document.getElementById('translateHindiBtn');
    const translateBengaliBtn = document.getElementById('translateBengaliBtn');
    const translateEnglishBtn = document.getElementById('translateEnglishBtn');
    const speakBtn = document.getElementById('speakBtn');
    const speakingRateInput = document.getElementById('speakingRate');

    // New: Global variable to store the current audio object
    let currentAudio = null;
    let currentLangCode = 'en-US'; // Set default language code

    // Fade out welcome screen after a delay
    setTimeout(() => {
        welcomeScreen.classList.add('hidden');
        mainContent.classList.remove('hidden');
    }, 2000); // Adjust time here (e.g., 2000ms = 2 seconds)


    // Event listener for file input change
    fileInput.addEventListener('change', () => {
        if (fileInput.files.length > 0) {
            const file = fileInput.files[0];
            fileNameDisplay.textContent = file.name;
            
            // Show image preview
            const reader = new FileReader();
            reader.onload = (e) => {
                imagePreview.src = e.target.result;
                imagePreviewContainer.classList.remove('hidden');
            };
            reader.readAsDataURL(file);
            
        } else {
            fileNameDisplay.textContent = 'No file chosen';
            imagePreviewContainer.classList.add('hidden');
        }
    });


    uploadForm.addEventListener('submit', async (event) => {
        event.preventDefault(); 

        const file = fileInput.files[0];
        if (!file) {
            errorMessage.textContent = 'Please select a file to upload.';
            errorMessage.classList.remove('hidden');
            return;
        }

        const formData = new FormData();
        formData.append('image', file);

        // Show loading state on button and hide previous results
        analyzeButton.classList.add('loading');
        loadingMessage.classList.remove('hidden');
        errorMessage.classList.add('hidden');
        descriptionOutput.classList.add('hidden');
        analyzationSuccessMessage.classList.add('hidden');

        try {
            const response = await fetch('/analyze_image', {
                method: 'POST',
                body: formData,
            });

            const result = await response.json();
            
            // CRITICAL FIX: Hide loading message immediately after API response is received
            loadingMessage.classList.add('hidden');

            if (response.ok) {
                descriptionText.textContent = result.description;
                descriptionOutput.classList.remove('hidden');
                analyzationSuccessMessage.classList.remove('hidden'); // Show success message
            } else {
                errorMessage.textContent = result.error || 'An unknown error occurred.';
                errorMessage.classList.remove('hidden');
            }
        } catch (error) {
            loadingMessage.classList.add('hidden'); // Hide on error
            errorMessage.textContent = 'An error occurred while connecting to the server.';
            errorMessage.classList.remove('hidden');
            console.error('Fetch error:', error);
        } finally {
            // Ensure both the button's loading state and the loading message are hidden
            analyzeButton.classList.remove('loading');
            loadingMessage.classList.add('hidden');
        }
    });


    copyButton.addEventListener('click', () => {
        const textToCopy = descriptionText.textContent;
        navigator.clipboard.writeText(textToCopy).then(() => {
            copyButton.textContent = 'Copied!';
            setTimeout(() => {
                copyButton.textContent = 'Copy Description';
            }, 2000);
        }).catch(err => {
            console.error('Failed to copy text: ', err);
        });
    });


    // Helper function to handle both translation and speech
    const translateAndSpeak = async (targetLang, button) => {
        const text = descriptionText.textContent;
        if (!text) return;

        if (currentAudio) {
            currentAudio.pause();
            currentAudio.currentTime = 0;
        }

        button.classList.add('loading');
        
        try {
            const response = await fetch('/translate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: text, target: targetLang }),
            });
            const result = await response.json();
            
            if (response.ok) {
                const translatedText = result.translation;
                descriptionText.textContent = translatedText;
                currentLangCode = targetLang; // Update the current language code
                
                const speakingRate = speakingRateInput.value;
                const ttsResponse = await fetch('/tts', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ text: translatedText, lang: targetLang, speakingRate: speakingRate }),
                });
                const ttsResult = await ttsResponse.json();

                if (ttsResponse.ok) {
                    const audioBlob = hexToBlob(ttsResult.audio, 'audio/mpeg');
                    const audioUrl = URL.createObjectURL(audioBlob);
                    const audio = new Audio(audioUrl);
                    currentAudio = audio;
                    audio.play();
                } else {
                    console.error('TTS error:', ttsResult.error);
                }
            } else {
                console.error('Translation error:', result.error);
            }
        } catch (error) {
            console.error('An error occurred during translation and speech:', error);
        } finally {
            button.classList.remove('loading');
        }
    };

    // Event listeners for translation buttons
    translateHindiBtn.addEventListener('click', () => translateAndSpeak('hi', translateHindiBtn));
    translateBengaliBtn.addEventListener('click', () => translateAndSpeak('bn', translateBengaliBtn));
    translateEnglishBtn.addEventListener('click', () => translateAndSpeak('en', translateEnglishBtn));


    // Event listener for Text-to-Speech
    speakBtn.addEventListener('click', async () => {
        const text = descriptionText.textContent;
        const speakingRate = speakingRateInput.value;
        if (!text) return;
        speakBtn.classList.add('loading');

        if (currentAudio) {
            currentAudio.pause();
            currentAudio.currentTime = 0;
        }

        try {
            const response = await fetch('/tts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: text, lang: currentLangCode, speakingRate: speakingRate }),
            });
            const result = await response.json();
            
            if (response.ok) {
                const audioBlob = hexToBlob(result.audio, 'audio/mpeg');
                const audioUrl = URL.createObjectURL(audioBlob);
                const audio = new Audio(audioUrl);
                currentAudio = audio;
                audio.play();
            }
        } catch (error) {
            console.error('Text-to-Speech error:', error);
        } finally {
            speakBtn.classList.remove('loading');
        }
    });
    
    function hexToBlob(hexString, mimeType) {
        const bytes = new Uint8Array(hexString.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));
        return new Blob([bytes], { type: mimeType });
    }
});