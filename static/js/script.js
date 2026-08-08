const chatBox = document.getElementById("chatBox");
const userInput = document.getElementById("userInput");
const themeButton = document.getElementById("themeButton");

async function sendMessage() {

    const message = userInput.value.trim();

    if (message === "") {
        return;
    }

    // Show user message
    addMessage(message, "user");

    userInput.value = "";

    // Show typing animation
    const typing = document.createElement("div");
    typing.className = "message bot-message";
    typing.id = "typing";

    typing.innerHTML = `
        <div class="typing">
            <span></span>
            <span></span>
            <span></span>
        </div>
    `;

    chatBox.appendChild(typing);
    scrollToBottom();

    try {

        console.log("Sending message:", message);

        const response = await fetch("/chat", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                message: message
            })
        });

        console.log("Server status:", response.status);

        const data = await response.json();

        console.log("Server response:", data);

        typing.remove();

        if (data.response) {

            addMessage(data.response, "bot");

        } else if (data.error) {

            addMessage("Error: " + data.error, "bot");

        } else {

            addMessage("No response received from the server.", "bot");
        }

    } catch (error) {

        console.error("Connection error:", error);

        typing.remove();

        addMessage(
            "Unable to connect to the server.",
            "bot"
        );
    }

    scrollToBottom();
}


function addMessage(text, sender) {

    const message = document.createElement("div");

    message.className =
        sender === "user"
            ? "message user-message"
            : "message bot-message";

    message.textContent = text;

    chatBox.appendChild(message);

    scrollToBottom();
}


function scrollToBottom() {

    chatBox.scrollTop = chatBox.scrollHeight;
}


// Press Enter to send
userInput.addEventListener("keydown", function(event) {

    if (event.key === "Enter") {

        event.preventDefault();

        sendMessage();
    }

});


// Dark mode
themeButton.addEventListener("click", function() {

    document.body.classList.toggle("dark-mode");

    if (document.body.classList.contains("dark-mode")) {

        themeButton.textContent = "☀️";

    } else {

        themeButton.textContent = "🌙";
    }

});