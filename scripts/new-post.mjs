import fs from 'node:fs';
import path from 'node:path';
import readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';

const rl = readline.createInterface({ input, output });

console.log('');
console.log('📝 気になるニュースブログ：新規記事作成');
console.log('');

let title = '';
let slug = '';
let description = '';

while (true) {
        title = (await rl.question('記事タイトル：')).trim();
        slug = (await rl.question('URL名（半角英数字・ハイフン）：')).trim();
        description = (await rl.question('記事の説明：')).trim();

        console.log('');
        console.log('──────── 入力内容 ────────');
        console.log(`記事タイトル：${title}`);
        console.log(`URL名：https://kn-q.com/blog/${slug}/`);
        console.log(`記事の説明：${description}`);
        console.log('──────────────────────');
        console.log('');

        const confirm = (await rl.question('この内容で記事を作成しますか？ (y/n)：'))
                .trim()
                .toLowerCase();

        if (confirm === 'y' || confirm === 'yes') {
                break;
        }

        console.log('');
        console.log('↩️ 最初から入力し直します。');
        console.log('');
}

rl.close();

if (!title) {
        console.error('❌ 記事タイトルを入力してください。');
        process.exit(1);
}

if (!slug) {
        console.error('❌ URL名を入力してください。');
        process.exit(1);
}

if (!/^[a-z0-9-]+$/.test(slug)) {
        console.error('❌ URL名には半角英小文字・数字・ハイフンだけを使ってください。');
        console.error('例：rice-price / election-system / new-tax-rule');
        process.exit(1);
}

const now = new Date();

const year = now.getFullYear();
const month = String(now.getMonth() + 1).padStart(2, '0');
const day = String(now.getDate()).padStart(2, '0');

const pubDate = `${year}-${month}-${day}`;
const heroImageName = `${slug}.png`;

const safeTitle = title.replaceAll('"', '\\"');
const safeDescription = description.replaceAll('"', '\\"');

const frontmatter = [
        '---',
        `title: "${safeTitle}"`,
        `description: "${safeDescription}"`,
        `pubDate: ${pubDate}`,
        `heroImage: "../../assets/blog/${heroImageName}"`,
        '---',
        ''
].join('\n');

const body = `ニュースを見ていると、「これはどういうこと？」と気になることがあります。

この記事では、${title}について分かりやすく解説します。

## まず結論

ここに結論を書きます。

## これは何？

ここに基本的な意味や仕組みを書きます。

## なぜ今話題になっているの？

ここにニュースになっている背景を書きます。

## 私たちの生活にはどう関係する？

ここに読者への影響を書きます。

## まとめ

今回の内容を簡潔にまとめます。
`;

const article = frontmatter + body;

const blogDir = path.join(process.cwd(), 'src', 'content', 'blog');
const filePath = path.join(blogDir, `${slug}.md`);

fs.mkdirSync(blogDir, { recursive: true });

if (fs.existsSync(filePath)) {
        console.error('');
        console.error(`❌ ${slug}.md はすでに存在します。`);
        process.exit(1);
}

fs.writeFileSync(filePath, article, 'utf8');

console.log('');
console.log('✅ 新しい記事を作成しました！');
console.log('');
console.log(`📄 記事：${filePath}`);
console.log(`🌐 公開後URL：https://kn-q.com/blog/${slug}/`);
console.log('');
console.log('🖼 アイキャッチ画像');
console.log(`src/assets/blog/${heroImageName}`);
console.log('');
console.log('この名前で画像を用意してください。');
console.log('');
console.log('VS Codeで記事を編集してください。');