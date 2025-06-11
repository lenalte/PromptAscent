### Self-Consistency

Takeaways:

    * Enhances AI accuracy: Self-consistency prompting boosts reliability by averaging multiple responses to the same prompt.

    * Effective for various tasks: This technique improves outcomes in arithmetic and commonsense reasoning through consensus-based results.


## What is Self-Consistency?

Self-consistency1 is an approach that simply asks a model the same prompt multiple times and takes the majority result as the final answer. It is a follow up to Chain-of-Thought Prompting, and is more powerful when used in conjunction with it.

## Self-Consistency Example

Let's consider a simple example of analyzing emails. Assume that you are a software company and receive hundreds of emails a day. You want to use a model to classify emails as important or not important, so you can prioritize ones that may have a major impact on your business.

Here is an example of an email that you might receive. Let's put that into a prompt:

Prompt:
[Hello,

I have discovered a major security vulnerability in your system. Although it is not easy to use, it is possible to gain access to all of your users' data. I have attached a proof of concept. Please fix this issue as soon as possible.

Cheers,

Donny

Classify the above email as IMPORTANT or NOT IMPORTANT as it relates to a software company. Let's think step by step.]

Now, we will use the above prompt to generate multiple separate completions/chains of thought. Here are a few examples:

Possible AI Output:
[The sender has discovered a major security vulnerability in the system. This is important because it could lead to a data breach. I would classify this email as IMPORTANT.]

Possible AI Output:
[The sender has discovered a major security vulnerability in the system, but they have not provided any proof of concept and it is not easy to use. I would classify this email as NOT IMPORTANT.]

Possible AI Output:
[The sender is likely a hacker and may have access to the system. This is important because it could lead to a data breach. I would classify this email as IMPORTANT.]

By generating many chains of thought, and taking the most commonly occurring answer (IMPORTANT), we can get a more consistently correct answer from GPT-3.

Note:
The creators of Self-Consistency discuss a more complex method for selecting the final answer in the original paper1, which deals with the LLM generated probabilities for each Chain-of-Thought. However, they do not use this method in their experiments, and majority voting seems to usually have the same or better performance.

## Self-Consistency Results

Self-consistency has been shown to improve results on arithmetic, commonsense and symbolic reasoning tasks. Even when regular Chain-of-Thought was found to be ineffective2, self-consistency was still able to improve results.

## Notes

Wang et al. discuss a more complex method for selecting the final answer, which deals with the Large Language Model's (LLM) generated probabilities for each Chain-of-Thought. However, they do not use this method in their experiments, and majority voting seems to usually have the same or better performance.

## Conclusion

Self-consistency proves to be a significant improvement of Chain-of-Thought prompting alone. By combining the techniques and taking a majority vote of the Chain-of-Thought responses, we are able to refine our model prompts to get more reliable outputs.

## FAQ

Q: What is self-consistency?

A: Self-consistency is a follow up to Chain-of-Thought prompting that takes the majority result of multiple model responses to the same prompt.

Q: How does self-consistency improve AI model results?

A: By aggregating multiple responses to the same prompt, self-consistency ensures that the final answer to an input represents a consensus vote, which tends to be more reliable and accurate than individual Chain-of-Thought completions on their own.