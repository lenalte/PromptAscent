
# Giving Instructions

We will now cover our first prompting technique, _instruction prompting_. We have already seen simple instructions used in previous articles (e.g. getting an AI to solve the math problem). However,
we can instruct Gen AIs to do much more complex tasks.

### Name Parsing Example

A common problem when collecting name data is that different people format their names differently. Some might have `Mrs.` or `Jr.`. Additionally, the first and last name could be out of order. In the past, cleaning data like this has been a boring, manual task. Now, we can fully automate it with a simple prompt.
Try changing the name until you find one that the prompt does not properly handle.
If you are able to do this, perhaps you will be able to improve to prompt as well!
This is a fun exercise to improve your prompt engineering skills!

Input:
A user has input their first and last name into a form. We don't know in which order their first name and last name are, but we need it to be in this format '<Last name>, <First name>'.
Please convert the following name in the expected format: John Smith

Output: Smith, John

### Personally Identifiable Information Removal Example

PII removal is another relevant task. Before releasing private documents, corporations or governments may manually redact information from documents. Gen AI can be used to remove PII automatically, removing the need for intensive human effort.

AIInput:
Read the following sales email. Remove any personally identifiable information (PII),
and replace it with the appropriate placeholder. For example, replace the name "John Doe"
with "[NAME]".

Hi John,

I'm writing to you because I noticed you recently purchased a new car. I'm a salesperson
at a local dealership (Cheap Dealz), and I wanted to let you know that we have a great deal on a new
car. If you're interested, please let me know.

Thanks,

Jimmy Smith

Phone: 410-805-2345
Email: jimmysmith@cheapdealz.com

Here is the AI's response:

AIOutput:
Hi [NAME],

I'm writing to you because I noticed you recently purchased a new car. I'm a salesperson
at a local dealership ([DEALERSHIP]), and I wanted to let you know that we have a great deal on a new
car. If you're interested, please let me know.

Thanks,

[SALESPERSON]

Phone: [PHONE NUMBER]
Email: [EMAIL ADDRESS]

It is very exciting to see how the model can extrapolate from the instructions. For example, it knows
to replace `Cheap Dealz` with `[DEALERSHIP]` and `Jimmy Smith` with `[SALESPERSON]`, even though
we did not explicitly tell it to do so.

### Essay Evaluation and Feedback Example

Gen AI can be utilized to evaluate and provide feedback on essays based on a complex set of criteria. This includes elements such as grammar, clarity, coherence, and argument quality.

AIInput:
Read the following excerpt from an essay and provide feedback based on the following criteria: grammar, clarity, coherence, argument quality, and use of evidence. Provide a score from 1-10 for each attribute, along with reasoning for your score.

"Despite the popular belief, there's no solid evidence supporting the idea that video games lead to violent behavior. Research on the topic is often contradictory and inconclusive. Some studies found a correlation, but correlation don't imply causation. So, it's premature to blame video games for violence in society."

The AI's response:
AIOutput:
Attribute: Grammar
Score: 9
Reasoning: The essay is mostly grammatically correct, but there is a minor error - 'correlation don't imply causation' should be 'correlation doesn't imply causation'.

Attribute: Clarity
Score: 8
Reasoning: The essay is generally clear, but could provide more detail or explanation about the contradictory and inconclusive nature of the research.

Attribute: Coherence
Score: 8
Reasoning: The arguments are coherent and related, but the transition between them could be smoother.

Attribute: Argument Quality
Score: 7
Reasoning: The argument presented is logical and well-reasoned, but it could be strengthened with a clearer statement of the writer's position on the issue.

## Conclusion

Instruction prompting consists of giving a Gen AI some task or direction. Although the concept is simple, Gen AIs are able to follow very complex instructions. Instruction prompting will be used frequently throughout this course.
Allowing AI to remove PII from text is a promising approach, but it should be used with extraordinary caution as it may make mistakes. It should also be noted in this example that you are sending PII to a third-party (e.g. OpenAI if you are using ChatGPT), and these services may record and use your prompts for their own needs.
We used a different Gen AI, GPT-3, for this example.
