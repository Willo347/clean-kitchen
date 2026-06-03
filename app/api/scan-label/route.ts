import { NextRequest, NextResponse } from "next/server";

export const POST = async (req: NextRequest) => {
  try {
    const { base64, mediaType } = await req.json();

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY!,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 1000,
        messages: [{
          role: "user",
          content: [
            {
              type: "image",
              source: { type: "base64", media_type: mediaType, data: base64 }
            },
            {
              type: "text",
              text: `Analyse cette étiquette produit alimentaire et réponds UNIQUEMENT en JSON :
{
  "product": "nom du produit",
  "supplier": "fournisseur ou marque",
  "lot": "numéro de lot",
  "quantity": 1,
  "dlc": "date YYYY-MM-DD",
  "category": "Viande, Poisson, Fruits & Légumes, Produits laitiers, Épicerie, ou Surgelés"
}
Si non visible mets "". Réponds UNIQUEMENT avec le JSON.`
            }
          ]
        }]
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      return NextResponse.json({ error: err }, { status: response.status });
    }

    const data = await response.json();
    const text = data.content[0].text.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(text);
    return NextResponse.json(parsed);

  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
};