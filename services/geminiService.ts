import { GoogleGenAI } from "@google/genai";
import { GenerationConfig, ArtStyle, SpriteType } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const generateSprite = async (config: GenerationConfig): Promise<string> => {
  if (!apiKey) {
    throw new Error("API Key is missing. Please check your environment configuration.");
  }

  // Construct a specialized prompt for sprite generation
  const stylePrompt = getStylePrompt(config.style);
  const typePrompt = getTypePrompt(config.type);
  
  // We explicitly ask for a specific background to make it easier to view/edit later
  const bgPrompt = config.backgroundColor 
    ? `The background must be a solid, flat color: ${config.backgroundColor}. Do not use gradients or detailed backgrounds. The subject must be clearly isolated.` 
    : `The background must be a solid white or black color for easy removal.`;

  let finalPrompt = "";
  const parts: any[] = [];

  if (config.referenceImage) {
    // Logic for Character Consistency / Animation
    finalPrompt = `
      I have provided a reference image of a specific character. 
      Your task is to create a NEW image of this EXACT SAME character.
      
      Task: ${config.prompt}
      Asset Type: ${typePrompt}
      Art Style: Keep the exact same art style as the reference image.
      ${bgPrompt}

      CRITICAL INSTRUCTIONS:
      1. MAINTAIN CONSISTENCY: The facial features, clothing details, colors, and body proportions must match the reference image exactly.
      2. If asking for a sprite sheet/animation: Create strictly aligned frames in a grid for the requested action (e.g., walking, attacking).
      3. Do not change the character design, only change the pose or action.
    `;
    
    // Extract base64 data (remove data:image/png;base64, prefix)
    const base64Data = config.referenceImage.split(',')[1];
    
    parts.push({
      inlineData: {
        data: base64Data,
        mimeType: 'image/png' // Assuming PNG based on app logic
      }
    });
  } else {
    // Logic for New Generation
    finalPrompt = `
      Create a high-quality video game asset.
      Subject: ${config.prompt}
      Art Style: ${stylePrompt}
      Asset Type: ${typePrompt}
      ${bgPrompt}
      
      Ensure the image is sharp, clear, and follows the specified art style strictly. 
      If it is pixel art, ensure pixels are consistent grid-aligned.
      If it is a sprite sheet, arrange the frames in a clean grid.
    `;
  }

  // Add the text prompt to parts
  parts.push({ text: finalPrompt });

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image', // Using flash-image for consistency
      contents: {
        parts: parts,
      },
      config: {
        // Nano Banana models use aspect ratio config
        imageConfig: {
          aspectRatio: "1:1", 
        }
      }
    });

    // Iterate through parts to find the image
    const responseParts = response.candidates?.[0]?.content?.parts;
    if (!responseParts) {
      throw new Error("No content generated.");
    }

    for (const part of responseParts) {
      if (part.inlineData && part.inlineData.data) {
        return `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
      }
    }

    throw new Error("No image data found in the response.");

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};

const getStylePrompt = (style: ArtStyle): string => {
  switch (style) {
    case ArtStyle.PIXEL_ART:
      return "Authentic 16-bit or 32-bit pixel art style. Sharp edges, limited color palette, no anti-aliasing on the outline.";
    case ArtStyle.VECTOR_FLAT:
      return "Flat vector art style, clean lines, cel-shaded, mobile game aesthetic, SVG style.";
    case ArtStyle.HAND_DRAWN:
      return "Hand-drawn sketch style, RPG maker aesthetic, artistic, water color or pencil texture.";
    case ArtStyle.ISOMETRIC_3D:
      return "Isometric 3D pre-rendered style, Diablo-like, 2.5D perspective.";
    case ArtStyle.VOXEL:
      return "Voxel art style, cube-based, Minecraft-like, blocky.";
    case ArtStyle.CLAYMATION:
      return "Claymation style, plasticine texture, rounded edges.";
    case ArtStyle.REALISTIC_RENDER:
      return "High fidelity 3D render, unreal engine style, realistic lighting.";
    default:
      return "Standard 2D video game art.";
  }
};

const getTypePrompt = (type: SpriteType): string => {
  switch (type) {
    case SpriteType.SPRITE_SHEET:
      return "A sprite sheet containing multiple frames of animation (e.g., idle, run, jump) arranged in a grid.";
    case SpriteType.ICON:
      return "A single UI inventory icon, centered, fits in a square frame.";
    case SpriteType.PORTRAIT:
      return "A character face portrait or bust, detailed expressions.";
    case SpriteType.TILESET:
      return "A seamless tilable texture or environmental prop set (walls, floors).";
    case SpriteType.SINGLE_CHARACTER:
    default:
      return "A single full-body character sprite in a neutral dynamic pose.";
  }
};