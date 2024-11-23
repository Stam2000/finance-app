import OpenAI from "openai"

export const openai = new OpenAI({
  apiKey:"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"
})

async function main() {
  const myAssistants = await openai.beta.assistants.list({
    order: "desc",
    limit: "100",
  });


  for(let assistant of myAssistants.data){
    const response = await openai.beta.assistants.del(assistant.id);
  }

}

main()

