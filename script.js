const chatInput = document.querySelector("#chat-input");
const sendButton = document.querySelector("#send-btn");
const chatContainer = document.querySelector(".chat-container");
const themeButton = document.querySelector("#theme-btn");
const deleteButton = document.querySelector("#delete-btn");

let userText = null;
const API_KEY = "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";
const initialHeight = chatInput.scrollHeight;

const loadDataFromLocalstorage = () => {
    const themeColor = localStorage.getItem("theme-color");
    document.body.classList.toggle("light-mode", themeColor === "light_mode");
    themeButton.innerText = document.body.classList.contains("light-mode") ? "dark_mode" : "light_mode";

    const defaultText = `<div class ="default-text">
                            <h1>ChatGPT Clone </h1>
                            <p>Start a conversion and explore and explore the power of AI.<br> Your chat history will be displayed here.</p>
                        </div>`

    chatContainer.innerHTML = localStorage.getItem("all-chats") || defaultText;
    chatContainer.scrollTo(0, chatContainer.scrollHeight);
    
}
loadDataFromLocalstorage();

const createElement = (html,className) => {
    //Create new div and apply chat, specified class and set html content of div
    const chatDiv = document.createElement("div");
    chatDiv.classList.add("chat",className);
    chatDiv.innerHTML = html;
    return chatDiv; // Return the created chat div
}

const getChatResponse = async (incomingChatDiv) => {
    const API_URL = "https://api.openai.com/v1/completions";
    const pElement = document.createElement("p");

    //Define the properties and data for the API request
    const requestOptions = {
        method: "POST",
        headers:{
            "Content-Type":"application/json",
            "Authorization": `Bearer ${API_KEY}`
        },
        body: JSON.stringify({
            model: "text-davinci-003",
            prompt: userText,
            max_tokens: 2048,
            temperature: 0.2,
            n: 1,
            stop: null
        })
               
    }
    //Send Post request to API , get response and set the response as paragraph element text. 
    try{
        const response = await (await fetch (API_URL, requestOptions)).json();
        pElement.textContent = response.choices[0].text.trim();
    }catch(error){
        pElement.classList.add("error");
        pElement.textContent = " Oops ! Something went wrong while retrieving the response. Please try again."
    }

    //remove the typing animation append the paragraph elemnt and save the chats to local storage.
    incomingChatDiv.querySelector(".typing-animation").remove();
    incomingChatDiv.querySelector(".chat-details").appendChild(pElement);
    chatContainer.scrollTo(0, chatContainer.scrollHeight);
    localStorage.setItem("all-chats",chatContainer.innerHTML);

}
const copyResponse = (copyBtn) => {
    //copy the text content of the response to the clipboard
    const responseTextElement = copyBtn.parentElement.querySelector("p");
    navigator.clipboard.writeText(responseTextElement.textContent);
    copyBtn.textContent = "done";
    setTimeout(() => copyBtn.textContent = "content_copy", 1000);
}

const showTypingAnimation = () => {
    const html = ` <div class="chat-content">
    <div class="chat-details">
        <img src="images/chatbot.jpg" alt="chatbot-img">
        <div class="typing-animation">
            <div class="typing-dot" style="--delay: 0.2s"></div>
            <div class="typing-dot" style="--delay: 0.3s"></div>
            <div class="typing-dot" style="--delay: 0.4s"></div>
        </div>
    </div>
    <span onclick = "copyResponse(this)" class="material-symbols-outlined">
        content_copy
    </span>
</div>`;
                    //Create an incoming chat div with user's message and append it to chat container
    const incomingChatDiv = createElement(html, "incoming");
    chatContainer.appendChild(incomingChatDiv);
    chatContainer.scrollTo(0, chatContainer.scrollHeight);
    getChatResponse(incomingChatDiv);
}

const handleOutgoingChat = () => {
    userText = chatInput.value.trim(); //Get chatInput value and remove extra spaces 
    if(!userText) return;

    chatInput.value = "";
    chatInput.style.height = `${initialHeight}px`;

    const html = ` <div class="chat-content">
                        <div class="chat-details">
                            <img src="images/user.jpg" alt="user-img">
                            <p>${userText}</p>
                         </div>
                    </div>`;
                    //Create an outgoing chat div with user's message and append it to chat container
    const outgoingChatDiv = createElement(html, "outgoing");
    outgoingChatDiv.querySelector("p").textContent = userText;
    document.querySelector(".default-text")?.remove();
    chatContainer.appendChild(outgoingChatDiv);
    chatContainer.scrollTo(0, chatContainer.scrollHeight);
    setTimeout(showTypingAnimation, 500);

}

themeButton.addEventListener("click", () => {
//toggle body's class for the theme mode and save the updated theme to the local storge.
    document.body.classList.toggle("light-mode");
    localStorage.setItem("theme-color", themeButton.innerText);
    themeButton.innerText = document.body.classList.contains("light-mode") ? "dark_mode" : "light_mode";

});

deleteButton.addEventListener("click", () => {
    //Remove the chat's from local storage and call loadDatafromLocalstorage function
    if(confirm("Are you sure want to delete all the chat's")){
        localStorage.removeItem("all-chats");
        loadDataFromLocalstorage();
    }
});



chatInput.addEventListener("input", () => {
    //Adjust the height of the input field dynamincally based on it's content
    chatInput.style.height = `${initialHeight}px`;
    chatInput.style.height = `${chatInput.scrollHeight}px`;
});
chatInput.addEventListener("keydown", (e) => {
    //if the enter key is pressed without shift and the window width is larger 
    //then 800px , handle the outgoing chat
    if(e.key === "Enter" && !e.shiftkey && window.innerWidth > 800){
        e.preventDefault();
        handleOutgoingChat();
    }
});


sendButton.addEventListener("click", handleOutgoingChat);