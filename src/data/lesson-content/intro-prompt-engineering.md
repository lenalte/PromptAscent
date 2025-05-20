< ### Introduction to Prompt Engineering
In this section, we introduce you to the concept of prompt engineering and explain why it's a crucial skill when working with Generative AI models like ChatGPT and DALL-E.

## What is Prompt Engineering?
Prompt engineering is the process of crafting and refining prompts to improve the performance of generative AI models. It involves providing specific inputs to tools like ChatGPT, Midjourney, or Gemini, guiding the AI to deliver more accurate and contextually relevant outputs.
When an AI model doesn't produce the desired response, prompt engineering allows us to iterate and adjust the prompt to optimize the output. This method is particularly useful for overcoming limitations of generative models, such as logical errors or insufficient context in responses.
## Why Prompt Engineering is Important?
Generative AI models rely heavily on the input (or "prompt") provided by users. A well-structured prompt is key to leveraging the model's capabilities and ensuring it provides relevant, precise answers.
Prompt engineering is important because:
It bridges the gap between vague, general queries and specific, actionable results.
It helps mitigate errors, such as generating irrelevant content or incorrect responses.
It ensures that the AI can handle tasks like creative writing, image generation, or even code development with minimal post-processing needed.

What is a Prompt?
A prompt is the input or instruction given to an AI model to generate a response. Prompts can be simple (a question) or complex (detailed instructions with context, tone, style, and format specifications). The quality of the AI's response depends directly on how clear, detailed, and structured the prompt is.
Here's an example of a simple prompt:
Prompt:
[Explain me what is prompt engineering like I'm 5.]
Let's see how it works:

Possible AI Output:
[Sure! Imagine you have a toy robot that listens to what you say and does things like answering questions or telling stories. But, this robot doesn't always understand exactly what you want unless you say it in a certain way.
Prompt engineering is like figuring out the best way to talk to the robot so it does exactly what you want. For example, if you want the robot to tell a funny story about a cat, you might need to say, "Tell me a funny story about a cat," instead of just "Tell me a story."
In short, prompt engineering is about asking the right questions or giving the right instructions to make sure the robot gives you the best answers!]
# Applying Prompt Engineering to Improve the Prompt
Generative AI models, like ChatGPT, can sometimes produce incorrect or misleading outputs. This often happens when a prompt is too vague, lacks necessary details, or doesn't provide clear instructions.
Let's try to refine the prompt and encourage step-by-step reasoning to improve model's output:
Improved Prompt:
[What is 923 * 99?
Let's go step by step.
Always write out the full number of 0s for each term.]
What model outputs:

Possible AI Output:
[To multiply 923 by 99, we can break it down into smaller steps:
Step 1: Write out the full number of 0s for each term: 923 * 99 = 923 * 990
Step 2: Multiply the first term by 9: 923 * 9 = 8307
Step 3: Multiply the first term by 90 (adding one 0): 923 * 90 = 83070
Step 4: Add the results from step 2 and step 3: 8307 + 83070 = 91377
Therefore, 923 multiplied by 99 is equal to 91,377]

Interestingly, with these additional instructions, ChatGPT provides the correct answer by walking through the steps.
This process of editing and refining the prompt is what we call prompt engineering. Adding specificity and guidance to the prompt improves the output and guides the model apply logical reasoning more effectively.
# Why Did This Updated Prompt Work?
Generative AI models are trained to predict text based on patterns instead of deep reasoning or factual accuracy. By prompting the model to explicitly think through its steps and break down the problem, we reduce the chance of mistakes and make the task easier for the model to handle.
## Examples of Prompt Engineering in Action (Text, Image, and Code)
Prompt engineering is versatile and can be applied to many use cases across text, image, and code generation.
Here are some examples to illustrate its range:
# Text
Let's start with text-based models like ChatGPT. Suppose you need help writing a marketing summary:

Initial Prompt:
[Write a marketing summary for a new AI tool that helps companies automate tasks.]
The output might be too generic, so you refine it:


Refined Prompt:
[Write a 100-word marketing summary for an AI tool called TaskBot, which automates repetitive tasks for small businesses in industries like retail and healthcare. Highlight efficiency and cost savings.]
This provides clearer instructions and results in a more targeted response.
# Image Generation
For models like Midjourney or DALL-E, prompts are crafted to generate specific imagery.
Initial Prompt:
[A cat sitting on a chair.]
By adding more details, you guide the model to generate an image that aligns with your vision.

Refined Prompt:
[Generate an image of a tabby cat sitting on a wooden chair in a cozy, sunlit room, with soft shadows and warm lighting.]
# Code Generation
Prompts can help generate or optimize code:
Initial Prompt:

[Write a Python function to multiply two numbers.]

Refined Prompt:
[Write a Python function that multiplies two integers and returns the result. Include error handling for cases where inputs are not integers.]
This ensures the AI writes robust, real-world-ready code.
## Prompt Engineering for Creative Tasks: Writing Tweets
Next, let's apply prompt engineering in a creative context. Imagine we are developing a fictional AI product called "ArchaeologistAI," which tells stories about famous archaeologists. Let's ask ChatGPT to write a marketing tweet about it.

Prompt:
[Write a tweet about ArchaeologistAI.]

Possible AI Output:
[🔍 Exciting times ahead with #ArchaeologistAI!
This cutting-edge technology is revolutionizing the field of archaeology, helping us uncover ancient mysteries and piece together our past like never before.
Can't wait to see what hidden treasures and insights it unveils!
#AI #Archaeology]
# Including Relevant Information in the Prompt
This Tweet is inaccurate because ArchaeologistAI doesn't discover new things—it only tells stories. This isn't ChatGPT's fault, as it wasn't given enough context.
Let's refine the prompt by including more specific details:
Prompt:
[Write a tweet about ArchaeologistAI.
ArchaeologistAI tells stories about famous archaeologists.]

Possible AI Output:
[🔍 Unearth the captivating tales of legendary archaeologists with #ArchaeologistAI!
From Indiana Jones to Mary Leakey, this AI-powered storyteller brings their adventures to life, shedding light on their groundbreaking discoveries and inspiring the next generation of explorers.
🌍 #Archaeology]
Much better now! This is a much more accurate output because we added key details about the product's functionality.
# Changing Style of the AI Output with the Prompt
Now, let's refine it further by asking ChatGPT to write the tweet in the style of Indiana Jones:
Prompt:
[Write a tweet about ArchaeologistAI, in the style of Indiana Jones.
ArchaeologistAI tells stories about famous archaeologists.]

Possible AI Output:
[Grab your fedora and whip, folks! 🎩🔥
ArchaeologistAI is like having a personal Sallah by your side, sharing captivating tales of legendary archaeologists who've braved ancient tombs and unearthed hidden treasures! 🗺️💎
Get ready to embark on a digital adventure through history!
#ArchaeologistAI #UnearthTheLegends]
Alright, that may be the message we need to target archaeology fans! This version adds a fun, thematic spin to the message, making it more engaging. By iterating and refining the prompt, we were able to achieve the desired result.
## Conclusion
Prompt engineering is an iterative process. The perfect prompt rarely happens on the first try, so it's essential to practice refining your inputs to get the best possible output from generative AI models. As we've seen, adding specificity, providing context, and guiding the model with detailed instructions can significantly improve its responses.
In the following docs, we'll explore different prompting strategies that will help you get better at crafting prompts for a variety of AI applications.
## FAQ
Q: What is prompt engineering?
A: Prompt engineering is the art of writing and refining your prompts to get better results from generative AI models. It means providing clear, detailed inputs so the AI can produce more accurate and useful outputs.

Q: What is a prompt?

A: A prompt is the instruction or input you give to an AI model. It can be a simple question or a detailed command that sets the tone, style, or format of the output.

Q: How does prompt engineering work?

A: Prompt engineering works by:
Creating clear and specific instructions
Providing the relevant context or background information
Breaking down complex tasks into smaller, manageable steps
Testing and refining the prompt based on the AI’s responses
Adjusting the prompt until you achieve the desired output

Q: Why is prompt engineering important?

A: Prompt engineering is important because:
Basic prompts can lead to vague or incorrect answers
It bridges the gap between your ideas and the AI’s output
It can help protect against security risks like prompt injection
It ensures the AI’s answers meet the desired quality and style
It improves overall accuracy and relevance of the responses

Q: How can I improve my prompts?

A: To improve your prompts:
Add specific details and context to guide the AI
Give clear instructions and break tasks into steps
Specify the format or style you expect in the output
Test your prompts and tweak them based on the results

Q: What types of tasks can prompt engineering help with?

A: Prompt engineering can help with a wide range of tasks, including:
Writing and text generation
Image creation with models like DALL-E
Generating and optimizing code
Creative tasks, such as composing tweets or stories
Solving mathematical problems

Q: Why was prompt engineering effective in the math example?

A: In the math example (923 * 99), adding step-by-step instructions helped the AI break down the problem. This guided it to use logical reasoning, resulting in a correct answer rather than an error.

Q: What makes a good prompt?
A: A good prompt usually has:
Clear and specific instructions
Relevant context and details
A defined output format or style
Step-by-step guidance for complex tasks
Any necessary constraints to guide the response

Q: What is deterministic prompting?

A: Deterministic prompting is a method where prompts are crafted to produce consistent and predictable outputs. This is done by using very specific formats, instructions, and constraints, so that the AI returns the same result every time for the same input.

Q: How can user feedback help improve prompt engineering?

A: User feedback is valuable because it shows where the AI’s responses fall short. You can use this feedback to adjust and refine your prompts—adding missing context or clarifying instructions—to make the outputs more accurate and useful over time.
