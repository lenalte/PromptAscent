### Knowledge Base Chatbot

Recent advancements in Large Language Models (LLMs) such as GPT-3 and ChatGPT have created a lot of buzz in the tech industry. These models are incredibly powerful for content generation, but they also have some downsides such as bias1 and hallucinations2. One area in which these LLMs can be particularly useful is chatbot development.

## Intent-Based Chatbots

Traditional chatbots are typically intent-based, meaning they are designed to respond to specific user intents. Each intent is made up of a set of sample questions and an associated response. For example, the intent “Weather” might include sample questions like “What’s the weather today?” or “Will it rain today?” and a response like “Today will be sunny.” When a user asks a question, the chatbot matches it to the intent with the most similar sample questions and returns the associated response.

However, intent-based chatbots have their own set of problems. One issue is that they require a large number of specific intents to give specific answers. For example, user utterances like “I can’t log in”, “I forgot my password”, or “Login error” may need three different answers and therefore three different intents, even though they are all quite similar.

## How GPT-3 Can Help

This is where GPT-3 can be particularly useful. Instead of having many very specific intents, each intent can be broader and leverage a document from your Knowledge Base. A Knowledge Base (KB) is information stored as structured and unstructured data, ready to be used for analysis or inference. Your KB may be composed of a series of documents explaining how to use your products.

This way, each intent is associated with a document instead of a list of questions and a specific answer, e.g. one intent for “login problems,” one intent for “how to subscribe,” etc. When a user asks a question about login, we can pass the “login problems” document to GPT-3 as context information and generate a specific response to the user’s question.

This approach reduces the number of intents that need to be managed and allows for answers that are better adapted to each question. Additionally, if the document associated with the intent describes different processes (e.g. a process for “login on the website” and another for “login on the mobile app”), GPT-3 can automatically ask the user for clarification before giving the final answer.

## Why Can’t We Pass the Whole KB to GPT-3?

Today, LLMs like GPT-3 have a maximum prompt size of about 4k tokens (for the text-davinci-003 model), which is a lot but not enough for feeding a whole knowledge base into a single prompt. The LLMs have a maximum prompt size for computational reasons, as generating text with them involves a number of computations which quickly increase as the prompt size increases.

Future LLMs may not have this limitation while retaining the text generation capabilities. However, for now, we need to design a solution around it.

## How a Chatbot With GPT-3 Could Work

So, the chatbot pipeline could be made of two steps:

    1. First, we need to select the appropriate intent for the user question, i.e. we need to retrieve the right document from our knowledge base.
    2. Then, once we have the right document, we can leverage GPT-3 to generate an appropriate answer for the user. In doing so, we’ll need to craft a good prompt.

The first step is essentially solved by semantic search. We can use pre-trained models from the sentence-transformers library and easily assign a score to each document. The document with the highest score is the one that will be used to generate the chatbot answer.

## Generating Answers with GPT-3

Once we have the right document, we’ll need to create a good prompt to be used with GPT-3 to generate the answer. In the following experiments, we’ll always use the text-davinci-003 model with a temperature of 0.7.

To craft the prompt, we’ll experiment using:

    * Role-prompting: a heuristic technique that assigns a specific role to the AI.
    * Relevant KB information, i.e. the document retrieved in the semantic search step.
    * The last messages exchanged between the user and the chatbot. These are useful for messages sent by the user where the whole context is not specified. We’ll see an example of it later. Have a look at the Build ChatGPT page to see how to manage conversations with GPT-3.
    * Last, the user question.

Let’s start our prompt using the role-prompting technique.

Prompt:
[As an advanced chatbot named Skippy, your primary goal is to assist users to the best of your ability.]

Then, suppose the semantic search step extracts the following document from our knowledge base. All the documents describe how the VideoGram product works, which is an imaginary product similar to Instagram, but only for videos.

We can add its content inside the prompt in this way.

Prompt:
[As an advanced chatbot named Skippy, your primary goal is to assist users to the best of your ability.

START CONTEXT
Login to VideoGram from Website - Open your web browser and go to the VideoGram website. - Click on the “Login” button located in the top right corner of the page. - On the login page, enter your VideoGram username and password. - Once you have entered your credentials, click on the “Login” button. - You should now be logged in to your VideoGram account. Login to VideoGram from Mobile App - Open the VideoGram app on your mobile device. - On the main page, tap the “Login” button located in the bottom right corner. - On the login page, enter your VideoGram username and password. - Once you have entered your credentials, tap the “Login” button. - You should now be logged in to your VideoGram account.

END CONTEXT]

