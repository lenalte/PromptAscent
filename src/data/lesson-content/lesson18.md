### Short-Form Content

Takeaways:

    * Craft precise prompts to guide LLMs in generating structured and coherent responses to discussion questions.
    * Use iterative prompts to refine outputs, allowing for expansion and adjustment of ideas.
    * Break down responses into manageable parts, enhancing the depth and quality of the final essay.

Have you ever struggled with writing short answers or discussion posts? LLMs (Large Language Models) like ChatGPT can help you create well-structured responses. Let's learn how to do this effectively!

## nUnderstanding Short-Form Writing

    * Typical length: 100-700 words
    * Perfect for: Discussion questions, short essays, blog posts

AI works best with shorter content because it can better maintain focus and consistency. Longer content can be a bit more tricky as LLMs have limited memory and have difficulty understanding the global picture of their writing1.

## Basic Example

Let's look at an example of a basic discussion question:

    [What are the most pressing environmental issues facing our planet today, and what steps can individuals take to help address these issues?]

We can turn this into a simple prompt for ChatGPT by prepending "Respond to the following:" to it.

Prompt:
[What are the most pressing environmental issues facing our planet today, and what steps can individuals take to help address these issues?]

Results generated with this prompt aren't consistent, and a few are only a sentence or two. A typical discussion response should have multiple paragraphs, so these results aren't ideal. A good prompt should give specific instructions about format and content. You want to remove ambiguity in your language to improve consistency and quality. Here is a better prompt.

## Better Prompt

Prompt:
[Write a highly detailed essay with introduction, body, and conclusion paragraphs responding to the following:

What are the most pressing environmental issues facing our planet today, and what steps can individuals take to help address these issues?]

The second prompt generates longer outputs with better structure on average. I used the term ‘essay’ in the prompt was intentional, as ChatGPT can comprehend the definition of an essay, and is thus more likely to generate coherent, structured responses.

## Many Discussion Questions are Not Effective for Prompting

    [Was The Civil War a conflict over expansion? Agree or Disagree and why?]

Here is a real discussion question from a college history course. It is not worded correctly and is far too open-ended. To get good discussion responses, you need to rewrite the question into a well-defined prompt. A well-defined prompt for the discussion question above could be:

    [Explain the causes of the Civil War and whether expansion played a role in the conflict. Include evidence to support your argument.]

Now we can add formatting and context directions.

Prompt:
[Write a highly detailed discussion response, in the structure of an essay, responding to the following prompt:

Explain the causes of the Civil War and whether expansion played a role in the conflict. Include evidence to support your argument.]

## Automate Well-Defined Prompt Rewriting

The rewriting example above was generated with OpenAI's ChatGPT.

## Iteration

After crafting an effective prompt for your discussion question, you now need to refine the results ChatGPT generates. This may involve adjusting the output to adhere to constraints such as word count or combining concepts from different generated results.

A simple method for iterating is to generate multiple outputs and review them to gain an understanding of the concepts ChatGPT is utilizing and the structure it adheres to. Once the outputs have been evaluated, you can select the most suitable outputs and combine them into a cohesive response.

Another way to iterate is to start and then expand step by step. This requires more than one prompt: A starter prompt to write the initial paragraph or so and then other prompts to expand on what was already written.

Here is a potential philosophical discussion question:

    [Is math invented or discovered? Use careful reasoning to explain your answer.]

Add it into a simple prompt like this:

Prompt:
[Write a beginning paragraph responding to the following:

Is math invented or discovered? Use careful reasoning to explain your answer.]

I generated a few responses and found one I liked:

Possible AI Output:

There is much debate among philosophers and mathematicians as to whether math was invented or discovered. Some argue that mathematical concepts and principles exist independently of human minds and can therefore be considered as discovered rather than invented. For example, the concepts of numbers, ratios, and geometric shapes are observed in the natural world and can be abstracted and studied in a systematic way.

This is a pretty good start. I then followed this up with another prompt to expand:

