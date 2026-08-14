export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/api/contact" && request.method === "POST") {
      try {
        const formData = await request.formData();
        const turnstileToken = formData.get("cf-turnstile-response");
        if (!turnstileToken) {
          return Response.json(
            { message: "ロボット確認に失敗しました。もう一度お試しください。" },
            { status: 400 }
          );
        }
        
        const verifyResponse = await fetch(
          "https://challenges.cloudflare.com/turnstile/v0/siteverify",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              secret: env.TURNSTILE_SECRET_KEY,
              response: turnstileToken,
            }),
          }
        );
        
        const verifyResult = await verifyResponse.json();
        
        if (!verifyResult.success) {
          return Response.json(
            { message: "ロボット確認に失敗しました。もう一度お試しください。" },
            { status: 403 }
          );
        }

        const name = String(formData.get("name") || "").trim();
        const email = String(formData.get("email") || "").trim();
        const message = String(formData.get("message") || "").trim();

        if (!name || !email || !message) {
          return Response.json(
            { message: "入力されていない項目があります。" },
            { status: 400 }
          );
        }

        const id = crypto.randomUUID();

        await env.CONTACTS.put(
          `contact:${Date.now()}:${id}`,
          JSON.stringify({
            name,
            email,
            message,
            createdAt: new Date().toISOString(),
          })
        );

        return Response.json({
          success: true,
          message: "お問い合わせを送信しました。",
        });
      } catch (error) {
        console.error(error);

        return Response.json(
          { message: "送信処理中にエラーが発生しました。" },
          { status: 500 }
        );
      }
    }

    return env.ASSETS.fetch(request);
  },
};