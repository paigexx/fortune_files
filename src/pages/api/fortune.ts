import { pinata, openai } from "../../../utils/config";
import { Readable } from "stream";
import type { NextApiRequest, NextApiResponse } from "next";

export const config = {
    api: {
        bodyParser: {
            sizeLimit: '1mb', // Adjust the size limit if necessary
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
        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
              {
                role: "user",
                content: [
                  { type: "text", text: "Please provide me the fortune for user who uploaded this file, based on the content of the file. The fortune should be in the style of a fortune cookie slip and under 255 characters." },
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
          const fortune = response.choices[0].message.content
          console.log(fortune);
        return res.status(200).json({ message: fortune });
    } catch (e) {
        console.log(e);
        return res.status(500).json({ error: "Internal Server Error" });
    }
  } else {
    return res.status(405).json({ error: "Method Not Allowed" });
  }
}

