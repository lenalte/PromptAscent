### Chain-of-Thought Prompting

Takeaways:

    * Chain-of-Thought (CoT) Prompting: This technique improves LLM performance by encouraging them to articulate their reasoning process, leading to more accurate answers.
    * Task Effectiveness: CoT is particularly beneficial for complex tasks and works best with larger models; smaller models may perform worse.

## What is Chain-of-Thought Prompting?

Chain-of-Thought (CoT) Prompting1 is a technique that enhances the reasoning capabilities of large language models (LLMs) by incorporating logical steps—or a “chain of thought”—within the prompt. Unlike direct-answer prompting, CoT guides the model to work through intermediate reasoning steps, making it more adept at solving complex tasks like math problems, commonsense reasoning, and symbolic manipulation.

## How Chain-of-Thought Prompting Differs from Existing Techniques

Traditional prompts typically consist of simple input-output examples and lack explicit reasoning steps, making it challenging for models to infer the necessary logic for tasks requiring multi-step reasoning. CoT prompting addresses this by:

    * Encouraging Multi-Step Reasoning: Rather than relying solely on model size for complex tasks, CoT embeds reasoning steps within the prompt, unlocking sophisticated reasoning in models that might otherwise struggle with complexity.
    * Achieving Efficiency without Finetuning: CoT works across tasks without the need for finetuning, using a standard prompt format that embeds reasoning, thus simplifying adaptation to various complex tasks.

The key concept of CoT is that by providing a few examples (or exemplars), where the reasoning process is explicitly shown, the LLM learns to include reasoning steps in its responses. This structured approach to thinking often results in more accurate outputs.

## How Chain-of-Thought Prompting Works

    1. Decompose the Problem: CoT prompts guide the model to break down a complex question into manageable steps, akin to how a human might solve the problem.
    2. Guide with Exemplars: CoT uses examples that demonstrate reasoning steps, helping the model grasp the method needed to reach the correct answer.

With CoT, the model essentially “talks through” its thought process, leading to more reliable answers.

# Applications and Benefits:

CoT prompting is especially valuable for tasks where structured reasoning is crucial:

    * Mathematics and Arithmetic: CoT helps solve multi-step word problems by guiding calculations through each necessary step.
    * Commonsense and Symbolic Reasoning: Useful for tasks requiring general knowledge or symbolic reasoning, where CoT can bridge the gap between facts and logical connections.
    * Complex Decision-Making: In fields like robotics, CoT enables models to follow logical steps for decision-making tasks.

## How to Use Chain-of-Thought Prompting

Chain-of-Thought Prompting Template:
[Q: John has 10 apples. He gives away 4 and then receives 5 more. How many apples does he have?

A:

    John starts with 10 apples.
    He gives away 4, so 10 - 4 = 6.
    He then receives 5 more apples, so 6 + 5 = 11. Final Answer: 11

Q: [Your Question]]

## Chain-of-Thought Results

Research has shown that CoT prompting can significantly enhance LLM accuracy on tasks like arithmetic, commonsense, and symbolic reasoning1. For instance, a prompted PaLM 540B model2 achieved a 57% solve rate accuracy on GSM8K3, setting a state-of-the-art (SOTA) benchmark at the time.

The table below summarizes the performance improvements on key benchmarks when using CoT prompting:

Task	Model	Standard Prompting Accuracy	CoT Prompting Accuracy	Improvement
GSM8K (Math)	PaLM 540B	55%	74%	+19%
SVAMP (Math)	PaLM 540B	57%	81%	+24%
Commonsense (CSQA)	PaLM 540B	76%	80%	+4%
Symbolic Reasoning	PaLM 540B	~60%	~95%	+35%

## Limitations of Chain-of-Thought

Importantly, according to CoT authors1, CoT only yields performance gains when used with models of ∼100B parameters. Smaller models wrote illogical chains of thought, which led to worse accuracy than standard prompting. Models usually get performance boosts from CoT prompting in a manner proportional to the size of the model.

## Conclusion

Chain-of-Thought Prompting is a powerful method for unlocking reasoning capabilities in large language models. By encouraging step-by-step thinking, CoT prompting allows models to perform complex reasoning tasks effectively without needing additional training data. The benefits are particularly pronounced in large models (e.g., models with over 100 billion parameters), which exhibit improved reasoning capacities as they follow these structured reasoning prompts.

## FAQ

Q: Why is Chain-of-Thought prompting effective?

A: Chain-of-Thought prompting works by providing the model with examples of logical reasoning. When shown how to approach problems in a step-by-step way, the LLM is more likely to emulate this approach, resulting in responses that are both accurate and reliable.

Q: What is a limitation of Chain-of-Thought prompting?

A: CoT prompting is less effective with smaller models. To achieve meaningful gains, it’s best to apply CoT in proportion to the model’s size, as smaller models may produce less coherent reasoning with CoT prompting.