
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
    id: 'basics-1',
    title: "Lesson 1: Prompt Engineering Basics",
    description: "Learn the fundamental concepts of crafting effective prompts.",
    items: [
      {
        id: 1,
        type: 'informationalSnippet',
        title: "Welcome to Prompt Engineering Basics!",
        content: "In this lesson, we'll explore the fundamentals of crafting effective prompts for large language models (LLMs). Understanding prompt engineering helps you get better, more predictable results from AI.",
        pointsAwarded: 2,
      },
      {
        id: 2,
        type: 'freeResponse',
        title: "What is Prompt Engineering?",
        question: "Explain in your own words what 'prompt engineering' means in the context of large language models.",
        expectedAnswer: "Prompt engineering involves designing and refining input prompts to guide large language models (LLMs) like ChatGPT towards generating desired, accurate, and relevant outputs. It focuses on clarity, context, and specific instructions.",
        pointsAwarded: 10,
        pointsForIncorrect: 2,
      },
      {
        id: 3,
        type: 'multipleChoice',
        title: "Identifying Prompt Components",
        question: "Which of the following is NOT typically considered a core component of an effective prompt?",
        options: ["Clear Instruction", "Context", "Desired Output Format", "Random Keywords"],
        correctOptionIndex: 3,
        pointsAwarded: 8,
        pointsForIncorrect: 1,
      },
      {
        id: 4,
        type: 'informationalSnippet',
        title: "Tip: Be Specific!",
        content: "Vague prompts lead to vague answers. The more specific your instructions, context, and desired output format, the better the LLM can understand and fulfill your request.",
        pointsAwarded: 3,
      },
      {
        id: 5,
        type: 'freeResponse',
        title: "Key Elements of a Good Prompt",
        question: "What are three essential components you should consider including in a prompt to make it more effective?",
        expectedAnswer: "Effective prompts often include: 1. Clear Instruction/Task: What should the LLM do? 2. Context: Relevant background information. 3. Role/Persona (Optional but helpful): Define how the LLM should act (e.g., 'Act as a historian'). Other valid elements include constraints, output format, examples (few-shot).",
        pointsAwarded: 15,
        pointsForIncorrect: 3,
      },
    ],
  },
  {
    id: 'advanced-1',
    title: "Lesson 2: Advanced Techniques",
    description: "Explore few-shot prompting and other advanced strategies.",
    items: [
         {
            id: 1,
            type: 'informationalSnippet',
            title: "Recap: Core Prompt Elements",
            content: "Remember that clear instructions, sufficient context, and defining the desired output format are crucial for basic prompt effectiveness.",
            pointsAwarded: 2,
         },
         {
            id: 2,
            type: 'multipleChoice',
            title: "Prompting Techniques",
            question: "Providing examples within the prompt to guide the model is known as:",
            options: ["Zero-shot prompting", "Meta-prompting", "Few-shot prompting", "Instructional prompting"],
            correctOptionIndex: 2,
            pointsAwarded: 10,
            pointsForIncorrect: 2,
        },
        {
            id: 3,
            type: 'informationalSnippet',
            title: "Understanding 'Few-Shot' Prompting",
            content: "Few-shot prompting gives the LLM examples of what you want. For instance, if you want it to summarize text in bullet points, show it an example input text and its bulleted summary before giving it the text you actually want summarized.",
            pointsAwarded: 4,
        },
        {
            id: 4,
            type: 'freeResponse',
            title: "Zero-Shot vs. Few-Shot Prompting",
            question: "Briefly describe the difference between zero-shot and few-shot prompting.",
            expectedAnswer: "Zero-shot prompting provides an instruction without any examples of the desired output. Few-shot prompting includes one or more examples (input/output pairs) within the prompt itself to guide the model on the expected format or style.",
            pointsAwarded: 12,
            pointsForIncorrect: 2,
        },
        // Add more items for the advanced lesson...
        {
          id: 5,
          type: 'multipleChoice',
          title: "Chain-of-Thought Prompting",
          question: "What is the primary goal of Chain-of-Thought (CoT) prompting?",
          options: [
            "To make the LLM write shorter answers.",
            "To encourage the LLM to show its reasoning steps, improving accuracy for complex tasks.",
            "To provide the LLM with many examples.",
            "To restrict the LLM's output to a specific format."
          ],
          correctOptionIndex: 1,
          pointsAwarded: 12,
          pointsForIncorrect: 3,
        },
    ],
  },
   // Add more lessons as needed
];

// Function to get a specific lesson by its ID
export function getLessonById(id: string): Lesson | undefined {
  return lessons.find(lesson => lesson.id === id);
}
