import { openai } from '@ai-sdk/openai';
import { generateText, streamText } from 'ai';
import { execSync } from 'child_process';

async function main() {
  const commitMessage = execSync('git log -1 --pretty=%B').toString().trim();
  const changes = execSync('git show -p HEAD').toString().trim();
  const { textStream } = streamText({
    model: openai('gpt-4-turbo'),
    prompt: `
    You are a code reviewer.
    You are given a commit message and a list of changes.
    You need to review the changes and provide a list of suggestions.
    The commit message is: ${commitMessage}
    The changes are: ${changes}
    `,
  });
  
  for await (const textPart of textStream) {
    process.stdout.write(textPart);
  }
}

main();
