### Writing Emails

Takeaways:

    * Use AI to write emails: AI can help draft emails, from sick-day notifications to cold outreach messages.
    * Customize emails: Provide specific prompts to create emails that fit the intended tone and audience.
    * Summarize long emails: AI can summarize lengthy emails and list action items, helping you focus on key responses.
    * Personalize cold outreach: Adding details from LinkedIn profiles to prompts can make cold emails more relevant and increase response rates.

Writing emails can be time-consuming, especially when you need to read through an email you received first. This section will cover use cases ranging from a simple email telling your boss you are sick today to more complex cold lead emails.

## Basic Sick Day Email

Imagine you wake up sick one day and can't go to work (or don't want to 😈). Here is a simple prompt that writes an email to your boss telling them you are sick.

Prompt:
[My Name: Mario
Boss's name: John

Write an email to my boss saying that I will be out of office today since I am sick. ]

Possible AI Output:
[Subject: Out of Office - Sick

Dear John,

I am writing to inform you that I will be out of office today due to illness. I apologize for any inconvenience this may cause.

I will be sure to keep you updated on my progress and will be back in the office as soon as I am feeling better.

Thank you for your understanding.

Sincerely,
Mario]

This email works but is pretty boring. Let's spice it up a bit!

## Style Modifiers/Instructions

It is very easy to modify the style of the email. For example, you can ask the AI to be 'humorous' or instruct it to 'Include a funny reason'.

Prompt:
[My Name: Mario
Boss's name: John

Write a humorous yet professional email to my boss saying that I will be out of office today since I am sick. 
Be concise and funny. Include a funny reason:]

Possible AI Output:
[Dear John,

I'm writing to let you know that I will be out of office today. I know I'm supposed to be working, but I just couldn't resist the call of the siren song of the local donut shop. I'm sure you understand.

I'll be back in the office tomorrow and will make up the time.

Thanks,
Mario]

Here is another example that is more serious/professional.

Prompt:
[My Name: Mario
Boss's name: John

Write a **serious**, professional email to my boss saying that I will be out of office today since I am sick. 
Be concise:]

Possible AI Output:
[Subject: Out of Office - Sick

Dear John,

I am writing to inform you that I will be out of office today due to illness. I apologize for any inconvenience this may cause.

Thank you for your understanding.

Sincerely,
Mario]

## Responding to an Email

Imagine that you receive a long email from your boss with a lot of information. You need to respond to the email, but you don't have time to read through the entire thing. You can plug the email into an AI and ask it to Generate a summary of this and a list of action items.

Prompt:
[Dear Mario,

I hope you're doing well. I am writing to provide you with some updates on our company and to request your assistance in addressing an issue with the user interface (UI) of the software you have been working on.
]

Possible AI Output:
[Summary: John is requesting Mario's assistance in addressing user interface issues with the software Mario has been working on. The issues involve difficulty accessing certain features and the UI not being intuitive enough. Mario's expertise in software development and familiarity with the software make him the ideal person to help with this task.

Action Items:
- Make changes to the layout, design, or functionality of the UI
- Request additional resources or support if needed
- Provide an estimated timeline for completion of modifications]

You can then use this summary to write a response email.

Prompt:
[Summary: John is requesting Mario's assistance in addressing user interface issues with the software Mario has been working on. The issues involve difficulty accessing certain features and the UI not being intuitive enough. Mario's expertise in software development and familiarity with the software make him the ideal person to help with this task.

Action Items:
- Make changes to the layout, design, or functionality of the UI
- Request additional resources or support if needed
- Provide an estimated timeline for completion of modifications

Write a response email from Mario using the above email summary:]

Possible AI Output:
[Dear John,

Thank you for reaching out to me about the user interface issues with the software I have been working on. I understand the importance of making sure the UI is intuitive and easy to use, and I am happy to help.

I will begin making changes to the layout, design, and functionality of the UI to address the issues you have mentioned. If I need additional resources or support, I will let you know. I will also provide an estimated timeline for completion of the modifications.

Please let me know if you have any questions or concerns.

Sincerely,
Mario]

Note that you can often combine these two steps into one. You can ask the AI to generate a response email directly from the email you received.

## Cold Emails

Cold emails are emails sent to people that you don't know. It is difficult to get a response from cold emails, so it can be helpful to send out a lot of personally customized emails. Let's see how to do that with GPT-31.

Prompt:
[Company name: Nightfall
My name: Max
Write a cold outreach email to this founder, named Pranav, pitching him our product, which is a neo-CRM. Make the email formal, yet approachable.]

