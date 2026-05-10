import { generateQuoteBuffer } from "../utils/bmpImage";
import { getRefreshTimeInSeconds } from "../utils/getRefreshTime";

import quotes from "../data/quotes.json";
export async function loader({ params }) {
  try {
    const quoteImage = generateQuoteBuffer(quotes[0].quote, quotes[0].author);
    const base64Image = quoteImage.toString("base64");
    const refreshTime = getRefreshTimeInSeconds();
    return {
      imageData: base64Image,
      nextRefreshAfter: refreshTime,
    };
  } catch (error) {
    console.error("Failed to fetch tasks:", error);
    return [];
  }
}

export function HydrateFallback() {
  return <div>Loading...</div>;
}
export default function Tasks({ loaderData }) {
  if (loaderData.error) {
    return <div>Error: {loaderData.error}</div>;
  }
  const { imageData, nextRefreshAfter } = loaderData;
  const imageSrc = `data:image/bmp;base64,${imageData}`;

  return (
    <div>
      <img
        src={imageSrc}
        alt="A BMP image showing a list of tasks"
        style={{ border: "1px solid black", maxWidth: "100%" }}
      />
      <p style={{ fontFamily: "monospace", marginTop: "10px" }}>
        Next refresh after: {nextRefreshAfter}
      </p>
    </div>
  );
}
