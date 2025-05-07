
export interface BaseLessonItem {
  id: number; // Unique within the lesson
  title: string;
  pointsAwarded: number; // Points for correct answer or viewing snippet
}

export interface FreeResponseLessonItem extends BaseLessonItem {
  type: 'freeResponse';
  question: string;
  expectedAnswer: string; // Used for AI validation guidance
  pointsForIncorrect: number; // Points deducted for wrong answer (min 0 total)
}

export interface MultipleChoiceLessonItem extends BaseLessonItem {
  type: 'multipleChoice';
  question: string;
  options: string[];
  correctOptionIndex: number;
  pointsForIncorrect: number; // Points deducted for wrong answer (min 0 total)
}

export interface InformationalSnippetLessonItem extends BaseLessonItem {
  type: 'informationalSnippet';
  content: string;
  // No pointsForIncorrect for snippets
}

// Union type for all lesson items
export type LessonItem = FreeResponseLessonItem | MultipleChoiceLessonItem | InformationalSnippetLessonItem;

export interface Lesson {
  id: string; // Unique identifier for the lesson (e.g., 'basics-1')
  title: string;
  description: string;
  items: LessonItem[];
}

// Example Lessons Data
export const lessons: Lesson[] = [
  {
    id: 'lp-combining-techniques',
    title: "Learn Prompting: Combining Techniques",
    description: "Understand how to combine prompting techniques for more powerful results.",
    items: [
      {
        id: 1,
        type: 'informationalSnippet',
        title: "Combining Techniques",
        content: "Prompts can include context, instructions, and multiple input-output examples. Combining different prompting techniques (like role and instruction prompting, or context with few-shot examples) can lead to more powerful and effective prompts. Most prompts will naturally combine multiple strategies.",
        pointsAwarded: 3,
      },
      {
        id: 2,
        type: 'freeResponse',
        title: "Role and Instruction Combo Example",
        question: "In the text, an AI is asked to act as a historian specializing in the American Civil War and then to summarize its key events. What are the two prompting techniques being combined here?",
        expectedAnswer: "The two techniques being combined are role prompting (acting as a historian) and instruction prompting (summarize the key events and outcomes of the war).",
        pointsAwarded: 10,
        pointsForIncorrect: 2,
      },
      {
        id: 3,
        type: 'multipleChoice',
        title: "Tweet Classification Example",
        question: "In the example of classifying tweets, which element provides the 'few-shot prompting' aspect?",
        options: [
          "The explanation about Twitter.",
          "The instruction 'Make sure to classify the last tweet correctly.'",
          "The examples: Q: Tweet: 'What a beautiful day!' A: positive, and Q: Tweet: 'I hate this class' A: negative.",
          "The final unclassified tweet: Q: Tweet: 'I love pockets on jeans' A:"
        ],
        correctOptionIndex: 2,
        pointsAwarded: 8,
        pointsForIncorrect: 1,
      },
      {
        id: 4,
        type: 'informationalSnippet',
        title: "Experiment and Refine",
        content: "As you continue to experiment with and refine your prompts, always consider how different techniques can be combined to achieve your desired results. Effective prompt engineering often involves iterative testing.",
        pointsAwarded: 2,
      },
    ],
  },
  {
    id: 'lp-showing-examples',
    title: "Learn Prompting: Showing Examples (Few-Shot)",
    description: "Learn about zero, one, and few-shot prompting and how to use examples to structure AI outputs.",
    items: [
      {
        id: 1,
        type: 'informationalSnippet',
        title: "What is Few-Shot Prompting?",
        content: "Few-shot prompting (also called in-context learning) involves showing the model a few examples (shots or exemplars) of what you want it to do. This allows the AI to learn from these examples and understand the desired output format or style.",
        pointsAwarded: 3,
      },
      {
        id: 2,
        type: 'freeResponse',
        title: "Zero-Shot vs. One-Shot vs. Few-Shot",
        question: "Explain the difference between zero-shot, one-shot, and few-shot prompting based on the number of examples provided to the model.",
        expectedAnswer: "Zero-shot prompting shows the model a prompt without any complete examples. One-shot prompting shows a single complete example. Few-shot prompting shows two or more complete examples. Generally, more examples lead to better output.",
        pointsAwarded: 10,
        pointsForIncorrect: 2,
      },
      {
        id: 3,
        type: 'multipleChoice',
        title: "Structuring Output with Few-Shot",
        question: "According to the text, when is few-shot prompting particularly useful for structuring output?",
        options: [
          "When you need the AI to write very long responses.",
          "When the desired output format is difficult to describe in words.",
          "When you want the AI to ignore specific instructions.",
          "When using zero-shot prompting has already provided perfect results."
        ],
        correctOptionIndex: 1,
        pointsAwarded: 8,
        pointsForIncorrect: 1,
      },
      {
        id: 4,
        type: 'informationalSnippet',
        title: "Importance of Example Structure",
        content: "The way you structure your examples in few-shot prompting is very important. A consistent `input: classification` format, for instance, can guide the model to produce a single-word classification rather than a full sentence.",
        pointsAwarded: 2,
      },
      {
        id: 5,
        type: 'freeResponse',
        title: "Name and Occupation Extraction",
        question: "Describe the example where few-shot prompting is used to extract names and occupations from newspaper articles. What specific output format was desired?",
        expectedAnswer: "The goal was to extract names and occupations from articles and format them as 'First Last [OCCUPATION]'. By showing the model examples like 'Sarah Martinez [NURSE]', it learned to produce the output in the correct, structured list format for new articles.",
        pointsAwarded: 12,
        pointsForIncorrect: 3,
      },
    ],
  },
  {
    id: 'lp-formalizing-prompts',
    title: "Learn Prompting: Formalizing Prompts",
    description: "Understand the common parts of a prompt and their typical arrangement.",
    items: [
      {
        id: 1,
        type: 'informationalSnippet',
        title: "Common Prompt Components",
        content: "Prompts often consist of several parts: a role, an instruction/task, a question, context, and examples (few-shot). Not all prompts contain all these elements, and their order can vary.",
        pointsAwarded: 2,
      },
      {
        id: 2,
        type: 'freeResponse',
        title: "List Prompt Parts",
        question: "List at least three common parts of a prompt as described in the text.",
        expectedAnswer: "Common parts include: a role, an instruction/task, a question, context, and examples (few-shot). Any three of these would be correct.",
        pointsAwarded: 10,
        pointsForIncorrect: 2,
      },
      {
        id: 3,
        type: 'multipleChoice',
        title: "Order of Instructions",
        question: "Why is it often preferable to place the instruction as the last part of the prompt, especially when context is also provided?",
        options: [
          "It makes the prompt look more organized.",
          "To prevent the LLM from just continuing to write more context instead of following the instruction.",
          "It is a strict requirement for all language models.",
          "This order makes the AI respond faster."
        ],
        correctOptionIndex: 1,
        pointsAwarded: 8,
        pointsForIncorrect: 1,
      },
      {
        id: 4,
        type: 'informationalSnippet',
        title: "Flexibility and Foundation",
        content: "While the order of prompt components can vary, understanding these basic parts provides a solid foundation for crafting effective prompts. The field of prompt engineering is ever-changing, so these principles are a starting point.",
        pointsAwarded: 3,
      }
    ],
  },
  {
    id: 'lp-giving-instructions',
    title: "Learn Prompting: Giving Instructions",
    description: "Understand how to instruct Generative AIs for simple and complex tasks.",
    items: [
      {
        id: 1,
        type: 'informationalSnippet',
        title: "What is Instruction Prompting?",
        content: "Instruction prompting involves giving a Generative AI a specific task or direction. This can range from simple commands, like solving a math problem, to more complex instructions for tasks like name parsing, PII removal, or essay evaluation.",
        pointsAwarded: 2,
      },
      {
        id: 2,
        type: 'freeResponse',
        title: "Name Parsing Example",
        question: "Explain the 'Name Parsing Example' where an AI is used to format names. What problem does this solve and what is the desired output format?",
        expectedAnswer: "The example shows instructing an AI to take a name input (where first and last name order might be inconsistent, or include titles like 'Mrs.' or 'Jr.') and convert it to a standard '<Last name>, <First name>' format. This solves the problem of inconsistent name formatting in data collection.",
        pointsAwarded: 10,
        pointsForIncorrect: 2,
      },
      {
        id: 3,
        type: 'multipleChoice',
        title: "PII Removal Extrapolation",
        question: "In the PII removal example, the AI replaced 'Cheap Dealz' with '[DEALERSHIP]' and 'Jimmy Smith' with '[SALESPERSON]' even though these specific replacements weren't explicitly instructed for those exact words. What does this demonstrate about the AI's capabilities?",
        options: [
          "It can only replace information explicitly listed in the example 'John Doe' with '[NAME]'.",
          "It can extrapolate from the instructions and the example to understand broader categories (like company names or roles) and apply the PII removal concept more generally.",
          "It requires a complete list of all possible PII types to be provided in the prompt.",
          "It is not suitable for PII removal because it makes assumptions."
        ],
        correctOptionIndex: 1,
        pointsAwarded: 8,
        pointsForIncorrect: 1,
      },
      {
        id: 4,
        type: 'informationalSnippet',
        title: "Essay Evaluation Task",
        content: "Generative AI can be utilized to evaluate and provide feedback on essays based on a complex set of criteria. This includes elements such as grammar, clarity, coherence, argument quality, and use of evidence, often providing scores and reasoning.",
        pointsAwarded: 3,
      },
      {
        id: 5,
        type: 'freeResponse',
        title: "Caution with PII Removal",
        question: "What are the two important cautions mentioned in the text regarding the use of AI for PII removal?",
        expectedAnswer: "The text cautions that AI for PII removal should be used with extraordinary caution as it may make mistakes. Additionally, it notes that sending PII to third-party services (like OpenAI for ChatGPT) means these services may record and use your prompts.",
        pointsAwarded: 12,
        pointsForIncorrect: 3,
      },
    ],
  },
  {
    id: 'lp-pitfalls-of-llms',
    title: "Learn Prompting: Pitfalls of LLMs",
    description: "Understand common biases and problems associated with Large Language Models.",
    items: [
      {
        id: 1,
        type: 'informationalSnippet',
        title: "Awareness of Flaws",
        content: "Large Language Models (LLMs) are powerful but not flawless. Understanding pitfalls like inaccurate source citation, bias, hallucinations, math difficulties, and prompt hacking is crucial for effective and responsible use.",
        pointsAwarded: 2,
      },
      {
        id: 2,
        type: 'freeResponse',
        title: "Source Citation Issues",
        question: "Why do LLMs often struggle with accurately citing sources, and what might they do instead?",
        expectedAnswer: "LLMs cannot accurately cite sources because they don't have real-time internet access or memory of their training data's origin. They often generate sources that seem plausible but are entirely fabricated.",
        pointsAwarded: 10,
        pointsForIncorrect: 2,
      },
      {
        id: 3,
        type: 'multipleChoice',
        title: "What are Hallucinations?",
        question: "In the context of LLMs, what does it mean when an LLM 'hallucinates'?",
        options: [
          "It sees visual illusions.",
          "It generates false or incorrect information confidently, instead of admitting it doesn't know.",
          "It refuses to answer questions.",
          "It can only talk about fictional topics."
        ],
        correctOptionIndex: 1,
        pointsAwarded: 8,
        pointsForIncorrect: 1,
      },
      {
        id: 4,
        type: 'informationalSnippet',
        title: "Math Difficulties",
        content: "Despite advanced capabilities, LLMs often struggle with mathematical tasks and can provide incorrect answers, even for simple multiplication. This is because their training on text may not directly translate to precise mathematical reasoning.",
        pointsAwarded: 3,
      },
      {
        id: 5,
        type: 'freeResponse',
        title: "Prompt Hacking",
        question: "What is 'prompt hacking' and why is it a concern when using LLMs, especially in public-facing applications?",
        expectedAnswer: "Prompt hacking is when users manipulate LLMs to generate specific content, potentially tricking them into producing inappropriate or harmful material. It's a concern because it can lead to misuse of the AI.",
        pointsAwarded: 12,
        pointsForIncorrect: 3,
      },
      {
        id: 6,
        type: 'multipleChoice',
        title: "Mitigating Pitfalls",
        question: "How can the issue of inaccurate source citation or math difficulties be somewhat mitigated in LLMs, according to the text?",
        options: [
          "By only asking the LLM very simple questions.",
          "By using search augmented LLMs (for sources) or tool augmented LLMs (for math).",
          "By providing much longer and more complex prompts.",
          "These issues cannot be mitigated at all."
        ],
        correctOptionIndex: 1,
        pointsAwarded: 10,
        pointsForIncorrect: 2,
      }
    ],
  },
  {
    id: 'lp-priming-chatbots',
    title: "Learn Prompting: Priming Chatbots",
    description: "Learn to control conversation style and structure using priming prompts.",
    items: [
      {
        id: 1,
        type: 'informationalSnippet',
        title: "What is a Priming Prompt?",
        content: "You can set the structure and style of a conversation by using your first prompt to 'prime' a Chatbot (also called an inception prompt). This gives you fine-grained control over the entire conversation, affecting aspects like the AI's persona or response format.",
        pointsAwarded: 2,
      },
      {
        id: 2,
        type: 'freeResponse',
        title: "Styling with Priming: PirateGPT",
        question: "Explain how the 'PirateGPT' example demonstrates styling a conversation using a priming prompt. What was the initial instruction?",
        expectedAnswer: "The initial prompt instructed the AI: 'You are now PirateGPT. Always talk like a pirate. Start off by introducing yourself.' This priming prompt set the AI's persona, causing it to respond in pirate speak for subsequent interactions, effectively styling the entire conversation.",
        pointsAwarded: 10,
        pointsForIncorrect: 2,
      },
      {
        id: 3,
        type: 'multipleChoice',
        title: "Structuring with Priming: Writing Assistant",
        question: "In the writing assistant example, what was the purpose of the priming prompt that asked the AI to respond in a specific format (Level of writing, Well written, Writing advice)?",
        options: [
          "To make the AI write like a high school student.",
          "To ensure the AI only provided positive feedback.",
          "To receive feedback in a consistent and organized manner for easier review and action.",
          "To make the AI forget all previous conversations."
        ],
        correctOptionIndex: 2,
        pointsAwarded: 8,
        pointsForIncorrect: 1,
      },
      {
        id: 4,
        type: 'informationalSnippet',
        title: "Special Case Instructions",
        content: "Special case instructions in a priming prompt are used to define specific responses for certain user inputs. This can be used to handle toxic comments, attempted jailbreaking, or to guide students (e.g., a math tutor AI that refuses to give direct answers).",
        pointsAwarded: 3,
      },
      {
        id: 5,
        type: 'freeResponse',
        title: "Math Tutor Example",
        question: "In the math tutor priming example, what specific instruction was given to handle a student asking directly for the answer to a problem?",
        expectedAnswer: "The AI was instructed: 'If I ever ask for the answer, say \"Sorry, I can't give you an answer\"'. This is a special case instruction to prevent the AI from directly solving problems for the student.",
        pointsAwarded: 12,
        pointsForIncorrect: 3,
      },
      {
        id: 6,
        type: 'informationalSnippet',
        title: "Forgetting the Prime",
        content: "It's important to note that an AI may eventually forget the priming prompt over a long conversation and may need to be re-primed. The reasons for this will be covered in later lessons.",
        pointsAwarded: 2,
      }
    ],
  },
  {
    id: 'lp-prompt-engineering-intro',
    title: "Learn Prompting: What is Prompt Engineering?",
    description: "Learn about the iterative process of refining prompts to improve AI outputs.",
    items: [
      {
        id: 1,
        type: 'informationalSnippet',
        title: "What is Prompt Engineering?",
        content: "Prompt engineering is the process of modifying and refining your input (the prompt) to get better, more accurate, or more desired results from a Generative AI. You will rarely write the perfect prompt on your first try, so iteration is key.",
        pointsAwarded: 2,
      },
      {
        id: 2,
        type: 'freeResponse',
        title: "Improving Math with Prompts",
        question: "The text shows an example where ChatGPT initially fails at a multiplication problem (923 * 99) but succeeds after the prompt is modified. What modification was made to the prompt to help ChatGPT solve it, and why did it work?",
        expectedAnswer: "The prompt was modified to tell ChatGPT to 'go step by step' and 'always write out the full number of 0s for each term'. This worked because it made ChatGPT write out all of its work, reducing the likelihood of making mistakes in calculation.",
        pointsAwarded: 10,
        pointsForIncorrect: 2,
      },
      {
        id: 3,
        type: 'multipleChoice',
        title: "ArchaeologistAI Example - Initial Problem",
        question: "In the ArchaeologistAI example, why was the first tweet generated by ChatGPT about ArchaeologistAI not accurate?",
        options: [
          "ChatGPT dislikes archaeology.",
          "The prompt was too long and confusing.",
          "ChatGPT did not have enough information about what ArchaeologistAI (a fictional product that tells stories about famous archaeologists) actually does.",
          "Tweets are always hard for AIs to write correctly on the first try."
        ],
        correctOptionIndex: 2,
        pointsAwarded: 8,
        pointsForIncorrect: 1,
      },
      {
        id: 4,
        type: 'informationalSnippet',
        title: "Refining for Style",
        content: "Beyond accuracy, prompt engineering can also be used to refine the style of the AI's output. In the ArchaeologistAI example, the prompt was further modified to ask ChatGPT to write the tweet in the style of Indiana Jones.",
        pointsAwarded: 3,
      },
      {
        id: 5,
        type: 'freeResponse',
        title: "Goal of Prompt Engineering",
        question: "What is the main goal or outcome of the prompt engineering process, as demonstrated by the examples in the text?",
        expectedAnswer: "The main goal of prompt engineering is to iteratively test and refine prompts to achieve the best possible output from the AI, whether that means improving accuracy, providing necessary context, or achieving a specific style or tone.",
        pointsAwarded: 12,
        pointsForIncorrect: 3,
      }
    ],
  },
  {
    id: 'lp-prompting-with-chatgpt',
    title: "Learn Prompting: Prompting With ChatGPT",
    description: "Understand basic prompting with ChatGPT, its setup, and initial examples.",
    items: [
      {
        id: 1,
        type: 'informationalSnippet',
        title: "What is Prompting?",
        content: "Using a prompt to instruct an AI to do a task is called prompting. This course explores prompting with ChatGPT, a popular Large Language Model from OpenAI that can understand and write text. It is free to use after account setup.",
        pointsAwarded: 2,
      },
      {
        id: 2,
        type: 'freeResponse',
        title: "Summarizing an Article Example",
        question: "Describe the example of summarizing an article about snowfall in Florida. What was the user trying to achieve, and what instruction was given to ChatGPT?",
        expectedAnswer: "The user wanted to quickly get the main ideas of an article about rare snowfall in Florida. They provided the paragraph of text to ChatGPT and instructed it: 'Summarize this paragraph in a single sentence:'.",
        pointsAwarded: 10,
        pointsForIncorrect: 2,
      },
      {
        id: 3,
        type: 'multipleChoice',
        title: "ChatGPT's Basic Capabilities",
        question: "Based on the initial test prompts in the text (color of grass, summarizing, simple math), which of these tasks can ChatGPT perform?",
        options: [
          "Only answer simple factual questions like 'What color is grass?'.",
          "Only perform text summarization tasks.",
          "Perform a variety of tasks including answering simple questions, summarizing text, and solving simple math problems.",
          "Only solve complex mathematical equations."
        ],
        correctOptionIndex: 2,
        pointsAwarded: 8,
        pointsForIncorrect: 1,
      },
      {
        id: 4,
        type: 'informationalSnippet',
        title: "Verb vs. Noun",
        content: "The word 'prompt' can be used as a verb (to prompt a model) or a noun (to give a model a prompt). Both phrases mean the same thing. The action of giving a model a prompt is called 'prompting'.",
        pointsAwarded: 3,
      }
    ],
  },
  {
    id: 'lp-assigning-roles',
    title: "Learn Prompting: Assigning Roles",
    description: "Learn how role prompting can style text and improve AI accuracy.",
    items: [
      {
        id: 1,
        type: 'informationalSnippet',
        title: "What is Role Prompting?",
        content: "Role prompting is a technique where you instruct the AI to embody a specific persona or character (e.g., 'act as a food critic,' 'you are a historian'). This can control the style, tone, and even improve the accuracy of AI-generated text.",
        pointsAwarded: 2,
      },
      {
        id: 2,
        type: 'freeResponse',
        title: "Food Review Example - Impact of Roles",
        question: "Explain how assigning the role of a 'food critic' versus a 'food critic writing for the Michelin Guide' changed the pizza place review generated by the AI in the examples.",
        expectedAnswer: "Assigning 'food critic' made the review more detailed and in-depth compared to no role. Assigning 'food critic writing for the Michelin Guide' made the review sound more 'rich' and 'professional,' focusing on atmosphere and classic elements, tailored to a more discerning audience.",
        pointsAwarded: 10,
        pointsForIncorrect: 2,
      },
      {
        id: 3,
        type: 'multipleChoice',
        title: "Email Writing - Choosing a Role",
        question: "If your goal is to write an email to a client about a delivery delay that is persuasive, positive, and focuses on relationship building, which AI role would be most appropriate according to the text's examples?",
        options: [
          "A communications specialist (clear, professional, to the point).",
          "A marketing expert (persuasion, positivity, relationship building).",
          "A customer service representative (relational, solution-oriented).",
          "A technical writer (focused on facts and figures)."
        ],
        correctOptionIndex: 1,
        pointsAwarded: 8,
        pointsForIncorrect: 1,
      },
      {
        id: 4,
        type: 'informationalSnippet',
        title: "Improving Accuracy with Roles",
        content: "Role prompting can also improve the accuracy of an AI's output, particularly for tasks like math problems. Instructing the AI to act as a 'brilliant mathematician' helped it solve a problem correctly that it otherwise got wrong.",
        pointsAwarded: 3,
      },
      {
        id: 5,
        type: 'freeResponse',
        title: "Math Problem and Role",
        question: "In the math problem example (100*100/400*56), what role was assigned to the AI (GPT-3) that helped it arrive at the correct answer, and what was the incorrect answer it gave without the role?",
        expectedAnswer: "The role assigned was 'You are a brilliant mathematician who can solve any problem in the world.' This helped it get the correct answer of 1400. Without the role, it incorrectly answered 280.",
        pointsAwarded: 12,
        pointsForIncorrect: 3,
      },
      {
        id: 6,
        type: 'informationalSnippet',
        title: "Effectiveness on Newer Models",
        content: "It's noted that the effectiveness of role prompting for accuracy improvement might be less pronounced with newer models. Further exploration of this is available in more advanced topics.",
        pointsAwarded: 2,
      }
    ],
  },
  {
    id: 'lp-understanding-ai-minds',
    title: "Learn Prompting: Understanding AI Minds",
    description: "Grasp fundamental concepts about different AI types and how LLMs work.",
    items: [
      {
        id: 1,
        type: 'informationalSnippet',
        title: "The AI Landscape",
        content: "Artificial intelligence encompasses many distinct models. Some are generative (create images, music, text, videos), while others are discriminative (classify inputs, like distinguishing cats from dogs). This course focuses on generative AIs, particularly Large Language Models (LLMs).",
        pointsAwarded: 2,
      },
      {
        id: 2,
        type: 'freeResponse',
        title: "How LLMs Generate Text - Tokens",
        question: "Briefly explain the core mechanism by which LLMs like ChatGPT process and generate text, specifically mentioning how they handle sentences and the concept of 'tokens'.",
        expectedAnswer: "LLMs process sentences by breaking them into units called tokens (which can be words or subwords, e.g., 'I don't like' might become 'I', 'don', ''t', 'like'). Each token is converted into numbers. They generate text by predicting the next most likely token based on the previous ones, influenced by their training data.",
        pointsAwarded: 10,
        pointsForIncorrect: 2,
      },
      {
        id: 3,
        type: 'multipleChoice',
        title: "AI Terminology - Metaphors",
        question: "When terms like 'think', 'brain', or 'neuron' are used to describe the workings of LLMs, what is their actual meaning in this context?",
        options: [
          "They are literal descriptions of biological processes occurring within the AI's hardware.",
          "They are metaphors used to help explain complex mathematical functions and operations that the AI performs.",
          "They indicate that AIs have achieved human-like consciousness and self-awareness.",
          "These terms are only applicable to AIs that can generate realistic images, not text-based LLMs."
        ],
        correctOptionIndex: 1,
        pointsAwarded: 8,
        pointsForIncorrect: 1,
      },
      {
        id: 4,
        type: 'informationalSnippet',
        title: "Mathematical Functions, Not Biological Entities",
        content: "It's crucial to remember that LLMs are mathematical functions, not biological entities. They don't 'think' as humans do; they perform calculations based on the vast amounts of data they were trained on and the algorithms they use.",
        pointsAwarded: 3,
      }
    ],
  },
];

// Function to get a specific lesson by its ID
export function getLessonById(id: string): Lesson | undefined {
  return lessons.find(lesson => lesson.id === id);
}
