### Technique #3: Examples in Prompts: From Zero-Shot to Few-Shot

In this section, we dive into three key prompting techniques—zero-shot, one-shot, and few-shot prompting—and explore how providing your AI with examples or demonstrations can boost its accuracy. This practice, known as In-Context Learning (ICL), lets the AI learn directly from examples embedded in your prompt rather than relying solely on its pre-trained knowledge (what it has learned from the training data).

We’ll compare these shot-based prompting methods, discuss their real-world applications, and share best practices so you can choose the right approach for any task.

## What are Examples in Prompts?

When giving AI models instructions, we can improve their performance by providing examples. This technique is called In-Context Learning (ICL). It allows models to learn from examples embedded directly in the prompt, rather than needing additional training or fine-tuning. By including examples, we guide the AI to better understand the task and expected output, leveraging its pattern recognition abilities.

In-Context Learning is especially useful for tasks where instructions alone may not be enough, or when a certain structure or style is required in the output. Showing examples within the prompt helps the model apply patterns it has learned to similar, unseen inputs.

## What is Shot-Based Prompting?

In-Context Learning is closely tied to the concept of shot-based prompting methods, where "shots" refer to the number of examples included in the prompt.

Few-shot prompting is a direct application of ICL, where multiple examples (or "shots") are provided to guide the model's output. The more examples (or shots) we give, the better the model typically performs, as it can learn from these examples and generalize them to new, similar tasks.

Here's a breakdown of the common shot-based methods:

    * Zero-Shot Prompting: No examples are provided, and the model must rely entirely on its pre-trained knowledge.
    * One-Shot Prompting: A single example is given to clarify the task for the model.
    * Few-Shot Prompting: Two or more examples are included, allowing the model to recognize patterns and deliver more accurate responses.

Each of these techniques has strengths depending on the task, and the examples provided help the model learn in context, improving accuracy and output quality.

## What is Zero-Shot Prompting?

Zero-shot prompting is the simplest form of prompting. Here, we give the model a direct instruction to perform a task without providing any examples or demonstrations. This means the model has to rely entirely on its pre-trained knowledge to figure out how to complete the task. As such, all of the instruction and role prompts that you have seen so far are zero-shot prompts.

# Example of Zero-Shot Prompting

An additional example of a zero-shot prompt is:

Zero-Shot Prompt:
[Classify the sentiment of the following text as positive, negative, or neutral.
Text: I think the vacation was okay.
Sentiment:]

The model will provide a classification based solely on the task description, without seeing any examples beforehand. The output might be:

Possible AI Output:
[Neutral]

While zero-shot prompting can work well for simple tasks—especially ones that the model has likely encountered during training—it's often not enough for more complex tasks. The lack of examples leaves the model guessing, and the results can be unpredictable or incorrect.

## What is One-shot Prompting?

One-shot prompting enhances zero-shot prompting by providing a single example before the new task, which helps clarify expectations and improves model performance.

# Example of One-Shot Prompting

Consider the one-shot prompt version of the same sentiment classification task:

One-Shot Prompt:
[Classify the sentiment of the following text as positive, negative, or neutral.
Text: The product is terrible.
Sentiment: Negative

Text: I think the vacation was okay. Sentiment:]

Here, the model is shown a single example ("The product is terrible. Sentiment: Negative") before it processes the new input. This allows the model to better understand what it should do next. The output might now be more reliable:

Possible AI Output:
[Neutral]

One-shot prompting gives the model a starting point, but with only one example, it might still struggle with nuanced or complex tasks. More examples are often needed to fully capture the range of possible outputs.

## What is Few-Shot Prompting?

Few-shot prompting provides two or more examples, which helps the model recognize patterns and handle more complex tasks. With more examples, the model gains a better understanding of the task, leading to improved accuracy and consistency.

# Example of Few-Shot Prompting

Now let's see an example of Few-Shot Prompting. Below is a prompt that is attempting to classify customer feedback as positive or negative. The first three lines are examples feedback and its classification. The fouth line is new piece of feedback that has not been classified yet (It doesn't work!:). This line is called the test instance, because it is the part of the prompt that we want to LLM to analyze.

For example, a few-shot version of our sentiment classification prompt could look like this:

