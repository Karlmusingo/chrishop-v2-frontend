"use node";

import { v } from "convex/values";
import { internalAction } from "../_generated/server";

export const sendEmail = internalAction({
  args: {
    to: v.string(),
    subject: v.string(),
    html: v.string(),
    text: v.optional(v.string()),
  },
  handler: async (_ctx, args) => {
    const { default: Mailjet } = await import("node-mailjet");
    const mailjet = new Mailjet({
      apiKey: process.env.MAILJET_API_KEY || "",
      apiSecret: process.env.MAILJET_SECRET_KEY || "",
    });

    const data = {
      Messages: [
        {
          From: {
            Email: process.env.MAILJET_SENDER || "",
          },
          To: [
            {
              Email: args.to,
            },
          ],
          Subject: args.subject,
          HTMLPart: args.html,
          TextPart: args.text || "",
        },
      ],
    };

    const result = await mailjet
      .post("send", { version: "v3.1" })
      .request(data);

    const body = result.body as any;
    return body.Messages?.[0]?.Status === "success";
  },
});