Last, we need to add the conversation and the user question to the end of the prompt, like in the following example.

Prompt:
[As an advanced chatbot named Skippy, your primary goal is to assist users to the best of your ability.

START CONTEXT
Login to VideoGram from Website - Open your web browser and go to the VideoGram website. - Click on the “Login” button located in the top right corner of the page. - On the login page, enter your VideoGram username and password. - Once you have entered your credentials, click on the “Login” button. - You should now be logged in to your VideoGram account. Login to VideoGram from Mobile App - Open the VideoGram app on your mobile device. - On the main page, tap the “Login” button located in the bottom right corner. - On the login page, enter your VideoGram username and password. - Once you have entered your credentials, tap the “Login” button. - You should now be logged in to your VideoGram account.

END CONTEXT

SKIPPY: Hello, I’m Skippy! How can I help you? USER: I can’t find the login button. SKIPPY:]

Passing this prompt to GPT-3, I got the following generated answer:

Possible AI Output:
[No problem! On the website, the login button is located in the top right corner of the page. On the mobile app, the login button is located in the bottom right corner. Let me know if you need any further assistance!]

Notice how the information in the generated answer comes from the knowledge base document.

## Disambiguating Questions with GPT-3

Let’s try with a more vague user utterance, like “can’t log in”. Here’s the complete prompt.

Prompt:
[As an advanced chatbot named Skippy, your primary goal is to assist users to the best of your ability.

START CONTEXT
Login to VideoGram from Website - Open your web browser and go to the VideoGram website. - Click on the “Login” button located in the top right corner of the page. - On the login page, enter your VideoGram username and password. - Once you have entered your credentials, click on the “Login” button. - You should now be logged in to your VideoGram account. Login to VideoGram from Mobile App - Open the VideoGram app on your mobile device. - On the main page, tap the “Login” button located in the bottom right corner. - On the login page, enter your VideoGram username and password. - Once you have entered your credentials, tap the “Login” button. - You should now be logged in to your VideoGram account.

END CONTEXT

SKIPPY: Hello, I’m Skippy! How can I help you? USER: Can't log in. SKIPPY:]

GPT-3 answers trying to understand better what’s the problem of the user.

Possible AI Output:
[I’m sorry to hear that. Can you tell me if you are trying to log in via the VideoGram website or mobile app?]

Next, here’s how the complete conversation goes. The whole prompt is hidden for better visibility.

Prompt:
[USER: Can't log in. SKIPPY:]

Possible AI Output:
[I’m sorry to hear that. Can you tell me if you are trying to log in via the VideoGram website or mobile app?]

Prompt:
[USER: Mobile app]

Possible AI Output:
[OK, no problem. To log in via the mobile app, open the VideoGram app on your mobile device. On the main page, tap the “Login” button located in the bottom right corner. On the login page, enter your VideoGram username and password. Once you have entered your credentials, tap the “Login” button. You should now be logged in to your VideoGram account. Please let me know if you need any further assistance.]

GPT-3 can manage disambiguation, provided that it has the right contextual information.

## Problems With Generating Answers with GPT-3

The previous examples worked well. However, there are several ways in which this chatbot could fail.

If we ask “Is the mobile app free?” to GPT-3 passing the login document as context, you’d often get an answer like “Yes, the VideoGram mobile app is free to download and use”, even if such information is not contained in the context information. Generating false information is very bad for customer service chatbots!

GPT-3 rarely generates false information when the answer to the user question can be found in the context. As user questions are often short and ambiguous texts, we can’t rely on the semantic search step to always retrieve a correct document, and so we are always vulnerable to false information generation.

## Conclusion

GPT-3 is very useful for creating conversational chatbots and can answer a series of specific questions based on contextual information inserted in the prompt. However, it’s hard to make the model produce answers leveraging only the information in the context, as the model tends to hallucinate (i.e. generating new information, potentially false). Generating false information is a problem of different severity depending on the use case.