Few-Shot Prompt:
[Classify the sentiment of the following text as positive, negative, or neutral.

Text: The product is terrible. Sentiment: Negative

Text: Super helpful, worth it Sentiment: Positive

Text: It doesnt work! Sentiment:]

Here is the output of this prompt when passed through GPT-4. In this case, the model has two examples to learn from, making it more likely to generate an accurate response for the new input:

Possible AI Output:
[Negative]

Few-shot prompting helps the model generalize from multiple examples, making it more reliable for tasks that require adherence to specific formats or patterns, such as structured information extraction or content generation

## How to Choose the Right Prompting Technique

Selecting the appropriate prompting technique — zero-shot, one-shot, or few-shot — depends on the complexity of the task and the level of guidance the model requires.

Here's a quick summary of when to use each method:

    * Zero-shot prompting: Use this when the task is simple, well-understood, or frequently encountered in the model's training data. It's
efficient for tasks like basic arithmetic, general queries, or sentiment classification for common phrases.

    * One-shot prompting: This is helpful for tasks that need more specific guidance or when the model struggles with ambiguity. Providing a single example can clarify the task, improving accuracy in tasks like basic classification or structured information extraction.

    * Few-shot prompting: Best used for complex tasks requiring multiple examples to establish patterns. This technique is ideal for tasks that involve varied inputs, require precise formatting, or demand a higher degree of accuracy, such as generating structured outputs or handling nuanced classifications.

## Deep Dive into Few-Shot Prompting
# Real-World Applications of Few-Shot Prompting

Few-shot prompting is versatile and can be applied to various domains, such as:

    * Sentiment analysis and topic categorization1
    * Information extraction
    * Creative content generation
    * Named entity recognition2
    * Machine translation3
    * Code generation4
    * Question answering systems5
    * Conversational scenarios6
    * and more

Here are the example prompts for two applications: information extraction and creative content generation. We also provide the guidance about using few-shot prompting to receive outputs structured in a desired way.

# Few-Shot Prompting for Information Extraction

You can also use Few-Shot Prompting to extract key details from job postings in a structured bulleted list format. Here is a prompt that extracts the key details from a job posting as a bulleted list.

Prompt:
[INPUT: Software Engineer - Python specialist needed at TechCorp. 5+ years experience required. Salary range $90,000 - $120,000. Remote work available. Apply by June 30, 2024. OUTPUT: Position: Software Engineer Specialization: Python Company: TechCorp Experience Required: 5+ years Salary Range: $90,000 - $120,000 Work Type: Remote Application Deadline: June 30, 2024

INPUT: Marketing Manager for GlobalBrand. MBA preferred. 3-5 years in consumer goods marketing. $75K-$95K DOE. Hybrid work model. Applications close July 15, 2024. OUTPUT: Position: Marketing Manager Company: GlobalBrand Education: MBA preferred Experience Required: 3-5 years Industry: Consumer goods Salary Range: $75,000 - $95,000 Work Type: Hybrid Application Deadline: July 15, 2024

INPUT: Data Scientist wanted at AI Innovations Ltd. PhD in Computer Science or related field. Minimum 2 years industry experience. Competitive salary €60,000 - €80,000 based on experience. On-site work in Berlin office. Apply by August 31, 2024. OUTPUT:]

Here's the potential output. Notice how we used the INPUT, OUTPUT format instead of the colon (:) format. We will address the signifigance of this later.

Possible AI Output:
[Position: Data Scientist Company: AI Innovations Ltd Education: PhD in Computer Science or related field Experience Required: Minimum 2 years Salary Range: €60,000 - €80,000 Work Type: On-site Location: Berlin Application Deadline: August 31, 2024]

This example demonstrates how few-shot prompting can be used to extract structured information from unstructured text and present it in a different format. The model learns from the provided examples to identify relevant information and maintain the specified list structure, adapting to the new output format while still capturing the key details from the job posting.

# Few-Shot Prompting for Content Creation

This example demonstrates how to use few-shot prompting to create concise travel itinerary descriptions for different types of vacations.

