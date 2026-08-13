export async function onRequestPost(context) {
	try {
		const formData = await context.request.formData();

		const name = formData.get('name');
		const email = formData.get('email');
		const message = formData.get('message');

		if (!name || !email || !message) {
			return new Response(
				JSON.stringify({
					success: false,
					message: '入力されていない項目があります。',
				}),
				{
					status: 400,
					headers: {
						'Content-Type': 'application/json; charset=UTF-8',
					},
				}
			);
		}

		// 問い合わせを識別するためのIDを作成
		const id = crypto.randomUUID();

		// 送信日時
		const createdAt = new Date().toISOString();

		// 保存する問い合わせデータ
		const contact = {
			id,
			name: String(name),
			email: String(email),
			message: String(message),
			createdAt,
		};

		// Cloudflare KVへ保存
		await context.env.CONTACTS.put(
			`contact:${createdAt}:${id}`,
			JSON.stringify(contact)
		);

		return new Response(
			JSON.stringify({
				success: true,
				message: 'お問い合わせを受け付けました。',
			}),
			{
				status: 200,
				headers: {
					'Content-Type': 'application/json; charset=UTF-8',
				},
			}
		);
	} catch (error) {
		console.error(error);

		return new Response(
			JSON.stringify({
				success: false,
				message: '送信処理中にエラーが発生しました。',
			}),
			{
				status: 500,
				headers: {
					'Content-Type': 'application/json; charset=UTF-8',
				},
			}
		);
	}
}