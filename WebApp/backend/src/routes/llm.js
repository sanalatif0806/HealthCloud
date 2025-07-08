const { getLLMClient } = require('../llm/client');
const {ChatPromptTemplate} = require("@langchain/core/prompts");
const router = require('express').Router();

const PROMPT = `I give you the title description and id about a dataset, I have to categorize it as Cultural Heritage or Not.  \
            For datasets that are Cultural Heritage, you also need to further specify whether it is Tangible, Intangible, Natural Heritage and finally those that define thesaurus and data models, classify them as Generic.  \
            You will be provided with a dataset description, title and the id, and you will output a json object. Here is an example of how you should respond: \
            {{ \
                "category": "Cultural Heritage", \
                "sub_category": "Tangible" \
            }} \
            If the dataset is not part of the Cultural Heritage category, leave the value of the keys empty. If the dataset is of type Cultural Heritage, but you cannot define the sub category, do not enter the value in the key “sub_category”.`


router.post('/llm_topic', async (req, res) => {
  try {
    const userInput = req.body;

    if (!userInput) return res.status(400).json({ error: "Missing input" });
    const dataset_id = userInput.identifier
    const dataset_title = userInput.title
    const dataset_description = userInput.description.en
    const llm = getLLMClient();

    const prompt = ChatPromptTemplate.fromMessages([
      ["system", "You are a helpful assistant."],
      ["human", PROMPT],
      ["human", `Dataset ID: {id}, Title: {title}, Description: {description}`]
    ]);

    const chain = prompt.pipe(llm);

    const response = await chain.invoke({
        id: dataset_id,
        title: dataset_title,
        description: dataset_description
    });
    console.log("LLM response:", response);

    if (!response || !response.content) {
      return res.status(500).json({ error: "LLM response is empty or malformed" });
    }

    // Assuming response.content is a stringified JSON object
    try {
        const cleaned_response = response.content
        .replace(/^```json\s*/i, '')
        .replace(/^```\s*/i, '')
        .replace(/```$/, '')
        .trim();
        const parsedResponse = JSON.parse(cleaned_response);
        console.log(parsedResponse)
        if (!parsedResponse) {
            return res.status(400).json({ error: "LLM did not return a valid JSON" });
        }
        res.json({
            'llm_response': parsedResponse,
            'model_used': process.env.LLM_MODEL

        });
    } catch (parseError) {
        console.error("Error parsing LLM response:", parseError);
        return res.status(500).json({ error: "Failed to parse LLM response" });
    }
  } catch (err) {
    console.error("LLM error:", err);
    res.status(500).json({ error: "LLM processing failed" });
  }
});

module.exports = router;