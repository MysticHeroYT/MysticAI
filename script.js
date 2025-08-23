<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <!-- Updated the title to reflect the MysticAI theme -->
    <title>MysticAI Web Chat</title>
    <!-- Font Awesome for the send button icon -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.3.0/css/all.min.css">
    <!-- Tailwind CSS for styling -->
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        /* Using a custom font for a mystical feel */
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap');
        
        body {
            font-family: 'Inter', sans-serif;
        }

        /* The custom CSS from the uploaded file, with some modifications for the new theme */
        #user-input {
            background-color: #2D204A; /* Dark purple */
            color: #fff;
            border: none;
            outline: none;
            padding: 8px;
            flex: 9;
            font-size: 14px;
            font-weight: 400;
            border-radius: 5px;
        }

        #user-input::placeholder {
            color: #B9B4E3; /* Light purple */
            font-weight: 400;
        }

        #send-button {
            transition: all 0.3s ease;
        }

        #send-button:hover {
            background-color: #B9B4E3; /* Light purple hover effect */
        }

        .bot,
        .user {
            display: flex;
            align-items: flex-start;
            color: #eee;
            width: 100%;
            padding: 15px 7px 15px 10px;
            border-radius: 6px;
            background-color: #2C2B47; /* Slightly lighter purple for chat bubbles */
            margin-bottom: 15px;
        }

        .user {
            justify-content: end;
            width: 80%;
            margin-left: 20%;
        }

        .bot {
            width: 80%;
        }

        #chat-log .user-icon i {
            background-color: #A9BFA8;
            padding: 10px 11px;
            font-size: 20px;
            margin-top: 10px;
        }

        #chat-log .bot-icon i {
            background-color: #6590BF;
            padding: 10px 8px 11px;
            font-size: 20px;
        }
    </style>
</head>