Prompt:
[Destination: Tokyo, Japan Trip Type: Cultural Exploration Itinerary: A 5-day immersion in Tokyo's blend of tradition and modernity. Visit ancient temples like Senso-ji, then explore futuristic districts like Akihabara. Experience a tea ceremony, try hands-on workshops in traditional crafts, and end with a day trip to Mt. Fuji for breathtaking views of Japan's iconic landmark.

Destination: Costa Rica Trip Type: Eco-Adventure Itinerary: 7 days of natural wonders and adrenaline rushes. Start in the Arenal Volcano area for hiking and zip-lining, then head to Monteverde Cloud Forest for canopy walks and wildlife spotting. Finish at Manuel Antonio National Park, combining rainforest exploration with relaxation on pristine beaches.

Destination: Rome, Italy Trip Type: Culinary Journey Itinerary: A 6-day feast for the senses in the Eternal City. Begin with a pasta-making class, followed by guided food tours through trendy Trastevere and historic Jewish Ghetto. Visit local markets, enjoy wine tasting in the Roman countryside, and cap off the trip with a Michelin-starred dining experience.

Destination: New Zealand Trip Type: Lord of the Rings Fan Tour Itinerary:]

Here's a potential output. Notice how we had two "inputs", the destination and the trip type. Few-Shot prompting can be very versatile!

