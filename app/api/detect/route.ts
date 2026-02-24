import { NextResponse } from "next/server";
import { InferenceClient } from "@huggingface/inference";

const hf = new InferenceClient(process.env.HUGGINGFACE_API_KEY);

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");
    const url = formData.get("url");

    if (!file && !url) {
      return NextResponse.json({ error: "No file or URL provided" }, { status: 400 });
    }

    let imageBlob: Blob;
    let format = "unknown";
    let size = "Unknown Size";

    if (file && file instanceof Blob) {
      imageBlob = file;
      format = file.type;
      size = `${Math.round(file.size / 1024)} KB`;
    } else if (typeof url === "string") {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Failed to fetch image from URL");
      }
      imageBlob = await response.blob();
      
      format = imageBlob.type || "image/unknown";
      
      size = `${Math.round(imageBlob.size / 1024)} KB`;
    } else {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    // We MUST pass a valid Blob to the Hugging Face Inference client
    // NextJS Blobs sometimes fail to serialize correctly through the SDK's fetch layer,
    // so we reconstruct a standard Node.js Blob with the correct MIME type.
    const arrayBuffer = await imageBlob.arrayBuffer();
    const dataForHf = new Blob([arrayBuffer], { type: format });
    
    // Call Hugging Face API via official SDK
    let result: any[] | undefined;
    let retries = 0;
    const maxRetries = 4; // Up to 4 retries (~20 seconds total wait for cold starts)

    while (retries < maxRetries) {
      try {
        result = await hf.imageClassification({
          model: "umm-maybe/AI-image-detector",
          data: dataForHf,
        });

        if (Array.isArray(result) && result.length > 0) {
          console.log("Hugging Face Response:", JSON.stringify(result));
          break;
        } else {
          throw new Error("Invalid response structure from Hugging Face API.");
        }
      } catch (apiError: any) {
        const errorText = apiError.message || String(apiError);
        
        // Check for specific waitable errors (loading model, rate limits, server busy)
        const isWaitable = 
          errorText.toLowerCase().includes("loading") || 
          errorText.toLowerCase().includes("currently loading") ||
          errorText.includes("503") || 
          errorText.includes("429");

        if (isWaitable) {
          retries++;
          console.warn(`HF API busy/loading. Retrying (${retries}/${maxRetries})... Error: ${errorText}`);
          await new Promise(resolve => setTimeout(resolve, 5000)); // wait 5 seconds before retrying
          continue;
        }

        // Rethrow concrete hard errors (like 401 Unauthorized or Model Not Found)
        if (errorText.includes("401") || errorText.toLowerCase().includes("unauthorized") || errorText.toLowerCase().includes("invalid username")) {
           throw new Error("Invalid Hugging Face API Token. Please check your .env.local configuration.");
        }
        
        // For mystery network errors (like the "provider" HTTP error), wait and retry
        retries++;
        console.warn(`Network Error contacting HF SDK. Retrying (${retries}/${maxRetries})...`, errorText);
        if (retries >= maxRetries) throw new Error(`Hugging Face API Error: ${errorText}`);
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    }

    if (!result || !Array.isArray(result) || result.length === 0) {
      throw new Error("The AI model is currently loading or overloaded. Please wait 30 seconds and try again.");
    }

    // Determine highest confidence label safely
    let isHumanMade = true;
    let finalScore = 90;

    if (result && result.length > 0) {
      // Find probability of it being "artificial" / "fake" / "ai"
      const artificialLabel = result.find(
        (r) => r.label.toLowerCase().includes("artificial") || 
               r.label.toLowerCase().includes("fake") || 
               r.label.toLowerCase().includes("ai")
      );
      
      const humanLabel = result.find(
        (r) => r.label.toLowerCase().includes("human") || 
               r.label.toLowerCase().includes("real") || 
               r.label.toLowerCase().includes("authentic")
      );

      const aiScore = artificialLabel ? artificialLabel.score : 0;
      const humanScore = humanLabel ? humanLabel.score : 0;

      // If the model explicitly tells us it's more AI than Human
      if (aiScore > humanScore) {
        isHumanMade = false;
        finalScore = Math.max(1, Math.round(humanScore * 100)); // Still show human probability
      } else if (humanScore > aiScore) {
        isHumanMade = true;
        finalScore = Math.min(99, Math.round(humanScore * 100));
      } else {
        // Fallback for models that might just label the top prediction
        const topPrediction = result[0];
        const topLabel = topPrediction.label.toLowerCase();
        
        if (topLabel.includes("fake") || topLabel.includes("artificial") || topLabel.includes("ai")) {
          isHumanMade = false;
          finalScore = Math.max(1, Math.round((1 - topPrediction.score) * 100)); // Inverse
        } else {
          isHumanMade = true;
          finalScore = Math.min(99, Math.round(topPrediction.score * 100));
        }
      }
    }

    return NextResponse.json({
      verdict: isHumanMade ? "Likely Authentic" : "Likely AI",
      score: finalScore,
      metadata: {
        resolution: "Analyzed", 
        format,
        size
      },
      artifacts: result.map((r) => {
        let status: "Pass" | "Warning" | "Fail" = "Pass";
        
        if (r.label.toLowerCase().includes("ai") || r.label.toLowerCase().includes("artificial") || r.label.toLowerCase().includes("fake")) {
          // If it's an AI label, high score is a FAIL for authenticity
          status = r.score > 0.5 ? "Fail" : (r.score > 0.2 ? "Warning" : "Pass");
        } else {
          // If it's a Human label, high score is a PASS for authenticity
          status = r.score > 0.5 ? "Pass" : (r.score > 0.2 ? "Warning" : "Fail");
        }

        return {
          name: `${r.label.charAt(0).toUpperCase() + r.label.slice(1)} Probability`,
          status
        };
      })
    });
  } catch (error: any) {
    console.error("Detection error:", error);
    return NextResponse.json({ error: error.message || "Processing failed." }, { status: 500 });
  }
}
