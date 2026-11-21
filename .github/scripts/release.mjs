// Runs semantic-release and exposes the result as GitHub Actions step outputs:
// new-release-published, release-version, release-notes
import { randomUUID } from 'node:crypto';
import { appendFileSync } from 'node:fs';
import semanticRelease from 'semantic-release';

const result = await semanticRelease();
const nextRelease = result ? result.nextRelease : undefined;

const outputs = {
    'new-release-published': nextRelease ? 'true' : 'false',
    'release-version': nextRelease?.version ?? '',
    'release-notes': nextRelease?.notes ?? '',
};

const outputFile = process.env.GITHUB_OUTPUT;

if (outputFile) {
    for (const [name, value] of Object.entries(outputs)) {
        const delimiter = `EOF_${randomUUID()}`;
        appendFileSync(outputFile, `${name}<<${delimiter}\n${value}\n${delimiter}\n`);
    }
} else {
    console.log(outputs);
}
