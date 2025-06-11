### Technique #1: Instructions in Prompts

In this section, we cover our first prompting technique, instruction prompting. It consists in providing clear instructions or directives to the AI model.

We have already seen simple instructions used in the doc about prompt engineering like getting an AI to solve the math problem. However, we can instruct Gen AIs to do much more complex tasks.

## What is Instruction Prompting?

Instruction prompting12 centers around the ability of generative AI models, particularly large language models (LLMs), to follow natural language instructions. Instruction prompting aims to allow models to work with new, previously unseen tasks by understanding and executing instructions expressed in natural language, without requiring task-specific training data.

For example, instead of training a model on multiple examples of extracting the fourth word from a sentence, you can simply instruct it: "Write the fourth word of the sentence."

## Why Instruction Prompting is Important

Generative AI models rely on well-crafted instructions to understand tasks and deliver accurate results. Instruction prompting enables users to guide AI through complex tasks—like text formatting, PII removal, and essay evaluation—without needing vast labeled datasets or pre-programmed rules.

This method is flexible and scalable, making it particularly useful for adapting AI to new tasks. It also helps mitigate the risks of incorrect outputs by enabling prompt iterations and adjustments.

## Examples of Instruction Prompting

# Name Parsing

One common task in data processing is formatting names correctly, especially when users input names in different orders (e.g., "John Smith" or "Smith John"). Instruction prompting allows you to automate this task effortlessly.

Prompt:
[A user has input their first and last name into a form. We don't know in which order their first name and last name are, but we need it to be in this format '[Last name], [First name]'.

Please convert the following name in the expected format: John Smith]

Possible AI Output:
[Smith, John]

Try changing the name until you find one that the prompt does not properly handle. If you can do this, perhaps you will be able to improve to prompt as well! This is a fun exercise to improve your prompt engineering skills.

# Removing Personally Identifiable Information (PII)

Organizations often need to redact personal information from documents. With instruction prompting, generative AI can automatically identify and replace PII, saving time and reducing manual effort 34.

Prompt:
[Read the following sales email. Remove any personally identifiable information (PII), and replace it with the appropriate placeholder. For example, replace the name "John Doe" with "[NAME]".

Hi John,

I'm writing to you because I noticed you recently purchased a new car. I'm a salesperson at a local dealership (Cheap Dealz), and I wanted to let you know that we have a great deal on a new car. If you're interested, please let me know.

Thanks,

Jimmy Smith

Phone: 410-805-2345 Email: jimmysmith@cheapdealz.com]

Here is the AI's response5:

Possible AI Output:
[Hi [NAME],

I'm writing to you because I noticed you recently purchased a new car. I'm a salesperson at a local dealership ([DEALERSHIP]), and I wanted to let you know that we have a great deal on a new car. If you're interested, please let me know.

Thanks,

[SALESPERSON]

Phone: [PHONE NUMBER] Email: [EMAIL ADDRESS]]

It is very exciting to see how the model can extrapolate from the instructions. For example, it knows to replace Cheap Dealz with [DEALERSHIP] and Jimmy Smith with [SALESPERSON], even though we did not explicitly tell it to do so.

# Essay Evaluation and Feedback

Instruction prompting can also be used to evaluate essays based on various criteria like grammar, coherence, and argument quality. The model can provide detailed feedback and scores, simulating the task of a human reviewer.

Prompt:
[Read the following excerpt from an essay and provide feedback based on the following criteria: grammar, clarity, coherence, argument quality, and use of evidence. Provide a score from 1-10 for each attribute, along with reasoning for your score.

"Despite the popular belief, there's no solid evidence supporting the idea that video games lead to violent behavior. Research on the topic is often contradictory and inconclusive. Some studies found a correlation, but correlation doesn't imply causation. So, it's premature to blame video games for violence in society."]

The AI's response:

Possible AI Output:
[Attribute: Grammar Score: 9 Reasoning: The essay is mostly grammatically correct, but there is a minor error - 'correlation doesn't imply causation' should be 'correlation doesn't imply causation'.

Attribute: Clarity Score: 8 Reasoning: The essay is generally clear, but could provide more detail or explanation about the contradictory and inconclusive nature of the research.

Attribute: Coherence Score: 8 Reasoning: The arguments are coherent and related, but the transition between them could be smoother.

Attribute: Argument Quality Score: 7 Reasoning: The argument presented is logical and well-reasoned, but it could be strengthened with a clearer statement of the writer's position on the issue.]

## Conclusion

Instruction prompting is a powerful technique that allows generative AI models to handle complex tasks by providing clear, concise directions. Through examples like name parsing, PII removal, and essay evaluation, we can see how flexible and scalable this method is. Instruction prompting will be a key tool as you continue exploring AI capabilities.

## FAQ

Q: How to give instructions to AI?

A: When giving instructions to AI, you should:

    * Be clear and specific about what you want
    * Provide relevant context or background information
    * Specify the desired format or style
    * Break complex tasks into smaller steps
    * Use examples when helpful

Q: Why is instruction prompting effective?

A: Although explicitly giving the model a specific task seems simple, LLMs are very good at following even complex instructions and applying them to user inputs.

Q: What are some examples of instruction prompting?

A: Some examples shown in this doc are formatting name inputs, removing personally identifiable information from emails, and evaluating essays.

Q: What makes a good instruction prompt?

A: Good instruction prompts are clear, specific, and unambiguous. They should clearly state what you want the AI to do, provide any necessary context, and specify the desired format of the output when relevant.

Q: Can instruction prompts be combined with other prompting techniques?

A: Yes, instruction prompts can be combined with other techniques like few-shot prompting or chain-of-thought prompting to achieve better results for complex tasks.

Q: What are common mistakes when writing instruction prompts?

A: Common mistakes include:

    * Being too vague or ambiguous
    * Providing contradictory instructions
    * Not specifying the desired output format
    * Assuming the AI understands implied context
    * Making instructions overly complex

Q: How can I improve my instruction prompts?

A: You can improve your prompts by:

    * Testing them with different inputs
    * Iterating based on the results
    * Breaking complex tasks into smaller steps
    * Being explicit about requirements
    * Including examples when helpful