Prompt:
[I am writing a detailed short essay responding to the following prompt:

Is math invented or discovered? Use careful reasoning to explain your answer.

Here is what I have so far:

There is much debate among philosophers and mathematicians as to whether math was invented or discovered. Some argue that mathematical concepts and principles exist independently of human minds and can therefore be considered as discovered rather than invented. For example, the concepts of numbers, ratios, and geometric shapes are observed in the natural world and can be abstracted and studied in a systematic way.

Write the next paragraph of my essay.]

I generated a few expansions with this prompt and selected one I liked to end up with the following final result:

Possible AI Output:
[There is much debate among philosophers and mathematicians as to whether math was invented or discovered. Some argue that mathematical concepts and principles exist independently of human minds and can therefore be considered as discovered rather than invented. For example, the concepts of numbers, ratios, and geometric shapes are observed in the natural world and can be abstracted and studied systematically.

On the other hand, some argue that math is largely an invention of the human mind. Mathematical principles are based on logical reasoning, which is a feature of the human mind. For instance, Euclidean geometry is based on abstract axioms and postulates, which are accepted as true without proof. As such, it can be argued that geometry is an invention of the human mind rather than a discovery. Similarly, mathematical formulas and equations are used to model and predict physical phenomena, which are again the result of human reasoning.]

Using expansion prompts, we can write more incrementally and iterate at each step. This is useful for when you need to produce a higher quality output and want to modify the incremental steps.

### Writing Better Short Answers Using AI
## How to Get Better Responses from AI
# ❌ Not-So-Great Way

Here's a basic question:

    [What are the most pressing environmental issues facing our planet today, and what steps can individuals take to help address these issues?]

If we just ask AI this question directly, we might get:

    * Inconsistent answers
    * Very short responses (maybe just 1-2 sentences)
    * Poorly organized information

# ✅ Better Way

Instead, let's give AI clear instructions:

Prompt:
[Write a highly detailed essay with:

    * An introduction paragraph that presents the main ideas
    * 2-3 body paragraphs with specific examples
    * A conclusion that summarizes key points

Topic: What are the most pressing environmental issues facing our planet today, and what steps can individuals take to help address these issues?]

## Making Unclear Questions Better
# Example 1: Fixing a Vague Question

Original (Too Vague):

    [Was The Civil War a conflict over expansion? Agree or Disagree and why?]

Better Version:

    [Explain the causes of the Civil War and whether expansion played a role in the conflict. Include specific historical evidence to support your argument.]

# Example 2: Breaking Down Complex Topics

Original:

    [Is math invented or discovered?]

Better Version:

Prompt:
[Write a clear response that:

    * Explains both perspectives (invention vs. discovery)
    * Uses real-world examples
    * Considers historical mathematical developments
    * Reaches a supported conclusion

Topic: Is mathematics an invention of human minds or a discovery of existing patterns in nature? Support your answer with examples.]

## Step-by-Step Writing Method

    1. Start Small First, write an opening paragraph:

    [Write an engaging introduction paragraph about [your topic]]

    2. Build Gradually After getting a good introduction, ask for more:

    [Based on this introduction, write the next paragraph focusing on [specific aspect]]

    3. Review and Improve For each section, you can ask:
        * "Can you add more specific examples?"
        * "Could you explain this part more simply?"
        * "How can we connect this better to the previous paragraph?"

## Tips for Success

    1. Be Specific in Your Requests
        * ❌ "Write about the Civil War"
        * ✅ "Explain how economic factors contributed to the Civil War, using specific examples from 1850-1860"

    2. Ask for Structure
        * Introduction with main points
        * Body paragraphs with examples
        * Clear conclusion
        * Transitions between ideas

    3. Improve Step by Step
        * Start with a basic response
        * Ask for more details in specific areas
        * Request simpler explanations where needed
        * Add examples and evidence

    4. Check and Verify
        * Always fact-check important information
        * Make sure the writing sounds natural
        * Ensure all parts connect logically

Remember: AI is a helpful writing partner, but you should always review, edit, and add your own insights to create the best possible response!