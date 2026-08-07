from flask import Flask, render_template, request, jsonify
from google import genai
from dotenv import load_dotenv
import os
import time

# Load environment variables
load_dotenv()

app = Flask(__name__)

# Get Gemini API key
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if not GEMINI_API_KEY:
    raise ValueError("GEMINI_API_KEY is missing from .env")

# Create Gemini client
client = genai.Client(api_key=GEMINI_API_KEY)


@app.route("/")
def home():
    return render_template("index.html")


@app.route("/chat", methods=["POST"])
def chat():

    try:

        data = request.get_json()

        user_message = data.get("message", "").strip()

        if not user_message:
            return jsonify({
                "response": "Please enter a message."
            })

        print("User:", user_message)

        # --------------------------------
        # TRY GEMINI 2.5 FLASH
        # --------------------------------

        models_to_try = [
            "gemini-3.5-flash-lite"
        ]

        last_error = None

        for model_name in models_to_try:

            for attempt in range(3):

                try:

                    print(
                        f"Trying {model_name} "
                        f"(attempt {attempt + 1})"
                    )

                    response = client.models.generate_content(
                        model=model_name,
                        contents=user_message
                    )

                    bot_response = response.text

                    print("AI:", bot_response)

                    return jsonify({
                        "response": bot_response
                    })

                except Exception as e:

                    last_error = e

                    error_text = str(e)

                    print(
                        f"Error from {model_name}: "
                        f"{error_text}"
                    )

                    # Retry only temporary errors
                    if (
                        "503" in error_text
                        or "UNAVAILABLE" in error_text
                        or "429" in error_text
                    ):

                        wait_time = 2 ** attempt

                        print(
                            f"Waiting {wait_time} seconds..."
                        )

                        time.sleep(wait_time)

                    else:

                        # Don't retry permanent errors
                        break

        # --------------------------------
        # ALL ATTEMPTS FAILED
        # --------------------------------

        print("Final Gemini error:", last_error)

        return jsonify({
            "response": (
                "Gemini is temporarily busy. "
                "Please try again in a few seconds."
            )
        }), 503


    except Exception as e:

        print("Application error:", str(e))

        return jsonify({
            "response": "Something went wrong. Please try again."
        }), 500


if __name__ == "__main__":

    app.run(
        debug=True,
        host="127.0.0.1",
        port=10000
    )