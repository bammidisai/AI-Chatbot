document.addEventListener("DOMContentLoaded", function () {

    console.log("JavaScript loaded successfully");


    // --------------------------------
    // GET HTML ELEMENTS
    // --------------------------------

    const userInput = document.getElementById("userInput");
    const sendButton = document.getElementById("sendButton");
    const chatBox = document.getElementById("chatBox");

    const newChatButton =
        document.getElementById("newChatButton");

    const clearHistoryButton =
        document.getElementById("clearHistoryButton");

    const themeButton =
        document.getElementById("themeButton");


    // --------------------------------
    // CHECK ELEMENTS
    // --------------------------------

    if (!userInput) {
        console.error("userInput not found");
        return;
    }

    if (!sendButton) {
        console.error("sendButton not found");
        return;
    }

    if (!chatBox) {
        console.error("chatBox not found");
        return;
    }


    // --------------------------------
    // PREVENT DUPLICATE REQUESTS
    // --------------------------------

    let isSending = false;


    // --------------------------------
    // ADD MESSAGE TO CHAT
    // --------------------------------

    function addMessage(text, type) {

        const messageDiv =
            document.createElement("div");

        messageDiv.className =
            "message " + type;

        messageDiv.textContent = text;

        chatBox.appendChild(messageDiv);

        chatBox.scrollTop =
            chatBox.scrollHeight;

        return messageDiv;
    }


    // --------------------------------
    // TYPING MESSAGE
    // --------------------------------

    function showTyping() {

        const typingDiv =
            document.createElement("div");

        typingDiv.className =
            "message bot-message";

        typingDiv.id =
            "typingMessage";

        typingDiv.innerHTML = `
            <div class="typing">
                <span></span>
                <span></span>
                <span></span>
            </div>
        `;

        chatBox.appendChild(typingDiv);

        chatBox.scrollTop =
            chatBox.scrollHeight;
    }


    // --------------------------------
    // REMOVE TYPING
    // --------------------------------

    function removeTyping() {

        const typing =
            document.getElementById("typingMessage");

        if (typing) {
            typing.remove();
        }
    }


    // --------------------------------
    // SEND MESSAGE
    // --------------------------------

    async function sendMessage() {

        // IMPORTANT:
        // Don't send another request
        // while one is already running.

        if (isSending) {
            console.log("Request already running.");
            return;
        }


        const message =
            userInput.value.trim();


        if (!message) {
            return;
        }


        // Lock sending
        isSending = true;

        sendButton.disabled = true;


        // Show user message
        addMessage(
            message,
            "user-message"
        );


        // Clear input
        userInput.value = "";


        // Show typing
        showTyping();


        try {

            console.log(
                "Sending ONE request:",
                message
            );


            // --------------------------------
            // ONLY ONE FETCH REQUEST
            // --------------------------------

            const response =
                await fetch("/chat", {

                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        message: message
                    })
                });


            console.log(
                "HTTP Status:",
                response.status
            );


            // Get JSON response
            const data =
                await response.json();


            console.log(
                "Server response:",
                data
            );


            // Remove typing
            removeTyping();


            // --------------------------------
            // QUOTA ERROR
            // --------------------------------

            if (response.status === 429) {

                addMessage(
                    data.response ||
                    "Gemini API quota exceeded. Please try again later.",
                    "bot-message"
                );

                return;
            }


            // --------------------------------
            // OTHER SERVER ERROR
            // --------------------------------

            if (!response.ok) {

                addMessage(
                    data.response ||
                    "Server error. Please try again.",
                    "bot-message"
                );

                return;
            }


            // --------------------------------
            // NORMAL RESPONSE
            // --------------------------------

            addMessage(
                data.response ||
                "No response received.",
                "bot-message"
            );


        } catch (error) {

            console.error(
                "Fetch error:",
                error
            );


            removeTyping();


            addMessage(
                "Unable to connect to the server.",
                "bot-message"
            );


        } finally {

            // Unlock sending
            isSending = false;

            sendButton.disabled = false;

            userInput.focus();
        }
    }


    // --------------------------------
    // SEND BUTTON
    // --------------------------------

    sendButton.addEventListener(
        "click",
        function (event) {

            event.preventDefault();

            sendMessage();
        }
    );


    // --------------------------------
    // ENTER KEY
    // --------------------------------

    userInput.addEventListener(
        "keydown",
        function (event) {

            if (event.key === "Enter") {

                event.preventDefault();

                sendMessage();
            }
        }
    );


    // --------------------------------
    // NEW CHAT
    // --------------------------------

    if (newChatButton) {

        newChatButton.addEventListener(
            "click",
            function () {

                chatBox.innerHTML = `
                    <div class="message bot-message">
                        Hello! 👋<br><br>
                        I'm your AI assistant.
                        How can I help you today?
                    </div>
                `;

                userInput.value = "";

                userInput.focus();
            }
        );
    }


    // --------------------------------
    // CLEAR HISTORY
    // --------------------------------

    if (clearHistoryButton) {

        clearHistoryButton.addEventListener(
            "click",
            function () {

                chatBox.innerHTML = "";

                localStorage.removeItem(
                    "chatHistory"
                );

                userInput.value = "";

                userInput.focus();
            }
        );
    }


    // --------------------------------
    // DARK MODE
    // --------------------------------

    if (themeButton) {

        themeButton.addEventListener(
            "click",
            function () {

                document.body.classList.toggle(
                    "dark-mode"
                );

                if (
                    document.body.classList.contains(
                        "dark-mode"
                    )
                ) {

                    themeButton.textContent = "☀️";

                } else {

                    themeButton.textContent = "🌙";
                }
            }
        );
    }

});