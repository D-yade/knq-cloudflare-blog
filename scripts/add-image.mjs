import fs from 'node:fs';
import path from 'node:path';
import readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';

const rl = readline.createInterface({ input, output });

console.log('');
console.log('🖼 気になるニュースブログ：本文画像追加');
console.log('');

const slug = (await rl.question('記事のURL名：')).trim();
const rawSourcePath = (await rl.question('画像ファイルのパス：')).trim();

const sourcePath = rawSourcePath
	.replace(/^['"]|['"]$/g, '')
	.replace(/\\ /g, ' ')
	.replace(/\\_/g, '_');
const altText = (await rl.question('画像の説明：')).trim();

rl.close();

if (!slug) {
	console.error('❌ 記事のURL名を入力してください。');
	process.exit(1);
}

if (!/^[a-z0-9-]+$/.test(slug)) {
	console.error('❌ URL名には半角英小文字・数字・ハイフンだけを使ってください。');
	process.exit(1);
}

if (!sourcePath) {
	console.error('❌ 画像ファイルのパスを入力してください。');
	process.exit(1);
}

if (!fs.existsSync(sourcePath)) {
	console.error('');
	console.error('❌ 指定した画像ファイルが見つかりません。');
	console.error(sourcePath);
	process.exit(1);
}

const ext = path.extname(sourcePath).toLowerCase();

const allowedExtensions = [
	'.jpg',
	'.jpeg',
	'.png',
	'.webp',
];

if (!allowedExtensions.includes(ext)) {
	console.error('❌ JPG / PNG / WebP の画像を指定してください。');
	process.exit(1);
}

const imageDir = path.join(
	process.cwd(),
	'src',
	'assets',
	'blog',
	slug
);

fs.mkdirSync(imageDir, { recursive: true });

const existingFiles = fs
	.readdirSync(imageDir)
	.filter((file) => file.startsWith('image-'));

const nextNumber = existingFiles.length + 1;

const fileName = `image-${nextNumber}${ext}`;
const destinationPath = path.join(imageDir, fileName);

fs.copyFileSync(sourcePath, destinationPath);

const markdownPath =
	`../../assets/blog/${slug}/${fileName}`;

console.log('');
console.log('✅ 画像を追加しました！');
console.log('');
console.log(`📁 ${destinationPath}`);
console.log('');
console.log('記事本文に以下を貼り付けてください。');
console.log('');
console.log(`![${altText || '画像'}](${markdownPath})`);
console.log('');