Possible AI Output:
[An 8-day journey through Middle-earth's real-life locations. Start in Auckland with a visit to Hobbiton Movie Set in nearby Matamata. Fly to Wellington to explore Weta Workshop and tour urban filming locations. Head to the South Island to see the majestic landscapes of Edoras in Mount Sunday and Pelennor Fields in Twizel. End your adventure in Queenstown, taking in the scenery of Isengard and Lothlorien in Glenorchy, with an optional helicopter tour over the Misty Mountains (Southern Alps). Throughout the trip, enjoy themed accommodations and meals inspired by hobbit cuisine.]

This example shows how few-shot prompting can be used to generate creative content tailored to specific parameters (in this case, destination and trip type). The model learns from the provided examples to create a new itinerary description that matches the style and format of the examples while incorporating relevant details for the given input. This technique can be applied to various types of content generation where consistency in structure and adaptation to specific inputs are required.

# Few-Shot Prompting for Structured Outputs

Structuring outputs is perhaps the most important benefit of few-shot prompting. If you need to copy-and-paste the AIs output into a spreadsheet or use code to extract part of its output, you need to understand how to take advantage of Few-Shot Prompting's ability to structure outputs. When we say discuss structured outputs, we are basically referring to the format that the output is in. Is it just a paragraph of text, or is it a bulleted list, or is it something else like a markdown block of code or a JSON or YAML file?

Consider the following prompt and output:

Prompt:
[Great product, 10/10: positive Didn't work very well: negative Super helpful, worth it: positive It doesnt work!:]

Possible AI Output: 
[negative]

Given that we have organized these three instances in an input: classification format, the model generates a single word following the final line, rather than outputting a complete sentence such as this review is positive. However, if we wanted a complete sentence to be output, we could adjust our examples as:

Prompt:
["Great product, 10/10": this is a positive classification "Didn't work very well": this is a negative classification "Super helpful, worth it": this is a positive classification]

We could also make outputs in JSON format by structuring the examples as follows:

Prompt:
["Great product, 10/10": {"label": "positive"} "Didn't work very well": {"label": "negative"} "Super helpful, worth it": {"label": "positive"}]

More on structure

A key use case for Few-Shot prompting is when you need the output to be structured in a specific way that is difficult to describe to the model. To understand this, let's consider a relevant example: say you are conducting an economic analysis and need to compile the names and occupations of well-known citizens in towns nearby by analyzing local newspaper articles. You would like the model to read each article and output a list of names and occupations in the First Last [OCCUPATION] format. In order to get the model to do this, you can show a few examples. Look through the embed to see them.

By showing the model examples of the correct output format, it is able to produce the correct output for new articles. We could produce this same output by using an instruction prompt instead, but the Few-Shot prompt works much more consistently.

## Best Practices for Few-Shot Prompting

When designing few-shot prompts, consider:

    * The number of examples to include
    * The order and relevance of the examples
    * The output format (e.g., list, JSON, YAML)

# How to Structure Few-Shot Prompts?

The way that we structure Few-Shot Prompts is very important. By this, we mean do we separate the inputs and outputs with a colon (:) or the words INPUT/OUTPUT. We have seen examples of both earlier in this article. How can you decide? We generally use the input: output format and occassionally use the QA format, which is commonly used in research papers.

Prompt:
[Q: input A: output]

For longer inputs and outputs, we will use the INPUT/OUTPUT format. This allows for greater legibility of the prompt.

Prompt:
[INPUT: input OUTPUT: output]

Tip:
[When it comes to how to format your prompt, start simple. You will likely have to come up with your own formats eventually.]

## Limitations of Few-Shot Prompting

While few-shot prompting is highly effective, it has limitations:

    * Context window constraints limit the number of examples.
    * Overgeneralization may occur if examples are too similar.
    * The model might focus on superficial patterns rather than understanding the task. 

## Conclusion

Few-shot prompting is a versatile and powerful technique for enhancing AI capabilities. By providing examples, you can guide the model to generate accurate, structured outputs. However, it's important to consider limitations such as context window size and example selection to maximize effectiveness.

## FAQ

Q: What are examples in prompts?

A: Examples in prompts are part of In-Context Learning (ICL), where we provide sample inputs and outputs to help AI models understand the task better. This technique allows models to learn from examples embedded directly in the prompt, rather than needing additional training or fine-tuning. It's especially useful for tasks where instructions alone may not be enough, or when a certain structure or style is required in the output.

Q: What is shot-based prompting?

A: Shot-based prompting is closely tied to In-Context Learning, where "shots" refer to the number of examples included in the prompt. The common methods are:

    * Zero-Shot: No examples provided
    * One-Shot: Single example provided
    * Few-Shot: Multiple examples provided

The more examples (or shots) provided, the better the model typically performs at understanding and completing the task.

Q: What is zero-shot prompting?

A: Zero-shot prompting is the simplest form of prompting where you give the model a direct instruction without providing any examples or demonstrations. The model must rely entirely on its pre-trained knowledge to complete the task.

Example:
Classify the sentiment of the following text as positive, negative, or neutral.
Text: I think the vacation was okay.
Sentiment:

Q: What is one-shot prompting?

A: One-shot prompting enhances zero-shot prompting by providing a single example before the new task. This helps clarify expectations and improves model performance.

Example:
Classify the sentiment of the following text as positive, negative, or neutral.
Text: The product is terrible.
Sentiment: Negative

Text: I think the vacation was okay.
Sentiment:

Q: What is few-shot prompting?

A: Few-shot prompting provides two or more examples to help the model recognize patterns and handle more complex tasks. This leads to improved accuracy and consistency in outputs.

Example:
Classify the sentiment of the following text as positive, negative, or neutral.

Text: The product is terrible.
Sentiment: Negative

Text: Super helpful, worth it
Sentiment: Positive

Text: It doesn't work!
Sentiment:

Q: What are real-world applications of few-shot prompting?

A: Few-shot prompting can be applied to various domains, including:

    * Sentiment analysis and topic categorization
    * Information extraction
    * Creative content generation
    * Named entity recognition
    * Machine translation
    * Code generation
    * Question answering systems
    * Conversational scenarios

Q: How do I choose the right prompting technique?

A: Select the appropriate technique based on your needs:

    * Zero-shot prompting: Use for simple, well-understood tasks or when the model is likely familiar with the task type
    * One-shot prompting: Helpful for tasks needing more specific guidance or when dealing with ambiguity
    * Few-shot prompting: Best for complex tasks requiring multiple examples to establish patterns or when precise formatting is needed

Q: How many examples should I include in a Few-Shot prompt?

A: The optimal number of examples depends on several factors:

    * Simple tasks: 2-5 examples are usually sufficient
    * Complex tasks: Around 10 examples
    * Research scenarios: Some researchers use 100+ examples

Consider the model's context window limitations and avoid overfitting when choosing the number of examples.

Q: What is the difference between chain-of-thought prompting and few-shot prompting?

A: While both techniques involve providing examples, they serve different purposes:

    * Few-shot prompting: Shows input-output pairs to demonstrate the desired format or pattern
    * Chain-of-thought prompting: Shows the reasoning steps or thought process to reach an answer

These techniques can be combined by including reasoning steps within few-shot examples.