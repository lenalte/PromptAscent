
# Showing Examples (Few-Shot)

Yet another prompting strategy is _few-shot prompting_, which is basically just showing the model a few examples (also called "shots") of what you want it to do. Few shot prompts allows the AI to learn from these few examples.

Consider the above example, in which we are attempting to classify customer feedback as positive or negative. We show the model three examples of positive/negative feedback, then we show it a new piece of feedback that has not been classified yet (`It doesnt work!:`). The model sees that the first three examples were classified as either `positive` or `negative`, and uses this information to classify the new example as `negative`.

## Structure

The way that we structure the examples is very important. Given that we have organized these three instances in an `input: classification` format, the model generates a single word following the final line, rather than outputting a complete sentence such as `this review is positive`.

### More on structure

A key use case for few-shot prompting is when you need the output to be **structured in a specific way** that is difficult to describe to the model. To understand this, let's consider a relevant example: say you are conducting an economic analysis and need to compile the names and occupations of well known citizens in towns nearby by analyzing local newspaper articles. You would like the model to read each article and output a list of names and occupations in `First Last [OCCUPATION]` format. In order to get the model to do this, you can show it a few examples.

By showing the model examples of the correct output format, it is able to produce the correct output for new articles. We could produce this same output by using an instruction prompt instead, but the few-shot prompt works much more consistently.

## Variants of Shot Prompting

The word "shot" is synonymous with "example". Aside from few-shot prompting, there are two other types of shot prompting that exist. The only difference between these variants is how many examples you show the model.

### Zero-Shot Prompting

Zero-shot prompting prompting is the most basic form of prompting. It simply shows the model a prompt without examples and asks it to generate a response. As such, all of the instruction and role prompts that you have seen so far are zero-shot prompts. An additional example of a zero-shot prompt is:

AIInput: Add 2+2:

It is zero-shot since we have not shown the model any complete examples.

### One-Shot Prompting

One-shot prompting is when you show the model a single example. For example, the one-shot analogue of the zero-shot prompt `Add 2+2:` is:

AIInput:
  Add 3+3: 6
  Add 2+2:

We have shown the model only one complete example (`Add 3+3: 6`), so this is a one-shot prompt.

### Few-shot prompting

Few-shot prompting is when you show the model 2 or more examples. The few-shot analogue of the above two prompts is:

AIInput:
  Add 3+3: 6
  Add 5+5: 10
  Add 2+2:

This is a few-shot prompt since we have shown the model at least 2 complete examples (`Add 3+3: 6` and `Add 5+5: 10`). Usually, the more examples you show the model, the better the output will be, so few-shot prompting is preferred over zero-shot and one-shot prompting in most cases.

## Conclusion

In conclusion, few-shot prompting is an effective strategy that can guide the model to generate accurate and appropriately structured responses. By providing multiple examples, few-shot prompting allows the model to understand the desired output format and respond accordingly, making it a preferred method over zero-shot and one-shot prompting in most scenarios.
Few-shot prompting is also called in-context learning. The technical word for these examples is _exemplars_. These techniques are useful when you don't have examples.