<!-- Updated the body background to a deep, mystical purple -->
<body class="m-0 p-0 bg-[#1B0C3C]">
    <!-- Header with updated text and colors -->
    <div
        class="header w-[100%] flex items-center justify-center text-[#B9B4E3] border-b-[1px] border-solid border-[#5E597F] h-[45px]">
        <h3 class="text-[17px] font-[500]">MysticAI</h3>
    </div>
    <!-- Main container for the chat interface -->
    <div class="container max-w-[920px] h-[93vh] flex flex-col justify-between my-0 mx-auto">

        <!-- Chat log area -->
        <div class="chat-container flex-1 overflow-y-auto">
            <div id="chat-log" class="mb-[10px] text-[#FAFAFA] rounded-[5px]"></div>
        </div>
        <!-- Input container with updated colors and rounded corners -->
        <div
            class="input-container bg-[#1B0C3C] p-[10px] flex justify-between border-t-[1px] border-solid border-[#5E597F] sticky bottom-0">
            <!-- User input field with rounded corners and subtle background -->
            <input type="text" id="user-input" placeholder="Type your message here..."
                class="flex-1 rounded-md px-4 py-2 bg-[#2D204A] text-white focus:outline-none focus:ring-2 focus:ring-[#B9B4E3]">
            <!-- Send button with new color and hover effect -->
            <button id="send-button"
                class="flex items-center justify-center px-[20px] py-[8px] border-none rounded-[5px] bg-[#A1A0C1] text-[#1B0C3C] font-semibold ml-[15px] cursor-pointer hover:bg-[#B9B4E3] transition-colors duration-200">
                <i class="fa-solid fa-paper-plane" id="button-icon"></i>
            </button>
        </div>
    </div>
    <script>
        // Use an IIFE to keep variables out of the global scope
        (async function() {
            // Function to handle the chat logic
            const chatLog = document.getElementById('chat-log');
            const userInput = document.getElementById('user-input');
            const sendButton = document.getElementById('send-button');

            const API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=';
            const apiKey = ''; // Canvas will provide this at runtime

            let chatHistory = [];

            // Helper function to show a loading indicator
            const showLoadingIndicator = () => {
                const loadingDiv = document.createElement('div');
                loadingDiv.id = 'loading';
                loadingDiv.className = 'bot flex items-center mb-4';
                loadingDiv.innerHTML = `
                    <div class="bot-icon w-10 h-10 rounded-full flex items-center justify-center mr-4 flex-shrink-0 bg-[#6590BF]">
                        <i class="fas fa-magic text-white"></i>
                    </div>
                    <div class="bot-message bg-[#2C2B47] text-white p-3 rounded-md animate-pulse">
                        <p>MysticAI is pondering...</p>
                    </div>
                `;
                chatLog.appendChild(loadingDiv);
                chatLog.scrollTop = chatLog.scrollHeight;
            };

            // Helper function to remove the loading indicator
            const removeLoadingIndicator = () => {
                const loadingDiv = document.getElementById('loading');
                if (loadingDiv) {
                    loadingDiv.remove();
                }
            };

            // Function to display a message in the chat log
            const displayMessage = (role, message) => {
                const messageElement = document.createElement('div');
                messageElement.className = `${role} flex items-start mb-4`;
                const isUser = role === 'user';
                messageElement.innerHTML = `
                    <div class="${isUser ? 'user-icon' : 'bot-icon'} w-10 h-10 rounded-full flex items-center justify-center mr-4 flex-shrink-0 ${isUser ? 'bg-[#A9BFA8]' : 'bg-[#6590BF]'}">
                        <i class="fa-solid ${isUser ? 'fa-user' : 'fa-magic'} text-white text-xl"></i>
                    </div>
                    <div class="${isUser ? 'user-message bg-[#2c2b47]' : 'bot-message bg-[#2c2b47]'} text-white p-3 rounded-md max-w-lg">
                        <p class="whitespace-pre-wrap">${message}</p>
                    </div>
                `;
                
                chatLog.appendChild(messageElement);
                chatLog.scrollTop = chatLog.scrollHeight;
            };

            // Main function to handle the API call
            const sendMessage = async () => {
                const userMessage = userInput.value.trim();
                if (userMessage === '') return;

                // Display user message
                displayMessage('user', userMessage);
                chatHistory.push({ role: 'user', parts: [{ text: userMessage }] });
                userInput.value = '';
                showLoadingIndicator();

                const payload = {
                    contents: chatHistory
                };

                let retries = 0;
                const maxRetries = 5;
                let delay = 1000; // 1 second

                while (retries < maxRetries) {
                    try {
                        const response = await fetch(API_URL + apiKey, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(payload)
                        });

                        if (!response.ok) {
                            if (response.status === 429) {
                                console.log(`Rate limit exceeded. Retrying in ${delay}ms...`);
                                await new Promise(resolve => setTimeout(resolve, delay));
                                delay *= 2; // Exponential backoff
                                retries++;
                                continue;
                            } else {
                                throw new Error(`API call failed with status: ${response.status}`);
                            }
                        }

                        const result = await response.json();
                        removeLoadingIndicator();
                        
                        let botResponse = 'Sorry, something went wrong.';
                        if (result.candidates && result.candidates.length > 0 && result.candidates[0].content && result.candidates[0].content.parts) {
                            botResponse = result.candidates[0].content.parts[0].text;
                        }

                        // Display bot message
                        displayMessage('bot', botResponse);
                        chatHistory.push({ role: 'model', parts: [{ text: botResponse }] });
                        break; // Success, exit loop

                    } catch (error) {
                        removeLoadingIndicator();
                        console.error('API call error:', error);
                        displayMessage('bot', 'An error occurred. Please try again.');
                        break; // Exit loop on unexpected error
                    }
                }

                if (retries === maxRetries) {
                    removeLoadingIndicator();
                    displayMessage('bot', 'I am currently unable to respond. Please try again later.');
                }
            };

            // Event listeners
            sendButton.addEventListener('click', sendMessage);
            userInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    sendMessage();
                }
            });
        })();
    </script>
</body>

</html>
