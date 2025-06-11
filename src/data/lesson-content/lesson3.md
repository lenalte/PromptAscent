### Basic Prompt Structure and Key Parts

Prompts are made up of several key components that work together to guide the AI. While not every prompt will contain all these elements, understanding how each part functions can help you create more targeted and effective inputs.

The key parts of a prompt are:

    * The Directive
    * Examples
    * Role (Persona)
    * Output Formatting
    * Additional Information

## 1. The Directive

The Directive is the main instruction in the prompt12. It tells the AI exactly what task it should perform. Without a clear directive, the AI may provide a generic or irrelevant response.

# What is a Directive?

A directive is a concise instruction or question that gives the AI a clear task to perform. It can range from a request to generate text, solve a problem, or format information in a specific way.

For example, here a prompt with a single instruction:

Prompt:
[Tell me five good books to read.]

# Implicit Directives

In some cases, the directive may be implied rather than explicitly stated. These types of prompts still guide the AI but rely on context or formatting to convey the task.

Prompt:
[Night: Noche Morning:]

Best Practices for Directives:

    * Be clear and concise.
    * Avoid ambiguous or vague instructions.
    * When possible, use action verbs to indicate the specific task (e.g., "write," "list," "translate").

## 2. Examples

When the task is more complex, providing Examples can help guide the AI in producing more accurate responses. This technique is especially useful in few-shot and one-shot prompting, where a model is given one or more examples of what you expect in the output.

# Why Use Examples?

Examples demonstrate the expected format, style, or structure of the output. By including them in the prompt, you can guide the AI's behavior and help it better understand the desired result.

Prompt:
[Translate the following sentences:

Q: I like apples. A: Me gustan las manzanas.

Q: I enjoy walking.]

In this example, the AI is shown how to structure the translation, and it will follow the same pattern for the remaining sentences.

# Best Practices for Examples:

    * Provide clear and relevant examples that match the task.
    * Use examples to demonstrate the structure or content you expect.
    * Adjust the number of examples based on task complexity (one-shot or few-shot).

## 3. Role (Persona)

Assigning a Role to the AI, also known as a persona, helps frame the response in a specific way. By telling the AI to act as an expert, a professional, or a specific character, you can guide the tone, style, and content of the response.

# What is a Role?

The role element in a prompt assigns a specific persona or perspective to the AI, encouraging it to tailor its response according to the designated role. This can greatly enhance the accuracy and relevance of the response, especially for tasks requiring domain-specific knowledge or a particular tone.

Here, the AI is instructed to respond as if it were a medical professional:

Prompt:
[You are a doctor. Based on the following symptoms, diagnose the patient.]

The AI will assume the role of a customer service agent, ensuring the tone is appropriate for business communication:

Prompt:
[You are a customer service agent. Write an email apologizing for a delayed order.]

# Best Practices for Using Roles:

    * Use roles to add expertise or a specific perspective to the response.
    * Ensure the role fits the task at hand (e.g., using a marketing expert to write promotional content).
    * Combine the role with additional context for better results.

## 4. Output Formatting

Sometimes, it's important to specify the format in which you want the AI to present its output. Output Formatting ensures that the response follows a particular structure—whether it's a list, a table, or a paragraph. Specifying the format can help prevent misunderstandings and reduce the need for additional post-processing.

# Why Output Formatting Matters

Without clear formatting instructions, the AI may provide a response that is technically correct but not in the desired format. Specifying the structure makes the output easier to use.

It is often desirable for the GenAI to output information in certain formats, for example, CSVs or markdown formats3. To facilitate this, you can simply add instructions to do so as seen below:

Prompt:
[Case: 2024_ABC_International Client: XYZ Corporation Jurisdiction: EU & USA Filed Date: 2024-09-01 Status: Active Lead Attorney: John Doe Next Hearing: 2024-10-15

Output this information as a CSV.]

Possible AI Output:
[Case,Client,Jurisdiction,Filed Date,Status,Lead Attorney,Next Hearing 2024_ABC_International,XYZ Corporation,EU & USA,2024-09-01,Active,John Doe,2024-10-15]

# Style Instructions

You can also specify stylistic preferences, such as tone or length, within the output formatting. This allows you to control not just the content but how it's presented.

For example:

Prompt:
[Write a clear and curt paragraph about llamas.]

## 5. Additional Information

Additional Information, sometimes referred to as context, though we discourage the use of this term as it is overloaded with other meanings in the prompting space[^b]. It provides the background details the AI needs to generate a relevant response. Including this information ensures that the AI has a comprehensive understanding of the task and the necessary data to complete it.

# What is Additional Information?

Additional information can include relevant facts, data, or other background information that helps the AI generate a more accurate and contextually appropriate response. This element is especially important for complex tasks that require specific knowledge.

