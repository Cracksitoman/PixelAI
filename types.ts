export enum ArtStyle {
  PIXEL_ART = 'Pixel Art',
  VECTOR_FLAT = 'Vector Flat',
  HAND_DRAWN = 'Hand Drawn',
  ISOMETRIC_3D = 'Isometric 3D',
  VOXEL = 'Voxel',
  CLAYMATION = 'Claymation',
  REALISTIC_RENDER = 'Realistic Render'
}

export enum SpriteType {
  SINGLE_CHARACTER = 'Single Character',
  SPRITE_SHEET = 'Sprite Sheet (Grid)',
  ICON = 'Item Icon',
  PORTRAIT = 'Character Portrait',
  TILESET = 'Environment Tileset'
}

export interface GenerationConfig {
  prompt: string;
  style: ArtStyle;
  type: SpriteType;
  backgroundColor: string;
  referenceImage?: string; // Base64 string of the character to keep consistent
}

export interface GeneratedSprite {
  id: string;
  imageUrl: string;
  prompt: string;
  style: ArtStyle;
  type: SpriteType;
  timestamp: number;
}