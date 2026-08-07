// ================================
// GET HTML ELEMENTS
// ================================

const chatBox = document.getElementById("chatBox");
const userInput = document.getElementById("userInput");
const sendButton = document.getElementById("sendButton");

const themeButton = document.getElementById("themeButton");
const newChatButton = document.getElementById("newChatButton");
const historyList = document.getElementById("historyList");


// ================================
// CHAT DATA
// ================================

let chats = JSON.parse(
    localStorage.getItem("aiChats")
) || [];

let currentChat = [];


// ================================
// SEND MESSAGE
// ================================

async function sendMessage() {

    const message = userInput.value.trim();

    if (message === "") {
        return;
    }

    // Show user message
    addMessage(message, "user-message");

    userInput.value = "";

    userInput.focus();

    // Save user message
    currentChat.push({
        sender: "user",
        text: message
    });

    // Typing animation
    const typingMessage = document.createElement("div");

    typingMessage.className = "message bot-message";
    typingMessage.id = "typingMessage";

    typingMessage.innerHTML = `
        <div class="typing">
            <span></span>
            <span></span>
            <span></span>
        </div>
    `;

    chatBox.appendChild(typingMessage);

    scrollToBottom();


    try {
    const response = await fetch("/chat", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            message: userMessage
        })
    });

    const data = await response.json();

    console.log("AI Response:", data);

    // Display AI answer
    addMessage(data.response, "bot");

   } catch (error) {
    console.error("Chat error:", error);
    addMessage("Sorry, something went wrong. Please try again.", "bot");
   }
}


// ================================
// ADD MESSAGE
// ================================

function addMessage(text, className) {

    const messageDiv =
        document.createElement("div");

    messageDiv.className =
        `message ${className}`;

    messageDiv.innerText = text;

    chatBox.appendChild(messageDiv);

    scrollToBottom();
}


// ================================
// ENTER KEY
// ================================

userInput.addEventListener(
    "keydown",
    function(event) {

        if (event.key === "Enter") {

            event.preventDefault();

            sendMessage();
        }

    }
);


// ================================
// SCROLL
// ================================

function scrollToBottom() {

    chatBox.scrollTop =
        chatBox.scrollHeight;
}


// ================================
// SAVE CHAT HISTORY
// ================================

function saveCurrentChat() {

    if (currentChat.length === 0) {
        return;
    }


    const firstMessage =
        currentChat.find(
            message => message.sender === "user"
        );


    const title =
        firstMessage
            ? firstMessage.text.substring(0, 30)
            : "New Chat";


    const chatObject = {

        id: Date.now(),

        title: title,

        messages: currentChat
    };


    chats.push(chatObject);


    localStorage.setItem(
        "aiChats",
        JSON.stringify(chats)
    );


    currentChat = [];

    loadHistory();
}


// ================================
// LOAD HISTORY
// ================================

function loadHistory() {

    historyList.innerHTML = "";


    if (chats.length === 0) {

        historyList.innerHTML = `
            <div class="history-item">
                New Chat
            </div>
        `;

        return;
    }


    chats
        .slice()
        .reverse()
        .forEach(chat => {

            const item =
                document.createElement("div");

            item.className =
                "history-item";

            item.innerHTML =
                `💬 ${chat.title}`;


            item.addEventListener(
                "click",
                function() {

                    openChat(chat);

                }
            );


            historyList.appendChild(item);

        });
}


// ================================
// OPEN OLD CHAT
// ================================

function openChat(chat) {

    chatBox.innerHTML = "";

    chat.messages.forEach(message => {

        addMessage(
            message.text,
            message.sender === "user"
                ? "user-message"
                : "bot-message"
        );

    });

    currentChat = [];
}


// ================================
// NEW CHAT
// ================================

newChatButton.addEventListener(
    "click",
    function() {

        currentChat = [];

        chatBox.innerHTML = `

            <div class="message bot-message">

                Hello! 👋<br><br>

                I'm your AI assistant.
                How can I help you today?

            </div>

        `;

        userInput.focus();

    }
);


// ================================
// DARK MODE
// ================================

themeButton.addEventListener(
    "click",
    function() {

        document.body.classList.toggle(
            "dark-mode"
        );


        if (
            document.body.classList.contains(
                "dark-mode"
            )
        ) {

            themeButton.innerText = "☀️";

            localStorage.setItem(
                "theme",
                "dark"
            );

        } else {

            themeButton.innerText = "🌙";

            localStorage.setItem(
                "theme",
                "light"
            );
        }

    }
);


// ================================
// LOAD SAVED THEME
// ================================

if (
    localStorage.getItem("theme") === "dark"
) {

    document.body.classList.add(
        "dark-mode"
    );

    themeButton.innerText = "☀️";
}


// ================================
// LOAD CHAT HISTORY
// ================================

loadHistory();

const clearHistoryButton =
    document.getElementById("clearHistoryButton");

// ================================
// CLEAR CHAT HISTORY
// ================================

clearHistoryButton.addEventListener("click", function () {

    if (chats.length === 0) {
        alert("Chat history is already empty.");
        return;
    }

    const confirmClear = confirm(
        "Are you sure you want to clear all chat history?"
    );

    if (!confirmClear) {
        return;
    }

    // Remove saved chats
    chats = [];

    localStorage.removeItem("aiChats");

    // Clear current chat
    currentChat = [];

    // Clear chat window
    chatBox.innerHTML = `
        <div class="message bot-message">
            Hello! 👋<br><br>
            I'm your AI assistant.
            How can I help you today?
        </div>
    `;

    // Refresh sidebar
    loadHistory();

    userInput.focus();
});