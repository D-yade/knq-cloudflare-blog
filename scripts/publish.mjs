import { execSync } from 'node:child_process';
import readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';

function run(command) {
	execSync(command, {
		stdio: 'inherit',
	});
}

console.log('');
console.log('🚀 気になるニュースブログ：公開処理');
console.log('');

console.log('① ブログをビルドして確認します...');
console.log('');

try {
	run('npm run build');
} catch {
	console.error('');
	console.error('❌ ビルドに失敗しました。');
	console.error('公開は中止しました。');
	process.exit(1);
}

const status = execSync('git status --porcelain', {
	encoding: 'utf8',
}).trim();

if (!status) {
	console.log('');
	console.log('✅ 公開する変更はありません。');
	process.exit(0);
}

console.log('');
console.log('✅ ビルド成功');
console.log('');

const rl = readline.createInterface({ input, output });

let message = (
	await rl.question('変更内容を一言で入力してください（例：○○の記事を追加）：')
).trim();

rl.close();

if (!message) {
	message = 'ブログを更新';
}

console.log('');
console.log('② GitHubへ送信します...');
console.log('');

try {
	run('git add .');
	run(`git commit -m ${JSON.stringify(message)}`);
	run('git push');

	console.log('');
	console.log('🎉 GitHubへの送信が完了しました！');
	console.log('Cloudflareが自動的にブログを更新します。');
	console.log('🌐 https://kn-q.com');
	console.log('');
} catch {
	console.error('');
	console.error('❌ GitHubへの送信中にエラーが発生しました。');
	process.exit(1);
}