Possible AI Output:
[Subject: A modern CRM to help your business grow

Dear Pranav,

My name is Max and I'm the founder of Nightfall, a neo-CRM that helps businesses streamline their customer relationship management.

We understand that managing customer relationships can be a challenge, especially as your business grows. That's why we created Nightfall, a modern CRM that helps you stay organized and connected with your customers.

Nightfall offers a range of features, including automated customer segmentation, personalized customer journeys, and real-time analytics. We also provide 24/7 customer support to ensure that you get the most out of our product.

I'd love to discuss how Nightfall can help your business grow. Would you be available for a call sometime this week?

I look forward to hearing from you.

Best,
Max]

This is neat, but we can do better. Let's add some more information to the prompt.

# Using unstructured information

Say you have the LinkedIn profile of the person you are sending the email to. You can add that information to the prompt to make the email more personalized. Let's use the founder of Strive's LinkedIn as an example. We'll copy a bunch of information from his profile and add it to the prompt.

Prompt:
[Pranav Shikarpur  1st degree connection1st
Developer Advocate. Problem Solver. Previously: Co-founder Strive, Intel ISEF Alum

ExperienceExperience
Thales Cloud Security logo
Developer AdvocateDeveloper Advocate
Thales Cloud SecurityThales Cloud Security
Apr 2022 - Present � 1 yrApr 2022 - Present � 1 yr
- Executed go-to-market and boosted developer engagement for Thales's new data encryption product launch.
- Spearheaded developer adoption of product at the RSA conference 2022 and KubeCon 2022.
- Presented a talk at HashiCorp's annual conference - HashiConf 2022 in LA - about "Securing Any Data Source".- Executed go-to-market and boosted developer engagement for Thales's new data encryption product launch. - Spearheaded developer adoption of product at the RSA conference 2022 and KubeCon 2022. - Presented a talk at HashiCorp's annual conference - HashiConf 2022 in LA - about "Securing Any Data Source". see more
Skills: Data Encryption Standard (DES) � Cryptography � Cybersecurity � Content Creation � Azure Kubernetes Service (AKS) � Google Kubernetes Engine (GKE)Skills: Data Encryption Standard (DES) � Cryptography � Cybersecurity � Content Creation � Azure Kubernetes Service (AKS) � Google Kubernetes Engine (GKE)
Startup Shell logo
Director of Founder ResourcesDirector of Founder Resources
Startup ShellStartup Shell
Feb 2022 - Present � 1 yr 2 mosFeb 2022 - Present � 1 yr 2 mos
College Park, Maryland, United StatesCollege Park, Maryland, United States
- Closed partnerships of founder resources with various tech companies like Vercel, MongoDB, etc.
- Sourced over $50,000 of credits and resources for founders at Startup Shell in the span of 3 months.- Closed partnerships of founder resources with various tech companies like Vercel, MongoDB, etc. - Sourced over $50,000 of credits and resources for founders at Startup Shell in the span of 3 months.
Skills: Strategic PartnershipsSkills: Strategic Partnerships
Strive Network logo
Co-FounderCo-Founder
StriveStrive
Dec 2020 - Nov 2021 � 1 yrDec 2020 - Nov 2021 � 1 yr
- Founded India's first cohort-based learning platform for passion-related courses. Had 7K+ monthly active users.
- Built the learning platform from the ground up and managed traffic to the website at scale and oversaw the sales and marketing execution.
- Negotiated with 100X.VC and People Group to raise $50K seed funding for Strive.- Founded India's first cohort-based learning platform for passion-related courses. Had 7K+ monthly active users. - Built the learning platform from the ground up and managed traffic to the website at scale and oversaw the sales and marketing execution. - Negotiated with 100X.VC and People Group to raise $50K seed funding for Strive.see more
Skills: Go (Programming Language) � Python (Programming Language) � Product Management � Product Marketing � Next.js � Amazon EKS

EducationEducation
University of Maryland logo
University of MarylandUniversity of Maryland
Undergraduate, Mathematics and Computer ScienceUndergraduate, Mathematics and Computer Science
Aug 2019 - May 2023Aug 2019 - May 2023
Activities and societies: Director of Founder Resources at Startup ShellActivities and societies: Director of Founder Resources at Startup Shell
Exploring the beauty of mathematics with the practicality of computer science

Write a cold outreach email to this founder, pitching him our product, Nightfall, which is a neo-CRM. My name is Max. Make the email formal, yet approachable. Mention relevant details from his LinkedIn information above to help pitch the product.Pranav Shikarpur  1st degree connection1st
Developer Advocate. Problem Solver. Previously: Co-founder Strive, Intel ISEF Alum

ExperienceExperience
Thales Cloud Security logo
Developer AdvocateDeveloper Advocate
Thales Cloud SecurityThales Cloud Security
Apr 2022 - Present � 1 yrApr 2022 - Present � 1 yr
- Executed go-to-market and boosted developer engagement for Thales's new data encryption product launch.
- Spearheaded developer adoption of product at the RSA conference 2022 and KubeCon 2022.
- Presented a talk at HashiCorp's annual conference - HashiConf 2022 in LA - about "Securing Any Data Source".- Executed go-to-market and boosted developer engagement for Thales's new data encryption product launch. - Spearheaded developer adoption of product at the RSA conference 2022 and KubeCon 2022. - Presented a talk at HashiCorp's annual conference - HashiConf 2022 in LA - about "Securing Any Data Source".see more
Skills: Data Encryption Standard (DES) � Cryptography � Cybersecurity � Content Creation � Azure Kubernetes Service (AKS) � Google Kubernetes Engine (GKE)Skills: Data Encryption Standard (DES) � Cryptography � Cybersecurity � Content Creation � Azure Kubernetes Service (AKS) � Google Kubernetes Engine (GKE)
Startup Shell logo
Director of Founder ResourcesDirector of Founder Resources
Startup ShellStartup Shell
Feb 2022 - Present � 1 yr 2 mosFeb 2022 - Present � 1 yr 2 mos
College Park, Maryland, United StatesCollege Park, Maryland, United States
- Closed partnerships of founder resources with various tech companies like Vercel, MongoDB, etc.
- Sourced over $50,000 of credits and resources for founders at Startup Shell in the span of 3 months.- Closed partnerships of founder resources with various tech companies like Vercel, MongoDB, etc. - Sourced over $50,000 of credits and resources for founders at Startup Shell in the span of 3 months.
Skills: Strategic PartnershipsSkills: Strategic Partnerships
Strive Network logo
Co-FounderCo-Founder
StriveStrive
Dec 2020 - Nov 2021 � 1 yrDec 2020 - Nov 2021 � 1 yr
- Founded India's first cohort-based learning platform for passion-related courses. Had 7K+ monthly active users.
- Built the learning platform from the ground up and managed traffic to the website at scale and oversaw the sales and marketing execution.
- Negotiated with 100X.VC and People Group to raise $50K seed funding for Strive.- Founded India's first cohort-based learning platform for passion-related courses. Had 7K+ monthly active users. - Built the learning platform from the ground up and managed traffic to the website at scale and oversaw the sales and marketing execution. - Negotiated with 100X.VC and People Group to raise $50K seed funding for Strive.see more
Skills: Go (Programming Language) � Python (Programming Language) � Product Management � Product Marketing � Next.js � Amazon EKS

EducationEducation
University of Maryland logo
University of MarylandUniversity of Maryland
Undergraduate, Mathematics and Computer ScienceUndergraduate, Mathematics and Computer Science
Aug 2019 - May 2023Aug 2019 - May 2023
Activities and societies: Director of Founder Resources at Startup ShellActivities and societies: Director of Founder Resources at Startup Shell
Exploring the beauty of mathematics with the practicality of computer science

Write a cold outreach email to this founder, pitching him our product, Nightfall, which is a neo-CRM. My name is Max. Make the email formal, yet approachable. Mention relevant details from his LinkedIn information above to help pitch the product.]

Possible AI Output:
[Dear Pranav,

My name is Max and I am reaching out to you because I believe our product, Nightfall, could be a great fit for you. As a co-founder of Strive and Director of Founder Resources at Startup Shell, I'm sure you understand the importance of having a reliable CRM to help manage customer relationships.

Nightfall is a neo-CRM that helps founders and entrepreneurs like yourself to easily manage customer relationships and track customer data. Our product is designed to be user-friendly and intuitive, so you can focus on growing your business without worrying about the technical details.

I think you would find Nightfall to be a great asset to your business. If you're interested, I'd love to schedule a call to discuss further.

Best,
Max]

It is super useful that Large Language Models (LLMs) can cut through the clutter of all the information we copied from LinkedIn. This cold outreach process can also be automated at a larger scale by scraping LinkedIn for relevant information.

## Conclusion

LLMs can help you write emails! Make sure you read what they write before sending it 😉