Prompt:
[January 1, 2000: Fractured right arm playing basketball. Treated with a cast.

February 15, 2010: Diagnosed with hypertension.

You are a doctor. Predict the patient's future health risks based on this history.]

In this example, the patient's medical history is crucial to generating a valid prediction.

# Best Practices for Additional Information:

    * Include only relevant information—avoid overloading the prompt with unnecessary details.
    * Ensure the information is clearly linked to the task.
    * Use this element to provide essential background that the AI might not otherwise have.

## How to Order Parts of the Prompt

There is no single "correct" order for arranging the elements of a prompt, but there are guidelines that can help improve clarity and prevent misunderstandings. In general, starting with examples or context and ending with the directive ensures the AI focuses on the task after processing the relevant information.

Now that you understand the different parts of a prompt, you may wonder if there is a common order in which you should arrange them. You should first note that not all of these occur in every prompt, and when they do there is no standard order for them. However, we do have a suggested order. To understand our order, first consider the following two prompts, which each contain a role, an instruction (the directive), and additional information.

Prompt:
[You are a doctor. Read this medical history and predict risks for the patient.

January 1, 2000: Fractured right arm playing basketball. Treated with a cast. February 15, 2010: Diagnosed with hypertension. Prescribed lisinopril. September 10, 2015: Developed pneumonia. Treated with antibiotics and recovered fully. March 1, 2022: Sustained a concussion in a car accident. Admitted to the hospital and monitored for 24 hours.]

Prompt:
[January 1, 2000: Fractured right arm playing basketball. Treated with a cast. February 15, 2010: Diagnosed with hypertension. Prescribed lisinopril. September 10, 2015: Developed pneumonia. Treated with antibiotics and recovered fully. March 1, 2022: Sustained a concussion in a car accident. Admitted to the hospital and monitored for 24 hours.

You are a doctor. Read this medical history and predict risks for the patient.]

Although usually both prompts would give approximately the same output, we prefer the second prompt, since the instruction is the last part of the prompt. This is preferable, since with the first prompt, the large language model (LLM) might just start writing more context instead of following the instruction; if given the first prompt, the LLM might add a new line:

March 15, 2022: Follow-up appointment scheduled with neurologist to assess concussion recovery progress.

This is due to the fact that LLMs are trained to predict the next token (similar to word) in a paragraph.

Recommended Order for Prompts:

    * Examples (if needed)
    * Additional Information
    * Role
    * Directive
    * Output Formatting

In this prompt, the role and task come after the context, ensuring the AI processes the timeline before generating the output.

# Why Order Matters

The order of the elements affects how the AI processes the information. For instance, placing the directive last helps avoid the AI continuing the additional information instead of focusing on the task at hand.

## Conclusion

Crafting effective prompts requires an understanding of the key elements that guide AI responses. By mastering the use of Directives, Examples, Roles, Output Formatting, and Additional Information, you can improve the accuracy and relevance of the outputs generated by AI models. Experimenting with different combinations of these elements will allow you to tailor prompts for a wide range of tasks and achieve better results.

## FAQ

Q: Why formalize the language used to discuss prompting?

A: Using formal language when discussing prompts helps you create more effective inputs and engage in clear, precise prompt engineering conversations. It establishes a common vocabulary, making it easier to share strategies and best practices.

Q: What are the key components of a prompt?

A: A well-crafted prompt typically consists of:

    * The Directive: The main instruction or task.
    * Examples: Sample inputs/outputs to guide the expected response.
    * Role (Persona): The perspective or tone the AI should adopt.
    * Output Formatting: Specifications for how the response should be structured.
    * Additional Information: Background or context that informs the task.

Q: How should the parts of a prompt be ordered?

A: A recommended order for arranging prompt elements is:

    Examples (if needed)
    Additional Information
    Role (if applicable)
    Directive
    Output Formatting

Ending with the directive helps ensure the AI focuses on the task rather than continuing the context.

Q: What makes a good directive?

A: A good directive is clear, concise, and uses action verbs. It should specify exactly what you want the AI to do without ambiguity.

Q: How does output formatting improve AI responses?

A: Output formatting instructs the AI to present its response in a specific structure—such as a list, table, or paragraph—making the result immediately usable and reducing the need for further editing.

Q: Are examples necessary in a prompt?

A: Examples aren’t always required, especially for simple tasks. However, for more complex or nuanced tasks, including examples helps the AI understand the expected output and improves accuracy.

Q: Why should the directive often come last?

A: Placing the directive at the end helps ensure the AI processes all the context before generating its response. This minimizes the risk of the AI continuing to add context instead of focusing on the specified task.

Q: What is the role of the context in a prompt?

A: Context provides background information that helps the AI understand the task more fully. It frames the directive by supplying relevant details or scenarios, leading to more accurate and context-aware outputs.

Q: How do I craft an effective prompt?

A: Effective prompts are clear and specific. They define the task, provide necessary context and examples, and specify the desired output format. This precision guides the AI to produce accurate and relevant responses.

Q: What is role-based prompting?

A: Role-based prompting assigns a specific persona to the AI, such as a doctor or historian, to tailor the response’s tone, style, and content. This helps ensure the output matches the intended context or professional setting.

Q: What does one-shot prompting mean?

A: One-shot prompting involves giving the AI a single example before the task. This clarifies the expected output and can improve accuracy for tasks that benefit from a sample demonstration.

Q: How can user feedback improve prompts?

A: User feedback highlights where the AI’s responses may fall short, allowing you to refine prompts by adding more context, clarifying instructions, or adjusting the format to better meet the task requirements.