import poems from "../data/poem.json";
import { generatePoemBMP } from "../utils/bmpImage";

export async function loader({ params }) {
  try {
    let filteredPoems = poems;
    const randomIndex = Math.floor(Math.random() * filteredPoems.length);
    const randomPoem = filteredPoems[randomIndex];
    const bmpBuffer = generatePoemBMP(randomPoem);
    const dataUri = `data:image/bmp;base64,${bmpBuffer.toString("base64")}`;

    return dataUri;
  } catch (error) {
    console.error("Failed to fetch tasks:", error);
    return [];
  }
}
export default function Image({ loaderData }) {
  if (typeof loaderData !== "string" || !loaderData.startsWith("data:image")) {
    return <div>{loaderData || "Loading image..."}</div>;
  }

  return (
    <div>
      <img
        src={loaderData}
        alt="A BMP image with a poem generated on it"
        style={{ border: "1px solid black", maxWidth: "100%" }}
      />
    </div>
  );
}
