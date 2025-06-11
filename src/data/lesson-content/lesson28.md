### Zero-Shot Chain-of-Thought

Takeaways:

    * Zero-Shot CoT simplifies reasoning: This technique enhances AI model performance by appending "Let's think step by step" to prompts, enabling the generation of logical reasoning without needing exemplars.
    * Effective for specific tasks: Zero-Shot CoT is particularly useful in arithmetic and commonsense reasoning, although it may not perform as well as traditional Chain-of-Thought prompting for more complex tasks.

## What is Zero-Shot Chain-of-Thought Prompting?

Zero-Shot Chain-of-Thought (Zero-Shot CoT) prompting1 is a follow up to Chain-of-Thought Prompting2, which introduces an incredibly simple Zero-Shot prompt. They find that by appending the words "Let's think step by step." to the end of a question, Large Language Models are able to generate a Chain-of-Thought that answers the question. From this Chain-of-Thought, they are able to extract more accurate answers.

Technically, the full Zero-Shot CoT process involves two separate prompts/completions. In the below image, the top bubble on the left generates a Chain-of-Thought, while the top bubble on the right takes in the output from the first prompt (including the first prompt itself), and extracts the answer from the Chain-of-Thought. This second prompt is a self augmented prompt.

## Zero-Shot Chain-of-Thought Example

Here are a few demos (which only perform reasoning extraction). This first demo shows GPT-3 (davinci-003) failing a simple math question, while the second demo uses a Zero-Shot CoT prompt and successfully solves the problem. Feel free to enter your OpenAI API key (Click Generate) and play around with the examples. Note how much simpler the Zero-Shot CoT prompt is compared to the CoT prompt.

Incorrect:

Prompt:
[If John has 5 pears, then eats 2, and buys 5 more, then gives 3 to his friend, how many pears does he have?]

Correct:

Prompt:
[If John has 5 pears, then eats 2, and buys 5 more, then gives 3 to his friend, how many pears does he have?

Let's think step by step.]

## Zero-Shot Chain-of-Thought Results

Zero-Shot CoT was also effective in improving results on arithmetic, commonsense, and symbolic reasoning tasks. However, unsurprisingly, it was usually not as effective as CoT prompting. An important use case for Zero-Shot CoT is when obtaining Few-Shot examples for CoT prompting is difficult.

## Ablations of Interest

Kojima et al. experiment with a number of different Zero-Shot CoT prompts (e.g. "Let’s solve this problem by splitting it into steps." or "Let’s think about this logically."), but they find that "Let's think step by step" is most effective for their chosen tasks.

## Notes

The extraction step often must be task-specific, making Zero-Shot CoT less generalizable than it appears at first.

Anecdotally, I've found that Zero-Shot CoT style prompts are sometimes effective in improving the length of completions for generative tasks. For example, consider the standard prompt Write a story about a frog and a mushroom who become friends. Appending the words Let's think step by step. to the end of this prompt leads to a much longer completion.

## Conclusion

Zero-Shot Chain-of-Thought, despite its simplicity, tends to improve model performance by including step-by-step reasoning in the response. It is encouraging that this technique can be used to solve complex tasks without the necessity of providing multiple input exemplars like in Chain-of-Thought prompting.

## FAQ

Q: What is the difference between Zero-Shot CoT and CoT prompting?

A: Zero-Shot CoT and CoT Prompting both aim to improve model responses and extract more accurate answers by generating logic-based reasoning. In Zero-Shot CoT, however, we do not have to include input exemplars of Chain-of-Thought responses, but rather just append the words "Let's think step by step" to the end of an input.

Q: When is Zero-Shot CoT most effective?

A: Zero-Shot CoT was most effective in tasks that involve arithmetic, commonsense reasoning, and symbolic reasoning.

Yes. Unsurprisingly, Zero-Shot CoT is not as effective as CoT prompting, especially when the reasoning tasks are more complex. Also, the answer extraction step is often task-specific and not as generalizable as it may appear at first.

Yes. Unsurprisingly, Zero-Shot CoT is not as effective as CoT prompting, especially when the reasoning tasks are more complex. Also, the answer extraction step is often task-specific and not as generalizable as it may appear at first.