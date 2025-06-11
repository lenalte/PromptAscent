### Revisiting Roles

Takeaways:

    * Diminished Effectiveness: Role prompting is less effective in newer models like GPT-4 compared to older models, which benefited significantly from this technique.
    * Maximizing Role Prompting: The article discusses strategies to enhance role prompting's effectiveness, such as using longer, more detailed prompts, automatic role generation, and combining multiple personas.

## Why Revisit Role Prompting?

While older models like GPT-3 davinci-002 reaped significant benefits from Role Prompting, as described in a previous article, the efficacy of this strategy appears to have diminished with newer models such as GPT-3.5 or GPT-4. This observation is largely anecdotal and is based on practical usage rather than rigorous systematic testing.

To illustrate, assigning the role of "a doctor" or "a lawyer" amplified the relevance and depth of answers in health or legal contexts respectively in previous versions of AI models. This indicates that role prompts contributed to raising the model's comprehension of the subject matter at hand.

However, this level of enhancement seems to be less evident in more recent versions. These advanced models already have a sophisticated understanding and are often sufficiently accurate without the need for role-based reinforcement.

## More on Roles

Roles can be much longer than a sentence. They can ask the AI the complete specific tasks. See a few examples from Awesome ChatGPT Prompts below 1.

    [Act as an Etymologist

    I want you to act as an etymologist. I will give you a word and you will research the origin of that word, tracing it

    back to its ancient roots. You should also provide information on how the meaning of the word has changed over time,

    if applicable. My first request is "I want to trace the origins of the word 'pizza'".]

    [Act as an Absurdist

    I want you to act as an absurdist. The absurdist's sentences are meaningless. The words used by an absurdist are completely

    ridiculous. The absurdist does not make commonplace sentences in any way. My first suggestion request is "I need help

    creating absurdist sentences for my new series called Hot Skull, so write 10 sentences for me".]

# Automatically Create a Role

You can ask the AI to create a role for you! You can then use this role as part of another prompt. Try it out here:

Prompt:
[Write a background role/bio about a fiction writer:]

Possible AI Output:
[Leah Greenwood is a fiction writer from Los Angeles, California who has a passion for exploring the depths of the human condition through her writing. She was born into a family of creative people; her father is a sculptor, her mother is a painter, and her brother is a filmmaker. After getting her BA in English, Leah began writing short stories that were eventually published in various anthologies. She then went on to write her first novel which earned her a nomination for a prestigious literary award.

Leah has a deep love for literature that has been a part of her life for as long as she can remember. She comes from a diverse background and lives in a vibrant city, which provides an ever-changing source of inspiration for her writing. Leah’s stories often focus on characters who are searching for acceptance, truth, and meaning in a world that is often confusing and unpredictable. She strongly believes that stories can open our hearts and minds to new perspectives, and that they can have the power to transform lives in remarkable ways.]

# Multiple Personas Working Together

A final anecdote is that you can use multiple role prompted Large Language Models (LLMs) to work together2. This can often lead to improvements in both accuracy and quality of text generation.

## Conclusion

The improved accuracy of newer AI models has decreased the efficacy of the simple role prompting techniques you have learned about previously. However, with more advanced roles, we can still take advantage of this approach and guide an LLM response to a desired output format or style.

## FAQ

Q: Why do we need to revisit role prompting?

A: Assigning a role like "you are a doctor" to an LLM could significantly improve the outputs of older AI models, but it does not have the same effect on newer models like GPT-4 that already have a sophisticated understanding of an input.

Q: How can role prompting still be effective?

A: Role prompting can still be a great prompting technique, even with newer models, if we introduce longer and more descriptive role prompts, ask the AI to automatically generate a role, or combine multiple role prompted LLMs to work together.
