### Least-to-Most Prompting

 Takeaways:

    * Definition: Least-to-Most (LtM) prompting breaks down problems into simpler subproblems and solves them sequentially.
    * Comparison with Chain-of-Thought: Unlike Chain-of-Thought prompting, where each step is independent, LtM uses the output of previous subproblems as input for the next.
    * Performance: LtM demonstrates significantly higher accuracy than standard and Chain-of-Thought approaches in various tasks.

## What is Least-to-Most Prompting?

Least-to-Most prompting (LtM)1 takes Chain-of-Thought Prompting (CoT) a step further by first breaking a problem into sub problems then solving each one. It is a technique inspired by real-world educational strategies for children.

As in Chain-of-Thought prompting, the problem to be solved is decomposed in a set of subproblems that build upon each other. In a second step, these subproblems are solved one by one. Contrary to Chain-of-Thought, the solution of previous subproblems is fed into the prompt trying to solve the next problem.

## Least-to-Most Prompting Example: Customer Inquiry Response

Let's ask a slightly complicated customer service question:

Prompt:
[CUSTOMER INQUIRY:
I just bought a T-shirt from your Arnold collection on March 1st. I saw that it was on discount, so bought a shirt that was originall $30, and got 40% off. I saw that you have a new discount for shirts at 50%. I'm wondering if I can return the shirt and have enough store credit to buy two of your shirts?

INSTRUCTIONS:
You are a customer service agent tasked with kindly responding to customer inquiries. Returns are allowed within 30 days. Today's date is March 29th. There is currently a 50% discount on all shirts. Shirt prices range from $18-$100 at your store. Do not make up any information about discount policies.CUSTOMER INQUIRY:
I just bought a T-shirt from your Arnold collection on March 1st. I saw that it was on discount, so bought a shirt that was originall $30, and got 40% off. I saw that you have a new discount for shirts at 50%. I'm wondering if I can return the shirt and have enough store credit to buy two of your shirts?

INSTRUCTIONS:
You are a customer service agent tasked with kindly responding to customer inquiries. Returns are allowed within 30 days. Today's date is March 29th. There is currently a 50% discount on all shirts. Shirt prices range from $18-$100 at your store. Do not make up any information about discount policies.]

Possible AI Output:
[Thank you for your inquiry. Unfortunately, since you purchased the shirt on March 1st, it is outside of our 30-day return policy. However, we do have a 50% discount on all shirts currently, so you could purchase two shirts with the same amount of store credit. Prices for our shirts range from $18-$100. Please let us know if you have any other questions.]

That failed (we are within the return time), so let's try to break it down into subproblems:

Prompt:
[CUSTOMER INQUIRY:
I just bought a T-shirt from your Arnold collection on March 1st. I saw that it was on discount, so bought a shirt that was originall $30, and got 40% off. I saw that you have a new discount for shirts at 50%. I'm wondering if I can return the shirt and have enough store credit to buy two of your shirts?

INSTRUCTIONS:
You are a customer service agent tasked with kindly responding to customer inquiries. Returns are allowed within 30 days. Today's date is March 29th. There is currently a 50% discount on all shirts. Shirt prices range from $18-$100 at your store. Do not make up any information about discount policies.
What subproblems must be solved before answering the inquiry?]

Possible AI Output:
[1. Determine if the customer is within the 30-day return window.
2. Calculate the amount of store credit the customer would receive if they returned the shirt.
3. Calculate the cost of two shirts at the current 50% discount.
4. Determine if the customer has enough store credit to purchase two shirts.]

Let's try to solve the first subproblem:

Prompt:
[CUSTOMER INQUIRY:
I just bought a T-shirt from your Arnold collection on March 1st. I saw that it was on discount, so bought a shirt that was originally $30, and got 40% off. I saw that you have a new discount for shirts at 50%. I'm wondering if I can return the shirt and have enough store credit to buy two of your shirts?

INSTRUCTIONS:
You are a customer service agent tasked with kindly responding to customer inquiries. Returns are allowed within 30 days. Today's date is March 29th. There is currently a 50% discount on all shirts. Shirt prices range from $18-$100 at your store. Do not make up any information about discount policies.
Determine if the customer is within the 30-day return window. Let's go step by step.]

Possible AI Output:
[Yes, the customer is within the 30-day return window. The customer purchased the shirt on March 1st, and today's date is March 29th, which is within the 30-day return window. 

Therefore, the customer is eligible to return the shirt and receive store credit for the purchase. The customer can use the store credit to purchase two shirts at the current 50% discount.]

By just solving the first subproblem, we were able to solve the entire problem. If GPT-3 did not return an answer immediately, we could have solved the next subproblem and so on until it did return an answer. Note that we use Let's go step by step.. The addition of this phrase is not always necessary, but it helps for this example.

## Least-to-Most Prompting Example: letter concatenation

LtM was originally introduced using Few-Shot Prompting, rather than an explicit instruction to break down a problem into multiple steps (as seen above). Additionally, it can sometimes be implemented with a single prompt rather than chained prompts. Let's examine the problem of concatenating the last letter of individual words2 (for example, given cake, etymology as input words, the output should be ey).

# First attempt: Standard

The standard prompt with Few-Shot examples performs very poorly, even with a more advanced model such as text-davinci-003.

Prompt:
[Q: think, machine
A: ke

Q: learning, reasoning, generalization
A: ggn

Q: artificial, intelligence
A: le

Q: transformer, language, vision
A: ren

Q: foo,bar,baz,blip
A:]

Possible AI Output:
[lip]

# Second attempt: Chain-of-Thought

Chain-of-Thought performs significantly better than standard prompting. This is because it now allows the model to consider extracting the last letter of each word on its own, reducing the complexity down to the operation of grouping letters it has previously collected. However, this starts to break down at larger sizes.

Prompt:
[Q: think, machine
A: The last letter of "think" is "k". The last letter of "machine" is "e". So "think, machine" is "ke".

Q: learning, reasoning, generalization
A: The last letter of "learning" is "g". The last letter of "reasoning" is "n". The last letter of "generalization" is "n". So "learning, reasoning, generalization" is "ggn".

Q: artificial, intelligence
A: The last letter of "artificial" is "l". The last letter of "intelligence" is "e". So "artificial, intelligence" is "le".

Q: transformer, language, vision
A: The last letter of "transformer" is "r". The last letter of "language" is "e". The last letter of "vision" is "n". So "transformer, language, vision" is "ren".

Q: foo,bar,baz,blip
A:]

Possible AI Output:
[The last letter of "foo" is "o". The last letter of "bar" is "r". The last letter of "baz" is "z". The last letter of "blip" is "p". So "foo,bar,baz,blip" is "orzp".]

# Third attempt: Least-to-Most (single prompt)

With Least-to-Most prompting, we augment the Chain-of-Thought concept by reformulating the individual steps to restate the previously concatenated result. This simplifies each step to concatenating only a single new letter. This leads to good performance all the way to 12 or more words.

This approach may look very similar to Chain-of-Thought, but it is conceptually very different. Here, at every step, we introduce the previous concatenation. In the case of "think, machine, learning", instead of concatenating the letters "k", "e", and "g" individually, it will concatenate "k" and "e", then "ke" and "g". As a result of this reintroduction of the previous work, the model can now generalize to much longer chains because it carries the result incrementally along and only needs to do a small amount of work at each step.

Prompt:
[Q: think, machine
A: The last letter of "think" is "k". The last letter of "machine" is "e". Concatenating "k" and "e" gives "ke". So "think, machine" output "ke".

Q: think, machine, learning
A: "think, machine" outputs "ke". The last letter of "learning" is "g". Concatenating "ke" and "g" gives "keg". So "think, machine, learning" is "keg".

Q: transformer, language
A: The last letter of "transformer" is "r". The last letter of "language" is "e". Concatenating "r" and "e" gives "re". So "transformer, language" is "re".

Q: transformer, language, vision
A: "transformer, language" outputs "re". The last letter of "vision" is "n". Concatenating "re" and "n" gives "ren". So "transformer, language, vision" is "ren".

Q: foo,bar,baz,blip,learn,prompting,world,shaking,event,dancefloor,prisma,giraffe
A:]

Possible AI Output:
[The last letter of "foo" is "o". The last letter of "bar" is "r". Concatenating "o" and "r" gives "or". The last letter of "baz" is "z". Concatenating "or" and "z" gives "orz". The last letter of "blip" is "p". Concatenating "orz" and "p" gives "orzp". The last letter of "learn" is "n". Concatenating "orzp" and "n" gives "orzpn". The last letter of "prompting" is "g". Concatenating "orzpn" and "g" gives "orzpng". The last letter of "world" is "d". Concatenating "orzpng" and "d" gives "orzpngd". The last letter of "shaking" is "g". Concatenating "orzpngd" and "g" gives "orzpngdg". The last letter of "event" is "t". Concatenating "orzpngdg" and "t" gives "orzpngdgt".]

# Results

On the last letter concatenation problem with 12 words, Chain-of-Thought is 34% accurate, while Least-to-Most is 74% accurate (the paper uses text-davinci-002 as a model).

## Least-to-Most Prompting Example: compositional generalization (SCAN)

The SCAN benchmark3 requires the model to convert natural language to sequences of actions. For example, the sentence "run left and walk twice" would be translated to "TURN_LEFT + RUN + WALK * 2". Language models perform especially poorly when confronted with sequences that are longer than those in the training set.

# First attempt: Standard prompting

Using simple standard prompts, text-davinci-003 gets impressively far but still fails.

Prompt:
[Q: turn left
A: TURN LEFT

Q: turn right
A: TURN RIGHT

Q: jump left
A: TURN LEFT + JUMP

Q: run right
A: TURN RIGHT + RUN

Q: look twice
A: LOOK * 2

Q: run and look twice
A: RUN + LOOK * 2

Q: jump right thrice
A: (TURN RIGHT + JUMP) * 3

Q: walk after run
A: RUN + WALK

Q: turn opposite left
A: TURN LEFT * 2

Q: turn around left
A: TURN LEFT * 4

Q: turn opposite right
A: TURN RIGHT * 2

Q: turn around right
A: TURN RIGHT * 4

Q: walk opposite left
A: TURN LEFT * 2 + WALK

Q: walk around left
A: (TURN LEFT + WALK) * 4

Q: "jump around left twice after walk opposite left thrice" 
A:]

Possible AI Output:
[(TURN LEFT * 2 + WALK) * 3 + (TURN LEFT + JUMP) * 2]

# Second attempt: Least-to-Most, first step - Reduction

Here, we work with 2 different prompts. The first prompt is used to reduce the input problem into a simpler sequence of steps. The second prompt is used to map this simplified sequence of steps into actual actions.

Both prompts are pretty long and use compressed Python notation for the action to save on tokens.

The first step breaks the natural language description down in a more explicit, yet still human-like language. This will help the mapping step figure things out in sequence. For example, "jump around left twice" is reduced to "jump left" -> TURN_LEFT + JUMP and "jump around left" -> (TURN_LEFT + JUMP) * 4. Similarly, the reduction step is what is used to explain the concept of repetition (twice, thrice, etc...).

Prompt:
[Q: look right after look twice
A: "look right after look twice" can be solved by: "look right", "look twice".

Q: jump opposite right thrice and walk
A: "jump opposite right thrice" can be solved by: "jump opposite right", "jump opposite right thrice". "walk" can be solved by: "walk". So, "jump opposite right thrice and walk" can be solved by: "jump opposite right", "jump opposite right thrice", "walk".

Q: run left twice and run right
A: "run left twice" can be solved by: "run left", "run left twice". "run right" can be solved by "run right". So, "run left twice and run right" can be solved by: "run left", "run left twice", "run right".

Q: run opposite right
A: "run opposite right" can be solved by "run opposite right".

Q: look opposite right thrice after walk
A: "look opposite right thrice" can be solved by: "look opposite right", "look opposite right thrice". "walk" can be solved by "walk". So, "look opposite right thrice after walk" can be solved by: "look opposite right", "look opposite right thrice", "walk".

Q: jump around right
A: "jump around right" can be solved by: "jump right", "jump around right". So, "jump around right" can be solved by: "jump right", "jump around right".

Q: look around right thrice and walk
A: "look around right thrice" can be solved by: "look right", "look around right", "look around right thrice". "walk" can be solved by "walk". So, "look around right thrice and walk" can be solved by: "look right", "look around right", "look around right thrice", "walk".

Q: turn right after run right thrice
A: "turn right" can be solved by: "turn right". "run right thrice" can be solved by: "run right", "run right thrice". So, "turn right after run right thrice" can be solved by: "turn right", "run right", "run right thrice".

Q: jump around left twice after walk opposite left thrice
A:]

Possible AI Output:
["jump around left twice" can be solved by: "jump left", "jump around left", "jump around left twice". "walk opposite left thrice" can be solved by: "walk opposite left", "walk opposite left thrice". So, "jump around left twice after walk opposite left thrice" can be solved by: "jump left", "jump around left", "jump around left twice", "walk opposite left", "walk opposite left thrice".]

# Second attempt: Least-to-Most, second step - Mapping

In the second step, we use the output of the reduction, and again use a fairly long prompt (14 cases) to translate the reduced natural language description into a sequence of actions.

Here, we inject the output of the first step into the LLM:

Prompt:
[Q: turn left
A: "turn left" outputs "TURN LEFT".

Q: turn right
A: "turn right" outputs "TURN RIGHT".

Q: jump left
A: The output of "jump left" concatenates: the output of "turn left", the output of "jump". "turn left" outputs "TURN LEFT". "jump" outputs "JUMP". So concatenating the output of "turn left" and the out- put of "jump" leads to "TURN LEFT" + "JUMP". So the output of "jump left" is "TURN LEFT" + "JUMP".

Q: run right
A: The output of "run right" concatenates: the output of "turn right", the output of "run". "turn right" outputs "TURN RIGHT". "run" outputs "RUN". So concatenating the output of "turn right" and the output of "run" leads to "TURN RIGHT" + "RUN". So the output of "run right" is "TURN RIGHT" + "RUN".

Q: look twice
A: The output of "look twice" concatenates: the output of "look", the output of "look". "look" outputs "LOOK". So repeating the output of "look" two times leads to "LOOK" * 2. So the output of "look twice" is "LOOK" * 2.

Q: run and look twice
A: The output of "run and look twice" concatenates: the output of "run", the output of "look twice". "run" outputs "RUN". "look twice" outputs "LOOK" * 2. So concatenating the output of "run" and the output of "look twice" leads to "RUN" + "LOOK" * 2. So the output of "run and look twice" is "RUN" + "LOOK" * 2.

Q: jump right thrice
A: The output of "jump right thrice" concatenates: the output of "jump right", the output of "jump right", the output of "jump right". "jump right" outputs "TURN RIGHT" + "JUMP". So repeating the output of "jump right" three times leads to ("TURN RIGHT" + "JUMP") * 3. So the output of "jump right thrice" is ("TURN RIGHT" + "JUMP") * 3.

Q: walk after run
A: The output of "walk after run" concatenates: the output of "run", the output of "walk". "run" outputs "RUN". "walk" outputs "WALK". So concatenating the output of "run" and the output of "walk" leads to "RUN" + "WALK". So the output of "walk after run" is "RUN" + "WALK".

Q: turn opposite left
A: The output of "turn opposite left" concatenates: the output of "turn left", the output of "turn left". "turn left" outputs "TURN LEFT". So repeating the output of "turn left" twice leads to "TURN LEFT" * 2. So the output of "turn opposite left" is "TURN LEFT" * 2.

Q: turn around left
A: The output of "turn around left" concatenates: the output of "turn left", the output of "turn left", the output of "turn left", the output of "turn left". "turn left" outputs "TURN LEFT". So repeating the output of "turn left" four times leads to "TURN LEFT" * 4. So the output of "turn around left" is "TURN LEFT" * 4.

Q: turn opposite right
A: The output of "turn opposite right" concatenates: the output of "turn right", the output of "turn right". "turn right" outputs "TURN RIGHT". So repeating the output of "turn right" twice leads to "TURN RIGHT" * 2. So the output of "turn opposite right" is "TURN RIGHT" * 2.

Q: turn around right
A: The output of "turn around right" concatenates: the output of "turn right", the output of "turn right", the output of "turn right", the output of "turn right". "turn right" outputs "TURN RIGHT". So repeating the output of "turn right" four times leads to "TURN RIGHT" * 4. So the output of "turn around right" is "TURN RIGHT" * 4.

Q: walk opposite left
A: The output of "walk opposite left" concatenates: the output of "turn opposite left", the output of "walk". "turn opposite left" outputs "TURN LEFT" * 2. "walk" outputs "WALK". So concatenating the output of "turn opposite left" and the output of "walk" leads to "TURN LEFT" * 2 + "WALK". So the output of "walk opposite left" is "TURN LEFT" * 2 + "WALK".

Q: walk around left
A: The output of "walk around left" concatenates: the output of "walk left", the output of "walk left", the output of "walk left", the output of "walk left". "walk left" outputs "TURN LEFT" + "WALK". So repeating the output of "walk around left" four times leads to ("TURN LEFT" + "WALK") * 4. So the output of "walk around left" is ("TURN LEFT" + "WALK") * 4.

Q: "jump around left twice after walk opposite left thrice" 
A:]

Possible AI Output:
[The output of "jump around left twice after walk opposite left thrice" concatenates: the output of "walk opposite left thrice", the output of "jump around left twice". "walk opposite left thrice" outputs "TURN LEFT" * 2 + "WALK" * 3. "jump around left twice" outputs ("TURN LEFT" + "JUMP") * 4. So concatenating the output of "walk opposite left thrice" and the output of "jump around left twice" leads to "TURN LEFT" * 2 + "WALK" * 3 + ("TURN LEFT" + "JUMP") * 4. So the output of "jump around left twice after walk opposite left thrice" is "TURN LEFT" * 2 + "WALK" * 3 + ("TURN LEFT" + "JUMP") * 4.]

## Least-to-Most Prompting Results

LtM leads to multiple improvements:

    * improved accuracy over Chain-of-Thought
    * increased generalization on problems harder than those in the prompt
    * dramatically improved performance in compositional generalization, in particular, the SCAN benchmark3

Standard prompting with text-davinci-002 (the model used in the paper) results in 6% of successful SCAN problems solved, while Least-to-Most prompting results in an impressive 76% success rate. The results are even more significant with code-davinci-002, where Least-to-Most prompting achieves a 99.7% success rate.

## Conclusion

Least-to-Most prompting helps generalize the Chain-of-Thought technique to more difficult inputs by breaking down complex problems into simpler subsections. This incremental solution to the subproblems is demonstrated to greatly improve accuracy.

## FAQ

Q: How can Least-to-Most prompting help a model solve more complex problems?

A: Least-to-Most prompting improves upon Chain-of-Thought prompting because it breaks down a complex problem into simpler and more manageable subproblems. By mirroring a stepwise problem-solving approach similar to human reasoning, the model is able to apply solutions from the subproblems to more effectively tackle difficult questions where the reasoning described in Chain-of-Thought input exemplars might not be suitable.