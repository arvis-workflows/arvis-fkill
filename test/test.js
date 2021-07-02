import childProcess from 'child_process';
import test from 'ava';
import arvishTest from 'arvish-test';
import getPort from 'get-port';

test('search by name', async t => {
	const arvish = arvishTest();
	const result = await arvish('node index.js bash');

	t.true(result.length > 0);
});

test('search by port', async t => {
	const port = await getPort();
	childProcess.spawn('node', ['test/_fixture.js', port]);

	const arvish = arvishTest();
	const result = await arvish(`node index.js :${port}`);

	t.is(result.length, 1);
	t.true(result[0].subtitle.startsWith(`${port} - `));
});