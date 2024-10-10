import { pinata, openai } from "../../../utils/config";
import type { NextApiRequest, NextApiResponse } from "next";

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '1mb', 
    },
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { cid } = req.body;
    if (!cid) {
      return res.status(400).json({ error: "CID is required" });
    }
    try {
      const signedURL = await pinata.gateways.createSignedURL({
        cid: cid,
        expires: 300,
      });
      if (!signedURL) {
        throw new Error("Failed to create signed URL");
      }
      let response;
      try {
        response = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "user",
              content: [
                { type: "text", text: "Please provide me the fortune for a user who uploaded this file, based on the content of the file. The fortune should be in the style of a fortune cookie slip and under 255 characters." },
                {
                  type: "image_url",
                  image_url: {
                    "url": signedURL,
                  },
                },
              ],
            },
          ],
        });
      } catch (e) {
        if (e instanceof Error) {
          console.error("OpenAI API error:", e.message);
          throw new Error(`Failed to generate fortune: ${e.message}`);
        } else {
          console.error("Unknown OpenAI API error:", e);
          throw new Error("Failed to generate fortune due to an unknown error.");
        }
      }
      const fortune = response.choices[0].message.content;
      return res.status(200).json({ message: fortune });
    } catch (e) {
      if (e instanceof Error) {
        console.error("Error in handler:", e.message);
        return res.status(500).json({ error: e.message });
      } else {
        console.error("Unknown error in handler:", e);
        return res.status(500).json({ error: "An unknown error occurred." });
      }
    }
  } else {
    return res.status(405).json({ error: "Method Not Allowed" });
  }
}
